// ═══════════════════════════════════════════════════════════════════════════════
// VendorFlow v5.0 - Complete Voice-First Vendor Onboarding
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback } from 'react';
import AgentBar from '../common/AgentBar';
import useVoice from '../common/useVoice';
import useNavStack from '../common/useNavStack';

const THEME = { teal: '#004D40', gold: '#B8860B' };

type Step = 'phone' | 'otp' | 'profile' | 'dashboard' | 'upload' | 'pipeline';

interface VendorFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onBack: () => void;
}

const VendorFlow: React.FC<VendorFlowProps> = ({ isOpen, onClose, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profile, setProfile] = useState('');

  const navStack = useNavStack({ id: 'vendor:phone', label: 'Phone Number' });

  // Handle voice commands
  const handleCommand = useCallback((cmd: string) => {
    const c = cmd.toLowerCase();
    
    if (c.includes('stop')) { voice.stop(); return; }
    if (c.includes('close') || c.includes('exit')) { voice.stop(); onClose(); return; }
    if (c.includes('back') || c.includes('go back')) { goBack(); return; }
    if (c.includes('next') || c.includes('continue') || c.includes('submit')) { handleNext(); return; }
    if (c.includes('skip')) { handleSkip(); return; }
  }, [step, phone, otp]);

  // Handle voice digits - for phone and OTP
  const handleDigits = useCallback((digits: string) => {
    if (step === 'phone' && digits.length > 0) {
      const newPhone = (phone + digits).slice(0, 10);
      setPhone(newPhone);
      if (newPhone.length >= 10) {
        voice.speak("Got your number. Say next or click Send OTP.");
      } else {
        voice.speak(digits.split('').join(' '));
      }
    }
    if (step === 'otp' && digits.length > 0) {
      const newOtp = (otp + digits).slice(0, 6);
      setOtp(newOtp);
      if (newOtp.length >= 6) {
        voice.speak("Got the code. Verifying now.");
        setTimeout(() => goToStep('profile', 'Business Profile'), 1500);
      }
    }
  }, [step, phone, otp]);

  const voice = useVoice({ onCommand: handleCommand, onDigits: handleDigits, autoStart: isOpen });

  const goBack = () => {
    const stepOrder: Step[] = ['phone', 'otp', 'profile', 'dashboard', 'upload', 'pipeline'];
    const idx = stepOrder.indexOf(step);
    if (idx === 0) {
      onBack();
    } else {
      const prev = stepOrder[idx - 1];
      setStep(prev);
      navStack.pop();
      voice.speak("Going back.");
    }
  };

  const goToStep = (newStep: Step, label: string) => {
    navStack.push({ id: `vendor:${newStep}`, label });
    setStep(newStep);
  };

  const handleNext = () => {
    if (step === 'phone' && phone.length >= 10) {
      voice.speak("Sending verification code. For demo, enter 1 2 3 4 5 6.");
      goToStep('otp', 'OTP Verification');
    } else if (step === 'otp' && otp.length >= 6) {
      voice.speak("Verified! Now tell me about your business.");
      goToStep('profile', 'Business Profile');
    } else if (step === 'profile') {
      voice.speak("Great! Here's your dashboard.");
      goToStep('dashboard', 'Dashboard');
    } else if (step === 'dashboard') {
      voice.speak("Let's upload your catalog.");
      goToStep('upload', 'Upload Catalog');
    } else if (step === 'upload') {
      voice.speak("Excellent! Your products are in the pipeline.");
      goToStep('pipeline', 'Pipeline');
    } else if (step === 'pipeline') {
      voice.speak("All done! Welcome aboard.");
      setTimeout(onComplete, 1500);
    }
  };

  const handleSkip = () => {
    voice.speak("Skipping for now.");
    handleNext();
  };

  // Format phone display
  const formatPhone = (p: string) => {
    if (p.length <= 3) return p;
    if (p.length <= 6) return `${p.slice(0, 3)}-${p.slice(3)}`;
    return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
  };

  // Initial greeting
  useEffect(() => {
    if (isOpen && step === 'phone') {
      setTimeout(() => voice.speak("Welcome, Vendor! Please tell me your phone number, or type it below."), 500);
    }
  }, [isOpen]);

  // Step-specific greetings
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => voice.speak("Enter the 6-digit code sent to your phone. For demo, use 1 2 3 4 5 6."), 300);
    } else if (step === 'profile') {
      setTimeout(() => voice.speak("Tell me about your business. What products do you sell?"), 300);
    } else if (step === 'dashboard') {
      setTimeout(() => voice.speak("Here's your vendor dashboard. Say next to upload your catalog."), 300);
    } else if (step === 'upload') {
      setTimeout(() => voice.speak("Upload your product catalog. You can drag and drop files or click to browse."), 300);
    } else if (step === 'pipeline') {
      setTimeout(() => voice.speak("Your products are being processed. Say done when ready to finish."), 300);
    }
  }, [step]);

  if (!isOpen) return null;

  const steps = ['phone', 'otp', 'profile', 'dashboard', 'upload'];
  const currentIdx = steps.indexOf(step);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}40`, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.gold}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9em' }}>← Back</button>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>📦 Vendor Setup</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5em', cursor: 'pointer', opacity: 0.7 }}>✕</button>
        </div>

        {/* Progress Bar */}
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

        {/* Step Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          
          {/* PHONE STEP */}
          {step === 'phone' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>📱</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Enter Your Phone Number</h3>
              <p style={{ color: '#888', marginBottom: '24px' }}>Say it or type below (digits only)</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ color: '#fff', fontSize: '1.2em' }}>+1</span>
                <input
                  type="tel"
                  value={formatPhone(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="703-338-4931"
                  style={{ width: '200px', padding: '16px', fontSize: '1.3em', borderRadius: '12px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff', textAlign: 'center', letterSpacing: '2px' }}
                />
              </div>

              <button
                onClick={handleNext}
                disabled={phone.length < 10}
                style={{ padding: '14px 40px', background: phone.length >= 10 ? THEME.gold : '#444', color: phone.length >= 10 ? '#000' : '#888', border: 'none', borderRadius: '25px', cursor: phone.length >= 10 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '1em' }}
              >
                Send OTP →
              </button>
            </div>
          )}

          {/* OTP STEP */}
          {step === 'otp' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>🔐</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Enter Verification Code</h3>
              <p style={{ color: '#888', marginBottom: '24px' }}>Say the 6 digits or type below</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('');
                      newOtp[i] = e.target.value.replace(/\D/g, '');
                      setOtp(newOtp.join('').slice(0, 6));
                    }}
                    style={{ width: '45px', height: '55px', fontSize: '1.5em', textAlign: 'center', borderRadius: '10px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={otp.length < 6}
                style={{ padding: '14px 40px', background: otp.length >= 6 ? THEME.gold : '#444', color: otp.length >= 6 ? '#000' : '#888', border: 'none', borderRadius: '25px', cursor: otp.length >= 6 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '1em' }}
              >
                Verify →
              </button>
            </div>
          )}

          {/* PROFILE STEP */}
          {step === 'profile' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>🏪</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Tell Us About Your Business</h3>
              <p style={{ color: '#888', marginBottom: '24px' }}>Describe your products and services</p>
              
              <textarea
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="We sell premium building materials including tiles, fixtures, and appliances..."
                style={{ width: '100%', height: '120px', padding: '16px', fontSize: '1em', borderRadius: '12px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff', resize: 'none' }}
              />

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={handleSkip} style={{ padding: '14px 30px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${THEME.gold}`, borderRadius: '25px', cursor: 'pointer' }}>Skip</button>
                <button onClick={handleNext} style={{ padding: '14px 40px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>Next →</button>
              </div>
            </div>
          )}

          {/* DASHBOARD STEP */}
          {step === 'dashboard' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>📊</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Your Vendor Dashboard</h3>
              <p style={{ color: '#888', marginBottom: '24px' }}>Everything is set up! Here's your overview.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[{ label: 'Products', value: '0', icon: '📦' }, { label: 'Orders', value: '0', icon: '📋' }, { label: 'Revenue', value: '$0', icon: '💰' }, { label: 'Rating', value: 'New', icon: '⭐' }].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '1.5em' }}>{icon}</div>
                    <div style={{ color: '#fff', fontSize: '1.2em', fontWeight: 600 }}>{value}</div>
                    <div style={{ color: '#888', fontSize: '0.85em' }}>{label}</div>
                  </div>
                ))}
              </div>

              <button onClick={handleNext} style={{ padding: '14px 40px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>Upload Catalog →</button>
            </div>
          )}

          {/* UPLOAD STEP */}
          {step === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>📤</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Upload Your Catalog</h3>
              <p style={{ color: '#888', marginBottom: '24px' }}>Drag & drop files or click to browse</p>
              
              <div style={{ border: `2px dashed ${THEME.gold}`, borderRadius: '12px', padding: '40px', marginBottom: '20px', cursor: 'pointer' }}>
                <div style={{ fontSize: '2em', marginBottom: '10px' }}>📁</div>
                <div style={{ color: '#fff' }}>Drop files here or click to upload</div>
                <div style={{ color: '#888', fontSize: '0.85em', marginTop: '8px' }}>Supports: CSV, Excel, PDF</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={handleSkip} style={{ padding: '14px 30px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${THEME.gold}`, borderRadius: '25px', cursor: 'pointer' }}>Skip</button>
                <button onClick={handleNext} style={{ padding: '14px 40px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>Finish →</button>
              </div>
            </div>
          )}

          {/* PIPELINE STEP */}
          {step === 'pipeline' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>✅</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>All Done!</h3>
              <p style={{ color: '#888', marginBottom: '24px' }}>Your vendor account is ready.</p>
              
              <button onClick={onComplete} style={{ padding: '14px 40px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>Go to Dashboard →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorFlow;
