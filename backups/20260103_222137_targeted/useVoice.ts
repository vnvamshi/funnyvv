// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - useVoice Hook v13.0 - SINGLE INSTANCE (No conflicts)
// THE FIX: Only ONE recognition instance, properly managed start/stop
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3', 'free': '3',
  'four': '4', 'for': '4',
  'five': '5', 'fife': '5',
  'six': '6', 'sicks': '6',
  'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9', 'nein': '9', 'mine': '9'
};

export const extractDigits = (text: string): string => {
  if (!text) return '';
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  let digits = '';
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) digits += WORD_TO_DIGIT[word];
    else if (/^\d$/.test(word)) digits += word;
  }
  const rawDigits = text.replace(/\D/g, '');
  return digits.length >= rawDigits.length ? digits : rawDigits;
};

export const formatPhoneNumber = (d: string): string => {
  const c = d.replace(/\D/g, '').slice(0, 10);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0,3)}-${c.slice(3)}`;
  return `${c.slice(0,3)}-${c.slice(3,6)}-${c.slice(6)}`;
};

export const speakablePhone = (d: string): string => {
  const m: Record<string,string> = {'0':'zero','1':'one','2':'two','3':'three','4':'four','5':'five','6':'six','7':'seven','8':'eight','9':'nine'};
  return d.replace(/\D/g,'').split('').map(x=>m[x]||x).join(' ');
};

// GLOBAL: Only ONE recognition instance across the entire app
let globalRecognition: SpeechRecognition | null = null;
let globalIsRunning = false;

interface UseVoiceOptions {
  onCommand?: (cmd: string) => void;
  onDigits?: (digits: string) => void;
  autoStart?: boolean;
}

export const useVoice = (options: UseVoiceOptions = {}) => {
  const { autoStart = true } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const onCommandRef = useRef(options.onCommand);
  const onDigitsRef = useRef(options.onDigits);
  const mountedRef = useRef(true);

  // Update callback refs when they change
  useEffect(() => {
    onCommandRef.current = options.onCommand;
    onDigitsRef.current = options.onDigits;
  }, [options.onCommand, options.onDigits]);

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    synthRef.current?.getVoices();
  }, []);

  // Initialize speech recognition - SINGLE INSTANCE
  useEffect(() => {
    mountedRef.current = true;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('[Voice] Speech recognition not supported');
      return;
    }

    // Create global instance only if it doesn't exist
    if (!globalRecognition) {
      console.log('[Voice] Creating SINGLE global recognition instance');
      globalRecognition = new SpeechRecognition();
      globalRecognition.continuous = true;
      globalRecognition.interimResults = true;
      globalRecognition.lang = 'en-US';
      globalRecognition.maxAlternatives = 1;
    }

    const recognition = globalRecognition;

    const handleResult = (event: SpeechRecognitionEvent) => {
      if (!mountedRef.current) return;
      
      const result = event.results[event.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      
      if (text) setTranscript(text);
      
      if (result.isFinal && text) {
        console.log('[Voice] FINAL:', text);
        
        // Extract and send digits
        const digits = extractDigits(text);
        if (digits.length > 0 && onDigitsRef.current) {
          console.log('[Voice] Sending digits:', digits);
          onDigitsRef.current(digits);
        }
        
        // Send command
        if (onCommandRef.current) {
          onCommandRef.current(text.toLowerCase());
        }
      }
    };

    const handleStart = () => {
      globalIsRunning = true;
      if (mountedRef.current) setIsListening(true);
      console.log('[Voice] ✅ Started');
    };

    const handleEnd = () => {
      globalIsRunning = false;
      console.log('[Voice] Ended');
      
      // Auto-restart if still mounted and not paused
      if (mountedRef.current && !isPaused) {
        setTimeout(() => {
          if (mountedRef.current && !globalIsRunning) {
            try {
              recognition.start();
            } catch (e) {
              // Already running or other error - ignore
            }
          }
        }, 300);
      } else {
        if (mountedRef.current) setIsListening(false);
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.log('[Voice] Error:', event.error);
      globalIsRunning = false;
      
      if (event.error === 'not-allowed') {
        console.log('[Voice] ❌ Microphone permission denied');
        if (mountedRef.current) setIsListening(false);
      }
      // For other errors, let onend handle restart
    };

    // Remove old listeners and add new ones
    recognition.onresult = handleResult;
    recognition.onstart = handleStart;
    recognition.onend = handleEnd;
    recognition.onerror = handleError;

    // Auto-start if requested and not already running
    if (autoStart && !globalIsRunning) {
      setTimeout(() => {
        if (mountedRef.current && !globalIsRunning) {
          try {
            recognition.start();
            console.log('[Voice] Auto-starting...');
          } catch (e) {
            console.log('[Voice] Start error (may already be running)');
          }
        }
      }, 500);
    }

    return () => {
      mountedRef.current = false;
      // Don't stop recognition on unmount - let it continue for other components
    };
  }, [autoStart, isPaused]);

  const speak = useCallback((text: string) => {
    setDisplayText(text);
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) ||
                  voices.find(v => v.lang.startsWith('en-US')) ||
                  voices[0];
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    setIsPaused(false);
    if (globalRecognition && !globalIsRunning) {
      try {
        globalRecognition.start();
      } catch (e) {}
    }
  }, []);

  const stopListening = useCallback(() => {
    if (globalRecognition && globalIsRunning) {
      try {
        globalRecognition.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    stopListening();
  }, [stopListening]);

  const resume = useCallback(() => {
    setIsPaused(false);
    startListening();
  }, [startListening]);

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
    resume
  };
};

export default useVoice;
