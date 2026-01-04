import React, { useState } from 'react';

interface Props { profile: string; beautified: string; companyName?: string; onChange: (p: string) => void; onCompanyChange?: (n: string) => void; onBeautify: (b: string) => void; onSave: () => void; speak: (text: string) => void; }

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorProfile: React.FC<Props> = ({ profile, beautified, companyName = '', onChange, onCompanyChange, onBeautify, onSave, speak }) => {
  const [company, setCompany] = useState(companyName);
  const [showPreview, setShowPreview] = useState(false);

  const beautifyProfile = () => {
    speak("Enhancing your profile with LinkedIn style...");
    const enhanced = `✨ ${company || 'Your Business'}\n\n` + `📍 Trusted VistaView Vendor\n\n` + (profile ? `📝 About Us:\n${profile.split('.').map(s => s.trim()).filter(Boolean).map(s => `• ${s}`).join('\n')}\n\n` : '') + `🏆 Quality Guaranteed\n` + `🚚 Fast Shipping\n` + `💯 Customer Satisfaction`;
    onBeautify(enhanced);
    setShowPreview(true);
    setTimeout(() => speak("Profile beautified! Review and click Save."), 500);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>🏪</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Business Profile</h3>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <input type="text" value={company} onChange={(e) => { setCompany(e.target.value); onCompanyChange?.(e.target.value); }} placeholder="Company Name" style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: `2px solid ${THEME.gold}50`, background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '1em', marginBottom: '16px' }} />
        <textarea value={profile} onChange={(e) => onChange(e.target.value)} placeholder="What do you sell?" rows={4} style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: `2px solid ${THEME.gold}50`, background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '1em', resize: 'vertical', marginBottom: '16px' }} />
        {showPreview && beautified && (
          <div style={{ background: 'rgba(184,134,11,0.1)', border: `1px solid ${THEME.gold}`, borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'left' }}>
            <p style={{ color: THEME.goldLight, margin: '0 0 8px', fontSize: '0.85em' }}>✨ Enhanced Preview:</p>
            <pre style={{ color: '#ccc', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9em' }}>{beautified}</pre>
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={beautifyProfile} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: THEME.gold, borderRadius: '25px', cursor: 'pointer', fontWeight: 500 }}>✨ Beautify</button>
          <button onClick={onSave} style={{ padding: '14px 32px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>Save →</button>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
