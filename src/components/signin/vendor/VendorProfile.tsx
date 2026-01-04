import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useVoice } from '../common/useVoice';
import Teleprompter from '../common/Teleprompter';

interface Props {
  profile: string;
  beautified: string;
  companyName: string;
  onChange: (p: string) => void;
  onCompanyChange: (n: string) => void;
  onBeautify: (b: string) => void;
  onSave: () => void;
  speak: (t: string) => void;
}

const THEME = { gold: '#B8860B' };

const TEMPLATES: Record<string, { intro: string; points: string[]; close: string }> = {
  furniture: { intro: 'Premium furniture provider', points: ['Handcrafted quality', 'Sustainable materials', 'Timeless designs'], close: 'Transforming spaces with craftsmanship.' },
  lighting: { intro: 'Innovative lighting specialists', points: ['Energy-efficient', 'Smart home ready', 'Elegant designs'], close: 'Illuminating your world.' },
  default: { intro: 'Quality home solutions', points: ['Customer focused', 'Premium products', 'Great value'], close: 'Enhancing your living spaces.' }
};

const VendorProfile: React.FC<Props> = ({ profile, beautified, companyName, onChange, onCompanyChange, onBeautify, onSave, speak }) => {
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [showBeautified, setShowBeautified] = useState(!!beautified);
  const spokenRef = useRef(false);

  const handleCommand = useCallback((cmd: string) => {
    console.log('[Profile] Command:', cmd);
    if (cmd.includes('beautify') || cmd.includes('enhance')) doBeautify();
    if (cmd.includes('save') || cmd.includes('next')) { if (companyName.trim()) onSave(); else speak('Enter company name first.'); }
    if (cmd.includes('clear')) { onChange(''); onBeautify(''); setShowBeautified(false); speak('Cleared.'); }
  }, [companyName, onSave, speak, onChange, onBeautify]);

  const voice = useVoice({ onCommand: handleCommand });

  useEffect(() => {
    if (!spokenRef.current) {
      spokenRef.current = true;
      setTimeout(() => speak('Tell me about your business. Say beautify to enhance.'), 500);
    }
  }, [speak]);

  const doBeautify = () => {
    if (!profile.trim() && !companyName.trim()) { speak('Enter info first.'); return; }
    setIsBeautifying(true);
    speak('Beautifying...');
    setTimeout(() => {
      const cat = (profile + companyName).toLowerCase().includes('furniture') ? 'furniture' : (profile + companyName).toLowerCase().includes('light') ? 'lighting' : 'default';
      const t = TEMPLATES[cat];
      const text = `🏢 ${companyName || 'Your Company'}\n\n${t.intro} specializing in ${profile || 'quality products'}.\n\n✨ Why Choose Us:\n• ${t.points[0]}\n• ${t.points[1]}\n• ${t.points[2]}\n\n📍 ${t.close}`;
      onBeautify(text);
      setShowBeautified(true);
      setIsBeautifying(false);
      speak('Profile beautified! Click Save to continue.');
    }, 1500);
  };

  const display = showBeautified && beautified ? beautified : profile;

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '3.5em' }}>🏪</span>
      <h3 style={{ color: THEME.gold, margin: '16px 0' }}>Business Profile</h3>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <input type="text" value={companyName} onChange={e => onCompanyChange(e.target.value)} placeholder="Company Name" style={{ width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '10px', border: '2px solid rgba(184,134,11,0.4)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '1.1em' }} />

        <textarea value={display} onChange={e => { onChange(e.target.value); if (showBeautified) { setShowBeautified(false); onBeautify(''); } }} placeholder="What do you sell?" rows={showBeautified ? 12 : 5} style={{ width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '10px', border: `2px solid ${showBeautified ? '#4CAF50' : 'rgba(184,134,11,0.4)'}`, background: showBeautified ? 'rgba(76,175,80,0.1)' : 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '1em', resize: 'vertical' }} />

        {showBeautified && <div style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid #4CAF50', borderRadius: '8px', padding: '10px', marginBottom: '16px', textAlign: 'left' }}><span style={{ color: '#4CAF50', fontWeight: 600 }}>✨ AI Enhanced</span></div>}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={doBeautify} disabled={isBeautifying} style={{ padding: '14px 28px', background: 'transparent', color: THEME.gold, border: `2px solid ${THEME.gold}`, borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>
            {isBeautifying ? '⏳...' : '✨ Beautify'}
          </button>
          <button onClick={onSave} disabled={!companyName.trim()} style={{ padding: '14px 32px', background: companyName.trim() ? THEME.gold : 'rgba(255,255,255,0.1)', color: companyName.trim() ? '#000' : '#555', border: 'none', borderRadius: '25px', cursor: companyName.trim() ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
            Save →
          </button>
        </div>

        {/* TELEPROMPTER */}
        <Teleprompter
          isListening={voice.isListening}
          isPaused={voice.isPaused}
          transcript={voice.transcript}
          displayText={voice.displayText}
          onResume={voice.resume}
          onPause={voice.pause}
        />
      </div>
    </div>
  );
};

export default VendorProfile;
