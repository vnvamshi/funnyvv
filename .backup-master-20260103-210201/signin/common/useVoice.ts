// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - useVoice Hook v3.0 (FIXED)
// RULE-004: Voice everywhere with STT/TTS
// RULE-008: Single mic management
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceOptions {
  onCommand?: (cmd: string) => void;
  onDigits?: (digits: string) => void;
  autoStart?: boolean;
}

// RULE: Digit extraction from VV-AS-v1.0.json
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3',
  'four': '4', 'for': '4', 'fore': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9', 'nein': '9',
};

export const extractDigits = (text: string): string => {
  const words = text.toLowerCase().split(/[\s,.\-]+/);
  let digits = '';
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) {
      digits += WORD_TO_DIGIT[word];
    } else if (/^\d$/.test(word)) {
      digits += word;
    }
  }
  // Also extract raw digits
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
  const clean = d.replace(/\D/g, '');
  const words = clean.split('').map(x => w[x] || x);
  if (clean.length >= 10) {
    return `${words.slice(0,3).join(' ')} — ${words.slice(3,6).join(' ')} — ${words.slice(6,10).join(' ')}`;
  }
  return words.join(' ');
};

export const useVoice = ({ onCommand, onDigits, autoStart = true }: UseVoiceOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false);
  const commandRef = useRef(onCommand);
  const digitsRef = useRef(onDigits);
  const retryCountRef = useRef(0);

  // Keep refs updated
  useEffect(() => { commandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { digitsRef.current = onDigits; }, [onDigits]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window === 'undefined') return;
    synthRef.current = window.speechSynthesis;
    // Preload voices
    const loadVoices = () => synthRef.current?.getVoices();
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // Initialize speech recognition - THIS IS THE FIX
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[useVoice] Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('[useVoice] Recognition STARTED');
      setIsListening(true);
      retryCountRef.current = 0;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!isActiveRef.current) return;

      const result = event.results[event.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      
      console.log('[useVoice] Heard:', text, 'Final:', result.isFinal);
      
      if (text) {
        setTranscript(text);
      }

      if (result.isFinal && text) {
        const cmd = text.toLowerCase();
        
        // Extract and pass digits FIRST (for phone/OTP)
        const digits = extractDigits(text);
        if (digits.length > 0) {
          console.log('[useVoice] Extracted digits:', digits);
          digitsRef.current?.(digits);
        }
        
        // Then pass full command
        commandRef.current?.(cmd);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[useVoice] Error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Normal - just restart
      } else if (event.error === 'not-allowed') {
        console.error('[useVoice] Microphone access denied');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log('[useVoice] Recognition ended, isActive:', isActiveRef.current);
      if (isActiveRef.current && retryCountRef.current < 50) {
        retryCountRef.current++;
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log('[useVoice] Restart failed, retrying...');
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    recRef.current = recognition;

    // AUTO-START if requested
    if (autoStart) {
      console.log('[useVoice] Auto-starting recognition...');
      isActiveRef.current = true;
      // Small delay to ensure component is mounted
      setTimeout(() => {
        try {
          recognition.start();
          console.log('[useVoice] Recognition start() called');
        } catch (e) {
          console.log('[useVoice] Start failed, will retry');
        }
      }, 300);
    }

    return () => {
      console.log('[useVoice] Cleanup - stopping recognition');
      isActiveRef.current = false;
      try { recognition.stop(); } catch (e) {}
    };
  }, [autoStart]);

  const speak = useCallback((text: string) => {
    console.log('[useVoice] Speaking:', text);
    setDisplayText(text);
    
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) ||
                  voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                  voices.find(v => v.lang.startsWith('en-US')) ||
                  voices.find(v => v.lang.startsWith('en')) ||
                  voices[0];
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      console.log('[useVoice] Done speaking');
      setIsSpeaking(false);
    };
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    console.log('[useVoice] startListening called');
    isActiveRef.current = true;
    retryCountRef.current = 0;
    try {
      recRef.current?.start();
    } catch (e) {
      console.log('[useVoice] Already started or error');
    }
  }, []);

  const stopListening = useCallback(() => {
    console.log('[useVoice] stopListening called');
    isActiveRef.current = false;
    try {
      recRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    try { recRef.current?.stop(); } catch (e) {}
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    retryCountRef.current = 0;
    try { recRef.current?.start(); } catch (e) {}
  }, []);

  return {
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    displayText,
    speak,
    stop,
    startListening,
    stopListening,
    pause,
    resume,
    // Export utilities for components
    extractDigits,
    formatPhoneNumber,
    speakablePhone
  };
};

export default useVoice;
