// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - useVoice Hook v12.0 - WITH DEBUG + FIXED CALLBACKS
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

// Word to digit - comprehensive
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1', 'want': '1', 'wanna': '1',
  'two': '2', 'to': '2', 'too': '2', 'tu': '2',
  'three': '3', 'tree': '3', 'free': '3', 'sri': '3',
  'four': '4', 'for': '4', 'fore': '4', 'ford': '4', 'fort': '4',
  'five': '5', 'fife': '5', 'hive': '5', 'fight': '5',
  'six': '6', 'sicks': '6', 'sex': '6', 'seis': '6', 'sick': '6',
  'seven': '7', 'sevn': '7', 'heaven': '7',
  'eight': '8', 'ate': '8', 'ait': '8', 'eat': '8', 'late': '8',
  'nine': '9', 'nein': '9', 'mine': '9', 'line': '9', 'dine': '9', 'wine': '9'
};

export const extractDigits = (text: string): string => {
  if (!text) return '';
  
  // First get raw digits from text
  const rawDigits = text.replace(/\D/g, '');
  
  // Then convert words to digits
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  let wordDigits = '';
  
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) {
      wordDigits += WORD_TO_DIGIT[word];
    } else if (/^\d$/.test(word)) {
      wordDigits += word;
    }
  }
  
  const result = wordDigits.length >= rawDigits.length ? wordDigits : rawDigits;
  console.log('%c[extractDigits] "' + text + '" → "' + result + '"', 'color: cyan');
  return result;
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
  autoStart?: boolean;
}

export const useVoice = (options: UseVoiceOptions = {}) => {
  const { onCommand, onDigits, autoStart = true } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false);
  
  // CRITICAL: Store callbacks in refs that update
  const callbacksRef = useRef({ onCommand, onDigits });
  
  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = { onCommand, onDigits };
    console.log('%c[useVoice] Callbacks updated', 'color: yellow');
  }, [onCommand, onDigits]);

  const addLog = useCallback((msg: string) => {
    console.log('%c[useVoice] ' + msg, 'color: lime; font-weight: bold');
    setDebugLog(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${msg}`]);
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      synthRef.current.getVoices(); // Preload
      addLog('Speech synthesis ready');
    }
  }, [addLog]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') {
      addLog('ERROR: Not in browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      addLog('ERROR: SpeechRecognition NOT supported in this browser!');
      return;
    }

    addLog('Creating SpeechRecognition instance...');
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      addLog('✅ RECOGNITION STARTED - Now listening!');
      setIsListening(true);
    };

    recognition.onaudiostart = () => {
      addLog('🎤 Audio capture started');
    };

    recognition.onsoundstart = () => {
      addLog('🔊 Sound detected!');
    };

    recognition.onspeechstart = () => {
      addLog('🗣️ Speech detected!');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      const confidence = Math.round((result[0]?.confidence || 0) * 100);
      
      addLog(`HEARD: "${text}" (${confidence}% conf, final: ${result.isFinal})`);
      
      if (text) {
        setTranscript(text);
      }

      // ONLY process final results
      if (result.isFinal && text) {
        addLog(`📝 FINAL: "${text}"`);
        
        // Extract digits
        const digits = extractDigits(text);
        
        if (digits.length > 0) {
          addLog(`📱 DIGITS: "${digits}" - Calling onDigits callback`);
          // CRITICAL: Use the ref to get current callback
          if (callbacksRef.current.onDigits) {
            callbacksRef.current.onDigits(digits);
            addLog(`✅ onDigits callback executed with: ${digits}`);
          } else {
            addLog(`⚠️ onDigits callback is NULL!`);
          }
        }
        
        // Also send command
        addLog(`💬 COMMAND: "${text.toLowerCase()}"`);
        if (callbacksRef.current.onCommand) {
          callbacksRef.current.onCommand(text.toLowerCase());
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      addLog(`❌ ERROR: ${event.error} - ${event.message || ''}`);
      
      if (event.error === 'not-allowed') {
        addLog('🚫 MICROPHONE PERMISSION DENIED! Check browser settings.');
        setIsListening(false);
        isActiveRef.current = false;
      } else if (event.error === 'no-speech') {
        addLog('No speech detected, continuing...');
      } else if (event.error === 'aborted') {
        addLog('Recognition aborted');
      }
    };

    recognition.onend = () => {
      addLog(`Recognition ended. Active: ${isActiveRef.current}`);
      
      if (isActiveRef.current) {
        // Auto-restart
        setTimeout(() => {
          if (isActiveRef.current && recRef.current) {
            try {
              recRef.current.start();
              addLog('🔄 Restarted recognition');
            } catch (e: any) {
              addLog(`Restart failed: ${e.message}`);
              // Try again
              setTimeout(() => {
                if (isActiveRef.current && recRef.current) {
                  try { recRef.current.start(); } catch (e2) {}
                }
              }, 500);
            }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    recRef.current = recognition;

    // Auto-start
    if (autoStart) {
      addLog('Auto-starting recognition...');
      isActiveRef.current = true;
      
      // Delay start to ensure everything is ready
      setTimeout(() => {
        if (isActiveRef.current && recRef.current) {
          try {
            recRef.current.start();
            addLog('🎤 Recognition start() called');
          } catch (e: any) {
            addLog(`Start failed: ${e.message}`);
          }
        }
      }, 500);
    }

    return () => {
      addLog('Cleanup: stopping recognition');
      isActiveRef.current = false;
      try { recognition.stop(); } catch (e) {}
    };
  }, [autoStart, addLog]);

  // Speak function
  const speak = useCallback((text: string) => {
    addLog(`🔊 Speaking: "${text}"`);
    setDisplayText(text);
    
    if (!synthRef.current) {
      addLog('ERROR: No speech synthesis');
      return;
    }
    
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
      setIsSpeaking(false);
      addLog('Finished speaking');
    };
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      addLog(`Speak error: ${e.error}`);
    };

    synthRef.current.speak(utterance);
  }, [addLog]);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    addLog('Manual start listening');
    isActiveRef.current = true;
    try { recRef.current?.start(); } catch (e) {}
  }, [addLog]);

  const stopListening = useCallback(() => {
    addLog('Manual stop listening');
    isActiveRef.current = false;
    try { recRef.current?.stop(); } catch (e) {}
    setIsListening(false);
  }, [addLog]);

  const pause = useCallback(() => {
    addLog('Pausing');
    setIsPaused(true);
    isActiveRef.current = false;
    try { recRef.current?.stop(); } catch (e) {}
  }, [addLog]);

  const resume = useCallback(() => {
    addLog('Resuming');
    setIsPaused(false);
    isActiveRef.current = true;
    try { recRef.current?.start(); } catch (e) {}
  }, [addLog]);

  return {
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    displayText,
    debugLog, // EXPOSE debug log for UI
    speak,
    stop,
    startListening,
    stopListening,
    pause,
    resume
  };
};

export default useVoice;
