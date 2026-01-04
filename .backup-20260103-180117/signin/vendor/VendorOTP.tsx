// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR OTP v2.0
// Voice-first OTP verification with digit extraction
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface VendorOTPProps {
  onVerified: () => void;
  speak: (text: string) => void;
  onVoiceDigits?: (handler: (digits: string) => void) => void;
  phone?: string;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorOTP: React.FC<VendorOTPProps> = ({ 
  onVerified, 
  speak,
  onVoiceDigits,
  phone 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if OTP is complete and correct
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6) {
      if (code === '123456') {
        setVerified(true);
        setError(false);
        speak("Verified! Welcome in. Let's build your Vendor profile.");
        setTimeout(onVerified, 1500);
      } else {
        setError(true);
        speak("That code doesn't match. Try 1 2 3 4 5 6 for demo.");
        setTimeout(() => {
          setOtp(['', '', '', '', '', '']);
          setError(false);
          inputRefs.current[0]?.focus();
        }, 2000);
      }
    }
  }, [otp, onVerified, speak]);

  // Handle voice digits
  const handleVoiceDigits = useCallback((digits: string) => {
    const clean = digits.slice(0, 6).split('');
    const newOtp = [...otp];
    
    clean.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    
    setOtp(newOtp);
    
    if (clean.length < 6) {
      speak(`Got ${clean.length} digits. Keep going!`);
    }
  }, [otp, speak]);

  // Register voice handler
  useEffect(() => {
    onVoiceDigits?.(handleVoiceDigits);
  }, [handleVoiceDigits, onVoiceDigits]);

  // Handle single input change
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>🔐</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px', marginBottom: '8px' }}>
        Enter Verification Code
      </h3>
      <p style={{ color: '#888', marginBottom: '8px', fontSize: '0.95em' }}>
        {phone ? `Sent to +1 ${phone}` : 'Check your phone'}
      </p>
      <p style={{ 
        color: THEME.goldLight, 
        marginBottom: '24px', 
        fontSize: '0.9em',
        background: 'rgba(184,134,11,0.15)',
        padding: '8px 16px',
        borderRadius: '20px',
        display: 'inline-block'
      }}>
        Demo code: <strong>123456</strong>
      </p>
      
      {/* OTP Input Grid */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px',
        marginBottom: '24px'
      }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={verified}
            style={{ 
              width: '50px', 
              height: '60px', 
              padding: '0', 
              fontSize: '1.8em', 
              borderRadius: '12px', 
              border: `2px solid ${
                verified ? '#00ff00' : 
                error ? '#ff4444' : 
                digit ? THEME.gold : 
                'rgba(184,134,11,0.4)'
              }`, 
              background: verified ? 'rgba(0,255,0,0.1)' : 'rgba(0,0,0,0.3)', 
              color: '#fff', 
              textAlign: 'center',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          />
        ))}
      </div>

      {/* Status */}
      {verified && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: '#00ff00',
          fontSize: '1.1em'
        }}>
          <span style={{ fontSize: '1.5em' }}>✅</span>
          <span>Verified!</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: '#ff4444',
          fontSize: '0.95em'
        }}>
          <span>❌ Invalid code. Try again.</span>
        </div>
      )}

      {/* Resend Link */}
      {!verified && (
        <button
          onClick={() => speak("Resending code. For demo, use 1 2 3 4 5 6.")}
          style={{
            background: 'none',
            border: 'none',
            color: THEME.gold,
            cursor: 'pointer',
            fontSize: '0.9em',
            marginTop: '16px',
            textDecoration: 'underline'
          }}
        >
          Didn't receive code? Resend
        </button>
      )}

      {/* Voice Hint */}
      <p style={{ 
        color: '#666', 
        fontSize: '0.8em', 
        marginTop: '20px' 
      }}>
        💡 Say: "one two three four five six"
      </p>
    </div>
  );
};

export default VendorOTP;
