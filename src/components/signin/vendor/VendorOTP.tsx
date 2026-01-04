import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useVoice, extractDigits } from '../common/useVoice';
import Teleprompter from '../common/Teleprompter';

interface Props { phone: string; onVerified: () => void; speak: (t: string) => void; }
const THEME = { gold: '#B8860B' };

const VendorOTP: React.FC<Props> = ({ phone, onVerified, speak }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const spokenRef = useRef(false);

  const handleDigits = useCallback((digits: string) => {
    console.log('[OTP] Digits:', digits);
    setOtp(prev => {
      const filled = prev.filter(d => d).length;
      const next = [...prev];
      let idx = filled;
      for (const d of digits) { if (idx < 6) { next[idx] = d; idx++; } }
      if (next.filter(d => d).length === 6) {
        const code = next.join('');
        setTimeout(() => { if (code === '123456') { speak('Verified!'); onVerified(); } else { speak('Invalid code.'); setError('Invalid'); } }, 300);
      }
      return next;
    });
  }, [speak, onVerified]);

  const handleCommand = useCallback((cmd: string) => {
    if (cmd.includes('clear')) { setOtp(['','','','','','']); setError(''); speak('Cleared.'); }
  }, [speak]);

  const voice = useVoice({ onDigits: handleDigits, onCommand: handleCommand });

  useEffect(() => { if (!spokenRef.current) { spokenRef.current = true; setTimeout(() => speak('Enter the 6-digit code. Demo: one two three four five six.'), 500); } }, [speak]);

  const handleInput = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d)) { const code = next.join(''); if (code === '123456') { speak('Verified!'); onVerified(); } else setError('Invalid'); }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>🔐</span>
      <h3 style={{ color: THEME.gold, margin: '16px 0 8px' }}>Enter Verification Code</h3>
      <p style={{ color: '#888', marginBottom: '20px' }}>Sent to {phone}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
        {otp.map((d, i) => <input key={i} ref={el => inputRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleInput(i, e.target.value)} style={{ width: '50px', height: '60px', fontSize: '1.8em', textAlign: 'center', borderRadius: '10px', border: `2px solid ${d ? THEME.gold : 'rgba(184,134,11,0.4)'}`, background: 'rgba(0,0,0,0.3)', color: '#fff' }} />)}
      </div>
      {error && <p style={{ color: '#f44336' }}>{error}</p>}
      <p style={{ color: '#555', fontSize: '0.85em' }}>💡 Demo: 123456</p>
      <Teleprompter isListening={voice.isListening} isPaused={voice.isPaused} transcript={voice.transcript} displayText={voice.displayText} onResume={voice.resume} onPause={voice.pause} />
    </div>
  );
};

export default VendorOTP;
