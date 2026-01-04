import React, { useState } from 'react';
import UnifiedAgenticBar from '../common/UnifiedAgenticBar';

interface Props {
  phone: string;
  onVerified: () => void;
  speak: (t: string) => void;
}

const THEME = { teal: '#004236', gold: '#B8860B' };

const VendorOTP: React.FC<Props> = ({ phone, onVerified, speak }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleChange = (c: string) => {
    const digits = c.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError('');
  };

  const verify = () => {
    if (code.length !== 6) {
      setError('Please enter 6 digits');
      speak("Please enter a 6-digit code.");
      return;
    }
    // For demo, accept any 6 digits
    speak("Verified!");
    onVerified();
  };

  const handleCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('verify') || lower.includes('confirm') || lower.includes('next')) {
      verify();
    }
    if (lower.includes('resend')) {
      speak("Resending code.");
    }
    if (lower.includes('clear')) {
      setCode('');
      speak("Cleared.");
    }
  };

  const isValid = code.length === 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <span style={{ fontSize: '3em' }}>🔐</span>
      <h3 style={{ color: THEME.gold, margin: 0 }}>Enter Verification Code</h3>
      <p style={{ color: '#888', fontSize: '0.9em', margin: 0 }}>Code sent to {phone}</p>

      <input
        id="vv-otp-input"
        type="text"
        value={code}
        onChange={e => handleChange(e.target.value)}
        placeholder="000000"
        maxLength={6}
        style={{
          padding: '16px 20px',
          fontSize: '2em',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.3)',
          border: `2px solid ${error ? '#ef4444' : isValid ? '#10b981' : THEME.gold}40`,
          borderRadius: '12px',
          color: '#fff',
          textAlign: 'center',
          width: '180px',
          outline: 'none',
          letterSpacing: '8px'
        }}
      />

      {error && <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9em' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => speak("Resending code.")}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '25px',
            color: '#888',
            cursor: 'pointer'
          }}
        >
          Resend Code
        </button>
        <button
          onClick={verify}
          disabled={!isValid}
          style={{
            padding: '12px 30px',
            background: isValid ? THEME.gold : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '25px',
            color: isValid ? '#000' : '#666',
            fontWeight: 600,
            cursor: isValid ? 'pointer' : 'not-allowed'
          }}
        >
          Verify →
        </button>
      </div>

      {/* UNIFIED AGENTIC BAR */}
      <UnifiedAgenticBar
        context="OTP Verification"
        fields={{
          otp: {
            selector: '#vv-otp-input',
            setter: handleChange
          }
        }}
        onCommand={handleCommand}
        speak={speak}
        hints='Say digits: "one two three four five six" • "verify" to confirm'
      />
    </div>
  );
};

export default VendorOTP;
