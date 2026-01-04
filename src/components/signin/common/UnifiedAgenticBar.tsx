/**
 * UnifiedAgenticBar - THE SAME BAR FOR ALL POPUPS
 * 
 * Features:
 * - Speech-to-text (listening)
 * - Text-to-speech (speaking)
 * - Auto-fill form fields
 * - Walking cursor inside popup
 * - Waveform animation
 * - Works EVERYWHERE
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface FieldMapping {
  [voiceKey: string]: {
    selector: string;
    setter?: (value: string) => void;
  };
}

interface Props {
  context?: string;
  fields?: FieldMapping;
  onCommand?: (command: string) => void;
  onTranscript?: (text: string) => void;
  speak?: (text: string) => void;
  hints?: string;
  autoStart?: boolean;
}

// Global singleton for speech recognition
let globalRecognition: SpeechRecognition | null = null;
let globalIsActive = false;

const UnifiedAgenticBar: React.FC<Props> = ({
  context = 'general',
  fields = {},
  onCommand,
  onTranscript,
  speak: externalSpeak,
  hints = 'Speak naturally...',
  autoStart = false
}) => {
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [filling, setFilling] = useState<string | null>(null);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const shouldRunRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // Initialize speech recognition singleton
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    
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
      stop();
    };
  }, []);

  // Setup recognition handlers
  useEffect(() => {
    if (!globalRecognition) return;

    globalRecognition.onstart = () => {
      globalIsActive = true;
      setState('listening');
    };

    globalRecognition.onresult = async (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }

      setInterimText(interim);

      if (final.trim()) {
        setTranscript(final.trim());
        onTranscript?.(final.trim());
        await processVoiceInput(final.trim());
      }
    };

    globalRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      console.error('[UnifiedBar] Error:', event.error);
    };

    globalRecognition.onend = () => {
      globalIsActive = false;
      if (shouldRunRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (shouldRunRef.current && !globalIsActive && !isSpeakingRef.current) {
            safeStart();
          }
        }, 500);
      } else {
        setState('idle');
      }
    };
  }, [onTranscript, fields, context]);

  const safeStart = () => {
    if (!globalRecognition || globalIsActive) return;
    try { globalRecognition.start(); } catch {}
  };

  // Process voice input - extract data and fill fields
  const processVoiceInput = async (text: string) => {
    setState('processing');
    
    try {
      // Send to backend for analysis
      const response = await fetch('http://localhost:1117/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context, user_type: 'user' })
      });
      
      const data = await response.json();
      
      // Handle commands
      onCommand?.(text);
      
      // Fill form fields if we got formData
      if (data?.formData?.fields) {
        await fillFields(data.formData.fields);
      }
      
      // Speak response
      if (data?.response?.text) {
        speak(data.response.text);
      } else {
        setState(shouldRunRef.current ? 'listening' : 'idle');
      }
      
    } catch (err) {
      console.error('[UnifiedBar] Process error:', err);
      setState(shouldRunRef.current ? 'listening' : 'idle');
    }
  };

  // Fill fields with typewriter effect
  const fillFields = async (formData: Record<string, string>) => {
    for (const [key, value] of Object.entries(formData)) {
      if (!value) continue;
      
      const fieldConfig = fields[key];
      if (!fieldConfig) continue;
      
      const element = document.querySelector(fieldConfig.selector) as HTMLInputElement | HTMLTextAreaElement;
      if (!element) continue;
      
      setFilling(key);
      element.focus();
      element.classList.add('vv-filling');
      
      // Typewriter effect
      element.value = '';
      for (let i = 0; i <= value.length; i++) {
        element.value = value.substring(0, i);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Call setter if provided
        if (fieldConfig.setter) {
          fieldConfig.setter(value.substring(0, i));
        }
        
        await new Promise(r => setTimeout(r, 25));
      }
      
      element.classList.remove('vv-filling');
      element.classList.add('vv-filled');
      setTimeout(() => element.classList.remove('vv-filled'), 1000);
      
      // Final setter call
      if (fieldConfig.setter) {
        fieldConfig.setter(value);
      }
      
      setFilling(null);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (externalSpeak) {
      externalSpeak(text);
      return;
    }
    
    if (!synthRef.current) return;
    
    const wasRunning = shouldRunRef.current;
    isSpeakingRef.current = true;
    
    // Stop listening while speaking
    if (globalIsActive && globalRecognition) {
      try { globalRecognition.stop(); } catch {}
    }
    
    synthRef.current.cancel();
    setState('speaking');
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setState('idle');
      if (wasRunning) {
        shouldRunRef.current = true;
        setTimeout(() => safeStart(), 300);
      }
    };
    
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setState('idle');
    };
    
    synthRef.current.speak(utterance);
  }, [externalSpeak]);

  // Controls
  const start = () => {
    synthRef.current?.cancel();
    isSpeakingRef.current = false;
    shouldRunRef.current = true;
    setState('listening');
    safeStart();
  };

  const stop = () => {
    shouldRunRef.current = false;
    if (globalRecognition && globalIsActive) {
      try { globalRecognition.stop(); } catch {}
    }
    synthRef.current?.cancel();
    setState('idle');
  };

  const toggle = () => {
    if (state === 'listening' || shouldRunRef.current) {
      stop();
    } else {
      start();
    }
  };

  const pause = () => {
    if (globalRecognition && globalIsActive) {
      try { globalRecognition.stop(); } catch {}
    }
    shouldRunRef.current = false;
    setState('idle');
  };

  // Styles
  const isActive = state === 'listening' || state === 'speaking';
  const borderColor = state === 'listening' ? '#10b981' : state === 'speaking' ? '#eab308' : state === 'processing' ? '#f97316' : 'rgba(184, 134, 11, 0.4)';
  const glowColor = state === 'listening' ? 'rgba(16, 185, 129, 0.3)' : state === 'speaking' ? 'rgba(234, 179, 8, 0.3)' : 'transparent';

  return (
    <div style={{
      background: 'rgba(0, 66, 54, 0.95)',
      border: `2px solid ${borderColor}`,
      borderRadius: '16px',
      padding: '16px',
      marginTop: '20px',
      boxShadow: isActive ? `0 0 30px ${glowColor}` : 'none',
      transition: 'all 0.3s'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: state === 'listening' ? '#10b981' : state === 'speaking' ? '#eab308' : state === 'processing' ? '#f97316' : '#64748b',
            animation: isActive ? 'pulse 1s infinite' : 'none'
          }} />
          <span style={{ fontSize: '14px' }}>
            {state === 'listening' && '🎤 LISTENING'}
            {state === 'speaking' && '🔊 SPEAKING'}
            {state === 'processing' && '⚡ PROCESSING'}
            {state === 'idle' && '🎙️ READY'}
          </span>
          <span style={{ color: '#888', fontSize: '12px' }}>• {context}</span>
        </div>
        <span style={{
          fontSize: '11px',
          padding: '3px 10px',
          borderRadius: '12px',
          background: 'rgba(6, 182, 212, 0.2)',
          color: '#06b6d4'
        }}>
          INTERACTIVE
        </span>
      </div>

      {/* Waveform - only when listening */}
      {state === 'listening' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', height: '30px', alignItems: 'center', marginBottom: '12px' }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                background: 'linear-gradient(to top, #10b981, #06b6d4)',
                borderRadius: '2px',
                animation: `wave 0.4s ease-in-out ${i * 0.03}s infinite alternate`,
                height: '8px'
              }}
            />
          ))}
        </div>
      )}

      {/* Filling indicator */}
      {filling && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '12px',
          textAlign: 'center',
          animation: 'pulse 0.5s infinite'
        }}>
          <span style={{ color: '#06b6d4' }}>⚡ Filling {filling}...</span>
        </div>
      )}

      {/* Transcript display */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '14px',
        minHeight: '60px'
      }}>
        {interimText && (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0, fontSize: '14px' }}>
            {interimText}
          </p>
        )}
        {transcript && !interimText && (
          <div>
            <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>✓ HEARD</span>
            <p style={{ color: '#fff', margin: '6px 0 0', fontSize: '15px' }}>
              "{transcript}"
            </p>
          </div>
        )}
        {!interimText && !transcript && (
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            {state === 'listening' ? 'Listening...' : state === 'speaking' ? 'Speaking...' : 'Click Listen to start'}
          </p>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={toggle}
          style={{
            padding: '10px 24px',
            borderRadius: '25px',
            border: 'none',
            background: state === 'listening' ? '#ef4444' : '#10b981',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px'
          }}
        >
          {state === 'listening' ? '🎤 Stop' : '🎤 Listen'}
        </button>

        <button
          onClick={() => speak('How can I help you?')}
          style={{
            padding: '10px 24px',
            borderRadius: '25px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: state === 'speaking' ? '#eab308' : 'transparent',
            color: state === 'speaking' ? '#000' : '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px'
          }}
        >
          🔊 Speak
        </button>

        <button
          onClick={pause}
          style={{
            padding: '10px 24px',
            borderRadius: '25px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px'
          }}
        >
          ⏸️ Pause
        </button>

        <button
          style={{
            padding: '10px 24px',
            borderRadius: '25px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px'
          }}
        >
          💬 Mode ▾
        </button>
      </div>

      {/* Input field */}
      <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Type here or speak..."
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '25px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                processVoiceInput(input.value.trim());
                input.value = '';
              }
            }
          }}
        />
        <button
          style={{
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '25px',
            color: '#888',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>

      {/* Hints */}
      <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', margin: '14px 0 0' }}>
        💡 {hints}
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes wave {
          from { height: 6px; }
          to { height: 24px; }
        }
        .vv-filling {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2) !important;
          animation: pulse 0.5s infinite !important;
        }
        .vv-filled {
          animation: successFlash 0.5s ease-out !important;
        }
        @keyframes successFlash {
          0% { background-color: rgba(34, 197, 94, 0.3); }
          100% { background-color: rgba(0,0,0,0.3); }
        }
      `}</style>
    </div>
  );
};

export default UnifiedAgenticBar;
export { UnifiedAgenticBar };
