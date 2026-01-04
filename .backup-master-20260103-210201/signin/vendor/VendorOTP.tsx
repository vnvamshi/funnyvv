// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR OTP v3.0 (FIXED)
// RULE-004: Voice digit entry with auto-tab
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface VendorOTPProps {
  onVerified: () => void;
  speak: (text: string) => void;
  onVoiceDigits?: (handler: (digits: string) => void) => void;
  phone: string;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };
const DEMO_OTP = '123456';

const VendorOTP: React.FC<VendorOTPProps> = ({ onVerified, speak, onVoiceDigits, phone }) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // CRITICAL: Handle voice digits - fill boxes and auto-tab
  const handleVoiceDigits = useCallback((digits: string) => {
    console.log('[VendorOTP] Received voice digits:', digits);
    
    const cleanDigits = digits.replace(/\D/g, '');
    if (cleanDigits.length === 0) return;
    
    setError('');
    const newOtp = [...otp];
    
    // Find first empty slot
    let startIdx = newOtp.findIndex(d => d === '');
    if (startIdx === -1) startIdx = 0; // If all filled, start from beginning
    
    // Fill in digits
    for (let i = 0; i < cleanDigits.length && startIdx + i < 6; i++) {
      newOtp[startIdx + i] = cleanDigits[i];
    }
    
    setOtp(newOtp);
    speak(cleanDigits.split('').join(' '));
    
    // Focus next empty or last
    const nextEmpty = newOtp.findIndex(d => d === '');
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      // Auto-verify when complete
      setTimeout(() => verifyOTP(newOtp.join('')), 500);
    }
  }, [otp, speak]);

  // Register handler
  useEffect(() => {
    console.log('[VendorOTP] Registering voice digit handler');
    onVoiceDigits?.(handleVoiceDigits);
  }, [handleVoiceDigits, onVoiceDigits]);

  // Handle typed input with AUTO-TAB
  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    // AUTO-TAB to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (digit && newOtp.every(d => d !== '')) {
      setTimeout(() => verifyOTP(newOtp.join('')), 300);
    }
  };

  // Handle backspace - go to previous
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      if (pasted.length === 6) {
        setTimeout(() => verifyOTP(pasted), 300);
      }
    }
  };

  // Verify OTP
  const verifyOTP = (code: string) => {
    if (verifying || verified) return;
    
    setVerifying(true);
    speak("Verifying code...");
    
    setTimeout(() => {
      if (code === DEMO_OTP) {
        setVerified(true);
        speak("Code verified! Welcome aboard!");
        setTimeout(onVerified, 1500);
      } else {
        setError('Incorrect code. Use 123456 for demo.');
        speak("That code is incorrect. For demo, enter 1 2 3 4 5 6.");
        setVerifying(false);
        // Clear and focus first
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }, 1000);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>🔐</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px', marginBottom: '8px' }}>
        Enter Verification Code
      </h3>
      <p style={{ color: '#888', marginBottom: '8px', fontSize: '0.95em' }}>
        Sent to <strong style={{ color: '#fff' }}>{phone}</strong>
      </p>
      <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.85em' }}>
        Demo code: <strong style={{ color: THEME.goldLight }}>1 2 3 4 5 6</strong>
      </p>

      {/* OTP Input Boxes */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={verifying || verified}
            autoFocus={index === 0}
            style={{
              width: '50px',
              height: '60px',
              fontSize: '1.8em',
              textAlign: 'center',
              borderRadius: '12px',
              border: `2px solid ${error ? '#e74c3c' : digit ? '#4CAF50' : THEME.gold}`,
              background: digit ? 'rgba(76,175,80,0.1)' : 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontWeight: 600,
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: '#e74c3c', fontSize: '0.9em', marginBottom: '16px' }}>
          ⚠️ {error}
        </p>
      )}

      {/* Status */}
      {verifying && !verified && (
        <div style={{ color: THEME.goldLight, marginBottom: '16px' }}>
          ⏳ Verifying...
        </div>
      )}
      {verified && (
        <div style={{ color: '#4CAF50', marginBottom: '16px', fontSize: '1.1em' }}>
          ✓ Verified! Continuing...
        </div>
      )}

      {/* Resend */}
      {!verified && !verifying && (
        <button
          onClick={() => speak("A new code has been sent.")}
          style={{
            background: 'transparent',
            border: 'none',
            color: THEME.gold,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '0.9em'
          }}
        >
          Resend Code
        </button>
      )}

      {/* Voice hint */}
      <p style={{ color: '#666', fontSize: '0.8em', marginTop: '20px' }}>
        💡 Say: "one two three four five six"
      </p>
    </div>
  );
};

export default VendorOTP;
