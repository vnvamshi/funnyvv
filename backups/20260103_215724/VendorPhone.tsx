// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR PHONE v12.0 - WITH DEBUG
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useCallback, useRef } from 'react';

interface Props {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
  speak: (text: string) => void;
  onVoiceDigits: (handler: (digits: string) => void) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const formatPhone = (d: string): string => {
  const c = d.replace(/\D/g, '').slice(0, 10);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0,3)}-${c.slice(3)}`;
  return `${c.slice(0,3)}-${c.slice(3,6)}-${c.slice(6)}`;
};

const VendorPhone: React.FC<Props> = ({ value, onChange, onNext, speak, onVoiceDigits }) => {
  const handlerRegistered = useRef(false);
  
  // Create handler that captures current value via closure
  const handleVoiceDigits = useCallback((digits: string) => {
    console.log('%c[VendorPhone] ==============================', 'color: magenta; font-size: 14px');
    console.log('%c[VendorPhone] RECEIVED DIGITS: ' + digits, 'color: magenta; font-size: 16px; font-weight: bold');
    console.log('%c[VendorPhone] Current value: ' + value, 'color: magenta');
    
    // Get current value from DOM to avoid stale closure
    const input = document.querySelector('input[type="tel"]') as HTMLInputElement;
    const currentValue = input?.value?.replace(/\D/g, '') || value.replace(/\D/g, '');
    
    const newValue = (currentValue + digits).slice(0, 10);
    
    console.log('%c[VendorPhone] New value: ' + newValue, 'color: magenta; font-weight: bold');
    console.log('%c[VendorPhone] ==============================', 'color: magenta; font-size: 14px');
    
    onChange(newValue);
    
    // Announce progress
    if (newValue.length === 10) {
      speak(`Got it! ${formatPhone(newValue)}. Say yes to confirm or click Send OTP.`);
    } else if (newValue.length >= 3) {
      speak(`${digits}. Keep going, ${10 - newValue.length} more digits.`);
    }
  }, [onChange, speak, value]);

  // Register handler ONCE on mount, then update it
  useEffect(() => {
    console.log('%c[VendorPhone] Registering voice digit handler', 'color: orange; font-weight: bold');
    onVoiceDigits(handleVoiceDigits);
    handlerRegistered.current = true;
  }, [handleVoiceDigits, onVoiceDigits]);

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
          value={formatPhone(value)}
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
            onClick={() => onChange('')}
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
      >
        Send OTP →
      </button>

      <p style={{ color: '#555', marginTop: '24px', fontSize: '0.85em' }}>
        💡 Try saying: "seven zero three three three eight four nine three one"
      </p>
      
      {/* Debug info */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '8px',
        fontSize: '0.75em',
        color: '#666',
        textAlign: 'left'
      }}>
        <strong style={{ color: '#888' }}>Debug:</strong> Handler registered: {handlerRegistered.current ? '✅' : '❌'} | 
        Current digits: {value.replace(/\D/g, '')} ({value.replace(/\D/g, '').length}/10)
      </div>
    </div>
  );
};

export default VendorPhone;
