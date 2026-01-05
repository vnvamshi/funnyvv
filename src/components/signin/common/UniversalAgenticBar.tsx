import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface AgenticBarRef {
  speak: (text: string) => void;
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  pointTo: (elementId: string) => void;
}

interface UniversalAgenticBarProps {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onCommand?: (command: string) => void;
  welcomeMessage?: string;
  hints?: string[];
  autoStart?: boolean;
  showWaveform?: boolean;
  accentColor?: string;
  context?: string;
  stepKey?: string;
}

const UniversalAgenticBar = forwardRef<AgenticBarRef, UniversalAgenticBarProps>(({
  onTranscript,
  onCommand,
  welcomeMessage,
  hints = [],
  autoStart = true,
  showWaveform = true,
  accentColor = '#10b981',
  context = '',
  stepKey = ''
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastHeard, setLastHeard] = useState('');
  const [status, setStatus] = useState<'ready' | 'listening' | 'processing' | 'speaking'>('ready');
  const [errorMsg, setErrorMsg] = useState('');
  const [walkerPos, setWalkerPos] = useState<{ x: number; y: number } | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const shouldRestartRef = useRef(false);
  const onCommandRef = useRef(onCommand);
  const mountedRef = useRef(true);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  // Restart on step change
  useEffect(() => {
    if (stepKey && recognitionRef.current) {
      console.log('🔄 Step changed:', stepKey);
      try { recognitionRef.current.stop(); } catch (e) {}
      setTimeout(() => {
        if (mountedRef.current && autoStart) startListening();
      }, 300);
    }
  }, [stepKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    mountedRef.current = true;
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg('Speech not supported');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      if (!mountedRef.current) return;
      setIsListening(true);
      setStatus('listening');
      setErrorMsg('');
    };

    recognition.onresult = (event: any) => {
      if (!mountedRef.current) return;
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) {
        setLastHeard(final);
        onTranscript?.(final, true);
        onCommandRef.current?.(final);
      } else if (interim) {
        onTranscript?.(interim, false);
      }
    };

    recognition.onerror = (e: any) => {
      if (!mountedRef.current) return;
      if (e.error === 'no-speech' && shouldRestartRef.current) {
        setTimeout(() => { try { recognition.start(); } catch (e) {} }, 100);
      } else if (e.error === 'not-allowed') {
        setErrorMsg('Mic access denied');
      }
    };

    recognition.onend = () => {
      if (!mountedRef.current) return;
      setIsListening(false);
      setStatus('ready');
      if (shouldRestartRef.current) {
        setTimeout(() => { try { recognition.start(); } catch (e) {} }, 100);
      }
    };

    recognitionRef.current = recognition;

    if (welcomeMessage) setTimeout(() => speak(welcomeMessage), 300);
    if (autoStart) setTimeout(() => startListening(), welcomeMessage ? 1500 : 300);

    return () => {
      mountedRef.current = false;
      shouldRestartRef.current = false;
      try { recognition.stop(); } catch (e) {}
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !mountedRef.current) return;
    const wasListening = shouldRestartRef.current;
    shouldRestartRef.current = false;
    try { recognitionRef.current?.stop(); } catch (e) {}
    synthRef.current.cancel();
    setStatus('speaking');
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => {
      if (!mountedRef.current) return;
      setStatus('ready');
      if (wasListening || autoStart) setTimeout(() => startListening(), 200);
    };
    utterance.onerror = () => {
      if (!mountedRef.current) return;
      setStatus('ready');
      if (wasListening || autoStart) setTimeout(() => startListening(), 200);
    };
    synthRef.current.speak(utterance);
  }, [autoStart]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !mountedRef.current) return;
    shouldRestartRef.current = true;
    try { recognitionRef.current.start(); } catch (e) {}
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    try { recognitionRef.current?.stop(); } catch (e) {}
    setIsListening(false);
    setStatus('ready');
  }, []);

  // Walker - point to element
  const pointTo = useCallback((elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setWalkerPos({ x: rect.left + rect.width / 2, y: rect.top - 30 });
      el.focus?.();
      el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      // Hide walker after 3 seconds
      setTimeout(() => setWalkerPos(null), 3000);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    speak, startListening, stopListening, isListening, pointTo
  }), [speak, startListening, stopListening, isListening, pointTo]);

  return (
    <>
      {/* Walker Pointer */}
      {walkerPos && (
        <div style={{
          position: 'fixed',
          left: walkerPos.x,
          top: walkerPos.y,
          transform: 'translate(-50%, -100%)',
          zIndex: 99999,
          pointerEvents: 'none',
          animation: 'bounce 0.5s infinite alternate'
        }}>
          <div style={{ fontSize: 30 }}>👆</div>
        </div>
      )}

      <div style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))`,
        backdropFilter: 'blur(10px)',
        borderRadius: 16,
        padding: '16px 20px',
        border: `1px solid ${accentColor}30`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: isListening ? '#10b981' : status === 'speaking' ? accentColor : '#64748b',
            boxShadow: isListening ? '0 0 12px #10b981' : 'none',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }} />

          {showWaveform && isListening && (
            <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 28 }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} style={{
                  width: 3,
                  background: `linear-gradient(to top, ${accentColor}, ${accentColor}80)`,
                  borderRadius: 2,
                  animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`
                }} />
              ))}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {transcript ? (
              <p style={{ color: '#fff', margin: 0, fontSize: '0.95em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                🎤 "{transcript}"
              </p>
            ) : (
              <p style={{ color: '#888', margin: 0, fontSize: '0.85em' }}>
                {isListening ? '🎤 Listening...' : status === 'speaking' ? '🔊 Speaking...' : 'Ready'}
              </p>
            )}
          </div>

          <button onClick={() => isListening ? stopListening() : startListening()} style={{
            padding: '10px 20px', borderRadius: 25, border: 'none',
            background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9em'
          }}>
            {isListening ? '⏹️ Stop' : '🎤 Listen'}
          </button>

          <button onClick={() => speak(hints.length > 0 ? `Try: ${hints.join(', ')}` : 'Say next, back, or your input.')} style={{
            padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '0.85em'
          }}>
            🔊 Help
          </button>
        </div>

        {hints.length > 0 && (
          <p style={{ color: '#64748b', fontSize: '0.8em', textAlign: 'center', margin: '14px 0 0' }}>
            💡 {hints.map(h => `"${h}"`).join(' • ')}
          </p>
        )}

        {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.8em', textAlign: 'center', margin: '10px 0 0' }}>⚠️ {errorMsg}</p>}

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
          @keyframes wave { from { height: 6px; } to { height: 24px; } }
          @keyframes bounce { from { transform: translate(-50%, -100%) translateY(0); } to { transform: translate(-50%, -100%) translateY(-10px); } }
        `}</style>
      </div>
    </>
  );
});

UniversalAgenticBar.displayName = 'UniversalAgenticBar';
export default UniversalAgenticBar;
