// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - GLOBAL VOICE CONTEXT
// Maintains mic listening across ALL pages and modals
// "Hey/Mr V/Vista" works everywhere, mic never terminates
// ═══════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

interface VoiceContextType {
  // State
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  transcript: string;
  displayText: string;
  
  // Actions
  speak: (text: string, interrupt?: boolean) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  
  // Command registration
  registerCommands: (id: string, handler: (cmd: string) => boolean) => void;
  unregisterCommands: (id: string) => void;
  
  // Text input
  processTextInput: (text: string) => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

// Word to digit mapping
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'one': '1', 'two': '2', 'three': '3',
  'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
};

export const extractDigits = (text: string): string => {
  const words = text.toLowerCase().split(/[\s,.\-]+/);
  let digits = '';
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) digits += WORD_TO_DIGIT[word];
  }
  const rawDigits = text.replace(/\D/g, '');
  return digits.length >= rawDigits.length ? digits : rawDigits;
};

export const formatPhoneNumber = (d: string): string => {
  const c = d.replace(/\D/g, '').slice(0, 10);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0, 3)}-${c.slice(3)}`;
  return `${c.slice(0, 3)}-${c.slice(3, 6)}-${c.slice(6)}`;
};

export const speakablePhone = (d: string): string => {
  const words: Record<string, string> = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
  };
  return d.replace(/\D/g, '').split('').map(x => words[x] || x).join(' ');
};

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const commandHandlersRef = useRef<Map<string, (cmd: string) => boolean>>(new Map());
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isListeningRef = useRef(false);
  const isPausedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // Initialize TTS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      synthRef.current?.getVoices(); // Preload
    }
  }, []);

  // Initialize STT - ALWAYS ON
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

    recognition.onstart = () => {
      console.log('🎤 Global mic started');
    };

    recognition.onresult = (e: any) => {
      const result = e.results[e.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      
      if (text) setTranscript(text);

      if (result.isFinal && text) {
        const cmd = text.toLowerCase();
        console.log('🎯 Heard:', cmd);
        processCommand(cmd);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.error('🎤 Error:', e.error);
      }
    };

    recognition.onend = () => {
      // ALWAYS restart unless explicitly paused
      if (!isPausedRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 100);
      }
    };

    recRef.current = recognition;

    // Start immediately
    setIsListening(true);
    try { recognition.start(); } catch (e) {}

    return () => {
      try { recognition.stop(); } catch (e) {}
    };
  }, []);

  // Process command - check for global triggers first
  const processCommand = useCallback((cmd: string) => {
    // ═══════════════════════════════════════════════════════════════════
    // GLOBAL TRIGGERS - Work EVERYWHERE
    // ═══════════════════════════════════════════════════════════════════
    
    // "Hey" / "Mr V" / "Vista" - PAUSE and respond politely
    if (cmd.includes('hey') || cmd.includes('mr v') || cmd.includes('mister v') || 
        cmd.includes('vista') || cmd.includes('mr. v') || cmd.includes('hello')) {
      
      // Stop any current speech immediately
      synthRef.current?.cancel();
      setIsSpeaking(false);
      setIsPaused(true);
      
      // Respond politely
      speak("Yes? I'm here. How can I help?", true);
      
      // Auto-resume after 8 seconds of no input
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 8000);
      
      return;
    }

    // "Stop" / "Quiet" - Stop speaking immediately
    if (cmd.includes('stop') || cmd.includes('quiet') || cmd.includes('shut up') || cmd.includes('silence')) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
      return;
    }

    // ═══════════════════════════════════════════════════════════════════
    // Pass to registered command handlers (modals/pages)
    // ═══════════════════════════════════════════════════════════════════
    for (const [id, handler] of commandHandlersRef.current) {
      if (handler(cmd)) {
        console.log(`✅ Command handled by: ${id}`);
        return;
      }
    }

    // No handler caught it - ignore or provide feedback
    console.log('❓ Unhandled command:', cmd);
  }, []);

  // Speak with optional interrupt
  const speak = useCallback((text: string, interrupt = false) => {
    if (!synthRef.current) {
      setDisplayText(text);
      return;
    }

    if (interrupt) {
      synthRef.current.cancel();
    }

    setDisplayText(text);
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0;
    
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) ||
                  voices.find(v => v.lang.includes('en-US')) ||
                  voices[0];
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  // Stop speaking
  const stop = useCallback(() => {
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
    try { recRef.current?.start(); } catch (e) {}
  }, []);

  // Register command handler from a modal/page
  const registerCommands = useCallback((id: string, handler: (cmd: string) => boolean) => {
    console.log(`📝 Registered commands: ${id}`);
    commandHandlersRef.current.set(id, handler);
  }, []);

  // Unregister when modal/page closes
  const unregisterCommands = useCallback((id: string) => {
    console.log(`🗑️ Unregistered commands: ${id}`);
    commandHandlersRef.current.delete(id);
  }, []);

  // Process text input (from AgentBar)
  const processTextInput = useCallback((text: string) => {
    setTranscript(text);
    processCommand(text.toLowerCase());
  }, [processCommand]);

  return (
    <VoiceContext.Provider value={{
      isListening,
      isSpeaking,
      isPaused,
      transcript,
      displayText,
      speak,
      stop,
      pause,
      resume,
      registerCommands,
      unregisterCommands,
      processTextInput
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

// Hook to use voice context
export const useGlobalVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useGlobalVoice must be used within VoiceProvider');
  }
  return context;
};

// Hook for modals/pages to register their commands
export const useVoiceCommands = (id: string, handler: (cmd: string) => boolean, deps: any[] = []) => {
  const { registerCommands, unregisterCommands } = useGlobalVoice();
  
  useEffect(() => {
    registerCommands(id, handler);
    return () => unregisterCommands(id);
  }, [id, ...deps]);
};

export default VoiceContext;
