import React, { useState, useEffect } from 'react';
import UnifiedAgenticBar from '../common/UnifiedAgenticBar';

interface Props {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
  speak: (t: string) => void;
}

const THEME = { teal: '#004236', gold: '#B8860B' };

const VendorPhone: React.FC<Props> = ({ value, onChange, onNext, speak }) => {
  const [phone, setPhone] = useState(value);

  useEffect(() => { setPhone(value); }, [value]);

  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)}-${digits.slice(3)}`;
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  const handleChange = (p: string) => {
    const formatted = formatPhone(p);
    setPhone(formatted);
    onChange(formatted.replace(/-/g, ''));
  };

  const isValid = phone.replace(/-/g, '').length === 10;

  const handleCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('next') || lower.includes('send') || lower.includes('continue')) {
      if (isValid) onNext();
      else speak("Please enter a valid 10-digit phone number first.");
    }
    if (lower.includes('clear') || lower.includes('reset')) {
      handleChange('');
      speak("Cleared.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <span style={{ fontSize: '3em' }}>📱</span>
      <h3 style={{ color: THEME.gold, margin: 0 }}>Enter Your Phone Number</h3>
      <p style={{ color: '#888', fontSize: '0.9em', margin: 0 }}>Say digits like "seven zero three" or type below</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
        <span style={{ color: '#888', fontSize: '1.2em' }}>+1</span>
        <input
          id="vv-phone-input"
          type="tel"
          value={phone}
          onChange={e => handleChange(e.target.value)}
          placeholder="000-000-0000"
          style={{
            padding: '16px 20px',
            fontSize: '1.5em',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.3)',
            border: `2px solid ${isValid ? '#10b981' : THEME.gold}40`,
            borderRadius: '12px',
            color: '#fff',
            textAlign: 'center',
            width: '220px',
            outline: 'none',
            letterSpacing: '2px'
          }}
        />
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        style={{
          padding: '14px 40px',
          background: isValid ? THEME.gold : 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '30px',
          color: isValid ? '#000' : '#666',
          fontSize: '1em',
          fontWeight: 600,
          cursor: isValid ? 'pointer' : 'not-allowed',
          marginTop: '10px'
        }}
      >
        Send OTP →
      </button>

      {/* UNIFIED AGENTIC BAR */}
      <UnifiedAgenticBar
        context="Phone Entry"
        fields={{
          phone: {
            selector: '#vv-phone-input',
            setter: handleChange
          }
        }}
        onCommand={handleCommand}
        speak={speak}
        hints='Try: "seven zero three..." • "yes" to confirm • "clear" to reset'
        autoStart={true}
      />
    </div>
  );
};

export default VendorPhone;
