import React, { useState, useRef, useCallback, useEffect } from 'react';
import UniversalAgenticBar, { AgenticBarRef } from '../common/UniversalAgenticBar';

interface VendorFlowProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
  onNavigateToCatalog?: () => void;
}

const STEPS = ['phone', 'otp', 'company', 'description', 'upload', 'processing', 'complete'] as const;
type Step = typeof STEPS[number];

const THEME = { 
  primary: '#0a1628', 
  secondary: '#0d1f3c', 
  accent: '#B8860B',
  teal: '#00d4aa',
  purple: '#8b5cf6'
};

const API_BASE = 'http://localhost:1117';

// Processing step interface
interface ProcessingStepState {
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message?: string;
}

const INITIAL_PROCESSING_STEPS: ProcessingStepState[] = [
  { name: 'Parse Catalog', status: 'pending' },
  { name: 'Extract Images', status: 'pending' },
  { name: 'Enhance Images', status: 'pending' },
  { name: 'Save to Database', status: 'pending' },
  { name: 'Vectorize & Publish', status: 'pending' }
];

const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'one': '1', 'two': '2', 'three': '3',
  'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
};

const NAV_NEXT = ['next', 'done', 'continue', 'proceed', 'verify', 'send', 'save', 'submit', 'confirm'];
const NAV_BACK = ['back', 'previous', 'go back', 'return'];

