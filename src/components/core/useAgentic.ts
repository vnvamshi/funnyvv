/**
 * useAgentic - THE core hook for all agentic features
 * 
 * Provides:
 * - Speech recognition (listening)
 * - Text-to-speech (speaking)
 * - Form field extraction
 * - Command processing
 * - Backend integration
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface AgenticConfig {
  context?: string;
  autoStart?: boolean;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onCommand?: (command: string, intent: string) => void;
  onFormData?: (fields: Record<string, string>) => void;
  onStateChange?: (state: AgenticState) => void;
}

type AgenticState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface AgenticReturn {
  state: AgenticState;
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  speak: (text: string) => Promise<void>;
  processText: (text: string) => Promise<any>;
  fillField: (selector: string, value: string, animate?: boolean) => Promise<void>;
}

// Singleton recognition instance
let globalRecognition: SpeechRecognition | null = null;
let globalSynth: SpeechSynthesis | null = null;

export function useAgentic(config: AgenticConfig = {}): AgenticReturn {
  const {
    context = 'general',
    autoStart = false,
    onTranscript,
    onCommand,
    onFormData,
    onStateChange
  } = config;

  const [state, setState] = useState<AgenticState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const shouldRunRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const contextRef = useRef(context);
  
  // Update context ref
  useEffect(() => { contextRef.current = context; }, [context]);

  // Initialize speech services
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    globalSynth = window.speechSynthesis;
    
    if (!globalRecognition) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        globalRecognition = new SR();
        globalRecognition.continuous = true;
        globalRecognition.interimResults = true;
        globalRecognition.lang = 'en-US';
      }
    }
    
    if (autoStart) {
      setTimeout(() => start(), 500);
    }
    
    return () => {
      shouldRunRef.current = false;
    };
  }, []);

  // Setup recognition handlers
  useEffect(() => {
    if (!globalRecognition) return;

    const handleStart = () => {
      updateState('listening');
    };

    const handleResult = async (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }

      setInterimTranscript(interim);
      onTranscript?.(interim, false);

      if (final.trim()) {
        setTranscript(final.trim());
        setInterimTranscript('');
        onTranscript?.(final.trim(), true);
        await processText(final.trim());
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      console.error('[useAgentic] Recognition error:', event.error);
      updateState('error');
    };

    const handleEnd = () => {
      if (shouldRunRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (shouldRunRef.current && !isSpeakingRef.current) {
            safeStart();
          }
        }, 300);
      } else {
        updateState('idle');
      }
    };

    globalRecognition.onstart = handleStart;
    globalRecognition.onresult = handleResult;
    globalRecognition.onerror = handleError;
    globalRecognition.onend = handleEnd;
  }, [onTranscript]);

  const updateState = useCallback((newState: AgenticState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  const safeStart = useCallback(() => {
    if (!globalRecognition) return;
    try {
      globalRecognition.start();
    } catch (e) {
      // Already started
    }
  }, []);

  const start = useCallback(() => {
    globalSynth?.cancel();
    isSpeakingRef.current = false;
    shouldRunRef.current = true;
    updateState('listening');
    safeStart();
  }, [safeStart, updateState]);

  const stop = useCallback(() => {
    shouldRunRef.current = false;
    try {
      globalRecognition?.stop();
    } catch {}
    globalSynth?.cancel();
    updateState('idle');
  }, [updateState]);

  const toggle = useCallback(() => {
    if (shouldRunRef.current) stop();
    else start();
  }, [start, stop]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!globalSynth || !text) return;
    
    return new Promise((resolve) => {
      const wasRunning = shouldRunRef.current;
      isSpeakingRef.current = true;
      
      // Stop listening while speaking
      if (shouldRunRef.current) {
        try { globalRecognition?.stop(); } catch {}
      }
      
      globalSynth!.cancel();
      updateState('speaking');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        isSpeakingRef.current = false;
        updateState('idle');
        
        if (wasRunning) {
          shouldRunRef.current = true;
          setTimeout(() => safeStart(), 300);
        }
        resolve();
      };
      
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        updateState('idle');
        resolve();
      };
      
      globalSynth!.speak(utterance);
    });
  }, [safeStart, updateState]);

  const processText = useCallback(async (text: string): Promise<any> => {
    updateState('processing');
    
    try {
      const response = await fetch('http://localhost:1117/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          context: contextRef.current,
          user_type: 'user'
        })
      });
      
      const data = await response.json();
      
      // Handle intent/command
      if (data.analysis?.intent) {
        onCommand?.(text, data.analysis.intent);
      }
      
      // Handle form data
      if (data.formData?.fields && Object.keys(data.formData.fields).length > 0) {
        onFormData?.(data.formData.fields);
      }
      
      // Speak response
      if (data.response?.text && data.response?.speak !== false) {
        await speak(data.response.text);
      } else {
        updateState(shouldRunRef.current ? 'listening' : 'idle');
      }
      
      return data;
    } catch (err) {
      console.error('[useAgentic] Process error:', err);
      updateState(shouldRunRef.current ? 'listening' : 'idle');
      return null;
    }
  }, [onCommand, onFormData, speak, updateState]);

  const fillField = useCallback(async (
    selector: string, 
    value: string, 
    animate: boolean = true
  ): Promise<void> => {
    const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    if (!element) {
      console.warn('[useAgentic] Element not found:', selector);
      return;
    }
    
    element.focus();
    element.classList.add('agentic-filling');
    
    if (animate) {
      // Typewriter effect
      element.value = '';
      for (let i = 0; i <= value.length; i++) {
        element.value = value.substring(0, i);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 25));
      }
    } else {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    element.classList.remove('agentic-filling');
    element.classList.add('agentic-filled');
    setTimeout(() => element.classList.remove('agentic-filled'), 1000);
  }, []);

  return {
    state,
    transcript,
    interimTranscript,
    isListening: state === 'listening',
    isSpeaking: state === 'speaking',
    isProcessing: state === 'processing',
    start,
    stop,
    toggle,
    speak,
    processText,
    fillField
  };
}

export default useAgentic;
