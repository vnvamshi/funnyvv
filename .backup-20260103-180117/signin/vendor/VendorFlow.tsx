// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR FLOW v4.0 (GLOBAL VOICE)
// Smooth transitions, mic stays on, text input works
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AgentBar from '../common/AgentBar';
import { useGlobalVoice, useVoiceCommands, extractDigits, formatPhoneNumber, speakablePhone } from '../common/VoiceContext';
import { useNavStack } from '../common/useNavStack';
import VendorPhone from './VendorPhone';
import VendorOTP from './VendorOTP';
import VendorProfile from './VendorProfile';
import VendorDashboard from './VendorDashboard';
import VendorUpload from './VendorUpload';
import VendorPipeline from './VendorPipeline';

interface VendorFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onBack: () => void;
}

type Step = 'phone' | 'otp' | 'profile' | 'dashboard' | 'upload' | 'pipeline' | 'complete';

const STEPS = [
  { id: 'phone', label: 'Phone' },
  { id: 'otp', label: 'Verify' },
  { id: 'profile', label: 'Profile' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'upload', label: 'Upload' },
  { id: 'pipeline', label: 'Processing' },
  { id: 'complete', label: 'Done' }
] as const;

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorFlow: React.FC<VendorFlowProps> = ({ isOpen, onClose, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [profile, setProfile] = useState('');
  const [beautified, setBeautified] = useState('');
  const [catalogFile, setCatalogFile] = useState<File | null>(null);
  
  const hasSpokenRef = useRef(false);
  const voice = useGlobalVoice();
  const navStack = useNavStack({ id: 'vendor:phone', label: 'Phone' });

  // Navigation helpers
  const goToStep = useCallback((newStep: Step) => {
    navStack.push({ id: `vendor:${newStep}`, label: STEPS.find(s => s.id === newStep)?.label || newStep });
    setStep(newStep);
  }, [navStack]);

  const goBack = useCallback(() => {
    const order: Step[] = ['phone', 'otp', 'profile', 'dashboard', 'upload', 'pipeline'];
    const idx = order.indexOf(step);
    if (idx === 0) {
      onBack();
    } else {
      setStep(order[idx - 1]);
      navStack.pop();
      voice.speak("Going back.");
    }
  }, [step, onBack, navStack, voice]);

  // Command handler
  const handleCommand = useCallback((cmd: string): boolean => {
    if (!isOpen) return false;

    // Close
    if (cmd.includes('close') || cmd.includes('exit') || cmd.includes('cancel')) {
      voice.stop();
      onClose();
      return true;
    }

    // Back
    if (cmd.includes('back') || cmd.includes('go back') || cmd.includes('previous')) {
      goBack();
      return true;
    }

    // Phone step
    if (step === 'phone') {
      const digits = extractDigits(cmd);
      if (digits.length >= 10) {
        setPhone(digits.slice(0, 10));
        voice.speak(`Got ${speakablePhone(digits.slice(0, 10))}. Confirm?`);
        return true;
      }
      if ((cmd.includes('confirm') || cmd.includes('yes') || cmd.includes('send') || cmd.includes('correct')) && phone.length >= 10) {
        goToStep('otp');
        voice.speak("Sending code. Enter 1 2 3 4 5 6.");
        return true;
      }
    }

    // OTP step
    if (step === 'otp') {
      const digits = extractDigits(cmd);
      if (digits === '123456' || cmd.includes('123456')) {
        goToStep('profile');
        voice.speak("Verified! Tell me about your business.");
        return true;
      }
    }

    // Profile step
    if (step === 'profile') {
      if (cmd.includes('save') || cmd.includes('confirm') || cmd.includes('yes') || cmd.includes('looks good')) {
        goToStep('dashboard');
        voice.speak("Profile saved! Say 'upload' to go live.");
        return true;
      }
    }

    // Dashboard step
    if (step === 'dashboard') {
      if (cmd.includes('upload') || cmd.includes('catalog') || cmd.includes('go live')) {
        goToStep('upload');
        voice.speak("Upload your catalog.");
        return true;
      }
    }

    // Complete step
    if (step === 'complete') {
      if (cmd.includes('view') || cmd.includes('products') || cmd.includes('show')) {
        onComplete();
        return true;
      }
    }

    return false;
  }, [isOpen, step, phone, goBack, goToStep, voice, onClose, onComplete]);

  // Register commands
  useVoiceCommands('vendor-flow', handleCommand, [isOpen, step, phone]);

  // Welcome
  useEffect(() => {
    if (isOpen && step === 'phone' && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      setTimeout(() => voice.speak("Welcome! Say your phone number."), 300);
    }
  }, [isOpen, step, voice]);

  // Reset
  useEffect(() => {
    if (!isOpen) hasSpokenRef.current = false;
  }, [isOpen]);

  // Text submit
  const handleTextSubmit = useCallback((text: string) => {
    const digits = extractDigits(text);
    if (digits.length > 0 && step === 'phone') {
      setPhone(prev => (prev + digits).slice(0, 10));
      if ((prev => (prev + digits)).length >= 10) {
        voice.speak("Confirm?");
      }
      return;
    }
    handleCommand(text.toLowerCase());
  }, [step, handleCommand, voice]);

  if (!isOpen) return null;

  const stepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '18px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}40`, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.gold}30`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.4em' }}>📦</span>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1em' }}>Vendor Setup</h2>
            <span style={{ color: '#777', fontSize: '0.75em' }}>Step {stepIndex + 1} / {STEPS.length - 1}</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', padding: '8px 18px', gap: '4px', background: 'rgba(0,0,0,0.2)' }}>
          {STEPS.slice(0, -1).map((s, i) => (
            <div key={s.id} style={{ flex: 1, height: '3px', borderRadius: '2px', background: stepIndex >= i ? THEME.gold : 'rgba(255,255,255,0.1)' }} />
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
          onPause={voice.pause}
          onResume={voice.resume}
          onBack={goBack}
          onClose={onClose}
          onTextSubmit={handleTextSubmit}
          canGoBack={step !== 'phone'}
          currentStep={STEPS[stepIndex]?.label}
          stepNumber={stepIndex + 1}
          totalSteps={STEPS.length - 1}
          showModes={true}
          showNavButtons={true}
          showTextInput={true}
        />

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {step === 'phone' && (
            <VendorPhone value={phone} onChange={setPhone} onNext={() => { goToStep('otp'); voice.speak("Sending code. Enter 1 2 3 4 5 6."); }} speak={voice.speak} />
          )}
          {step === 'otp' && (
            <VendorOTP onVerified={() => { goToStep('profile'); voice.speak("Verified! Tell me about yourself."); }} speak={voice.speak} phone={formatPhoneNumber(phone)} />
          )}
          {step === 'profile' && (
            <VendorProfile profile={profile} beautified={beautified} onChange={setProfile} onBeautify={setBeautified} onSave={() => { goToStep('dashboard'); voice.speak("Saved! Say 'upload' to go live."); }} speak={voice.speak} />
          )}
          {step === 'dashboard' && (
            <VendorDashboard onUploadCatalog={() => { goToStep('upload'); voice.speak("Upload your catalog."); }} speak={voice.speak} />
          )}
          {step === 'upload' && (
            <VendorUpload onFileSelected={(f) => { setCatalogFile(f); goToStep('pipeline'); voice.speak(`Processing ${f.name}.`); }} speak={voice.speak} />
          )}
          {step === 'pipeline' && (
            <VendorPipeline fileName={catalogFile?.name} onComplete={() => { setStep('complete'); voice.speak("You're live! Say 'view products'."); }} speak={voice.speak} />
          )}
          {step === 'complete' && (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f0, #0c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ fontSize: '2em', color: '#fff' }}>✓</span>
              </div>
              <h3 style={{ color: THEME.gold }}>🎉 You're Live!</h3>
              <p style={{ color: '#888' }}>Products published.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={onComplete} style={{ padding: '10px 24px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 600 }}>📦 View Products</button>
                <button onClick={() => setStep('dashboard')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${THEME.gold}`, borderRadius: '16px', cursor: 'pointer' }}>← Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorFlow;
