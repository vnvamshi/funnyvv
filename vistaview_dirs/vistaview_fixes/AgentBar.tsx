// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - UNIFIED AGENT BAR v4.0
// Persistent teleprompter + STT/TTS + back/close/stop on EVERY page
// ═══════════════════════════════════════════════════════════════════════════════
//
// CORE PRINCIPLES:
// ✅ One persistent Agent Bar on every page, modal, and subpage
// ✅ Teleprompter shows what Mr. V is saying (real-time)
// ✅ STT shows what user is saying (real-time)
// ✅ Back/Close/Stop buttons always visible
// ✅ "Hey Mr V" pauses and waits for command
// ✅ Navigation stack supports go back everywhere
//
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// THEME & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const THEME = {
  teal: '#004236',
  tealLight: '#007E67',
  gold: '#B8860B',
  goldLight: '#F5EC9B',
  white: '#FFFFFF',
  dark: '#001a15'
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface NavigationItem {
  type: 'page' | 'modal' | 'step';
  name: string;
  path?: string;
  data?: any;
}

interface AgentBarContextType {
  // State
  isSpeaking: boolean;
  isListening: boolean;
  isPaused: boolean;
  teleprompterText: string;
  userTranscript: string;
  navigationStack: NavigationItem[];
  currentModal: string | null;
  
  // Actions
  speak: (text: string, onDone?: () => void) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  
  // Navigation
  pushNavigation: (item: NavigationItem) => void;
  popNavigation: () => NavigationItem | null;
  goBack: () => void;
  closeModal: () => void;
  
  // Modal control
  openModal: (modalName: string, data?: any) => void;
  setCurrentModal: (name: string | null) => void;
  
  // Voice command handler
  onVoiceCommand: (handler: (cmd: string) => boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════
const AgentBarContext = createContext<AgentBarContextType | null>(null);

export const useAgentBar = () => {
  const context = useContext(AgentBarContext);
  if (!context) {
    throw new Error('useAgentBar must be used within AgentBarProvider');
  }
  return context;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════
interface AgentBarProviderProps {
  children: React.ReactNode;
  onNavigate?: (path: string) => void;
  onOpenModal?: (name: string, data?: any) => void;
  onCloseModal?: () => void;
}

export const AgentBarProvider: React.FC<AgentBarProviderProps> = ({
  children,
  onNavigate,
  onOpenModal,
  onCloseModal
}) => {
  // Core state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState("Hello! I'm Mr. V, your AI assistant.");
  const [userTranscript, setUserTranscript] = useState('');
  
  // Navigation state
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);
  const [currentModal, setCurrentModal] = useState<string | null>(null);
  
  // Refs
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const commandHandlerRef = useRef<((cmd: string) => boolean) | null>(null);
  const isListeningRef = useRef(false);
  const onDoneCallbackRef = useRef<(() => void) | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    initSpeechRecognition();
    
    return () => {
      synthRef.current?.cancel();
      try { recognitionRef.current?.stop(); } catch(e) {}
    };
  }, []);

  const initSpeechRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      setUserTranscript(transcript);

