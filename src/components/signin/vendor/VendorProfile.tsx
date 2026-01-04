import React, { useState, useEffect } from 'react';
import UnifiedAgenticBar from '../common/UnifiedAgenticBar';

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

const THEME = { teal: '#004236', gold: '#B8860B' };

const VendorProfile: React.FC<Props> = ({
  profile, beautified, companyName,
  onChange, onCompanyChange, onBeautify, onSave, speak
}) => {
  const [localCompany, setLocalCompany] = useState(companyName);
  const [localProfile, setLocalProfile] = useState(profile);
  const [isBeautifying, setIsBeautifying] = useState(false);

  useEffect(() => { setLocalCompany(companyName); }, [companyName]);
  useEffect(() => { setLocalProfile(profile); }, [profile]);

  const handleCompanyChange = (v: string) => {
    setLocalCompany(v);
    onCompanyChange(v);
  };

  const handleProfileChange = (v: string) => {
    setLocalProfile(v);
    onChange(v);
  };

  const handleBeautify = async () => {
    if (!localProfile.trim()) {
      speak("Please enter a description first.");
      return;
    }
    
    setIsBeautifying(true);
    speak("Beautifying your profile...");
    
    try {
      const res = await fetch('http://localhost:1117/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: localProfile, type: 'description' })
      });
      const data = await res.json();
      
      if (data.enhanced) {
        onBeautify(data.enhanced);
        setLocalProfile(data.enhanced);
        speak("Profile enhanced successfully!");
      }
    } catch (err) {
      speak("Couldn't beautify. Try again.");
    }
    
    setIsBeautifying(false);
  };

  const handleCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('beautify') || lower.includes('enhance')) {
      handleBeautify();
    }
    if (lower.includes('save') || lower.includes('next') || lower.includes('continue')) {
      if (localCompany && localProfile) {
        onSave();
      } else {
        speak("Please fill in company name and description first.");
      }
    }
    if (lower.includes('clear')) {
      handleCompanyChange('');
      handleProfileChange('');
      speak("Cleared.");
    }
  };

  const canSave = localCompany.trim() && localProfile.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>🏢</span>
        <h3 style={{ color: THEME.gold, margin: '10px 0 5px' }}>Business Profile</h3>
      </div>

      <div>
        <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: '6px' }}>Company Name</label>
        <input
          id="vv-company-input"
          type="text"
          value={localCompany}
          onChange={e => handleCompanyChange(e.target.value)}
          placeholder="Enter your company name"
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${THEME.gold}40`,
            borderRadius: '10px',
            color: '#fff',
            fontSize: '1em',
            outline: 'none'
          }}
        />
      </div>

      <div>
        <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: '6px' }}>What do you sell?</label>
        <textarea
          id="vv-description-input"
          value={localProfile}
          onChange={e => handleProfileChange(e.target.value)}
          placeholder="Describe your products and services..."
          rows={4}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${THEME.gold}40`,
            borderRadius: '10px',
            color: '#fff',
            fontSize: '1em',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={handleBeautify}
          disabled={isBeautifying || !localProfile.trim()}
          style={{
            padding: '12px 28px',
            background: 'transparent',
            border: `2px solid ${THEME.gold}`,
            borderRadius: '25px',
            color: THEME.gold,
            cursor: isBeautifying ? 'wait' : 'pointer',
            opacity: !localProfile.trim() ? 0.5 : 1
          }}
        >
          {isBeautifying ? '⏳' : '✨'} Beautify
        </button>
        
        <button
          onClick={onSave}
          disabled={!canSave}
          style={{
            padding: '12px 28px',
            background: canSave ? THEME.gold : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '25px',
            color: canSave ? '#000' : '#666',
            fontWeight: 600,
            cursor: canSave ? 'pointer' : 'not-allowed'
          }}
        >
          Save →
        </button>
      </div>

      {/* UNIFIED AGENTIC BAR */}
      <UnifiedAgenticBar
        context="Business Profile"
        fields={{
          companyName: {
            selector: '#vv-company-input',
            setter: handleCompanyChange
          },
          description: {
            selector: '#vv-description-input',
            setter: handleProfileChange
          }
        }}
        onCommand={handleCommand}
        speak={speak}
        hints='Try: "My company is ABC..." • "beautify" to enhance • "save" to continue'
      />
    </div>
  );
};

export default VendorProfile;
