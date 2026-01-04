// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VOICE HOOK v2.0
// Speech recognition + synthesis with phone number handling
// Features: Pause on "hey", digit extraction, proper cleanup
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceOptions {
  onCommand?: (cmd: string) => void;
  onDigits?: (digits: string) => void;  // New: for phone/OTP input
  autoStart?: boolean;
  pauseTimeout?: number;  // How long to wait before auto-resume (ms)
}

// Word to digit mapping for phone numbers
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3',
  'four': '4', 'for': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9',
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
};

// Extract digits from spoken text (e.g., "seven zero three" → "703")
export const extractDigits = (text: string): string => {
  const words = text.toLowerCase().split(/[\s,.-]+/);
  let digits = '';
  
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) {
      digits += WORD_TO_DIGIT[word];
    }
  }
  
  // Also try to extract any raw digits
  const rawDigits = text.replace(/\D/g, '');
  
  // Return whichever has more digits
  return digits.length >= rawDigits.length ? digits : rawDigits;
};

// Format phone number as 703-338-4931
export const formatPhoneNumber = (digits: string): string => {
  const clean = digits.replace(/\D/g, '').slice(0, 10);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
};

// Speak phone number as "seven zero three - three three eight - four nine three one"
export const speakablePhone = (digits: string): string => {
  const clean = digits.replace(/\D/g, '');
  const digitWords = clean.split('').map(d => {
    const words: Record<string, string> = {
      '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
      '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
    };
    return words[d] || d;
  });
  
  if (clean.length === 10) {
    return `${digitWords.slice(0, 3).join(' ')} — ${digitWords.slice(3, 6).join(' ')} — ${digitWords.slice(6).join(' ')}`;
  }
  return digitWords.join(' ');
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
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commandRef = useRef(onCommand);
  const digitsRef = useRef(onDigits);

  // Keep refs updated
  useEffect(() => {
    commandRef.current = onCommand;
    digitsRef.current = onDigits;
  }, [onCommand, onDigits]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
      const result = e.results[e.results.length - 1];
      const text = result[0].transcript.trim();
      setTranscript(text);

      if (result.isFinal) {
        const cmd = text.toLowerCase();

        // Check for "hey" to trigger pause
        if (cmd.includes('hey') || cmd.includes('mr v') || cmd.includes('mister v') || cmd.includes('vista')) {
          handlePause();
          return;
        }

        // Check for digits (for phone/OTP)
        const digits = extractDigits(text);
        if (digits.length > 0 && digitsRef.current) {
          digitsRef.current(digits);
        }

        // Pass to command handler
        commandRef.current?.(cmd);
      }
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') {
        console.warn('Microphone access denied');
      }
    };

    recognition.onend = () => {
      if (isListening && !isPaused) {
        try { recognition.start(); } catch (e) {}
      }
    };

    recRef.current = recognition;

    if (autoStart) {
      setIsListening(true);
      try { recognition.start(); } catch (e) {}
    }

    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      try { recognition.stop(); } catch (e) {}
    };
  }, [autoStart]);

  // Handle restart when isPaused or isListening changes
  useEffect(() => {
    if (!recRef.current) return;
    
    if (isListening && !isPaused) {
      try { recRef.current.start(); } catch (e) {}
    } else {
      try { recRef.current.stop(); } catch (e) {}
    }
  }, [isListening, isPaused]);

  const handlePause = useCallback(() => {
    stop();
    setIsPaused(true);
    speak("Yes? I'm listening. What would you like me to do?");

    // Clear any existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Auto-resume after timeout
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      speak("Alright, continuing. Say 'hey' anytime to pause!");
    }, pauseTimeout);
  }, [pauseTimeout]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Stop any current speech
    synthRef.current.cancel();
    
    setDisplayText(text);
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    
    // Try to use a good US English voice
    const voices = synthRef.current.getVoices();
    const usVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Samantha')) 
      || voices.find(v => v.lang.includes('en-US'))
      || voices[0];
    if (usVoice) utterance.voice = usVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
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
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
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
    // State
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    displayText,
    
    // Actions
    speak,
    stop,
    pause,
    resume,
    startListening,
    stopListening,
    setIsPaused,
    
    // Utilities
    extractDigits,
    formatPhoneNumber,
    speakablePhone
  };
};

export default useVoice;
