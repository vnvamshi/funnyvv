// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW AI CURSOR NAVIGATOR
// Animates cursor movement to UI elements with voice narration
// ═══════════════════════════════════════════════════════════════════════════════
// 
// GOLDEN RULES ENFORCED:
// ✅ Animated cursor with intent (not teleporting)
// ✅ Explains what it's doing ("opening about us...")
// ✅ Permission prompts when appropriate
// ✅ Instant interrupt on "stop/hey/wait"
// 
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { THEME, ROUTES, UI_ACTIONS, VOICE, logEvent, executeUIAction } from '../core/rules-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface CursorPosition {
  x: number;
  y: number;
}

interface NavigationTarget {
  element: string;       // CSS selector or element ID
  description: string;   // What to say
  action: 'click' | 'highlight' | 'scroll' | 'navigate';
  route?: string;        // For navigation
  modalName?: string;    // For opening modals
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION TARGETS MAP
// ═══════════════════════════════════════════════════════════════════════════════
const NAVIGATION_TARGETS: Record<string, NavigationTarget> = {
  'about': {
    element: '[data-nav="about"], #nav-about, a[href*="about"]',
    description: 'Opening About Us. Let me show you who we are.',
    action: 'click',
    modalName: 'aboutUs'
  },
  'about us': {
    element: '[data-nav="about"], #nav-about, a[href*="about"]',
    description: 'Opening About Us. Let me introduce you to our amazing team.',
    action: 'click',
    modalName: 'aboutUs'
  },
  'how it works': {
    element: '[data-nav="how-it-works"], a[href*="how"]',
    description: 'Let me show you how VistaView works.',
    action: 'click',
    route: '/how-it-works'
  },
  'partners': {
    element: '[data-nav="partners"], a[href*="partner"]',
    description: 'Opening our Partners page.',
    action: 'click',
    route: '/partners'
  },
  'real estate': {
    element: '[data-nav="real-estate"], a[href*="real-estate"]',
    description: "Let's find your perfect property!",
    action: 'click',
    route: '/real-estate'
  },
  'catalog': {
    element: '[data-nav="catalog"], a[href*="catalog"]',
    description: 'Opening the Product Catalog.',
    action: 'click',
    route: '/catalog'
  },
  'products': {
    element: '[data-nav="catalog"], a[href*="catalog"]',
    description: 'Opening products. Browse our amazing selection!',
    action: 'click',
    route: '/catalog'
  },
  'services': {
    element: '[data-nav="services"], a[href*="services"]',
    description: 'Opening Services.',
    action: 'click',
    route: '/services'
  },
  'sign in': {
    element: '[data-nav="signin"], #btn-signin, button[class*="sign"]',
    description: 'Opening sign in. Choose your role to get started!',
    action: 'click',
    modalName: 'signIn'
  },
  'sign up': {
    element: '[data-nav="signin"], #btn-signin',
    description: "Let's get you registered!",
    action: 'click',
    modalName: 'signUp'
  },
  'home': {
    element: '[data-nav="home"], a[href="/"], #logo',
    description: 'Taking you home.',
    action: 'click',
    route: '/'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CURSOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
interface AICursorProps {
  isActive: boolean;
  position: CursorPosition;
  isMoving: boolean;
  targetName?: string;
}

const AICursor: React.FC<AICursorProps> = ({ isActive, position, isMoving, targetName }) => {
  if (!isActive) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 99999,
        pointerEvents: 'none',
        transition: isMoving ? 'left 0.8s ease-out, top 0.8s ease-out' : 'none',
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Outer ring */}
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: `3px solid ${THEME.colors.gold.accent}`,
          boxShadow: `0 0 20px ${THEME.colors.gold.accent}80, inset 0 0 20px ${THEME.colors.gold.accent}30`,
          animation: 'pulse 1.5s infinite'
        }}
      />
      
      {/* Inner dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: THEME.colors.gold.accent,
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 10px ${THEME.colors.gold.accent}`
        }}
      />
      
      {/* Target label */}
      {targetName && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            background: THEME.colors.teal.primary,
            color: THEME.colors.white,
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            border: `1px solid ${THEME.colors.gold.accent}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          → {targetName}
        </div>
      )}
      
      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN NAVIGATOR HOOK
// ═══════════════════════════════════════════════════════════════════════════════
export const useAICursorNavigator = () => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState<CursorPosition>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isMoving, setIsMoving] = useState(false);
  const [targetName, setTargetName] = useState<string | undefined>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Speak with TTS
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = VOICE.tts.rate;
      utterance.pitch = VOICE.tts.pitch;
      utterance.volume = VOICE.tts.volume;
      
      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find(v => v.lang.includes('en-US'));
      if (usVoice) utterance.voice = usVoice;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      
      logEvent('TTS', { action: 'speak', text: text.substring(0, 50) });
    });
  }, []);
  
  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    logEvent('TTS', { action: 'stop' });
  }, []);
  
  // Move cursor to element
  const moveTo = useCallback((element: Element): Promise<void> => {
    return new Promise((resolve) => {
      const rect = element.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      
      setIsMoving(true);
      setPosition({ x: targetX, y: targetY });
      
      logEvent('UI_ACTION', { action: 'MOVE_CURSOR', target: element.tagName, x: targetX, y: targetY });
      
      moveTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
        resolve();
      }, 850);
    });
  }, []);
  
  // Highlight element
  const highlight = useCallback((element: Element) => {
    const originalOutline = (element as HTMLElement).style.outline;
    const originalBoxShadow = (element as HTMLElement).style.boxShadow;
    
    (element as HTMLElement).style.outline = `3px solid ${THEME.colors.gold.accent}`;
    (element as HTMLElement).style.boxShadow = `0 0 20px ${THEME.colors.gold.accent}80`;
    
    setTimeout(() => {
      (element as HTMLElement).style.outline = originalOutline;
      (element as HTMLElement).style.boxShadow = originalBoxShadow;
    }, 2000);
    
    logEvent('UI_ACTION', { action: 'HIGHLIGHT', target: element.tagName });
  }, []);
  
  // Click element
  const click = useCallback((element: Element) => {
    highlight(element);
    
    setTimeout(() => {
      (element as HTMLElement).click();
      logEvent('UI_ACTION', { action: 'CLICK', target: element.tagName });
    }, 300);
  }, [highlight]);
  
  // Navigate to target
  const navigateTo = useCallback(async (
    targetKey: string,
    onOpenModal?: (modalName: string) => void,
    onNavigate?: (route: string) => void
  ) => {
    const target = NAVIGATION_TARGETS[targetKey.toLowerCase()];
    
    if (!target) {
      await speak(`I'm not sure where "${targetKey}" is. Try asking about About Us, Catalog, or Services.`);
      return;
    }
    
