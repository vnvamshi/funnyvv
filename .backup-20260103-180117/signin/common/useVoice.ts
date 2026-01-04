// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VOICE HOOK v3.0 (ROBUST + SMOOTH)
// Features: Better mic handling, smoother TTS, error recovery, text fallback
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceOptions {
  onCommand?: (cmd: string) => void;
  onDigits?: (digits: string) => void;
  autoStart?: boolean;
  pauseTimeout?: number;
  lang?: string;
}

// Word to digit mapping
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3',
  'four': '4', 'for': '4', 'fore': '4',
  'five': '5', 'fife': '5',
  'six': '6', 'sicks': '6',
  'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9', 'niner': '9',
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
};

// Extract digits from spoken text
export const extractDigits = (text: string): string => {
  const words = text.toLowerCase().split(/[\s,.\-]+/);
  let digits = '';
  
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) {
      digits += WORD_TO_DIGIT[word];
    }
  }
  
  const rawDigits = text.replace(/\D/g, '');
  return digits.length >= rawDigits.length ? digits : rawDigits;
};

// Format phone number
export const formatPhoneNumber = (digits: string): string => {
  const clean = digits.replace(/\D/g, '').slice(0, 10);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
};

// Speakable phone
export const speakablePhone = (digits: string): string => {
  const clean = digits.replace(/\D/g, '');
  const words: Record<string, string> = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
  };
  const digitWords = clean.split('').map(d => words[d] || d);
  
  if (clean.length === 10) {
    return `${digitWords.slice(0, 3).join(' ')}. ${digitWords.slice(3, 6).join(' ')}. ${digitWords.slice(6).join(' ')}`;
  }
  return digitWords.join(' ');
};

export const useVoice = ({ 
  onCommand, 
  onDigits,
  autoStart = true,
  pauseTimeout = 8000,
  lang = 'en-US'
}: UseVoiceOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandRef = useRef(onCommand);
  const digitsRef = useRef(onDigits);
  const isListeningRef = useRef(isListening);
  const isPausedRef = useRef(isPaused);

  // Keep refs updated
  useEffect(() => {
    commandRef.current = onCommand;
    digitsRef.current = onDigits;
  }, [onCommand, onDigits]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    
    // Preload voices
    const loadVoices = () => {
      synthRef.current?.getVoices();
    };
    
    loadVoices();
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SR) {
      console.warn('Speech recognition not supported in this browser');
      setIsSupported(false);
      setMicError('Speech recognition not supported');
      return;
    }

    let recognition: any;
    
    try {
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setMicError(null);
      };

      recognition.onresult = (e: any) => {
        if (!e.results || e.results.length === 0) return;
        
        const result = e.results[e.results.length - 1];
        const text = result[0]?.transcript?.trim() || '';
        
        if (text) {
          setTranscript(text);
        }

        if (result.isFinal && text) {
          const cmd = text.toLowerCase();
          console.log('🎯 Final transcript:', cmd);

          // Check for pause trigger
          if (cmd.includes('hey') || cmd.includes('mr v') || cmd.includes('mister v') || cmd.includes('vista') || cmd.includes('mr. v')) {
            handlePause();
            return;
          }

          // Extract digits
          const digits = extractDigits(text);
          if (digits.length > 0) {
            digitsRef.current?.(digits);
          }

          // Pass to command handler
          commandRef.current?.(cmd);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('🎤 Speech recognition error:', e.error);
        
        switch (e.error) {
          case 'not-allowed':
            setMicError('Microphone access denied. Please allow microphone in browser settings.');
            setIsListening(false);
            break;
          case 'no-speech':
            // This is normal - just restart
            break;
          case 'audio-capture':
            setMicError('No microphone found. Please connect a microphone.');
            break;
          case 'network':
            setMicError('Network error. Please check your connection.');
            break;
          case 'aborted':
            // User or system aborted - don't show error
            break;
          default:
            // For other errors, try to restart
            break;
        }
      };

      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        
        // Auto-restart if we should be listening
        if (isListeningRef.current && !isPausedRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.warn('Could not restart recognition:', e);
            }
          }, 100);
        }
      };

      recRef.current = recognition;

      // Auto-start if requested
      if (autoStart) {
        setIsListening(true);
        try {
          recognition.start();
        } catch (e) {
          console.warn('Could not start recognition:', e);
        }
      }

    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setIsSupported(false);
      setMicError('Failed to initialize speech recognition');
    }

    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      try { recognition?.stop(); } catch (e) {}
    };
  }, [autoStart, lang]);

  // Handle pause (triggered by "Hey Mr V")
  const handlePause = useCallback(() => {
    console.log('⏸️ Pause triggered');
    stopSpeaking();
    setIsPaused(true);
    speak("Yes? I'm listening. What would you like me to do?");

    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      speak("Okay, continuing. Say 'hey' anytime!");
    }, pauseTimeout);
  }, [pauseTimeout]);

  // Speak text (TTS)
  const speak = useCallback((text: string) => {
    if (!synthRef.current) {
      console.warn('Speech synthesis not available');
      setDisplayText(text);
      return;
    }
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    setDisplayText(text);
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get best voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = 
      voices.find(v => v.name.includes('Samantha') && v.lang.includes('en')) ||
      voices.find(v => v.name.includes('Google') && v.lang.includes('en-US')) ||
      voices.find(v => v.lang.includes('en-US') && v.localService) ||
      voices.find(v => v.lang.includes('en-US')) ||
      voices.find(v => v.lang.includes('en')) ||
      voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    // Small delay to ensure cancel completed
    setTimeout(() => {
      synthRef.current?.speak(utterance);
    }, 50);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // Pause listening
  const pause = useCallback(() => {
    setIsPaused(true);
    try { recRef.current?.stop(); } catch (e) {}
  }, []);

  // Resume listening
  const resume = useCallback(() => {
    setIsPaused(false);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    
    if (isListeningRef.current) {
      try { recRef.current?.start(); } catch (e) {}
    }
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    setIsListening(true);
    setIsPaused(false);
    setMicError(null);
    
    try { 
      recRef.current?.start(); 
    } catch (e) {
      console.warn('Could not start listening:', e);
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    try { recRef.current?.stop(); } catch (e) {}
  }, []);

  // Process text input (fallback when mic doesn't work)
  const processTextInput = useCallback((text: string) => {
    const cmd = text.toLowerCase().trim();
    setTranscript(text);
    
    // Check for pause trigger
    if (cmd.includes('hey') || cmd.includes('mr v')) {
      handlePause();
      return;
    }

    // Extract digits
    const digits = extractDigits(text);
    if (digits.length > 0) {
      digitsRef.current?.(digits);
    }

    // Pass to command handler
    commandRef.current?.(cmd);
  }, [handlePause]);

  return {
    // State
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    displayText,
    micError,
    isSupported,
    
    // Actions
    speak,
    stop: stopSpeaking,
    pause,
    resume,
    startListening,
    stopListening,
    setIsPaused,
    processTextInput,
    
    // Utilities
    extractDigits,
    formatPhoneNumber,
    speakablePhone
  };
};

export default useVoice;
