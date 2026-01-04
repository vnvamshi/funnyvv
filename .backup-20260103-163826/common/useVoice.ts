// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VOICE HOOK
// Speech recognition + synthesis for all modals
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceOptions {
  onCommand?: (cmd: string) => void;
  autoStart?: boolean;
}

export const useVoice = ({ onCommand, autoStart = true }: UseVoiceOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

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

        // "Hey" triggers pause
        if (cmd.includes('hey') || cmd.includes('mr v') || cmd.includes('mister v')) {
          handlePause();
          return;
        }

        onCommand?.(cmd);
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
      try { recognition.stop(); } catch (e) {}
    };
  }, [autoStart, isListening, isPaused, onCommand]);

  const handlePause = useCallback(() => {
    stop();
    setIsPaused(true);
    speak("Yes? I'm listening. What would you like me to do?");

    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      speak("Alright, continuing. Say 'hey' anytime!");
    }, 8000);
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    stop();
    setDisplayText(text);
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    setIsListening(true);
    try { recRef.current?.start(); } catch (e) {}
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    try { recRef.current?.stop(); } catch (e) {}
  }, []);

  return {
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    displayText,
    speak,
    stop,
    startListening,
    stopListening,
    setIsPaused
  };
};

export default useVoice;
