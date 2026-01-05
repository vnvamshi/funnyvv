import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';

// ============================================================================
// VISTAVIEW - Voice-First Real Estate Intelligence Platform
// Core: Agent Bar (Mr. V) + Role-Based Flows + Vendor Onboarding
// ============================================================================

// Global Navigation Context for "go back / close / stop" everywhere
const NavigationContext = createContext();

const useNavigation = () => useContext(NavigationContext);

// Agent Context for Mr. V's state and voice capabilities
const AgentContext = createContext();

const useAgent = () => useContext(AgentContext);

// ============================================================================
// NAVIGATION PROVIDER - Stack-based navigation with full history
// ============================================================================
const NavigationProvider = ({ children }) => {
  const [stack, setStack] = useState([{ page: 'home', data: null }]);
  const [history, setHistory] = useState([]);

  const navigate = useCallback((page, data = null) => {
    setHistory(prev => [...prev, stack[stack.length - 1]]);
    setStack(prev => [...prev, { page, data }]);
  }, [stack]);

  const goBack = useCallback(() => {
    if (stack.length > 1) {
      const newStack = [...stack];
      const popped = newStack.pop();
      setStack(newStack);
      return popped;
    }
    return null;
  }, [stack]);

  const close = useCallback(() => {
    setStack([{ page: 'home', data: null }]);
    setHistory([]);
  }, []);

  const currentPage = stack[stack.length - 1];
  const canGoBack = stack.length > 1;

  return (
    <NavigationContext.Provider value={{ 
      currentPage, 
      navigate, 
      goBack, 
      close, 
      canGoBack, 
      stack,
      history 
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

// ============================================================================
// AGENT PROVIDER - Mr. V's AI capabilities and voice control
// ============================================================================
const AgentProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  const [agentMode, setAgentMode] = useState('idle'); // idle, listening, speaking, guiding, walking
  const [currentStep, setCurrentStep] = useState(null);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const speechRef = useRef(null);

  // Text-to-Speech
  const speak = useCallback((text, onComplete) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('Google') || v.name.includes('English')) || null;
      
      setIsSpeaking(true);
      setAgentMode('speaking');
      setAgentMessage(text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setAgentMode('idle');
        onComplete?.();
      };
      
      window.speechSynthesis.speak(utterance);
      speechRef.current = utterance;
    }
  }, []);

  // Stop everything
  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsListening(false);
    setIsSpeaking(false);
    setAgentMode('idle');
    setAgentMessage('');
    setHighlightedElement(null);
  }, []);

  // Guide user through a flow
  const guideStep = useCallback((stepId, element, message) => {
    setCurrentStep(stepId);
    setHighlightedElement(element);
    setAgentMode('guiding');
    speak(message);
  }, [speak]);

  // Walk to element (visual indicator)
  const walkTo = useCallback((element, message) => {
    setAgentMode('walking');
    setHighlightedElement(element);
    setTimeout(() => {
      setAgentMode('guiding');
      if (message) speak(message);
    }, 800);
  }, [speak]);

  return (
    <AgentContext.Provider value={{
      isListening,
      setIsListening,
      isSpeaking,
      transcript,
      setTranscript,
      agentMessage,
      setAgentMessage,
      agentMode,
      setAgentMode,
      currentStep,
      highlightedElement,
      speak,
      stop,
      guideStep,
      walkTo
    }}>
      {children}
    </AgentContext.Provider>
  );
};

// ============================================================================
// AGENT BAR - Persistent teleprompter + STT/TTS + navigation controls
// ============================================================================
const AgentBar = () => {
  const { canGoBack, goBack, close } = useNavigation();
  const { 
    isListening, 
    setIsListening, 
    isSpeaking, 
    agentMessage, 
    agentMode, 
    stop,
    transcript 
  } = useAgent();

  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p