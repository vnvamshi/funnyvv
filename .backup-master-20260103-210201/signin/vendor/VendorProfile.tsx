import React, { useState } from 'react';
const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };
interface Props { profile: string; beautified: string; companyName: string; onChange: (p: string) => void; onCompanyChange: (n: string) => void; onBeautify: (b: string) => void; onSave: () => void; speak: (t: string) => void; }
const VendorProfile: React.FC<Props> = ({ profile, beautified, companyName, onChange, onCompanyChange, onBeautify, onSave, speak }) => {
  const [busy, setBusy] = useState(false);
  const beautify = () => { if (!profile && !companyName) { speak("Enter company name first."); return; } setBusy(true); speak("Beautifying..."); setTimeout(() => { onBeautify(`🏢 ${companyName}\n\n${profile.split('\n').map(l => `• ${l}`).join('\n')}\n\n✨ Trusted VistaView Vendor`); setBusy(false); speak("Done! Click Save."); }, 2000); };
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}><span style={{ fontSize: '3em' }}>🏪</span><h3 style={{ color: THEME.gold }}>Business Profile</h3></div>
      <input value={companyName} onChange={(e) => onCompanyChange(e.target.value)} placeholder="Company Name" style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '10px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
      <textarea value={profile} onChange={(e) => onChange(e.target.value)} placeholder="What do you sell?" style={{ width: '100%', height: '80px', padding: '14px', borderRadius: '10px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff', marginBottom: '12px' }} />
      {beautified && <div style={{ background: 'rgba(184,134,11,0.1)', border: `1px solid ${THEME.gold}`, borderRadius: '12px', padding: '16px', marginBottom: '16px', whiteSpace: 'pre-wrap', color: '#fff' }}>{beautified}</div>}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={beautify} disabled={busy} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', borderRadius: '25px', cursor: 'pointer' }}>{busy ? '⏳...' : '✨ Beautify'}</button>
        <button onClick={() => { if (!companyName) { speak("Enter company name."); return; } onSave(); }} style={{ padding: '12px 32px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>Save →</button>
      </div>
    </div>
  );
};
export default VendorProfile;