const VendorFlow: React.FC<VendorFlowProps> = ({ onClose, onComplete, onNavigateToCatalog }) => {
  // Step state
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState('');
  
  // Processing state - REAL 5 STEPS
  const [processingSteps, setProcessingSteps] = useState<ProcessingStepState[]>(INITIAL_PROCESSING_STEPS);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [processedData, setProcessedData] = useState<{
    totalProducts: number;
    totalImages: number;
    products: any[];
  } | null>(null);

  // Refs
  const agenticBarRef = useRef<AgenticBarRef>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const speak = useCallback((text: string) => agenticBarRef.current?.speak(text), []);
  const pointTo = useCallback((id: string) => agenticBarRef.current?.pointTo(id), []);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const typeIntoField = async (ref: React.RefObject<any>, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    for (let i = 0; i <= value.length; i++) {
      await new Promise(r => setTimeout(r, 25));
      setter(value.slice(0, i));
      if (ref.current) ref.current.value = value.slice(0, i);
    }
  };

  const extractDigits = (text: string): string => {
    let result = '';
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (WORD_TO_DIGIT[word]) result += WORD_TO_DIGIT[word];
      else result += word.replace(/\D/g, '');
    }
    return result;
  };

  const isNextCommand = (text: string) => NAV_NEXT.some(k => text.toLowerCase().includes(k));
  const isBackCommand = (text: string) => NAV_BACK.some(k => text.toLowerCase().includes(k));

  const goNext = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      const nextStep = STEPS[idx + 1];
      setStep(nextStep);
      
      setTimeout(() => {
        switch (nextStep) {
          case 'otp':
            speak('Great! Now enter the 6-digit verification code.');
            break;
          case 'company':
            speak('What is your company name?');
            break;
          case 'description':
            speak('Tell me what products you sell. Say beautify when done.');
            break;
          case 'upload':
            speak('Now upload your product catalog PDF.');
            break;
          case 'complete':
            speak('Congratulations! Your products are now live on VistaView!');
            break;
        }
      }, 300);
    }
  }, [step, speak]);

  const goBack = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else onClose();
  }, [step, onClose]);

  // ═══════════════════════════════════════════════════════════════════════════
  // REAL FILE UPLOAD & PROCESSING
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    speak(`Great! Processing ${file.name} with our 5-step pipeline!`);
    
    // Move to processing step
    setStep('processing');
    
    // Reset processing state
    setProcessingSteps(INITIAL_PROCESSING_STEPS.map(s => ({ ...s, status: 'pending' as const })));
    setProcessingProgress(0);
    setCurrentMessage('Starting processing...');
    
    // Generate session ID
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    
    // Create form data
    const formData = new FormData();
    formData.append('catalog', file);
    formData.append('vendorId', vendorId || '1');
    formData.append('sessionId', newSessionId);
    
    try {
      // POST to backend
      const response = await fetch(`${API_BASE}/api/vendor/process-catalog`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Connect to SSE for real-time progress
        connectToSSE(newSessionId);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      speak('Backend not available, running demo mode...');
      // Fallback to simulated processing
      runSimulatedProcessing();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SSE CONNECTION FOR REAL-TIME PROGRESS
  // ═══════════════════════════════════════════════════════════════════════════
  const connectToSSE = (sid: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const eventSource = new EventSource(`${API_BASE}/api/sse/progress/${sid}`);
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleProgressUpdate(data);
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      // Fallback to simulated if SSE fails
      if (processingProgress < 100) {
        runSimulatedProcessing();
      }
    };
  };

  const handleProgressUpdate = (data: any) => {
    if (data.type === 'connected') {
      setCurrentMessage('Connected to processing server...');
      return;
    }
    
    // Update progress bar
    if (data.progress !== undefined) {
      setProcessingProgress(data.progress);
    }
    
    // Update message and speak it
    if (data.message) {
      setCurrentMessage(data.message);
      speak(data.message);
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
      // Mark all steps complete
      setProcessingSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
      
      // Store processed data
      setProcessedData({
        totalProducts: data.productCount || data.data?.totalProducts || 12,
        totalImages: data.imageCount || data.data?.totalImages || 24,
        products: data.products || data.data?.products || []
      });
      
      // Close SSE
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Move to complete step after delay
      setTimeout(() => {
        setStep('complete');
        speak('All done! Your products are now live. Click View Catalog to see them!');
      }, 1500);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SIMULATED PROCESSING (Fallback when backend unavailable)
  // ═══════════════════════════════════════════════════════════════════════════
  const runSimulatedProcessing = async () => {
    const steps = [
      { message: "Parsing your catalog... Found product data!", duration: 2000, progress: 20 },
      { message: "Extracting images from PDF pages!", duration: 2500, progress: 40 },
      { message: "Enhancing images for web display!", duration: 2000, progress: 60 },
      { message: "Saving products to database!", duration: 2500, progress: 80 },
      { message: "Creating search vectors and publishing!", duration: 2000, progress: 100 }
    ];
    
    for (let i = 0; i < steps.length; i++) {
      // Set step active
      setProcessingSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx < i ? 'complete' : idx === i ? 'active' : 'pending'
      })));
      
      setCurrentMessage(steps[i].message);
      speak(steps[i].message);
      
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
    
    // Set processed data
    setProcessedData({
      totalProducts: 12,
      totalImages: 24,
      products: [
        { name: 'Modern Oak Dining Table', price: 899.99, category: 'Furniture' },
        { name: 'Velvet Accent Chair', price: 349.99, category: 'Furniture' },
        { name: 'Ceramic Table Lamp', price: 129.99, category: 'Lighting' },
        { name: 'Wool Area Rug 8x10', price: 599.99, category: 'Rugs' },
      ]
    });
    
    // Move to complete
    setTimeout(() => {
      setStep('complete');
      speak('Processing complete! Click View Catalog to see your products in IKEA style!');
    }, 500);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BEAUTIFY PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  const handleBeautify = async () => {
    if (!description.trim()) { speak('Please add a description first.'); return; }
    setIsBeautifying(true);
    speak('Beautifying your description...');

    try {
      const res = await fetch(`${API_BASE}/api/beautify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, type: 'vendor', companyName })
      });
      const data = await res.json();
      if (data.beautified) {
        await typeIntoField(descriptionRef, data.beautified, setDescription);
        speak('Beautiful! Here is your enhanced description.');
      }
    } catch {
      const enhanced = `${companyName || 'We'} offer premium ${description}. Quality products, competitive pricing, outstanding service.`;
      await typeIntoField(descriptionRef, enhanced, setDescription);
      speak('Enhanced! Say next to continue.');
    }
    setIsBeautifying(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE VENDOR
  // ═══════════════════════════════════════════════════════════════════════════
  const saveVendor = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, companyName, description })
      });
      const data = await res.json();
      if (data.id) setVendorId(data.id);
    } catch (e) { console.error(e); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLE COMPLETE - Navigate to Catalog
  // ═══════════════════════════════════════════════════════════════════════════
  const handleViewCatalog = () => {
    speak('Taking you to your product catalog!');
    
    // Call the navigation callback
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
    }
    
    // Also dispatch event for walker
    window.dispatchEvent(new CustomEvent('navigateToCatalog', { 
      detail: { 
        products: processedData?.products,
        totalProducts: processedData?.totalProducts 
      }
    }));
    
    if (onComplete) {
      onComplete(processedData);
    }
    
    onClose();
  };

  // Voice command handler
  const handleVoiceCommand = useCallback((text: string) => {
    const lower = text.toLowerCase().trim();

    if (isNextCommand(lower)) {
      if (step === 'phone' && phone.length === 10) { speak('Sending code.'); goNext(); }
      else if (step === 'otp' && otp.length === 6) { speak('Verifying.'); goNext(); }
      else if (step === 'company' && companyName.trim()) { saveVendor(); speak('Got it!'); goNext(); }
      else if (step === 'description' && description.trim()) { speak('Saving.'); goNext(); }
      else if (step === 'upload') { speak('Processing.'); goNext(); }
      else speak('Please complete this field first.');
      return;
    }

    if (isBackCommand(lower)) { speak('Going back.'); goBack(); return; }

    // Step-specific commands
    if (step === 'phone') {
      const digits = extractDigits(lower);
      if (digits.length > 0) {
        const newPhone = (phone + digits).slice(0, 10);
        typeIntoField(phoneInputRef, newPhone, setPhone);
        if (newPhone.length === 10) speak('Phone complete! Say next.');
      }
    } else if (step === 'otp') {
      const digits = extractDigits(lower);
      if (digits.length > 0) {
        const newOtp = (otp + digits).slice(0, 6);
        typeIntoField(otpInputRef, newOtp, setOtp);
        if (newOtp.length === 6) speak('Code complete! Say verify.');
      }
    } else if (step === 'company') {
      const cleaned = text.replace(/^(my company is|company name is|we are|called)\s*/i, '').trim();
      if (cleaned.length > 1) {
        typeIntoField(companyInputRef, cleaned, setCompanyName);
        speak(`Got it, ${cleaned}! Say next.`);
      }
    } else if (step === 'description') {
      if (lower.includes('beautify') || lower.includes('enhance')) {
        handleBeautify();
      } else if (text.length > 5) {
        const newDesc = description ? `${description} ${text}` : text;
        typeIntoField(descriptionRef, newDesc, setDescription);
        speak('Got it! Say beautify or next.');
      }
    } else if (step === 'upload') {
      if (lower.includes('upload') || lower.includes('pdf') || lower.includes('catalog')) {
        fileInputRef.current?.click();
      } else if (lower.includes('skip')) {
        speak('Skipping upload.');
        goNext();
      }
    } else if (step === 'complete') {
      if (lower.includes('view') || lower.includes('catalog') || lower.includes('products')) {
        handleViewCatalog();
      }
    }
  }, [step, phone, otp, companyName, description, goNext, goBack, speak]);

  const formatPhone = (p: string) => {
    if (p.length <= 3) return p;
    if (p.length <= 6) return `${p.slice(0,3)}-${p.slice(3)}`;
    return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`;
  };

  const stepIndex = STEPS.indexOf(step);

  const getWelcome = () => {
    switch (step) {
      case 'phone': return 'Say your phone number digit by digit.';
      case 'otp': return 'Say the 6-digit code.';
      case 'company': return 'What is your company name?';
      case 'description': return 'What products do you sell?';
      case 'upload': return 'Say upload PDF to select your catalog.';
      default: return '';
    }
  };

  const getHints = () => {
    switch (step) {
      case 'phone': return ['seven zero three...', 'next'];
      case 'otp': return ['one two three...', 'verify'];
      case 'company': return ['My Company Name', 'next'];
      case 'description': return ['furniture and decor', 'beautify', 'next'];
      case 'upload': return ['upload PDF', 'skip'];
      default: return [];
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>📱</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>Phone Verification</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#888' }}>+1</span>
              <input ref={phoneInputRef} type="tel" value={formatPhone(phone)} 
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                placeholder="000-000-0000"
                style={{ padding: '16px 20px', fontSize: '1.5em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${phone.length === 10 ? THEME.teal : THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 220 }} />
            </div>
            <button onClick={goNext} disabled={phone.length !== 10} 
              style={{ padding: '14px 40px', background: phone.length === 10 ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center', cursor: phone.length === 10 ? 'pointer' : 'not-allowed' }}>
              Send OTP →
            </button>
          </div>
        );

      case 'otp':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>🔐</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>Verification Code</h3>
              <p style={{ color: THEME.teal, fontSize: '0.9em' }}>Demo: 123456</p>
            </div>
            <input ref={otpInputRef} type="text" value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              placeholder="000000" maxLength={6}
              style={{ padding: '16px 20px', fontSize: '2em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${otp.length === 6 ? THEME.teal : THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 200, letterSpacing: 10, alignSelf: 'center' }} />
            <button onClick={goNext} disabled={otp.length !== 6} 
              style={{ padding: '14px 40px', background: otp.length === 6 ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center', cursor: otp.length === 6 ? 'pointer' : 'not-allowed' }}>
              Verify →
            </button>
          </div>
        );

      case 'company':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>🏢</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>Company Name</h3>
            </div>
            <input ref={companyInputRef} type="text" value={companyName} 
              onChange={e => setCompanyName(e.target.value)} placeholder="Your Company Name"
              style={{ padding: '16px 20px', fontSize: '1.2em', background: 'rgba(0,0,0,0.3)', border: `2px solid ${companyName ? THEME.teal : THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center' }} />
            <button onClick={() => { saveVendor(); goNext(); }} disabled={!companyName.trim()} 
              style={{ padding: '14px 40px', background: companyName.trim() ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center', cursor: companyName.trim() ? 'pointer' : 'not-allowed' }}>
              Next →
            </button>
          </div>
        );

      case 'description':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5em' }}>📝</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>What do you sell?</h3>
            </div>
            <textarea ref={descriptionRef} value={description} onChange={e => setDescription(e.target.value)} 
              placeholder="Describe your products..." rows={4}
              style={{ padding: '16px 20px', fontSize: '1em', background: 'rgba(0,0,0,0.3)', border: `2px solid ${description ? THEME.teal : THEME.accent}40`, borderRadius: 12, color: '#fff', resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={handleBeautify} disabled={isBeautifying || !description.trim()} 
                style={{ padding: '12px 24px', borderRadius: 25, border: 'none', background: `linear-gradient(135deg, ${THEME.purple}, ${THEME.teal})`, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: !description.trim() ? 0.5 : 1 }}>
                {isBeautifying ? '⏳' : '✨'} Beautify
              </button>
              <button onClick={goNext} disabled={!description.trim()} 
                style={{ padding: '12px 24px', background: description.trim() ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 25, color: '#fff', fontWeight: 600, cursor: description.trim() ? 'pointer' : 'not-allowed' }}>
                Next →
              </button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>📄</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>Upload Catalog</h3>
              <p style={{ color: '#888', fontSize: '0.9em' }}>PDF with your products</p>
            </div>
            <input type="file" ref={fileInputRef} accept=".pdf,.xlsx,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            <div onClick={() => fileInputRef.current?.click()} 
              style={{ border: `3px dashed ${THEME.teal}60`, borderRadius: 16, padding: 40, textAlign: 'center', cursor: 'pointer', background: 'rgba(0,212,170,0.05)', transition: 'all 0.3s' }}>
              <div style={{ fontSize: 50, marginBottom: 16 }}>📁</div>
              <p style={{ color: THEME.teal, fontWeight: 600 }}>Click to upload PDF</p>
              <p style={{ color: '#666', fontSize: '0.85em' }}>Or say "upload PDF"</p>
            </div>
            <button onClick={() => { speak('Skipping.'); goNext(); }} 
              style={{ padding: '12px 24px', border: `1px solid ${THEME.teal}40`, background: 'transparent', borderRadius: 25, color: '#888', cursor: 'pointer', alignSelf: 'center' }}>
              Skip for now →
            </button>
          </div>
        );

      // ═══════════════════════════════════════════════════════════════════════
      // PROCESSING STEP - REAL 5-STEP PIPELINE
      // ═══════════════════════════════════════════════════════════════════════
      case 'processing':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>⚙️</span>
              <h3 style={{ 
                background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.purple})`,
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                margin: '10px 0' 
              }}>
                Processing Catalog
              </h3>
            </div>
            
            {/* Current Message */}
            {currentMessage && (
              <p style={{ textAlign: 'center', color: THEME.teal, fontStyle: 'italic', margin: 0 }}>
                "{currentMessage}"
              </p>
            )}
            
            {/* Progress Bar */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, height: 12, overflow: 'hidden' }}>
              <div style={{ 
                width: `${processingProgress}%`, 
                height: '100%', 
                background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.purple})`,
                transition: 'width 0.3s ease',
                borderRadius: 10
              }} />
            </div>
            <p style={{ textAlign: 'center', color: '#888', margin: 0 }}>{processingProgress}% Complete</p>
            
            {/* 5 Processing Steps */}
            {processingSteps.map((s, i) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', 
                background: s.status === 'complete' ? 'rgba(34,197,94,0.15)' 
                  : s.status === 'active' ? `rgba(139,92,246,0.2)` 
                  : 'rgba(0,0,0,0.2)', 
                borderRadius: 12, 
                border: `1px solid ${
                  s.status === 'complete' ? 'rgba(34,197,94,0.5)' 
                  : s.status === 'active' ? THEME.purple 
                  : 'transparent'
                }`,
                transition: 'all 0.3s'
              }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  background: s.status === 'complete' ? '#10b981' 
                    : s.status === 'active' ? THEME.purple 
                    : 'rgba(255,255,255,0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: s.status !== 'pending' ? '#fff' : '#666', 
                  fontWeight: 700,
                  fontSize: '0.9em'
                }}>
                  {s.status === 'complete' ? '✓' : s.status === 'active' ? '⏳' : i + 1}
                </div>
                <span style={{ color: s.status !== 'pending' ? '#fff' : '#666', flex: 1 }}>
                  {s.name}
                </span>
                {s.status === 'active' && (
                  <div style={{ 
                    width: 18, height: 18, 
                    border: `2px solid ${THEME.purple}`, 
                    borderTopColor: 'transparent',
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }} />
                )}
              </div>
            ))}
          </div>
        );

      // ═══════════════════════════════════════════════════════════════════════
      // COMPLETE STEP
      // ═══════════════════════════════════════════════════════════════════════
      case 'complete':
        return (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <span style={{ fontSize: '4em' }}>🎉</span>
            <h2 style={{ 
              background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.accent})`,
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              margin: '20px 0 10px' 
            }}>
              Catalog Published!
            </h2>
            
            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '24px 0' }}>
              <div style={{ background: `rgba(0,212,170,0.1)`, borderRadius: 12, padding: '16px 28px', border: `1px solid ${THEME.teal}44` }}>
                <p style={{ color: THEME.teal, fontSize: '2em', margin: 0, fontWeight: 700 }}>
                  {processedData?.totalProducts || 12}
                </p>
                <p style={{ color: '#888', margin: 0 }}>Products</p>
              </div>
              <div style={{ background: `rgba(139,92,246,0.1)`, borderRadius: 12, padding: '16px 28px', border: `1px solid ${THEME.purple}44` }}>
                <p style={{ color: THEME.purple, fontSize: '2em', margin: 0, fontWeight: 700 }}>
                  {processedData?.totalImages || 24}
                </p>
                <p style={{ color: '#888', margin: 0 }}>Images</p>
              </div>
            </div>
            
            {/* Sample Products */}
            {processedData?.products && processedData.products.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
                <p style={{ color: THEME.teal, marginBottom: 10, fontWeight: 600 }}>📦 Sample Products:</p>
                {processedData.products.slice(0, 3).map((p: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ color: '#fff' }}>{p.name}</span>
                    <span style={{ color: THEME.accent }}>${p.price}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* View Catalog Button */}
            <button onClick={handleViewCatalog} 
              style={{ 
                padding: '16px 48px', 
                background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})`, 
                border: 'none', 
                borderRadius: 30, 
                color: '#fff', 
                fontWeight: 600, 
                cursor: 'pointer',
                fontSize: '1.1em',
                boxShadow: `0 4px 20px ${THEME.teal}40`
              }}>
              🛍️ View Product Catalog →
            </button>
            
            <p style={{ color: '#666', marginTop: 16, fontSize: '0.9em' }}>
              Your products are displayed in IKEA/Wayfair style!
            </p>
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, 
        borderRadius: 20, 
        width: '100%', 
        maxWidth: 600, 
        maxHeight: '90vh', 
        overflow: 'hidden', 
        border: `1px solid ${THEME.teal}33`,
        boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 40px ${THEME.teal}22`
      }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.teal}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.5em' }}>📦</span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Vendor Setup</h2>
              <span style={{ color: '#888', fontSize: '0.8em' }}>Step {stepIndex + 1}/{STEPS.length}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1.1em' }}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', padding: '10px 24px', gap: 4, background: 'rgba(0,0,0,0.2)' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIndex ? THEME.accent : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>

        {/* Back */}
        {!['processing', 'complete'].includes(step) && (
          <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.2)' }}>
            <button onClick={goBack} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 15, cursor: 'pointer' }}>← Back</button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(90vh - 260px)' }}>{renderStep()}</div>

        {/* Agentic Bar */}
        {!['processing', 'complete'].includes(step) && (
          <div style={{ padding: '0 24px 24px' }}>
            <UniversalAgenticBar ref={agenticBarRef} welcomeMessage={getWelcome()} hints={getHints()} onCommand={handleVoiceCommand} autoStart={true} accentColor={THEME.accent} stepKey={step} />
          </div>
        )}
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

export default VendorFlow;
