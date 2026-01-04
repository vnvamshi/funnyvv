import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVoice, extractDigits, formatPhoneNumber } from '../common/useVoice';

interface Props {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
  speak: (text: string) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorPhone: React.FC<Props> = ({ value, onChange, onNext, speak }) => {
  const [recentTranscripts, setRecentTranscripts] = useState<string[]>([]);
  const spokenRef = useRef(false);

  // Handle digits from voice
  const handleDigits = useCallback((digits: string) => {
    console.log('[VendorPhone] ═══════════════════════════════════');
    console.log('[VendorPhone] 📱 RECEIVED DIGITS:', digits);
    console.log('[VendorPhone] Current value:', value);
    
    const currentDigits = value.replace(/\D/g, '');
    const newValue = (currentDigits + digits).slice(0, 10);
    
    console.log('[VendorPhone] New value:', newValue);
    console.log('[VendorPhone] ═══════════════════════════════════');
    
    onChange(newValue);
    
    if (newValue.length === 10) {
      speak(`Got it! ${formatPhoneNumber(newValue)}. Say yes to confirm.`);
    } else if (digits.length > 0) {
      speak(`${digits}. ${10 - newValue.length} more.`);
    }
  }, [value, onChange, speak]);

  // Handle voice commands
  const handleCommand = useCallback((cmd: string) => {
    console.log('[VendorPhone] 🎯 COMMAND:', cmd);
    const c = cmd.toLowerCase();
    const phoneDigits = value.replace(/\D/g, '');
    
    if ((c.includes('yes') || c.includes('confirm') || c.includes('send') || c.includes('next') || c.includes('okay') || c.includes('ok')) && phoneDigits.length >= 10) {
      speak('Sending verification code.');
      onNext();
    }
    if (c.includes('clear') || c.includes('reset') || c.includes('start over') || c.includes('delete')) {
      onChange('');
      speak('Cleared. Say your phone number again.');
    }
    if (c.includes('stop') || c.includes('pause') || c.includes('hey vista')) {
      speak('Paused. Say continue when ready.');
    }
  }, [value, onChange, onNext, speak]);

  // Handle transcript updates (for display)
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setRecentTranscripts(prev => [text, ...prev].slice(0, 5));
    }
  }, []);

  // Voice hook
  const voice = useVoice({
    onDigits: handleDigits,
    onCommand: handleCommand,
    onTranscript: handleTranscript,
    autoStart: true
  });

  // Welcome message
  useEffect(() => {
    if (!spokenRef.current) {
      spokenRef.current = true;
      setTimeout(() => {
        speak('Welcome! Tell me your phone number. Say each digit clearly.');
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
        💡 Try: "seven zero three three three eight four nine three one"
      </p>
      
      {/* Voice Status Box */}
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        background: voice.isListening ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.1)', 
        borderRadius: '12px',
        border: `2px solid ${voice.isListening ? '#4CAF50' : '#f44336'}`
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '8px'
        }}>
          <span style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: voice.isListening ? '#4CAF50' : '#f44336',
            animation: voice.isListening ? 'pulse 1s infinite' : 'none'
          }} />
          <span style={{ color: voice.isListening ? '#4CAF50' : '#f44336', fontWeight: 600, fontSize: '1.1em' }}>
            {voice.isListening ? '🎤 Listening - speak now!' : '⏸️ Voice paused'}
          </span>
        </div>
        
        {/* Show what was heard */}
        {voice.transcript && (
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '10px', 
            borderRadius: '8px',
            marginTop: '8px'
          }}>
            <div style={{ color: '#4CAF50', fontSize: '0.8em', marginBottom: '4px' }}>HEARD:</div>
            <div style={{ color: '#fff', fontSize: '1.1em' }}>"{voice.transcript}"</div>
            {voice.transcript && (
              <div style={{ color: THEME.gold, fontSize: '0.9em', marginTop: '4px' }}>
                Digits: {extractDigits(voice.transcript) || 'none'}
              </div>
            )}
          </div>
        )}
        
        {/* Recent transcripts */}
        {recentTranscripts.length > 0 && (
          <div style={{ marginTop: '12px', textAlign: 'left' }}>
            <div style={{ color: '#666', fontSize: '0.7em', marginBottom: '4px' }}>RECENT:</div>
            {recentTranscripts.slice(0, 3).map((t, i) => (
              <div key={i} style={{ color: '#888', fontSize: '0.75em', padding: '2px 0' }}>
                • {t}
              </div>
            ))}
          </div>
        )}
        
        {/* Error display */}
        {voice.error && (
          <div style={{ color: '#f44336', marginTop: '8px', fontSize: '0.85em' }}>
            ⚠️ {voice.error}
          </div>
        )}
      </div>
      
      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VendorPhone;
