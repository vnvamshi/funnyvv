// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR PHONE v2.0
// Voice-first phone capture with digit extraction (not "seven million")
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';

interface VendorPhoneProps {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
  speak: (text: string) => void;
  onVoiceDigits?: (handler: (digits: string) => void) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

// Format phone as 703-338-4931
const formatPhone = (digits: string): string => {
  const clean = digits.replace(/\D/g, '').slice(0, 10);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
};

// Speak phone as "seven zero three — three three eight — four nine three one"
const speakablePhone = (digits: string): string => {
  const clean = digits.replace(/\D/g, '');
  const words: Record<string, string> = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
  };
  const digitWords = clean.split('').map(d => words[d] || d);
  
  if (clean.length >= 10) {
    return `${digitWords.slice(0, 3).join(' ')} — ${digitWords.slice(3, 6).join(' ')} — ${digitWords.slice(6, 10).join(' ')}`;
  }
  return digitWords.join(' ');
};

const VendorPhone: React.FC<VendorPhoneProps> = ({ 
  value, 
  onChange, 
  onNext, 
  speak,
  onVoiceDigits 
}) => {
  const [phone, setPhone] = useState(value);
  const [confirmed, setConfirmed] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // Update phone from parent value
  useEffect(() => {
    if (value && value !== phone.replace(/-/g, '')) {
      setPhone(formatPhone(value));
    }
  }, [value]);

  // Handle voice digits
  const handleVoiceDigits = useCallback((digits: string) => {
    const newPhone = formatPhone(digits);
    setPhone(newPhone);
    onChange(digits.slice(0, 10));
    
    if (digits.length >= 10) {
      // Ask for confirmation
      setAwaitingConfirmation(true);
      speak(`I heard: ${speakablePhone(digits)}. Is that correct? Say "yes" to confirm.`);
    }
  }, [onChange, speak]);

  // Register voice digit handler
  useEffect(() => {
    onVoiceDigits?.(handleVoiceDigits);
  }, [handleVoiceDigits, onVoiceDigits]);

  // Handle typed input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const formatted = formatPhone(digits);
    setPhone(formatted);
    onChange(digits);
    setAwaitingConfirmation(false);
    setConfirmed(false);
  };

  // Handle confirmation
  const handleConfirm = () => {
    setConfirmed(true);
    speak(`Perfect! Sending verification code to ${speakablePhone(phone.replace(/-/g, ''))}. For demo, use code 1 2 3 4 5 6.`);
    setTimeout(onNext, 2000);
  };

  // Handle voice confirmation
  const handleVoiceConfirm = useCallback((cmd: string) => {
    if (awaitingConfirmation && phone.replace(/-/g, '').length >= 10) {
      if (cmd.includes('yes') || cmd.includes('correct') || cmd.includes('confirm') || cmd.includes('right')) {
        handleConfirm();
      } else if (cmd.includes('no') || cmd.includes('wrong') || cmd.includes('change')) {
        setAwaitingConfirmation(false);
        setPhone('');
        onChange('');
        speak("No problem. Please say your phone number again, one digit at a time.");
      }
    }
  }, [awaitingConfirmation, phone, onChange, speak]);

  const phoneDigits = phone.replace(/-/g, '');
  const isValid = phoneDigits.length >= 10;

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📱</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px', marginBottom: '8px' }}>
        Enter Your Phone Number
      </h3>
      <p style={{ color: '#888', marginBottom: '24px', fontSize: '0.95em' }}>
        Say it digit by digit, or type below
      </p>
      
      {/* Phone Input */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <span style={{ 
          color: '#fff', 
          fontSize: '1.3em',
          padding: '14px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '10px'
        }}>
          +1
        </span>
        <input
          type="tel"
          value={phone}
          onChange={handleChange}
          placeholder="703-338-4931"
          style={{ 
            width: '220px', 
            padding: '18px', 
            fontSize: '1.4em', 
            borderRadius: '12px', 
            border: `2px solid ${isValid ? '#00ff00' : THEME.gold}`, 
            background: 'rgba(0,0,0,0.3)', 
            color: '#fff', 
            textAlign: 'center', 
            letterSpacing: '3px',
            fontFamily: 'monospace',
            transition: 'border-color 0.3s'
          }}
        />
      </div>

      {/* Status Message */}
      {awaitingConfirmation && isValid && (
        <div style={{
          background: 'rgba(184,134,11,0.15)',
          border: `1px solid ${THEME.gold}`,
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '20px',
          maxWidth: '350px',
          margin: '0 auto 20px'
        }}>
          <p style={{ color: THEME.goldLight, margin: 0, fontSize: '0.95em' }}>
            📞 <strong>{formatPhone(phoneDigits)}</strong>
          </p>
          <p style={{ color: '#aaa', margin: '8px 0 0', fontSize: '0.85em' }}>
            Say "yes" to confirm or "no" to re-enter
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleConfirm}
        disabled={!isValid || confirmed}
        style={{ 
          padding: '14px 40px', 
          background: isValid && !confirmed ? THEME.gold : '#444', 
          color: isValid && !confirmed ? '#000' : '#888', 
          border: 'none', 
          borderRadius: '25px', 
          cursor: isValid && !confirmed ? 'pointer' : 'not-allowed', 
          fontWeight: 600, 
          fontSize: '1em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          transition: 'all 0.2s'
        }}
      >
        {confirmed ? '✓ Sending OTP...' : 'Send OTP →'}
      </button>

      {/* Voice Hint */}
      <p style={{ 
        color: '#666', 
        fontSize: '0.8em', 
        marginTop: '20px' 
      }}>
        💡 Say: "seven zero three three three eight four nine three one"
      </p>
    </div>
  );
};

export default VendorPhone;
