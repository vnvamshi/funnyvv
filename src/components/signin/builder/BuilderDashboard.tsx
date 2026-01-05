import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  companyName: string;
  onContinue: () => void;
  speak: (t: string) => void;
}

const THEME = { primary: '#1e3a5f', accent: '#f59e0b' };

const BuilderDashboard: React.FC<Props> = ({ companyName, onContinue, speak }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    speak(`Welcome to your builder dashboard, ${companyName}! You're verified. Say upload or next to continue.`);
    setTimeout(() => startListening(), 1500);
  }, []);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) text += event.results[i][0].transcript;
        setTranscript(text);
        if (event.results[event.resultIndex].isFinal) {
          const lower = text.toLowerCase();
          if (lower.includes('upload') || lower.includes('next') || lower.includes('continue') || lower.includes('portfolio')) {
            speak("Opening portfolio upload.");
            onContinue();
          }
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => { if (isListening) recognitionRef.current?.start(); };
    }
    return () => recognitionRef.current?.stop();
  }, [isListening]);

  const startListening = () => { try { recognitionRef.current?.start(); setIsListening(true); } catch (e) {} };
  const toggleListening = () => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { startListening(); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <span style={{ fontSize: '2.5em' }}>🏗️</span>
      <h3 style={{ color: THEME.accent, margin: 0 }}>Builder Dashboard</h3>
      <p style={{ color: '#888' }}>Welcome, {companyName}!</p>

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>✓ Verified Builder</div>
      </div>

      <button onClick={onContinue} style={{ padding: '14px 40px', background: THEME.accent, border: 'none', borderRadius: 30, color: '#000', fontWeight: 600, cursor: 'pointer' }}>Upload Portfolio →</button>

      {/* AgenticBar */}
      <div style={{ width: '100%', marginTop: 10, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: isListening ? '#10b981' : '#64748b', animation: isListening ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>🎤 {isListening ? 'LISTENING' : 'READY'}</span>
        </div>
        {isListening && (<div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 25, alignItems: 'center', marginBottom: 10 }}>{[...Array(12)].map((_, i) => (<div key={i} style={{ width: 3, background: 'linear-gradient(to top, #10b981, #06b6d4)', borderRadius: 2, animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`, height: 8 }} />))}</div>)}
        {transcript && (<div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><p style={{ color: '#e2e8f0', margin: 0, fontSize: '0.95em' }}>"{transcript}"</p></div>)}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button onClick={toggleListening} style={{ padding: '10px 24px', borderRadius: 25, border: 'none', background: isListening ? '#ef4444' : '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{isListening ? '⏹️ Stop' : '🎤 Listen'}</button>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.75em', textAlign: 'center', margin: '12px 0 0' }}>💡 Say: "upload portfolio" • "next"</p>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes wave { from { height: 6px; } to { height: 20px; } }`}</style>
    </div>
  );
};

export default BuilderDashboard;
