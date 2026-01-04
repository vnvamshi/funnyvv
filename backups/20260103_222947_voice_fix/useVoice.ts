// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW useVoice v14.0 - FORCE AUTO-START, AGGRESSIVE LISTENING
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3', 'free': '3',
  'four': '4', 'for': '4', 'fore': '4',
  'five': '5', 'fife': '5',
  'six': '6', 'sicks': '6', 'sex': '6',
  'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9', 'nein': '9', 'mine': '9', 'line': '9'
};

export const extractDigits = (text: string): string => {
  if (!text) return '';
  const lower = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = lower.split(/\s+/);
  let digits = '';
  
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) {
      digits += WORD_TO_DIGIT[word];
    } else if (/^\d$/.test(word)) {
      digits += word;
    }
  }
  
  // Also extract raw digits from the text
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

interface UseVoiceOptions {
  onCommand?: (cmd: string) => void;
  onDigits?: (digits: string) => void;
  onTranscript?: (text: string) => void;
  autoStart?: boolean;
}

export const useVoice = (options: UseVoiceOptions = {}) => {
  const { autoStart = true } = options;
  
  // FORCE not paused by default
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Start NOT paused
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const mountedRef = useRef(true);
  const startAttemptsRef = useRef(0);
  const isRunningRef = useRef(false);
  
  // Use refs for callbacks to avoid stale closures
  const onCommandRef = useRef(options.onCommand);
  const onDigitsRef = useRef(options.onDigits);
  const onTranscriptRef = useRef(options.onTranscript);

  useEffect(() => {
    onCommandRef.current = options.onCommand;
    onDigitsRef.current = options.onDigits;
    onTranscriptRef.current = options.onTranscript;
  }, [options.onCommand, options.onDigits, options.onTranscript]);

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    // Preload voices
    synthRef.current?.getVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', () => {
      synthRef.current?.getVoices();
    });
  }, []);

  // Start recognition function
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isRunningRef.current || isPaused) return;
    
    try {
      recognitionRef.current.start();
      console.log('[Voice] Starting recognition...');
    } catch (e: any) {
      if (e.message?.includes('already started')) {
        console.log('[Voice] Already running');
        isRunningRef.current = true;
        setIsListening(true);
      }
    }
  }, [isPaused]);

  // Initialize speech recognition
  useEffect(() => {
    mountedRef.current = true;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('[Voice] Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('[Voice] ✅ STARTED - Now listening');
      isRunningRef.current = true;
      startAttemptsRef.current = 0;
      if (mountedRef.current) {
        setIsListening(true);
        setIsPaused(false);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!mountedRef.current) return;
      
      const result = event.results[event.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      const confidence = result[0]?.confidence || 0;
      
      console.log(`[Voice] Heard: "${text}" (${(confidence * 100).toFixed(0)}% conf, final: ${result.isFinal})`);
      
      if (text) {
        setTranscript(text);
        onTranscriptRef.current?.(text);
      }
      
      if (result.isFinal && text) {
        console.log('[Voice] 📝 FINAL TRANSCRIPT:', text);
        
        // Extract digits
        const digits = extractDigits(text);
        if (digits.length > 0) {
          console.log('[Voice] 📱 DIGITS EXTRACTED:', digits);
          onDigitsRef.current?.(digits);
        }
        
        // Send command
        const cmd = text.toLowerCase();
        console.log('[Voice] 🎯 COMMAND:', cmd);
        onCommandRef.current?.(cmd);
      }
    };

    recognition.onend = () => {
      console.log('[Voice] Recognition ended');
      isRunningRef.current = false;
      
      // Auto-restart if mounted and not paused
      if (mountedRef.current && !isPaused) {
        startAttemptsRef.current++;
        if (startAttemptsRef.current < 100) {
          setTimeout(() => {
            if (mountedRef.current && !isRunningRef.current && !isPaused) {
              startRecognition();
            }
          }, 100);
        }
      } else {
        if (mountedRef.current) setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[Voice] Error:', event.error);
      isRunningRef.current = false;
      
      if (event.error === 'not-allowed') {
        console.error('[Voice] ❌ MICROPHONE PERMISSION DENIED');
        if (mountedRef.current) {
          setIsListening(false);
          setDisplayText('⚠️ Microphone access denied. Please allow microphone access.');
        }
        return;
      }
      
      if (event.error === 'aborted' || event.error === 'no-speech') {
        // These are recoverable - will restart via onend
        return;
      }
    };

    // FORCE AUTO-START after a short delay
    if (autoStart) {
      console.log('[Voice] Auto-start enabled, starting in 300ms...');
      setTimeout(() => {
        if (mountedRef.current && !isRunningRef.current) {
          startRecognition();
        }
      }, 300);
    }

    return () => {
      mountedRef.current = false;
      if (recognitionRef.current && isRunningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [autoStart, isPaused, startRecognition]);

  // Speak function
  const speak = useCallback((text: string) => {
    if (!text) return;
    
    setDisplayText(text);
    console.log('[Voice] 🔊 Speaking:', text);
    
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Samantha')) ||
                          voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                          voices.find(v => v.lang.startsWith('en-US')) ||
                          voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      if (mountedRef.current) setIsSpeaking(false);
    };
    utterance.onerror = () => {
      if (mountedRef.current) setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    console.log('[Voice] Pausing...');
    setIsPaused(true);
    if (recognitionRef.current && isRunningRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
  }, []);

  const resume = useCallback(() => {
    console.log('[Voice] Resuming...');
    setIsPaused(false);
    setTimeout(() => {
      if (mountedRef.current && !isRunningRef.current) {
        startRecognition();
      }
    }, 100);
  }, [startRecognition]);

  const startListening = useCallback(() => {
    setIsPaused(false);
    startRecognition();
  }, [startRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isRunningRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    isRunningRef.current = false;
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    displayText,
    speak,
    stop,
    pause,
    resume,
    startListening,
    stopListening
  };
};

export default useVoice;
