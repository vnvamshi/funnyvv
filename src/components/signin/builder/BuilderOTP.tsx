import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  phone: string;
  otp: string;
  onChange: (o: string) => void;
  onVerify: () => void;
  speak: (t: string) => void;
}

const THEME = { primary: '#1e3a5f', accent: '#f59e0b' };

const BuilderOTP: React.FC<Props> = ({ phone, otp, onChange, onVerify, speak }) => {
  const [localOtp, setLocalOtp] = useState(otp);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastHeard, setLastHeard] = useState('');
  const [filling, setFilling] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const formatted = phone.length === 10 ? `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}` : phone;
    speak(`Please enter the 6-digit verification code sent to ${formatted}`);
    setTimeout(() => startListening(), 1000);
  }, []);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
        
        if (event.results[event.resultIndex].isFinal) {
          setLastHeard(text);
          processVoice(text);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => { if (isListening) recognitionRef.current?.start(); };
    }
    return () => recognitionRef.current?.stop();
  }, [isListening]);

  const startListening = () => { try { recognitionRef.current?.start(); setIsListening(true); } catch (e) {} };

  const processVoice = useCallback(async (text: string) => {
    const numberWords: Record<string, string> = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'oh': '0'
    };
    
    let processed = text.toLowerCase();
    for (const [word, digit] of Object.entries(numberWords)) {
      processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    }
    
    const digits = processed.replace(/\D/g, '');
    
    if (digits.length > 0) {
      setFilling(true);
      inputRef.current?.focus();
      
      const newOtp = (localOtp + digits).slice(0, 6);
      for (let i = localOtp.length; i <= newOtp.length; i++) {
        await new Promise(r => setTimeout(r, 100));
        setLocalOtp(newOtp.substring(0, i));
        onChange(newOtp.substring(0, i));
      }
      
      setFilling(false);
      if (newOtp.length === 6) speak("Code complete! Click Verify to continue.");
    }
    
    const lower = text.toLowerCase();
    if ((lower.includes('verify') || lower.includes('next') || lower.includes('continue')) && localOtp.length === 6) {
      onVerify();
    }
    if (lower.includes('clear') || lower.includes('reset')) {
      setLocalOtp(''); onChange(''); speak("Cleared.");
    }
  }, [localOtp, onChange, speak, onVerify]);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { startListening(); }
  };

  const isValid = localOtp.length === 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '3em' }}>🔐</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Verify Your Number</h3>
        <p style={{ color: '#888', fontSize: '0.9em' }}>Code sent to {phone.length === 10 ? `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}` : phone}</p>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={localOtp}
        onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 6); setLocalOtp(d); onChange(d); }}
        placeholder="000000"
        maxLength={6}
        className={filling ? 'vv-filling' : ''}
        style={{
          padding: '16px 20px', fontSize: '2em', fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.3)', border: `2px solid ${filling ? '#06b6d4' : isValid ? '#10b981' : THEME.accent}40`,
          borderRadius: 12, color: '#fff', textAlign: 'center', width: 200, letterSpacing: 8,
          alignSelf: 'center', outline: 'none', transition: 'all 0.3s',
          boxShadow: filling ? '0 0 20px rgba(6, 182, 212, 0.3)' : 'none'
        }}
      />

      <button onClick={onVerify} disabled={!isValid} style={{
        padding: '14px 40px', background: isValid ? THEME.accent : 'rgba(255,255,255,0.1)',
        border: 'none', borderRadius: 30, color: isValid ? '#000' : '#666',
        fontWeight: 600, cursor: isValid ? 'pointer' : 'not-allowed', alignSelf: 'center'
      }}>Verify →</button>

      {/* AgenticBar */}
      <div style={{ marginTop: 10, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: isListening ? '#10b981' : '#64748b', animation: isListening ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>🎤 {isListening ? 'LISTENING' : 'READY'}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75em', padding: '2px 8px', borderRadius: 10, background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>LIVE</span>
        </div>

        {isListening && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 25, alignItems: 'center', marginBottom: 10 }}>
            {[...Array(12)].map((_, i) => (<div key={i} style={{ width: 3, background: 'linear-gradient(to top, #10b981, #06b6d4)', borderRadius: 2, animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`, height: 8 }} />))}
          </div>
        )}

        {filling && (<div style={{ background: 'rgba(6, 182, 212, 0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, textAlign: 'center' }}><span style={{ color: '#06b6d4', fontSize: '0.9em' }}>⚡ Filling code...</span></div>)}

        {(transcript || lastHeard) && (<div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><span style={{ color: '#10b981', fontSize: '0.75em' }}>✓ HEARD</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: '0.95em' }}>"{transcript || lastHeard}"</p></div>)}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button onClick={toggleListening} style={{ padding: '10px 24px', borderRadius: 25, border: 'none', background: isListening ? '#ef4444' : '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{isListening ? '⏹️ Stop' : '🎤 Listen'}</button>
          <button onClick={() => speak("Say the 6-digit code.")} style={{ padding: '10px 24px', borderRadius: 25, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>🔊 Help</button>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.75em', textAlign: 'center', margin: '12px 0 0' }}>💡 Say the 6 digits • "verify" when done • "clear" to reset</p>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes wave { from { height: 6px; } to { height: 20px; } }
        .vv-filling { border-color: #06b6d4 !important; box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2) !important; }
      `}</style>
    </div>
  );
};

export default BuilderOTP;
