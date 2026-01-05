import React, { useState, useCallback, useEffect, useRef } from 'react';
import WalkingCursor from '../common/WalkingCursor';

interface Props { onClose: () => void; onBack: () => void; }

type Step = 'phone' | 'otp' | 'preferences' | 'complete';
const STEPS: Step[] = ['phone', 'otp', 'preferences', 'complete'];
const LABELS = ['Phone', 'Verify', 'Preferences', 'Done'];
const THEME = { primary: '#0f172a', secondary: '#1e293b', accent: '#06b6d4' };

const CATEGORIES = ['Flooring', 'Lighting', 'Kitchen', 'Bathroom', 'Outdoor', 'Smart Home', 'Furniture', 'Decor'];

const CustomerFlow: React.FC<Props> = ({ onClose, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [walkerActive, setWalkerActive] = useState(true);
  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const speak = useCallback((t: string) => { synth?.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 0.95; synth?.speak(u); }, [synth]);

  const goNext = () => { const i = STEPS.indexOf(step); if (i < STEPS.length - 1) { setStep(STEPS[i + 1]); setWalkerActive(true); } };
  const goBack = () => { const i = STEPS.indexOf(step); if (i > 0) setStep(STEPS[i - 1]); else onBack(); };

  useEffect(() => {
    const messages: Record<Step, string> = {
      phone: "Welcome customer! Enter your phone number to get started.",
      otp: "Enter the verification code.",
      preferences: "Select your interests. Say the category name to toggle.",
      complete: "You're all set!"
    };
    speak(messages[step]);
    setTimeout(() => startListening(), 1000);
  }, [step]);

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
        if (event.results[event.resultIndex].isFinal) processVoice(text);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => { if (isListening) recognitionRef.current?.start(); };
    }
    return () => recognitionRef.current?.stop();
  }, [isListening, step, selectedCategories]);

  const startListening = () => { try { recognitionRef.current?.start(); setIsListening(true); } catch (e) {} };
  const toggleListening = () => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { startListening(); } };

  const processVoice = async (text: string) => {
    const numberWords: Record<string, string> = { 'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'oh': '0' };
    let processed = text.toLowerCase();
    for (const [word, digit] of Object.entries(numberWords)) processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    const digits = processed.replace(/\D/g, '');
    const lower = text.toLowerCase();

    if (step === 'phone' && digits.length > 0) {
      const newPhone = (phone + digits).slice(0, 10);
      setPhone(newPhone);
      if (newPhone.length === 10) speak("Phone complete!");
    }

    if (step === 'otp' && digits.length > 0) {
      const newOtp = (otp + digits).slice(0, 6);
      setOtp(newOtp);
      if (newOtp.length === 6) speak("Code complete!");
    }

    if (step === 'preferences') {
      CATEGORIES.forEach(cat => {
        if (lower.includes(cat.toLowerCase())) {
          setSelectedCategories(prev => {
            if (prev.includes(cat)) {
              speak(`Removed ${cat}`);
              return prev.filter(c => c !== cat);
            } else {
              speak(`Added ${cat}`);
              return [...prev, cat];
            }
          });
        }
      });
    }

    if (lower.includes('next') || lower.includes('continue') || lower.includes('done')) {
      if (step === 'phone' && phone.length === 10) goNext();
      else if (step === 'otp' && otp.length === 6) goNext();
      else if (step === 'preferences') goNext();
    }
  };

  const formatPhone = (p: string) => { if (p.length <= 3) return p; if (p.length <= 6) return `${p.slice(0,3)}-${p.slice(3)}`; return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`; };
  const stepIndex = STEPS.indexOf(step);

  const AgenticBar = () => (
    <div style={{ marginTop: 20, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: isListening ? '#10b981' : '#64748b', animation: isListening ? 'pulse 1s infinite' : 'none' }} />
        <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>🎤 {isListening ? 'LISTENING' : 'READY'}</span>
      </div>
      {isListening && (<div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 25, alignItems: 'center', marginBottom: 10 }}>{[...Array(12)].map((_, i) => (<div key={i} style={{ width: 3, background: 'linear-gradient(to top, #10b981, #06b6d4)', borderRadius: 2, animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`, height: 8 }} />))}</div>)}
      {transcript && (<div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><p style={{ color: '#e2e8f0', margin: 0 }}>"{transcript}"</p></div>)}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button onClick={toggleListening} style={{ padding: '10px 24px', borderRadius: 25, border: 'none', background: isListening ? '#ef4444' : '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{isListening ? '⏹️ Stop' : '🎤 Listen'}</button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🛒</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Customer Phone</h3></div><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}><span style={{ color: '#888' }}>+1</span><input type="tel" value={formatPhone(phone)} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="000-000-0000" style={{ padding: '16px 20px', fontSize: '1.5em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 220 }} /></div><button onClick={goNext} disabled={phone.length !== 10} style={{ padding: '14px 40px', background: phone.length === 10 ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: phone.length === 10 ? '#000' : '#666', fontWeight: 600, cursor: phone.length === 10 ? 'pointer' : 'not-allowed', alignSelf: 'center' }}>Send OTP →</button><AgenticBar /></div>);
      case 'otp':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🔐</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Verify Code</h3></div><input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} style={{ padding: '16px 20px', fontSize: '2em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 180, letterSpacing: 8, alignSelf: 'center' }} /><button onClick={goNext} disabled={otp.length !== 6} style={{ padding: '14px 40px', background: otp.length === 6 ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: otp.length === 6 ? '#000' : '#666', fontWeight: 600, cursor: otp.length === 6 ? 'pointer' : 'not-allowed', alignSelf: 'center' }}>Verify →</button><AgenticBar /></div>);
      case 'preferences':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '2.5em' }}>🎯</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Your Interests</h3><p style={{ color: '#888', fontSize: '0.9em' }}>Select categories or say them aloud</p></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>{CATEGORIES.map(cat => (<div key={cat} onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])} className="category-btn" style={{ padding: '14px 16px', background: selectedCategories.includes(cat) ? `${THEME.accent}30` : 'rgba(0,0,0,0.3)', border: `2px solid ${selectedCategories.includes(cat) ? THEME.accent : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', color: selectedCategories.includes(cat) ? THEME.accent : '#e2e8f0', transition: 'all 0.2s' }}>{cat}</div>))}</div><button onClick={goNext} style={{ padding: '14px 40px', background: THEME.accent, border: 'none', borderRadius: 30, color: '#000', fontWeight: 600, cursor: 'pointer', alignSelf: 'center' }}>Continue →</button><AgenticBar /></div>);
      case 'complete':
        return (<div style={{ textAlign: 'center', padding: 40 }}><span style={{ fontSize: '4em' }}>🎉</span><h2 style={{ color: THEME.accent }}>Welcome!</h2><p style={{ color: '#888' }}>Your account is ready. Start shopping!</p>{selectedCategories.length > 0 && (<p style={{ color: '#06b6d4', fontSize: '0.9em' }}>Interests: {selectedCategories.join(', ')}</p>)}<button onClick={onClose} style={{ padding: '14px 40px', marginTop: 20, background: THEME.accent, border: 'none', borderRadius: 30, color: '#000', fontWeight: 600, cursor: 'pointer' }}>Start Shopping</button></div>);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div ref={containerRef} style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.accent}40`, position: 'relative' }}>
        <WalkingCursor containerRef={containerRef} isActive={walkerActive && step !== 'complete'} onComplete={() => setWalkerActive(false)} speed={1000} variant="hand" color={THEME.accent} selectors="input, button, .category-btn" />
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.accent}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ fontSize: '1.6em' }}>🛒</span><div><h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Customer Setup</h2><span style={{ color: '#888', fontSize: '0.8em' }}>Step {stepIndex + 1}/{STEPS.length}</span></div></div><button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer' }}>✕</button></div>
        <div style={{ display: 'flex', padding: '10px 24px', gap: 4, background: 'rgba(0,0,0,0.2)' }}>{STEPS.map((_, i) => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIndex ? THEME.accent : 'rgba(255,255,255,0.15)' }} />))}</div>
        <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.2)' }}><button onClick={goBack} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 15, cursor: 'pointer' }}>← Back</button></div>
        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(90vh - 180px)' }}>{renderStep()}</div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes wave { from { height: 6px; } to { height: 20px; } }`}</style>
    </div>
  );
};

export default CustomerFlow;
