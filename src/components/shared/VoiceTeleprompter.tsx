import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  onCommand?: (cmd: string) => void;
  context?: string;
  initialMessage?: string;
  minimized?: boolean;
}

const THEME = { gold: '#B8860B', teal: '#004236' };

const VoiceTeleprompter: React.FC<Props> = ({
  onCommand,
  context = 'home',
  initialMessage = "I'm Mr. V. How can I help?",
  minimized: initMin = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState(initialMessage);
  const [isMinimized, setIsMinimized] = useState(initMin);
  const [mode, setMode] = useState<'interactive' | 'talkative' | 'text'>('interactive');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      if (!isActiveRef.current) return;
      const result = e.results[e.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      if (text) setTranscript(text);
      if (result.isFinal && text) {
        const cmd = text.toLowerCase();
        if (cmd.includes('stop')) { stopSpeaking(); return; }
        onCommand?.(cmd);
      }
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'not-allowed') {
        setIsListening(false);
        isActiveRef.current = false;
      }
    };
    rec.onend = () => {
      if (isActiveRef.current) {
        setTimeout(() => { try { rec.start(); } catch(e){} }, 100);
      } else {
        setIsListening(false);
      }
    };

    recRef.current = rec;
    isActiveRef.current = true;
    setTimeout(() => { try { rec.start(); } catch(e){} }, 500);

    return () => {
      isActiveRef.current = false;
      try { rec.stop(); } catch(e){}
    };
  }, [onCommand]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || mode === 'text') return;
    synthRef.current.cancel();
    setDisplayText(text);
    setIsSpeaking(true);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
    if (voice) u.voice = voice;
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(u);
  }, [mode]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isActiveRef.current) {
      isActiveRef.current = false;
      try { recRef.current?.stop(); } catch(e){}
      setIsListening(false);
    } else {
      isActiveRef.current = true;
      try { recRef.current?.start(); } catch(e){}
    }
  }, []);

  // Expose speak globally
  useEffect(() => {
    (window as any).vistaviewSpeak = speak;
    return () => { delete (window as any).vistaviewSpeak; };
  }, [speak]);

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${THEME.gold}, #D4A84B)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(184,134,11,0.4)',
          zIndex: 9998
        }}
      >
        <span style={{ fontSize: '1.5em' }}>{isListening ? '🎤' : '💬'}</span>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      width: '380px',
      background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`,
      borderRadius: '16px',
      border: `2px solid ${THEME.gold}40`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      zIndex: 9998
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: `1px solid ${THEME.gold}30`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isListening ? '#4CAF50' : '#888',
            boxShadow: isListening ? '0 0 10px #4CAF50' : 'none'
          }} />
          <span style={{ color: THEME.gold, fontWeight: 600, fontSize: '0.9em' }}>MR. V</span>
          <span style={{ color: '#888', fontSize: '0.8em' }}>
            {isSpeaking ? '🔊 Speaking' : isListening ? '🎤 Listening' : '💤 Idle'}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#888',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}
        >−</button>
      </div>

      {/* Mode Buttons */}
      <div style={{ display: 'flex', gap: '6px', padding: '10px 16px', background: 'rgba(0,0,0,0.2)' }}>
        {(['interactive', 'talkative', 'text'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '16px',
              border: mode === m ? `1px solid ${THEME.gold}` : '1px solid transparent',
              background: mode === m ? 'rgba(184,134,11,0.2)' : 'transparent',
              color: mode === m ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: '0.75em'
            }}
          >
            {m === 'interactive' ? '🎤' : m === 'talkative' ? '💬' : '📝'} {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Display Text */}
      <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.3)', minHeight: '60px' }}>
        <p style={{ color: '#fff', margin: 0, fontSize: '0.9em', lineHeight: 1.5 }}>{displayText}</p>
      </div>

      {/* Transcript */}
      {transcript && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.05)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{ color: '#888', margin: 0, fontSize: '0.8em' }}>💬 "{transcript}"</p>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderTop: `1px solid ${THEME.gold}20` }}>
        <button
          onClick={toggleListening}
          style={{
            flex: 1,
            padding: '10px',
            background: isListening ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)',
            border: `1px solid ${isListening ? '#4CAF50' : 'transparent'}`,
            color: isListening ? '#4CAF50' : '#aaa',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.85em'
          }}
        >
          {isListening ? '🎤 Listening...' : '🎤 Start'}
        </button>
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            style={{
              padding: '10px 16px',
              background: '#e74c3c',
              border: 'none',
              color: '#fff',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >■ Stop</button>
        )}
      </div>

      {/* Hints */}
      <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
        <span style={{ color: '#555', fontSize: '0.7em' }}>
          Say: "Search [product]" • "Show furniture" • "Go home"
        </span>
      </div>
    </div>
  );
};

export default VoiceTeleprompter;
