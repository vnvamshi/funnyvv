// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR ONBOARDING MODAL v3.0
// Voice-first: Phone → OTP → Profile → Upload Catalog → 5-step pipeline
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VendorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'phone' | 'otp' | 'profile' | 'dashboard' | 'upload' | 'processing' | 'complete';

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorOnboardingModal: React.FC<VendorOnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profileText, setProfileText] = useState('');
  const [beautifiedProfile, setBeautifiedProfile] = useState('');
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis; }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e: any) => {
      const res = e.results[e.results.length-1];
      setTranscript(res[0].transcript.trim());
      if (res.isFinal) handleVoiceInput(res[0].transcript);
    };
    r.onend = () => { if (isListening && isOpen && !isPaused) try { r.start(); } catch(e) {} };
    recRef.current = r;
  }, [isOpen, isListening, isPaused, step]);

  useEffect(() => {
    if (isOpen) {
      setIsListening(true);
      try { recRef.current?.start(); } catch(e) {}
      setTimeout(() => speak("Welcome, Vendor! Let's get you set up. Please tell me your phone number with country code."), 500);
    } else {
      setIsListening(false);
      try { recRef.current?.stop(); } catch(e) {}
      stop();
    }
  }, [isOpen]);

  const handleVoiceInput = useCallback((text: string) => {
    const cmd = text.toLowerCase();
    
    // Pause on "hey Mr V"
    if (cmd.includes('hey') && (cmd.includes('mr') || cmd.includes('mister') || cmd.includes('vista'))) {
      stop();
      setIsPaused(true);
      speak("Yes? I'm listening. What would you like to do?");
      setTimeout(() => setIsPaused(false), 8000);
      return;
    }
    
    setIsPaused(false);
    
    if (cmd.includes('stop') || cmd.includes('pause')) { stop(); return; }
    if (cmd.includes('close') || cmd.includes('exit')) { stop(); onClose(); return; }
    if (cmd.includes('back') || cmd.includes('go back')) { goBack(); return; }
    
    // Handle step-specific input
    if (step === 'phone') {
      const digits = text.replace(/\D/g, '');
      if (digits.length >= 10) {
        setPhone(digits);
        speak(`I heard ${digits}. Is that correct? Say yes to confirm.`);
      } else if (cmd.includes('yes') || cmd.includes('correct') || cmd.includes('confirm')) {
        if (phone.length >= 10) {
          proceedToOtp();
        }
      }
    } else if (step === 'otp') {
      const digits = text.replace(/\D/g, '');
      if (digits.length === 6 || cmd.includes('123456')) {
        setOtp('123456');
        verifyOtp();
      }
    } else if (step === 'profile') {
      if (cmd.includes('yes') || cmd.includes('save') || cmd.includes('confirm') || cmd.includes('looks good')) {
        saveProfile();
      } else if (text.length > 20) {
        setProfileText(text);
        beautifyProfile(text);
      }
    } else if (step === 'dashboard') {
      if (cmd.includes('upload') || cmd.includes('catalog')) {
        setStep('upload');
        speak("Great! Click the upload button or drag your catalog file here.");
      }
    }
  }, [step, phone]);

  const goBack = () => {
    stop();
    const stepOrder: Step[] = ['phone', 'otp', 'profile', 'dashboard', 'upload', 'processing', 'complete'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
      speak(`Going back to ${stepOrder[currentIndex - 1]} step.`);
    }
  };

  const proceedToOtp = () => {
    setStep('otp');
    speak("Sending verification code now. For this demo, enter 1 2 3 4 5 6.");
  };

  const verifyOtp = () => {
    speak("Verified! Welcome in. Now tell me about your business. What do you sell and where do you ship?");
    setTimeout(() => setStep('profile'), 1500);
  };

  const beautifyProfile = (text: string) => {
    // LinkedIn-style beautification
    const beautified = `🏪 **Premium Vendor on VistaView**\n\n${text.charAt(0).toUpperCase() + text.slice(1)}.\n\n✨ Committed to quality products and excellent customer service.\n📦 Fast shipping • 🔒 Secure transactions • ⭐ Customer satisfaction guaranteed`;
    setBeautifiedProfile(beautified);
    speak("Here's how I'd present your brand on VistaView. Does this look good? Say yes to save.");
  };

  const saveProfile = () => {
    speak("Profile saved! Welcome to your Vendor Dashboard. You can upload your catalog, manage products, run promotions, or customize your storefront.");
    setTimeout(() => setStep('dashboard'), 1500);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setStep('processing');
    runPipeline();
  };

  const runPipeline = async () => {
    const steps = [
      { msg: "Parsing your catalog... extracting product names, sections, and structure.", delay: 2000 },
      { msg: "Extracting images... organizing them into a clean folder layout.", delay: 2500 },
      { msg: "Enhancing image quality... checking dimensions and cropping intelligently.", delay: 3000 },
      { msg: "Creating product tables... generating SKU, price, materials, size, warranty fields.", delay: 2500 },
      { msg: "Vectorizing descriptions for Ask Anything... publishing products to catalog!", delay: 2000 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i + 1);
      speak(steps[i].msg);
      await new Promise(resolve => setTimeout(resolve, steps[i].delay));
    }

    speak("Your catalog looks amazing! All products have been published to your Product Catalog. Want me to show you?");
    setStep('complete');
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    stop();
    setDisplayText(text);
    setIsSpeaking(true);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = () => setIsSpeaking(false);
    synthRef.current.speak(u);
  };

  const stop = () => { synthRef.current?.cancel(); setIsSpeaking(false); };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}`, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderBottom: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>
            <h2 style={{ color: THEME.gold, margin: 0 }}>📦 Vendor Setup</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isListening ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isListening ? '#00ff00' : '#666' }} />
              <span style={{ color: '#fff', fontSize: '0.85em' }}>{isListening ? 'Listening...' : 'Paused'}</span>
            </div>
            {isSpeaking && <button onClick={stop} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>⏹ Stop</button>}
            <button onClick={onClose} style={{ background: 'transparent', color: '#fff', border: `1px solid ${THEME.gold}`, width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', padding: '16px 24px', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
          {['phone', 'otp', 'profile', 'dashboard', 'upload'].map((s, i) => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: ['phone', 'otp', 'profile', 'dashboard', 'upload'].indexOf(step) >= i ? THEME.gold : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>

        {/* Teleprompter */}
        <div style={{ background: `rgba(184,134,11,0.15)`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff00' }} />
          <span style={{ color: '#B8860B', fontWeight: 600 }}>MR. V:</span>
          <span style={{ color: isSpeaking ? THEME.goldLight : '#aaa', flex: 1 }}>
            {isSpeaking ? displayText : transcript ? `"${transcript}"` : 'Listening...'}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          
          {/* Step: Phone */}
          {step === 'phone' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>📱</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Enter Your Phone Number</h3>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>Say it or type below</p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="+1 (555) 123-4567"
                style={{ width: '100%', maxWidth: '300px', padding: '16px', fontSize: '1.2em', borderRadius: '12px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff', textAlign: 'center' }}
              />
              <br/>
              <button onClick={proceedToOtp} disabled={phone.length < 10} style={{ marginTop: '20px', padding: '12px 32px', background: phone.length >= 10 ? THEME.gold : '#555', color: phone.length >= 10 ? '#000' : '#888', border: 'none', borderRadius: '25px', cursor: phone.length >= 10 ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                Send OTP →
              </button>
            </div>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>🔐</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Enter Verification Code</h3>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>Demo code: <strong style={{ color: THEME.goldLight }}>123456</strong></p>
              <input
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); if (e.target.value === '123456') verifyOtp(); }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                style={{ width: '100%', maxWidth: '200px', padding: '16px', fontSize: '1.5em', borderRadius: '12px', border: `2px solid ${THEME.gold}`, background: 'rgba(0,0,0,0.3)', color: '#fff', textAlign: 'center', letterSpacing: '8px' }}
              />
            </div>
          )}

          {/* Step: Profile */}
          {step === 'profile' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '3em' }}>✍️</span>
                <h3 style={{ color: THEME.gold }}>Tell Me About Your Business</h3>
                <p style={{ color: '#aaa' }}>What do you sell? Where do you ship?</p>
              </div>
              <textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder="I sell handcrafted furniture and ship nationwide..."
                style={{ width: '100%', minHeight: '100px', padding: '16px', borderRadius: '12px', border: `2px solid ${THEME.gold}40`, background: 'rgba(0,0,0,0.3)', color: '#fff', resize: 'vertical' }}
              />
              {beautifiedProfile && (
                <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(184,134,11,0.1)', borderRadius: '12px', border: `1px solid ${THEME.gold}` }}>
                  <h4 style={{ color: THEME.gold, marginBottom: '10px' }}>✨ Beautified Profile Preview:</h4>
                  <pre style={{ color: '#ddd', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{beautifiedProfile}</pre>
                  <button onClick={saveProfile} style={{ marginTop: '16px', padding: '12px 32px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>
                    ✓ Save Profile
                  </button>
                </div>
              )}
              {!beautifiedProfile && profileText.length > 20 && (
                <button onClick={() => beautifyProfile(profileText)} style={{ marginTop: '16px', padding: '12px 32px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>
                  ✨ Beautify My Profile
                </button>
              )}
            </div>
          )}

          {/* Step: Dashboard */}
          {step === 'dashboard' && (
            <div>
              <h3 style={{ color: THEME.gold, textAlign: 'center', marginBottom: '24px' }}>🎉 Welcome to Your Vendor Dashboard!</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {[
                  { icon: '📦', title: 'My Products', desc: 'View and manage products' },
                  { icon: '📤', title: 'Upload Catalog', desc: 'Add products from PDF/Excel', action: () => setStep('upload') },
                  { icon: '🎯', title: 'Promotions', desc: 'Create deals and offers' },
                  { icon: '🏪', title: 'Storefront', desc: 'Customize your store' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}40`, borderRadius: '16px', padding: '24px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '2em' }}>{item.icon}</span>
                    <h4 style={{ color: '#fff', margin: '12px 0 8px' }}>{item.title}</h4>
                    <p style={{ color: '#888', fontSize: '0.9em', margin: 0 }}>{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Upload */}
          {step === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4em' }}>📤</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Upload Your Catalog</h3>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>PDF, Excel, or CSV supported</p>
              <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} style={{ display: 'none' }} />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: `3px dashed ${THEME.gold}`, borderRadius: '16px', padding: '48px', cursor: 'pointer', background: 'rgba(184,134,11,0.05)' }}
              >
                <span style={{ fontSize: '3em' }}>📁</span>
                <p style={{ color: THEME.goldLight, marginTop: '16px' }}>Click to browse or drag file here</p>
              </div>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: THEME.gold, marginBottom: '24px' }}>🔄 Processing Your Catalog</h3>
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                {['Parsing catalog', 'Extracting images', 'Enhancing quality', 'Creating tables', 'Publishing products'].map((label, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '8px', background: processingStep > i ? 'rgba(0,255,0,0.1)' : processingStep === i + 1 ? 'rgba(184,134,11,0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', border: `1px solid ${processingStep === i + 1 ? THEME.gold : 'transparent'}` }}>
                    <span style={{ fontSize: '1.2em' }}>{processingStep > i ? '✅' : processingStep === i + 1 ? '⏳' : '⬜'}</span>
                    <span style={{ color: processingStep >= i + 1 ? '#fff' : '#666' }}>{label}</span>
                    {processingStep === i + 1 && <span style={{ marginLeft: 'auto', color: THEME.gold }}>Processing...</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '5em' }}>🎉</span>
              <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Catalog Published Successfully!</h3>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>Your products are now live on VistaView</p>
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

        {/* Footer */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 24px', borderTop: `1px solid ${THEME.gold}40`, textAlign: 'center' }}>
          <span style={{ color: '#888', fontSize: '0.85em' }}>Say "hey Mr V" to pause • "back" to go back • "close" to exit</span>
        </div>
      </div>
    </div>
  );
};

export default VendorOnboardingModal;
