// useVoice v8.0 - Simple, working voice hook
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceOptions {
  onCommand?: (cmd: string) => void;
  onDigits?: (digits: string) => void;
  autoStart?: boolean;
}

const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'one': '1', 'two': '2', 'three': '3',
  'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
};

export const extractDigits = (text: string): string => {
  const words = text.toLowerCase().split(/[\s,.\-]+/);
  let digits = '';
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) digits += WORD_TO_DIGIT[word];
    else if (/^\d$/.test(word)) digits += word;
  }
  return digits || text.replace(/\D/g, '');
};

export const formatPhoneNumber = (d: string): string => {
  const c = d.slice(0, 10);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0, 3)}-${c.slice(3)}`;
  return `${c.slice(0, 3)}-${c.slice(3, 6)}-${c.slice(6)}`;
};

export const useVoice = ({ onCommand, onDigits, autoStart = true }: UseVoiceOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const activeRef = useRef(false);
  const commandRef = useRef(onCommand);
  const digitsRef = useRef(onDigits);

  useEffect(() => { commandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { digitsRef.current = onDigits; }, [onDigits]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    synthRef.current = window.speechSynthesis;
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn('[useVoice] Speech recognition not supported');
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      const result = e.results[e.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      if (text) setTranscript(text);

      if (result.isFinal && text) {
        const digits = extractDigits(text);
        if (digits.length > 0) digitsRef.current?.(digits);
        commandRef.current?.(text.toLowerCase());
      }
    };

    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.error('[useVoice] Error:', e.error);
      }
    };

    rec.onend = () => {
      if (activeRef.current) {
        setTimeout(() => { try { rec.start(); } catch (e) {} }, 100);
      }
    };

    recRef.current = rec;

    if (autoStart) {
      activeRef.current = true;
      setIsListening(true);
      try { rec.start(); } catch (e) {}
    }

    return () => {
      activeRef.current = false;
      try { rec.stop(); } catch (e) {}
    };
  }, [autoStart]);

  const speak = useCallback((text: string) => {
    setDisplayText(text);
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    setIsSpeaking(true);

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) ||
                  voices.find(v => v.lang.startsWith('en')) ||
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

  const startListening = useCallback(() => {
    activeRef.current = true;
    setIsListening(true);
    try { recRef.current?.start(); } catch (e) {}
  }, []);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    setIsListening(false);
    try { recRef.current?.stop(); } catch (e) {}
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  return {
    isListening, isSpeaking, isPaused, transcript, displayText,
    speak, stop, startListening, stopListening, pause, resume,
    extractDigits, formatPhoneNumber
  };
};

export default useVoice;
