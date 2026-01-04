// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - useVoice Hook v2.0 (STANDALONE - NO CONFLICTS)
// Simple, reliable speech recognition and synthesis
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceOptions {
  onCommand?: (cmd: string) => void;
  onDigits?: (digits: string) => void;
  autoStart?: boolean;
  pauseTimeout?: number;
}

// Word to digit mapping
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3',
  'four': '4', 'for': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9',
};

export const extractDigits = (text: string): string => {
  const words = text.toLowerCase().split(/[\s,.\-]+/);
  let digits = '';
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) digits += WORD_TO_DIGIT[word];
    else if (/^\d$/.test(word)) digits += word;
  }
  const raw = text.replace(/\D/g, '');
  return digits.length >= raw.length ? digits : raw;
};

export const formatPhoneNumber = (d: string): string => {
  const c = d.replace(/\D/g, '').slice(0, 10);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0, 3)}-${c.slice(3)}`;
  return `${c.slice(0, 3)}-${c.slice(3, 6)}-${c.slice(6)}`;
};

export const speakablePhone = (d: string): string => {
  const w: Record<string, string> = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
  };
  return d.replace(/\D/g, '').split('').map(x => w[x] || x).join(' ');
};

export const useVoice = ({
  onCommand,
  onDigits,
  autoStart = true,
  pauseTimeout = 8000
}: UseVoiceOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandRef = useRef(onCommand);
  const digitsRef = useRef(onDigits);
  const isListeningRef = useRef(false);

  useEffect(() => { commandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { digitsRef.current = onDigits; }, [onDigits]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  // Init TTS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      synthRef.current?.getVoices();
    }
  }, []);

  // Init STT
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      const result = e.results[e.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      if (text) setTranscript(text);

      if (result.isFinal && text) {
        const cmd = text.toLowerCase();
        
        // Check for "hey" trigger
        if (cmd.includes('hey') || cmd.includes('mr v') || cmd.includes('vista')) {
          handlePause();
          return;
        }
        
        // Extract digits
        const digits = extractDigits(text);
        if (digits.length > 0) digitsRef.current?.(digits);
        
        // Pass to command handler
        commandRef.current?.(cmd);
      }
    };

    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.error('Speech error:', e.error);
      }
    };

    rec.onend = () => {
      if (isListeningRef.current && !isPaused) {
        setTimeout(() => { try { rec.start(); } catch (e) {} }, 100);
      }
    };

    recRef.current = rec;
    
    if (autoStart) {
      setIsListening(true);
      try { rec.start(); } catch (e) {}
    }

    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      try { rec.stop(); } catch (e) {}
    };
  }, [autoStart]);

  const handlePause = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
    setIsPaused(true);
    speak("Yes? How can I help?");
    
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setIsPaused(false), pauseTimeout);
  }, [pauseTimeout]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) { setDisplayText(text); return; }
    synthRef.current.cancel();
    setDisplayText(text);
    setIsSpeaking(true);

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) ||
                  voices.find(v => v.lang.includes('en-US')) ||
                  voices[0];
    if (voice) u.voice = voice;

    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(u);
  }, []);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    try { recRef.current?.stop(); } catch (e) {}
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    try { recRef.current?.start(); } catch (e) {}
  }, []);

  const startListening = useCallback(() => {
    setIsListening(true);
    setIsPaused(false);
    try { recRef.current?.start(); } catch (e) {}
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    try { recRef.current?.stop(); } catch (e) {}
  }, []);

  return {
    isListening, isSpeaking, isPaused, transcript, displayText,
    speak, stop, pause, resume, startListening, stopListening,
    extractDigits, formatPhoneNumber, speakablePhone
  };
};

export default useVoice;
