import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  profile: string;
  companyName: string;
  onChange: (p: string) => void;
  onCompanyChange: (n: string) => void;
  onSave: () => void;
  speak: (t: string) => void;
}

const THEME = { primary: '#1e3a5f', accent: '#f59e0b' };

const BuilderProfile: React.FC<Props> = ({ profile, companyName, onChange, onCompanyChange, onSave, speak }) => {
  const [localCompany, setLocalCompany] = useState(companyName);
  const [localProfile, setLocalProfile] = useState(profile);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastHeard, setLastHeard] = useState('');
  const [filling, setFilling] = useState<string | null>(null);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    speak("Tell me about your construction business. Say your company name and what services you offer. You can also say beautify to enhance your description.");
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

  const typeIntoField = async (fieldId: string, text: string, fieldName: string, setter: (v: string) => void, parentSetter: (v: string) => void) => {
    const el = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement;
    if (!el) return;
    
    setFilling(fieldName);
    el.focus();
    el.classList.add('vv-filling');
    
    for (let i = 0; i <= text.length; i++) {
      el.value = text.substring(0, i);
      setter(text.substring(0, i));
      await new Promise(r => setTimeout(r, 20));
    }
    
    parentSetter(text);
    el.classList.remove('vv-filling');
    el.classList.add('vv-filled');
    setTimeout(() => el.classList.remove('vv-filled'), 1000);
    setFilling(null);
  };

  const handleBeautify = async () => {
    if (!localProfile.trim()) {
      speak("Please enter a description first.");
      return;
    }

    setIsBeautifying(true);
    speak("Enhancing your profile description...");

    try {
      const response = await fetch('http://localhost:1117/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: localProfile,
          type: 'builder',
          companyName: localCompany
        })
      });

      const data = await response.json();
      
      if (data.beautified) {
        // Typewriter effect for beautified text
        await typeIntoField('builder-profile-textarea', data.beautified, 'Profile', setLocalProfile, onChange);
        speak("Description enhanced successfully!");
      }
    } catch (err) {
      console.error('Beautify error:', err);
      // Fallback: Simple enhancement
      const enhanced = `${localCompany} is a premier construction company specializing in ${localProfile}. With years of experience and a commitment to quality, we deliver exceptional results on every project.`;
      await typeIntoField('builder-profile-textarea', enhanced, 'Profile', setLocalProfile, onChange);
      speak("Description enhanced!");
    } finally {
      setIsBeautifying(false);
    }
  };

  const processVoice = useCallback(async (text: string) => {
    const lower = text.toLowerCase();
    
    // Beautify command
    if (lower.includes('beautify') || lower.includes('enhance') || lower.includes('improve')) {
      handleBeautify();
      return;
    }
    
    // Extract company name
    const companyPatterns = [
      /(?:my company is|company name is|we are|i'm from|this is)\s+(.+?)(?:\s+and|\s+we|\.|$)/i,
      /^(.+?)\s+(?:construction|builders|contracting|development)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        await typeIntoField('builder-company-input', match[1].trim(), 'Company Name', setLocalCompany, onCompanyChange);
        break;
      }
    }
    
    // Extract services/description
    const servicePatterns = [
      /(?:we offer|we do|we specialize in|services include|we build)\s+(.+)/i,
      /(?:and we|we also)\s+(.+)/i
    ];
    
    for (const pattern of servicePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        await typeIntoField('builder-profile-textarea', match[1].trim(), 'Services', setLocalProfile, onChange);
        break;
      }
    }
    
    // Commands
    if (lower.includes('save') || lower.includes('next') || lower.includes('continue')) {
      if (localCompany.trim() && localProfile.trim()) onSave();
    }
  }, [localCompany, localProfile, onCompanyChange, onChange, onSave]);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { startListening(); }
  };

  const canSave = localCompany.trim() && localProfile.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>🏗️</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Builder Profile</h3>
        <p style={{ color: '#888', fontSize: '0.9em' }}>Tell us about your construction business</p>
      </div>

      <div>
        <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: 6 }}>Company Name</label>
        <input
          id="builder-company-input"
          type="text"
          value={localCompany}
          onChange={e => { setLocalCompany(e.target.value); onCompanyChange(e.target.value); }}
          placeholder="Your construction company name"
          style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff', fontSize: '1em', outline: 'none', transition: 'all 0.3s' }}
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ color: '#ccc', fontSize: '0.85em' }}>What construction services do you offer?</label>
          <button
            onClick={handleBeautify}
            disabled={isBeautifying || !localProfile.trim()}
            style={{
              padding: '6px 14px',
              borderRadius: 15,
              border: 'none',
              background: isBeautifying ? 'rgba(139, 92, 246, 0.3)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff',
              fontSize: '0.8em',
              fontWeight: 600,
              cursor: isBeautifying || !localProfile.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              opacity: !localProfile.trim() ? 0.5 : 1
            }}
          >
            {isBeautifying ? (
              <>⏳ Beautifying...</>
            ) : (
              <>✨ Beautify</>
            )}
          </button>
        </div>
        <textarea
          id="builder-profile-textarea"
          value={localProfile}
          onChange={e => { setLocalProfile(e.target.value); onChange(e.target.value); }}
          placeholder="We specialize in residential construction, renovations, custom homes..."
          rows={4}
          style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff', fontSize: '1em', resize: 'vertical', fontFamily: 'inherit', outline: 'none', transition: 'all 0.3s' }}
        />
      </div>

      <button onClick={onSave} disabled={!canSave} style={{ padding: '14px 40px', background: canSave ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: canSave ? '#000' : '#666', fontWeight: 600, cursor: canSave ? 'pointer' : 'not-allowed', alignSelf: 'center' }}>Save Profile →</button>

      {/* AgenticBar */}
      <div style={{ marginTop: 10, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: isListening ? '#10b981' : '#64748b', animation: isListening ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>🎤 {isListening ? 'LISTENING' : 'READY'}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75em', padding: '2px 8px', borderRadius: 10, background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>LIVE</span>
        </div>

        {isListening && (<div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 25, alignItems: 'center', marginBottom: 10 }}>{[...Array(12)].map((_, i) => (<div key={i} style={{ width: 3, background: 'linear-gradient(to top, #10b981, #06b6d4)', borderRadius: 2, animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`, height: 8 }} />))}</div>)}

        {filling && (<div style={{ background: 'rgba(6, 182, 212, 0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, textAlign: 'center' }}><span style={{ color: '#06b6d4', fontSize: '0.9em' }}>⚡ Filling {filling}...</span></div>)}

        {(transcript || lastHeard) && (<div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><span style={{ color: '#10b981', fontSize: '0.75em' }}>✓ HEARD</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: '0.95em' }}>"{transcript || lastHeard}"</p></div>)}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button onClick={toggleListening} style={{ padding: '10px 24px', borderRadius: 25, border: 'none', background: isListening ? '#ef4444' : '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{isListening ? '⏹️ Stop' : '🎤 Listen'}</button>
          <button onClick={() => speak("Tell me your company name and services, or say beautify to enhance.")} style={{ padding: '10px 24px', borderRadius: 25, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>🔊 Help</button>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.75em', textAlign: 'center', margin: '12px 0 0' }}>💡 Say: "My company is ABC Construction" • "We build custom homes" • "Beautify"</p>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes wave { from { height: 6px; } to { height: 20px; } }
        .vv-filling { border-color: #06b6d4 !important; box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2) !important; }
        .vv-filled { animation: successFlash 0.5s ease-out !important; }
        @keyframes successFlash { 0% { background-color: rgba(34, 197, 94, 0.3); } 100% { background-color: transparent; } }
      `}</style>
    </div>
  );
};

export default BuilderProfile;