      if (result.isFinal) {
        handleVoiceCommand(transcript);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 100);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && isListeningRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 500);
      }
    };

    recognitionRef.current = recognition;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE COMMAND HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  const handleVoiceCommand = useCallback((text: string) => {
    const cmd = text.toLowerCase().trim();
    
    // Universal commands - always handled
    
    // PAUSE: "hey", "hey mr v", "wait", "hold on"
    if (cmd.match(/^(hey|hey mr\.? ?v|wait|hold on|one second)$/i) || 
        (cmd.includes('hey') && (cmd.includes('mr') || cmd.includes('vista')))) {
      pause();
      speak("Yes? I'm listening. What would you like me to do?");
      return;
    }
    
    // STOP speaking
    if (cmd.match(/^(stop|quiet|silence|shut up)$/i)) {
      stop();
      setTeleprompterText("Stopped. I'm listening...");
      return;
    }
    
    // RESUME
    if (cmd.match(/^(continue|go on|resume|proceed|go ahead|okay)$/i) && isPaused) {
      resume();
      return;
    }
    
    // GO BACK
    if (cmd.match(/^(go back|back|previous|return)$/i)) {
      goBack();
      return;
    }
    
    // CLOSE
    if (cmd.match(/^(close|exit|cancel|dismiss)$/i)) {
      closeModal();
      return;
    }
    
    // Pass to registered command handler (modal/page specific)
    if (commandHandlerRef.current) {
      const handled = commandHandlerRef.current(cmd);
      if (handled) return;
    }
    
    // Default: acknowledge
    setTeleprompterText(`I heard: "${text}". Try saying a command like "go back" or "close".`);
  }, [isPaused]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SPEECH SYNTHESIS
  // ═══════════════════════════════════════════════════════════════════════════
  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!synthRef.current) {
      setTeleprompterText(text);
      onDone?.();
      return;
    }

    synthRef.current.cancel();
    setTeleprompterText(text);
    setIsSpeaking(true);
    stopListening();
    
    onDoneCallbackRef.current = onDone || null;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    
    // Try to get US English voice
    const voices = synthRef.current.getVoices();
    const usVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google'));
    if (usVoice) utterance.voice = usVoice;

    utterance.onend = () => {
      setIsSpeaking(false);
      if (!isPaused) startListening();
      onDoneCallbackRef.current?.();
      onDoneCallbackRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (!isPaused) startListening();
    };

    synthRef.current.speak(utterance);
  }, [isPaused]);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTENING CONTROL
  // ═══════════════════════════════════════════════════════════════════════════
  const startListening = useCallback(() => {
    isListeningRef.current = true;
    setIsListening(true);
    try { recognitionRef.current?.start(); } catch (e) {}
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    try { recognitionRef.current?.stop(); } catch (e) {}
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAUSE/RESUME
  // ═══════════════════════════════════════════════════════════════════════════
  const pause = useCallback(() => {
    stop();
    setIsPaused(true);
    startListening();
  }, [stop, startListening]);

  const resume = useCallback(() => {
    setIsPaused(false);
    speak("Alright, continuing! What would you like to do next?");
  }, [speak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION STACK
  // ═══════════════════════════════════════════════════════════════════════════
  const pushNavigation = useCallback((item: NavigationItem) => {
    setNavigationStack(prev => [...prev, item]);
  }, []);

  const popNavigation = useCallback((): NavigationItem | null => {
    let popped: NavigationItem | null = null;
    setNavigationStack(prev => {
      if (prev.length === 0) return prev;
      popped = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return popped;
  }, []);

  const goBack = useCallback(() => {
    const item = popNavigation();
    
    if (currentModal) {
      // If in a modal, close it first
      closeModal();
      speak("Going back.");
      return;
    }
    
    if (item) {
      if (item.type === 'page' && item.path && onNavigate) {
        speak(`Going back to ${item.name}.`);
        onNavigate(item.path);
      } else if (item.type === 'modal' && item.name && onOpenModal) {
        speak(`Going back to ${item.name}.`);
        onOpenModal(item.name, item.data);
      }
    } else {
      speak("You're at the beginning. There's nowhere to go back to.");
    }
  }, [currentModal, popNavigation, onNavigate, onOpenModal, speak]);

  const closeModal = useCallback(() => {
    if (currentModal) {
      setCurrentModal(null);
      onCloseModal?.();
      speak("Closed.");
    }
  }, [currentModal, onCloseModal, speak]);

  const openModal = useCallback((modalName: string, data?: any) => {
    // Push current state to navigation stack
    if (currentModal) {
      pushNavigation({ type: 'modal', name: currentModal });
    }
    setCurrentModal(modalName);
    onOpenModal?.(modalName, data);
  }, [currentModal, pushNavigation, onOpenModal]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMAND HANDLER REGISTRATION
  // ═══════════════════════════════════════════════════════════════════════════
  const onVoiceCommand = useCallback((handler: (cmd: string) => boolean) => {
    commandHandlerRef.current = handler;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-START LISTENING
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Start listening after a short delay
    const timeout = setTimeout(() => {
      startListening();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [startListening]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════════════════════════════
  const contextValue: AgentBarContextType = {
    isSpeaking,
    isListening,
    isPaused,
    teleprompterText,
    userTranscript,
    navigationStack,
    currentModal,
    speak,
    stop,
    pause,
    resume,
    pushNavigation,
    popNavigation,
    goBack,
    closeModal,
    openModal,
    setCurrentModal,
    onVoiceCommand
  };

  return (
    <AgentBarContext.Provider value={contextValue}>
      {children}
    </AgentBarContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT BAR UI COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
interface AgentBarProps {
  position?: 'top' | 'bottom';
  variant?: 'full' | 'compact';
  showStats?: boolean;
}

export const AgentBar: React.FC<AgentBarProps> = ({
  position = 'bottom',
  variant = 'full',
  showStats = false
}) => {
  const {
    isSpeaking,
    isListening,
    isPaused,
    teleprompterText,
    userTranscript,
    navigationStack,
    goBack,
    closeModal,
    stop,
    pause,
    resume,
    currentModal
  } = useAgentBar();

  const canGoBack = navigationStack.length > 0 || currentModal !== null;

  return (
    <div
      style={{
        position: 'fixed',
        [position]: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: `linear-gradient(135deg, ${THEME.teal}f5, ${THEME.dark}f5)`,
        borderTop: position === 'bottom' ? `2px solid ${THEME.gold}` : 'none',
        borderBottom: position === 'top' ? `2px solid ${THEME.gold}` : 'none',
        padding: variant === 'compact' ? '8px 16px' : '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Status Indicator */}
      <div
        style={{
          width: variant === 'compact' ? '36px' : '44px',
          height: variant === 'compact' ? '36px' : '44px',
          borderRadius: '50%',
          background: isPaused 
            ? '#f59e0b' 
            : isSpeaking 
              ? THEME.gold 
              : isListening 
                ? '#22c55e' 
                : 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: variant === 'compact' ? '18px' : '22px',
          transition: 'all 0.3s ease',
          boxShadow: isSpeaking || isListening ? '0 0 15px currentColor' : 'none'
        }}
      >
        {isPaused ? '⏸️' : isSpeaking ? '🗣️' : isListening ? '👂' : '🤖'}
      </div>

      {/* Teleprompter */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mr. V text */}
        <div
          style={{
            color: isSpeaking ? THEME.goldLight : THEME.white,
            fontSize: variant === 'compact' ? '13px' : '14px',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: variant === 'compact' ? 'nowrap' : 'normal',
            maxHeight: variant === 'compact' ? '20px' : '40px',
            fontWeight: isSpeaking ? 600 : 400
          }}
        >
          <span style={{ color: THEME.gold, fontWeight: 700, marginRight: '6px' }}>MR. V:</span>
          {teleprompterText}
        </div>
        
        {/* User transcript (when listening) */}
        {isListening && userTranscript && variant !== 'compact' && (
          <div
            style={{
              color: '#22c55e',
              fontSize: '12px',
              marginTop: '4px',
              opacity: 0.9
            }}
          >
            <span style={{ fontWeight: 600 }}>YOU:</span> "{userTranscript}"
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {/* Back Button */}
        <button
          onClick={goBack}
          disabled={!canGoBack}
          style={{
            padding: variant === 'compact' ? '6px 12px' : '8px 16px',
            background: canGoBack ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            color: canGoBack ? THEME.white : '#666',
            border: `1px solid ${canGoBack ? THEME.gold + '60' : 'transparent'}`,
            borderRadius: '20px',
            cursor: canGoBack ? 'pointer' : 'not-allowed',
            fontSize: variant === 'compact' ? '12px' : '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          ← Back
        </button>

        {/* Stop/Pause/Resume Button */}
        <button
          onClick={() => {
            if (isSpeaking) stop();
            else if (isPaused) resume();
            else pause();
          }}
          style={{
            padding: variant === 'compact' ? '6px 12px' : '8px 16px',
            background: isPaused 
              ? '#f59e0b' 
              : isSpeaking 
                ? '#ef4444' 
                : 'rgba(255,255,255,0.15)',
            color: THEME.white,
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: variant === 'compact' ? '12px' : '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          {isSpeaking ? '⏹ Stop' : isPaused ? '▶️ Resume' : '⏸ Pause'}
        </button>

        {/* Close Button */}
        {currentModal && (
          <button
            onClick={closeModal}
            style={{
              padding: variant === 'compact' ? '6px 12px' : '8px 16px',
              background: 'rgba(239,68,68,0.2)',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: variant === 'compact' ? '12px' : '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Listening Indicator */}
      {isListening && !isPaused && (
        <div
          style={{
            position: 'absolute',
            top: position === 'bottom' ? '-2px' : 'auto',
            bottom: position === 'top' ? '-2px' : 'auto',
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, #22c55e, transparent)`,
            animation: 'pulse 1.5s infinite'
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AgentBar;
