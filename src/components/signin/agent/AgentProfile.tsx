import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  profile: string;
  companyName: string;
  onChange: (p: string) => void;
  onCompanyChange: (n: string) => void;
  onSave: () => void;
  speak: (t: string) => void;
}

const THEME = { primary: '#1a1a2e', accent: '#10b981' };

const AgentProfile: React.FC<Props> = ({ profile, companyName, onChange, onCompanyChange, onSave, speak }) => {
  const [localCompany, setLocalCompany] = useState(companyName);
  const [localProfile, setLocalProfile] = useState(profile);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [filling, setFilling] = useState<string | null>(null);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    speak("Tell me about your real estate agency and your specialties. Say beautify to enhance your description.");
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
        for (let i = event.resultIndex; i < event.results.length; i++) text += event.results[i][0].transcript;
        setTranscript(text);
        if (event.results[event.resultIndex].isFinal) processVoice(text);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => { if (isListening) recognitionRef.current?.start(); };
    }
    return () => recognitionRef.current?.stop();
  }, [isListening]);

  const startListening = () => { try { recognitionRef.current?.start(); setIsListening(true); } catch (e) {} };
  const toggleListening = () => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { startListening(); } };

  const typeIntoField = async (fieldId: string, text: string, fieldName: string, setter: (v: string) => void, parentSetter: (v: string) => void) => {
    const el = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement;
    if (!el) return;
    setFilling(fieldName);
    el.focus();
    for (let i = 0; i <= text.length; i++) {
      el.value = text.substring(0, i);
      setter(text.substring(0, i));
      await new Promise(r => setTimeout(r, 20));
    }
    parentSetter(text);
    setFilling(null);
  };

  const handleBeautify = async () => {
    if (!localProfile.trim()) { speak("Please enter a description first."); return; }
    setIsBeautifying(true);
    speak("Enhancing your profile...");

    try {
      const response = await fetch('http://localhost:1117/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: localProfile, type: 'agent', companyName: localCompany })
      });
      const data = await response.json();
      if (data.beautified) {
        await typeIntoField('agent-profile-textarea', data.beautified, 'Profile', setLocalProfile, onChange);
        speak("Profile enhanced!");
      }
    } catch (err) {
      const enhanced = `${localCompany} is a trusted real estate agency specializing in ${localProfile}. Our dedicated team provides personalized service to help clients achieve their real estate goals.`;
      await typeIntoField('agent-profile-textarea', enhanced, 'Profile', setLocalProfile, onChange);
      speak("Profile enhanced!");
    } finally {
      setIsBeautifying(false);
    }
  };

  const processVoice = async (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('beautify') || lower.includes('enhance')) { handleBeautify(); return; }
    
    // Company extraction
    const match = text.match(/(?:agency is|brokerage is|i work at|i'm with)\s+(.+?)(?:\s+and|\.|$)/i);
    if (match && match[1]) {
      await typeIntoField('agent-company-input', match[1].trim(), 'Agency', setLocalCompany, onCompanyChange);
    }
    
    // Profile extraction
    const profileMatch = text.match(/(?:specialize in|i sell|i help with|focus on)\s+(.+)/i);
    if (profileMatch && profileMatch[1]) {
      await typeIntoField('agent-profile-textarea', profileMatch[1].trim(), 'Specialties', setLocalProfile, onChange);
    }
    
    if ((lower.includes('save') || lower.includes('next')) && localCompany && localProfile) onSave();
  };

  const canSave = localCompany.trim() && localProfile.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>🏠</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Agent Profile</h3>
      </div>

      <div>
        <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: 6 }}>Agency/Brokerage Name</label>
        <input id="agent-company-input" type="text" value={localCompany} onChange={e => { setLocalCompany(e.target.value); onCompanyChange(e.target.value); }} placeholder="Your agency name" style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff', fontSize: '1em' }} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ color: '#ccc', fontSize: '0.85em' }}>Specialties & Services</label>
          <button onClick={handleBeautify} disabled={isBeautifying || !localProfile.trim()} style={{ padding: '6px 14px', borderRadius: 15, border: 'none', background: isBeautifying ? 'rgba(139, 92, 246, 0.3)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontSize: '0.8em', fontWeight: 600, cursor: isBeautifying || !localProfile.trim() ? 'not-allowed' : 'pointer', opacity: !localProfile.trim() ? 0.5 : 1 }}>
            {isBeautifying ? '⏳ Beautifying...' : '✨ Beautify'}
          </button>
        </div>
        <textarea id="agent-profile-textarea" value={localProfile} onChange={e => { setLocalProfile(e.target.value); onChange(e.target.value); }} placeholder="Residential sales, luxury properties, first-time buyers..." rows={4} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff', fontSize: '1em', resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      <button onClick={onSave} disabled={!canSave} style={{ padding: '14px 40px', background: canSave ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: canSave ? '#000' : '#666', fontWeight: 600, cursor: canSave ? 'pointer' : 'not-allowed', alignSelf: 'center' }}>Save Profile →</button>

      {/* AgenticBar */}
      <div style={{ marginTop: 10, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: isListening ? '#10b981' : '#64748b', animation: isListening ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>🎤 {isListening ? 'LISTENING' : 'READY'}</span>
        </div>
        {isListening && (<div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 25, alignItems: 'center', marginBottom: 10 }}>{[...Array(12)].map((_, i) => (<div key={i} style={{ width: 3, background: 'linear-gradient(to top, #10b981, #06b6d4)', borderRadius: 2, animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`, height: 8 }} />))}</div>)}
        {filling && (<div style={{ background: 'rgba(16, 185, 129, 0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, textAlign: 'center' }}><span style={{ color: '#10b981' }}>⚡ Filling {filling}...</span></div>)}
        {transcript && (<div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><p style={{ color: '#e2e8f0', margin: 0 }}>"{transcript}"</p></div>)}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button onClick={toggleListening} style={{ padding: '10px 24px', borderRadius: 25, border: 'none', background: isListening ? '#ef4444' : '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{isListening ? '⏹️ Stop' : '🎤 Listen'}</button>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.75em', textAlign: 'center', margin: '12px 0 0' }}>💡 Say: "My agency is RE/MAX" • "I specialize in luxury homes" • "Beautify"</p>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes wave { from { height: 6px; } to { height: 20px; } }
      `}</style>
    </div>
  );
};

export default AgentProfile;
