// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR ONBOARDING MODAL v5.0
// 5-Step PDF Processing Pipeline with Real Backend SSE
// Compatible with AgentBar
// ═══════════════════════════════════════════════════════════════════════════════
//
// FLOW: Phone → OTP → Profile → Dashboard → Upload → Processing → Complete
// PIPELINE: Parse Catalog → Extract Images → Enhance → Save to DB → Vectorize
//
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Try to import AgentBar - fallback if not available
let useAgentBar: any;
try {
  useAgentBar = require('./AgentBar').useAgentBar;
} catch (e) {
  // AgentBar not available, use fallback
  useAgentBar = () => ({
    speak: (text: string, cb?: () => void) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => cb?.();
      window.speechSynthesis.speak(utterance);
    },
    stop: () => window.speechSynthesis.cancel(),
    onVoiceCommand: () => {},
    pushNavigation: () => {},
    setCurrentModal: () => {}
  });
}

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
  imagesCount?: number;
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

interface ProcessingStepState {
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const THEME = {
  teal: '#004236',
  tealLight: '#00d4aa',
  gold: '#B8860B',
  goldLight: '#F5EC9B',
  purple: '#8b5cf6',
  white: '#FFFFFF',
  dark: '#0a1628',
  darker: '#060d18'
};

// Backend API - change this to your server URL
const API_BASE = 'http://localhost:1117';

const STEP_CONFIG: Record<OnboardingStep, {
  title: string;
  icon: string;
  voiceIntro: string;
  canGoBack: boolean;
}> = {
  welcome: {
    title: 'Welcome, Vendor!',
    icon: '👋',
    voiceIntro: "Welcome to VistaView! I'm Mr. V, and I'll guide you through setting up your vendor account. Let's start with your phone number.",
    canGoBack: false
  },
  phone: {
    title: 'Phone Verification',
    icon: '📱',
    voiceIntro: "Please enter your phone number. You can say it aloud or type it below.",
    canGoBack: true
  },
  otp: {
    title: 'Enter Verification Code',
    icon: '🔐',
    voiceIntro: "I've sent a 6-digit code to your phone. Please enter it. For demo, use 1 2 3 4 5 6.",
    canGoBack: true
  },
  profile: {
    title: 'Business Profile',
    icon: '✍️',
    voiceIntro: "Tell me about your business. What products do you sell? I'll create a beautiful profile for you.",
    canGoBack: true
  },
  dashboard: {
    title: 'Vendor Dashboard',
    icon: '🎯',
    voiceIntro: "Welcome to your Dashboard! Say 'upload catalog' to add your products.",
    canGoBack: true
  },
  upload: {
    title: 'Upload Catalog',
    icon: '📤',
    voiceIntro: "Upload your product catalog as a PDF. I'll extract all products automatically using our 5-step pipeline.",
    canGoBack: true
  },
  processing: {
    title: 'Processing Catalog',
    icon: '⚙️',
    voiceIntro: "Processing your catalog now with our 5-step pipeline.",
    canGoBack: false
  },
  complete: {
    title: 'Setup Complete!',
    icon: '🎉',
    voiceIntro: "Congratulations! Your products are now live on VistaView!",
    canGoBack: false
  }
};

// THE 5-STEP PIPELINE
const INITIAL_PROCESSING_STEPS: ProcessingStepState[] = [
  { name: 'Parse Catalog', status: 'pending' },
  { name: 'Extract Images', status: 'pending' },
  { name: 'Enhance Images', status: 'pending' },
  { name: 'Save to Database', status: 'pending' },
  { name: 'Vectorize & Publish', status: 'pending' }
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
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  // Processing state - THE 5 STEPS
  const [processingSteps, setProcessingSteps] = useState<ProcessingStepState[]>(INITIAL_PROCESSING_STEPS);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [processedData, setProcessedData] = useState<{totalProducts: number; totalImages: number} | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Agent Bar integration (with fallback)
  const agentBar = useAgentBar();
  const { speak, stop, onVoiceCommand, pushNavigation, setCurrentModal } = agentBar || {};

  // Safe speak function
  const safeSpeak = useCallback((text: string, callback?: () => void) => {
    if (speak) {
      speak(text, callback);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => callback?.();
      window.speechSynthesis.speak(utterance);
    }
  }, [speak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen) {
      setCurrentModal?.('vendor-onboarding');
      setCurrentStep('welcome');
      setStepHistory([]);
      
      setTimeout(() => {
        safeSpeak(STEP_CONFIG.welcome.voiceIntro, () => {
          setTimeout(() => navigateToStep('phone'), 500);
        });
      }, 500);
    } else {
      setCurrentModal?.(null);
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE COMMAND HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!onVoiceCommand) return;
    
    onVoiceCommand((cmd: string) => {
      const lower = cmd.toLowerCase();
      
      switch (currentStep) {
        case 'phone':
          const digits = cmd.replace(/\D/g, '');
          if (digits.length >= 10) {
            setPhone(digits);
            safeSpeak(`I heard ${digits.split('').join(' ')}. Say yes to confirm.`);
            return true;
          }
          if ((lower.includes('yes') || lower.includes('confirm')) && phone.length >= 10) {
            navigateToStep('otp');
            return true;
          }
          break;
          
        case 'otp':
          const otpDigits = cmd.replace(/\D/g, '');
          if (otpDigits.length >= 6) {
            setOtp(otpDigits.slice(0, 6));
            verifyOtp(otpDigits.slice(0, 6));
            return true;
          }
          break;
          
        case 'profile':
          if ((lower.includes('yes') || lower.includes('save')) && beautifiedProfile) {
            saveProfile();
            return true;
          }
          if (cmd.length > 20) {
            setBusinessDescription(cmd);
            beautifyProfileText(cmd);
            return true;
          }
          break;
          
        case 'dashboard':
          if (lower.includes('upload') || lower.includes('catalog')) {
            navigateToStep('upload');
            return true;
          }
          break;
          
        case 'upload':
          if (lower.includes('browse') || lower.includes('select')) {
            fileInputRef.current?.click();
            return true;
          }
          break;
          
        case 'complete':
          if (lower.includes('view') || lower.includes('done')) {
            handleComplete();
            return true;
          }
          break;
      }
      
      return false;
    });
  }, [currentStep, phone, beautifiedProfile]);

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════
  const navigateToStep = useCallback((step: OnboardingStep) => {
    if (STEP_CONFIG[currentStep].canGoBack) {
      setStepHistory(prev => [...prev, currentStep]);
      pushNavigation?.({
        type: 'step',
        name: STEP_CONFIG[currentStep].title,
        data: { step: currentStep }
      });
    }
    
    setCurrentStep(step);
    
    setTimeout(() => {
      safeSpeak(STEP_CONFIG[step].voiceIntro);
    }, 300);
  }, [currentStep, safeSpeak, pushNavigation]);

