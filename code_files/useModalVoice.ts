// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - SHARED MODAL VOICE HOOK v2.2
// Provides: voice recognition, speech, walking cursor, pause on "hey"
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseModalVoiceOptions {
  onCommand: (cmd: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const useModalVoice = ({ onCommand, onClose, isOpen }: UseModalVoiceOptions) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!SR) return;
    
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
        
        // Check for "hey Mr V" or similar - pause and wait
        if (cmd.includes('hey') || cmd.includes('mr v') || cmd.includes('mr. v') || cmd.includes('mister v')) {
          handlePauseAndWait();
          return;
        }
        
        // Check for stop/pause
        if (cmd.includes('stop') || cmd.includes('pause')) {
          stop();
          return;
        }
        
        // Check for close/exit
        if (cmd.includes('close') || cmd.includes('exit')) {
          stop();
          onClose();
          return;
        }
        
        // Pass to parent command handler
        onCommand(cmd);
      }
    };
    
    recognition.onend = () => {
      if (isListening && isOpen && !isPaused) {
        try { recognition.start(); } catch(e) {}
      }
    };
    
    recRef.current = recognition;
    
    return () => {
      try { recognition.stop(); } catch(e) {}
    };
  }, [isOpen, isListening, isPaused, onCommand, onClose]);

  // Start/stop on modal open/close
  useEffect(() => {
    if (isOpen) {
      setIsListening(true);
      setIsPaused(false);
      try { recRef.current?.start(); } catch(e) {}
    } else {
      setIsListening(false);
      setIsPaused(false);
      try { recRef.current?.stop(); } catch(e) {}
      stop();
    }
  }, [isOpen]);

  // Handle "hey Mr V" - pause and wait for command
  const handlePauseAndWait = useCallback(() => {
    stop();
    setIsPaused(true);
    speak("Yes? I'm listening. What would you like me to do?");
    
    // Clear any existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    // Resume after 10 seconds of no command
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      speak("Alright, continuing. Just say 'hey Mr V' anytime you need me!");
    }, 10000);
  }, []);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    stop();
    setDisplayText(text);
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, []);

  // Stop speaking
  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // Walk cursor to target
  const walkTo = useCallback((targetId: string, targetElement?: HTMLElement) => {
    setWalkingTo(targetId);
    
    // Animate cursor position if element provided
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const containerRect = targetElement.closest('.modal-content')?.getBoundingClientRect();
      
      if (containerRect) {
        const x = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
        const y = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;
        setCursorPosition({ x, y });
      }
    }
    
    // Clear walking state after animation
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setWalkingTo(null);
        resolve();
      }, 1000);
    });
  }, []);

  return {
    isSpeaking,
    isListening,
    isPaused,
    transcript,
    displayText,
    walkingTo,
    cursorPosition,
    speak,
    stop,
    walkTo,
    setIsPaused
  };
};

export default useModalVoice;