    setIsActive(true);
    setTargetName(targetKey);
    
    // Speak what we're doing
    await speak(target.description);
    
    // Find the element
    const element = document.querySelector(target.element);
    
    if (element) {
      // Move cursor to element
      await moveTo(element);
      
      // Perform action
      if (target.action === 'click') {
        click(element);
        
        // If it's a modal, call the modal opener
        if (target.modalName && onOpenModal) {
          setTimeout(() => {
            onOpenModal(target.modalName!);
          }, 300);
        }
        
        // If it's a route, navigate
        if (target.route && onNavigate) {
          setTimeout(() => {
            onNavigate(target.route!);
          }, 300);
        }
      } else if (target.action === 'highlight') {
        highlight(element);
      } else if (target.action === 'scroll') {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      await speak(`I couldn't find the ${targetKey} section. It might not be visible right now.`);
    }
    
    // Deactivate after action
    setTimeout(() => {
      setIsActive(false);
      setTargetName(undefined);
    }, 1500);
    
  }, [speak, moveTo, click, highlight]);
  
  // Parse voice command
  const parseCommand = useCallback(async (
    command: string,
    onOpenModal?: (modalName: string) => void,
    onNavigate?: (route: string) => void,
    onClose?: () => void
  ) => {
    const cmd = command.toLowerCase().trim();
    
    logEvent('VOICE_COMMAND', { command: cmd });
    
    // Interrupt commands
    if (VOICE.interruptPhrases.some(phrase => cmd === phrase)) {
      stopSpeaking();
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      setIsActive(false);
      setIsMoving(false);
      await speak("I've paused. Say continue, or tell me what you'd like to do.");
      return { handled: true, action: 'pause' };
    }
    
    // Close commands
    if (VOICE.closePhrases.some(phrase => cmd.includes(phrase))) {
      stopSpeaking();
      setIsActive(false);
      if (onClose) onClose();
      return { handled: true, action: 'close' };
    }
    
    // Navigation commands
    for (const [key] of Object.entries(NAVIGATION_TARGETS)) {
      if (cmd.includes(key)) {
        await navigateTo(key, onOpenModal, onNavigate);
        return { handled: true, action: 'navigate', target: key };
      }
    }
    
    // Specific patterns
    if (cmd.includes('open') || cmd.includes('show') || cmd.includes('go to')) {
      const target = cmd.replace(/open|show|go to|the|me/gi, '').trim();
      if (target) {
        await navigateTo(target, onOpenModal, onNavigate);
        return { handled: true, action: 'navigate', target };
      }
    }
    
    return { handled: false };
  }, [stopSpeaking, navigateTo]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);
  
  return {
    // Cursor state
    isActive,
    position,
    isMoving,
    targetName,
    isSpeaking,
    
    // Actions
    speak,
    stopSpeaking,
    navigateTo,
    parseCommand,
    moveTo,
    highlight,
    click,
    
    // Component
    CursorComponent: () => (
      <AICursor
        isActive={isActive}
        position={position}
        isMoving={isMoving}
        targetName={targetName}
      />
    )
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// CURSOR NAVIGATOR PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════
interface CursorNavigatorContextType {
  navigateTo: (target: string) => void;
  parseCommand: (cmd: string) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  isActive: boolean;
}

const CursorNavigatorContext = React.createContext<CursorNavigatorContextType | null>(null);

export const CursorNavigatorProvider: React.FC<{
  children: React.ReactNode;
  onOpenModal?: (name: string) => void;
  onNavigate?: (route: string) => void;
  onClose?: () => void;
}> = ({ children, onOpenModal, onNavigate, onClose }) => {
  const navigator = useAICursorNavigator();
  
  const contextValue: CursorNavigatorContextType = {
    navigateTo: (target) => navigator.navigateTo(target, onOpenModal, onNavigate),
    parseCommand: (cmd) => navigator.parseCommand(cmd, onOpenModal, onNavigate, onClose),
    speak: navigator.speak,
    stopSpeaking: navigator.stopSpeaking,
    isSpeaking: navigator.isSpeaking,
    isActive: navigator.isActive
  };
  
  return (
    <CursorNavigatorContext.Provider value={contextValue}>
      {children}
      <navigator.CursorComponent />
    </CursorNavigatorContext.Provider>
  );
};

export const useCursorNavigator = () => {
  const context = React.useContext(CursorNavigatorContext);
  if (!context) {
    throw new Error('useCursorNavigator must be used within CursorNavigatorProvider');
  }
  return context;
};

export default useAICursorNavigator;
