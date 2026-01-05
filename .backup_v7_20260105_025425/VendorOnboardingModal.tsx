// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR ONBOARDING MODAL v4.0
// Single continuous flow (no pop-up chains)
// Integrated with AgentBar for persistent navigation
// ═══════════════════════════════════════════════════════════════════════════════
//
// FLOW: Phone → OTP → Profile → Dashboard → Upload → Processing → Complete
// All steps in ONE modal with smooth transitions
// Agent Bar provides: teleprompter + STT/TTS + back/close/stop
//
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAgentBar } from './AgentBar';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface VendorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (vendorData: VendorData) => void;
}

interface VendorData {
  phone: string;
  businessName: string;
  businessDescription: string;
  shippingRegions: string[];
  catalogFile?: File;
  productsCount?: number;
}

type OnboardingStep = 
  | 'welcome'
  | 'phone' 
  | 'otp' 
  | 'profile' 
  | 'dashboard' 
  | 'upload' 
  | 'processing' 
  | 'complete';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const THEME = {
  teal: '#004236',
  tealLight: '#007E67',
  gold: '#B8860B',
  goldLight: '#F5EC9B',
  white: '#FFFFFF',
  dark: '#001a15'
};

const STEP_CONFIG: Record<OnboardingStep, {
  title: string;
  icon: string;
  voiceIntro: string;
  canGoBack: boolean;
}> = {
  welcome: {
    title: 'Welcome, Vendor!',
    icon: '👋',
    voiceIntro: "Welcome to VistaView! I'm Mr. V, and I'll guide you through setting up your vendor account. It only takes a few minutes. Let's start with your phone number for verification.",
    canGoBack: false
  },
  phone: {
    title: 'Phone Verification',
    icon: '📱',
    voiceIntro: "Please enter your phone number with country code. You can say it aloud or type it below.",
    canGoBack: true
  },
  otp: {
    title: 'Enter Verification Code',
    icon: '🔐',
    voiceIntro: "I've sent a 6-digit code to your phone. Please enter it to verify. For this demo, use 1 2 3 4 5 6.",
    canGoBack: true
  },
  profile: {
    title: 'Business Profile',
    icon: '✍️',
    voiceIntro: "Great! Now tell me about your business. What products do you sell, and where do you ship? I'll create a beautiful profile for you.",
    canGoBack: true
  },
  dashboard: {
    title: 'Vendor Dashboard',
    icon: '🎯',
    voiceIntro: "Welcome to your Vendor Dashboard! From here you can manage products, upload catalogs, create promotions, and customize your storefront. Say 'upload catalog' to add your products.",
    canGoBack: true
  },
  upload: {
    title: 'Upload Catalog',
    icon: '📤',
    voiceIntro: "You can upload your product catalog as a PDF, Excel, or CSV file. I'll automatically extract all your products, images, and details.",
    canGoBack: true
  },
  processing: {
    title: 'Processing Catalog',
    icon: '⚙️',
    voiceIntro: "Processing your catalog now. I'm extracting products, optimizing images, and preparing everything for your store.",
    canGoBack: false
  },
  complete: {
    title: 'Setup Complete!',
    icon: '🎉',
    voiceIntro: "Congratulations! Your vendor account is ready, and your products are now live on VistaView. You can start selling immediately!",
    canGoBack: false
  }
};

