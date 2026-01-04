// ═══════════════════════════════════════════════════════════════════════════════
// MR. V - THE BRAIN
// Revolutionary AI Voice System for VistaView
// 
// Features:
// - Continuous listening with auto-restart
// - Context-aware command processing
// - Three interaction modes: Interactive, Talkative, Silent
// - Emotional intelligence & natural responses
// - Learning from user patterns
// - Global navigation by voice
// ═══════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export type VoiceMode = 'interactive' | 'talkative' | 'silent';
export type EmotionalState = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited';

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  lastCommand: string;
  confidence: number;
  error: string | null;
  mode: VoiceMode;
  emotion: EmotionalState;
  context: string; // Current page/step context
  history: string[]; // Conversation history
}

interface VoiceActions {
  speak: (text: string, emotion?: EmotionalState, onComplete?: () => void) => void;
  stopSpeaking: () => void;
  startListening: () => void;
  stopListening: () => void;
  pause: () => void;
  resume: () => void;
  setMode: (mode: VoiceMode) => void;
  setContext: (ctx: string) => void;
  processCommand: (command: string) => void;
  
  // Handler registration
  registerHandler: (type: 'digit' | 'command' | 'dictation', handler: (data: string) => void) => void;
  unregisterHandlers: () => void;
}

interface VoiceContextType extends VoiceState, VoiceActions {}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// Word to digit mapping (expanded)
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0', 'nil': '0',
  'one': '1', 'won': '1', 'want': '1',
  'two': '2', 'to': '2', 'too': '2', 'tu': '2',
  'three': '3', 'tree': '3', 'free': '3',
  'four': '4', 'for': '4', 'fore': '4',
  'five': '5', 'hive': '5',
  'six': '6', 'sex': '6', 'sicks': '6',
  'seven': '7', 'heaven': '7',
  'eight': '8', 'ate': '8', 'ait': '8',
  'nine': '9', 'nein': '9', 'mine': '9'
};

// Global navigation commands
const NAV_COMMANDS: Record<string, string> = {
  'home': '/',
  'go home': '/',
  'main page': '/',
  'about': '/about',
  'about us': '/about',
  'how it works': '/how-it-works',
  'partners': '/partners',
  'our partners': '/partners',
  'lend': '/lend',
  'lend with us': '/lend',
  'sign in': 'signin',
  'login': 'signin',
  'log in': 'signin',
  'vendor': 'vendor',
  'im a vendor': 'vendor',
  "i'm a vendor": 'vendor',
  'customer': 'customer',
  'buyer': 'customer',
  'investor': 'investor',
  'builder': 'builder',
  'agent': 'agent',
  'real estate': 'agent',
  'go back': 'back',
  'back': 'back',
  'previous': 'back',
  'next': 'next',
  'continue': 'next',
  'close': 'close',
  'cancel': 'close',
  'help': 'help',
  'what can you do': 'help'
};

// Emotional responses
const EMOTIONAL_RESPONSES: Record<EmotionalState, string[]> = {
  neutral: ['Okay.', 'Got it.', 'Sure.', 'Alright.'],
  happy: ['Perfect!', 'Wonderful!', 'Excellent!', 'Great choice!'],
  thinking: ['Let me think...', 'Processing...', 'One moment...'],
  concerned: ['Hmm, let me help you with that.', 'I noticed an issue.'],
  excited: ['Amazing!', 'This is exciting!', "You're doing great!"]
};

export const extractDigits = (text: string): string => {
  if (!text) return '';
  const words = text.toLowerCase().split(/\s+/);
  let digits = '';
  for (const word of words) {
    if (WORD_TO_DIGIT[word]) digits += WORD_TO_DIGIT[word];
    else if (/^\d$/.test(word)) digits += word;
  }
  const raw = text.replace(/\D/g, '');
  return digits.length >= raw.length ? digits : raw;
};

