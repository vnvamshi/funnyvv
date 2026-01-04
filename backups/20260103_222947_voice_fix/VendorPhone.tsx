import React, { useCallback, useEffect, useRef } from 'react';
import { useVoice, extractDigits, formatPhoneNumber } from '../common/useVoice';

interface Props {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
  speak: (text: string) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorPhone: React.FC<Props> = ({ value, onChange, onNext, speak }) => {
  const spokenRef = useRef(false);

  const handleDigits = useCallback((digits: string) => {
    console.log('[VendorPhone] 📱 Received digits:', digits);
    const currentDigits = value.replace(/\D/g, '');
    const newValue = (currentDigits + digits).slice(0, 10);
    console.log('[VendorPhone] New phone value:', newValue);
    onChange(newValue);
    
    if (newValue.length === 10) {
      speak(`Got it! ${formatPhoneNumber(newValue)}. Say yes to confirm or click Send OTP.`);
    } else if (newValue.length > 0 && digits.length > 0) {
      speak(`${digits}. ${10 - newValue.length} more digits needed.`);
    }
  }, [value, onChange, speak]);

  const handleCommand = useCallback((cmd: string) => {
    console.log('[VendorPhone] 🎯 Command:', cmd);
    const c = cmd.toLowerCase();
    const phoneDigits = value.replace(/\D/g, '');
    
    if ((c.includes('yes') || c.includes('confirm') || c.includes('send') || c.includes('next')) && phoneDigits.length >= 10) {
      speak('Sending verification code.');
      onNext();
    }
    if (c.includes('clear') || c.includes('reset') || c.includes('start over')) {
      onChange('');
      speak('Cleared. Say your phone number again.');
    }
  }, [value, onChange, onNext, speak]);

  // Voice hook with handlers
  const voice = useVoice({
    onDigits: handleDigits,
    onCommand: handleCommand,
    autoStart: true
  });

  // Welcome message on mount
  useEffect(() => {
    if (!spokenRef.current) {
      spokenRef.current = true;
      setTimeout(() => {
        speak('Tell me your phone number. Say each digit clearly, like seven zero three.');
      }, 800);
    }
  }, [speak]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(digits);
  };

  const canSubmit = value.replace(/\D/g, '').length >= 10;

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📱</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px', marginBottom: '8px' }}>
        Enter Your Phone Number
      </h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        Say digits like "seven zero three..." or type below
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ color: '#888', fontSize: '1.4em' }}>+1</span>
        <input
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={handleInputChange}
          placeholder="000-000-0000"
          style={{
            fontSize: '1.8em',
            padding: '16px 24px',
            borderRadius: '12px',
            border: `2px solid ${canSubmit ? THEME.gold : 'rgba(184,134,11,0.5)'}`,
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            textAlign: 'center',
            width: '280px',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}
        />
        {value && (
          <button 
            onClick={() => { onChange(''); speak('Cleared.'); }}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#888', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2em' }}
          >✕</button>
        )}
      </div>

      {canSubmit && (
        <p style={{ color: THEME.goldLight, marginBottom: '16px' }}>
          ✓ Say "yes" to confirm or click Send OTP
        </p>
      )}

      <button
        onClick={onNext}
        disabled={!canSubmit}
        style={{
          padding: '16px 48px',
          background: canSubmit ? THEME.gold : 'rgba(255,255,255,0.1)',
          color: canSubmit ? '#000' : '#555',
          border: 'none',
          borderRadius: '30px',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontSize: '1.1em',
          fontWeight: 600
        }}
      >Send OTP →</button>

      <p style={{ color: '#555', marginTop: '24px', fontSize: '0.85em' }}>
        💡 Try saying: "seven zero three three three eight four nine three one"
      </p>
      
      {/* Voice Status */}
      <div style={{ 
        marginTop: '16px', 
        padding: '10px 16px', 
        background: voice.isListening ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)', 
        borderRadius: '8px',
        border: `1px solid ${voice.isListening ? '#4CAF50' : 'transparent'}`
      }}>
        <span style={{ color: voice.isListening ? '#4CAF50' : '#888' }}>
          {voice.isListening ? '🎤 Listening - speak now!' : '⏸️ Voice paused'}
        </span>
        {voice.transcript && (
          <div style={{ color: '#aaa', marginTop: '4px', fontSize: '0.85em' }}>
            Heard: "{voice.transcript}"
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorPhone;