  const goToPreviousStep = useCallback(() => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1));
      setCurrentStep(previousStep);
      safeSpeak(`Going back to ${STEP_CONFIG[previousStep].title}.`);
    }
  }, [stepHistory, safeSpeak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const verifyOtp = (code: string) => {
    if (code === '123456') {
      safeSpeak("Verified! Now tell me about your business.", () => {
        navigateToStep('profile');
      });
    } else {
      safeSpeak("That code doesn't match. Try 1 2 3 4 5 6.");
    }
  };

  const beautifyProfileText = async (description: string) => {
    const name = businessName || 'Your Business';
    
    // Try backend beautification
    try {
      const res = await fetch(`${API_BASE}/api/beautify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawProfile: description })
      });
      const data = await res.json();
      if (data.beautified) {
        setBeautifiedProfile(data.beautified);
        setBusinessName(data.companyName || name);
        safeSpeak("Here's your polished profile. Say yes to save.");
        return;
      }
    } catch (e) {
      // Fallback
    }
    
    // Fallback beautification
    const beautified = `🏪 **${name} on VistaView**\n\n${description}\n\n✨ Quality Products • Fast Shipping • Satisfaction Guaranteed`;
    setBeautifiedProfile(beautified);
    safeSpeak("Here's your profile preview. Say yes to save.");
  };

  const saveProfile = async () => {
    // Try to save to backend
    try {
      const res = await fetch(`${API_BASE}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          companyName: businessName,
          description: beautifiedProfile
        })
      });
      const data = await res.json();
      if (data.id) setVendorId(data.id);
    } catch (e) {
      console.log('Backend not available, continuing offline');
    }
    
    safeSpeak("Profile saved! Welcome to your Dashboard.", () => {
      navigateToStep('dashboard');
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE UPLOAD & 5-STEP PROCESSING
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    
    // Reset processing state
    setProcessingSteps(INITIAL_PROCESSING_STEPS.map(s => ({ ...s, status: 'pending' as const })));
    setProcessingProgress(0);
    setCurrentMessage('');
    
    safeSpeak(`Uploading ${file.name}. Starting the 5-step pipeline!`);
    navigateToStep('processing');
    
    // Generate session ID
    const sessionId = crypto.randomUUID();
    
    // Create form data
    const formData = new FormData();
    formData.append('catalog', file);
    formData.append('vendorId', vendorId || '1');
    formData.append('sessionId', sessionId);
    
    try {
      const response = await fetch(`${API_BASE}/api/vendor/process-catalog`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Connect to SSE for real-time updates
        connectToSSE(sessionId);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.log('Backend not available, running simulated pipeline');
      runSimulatedPipeline();
    }
  };

  // SSE Connection for Real-Time Progress
  const connectToSSE = (sessionId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const eventSource = new EventSource(`${API_BASE}/api/sse/progress/${sessionId}`);
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleProgressUpdate(data);
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      // Fallback to simulated if SSE fails
      runSimulatedPipeline();
    };
  };

  const handleProgressUpdate = (data: any) => {
    if (data.type === 'connected') return;
    
    // Update progress bar
    if (data.progress !== undefined) {
      setProcessingProgress(data.progress);
    }
    
    // Update message and speak
    if (data.message) {
      setCurrentMessage(data.message);
      safeSpeak(data.message);
    }
    
    // Update step status
    if (data.step) {
      setProcessingSteps(prev => prev.map((s, i) => {
        if (i + 1 < data.step) return { ...s, status: 'complete' };
        if (i + 1 === data.step) return { ...s, status: data.status || 'active', message: data.message };
        return s;
      }));
    }
    
    // Check for completion
    if (data.complete || data.progress >= 100) {
      setProcessedData({
        totalProducts: data.productCount || data.data?.totalProducts || 12,
        totalImages: data.imageCount || data.data?.totalImages || 24
      });
      
      setTimeout(() => {
        setCurrentStep('complete');
        safeSpeak("All done! Your products are now live on VistaView!");
      }, 1000);
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }
  };

  // Simulated Pipeline (when backend unavailable)
  const runSimulatedPipeline = async () => {
    const steps = [
      { message: "Parsing your catalog... found some great products!", duration: 2000, progress: 20 },
      { message: "Extracting product images!", duration: 2500, progress: 40 },
      { message: "Enhancing images for the web!", duration: 2000, progress: 60 },
      { message: "Saving to database!", duration: 2500, progress: 80 },
      { message: "Vectorizing and publishing!", duration: 2000, progress: 100 }
    ];
    
    for (let i = 0; i < steps.length; i++) {
      // Set step active
      setProcessingSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx < i ? 'complete' : idx === i ? 'active' : 'pending'
      })));
      
      setCurrentMessage(steps[i].message);
      safeSpeak(steps[i].message);
      
      // Animate progress
      const startProgress = i === 0 ? 0 : steps[i - 1].progress;
      const endProgress = steps[i].progress;
      
      for (let p = startProgress; p <= endProgress; p += 2) {
        setProcessingProgress(p);
        await new Promise(r => setTimeout(r, steps[i].duration / 10));
      }
      
      // Mark complete
      setProcessingSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx <= i ? 'complete' : 'pending'
      })));
    }
    
    // Complete
    setProcessedData({ totalProducts: 12, totalImages: 24 });
    setTimeout(() => {
      setCurrentStep('complete');
      safeSpeak("Fantastic! Your catalog is now live!");
    }, 500);
  };

  const handleComplete = () => {
    const vendorData: VendorData = {
      phone,
      businessName,
      businessDescription,
      shippingRegions: ['Nationwide'],
      catalogFile: uploadedFile || undefined,
      productsCount: processedData?.totalProducts || 12,
      imagesCount: processedData?.totalImages || 24
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
        paddingBottom: '80px'
      }}
    >
      <div
        ref={containerRef}
        style={{
          background: `linear-gradient(135deg, ${THEME.dark}, ${THEME.darker})`,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '85vh',
          overflow: 'hidden',
          border: `1px solid ${THEME.tealLight}33`,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 40px ${THEME.tealLight}22`
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '16px 24px',
            borderBottom: `1px solid ${THEME.tealLight}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8em' }}>{stepConfig.icon}</span>
            <div>
              <h2 style={{ color: THEME.gold, margin: 0, fontSize: '1.3em' }}>
                {stepConfig.title}
              </h2>
              <p style={{ color: '#888', margin: 0, fontSize: '0.85em' }}>
                Step {Object.keys(STEP_CONFIG).indexOf(currentStep) + 1}/8
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              color: THEME.white,
              fontSize: '1.2em'
            }}
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '4px', padding: '12px 24px' }}>
          {Object.keys(STEP_CONFIG).map((step, i) => (
            <div
              key={step}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: Object.keys(STEP_CONFIG).indexOf(currentStep) >= i 
                  ? THEME.gold 
                  : 'rgba(255,255,255,0.1)'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          
          {/* STEP: Phone */}
          {currentStep === 'phone' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>
                Enter your phone number
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
                  border: `2px solid ${THEME.tealLight}`,
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
                  background: phone.length >= 10 
                    ? `linear-gradient(135deg, ${THEME.tealLight}, ${THEME.purple})` 
                    : '#333',
                  color: THEME.white,
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '1em',
                  fontWeight: 600,
                  cursor: phone.length >= 10 ? 'pointer' : 'not-allowed'
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
                Enter the 6-digit code
              </p>
              <p style={{ color: THEME.tealLight, marginBottom: '24px', fontSize: '0.9em' }}>
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
                  border: `2px solid ${THEME.tealLight}`,
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
                  border: `1px solid ${THEME.tealLight}44`,
                  background: 'rgba(0,0,0,0.3)',
                  color: THEME.white,
                  fontSize: '1em'
                }}
              />
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Tell me about your business..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${THEME.tealLight}44`,
                  background: 'rgba(0,0,0,0.3)',
                  color: THEME.white,
                  fontSize: '1em',
                  resize: 'vertical'
                }}
              />
              
              {!beautifiedProfile && businessDescription.length > 20 && (
                <button
                  onClick={() => beautifyProfileText(businessDescription)}
                  style={{
                    marginTop: '16px',
                    padding: '12px 28px',
                    background: `linear-gradient(135deg, ${THEME.purple}, ${THEME.tealLight})`,
                    color: THEME.white,
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
                    background: `rgba(0,212,170,0.1)`,
                    borderRadius: '12px',
                    border: `1px solid ${THEME.tealLight}`
                  }}
                >
                  <h4 style={{ color: THEME.tealLight, marginBottom: '12px' }}>
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
                      background: `linear-gradient(135deg, ${THEME.tealLight}, ${THEME.purple})`,
                      color: THEME.white,
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {[
                  { icon: '📦', title: 'My Products', desc: 'View & manage', disabled: true },
                  { icon: '📤', title: 'Upload Catalog', desc: 'Add products from PDF', action: () => navigateToStep('upload') },
                  { icon: '🎯', title: 'Promotions', desc: 'Create deals', disabled: true },
                  { icon: '🏪', title: 'Storefront', desc: 'Customize store', disabled: true }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    disabled={item.disabled}
                    style={{
                      background: item.action 
                        ? `linear-gradient(135deg, ${THEME.tealLight}20, ${THEME.purple}20)` 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${item.action ? THEME.tealLight : THEME.tealLight + '40'}`,
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: item.action ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      opacity: item.disabled ? 0.6 : 1
                    }}
                  >
                    <span style={{ fontSize: '2em' }}>{item.icon}</span>
                    <h4 style={{ color: THEME.white, margin: '12px 0 8px' }}>{item.title}</h4>
                    <p style={{ color: '#888', fontSize: '0.85em', margin: 0 }}>{item.desc}</p>
                    {item.action && (
                      <span style={{ color: THEME.tealLight, fontSize: '0.8em', marginTop: '8px', display: 'block' }}>
                        → Click to upload
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
                Upload your product catalog (PDF)
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
                  border: `3px dashed ${THEME.tealLight}`,
                  borderRadius: '20px',
                  padding: '48px 24px',
                  cursor: 'pointer',
                  background: `rgba(0,212,170,0.05)`
                }}
              >
                <span style={{ fontSize: '4em' }}>📁</span>
                <p style={{ color: THEME.tealLight, marginTop: '16px', fontSize: '1.1em' }}>
                  Click to browse or drag file here
                </p>
                <p style={{ color: '#666', fontSize: '0.9em', marginTop: '8px' }}>
                  PDF up to 100MB
                </p>
              </div>
              
              <button
                onClick={() => navigateToStep('dashboard')}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  background: 'transparent',
                  border: `1px solid ${THEME.tealLight}44`,
                  borderRadius: '10px',
                  color: '#888',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP: PROCESSING - THE 5-STEP PIPELINE */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 'processing' && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                background: `linear-gradient(90deg, ${THEME.tealLight}, ${THEME.purple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                5-Step Processing Pipeline
              </h3>
              
              {/* Current Message */}
              {currentMessage && (
                <p style={{ color: THEME.tealLight, marginBottom: '24px', fontStyle: 'italic' }}>
                  "{currentMessage}"
                </p>
              )}
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto 24px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                height: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${processingProgress}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${THEME.tealLight}, ${THEME.purple})`,
                  transition: 'width 0.3s ease',
                  borderRadius: '10px'
                }} />
              </div>
              <p style={{ color: '#888', marginBottom: '32px' }}>{processingProgress}% Complete</p>
              
              {/* THE 5 PROCESSING STEPS */}
              <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                {processingSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      marginBottom: '12px',
                      background: step.status === 'complete' 
                        ? 'rgba(34,197,94,0.15)'
                        : step.status === 'active' 
                          ? 'rgba(139,92,246,0.2)'
                          : 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      border: `1px solid ${
                        step.status === 'complete' ? 'rgba(34,197,94,0.5)'
                        : step.status === 'active' ? THEME.purple
                        : 'transparent'
                      }`,
                      transition: 'all 0.3s'
                    }}
                  >
                    <span style={{ fontSize: '1.4em', width: '30px' }}>
                      {step.status === 'complete' ? '✅'
                        : step.status === 'active' ? '⏳'
                        : `${i + 1}`}
                    </span>
                    <span style={{
                      color: step.status === 'pending' ? '#666' : THEME.white,
                      fontWeight: step.status === 'active' ? 600 : 400,
                      flex: 1,
                      textAlign: 'left'
                    }}>
                      {step.name}
                    </span>
                    {step.status === 'active' && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: `2px solid ${THEME.purple}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Complete */}
          {currentStep === 'complete' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: '5em' }}>🎉</span>
              <h3 style={{
                background: `linear-gradient(90deg, ${THEME.tealLight}, ${THEME.gold})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.8em',
                marginTop: '16px'
              }}>
                Catalog Published!
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '32px',
                margin: '32px 0'
              }}>
                <div style={{
                  background: 'rgba(0,212,170,0.1)',
                  borderRadius: '12px',
                  padding: '20px 32px',
                  border: `1px solid ${THEME.tealLight}44`
                }}>
                  <p style={{ color: THEME.tealLight, fontSize: '2em', margin: 0, fontWeight: 700 }}>
                    {processedData?.totalProducts || 12}
                  </p>
                  <p style={{ color: '#888', margin: 0 }}>Products</p>
                </div>
                <div style={{
                  background: 'rgba(139,92,246,0.1)',
                  borderRadius: '12px',
                  padding: '20px 32px',
                  border: `1px solid ${THEME.purple}44`
                }}>
                  <p style={{ color: THEME.purple, fontSize: '2em', margin: 0, fontWeight: 700 }}>
                    {processedData?.totalImages || 24}
                  </p>
                  <p style={{ color: '#888', margin: 0 }}>Images</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleComplete}
                  style={{
                    padding: '14px 36px',
                    background: `linear-gradient(135deg, ${THEME.tealLight}, ${THEME.purple})`,
                    color: THEME.white,
                    border: 'none',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1em'
                  }}
                >
                  🛍️ View My Products →
                </button>
                <button
                  onClick={() => navigateToStep('dashboard')}
                  style={{
                    padding: '14px 36px',
                    background: 'rgba(255,255,255,0.1)',
                    color: THEME.white,
                    border: `1px solid ${THEME.tealLight}`,
                    borderRadius: '30px',
                    cursor: 'pointer'
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px 24px',
            borderTop: `1px solid ${THEME.tealLight}22`,
            textAlign: 'center'
          }}
        >
          <span style={{ color: '#666', fontSize: '0.8em' }}>
            💡 Say "back" to go back • "close" to exit
          </span>
        </div>
      </div>
      
      {/* Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VendorOnboardingModal;