export const formatPhone = (d: string): string => {
  const c = d.replace(/\D/g, '').slice(0, 10);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0,3)}-${c.slice(3)}`;
  return `${c.slice(0,3)}-${c.slice(3,6)}-${c.slice(6)}`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════
const VoiceContext = createContext<VoiceContextType | null>(null);

export const useVoiceContext = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoiceContext must be inside VoiceProvider');
  return ctx;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════
export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<VoiceMode>('interactive');
  const [emotion, setEmotion] = useState<EmotionalState>('neutral');
  const [context, setContext] = useState('home');
  const [history, setHistory] = useState<string[]>([]);
  
  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const shouldListenRef = useRef(true);
  const handlersRef = useRef<{
    digit: ((d: string) => void) | null;
    command: ((c: string) => void) | null;
    dictation: ((t: string) => void) | null;
  }>({ digit: null, command: null, dictation: null });
  const navigationCallbackRef = useRef<((path: string) => void) | null>(null);
  
  // Get random emotional response
  const getEmotionalResponse = (state: EmotionalState) => {
    const responses = EMOTIONAL_RESPONSES[state];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  // Initialize speech recognition
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;
    
    recognition.onstart = () => {
      console.log('[MR.V] 🎤 LISTENING STARTED');
      setIsListening(true);
      setIsPaused(false);
      setError(null);
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      let conf = 0;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript?.trim() || '';
        conf = result[0]?.confidence || 0;
        
        if (result.isFinal) {
          final = text;
        } else {
          interim = text;
        }
      }
      
      if (interim) {
        setInterimTranscript(interim);
      }
      
      if (final) {
        console.log('[MR.V] 🗣️ HEARD:', final, `(${Math.round(conf * 100)}%)`);
        setTranscript(final);
        setInterimTranscript('');
        setConfidence(conf);
        setLastCommand(final);
        setHistory(prev => [...prev.slice(-9), final]);
        
        // Process the command
        processVoiceInput(final.toLowerCase());
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[MR.V] ⚠️ Error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Click the 🔒 icon to allow.');
        setIsListening(false);
        shouldListenRef.current = false;
      } else if (event.error === 'no-speech') {
        // Ignore, will auto-restart
      } else if (event.error === 'aborted') {
        // User stopped, don't auto-restart
      }
    };
    
    recognition.onend = () => {
      console.log('[MR.V] Recognition ended, shouldListen:', shouldListenRef.current, 'isPaused:', isPaused);
      if (shouldListenRef.current && !isPaused) {
        setTimeout(() => {
          if (shouldListenRef.current && recognitionRef.current) {
            try { 
              recognitionRef.current.start(); 
            } catch(e) {
              console.log('[MR.V] Restart error:', e);
            }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };
    
    // Auto-start after delay
    setTimeout(() => {
      if (shouldListenRef.current) {
        try { 
          recognition.start();
          console.log('[MR.V] 🚀 Auto-started');
        } catch(e) {
          console.log('[MR.V] Auto-start error:', e);
        }
      }
    }, 1000);
    
    return () => {
      shouldListenRef.current = false;
      try { recognition.stop(); } catch(e) {}
    };
  }, []);
  
  // Process voice input
  const processVoiceInput = useCallback((text: string) => {
    setIsProcessing(true);
    
    // Check for pause commands FIRST
    if (text.includes('hey') || text.includes('stop listening') || text.includes('pause') || text.includes('shut up')) {
      console.log('[MR.V] ⏸️ PAUSE command');
      shouldListenRef.current = false;
      setIsPaused(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      if (mode !== 'silent') {
        speak('Paused. Say resume or click the button to continue.', 'neutral');
      }
      setIsProcessing(false);
      return;
    }
    
    // Check for resume
    if (text.includes('resume') || text.includes('continue listening') || text.includes('start listening')) {
      console.log('[MR.V] ▶️ RESUME command');
      resume();
      setIsProcessing(false);
      return;
    }
    
    // Check for mode changes
    if (text.includes('interactive mode')) {
      setMode('interactive');
      speak("Interactive mode. I'll respond to your commands.", 'happy');
      setIsProcessing(false);
      return;
    }
    if (text.includes('talkative mode') || text.includes('talk more')) {
      setMode('talkative');
      speak("Talkative mode activated! I'll be more conversational and provide detailed guidance.", 'excited');
      setIsProcessing(false);
      return;
    }
    if (text.includes('silent mode') || text.includes('quiet mode') || text.includes('be quiet')) {
      setMode('silent');
      setIsProcessing(false);
      return;
    }
    
    // Check for navigation commands
    for (const [phrase, action] of Object.entries(NAV_COMMANDS)) {
      if (text.includes(phrase)) {
        console.log('[MR.V] 🧭 NAV:', action);
        if (handlersRef.current.command) {
          handlersRef.current.command(action);
        }
        if (navigationCallbackRef.current) {
          navigationCallbackRef.current(action);
        }
        setIsProcessing(false);
        return;
      }
    }
    
    // Extract digits if present
    const digits = extractDigits(text);
    if (digits && handlersRef.current.digit) {
      console.log('[MR.V] 📱 DIGITS:', digits);
      handlersRef.current.digit(digits);
    }
    
    // Send command to handler
    if (handlersRef.current.command) {
      handlersRef.current.command(text);
    }
    
    // Send dictation if it's longer text (not just digits or commands)
    if (text.length > 20 && !digits && handlersRef.current.dictation) {
      handlersRef.current.dictation(text);
    }
    
    setIsProcessing(false);
  }, [mode]);
  
  // Speak function with emotion
  const speak = useCallback((text: string, emotionState: EmotionalState = 'neutral', onComplete?: () => void) => {
    if (!text || !synthRef.current || mode === 'silent') {
      onComplete?.();
      return;
    }
    
    console.log('[MR.V] 🔊 Speaking:', text);
    setEmotion(emotionState);
    synthRef.current.cancel();
    
    // Pause recognition while speaking
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Adjust voice based on emotion
    switch (emotionState) {
      case 'happy':
      case 'excited':
        utterance.rate = 1.1;
        utterance.pitch = 1.1;
        break;
      case 'concerned':
        utterance.rate = 0.9;
        utterance.pitch = 0.9;
        break;
      case 'thinking':
        utterance.rate = 0.85;
        break;
      default:
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
    }
    
    utterance.volume = 1.0;
    
    // Get best voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = 
      voices.find(v => v.name.includes('Samantha')) ||
      voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices.find(v => v.lang.startsWith('en-US') && v.localService);
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setEmotion('neutral');
      onComplete?.();
      
      // Resume listening after speaking
      if (shouldListenRef.current && !isPaused && recognitionRef.current) {
        setTimeout(() => {
          try { recognitionRef.current?.start(); } catch(e) {}
        }, 200);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setEmotion('neutral');
      onComplete?.();
    };
    
    synthRef.current.speak(utterance);
  }, [mode, isListening, isPaused]);
  
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
    setEmotion('neutral');
  }, []);
  
  const startListening = useCallback(() => {
    shouldListenRef.current = true;
    setIsPaused(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch(e) {}
    }
  }, []);
  
  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIsListening(false);
  }, []);
  
  const pause = useCallback(() => {
    console.log('[MR.V] ⏸️ Pausing...');
    shouldListenRef.current = false;
    setIsPaused(true);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  }, []);
  
  const resume = useCallback(() => {
    console.log('[MR.V] ▶️ Resuming...');
    shouldListenRef.current = true;
    setIsPaused(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch(e) {}
    }
    if (mode !== 'silent') {
      speak("I'm listening.", 'neutral');
    }
  }, [mode, speak]);
  
  const registerHandler = useCallback((type: 'digit' | 'command' | 'dictation', handler: (data: string) => void) => {
    handlersRef.current[type] = handler;
  }, []);
  
  const unregisterHandlers = useCallback(() => {
    handlersRef.current = { digit: null, command: null, dictation: null };
  }, []);
  
  const processCommand = useCallback((command: string) => {
    processVoiceInput(command.toLowerCase());
  }, [processVoiceInput]);
  
  const value: VoiceContextType = {
    isListening, isSpeaking, isPaused, isProcessing,
    transcript, interimTranscript, lastCommand, confidence,
    error, mode, emotion, context, history,
    speak, stopSpeaking, startListening, stopListening,
    pause, resume, setMode, setContext, processCommand,
    registerHandler, unregisterHandlers
  };
  
  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

export default VoiceContext;
