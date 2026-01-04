// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR PHONE v3.0 (FIXED)
// RULE-004: Voice digit capture working
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { formatPhoneNumber, speakablePhone } from '../common/useVoice';

interface VendorPhoneProps {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
  speak: (text: string) => void;
  onVoiceDigits?: (handler: (digits: string) => void) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorPhone: React.FC<VendorPhoneProps> = ({ 
  value, 
  onChange, 
  onNext, 
  speak,
  onVoiceDigits 
}) => {
  const [phone, setPhone] = useState(value || '');
  const [confirmed, setConfirmed] = useState(false);

  // Sync with parent value
  useEffect(() => {
    if (value && value !== phone.replace(/-/g, '')) {
      setPhone(formatPhoneNumber(value));
    }
  }, [value]);

  // CRITICAL: Register voice digit handler - this is what was broken
  const handleVoiceDigits = useCallback((digits: string) => {
    console.log('[VendorPhone] Received voice digits:', digits);
    
    // Get current digits and append new ones
    const currentDigits = phone.replace(/\D/g, '');
    const newDigits = (currentDigits + digits).slice(0, 10);
    const formatted = formatPhoneNumber(newDigits);
    
    console.log('[VendorPhone] Current:', currentDigits, 'New:', newDigits);
    
    setPhone(formatted);
    onChange(newDigits);
    
    // Feedback
    if (newDigits.length >= 10) {
      speak(`Got it: ${speakablePhone(newDigits)}. Is that correct? Say yes to confirm.`);
    } else if (digits.length > 0) {
      // Echo back the digits heard
      speak(digits.split('').join(' '));
    }
  }, [phone, onChange, speak]);

  // Register handler with parent VendorFlow
  useEffect(() => {
    console.log('[VendorPhone] Registering voice digit handler');
    onVoiceDigits?.(handleVoiceDigits);
  }, [handleVoiceDigits, onVoiceDigits]);

  // Handle typed input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    const formatted = formatPhoneNumber(digits);
    setPhone(formatted);
    onChange(digits);
    setConfirmed(false);
  };

  // Handle confirmation and proceed
  const handleConfirm = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      setConfirmed(true);
      speak(`Sending verification code to ${speakablePhone(digits)}. For demo, enter 1 2 3 4 5 6.`);
      setTimeout(onNext, 1500);
    }
  };

  // Clear phone
  const handleClear = () => {
    setPhone('');
    onChange('');
    setConfirmed(false);
    speak("Cleared. Say your phone number again.");
  };

  const phoneDigits = phone.replace(/\D/g, '');
  const isValid = phoneDigits.length >= 10;

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📱</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px', marginBottom: '8px' }}>
        Enter Your Phone Number
      </h3>
      <p style={{ color: '#888', marginBottom: '24px', fontSize: '0.95em' }}>
        Say digits like "seven zero three..." or type below
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
            border: `2px solid ${isValid ? '#4CAF50' : THEME.gold}`, 
            background: 'rgba(0,0,0,0.3)', 
            color: '#fff', 
            textAlign: 'center', 
            letterSpacing: '3px',
            fontFamily: 'monospace'
          }}
        />
        {phone && (
          <button
            onClick={handleClear}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#888',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2em'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Confirmation hint */}
      {isValid && !confirmed && (
        <div style={{
          background: 'rgba(76,175,80,0.15)',
          border: '1px solid #4CAF50',
          borderRadius: '12px',
          padding: '12px 20px',
          marginBottom: '20px',
          maxWidth: '350px',
          margin: '0 auto 20px'
        }}>
          <p style={{ color: '#4CAF50', margin: 0, fontSize: '0.9em' }}>
            ✓ Say "yes" to confirm or click Send OTP
          </p>
        </div>
      )}

      {/* Send OTP Button */}
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
          margin: '0 auto',
          display: 'block'
        }}
      >
        {confirmed ? '✓ Sending OTP...' : 'Send OTP →'}
      </button>

      {/* Voice hint */}
      <p style={{ color: '#666', fontSize: '0.8em', marginTop: '20px' }}>
        💡 Try saying: "seven zero three three three eight four nine three one"
      </p>
    </div>
  );
};

export default VendorPhone;
