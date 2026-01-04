// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW useVoice v15.0 - ACTUALLY WORKING VOICE RECOGNITION
// Key fixes:
// 1. Single instance management
// 2. Proper event binding
// 3. Real-time transcript display
// 4. Actual digit extraction that works
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

// Word to digit mapping - comprehensive
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0', 'hero': '0',
  'one': '1', 'won': '1', 'want': '1', 'juan': '1',
  'two': '2', 'to': '2', 'too': '2', 'tu': '2',
  'three': '3', 'tree': '3', 'free': '3', 'sri': '3',
  'four': '4', 'for': '4', 'fore': '4', 'ford': '4',
  'five': '5', 'fife': '5', 'hive': '5',
  'six': '6', 'sicks': '6', 'sex': '6', 'sick': '6',
  'seven': '7', 'sven': '7',
  'eight': '8', 'ate': '8', 'ait': '8',
  'nine': '9', 'nein': '9', 'mine': '9', 'line': '9', 'wine': '9'
};

export const extractDigits = (text: string): string => {
  if (!text) return '';
  
  // First try to extract raw digits
  const rawDigits = text.replace(/\D/g, '');
  
  // Then try word conversion
  const lower = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = lower.split(/\s+/);
  let wordDigits = '';
  
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) {
      wordDigits += WORD_TO_DIGIT[word];
    } else if (/^\d$/.test(word)) {
      wordDigits += word;
    }
  }
  
  // Return whichever got more digits
  return wordDigits.length >= rawDigits.length ? wordDigits : rawDigits;
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

// Global recognition instance - SINGLETON
let globalRecognition: SpeechRecognition | null = null;
let globalIsActive = false;
let globalCallbacks: {
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStateChange?: (listening: boolean) => void;
} = {};

// Initialize global recognition once
const initGlobalRecognition = () => {
  if (globalRecognition) return globalRecognition;
  
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error('[Voice] Speech Recognition not supported in this browser');
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 3;
  
  recognition.onstart = () => {
    console.log('[Voice] ════════════════════════════════════');
    console.log('[Voice] ✅ RECOGNITION STARTED - LISTENING NOW');
    console.log('[Voice] ════════════════════════════════════');
    globalIsActive = true;
    globalCallbacks.onStateChange?.(true);
  };
  
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0]?.transcript?.trim() || '';
    const confidence = result[0]?.confidence || 0;
    const isFinal = result.isFinal;
    
    console.log(`[Voice] 🎤 HEARD: "${transcript}" (${(confidence*100).toFixed(0)}% conf, final: ${isFinal})`);
    
    if (transcript) {
      globalCallbacks.onResult?.(transcript, isFinal);
    }
  };
  
  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.log('[Voice] ❌ ERROR:', event.error);
    
    if (event.error === 'not-allowed') {
      globalCallbacks.onError?.('Microphone access denied. Please allow microphone in browser settings.');
      globalIsActive = false;
      globalCallbacks.onStateChange?.(false);
    } else if (event.error === 'no-speech') {
      // No speech detected - this is normal, will auto-restart
      console.log('[Voice] No speech detected, continuing...');
    } else if (event.error === 'aborted') {
      // Aborted - will restart via onend
      console.log('[Voice] Recognition aborted, will restart...');
    }
  };
  
  recognition.onend = () => {
    console.log('[Voice] Recognition ended');
    globalIsActive = false;
    
    // Auto-restart after short delay
    setTimeout(() => {
      if (globalRecognition && !globalIsActive) {
        try {
          globalRecognition.start();
        } catch (e) {
          // May already be started
        }
      }
    }, 200);
  };
  
  recognition.onspeechstart = () => {
    console.log('[Voice] 🗣️ Speech detected!');
  };
  
  recognition.onspeechend = () => {
    console.log('[Voice] 🔇 Speech ended');
  };
  
  recognition.onaudiostart = () => {
    console.log('[Voice] 🎙️ Audio capture started');
  };
  
  globalRecognition = recognition;
  return recognition;
};

interface UseVoiceOptions {
  onDigits?: (digits: string) => void;
  onCommand?: (cmd: string) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  autoStart?: boolean;
}

export const useVoice = (options: UseVoiceOptions = {}) => {
  const { autoStart = true } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastHeard, setLastHeard] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState('');
  
  const mountedRef = useRef(true);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const optionsRef = useRef(options);
  
  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    synthRef.current?.getVoices();
  }, []);
  
  // Initialize recognition and set up callbacks
  useEffect(() => {
    mountedRef.current = true;
    
    const recognition = initGlobalRecognition();
    if (!recognition) {
      setError('Speech recognition not supported');
      return;
    }
    
    // Set up callbacks
    globalCallbacks = {
      onResult: (text: string, isFinal: boolean) => {
        if (!mountedRef.current) return;
        
        setTranscript(text);
        setLastHeard(text);
        
        // Call transcript callback
        optionsRef.current.onTranscript?.(text, isFinal);
        
        if (isFinal) {
          // Extract digits
          const digits = extractDigits(text);
          if (digits.length > 0) {
            console.log('[Voice] 📱 EXTRACTED DIGITS:', digits);
            optionsRef.current.onDigits?.(digits);
          }
          
          // Send as command
          optionsRef.current.onCommand?.(text.toLowerCase());
        }
      },
      onError: (err: string) => {
        if (!mountedRef.current) return;
        setError(err);
      },
      onStateChange: (listening: boolean) => {
        if (!mountedRef.current) return;
        setIsListening(listening);
      }
    };
    
    // Auto-start if enabled
    if (autoStart && !globalIsActive) {
      setTimeout(() => {
        if (mountedRef.current && recognition && !globalIsActive) {
          try {
            recognition.start();
            console.log('[Voice] Auto-starting recognition...');
          } catch (e) {
            console.log('[Voice] Could not auto-start:', e);
          }
        }
      }, 500);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [autoStart]);
  
  // Speak function
  const speak = useCallback((text: string) => {
    if (!text) return;
    
    setDisplayText(text);
    console.log('[Voice] 🔊 SPEAKING:', text);
    
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
                  voices[0];
    if (voice) utterance.voice = voice;
    
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
  
  const startListening = useCallback(() => {
    const recognition = initGlobalRecognition();
    if (recognition && !globalIsActive) {
      try {
        recognition.start();
      } catch (e) {}
    }
  }, []);
  
  const stopListening = useCallback(() => {
    if (globalRecognition && globalIsActive) {
      try {
        globalRecognition.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);
  
  const pause = stopListening;
  const resume = startListening;
  
  return {
    isListening,
    isSpeaking,
    isPaused: !isListening,
    transcript,
    lastHeard,
    error,
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
