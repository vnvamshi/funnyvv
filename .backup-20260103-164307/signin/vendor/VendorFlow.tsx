// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR FLOW v2.0
// Complete: Phone → OTP → Profile → Dashboard → Upload → Pipeline → Catalog
// Voice-first with AgentBar, proper back/close, digit extraction
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AgentBar from '../common/AgentBar';
import { useVoice, extractDigits, formatPhoneNumber, speakablePhone } from '../common/useVoice';
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

const STEPS: { id: Step; label: string }[] = [
  { id: 'phone', label: 'Phone Number' },
  { id: 'otp', label: 'Verification' },
  { id: 'profile', label: 'Profile' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'upload', label: 'Upload' },
  { id: 'pipeline', label: 'Processing' },
  { id: 'complete', label: 'Complete' }
];

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorFlow: React.FC<VendorFlowProps> = ({ isOpen, onClose, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [vendorData, setVendorData] = useState({
    phone: '',
    profile: '',
    beautifiedProfile: '',
    catalogFile: null as File | null
  });

  // Voice digit handler ref (for phone/OTP steps)
  const voiceDigitHandlerRef = useRef<((digits: string) => void) | null>(null);
  const voiceCommandHandlerRef = useRef<((cmd: string) => boolean) | null>(null);

  const navStack = useNavStack({ id: 'vendor:phone', label: 'Phone Number' });

  // Handle voice commands
  const handleCommand = useCallback((cmd: string) => {
    // Global commands
    if (cmd.includes('stop') || cmd.includes('quiet')) {
      voice.stop();
      return;
    }
    
    if (cmd.includes('close') || cmd.includes('exit') || cmd.includes('cancel')) {
      voice.stop();
      onClose();
      return;
    }
    
    if (cmd.includes('back') || cmd.includes('go back') || cmd.includes('previous')) {
      goBack();
      return;
    }

    // Step-specific commands
    if (step === 'phone') {
      // Extract digits for phone
      const digits = extractDigits(cmd);
      if (digits.length >= 3) {
        voiceDigitHandlerRef.current?.(digits);
        return;
      }
      // Confirmation
      if (cmd.includes('yes') || cmd.includes('correct') || cmd.includes('confirm')) {
        if (vendorData.phone.length >= 10) {
          goToStep('otp', 'Verification');
          voice.speak("Sending verification code now. For demo, enter 1 2 3 4 5 6.");
        }
        return;
      }
    }

    if (step === 'otp') {
      const digits = extractDigits(cmd);
      if (digits.length >= 1) {
        voiceDigitHandlerRef.current?.(digits);
        return;
      }
    }

    if (step === 'profile') {
      // Let profile component handle it
      if (voiceCommandHandlerRef.current?.(cmd)) {
        return;
      }
    }

    if (step === 'dashboard') {
      if (cmd.includes('upload') || cmd.includes('catalog') || cmd.includes('go live')) {
        goToStep('upload', 'Upload');
        voice.speak("Great! Upload your catalog. I'll process it and publish your products.");
        return;
      }
      if (cmd.includes('products') || cmd.includes('view')) {
        voice.speak("Your product catalog will appear here after upload.");
        return;
      }
    }

    if (step === 'complete') {
      if (cmd.includes('view') || cmd.includes('products') || cmd.includes('catalog')) {
        onComplete();
        return;
      }
      if (cmd.includes('done') || cmd.includes('finish')) {
        onClose();
        return;
      }
    }

  }, [step, vendorData.phone, onClose, onComplete]);

  // Handle voice digits
  const handleDigits = useCallback((digits: string) => {
    voiceDigitHandlerRef.current?.(digits);
  }, []);

  const voice = useVoice({ 
    onCommand: handleCommand, 
    onDigits: handleDigits,
    autoStart: isOpen 
  });

  // Go back to previous step
  const goBack = () => {
    const stepOrder: Step[] = ['phone', 'otp', 'profile', 'dashboard', 'upload', 'pipeline'];
    const idx = stepOrder.indexOf(step);
    
    if (idx === 0) {
      onBack(); // Go back to role selection
    } else {
      const prev = stepOrder[idx - 1];
      setStep(prev);
      navStack.pop();
      voice.speak(`Going back to ${STEPS.find(s => s.id === prev)?.label || prev}.`);
    }
  };

  // Go to specific step
  const goToStep = (newStep: Step, label: string) => {
    navStack.push({ id: `vendor:${newStep}`, label });
    setStep(newStep);
  };

  // Welcome message on open
  useEffect(() => {
    if (isOpen && step === 'phone') {
      setTimeout(() => {
        voice.speak("Welcome, Vendor! Let's get you set up. Please tell me your phone number. Say each digit clearly, like 'seven zero three three three eight four nine three one'.");
      }, 400);
    }
  }, [isOpen]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      voice.stop();
      voice.stopListening();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get step info
  const stepIndex = STEPS.findIndex(s => s.id === step);
  const stepLabel = STEPS[stepIndex]?.label || step;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.92)', 
      zIndex: 10000, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '20px' 
    }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, 
        borderRadius: '20px', 
        width: '100%', 
        maxWidth: '850px', 
        maxHeight: '92vh', 
        overflow: 'hidden', 
        border: `2px solid ${THEME.gold}40`, 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        
        {/* Header */}
        <div style={{ 
          padding: '16px 24px', 
          background: 'rgba(0,0,0,0.3)',
          borderBottom: `1px solid ${THEME.gold}30`, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '1.8em' }}>📦</span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2em' }}>Vendor Setup</h2>
              <span style={{ color: '#888', fontSize: '0.85em' }}>Step {stepIndex + 1} of {STEPS.length - 1}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ 
          display: 'flex', 
          padding: '12px 24px', 
          gap: '6px', 
          background: 'rgba(0,0,0,0.2)' 
        }}>
          {STEPS.slice(0, -1).map((s, i) => (
            <div 
              key={s.id} 
              style={{ 
                flex: 1, 
                height: '5px', 
                borderRadius: '3px', 
                background: stepIndex >= i ? THEME.gold : 'rgba(255,255,255,0.15)',
                transition: 'background 0.3s'
              }} 
            />
          ))}
        </div>

        {/* Agent Bar - ALWAYS VISIBLE */}
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
          canGoBack={navStack.canGoBack || step !== 'phone'}
          currentStep={stepLabel}
          stepNumber={stepIndex + 1}
          totalSteps={STEPS.length - 1}
          showModes={true}
          showNavButtons={true}
        />

        {/* Step Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          
          {/* Phone Step */}
          {step === 'phone' && (
            <VendorPhone
              value={vendorData.phone}
              onChange={(phone) => setVendorData(d => ({ ...d, phone }))}
              onNext={() => {
                goToStep('otp', 'Verification');
                voice.speak(`Sending verification code to ${speakablePhone(vendorData.phone)}. For demo, enter 1 2 3 4 5 6.`);
              }}
              speak={voice.speak}
              onVoiceDigits={(handler) => { voiceDigitHandlerRef.current = handler; }}
            />
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <VendorOTP
              onVerified={() => {
                goToStep('profile', 'Profile');
                voice.speak("Verified! Welcome in. Now tell me about your business. What do you sell? Where do you ship?");
              }}
              speak={voice.speak}
              onVoiceDigits={(handler) => { voiceDigitHandlerRef.current = handler; }}
              phone={formatPhoneNumber(vendorData.phone)}
            />
          )}

          {/* Profile Step */}
          {step === 'profile' && (
            <VendorProfile
              profile={vendorData.profile}
              beautified={vendorData.beautifiedProfile}
              onChange={(profile) => setVendorData(d => ({ ...d, profile }))}
              onBeautify={(beautified) => setVendorData(d => ({ ...d, beautifiedProfile: beautified }))}
              onSave={() => {
                goToStep('dashboard', 'Dashboard');
                voice.speak("Profile saved! Welcome to your Vendor Dashboard. You can upload your catalog, manage products, run promotions, or customize your storefront. Say 'upload catalog' to get started!");
              }}
              speak={voice.speak}
              onVoiceCommand={(handler) => { voiceCommandHandlerRef.current = handler; }}
            />
          )}

          {/* Dashboard Step */}
          {step === 'dashboard' && (
            <VendorDashboard
              onUploadCatalog={() => {
                goToStep('upload', 'Upload');
                voice.speak("Great! Upload your catalog file. I support PDF, Excel, and CSV formats. I'll process it in 5 steps and publish your products.");
              }}
              speak={voice.speak}
            />
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <VendorUpload
              onFileSelected={(file) => {
                setVendorData(d => ({ ...d, catalogFile: file }));
                goToStep('pipeline', 'Processing');
                voice.speak(`Got it! Processing ${file.name}. This will take just a moment.`);
              }}
              speak={voice.speak}
            />
          )}

          {/* Pipeline Step */}
          {step === 'pipeline' && (
            <VendorPipeline
              fileName={vendorData.catalogFile?.name}
              onComplete={() => {
                setStep('complete');
                voice.speak("Congratulations! Your catalog is now live on VistaView. All products have been published. Want me to show you your products? Just say 'view products'!");
              }}
              speak={voice.speak}
            />
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #00ff00, #00cc00)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 30px rgba(0,255,0,0.3)'
              }}>
                <span style={{ fontSize: '3em' }}>✓</span>
              </div>
              
              <h3 style={{ color: THEME.gold, marginBottom: '12px', fontSize: '1.5em' }}>
                🎉 You're Live on VistaView!
              </h3>
              <p style={{ color: '#aaa', marginBottom: '32px', fontSize: '1.05em' }}>
                Your products have been published and are now discoverable.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={onComplete} 
                  style={{ 
                    padding: '14px 36px', 
                    background: THEME.gold, 
                    color: '#000', 
                    border: 'none', 
                    borderRadius: '25px', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    fontSize: '1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📦 View My Products
                </button>
                <button 
                  onClick={() => setStep('dashboard')} 
                  style={{ 
                    padding: '14px 28px', 
                    background: 'rgba(255,255,255,0.1)', 
                    color: '#fff', 
                    border: `1px solid ${THEME.gold}`, 
                    borderRadius: '25px', 
                    cursor: 'pointer' 
                  }}
                >
                  ← Back to Dashboard
                </button>
                <button 
                  onClick={onClose} 
                  style={{ 
                    padding: '14px 28px', 
                    background: 'transparent', 
                    color: '#888', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '25px', 
                    cursor: 'pointer' 
                  }}
                >
                  Done
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
