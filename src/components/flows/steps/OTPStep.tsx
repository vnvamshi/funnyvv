/**
 * OTPStep - Shared OTP verification step
 */

import React, { useState, useEffect } from 'react';
import { StepProps } from '../BaseFlow';

const THEME = { accent: '#B8860B' };

export const OTPStep: React.FC<StepProps> = ({
  data,
  updateData,
  onNext,
  speak,
  isActive
}) => {
  const [otp, setOtp] = useState(data.otp || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isActive) {
      speak("Please enter the 6-digit verification code.");
    }
  }, [isActive]);

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    setError('');
    updateData({ otp: digits });
  };

  const isValid = otp.length === 6;

  const handleVerify = () => {
    if (!isValid) {
      setError('Please enter 6 digits');
      speak("Please enter a 6-digit code.");
      return;
    }
    speak("Verified!");
    onNext();
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <span style={{ fontSize: '3em' }}>🔐</span>
      <h3 style={{ color: THEME.accent, margin: 0 }}>Enter Verification Code</h3>
      <p style={{ color: '#888', fontSize: '0.9em', margin: 0 }}>
        Code sent to {formatPhone(data.phone)}
      </p>

      <input
        id="flow-otp-input"
        type="text"
        value={otp}
        onChange={e => handleChange(e.target.value)}
        placeholder="000000"
        maxLength={6}
        style={{
          padding: '16px 20px',
          fontSize: '2em',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.3)',
          border: `2px solid ${error ? '#ef4444' : isValid ? '#10b981' : THEME.accent}40`,
          borderRadius: 12,
          color: '#fff',
          textAlign: 'center',
          width: 180,
          outline: 'none',
          letterSpacing: 8
        }}
      />

      {error && <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9em' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => speak("Resending code.")}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 25,
            color: '#888',
            cursor: 'pointer'
          }}
        >
          Resend Code
        </button>
        <button
          onClick={handleVerify}
          disabled={!isValid}
          style={{
            padding: '12px 30px',
            background: isValid ? THEME.accent : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 25,
            color: isValid ? '#000' : '#666',
            fontWeight: 600,
            cursor: isValid ? 'pointer' : 'not-allowed'
          }}
        >
          Verify →
        </button>
      </div>
    </div>
  );
};

export default OTPStep;
