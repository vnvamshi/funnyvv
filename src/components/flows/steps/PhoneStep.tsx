/**
 * PhoneStep - Shared phone number entry step
 */

import React, { useState, useEffect } from 'react';
import { StepProps } from '../BaseFlow';

const THEME = { accent: '#B8860B' };

export const PhoneStep: React.FC<StepProps> = ({
  data,
  updateData,
  onNext,
  speak,
  isActive
}) => {
  const [phone, setPhone] = useState(data.phone || '');

  useEffect(() => {
    if (isActive) {
      speak("Please enter your phone number.");
    }
  }, [isActive]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)}-${digits.slice(3)}`;
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  const handleChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
    updateData({ phone: formatted.replace(/-/g, '') });
  };

  const isValid = phone.replace(/-/g, '').length === 10;

  const handleSubmit = () => {
    if (isValid) {
      speak("Sending verification code.");
      onNext();
    } else {
      speak("Please enter a valid 10-digit phone number.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <span style={{ fontSize: '3em' }}>📱</span>
      <h3 style={{ color: THEME.accent, margin: 0 }}>Enter Your Phone Number</h3>
      <p style={{ color: '#888', fontSize: '0.9em', margin: 0, textAlign: 'center' }}>
        Say digits like "seven zero three" or type below
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <span style={{ color: '#888', fontSize: '1.2em' }}>+1</span>
        <input
          id="flow-phone-input"
          type="tel"
          value={phone}
          onChange={e => handleChange(e.target.value)}
          placeholder="000-000-0000"
          style={{
            padding: '16px 20px',
            fontSize: '1.5em',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.3)',
            border: `2px solid ${isValid ? '#10b981' : THEME.accent}40`,
            borderRadius: 12,
            color: '#fff',
            textAlign: 'center',
            width: 220,
            outline: 'none',
            letterSpacing: 2
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        style={{
          padding: '14px 40px',
          background: isValid ? THEME.accent : 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 30,
          color: isValid ? '#000' : '#666',
          fontSize: '1em',
          fontWeight: 600,
          cursor: isValid ? 'pointer' : 'not-allowed',
          marginTop: 10
        }}
      >
        Send OTP →
      </button>
    </div>
  );
};

export default PhoneStep;
