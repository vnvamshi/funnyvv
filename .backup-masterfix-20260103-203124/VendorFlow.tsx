// VendorFlow v8.0 - Working voice-first vendor onboarding
import React, { useState, useEffect, useCallback } from 'react';
import AgentBar from '../common/AgentBar';
import useVoice, { formatPhoneNumber } from '../common/useVoice';

const THEME = { teal: '#004D40', gold: '#B8860B' };

type Step = 'phone' | 'otp' | 'profile' | 'done';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onBack: () => void;
}

const VendorFlow: React.FC<Props> = ({ isOpen, onClose, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleCommand = useCallback((cmd: string) => {
    const c = cmd.toLowerCase();
    if (c.includes('back')) { onBack(); return; }
    if (c.includes('close') || c.includes('cancel')) { onClose(); return; }
    if (c.includes('next') || c.includes('continue') || c.includes('submit')) { handleNext(); return; }
  }, [step, phone, otp]);

  const handleDigits = useCallback((digits: string) => {
    if (step === 'phone') {
      const newPhone = (phone + digits).slice(0, 10);
      setPhone(newPhone);
      if (newPhone.length >= 10) {
        voice.speak("Got your number. Say next or click Send OTP.");
      }
    }
    if (step === 'otp') {
      const newOtp = (otp + digits).slice(0, 6);
      setOtp(newOtp);
      if (newOtp.length >= 6) {
        voice.speak("Code received. Verifying...");
        setTimeout(() => setStep('profile'), 1500);
      }
    }
  }, [step, phone, otp]);

  const voice = useVoice({ onCommand: handleCommand, onDigits: handleDigits, autoStart: isOpen });

  const handleNext = () => {
    if (step === 'phone' && phone.length >= 10) {
      voice.speak("Sending verification code. Enter 1 2 3 4 5 6 for demo.");
      setStep('otp');
    } else if (step === 'otp' && otp.length >= 6) {
      voice.speak("Verified! Setting up your account.");
      setStep('profile');
    } else if (step === 'profile') {
      voice.speak("All done! Welcome aboard.");
      setStep('done');
      setTimeout(onComplete, 2000);
    }
  };

  useEffect(() => {
    if (isOpen && step === 'phone') {
      setTimeout(() => voice.speak("Please tell me your phone number, or type it below."), 500);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = ['phone', 'otp', 'profile'];
  const currentIdx = steps.indexOf(step);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '20px', width: '100%', maxWidth: '600px', overflow: 'hidden', border: `2px solid ${THEME.gold}40` }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.gold}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>📦 Vendor Setup</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5em', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', padding: '12px 20px', gap: '6px', background: 'rgba(0,0,0,0.2)' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: currentIdx >= i ? THEME.gold : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>

        {/* Agent Bar */}
        <AgentBar
          isListening={voice.isListening}
          isSpeaking={voice.isSpeaking}
          isPaused={voice.isPaused}
          transcript={voice.transcript}
          displayText={voice.displayText}
          onStop={voice.stop}
        />

        {/* Content */}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          
          {step === 'phone' && (
            <>
              <span style={{ fontSize: '4em' }}>📱</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Enter Your Phone Number</h3>
              <p style={{ color: '#888' }}>Say it or type below</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
                <span style={{ color: '#fff', fontSize: '1.2em' }}>+1</span>
                <input
                  type="tel"
                  value={formatPhoneNumber(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="703-338-4931"
                  style={{ width: '200px', padding: '16px', fontSize: '1.3em', borderRadius: '12px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff', textAlign: 'center' }}
                />
              </div>
              <button onClick={handleNext} disabled={phone.length < 10} style={{ padding: '14px 40px', background: phone.length >= 10 ? THEME.gold : '#444', color: phone.length >= 10 ? '#000' : '#888', border: 'none', borderRadius: '25px', cursor: phone.length >= 10 ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                Send OTP →
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <span style={{ fontSize: '4em' }}>🔐</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Enter Verification Code</h3>
              <p style={{ color: '#888' }}>Say 6 digits or type below (use 123456 for demo)</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
                {[0,1,2,3,4,5].map(i => (
                  <input key={i} type="text" maxLength={1} value={otp[i] || ''} onChange={(e) => {
                    const newOtp = otp.split('');
                    newOtp[i] = e.target.value.replace(/\D/g, '');
                    setOtp(newOtp.join(''));
                  }} style={{ width: '45px', height: '55px', fontSize: '1.5em', textAlign: 'center', borderRadius: '10px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
                ))}
              </div>
              <button onClick={handleNext} disabled={otp.length < 6} style={{ padding: '14px 40px', background: otp.length >= 6 ? THEME.gold : '#444', color: otp.length >= 6 ? '#000' : '#888', border: 'none', borderRadius: '25px', cursor: otp.length >= 6 ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                Verify →
              </button>
            </>
          )}

          {step === 'profile' && (
            <>
              <span style={{ fontSize: '4em' }}>🏪</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Account Created!</h3>
              <p style={{ color: '#888' }}>Your vendor account is ready.</p>
              <button onClick={handleNext} style={{ padding: '14px 40px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, marginTop: '20px' }}>
                Go to Dashboard →
              </button>
            </>
          )}

          {step === 'done' && (
            <>
              <span style={{ fontSize: '4em' }}>✅</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Welcome Aboard!</h3>
              <p style={{ color: '#888' }}>Redirecting to your dashboard...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorFlow;
