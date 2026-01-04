// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR FLOW
// Complete: Phone → OTP → Profile → Dashboard → Upload → Pipeline → Catalog
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react';
import AgentBar from '../common/AgentBar';
import { useVoice } from '../common/useVoice';
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

const THEME = { teal: '#004236', gold: '#B8860B' };

const VendorFlow: React.FC<VendorFlowProps> = ({ isOpen, onClose, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [vendorData, setVendorData] = useState({
    phone: '',
    profile: '',
    beautifiedProfile: '',
    catalogFile: null as File | null
  });

  const navStack = useNavStack({ id: 'vendor:phone', label: 'Phone Number' });

  const handleCommand = useCallback((cmd: string) => {
    if (cmd.includes('stop')) { voice.stop(); return; }
    if (cmd.includes('close') || cmd.includes('exit')) { voice.stop(); onClose(); return; }
    if (cmd.includes('back') || cmd.includes('go back')) {
      goBack();
      return;
    }
  }, [step]);

  const handleDigits = useCallback((digits: string) => {
    if (step === "phone" && digits.length > 0) {
      const newPhone = (vendorData.phone + digits).slice(0, 10);
      setVendorData(d => ({ ...d, phone: newPhone }));
      if (newPhone.length >= 10) {
        voice.speak("Got your number. Click Send OTP or say next.");
      }
    }
    if (step === "otp" && digits.length > 0) {
      // Handle OTP digits
    }
  }, [step, vendorData.phone]);

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
      voice.speak(`Going back to ${prev}.`);
    }
  };

  const goToStep = (newStep: Step, label: string) => {
    navStack.push({ id: `vendor:${newStep}`, label });
    setStep(newStep);
  };

  useEffect(() => {
    if (isOpen && step === 'phone') {
      setTimeout(() => voice.speak("Welcome, Vendor! Let's get you set up. Please tell me your phone number, or type it below."), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '20px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}40`, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header with Back */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.gold}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9em' }}>← Back</button>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>📦 Vendor Setup</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5em', cursor: 'pointer', opacity: 0.7 }}>✕</button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', padding: '12px 20px', gap: '6px', background: 'rgba(0,0,0,0.2)' }}>
          {['phone', 'otp', 'profile', 'dashboard', 'upload'].map((s, i) => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: ['phone', 'otp', 'profile', 'dashboard', 'upload'].indexOf(step) >= i ? THEME.gold : 'rgba(255,255,255,0.2)' }} />
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
          {step === 'phone' && (
            <VendorPhone
              value={vendorData.phone}
              onChange={(phone) => setVendorData(d => ({ ...d, phone }))}
              onNext={() => {
                goToStep('otp', 'OTP Verification');
                voice.speak("Sending verification code now. For demo, enter 1 2 3 4 5 6.");
              }}
              speak={voice.speak}
            />
          )}

          {step === 'otp' && (
            <VendorOTP
              onVerified={() => {
                goToStep('profile', 'Profile');
                voice.speak("Verified! Welcome in. Now tell me about your business. What do you sell?");
              }}
              speak={voice.speak}
            />
          )}

          {step === 'profile' && (
            <VendorProfile
              profile={vendorData.profile}
              beautified={vendorData.beautifiedProfile}
              onChange={(profile) => setVendorData(d => ({ ...d, profile }))}
              onBeautify={(beautified) => setVendorData(d => ({ ...d, beautifiedProfile: beautified }))}
              onSave={() => {
                goToStep('dashboard', 'Dashboard');
                voice.speak("Profile saved! Welcome to your Vendor Dashboard. You can upload your catalog, manage products, or customize your storefront.");
              }}
              speak={voice.speak}
            />
          )}

          {step === 'dashboard' && (
            <VendorDashboard
              onUploadCatalog={() => {
                goToStep('upload', 'Upload Catalog');
                voice.speak("Great! Upload your catalog. I'll process it and publish your products.");
              }}
              speak={voice.speak}
            />
          )}

          {step === 'upload' && (
            <VendorUpload
              onFileSelected={(file) => {
                setVendorData(d => ({ ...d, catalogFile: file }));
                goToStep('pipeline', 'Processing');
              }}
              speak={voice.speak}
            />
          )}

          {step === 'pipeline' && (
            <VendorPipeline
              onComplete={() => {
                voice.speak("Congratulations! Your catalog is now live on VistaView. Want me to show you your products?");
                setStep('complete');
              }}
              speak={voice.speak}
            />
          )}

          {step === 'complete' && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span style={{ fontSize: '5em' }}>🎉</span>
              <h3 style={{ color: THEME.gold, marginTop: '20px' }}>You're Live on VistaView!</h3>
              <p style={{ color: '#aaa', marginBottom: '30px' }}>Your products have been published to the catalog.</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button onClick={onComplete} style={{ padding: '12px 32px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>
                  View My Products
                </button>
                <button onClick={() => setStep('dashboard')} style={{ padding: '12px 32px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${THEME.gold}`, borderRadius: '25px', cursor: 'pointer' }}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorFlow;
