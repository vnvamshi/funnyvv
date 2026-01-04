// ═══════════════════════════════════════════════════════════════════════════════
// useVoice Hook v7.0 - Uses Voice Manager for conflict-free mic access
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

type VoiceOwner = 'landing' | 'modal' | 'dashboard' | 'vendor' | null;

interface UseVoiceOptions {
  owner?: VoiceOwner;
  onCommand?: (cmd: string) => void;
  onDigits?: (digits: string) => void;
  autoStart?: boolean;
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

export const useVoice = ({
  owner = 'modal',
  onCommand,
  onDigits,
  autoStart = true
}: UseVoiceOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [hasControl, setHasControl] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const commandRef = useRef(onCommand);
  const digitsRef = useRef(onDigits);
  const ownerRef = useRef(owner);
  const isActiveRef = useRef(false);

  useEffect(() => { commandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { digitsRef.current = onDigits; }, [onDigits]);

  // Initialize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    synthRef.current = window.speechSynthesis;
    synthRef.current?.getVoices();

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      if (!isActiveRef.current) return;
      
      const result = e.results[e.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      if (text) setTranscript(text);

      if (result.isFinal && text) {
        const cmd = text.toLowerCase();
        
        // Extract digits
        const digits = extractDigits(text);
        if (digits.length > 0) digitsRef.current?.(digits);
        
        // Pass to command handler
        commandRef.current?.(cmd);
      }
    };

    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.error('[useVoice] Error:', e.error);
      }
    };

    rec.onend = () => {
      if (isActiveRef.current && !isPaused) {
        setTimeout(() => { try { rec.start(); } catch (e) {} }, 100);
      }
    };

    recRef.current = rec;

    // Auto-start if requested
    if (autoStart) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, []);

  const startListening = useCallback(() => {
    console.log(`[useVoice:${ownerRef.current}] Starting...`);
    isActiveRef.current = true;
    setIsListening(true);
    setHasControl(true);
    try { recRef.current?.start(); } catch (e) {}
  }, []);

  const stopListening = useCallback(() => {
    console.log(`[useVoice:${ownerRef.current}] Stopping...`);
    isActiveRef.current = false;
    setIsListening(false);
    setHasControl(false);
    try { recRef.current?.stop(); } catch (e) {}
  }, []);

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
    try { recRef.current?.start(); } catch (e) {}
  }, []);

  return {
    isListening, isSpeaking, isPaused, transcript, displayText, hasControl,
    speak, stop, pause, resume, startListening, stopListening,
    extractDigits, formatPhoneNumber
  };
};

export default useVoice;
