/**
 * ProfileStep - Shared profile entry step
 */

import React, { useState, useEffect } from 'react';
import { StepProps } from '../BaseFlow';

const THEME = { accent: '#B8860B' };

interface ProfileStepProps extends StepProps {
  entityType?: 'vendor' | 'builder' | 'agent';
  titleOverride?: string;
  descriptionLabel?: string;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({
  data,
  updateData,
  onNext,
  speak,
  isActive,
  entityType = 'vendor',
  titleOverride,
  descriptionLabel = 'What do you sell?'
}) => {
  const [companyName, setCompanyName] = useState(data.companyName || '');
  const [profile, setProfile] = useState(data.profile || '');
  const [isBeautifying, setIsBeautifying] = useState(false);

  useEffect(() => {
    if (isActive) {
      speak(`Tell me about your ${entityType === 'builder' ? 'construction business' : entityType === 'agent' ? 'real estate services' : 'business'}.`);
    }
  }, [isActive, entityType]);

  const handleCompanyChange = (value: string) => {
    setCompanyName(value);
    updateData({ companyName: value });
  };

  const handleProfileChange = (value: string) => {
    setProfile(value);
    updateData({ profile: value });
  };

  const handleBeautify = async () => {
    if (!profile.trim()) {
      speak("Please enter a description first.");
      return;
    }
    
    setIsBeautifying(true);
    speak("Beautifying your profile...");
    
    try {
      const res = await fetch('http://localhost:1117/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: profile, type: 'description' })
      });
      const result = await res.json();
      
      if (result.enhanced) {
        setProfile(result.enhanced);
        updateData({ profile: result.enhanced, beautifiedProfile: result.enhanced });
        speak("Profile enhanced!");
      }
    } catch (err) {
      speak("Couldn't beautify. Try again.");
    }
    
    setIsBeautifying(false);
  };

  const handleSave = async () => {
    if (!companyName.trim() || !profile.trim()) {
      speak("Please fill in all fields.");
      return;
    }
    
    speak("Saving profile...");
    
    try {
      await fetch(`http://localhost:1117/api/${entityType}s`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.phone,
          profile,
          companyName,
          type: entityType
        })
      });
    } catch (e) {
      console.error(e);
    }
    
    onNext();
  };

  const canSave = companyName.trim() && profile.trim();

  const titles: Record<string, string> = {
    vendor: 'Business Profile',
    builder: 'Builder Profile',
    agent: 'Agent Profile'
  };

  const icons: Record<string, string> = {
    vendor: '🏢',
    builder: '🏗️',
    agent: '🏠'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>{icons[entityType]}</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>
          {titleOverride || titles[entityType]}
        </h3>
      </div>

      <div>
        <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: 6 }}>
          {entityType === 'agent' ? 'Agency Name' : 'Company Name'}
        </label>
        <input
          id="flow-company-input"
          type="text"
          value={companyName}
          onChange={e => handleCompanyChange(e.target.value)}
          placeholder={`Enter your ${entityType === 'agent' ? 'agency' : 'company'} name`}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${THEME.accent}40`,
            borderRadius: 10,
            color: '#fff',
            fontSize: '1em',
            outline: 'none'
          }}
        />
      </div>

      <div>
        <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: 6 }}>
          {descriptionLabel}
        </label>
        <textarea
          id="flow-profile-input"
          value={profile}
          onChange={e => handleProfileChange(e.target.value)}
          placeholder={entityType === 'builder' ? 'Describe your construction services...' : entityType === 'agent' ? 'Describe your real estate services...' : 'Describe your products and services...'}
          rows={4}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${THEME.accent}40`,
            borderRadius: 10,
            color: '#fff',
            fontSize: '1em',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button
          onClick={handleBeautify}
          disabled={isBeautifying || !profile.trim()}
          style={{
            padding: '12px 28px',
            background: 'transparent',
            border: `2px solid ${THEME.accent}`,
            borderRadius: 25,
            color: THEME.accent,
            cursor: isBeautifying ? 'wait' : 'pointer',
            opacity: !profile.trim() ? 0.5 : 1
          }}
        >
          {isBeautifying ? '⏳' : '✨'} Beautify
        </button>
        
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            padding: '12px 28px',
            background: canSave ? THEME.accent : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 25,
            color: canSave ? '#000' : '#666',
            fontWeight: 600,
            cursor: canSave ? 'pointer' : 'not-allowed'
          }}
        >
          Save →
        </button>
      </div>
    </div>
  );
};

export default ProfileStep;
