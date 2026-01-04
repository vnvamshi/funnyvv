import React, { useCallback, useEffect, useRef } from 'react';
import { useVoice, extractDigits, formatPhoneNumber } from '../common/useVoice';
import Teleprompter from '../common/Teleprompter';

interface Props {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
  speak: (text: string) => void;
}

const THEME = { gold: '#B8860B' };

const VendorPhone: React.FC<Props> = ({ value, onChange, onNext, speak }) => {
  const spokenRef = useRef(false);

  const handleDigits = useCallback((digits: string) => {
    console.log('[Phone] Got digits:', digits);
    const cur = value.replace(/\D/g, '');
    const newVal = (cur + digits).slice(0, 10);
    onChange(newVal);
    if (newVal.length === 10) speak(`Got it! ${formatPhoneNumber(newVal)}. Say yes to confirm.`);
    else if (digits) speak(`${digits}. ${10 - newVal.length} more.`);
  }, [value, onChange, speak]);

  const handleCommand = useCallback((cmd: string) => {
    console.log('[Phone] Command:', cmd);
    if ((cmd.includes('yes') || cmd.includes('send') || cmd.includes('confirm')) && value.replace(/\D/g,'').length >= 10) {
      speak('Sending code.');
      onNext();
    }
    if (cmd.includes('clear') || cmd.includes('reset')) {
      onChange('');
      speak('Cleared.');
    }
  }, [value, onChange, onNext, speak]);

  const voice = useVoice({ onDigits: handleDigits, onCommand: handleCommand });

  useEffect(() => {
    if (!spokenRef.current) {
      spokenRef.current = true;
      setTimeout(() => speak('Tell me your phone number. Say each digit.'), 500);
    }
  }, [speak]);

  const canSubmit = value.replace(/\D/g, '').length >= 10;

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📱</span>
      <h3 style={{ color: THEME.gold, margin: '16px 0 8px' }}>Enter Your Phone Number</h3>
      <p style={{ color: '#888', marginBottom: '20px' }}>Say digits like "seven zero three..." or type below</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ color: '#888', fontSize: '1.4em' }}>+1</span>
        <input
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="000-000-0000"
          style={{ fontSize: '1.8em', padding: '16px 24px', borderRadius: '12px', border: `2px solid ${canSubmit ? THEME.gold : 'rgba(184,134,11,0.5)'}`, background: 'rgba(0,0,0,0.3)', color: '#fff', textAlign: 'center', width: '280px', fontFamily: 'monospace' }}
        />
      </div>

      <button onClick={onNext} disabled={!canSubmit} style={{ padding: '16px 48px', background: canSubmit ? THEME.gold : 'rgba(255,255,255,0.1)', color: canSubmit ? '#000' : '#555', border: 'none', borderRadius: '30px', cursor: canSubmit ? 'pointer' : 'not-allowed', fontSize: '1.1em', fontWeight: 600 }}>
        Send OTP →
      </button>

      <p style={{ color: '#555', margin: '20px 0 0', fontSize: '0.85em' }}>💡 Say: "seven zero three three three eight four nine three one"</p>

      {/* TELEPROMPTER */}
      <Teleprompter
        isListening={voice.isListening}
        isPaused={voice.isPaused}
        transcript={voice.transcript}
        displayText={voice.displayText}
        onResume={voice.resume}
        onPause={voice.pause}
      />
    </div>
  );
};

export default VendorPhone;