const PROCESSING_STEPS = [
  { id: 'parse', label: 'Parsing catalog structure', duration: 2000 },
  { id: 'images', label: 'Extracting product images', duration: 2500 },
  { id: 'upscale', label: 'Enhancing image quality', duration: 3000 },
  { id: 'tables', label: 'Creating product database', duration: 2500 },
  { id: 'vectors', label: 'Building search vectors', duration: 2000 },
  { id: 'publish', label: 'Publishing to marketplace', duration: 1500 }
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const VendorOnboardingModal: React.FC<VendorOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  // Step state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [stepHistory, setStepHistory] = useState<OnboardingStep[]>([]);
  
  // Form data
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [beautifiedProfile, setBeautifiedProfile] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Processing state
  const [processingStepIndex, setProcessingStepIndex] = useState(-1);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Agent Bar integration
  const agentBar = useAgentBar();
  const { speak, stop, onVoiceCommand, pushNavigation, setCurrentModal } = agentBar;

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen) {
      setCurrentModal('vendor-onboarding');
      setCurrentStep('welcome');
      setStepHistory([]);
      
      // Speak welcome after short delay
      setTimeout(() => {
        speak(STEP_CONFIG.welcome.voiceIntro, () => {
          // Auto-advance to phone step after welcome
          setTimeout(() => navigateToStep('phone'), 500);
        });
      }, 500);
    } else {
      setCurrentModal(null);
    }
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE COMMAND HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    onVoiceCommand((cmd: string) => {
      const lower = cmd.toLowerCase();
      
      // Step-specific voice commands
      switch (currentStep) {
        case 'phone':
          // Extract phone number from speech
          const digits = cmd.replace(/\D/g, '');
          if (digits.length >= 10) {
            setPhone(digits);
            speak(`I heard ${formatPhoneForSpeech(digits)}. Is that correct? Say yes to confirm, or say the number again.`);
            return true;
          }
          if (lower.includes('yes') || lower.includes('correct') || lower.includes('confirm')) {
            if (phone.length >= 10) {
              navigateToStep('otp');
              return true;
            }
          }
          break;
          
        case 'otp':
          const otpDigits = cmd.replace(/\D/g, '');
          if (otpDigits.length >= 6) {
            setOtp(otpDigits.slice(0, 6));
            verifyOtp(otpDigits.slice(0, 6));
            return true;
          }
          if (lower.includes('123456') || lower.includes('one two three four five six')) {
            setOtp('123456');
            verifyOtp('123456');
            return true;
          }
          break;
          
        case 'profile':
          if (lower.includes('yes') || lower.includes('save') || lower.includes('looks good') || lower.includes('confirm')) {
            if (beautifiedProfile) {
              saveProfile();
              return true;
            }
          }
          // Capture business description
          if (cmd.length > 20 && !lower.includes('hey') && !lower.includes('stop')) {
            setBusinessDescription(cmd);
            beautifyProfile(cmd);
            return true;
          }
          break;
          
        case 'dashboard':
          if (lower.includes('upload') || lower.includes('catalog') || lower.includes('add products')) {
            navigateToStep('upload');
            return true;
          }
          if (lower.includes('products') || lower.includes('my products')) {
            speak("Your products section will be available once you upload a catalog.");
            return true;
          }
          if (lower.includes('promotion') || lower.includes('deal')) {
            speak("Promotions can be created after you add products. Let's upload your catalog first.");
            return true;
          }
          break;
          
        case 'upload':
          if (lower.includes('browse') || lower.includes('select') || lower.includes('choose file')) {
            fileInputRef.current?.click();
            return true;
          }
          break;
          
        case 'complete':
          if (lower.includes('view') || lower.includes('products') || lower.includes('done') || lower.includes('finish')) {
            handleComplete();
            return true;
          }
          break;
      }
      
      return false; // Not handled, let AgentBar handle it
    });
  }, [currentStep, phone, beautifiedProfile]);

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════
  const navigateToStep = useCallback((step: OnboardingStep) => {
    // Save current step to history (for back navigation)
    if (STEP_CONFIG[currentStep].canGoBack) {
      setStepHistory(prev => [...prev, currentStep]);
      pushNavigation({
        type: 'step',
        name: STEP_CONFIG[currentStep].title,
        data: { step: currentStep }
      });
    }
    
    setCurrentStep(step);
    
    // Speak the intro for the new step
    setTimeout(() => {
      speak(STEP_CONFIG[step].voiceIntro);
    }, 300);
  }, [currentStep, speak, pushNavigation]);

  const goToPreviousStep = useCallback(() => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1));
      setCurrentStep(previousStep);
      speak(`Going back to ${STEP_CONFIG[previousStep].title}.`);
    }
  }, [stepHistory, speak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const formatPhoneForSpeech = (digits: string): string => {
    return digits.split('').join(' ');
  };

  const verifyOtp = (code: string) => {
    if (code === '123456') {
      speak("Verified! Your phone number is confirmed. Now tell me about your business.", () => {
        navigateToStep('profile');
      });
    } else {
      speak("That code doesn't match. Please try again with 1 2 3 4 5 6.");
    }
  };

  const beautifyProfile = (description: string) => {
    const name = businessName || 'Your Business';
    const beautified = `🏪 **${name} on VistaView**

${description.charAt(0).toUpperCase() + description.slice(1)}.

✨ Quality Products • Fast Shipping • Customer Satisfaction Guaranteed
📦 Secure Transactions • Easy Returns • 24/7 Support`;
    
    setBeautifiedProfile(beautified);
    speak("Here's how I've formatted your business profile. Does this look good? Say yes to save, or describe your business again for changes.");
  };

  const saveProfile = () => {
    speak("Profile saved! Welcome to your Vendor Dashboard. From here, you can upload catalogs, manage products, and run promotions.", () => {
      navigateToStep('dashboard');
    });
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    speak(`Uploading ${file.name}. Starting the 5-step processing pipeline...`, () => {
      navigateToStep('processing');
      runProcessingPipeline();
    });
  };

  const runProcessingPipeline = async () => {
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setProcessingStepIndex(i);
      speak(PROCESSING_STEPS[i].label);
      await new Promise(resolve => setTimeout(resolve, PROCESSING_STEPS[i].duration));
    }
    
    setProcessingComplete(true);
    speak("All done! Your catalog has been processed and your products are now live!", () => {
      navigateToStep('complete');
    });
  };

  const handleComplete = () => {
    const vendorData: VendorData = {
      phone,
      businessName,
      businessDescription,
      shippingRegions: ['Nationwide'],
      catalogFile: uploadedFile || undefined,
      productsCount: 47 // Demo value
    };
    
    onComplete(vendorData);
    onClose();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isOpen) return null;

  const stepConfig = STEP_CONFIG[currentStep];
  const canGoBack = stepConfig.canGoBack && stepHistory.length > 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        paddingBottom: '80px' // Space for AgentBar
      }}
    >
      <div
        ref={containerRef}
        style={{
          background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.dark})`,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          border: `2px solid ${THEME.gold}`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '16px 24px',
            borderBottom: `1px solid ${THEME.gold}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8em' }}>{stepConfig.icon}</span>
            <h2 style={{ color: THEME.gold, margin: 0, fontSize: '1.3em' }}>
              {stepConfig.title}
            </h2>
          </div>
          
          {/* Progress Indicator */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.keys(STEP_CONFIG).slice(1, -1).map((step, i) => (
              <div
                key={step}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: Object.keys(STEP_CONFIG).indexOf(currentStep) > i 
                    ? THEME.gold 
                    : currentStep === step 
                      ? THEME.goldLight 
                      : 'rgba(255,255,255,0.2)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* STEP: Phone */}
          {currentStep === 'phone' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>
                Say your phone number or type it below
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="+1 (555) 123-4567"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '16px',
                  fontSize: '1.3em',
                  borderRadius: '12px',
                  border: `2px solid ${THEME.gold}`,
                  background: 'rgba(0,0,0,0.3)',
                  color: THEME.white,
                  textAlign: 'center'
                }}
              />
              <br />
              <button
                onClick={() => phone.length >= 10 && navigateToStep('otp')}
                disabled={phone.length < 10}
                style={{
                  marginTop: '24px',
                  padding: '14px 40px',
                  background: phone.length >= 10 ? THEME.gold : '#555',
                  color: phone.length >= 10 ? '#000' : '#888',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '1em',
                  fontWeight: 600,
                  cursor: phone.length >= 10 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
              >
                Send Verification Code →
              </button>
            </div>
          )}

          {/* STEP: OTP */}
          {currentStep === 'otp' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#aaa', marginBottom: '8px' }}>
                Enter the 6-digit code sent to your phone
              </p>
              <p style={{ color: THEME.goldLight, marginBottom: '24px', fontSize: '0.9em' }}>
                Demo code: <strong>123456</strong>
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                  if (val.length === 6) verifyOtp(val);
                }}
                placeholder="• • • • • •"
                maxLength={6}
                style={{
                  width: '200px',
                  padding: '16px',
                  fontSize: '2em',
                  borderRadius: '12px',
                  border: `2px solid ${THEME.gold}`,
                  background: 'rgba(0,0,0,0.3)',
                  color: THEME.white,
                  textAlign: 'center',
                  letterSpacing: '12px'
                }}
              />
            </div>
          )}

          {/* STEP: Profile */}
          {currentStep === 'profile' && (
            <div>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business Name"
                style={{
                  width: '100%',
                  padding: '14px',
                  marginBottom: '16px',
                  borderRadius: '10px',
                  border: `1px solid ${THEME.gold}40`,
                  background: 'rgba(0,0,0,0.3)',
                  color: THEME.white,
                  fontSize: '1em'
                }}
              />
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Tell me about your business... What do you sell? Where do you ship?"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${THEME.gold}40`,
                  background: 'rgba(0,0,0,0.3)',
                  color: THEME.white,
                  fontSize: '1em',
                  resize: 'vertical'
                }}
              />
              
              {!beautifiedProfile && businessDescription.length > 20 && (
                <button
                  onClick={() => beautifyProfile(businessDescription)}
                  style={{
                    marginTop: '16px',
                    padding: '12px 28px',
                    background: THEME.gold,
                    color: '#000',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ✨ Beautify My Profile
                </button>
              )}
              
              {beautifiedProfile && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: `rgba(184,134,11,0.1)`,
                    borderRadius: '12px',
                    border: `1px solid ${THEME.gold}`
                  }}
                >
                  <h4 style={{ color: THEME.gold, marginBottom: '12px' }}>
                    ✨ Your Profile Preview:
                  </h4>
                  <pre style={{ color: '#ddd', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                    {beautifiedProfile}
                  </pre>
                  <button
                    onClick={saveProfile}
                    style={{
                      marginTop: '16px',
                      padding: '12px 32px',
                      background: THEME.gold,
                      color: '#000',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✓ Save & Continue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP: Dashboard */}
          {currentStep === 'dashboard' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}
              >
                {[
                  { icon: '📦', title: 'My Products', desc: 'View & manage products', disabled: true },
                  { icon: '📤', title: 'Upload Catalog', desc: 'Add products from file', action: () => navigateToStep('upload') },
                  { icon: '🎯', title: 'Promotions', desc: 'Create deals & offers', disabled: true },
                  { icon: '🏪', title: 'Storefront', desc: 'Customize your store', disabled: true }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    disabled={item.disabled}
                    style={{
                      background: item.action ? `linear-gradient(135deg, ${THEME.gold}20, ${THEME.gold}10)` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${item.action ? THEME.gold : THEME.gold + '40'}`,
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: item.action ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      opacity: item.disabled ? 0.6 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '2em' }}>{item.icon}</span>
                    <h4 style={{ color: THEME.white, margin: '12px 0 8px' }}>{item.title}</h4>
                    <p style={{ color: '#888', fontSize: '0.85em', margin: 0 }}>{item.desc}</p>
                    {item.action && (
                      <span style={{ color: THEME.gold, fontSize: '0.8em', marginTop: '8px', display: 'block' }}>
                        → Click or say "upload catalog"
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Upload */}
          {currentStep === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>
                Supported formats: PDF, Excel (.xlsx), CSV
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `3px dashed ${THEME.gold}`,
                  borderRadius: '20px',
                  padding: '48px 24px',
                  cursor: 'pointer',
                  background: `rgba(184,134,11,0.05)`,
                  transition: 'all 0.2s ease'
                }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = `rgba(184,134,11,0.15)`; }}
                onDragLeave={(e) => { e.currentTarget.style.background = `rgba(184,134,11,0.05)`; }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.background = `rgba(184,134,11,0.05)`;
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
              >
                <span style={{ fontSize: '4em' }}>📁</span>
                <p style={{ color: THEME.goldLight, marginTop: '16px', fontSize: '1.1em' }}>
                  Click to browse or drag your file here
                </p>
                <p style={{ color: '#666', fontSize: '0.9em', marginTop: '8px' }}>
                  Or say "browse" to open file picker
                </p>
              </div>
            </div>
          )}

          {/* STEP: Processing */}
          {currentStep === 'processing' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>
                5-Step Catalog Pipeline
              </p>
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                {PROCESSING_STEPS.map((step, i) => (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      marginBottom: '8px',
                      background: processingStepIndex > i 
                        ? 'rgba(34,197,94,0.15)' 
                        : processingStepIndex === i 
                          ? `rgba(184,134,11,0.2)` 
                          : 'rgba(255,255,255,0.05)',
                      borderRadius: '10px',
                      border: `1px solid ${processingStepIndex === i ? THEME.gold : 'transparent'}`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.3em' }}>
                      {processingStepIndex > i ? '✅' : processingStepIndex === i ? '⏳' : '⬜'}
                    </span>
                    <span style={{ color: processingStepIndex >= i ? THEME.white : '#666', flex: 1 }}>
                      {step.label}
                    </span>
                    {processingStepIndex === i && (
                      <span style={{ color: THEME.gold, fontSize: '0.85em' }}>Processing...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Complete */}
          {currentStep === 'complete' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '5em' }}>🎉</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px', fontSize: '1.5em' }}>
                Your Store is Live!
              </h3>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>
                47 products imported and ready to sell
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleComplete}
                  style={{
                    padding: '14px 36px',
                    background: THEME.gold,
                    color: '#000',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1em'
                  }}
                >
                  View My Products →
                </button>
                <button
                  onClick={() => navigateToStep('dashboard')}
                  style={{
                    padding: '14px 36px',
                    background: 'rgba(255,255,255,0.1)',
                    color: THEME.white,
                    border: `1px solid ${THEME.gold}`,
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px 24px',
            borderTop: `1px solid ${THEME.gold}40`,
            textAlign: 'center'
          }}
        >
          <span style={{ color: '#666', fontSize: '0.8em' }}>
            💡 Say "hey Mr V" to pause • "back" to go back • "close" to exit
          </span>
        </div>
      </div>
    </div>
  );
};

export default VendorOnboardingModal;
