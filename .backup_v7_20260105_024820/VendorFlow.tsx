import React, { useState, useRef, useCallback, useEffect } from 'react';
import UniversalAgenticBar, { AgenticBarRef } from '../common/UniversalAgenticBar';

interface VendorFlowProps {
  onClose: () => void;
  onComplete?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKEND API BASE URL - CHANGE THIS IF YOUR BACKEND IS ON DIFFERENT PORT
// ═══════════════════════════════════════════════════════════════════════════════
const API_BASE = 'http://localhost:1117';

const STEPS = ['phone', 'otp', 'company', 'description', 'upload', 'processing', 'complete'] as const;
type Step = typeof STEPS[number];

const THEME = { primary: '#1a1a2e', secondary: '#16213e', accent: '#B8860B', teal: '#00d4aa', purple: '#8b5cf6' };

const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0', 'one': '1', 'won': '1', 'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3', 'four': '4', 'for': '4', 'five': '5', 'six': '6', 'seven': '7',
  'eight': '8', 'ate': '8', 'nine': '9', 'niner': '9',
};

const NAV_NEXT = ['next', 'done', 'continue', 'proceed', 'move on', 'go ahead', 'verify', 'send', 'save', 'submit', 'confirm'];
const NAV_BACK = ['back', 'previous', 'go back', 'return'];

// Processing step names - THE 5 STEP PIPELINE
const PROCESSING_STEP_NAMES = [
  'Parse Catalog',
  'Extract Images', 
  'Enhance Images',
  'Save to Database',
  'Vectorize & Publish'
];

const VendorFlow: React.FC<VendorFlowProps> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [extractedProducts, setExtractedProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [vendorId, setVendorId] = useState<string>('');
  const [isRealProcessing, setIsRealProcessing] = useState(false);

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
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word === 'double' && i + 1 < words.length) {
        const next = WORD_TO_DIGIT[words[i + 1]] || words[i + 1].replace(/\D/g, '');
        if (next.length === 1) { result += next + next; i++; continue; }
      }
      if (word === 'triple' && i + 1 < words.length) {
        const next = WORD_TO_DIGIT[words[i + 1]] || words[i + 1].replace(/\D/g, '');
        if (next.length === 1) { result += next + next + next; i++; continue; }
      }
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
            pointTo('otp-input');
            break;
          case 'company':
            speak('What is your company name?');
            pointTo('company-input');
            break;
          case 'description':
            speak('Tell me what products you sell. Say beautify when done to enhance it.');
            pointTo('description-input');
            break;
          case 'upload':
            speak('Now lets upload your product catalog. Say upload PDF or click the upload area.');
            pointTo('upload-area');
            break;
          case 'complete':
            speak('Congratulations! Your vendor profile is complete and products are published!');
            break;
        }
      }, 300);
    }
  }, [step, speak, pointTo]);

  const goBack = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else onClose();
  }, [step, onClose]);

  // ═══════════════════════════════════════════════════════════════════════════
  // REAL FILE UPLOAD TO BACKEND
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('[VendorFlow] File selected:', file.name, file.size, 'bytes');
    speak(`Great! Processing ${file.name} with our 5-step pipeline!`);
    setUploadedFiles([{ file, category: 'catalog' }]);
    
    // Reset processing state
    setProcessingStep(0);
    setProcessingProgress(0);
    setProcessingMessage('Starting upload...');
    setIsRealProcessing(false);
    
    // Move to processing step
    setStep('processing');
    
    // Generate session ID for SSE tracking
    const sessionId = crypto.randomUUID();
    
    // Create form data
    const formData = new FormData();
    formData.append('catalog', file);
    formData.append('vendorId', vendorId || '1');
    formData.append('sessionId', sessionId);
    
    try {
      console.log('[VendorFlow] Sending to backend:', `${API_BASE}/api/vendor/process-catalog`);
      
      const response = await fetch(`${API_BASE}/api/vendor/process-catalog`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('[VendorFlow] Backend response:', data);
      
      if (data.success) {
        setIsRealProcessing(true);
        speak(data.message || 'Backend received your catalog!');
        
        // Connect to SSE for real-time progress
        connectToSSE(sessionId);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('[VendorFlow] Backend error:', error.message);
      speak('Backend not available, using demo mode...');
      
      // Fallback to simulated processing
      startSimulatedProcessing();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SSE CONNECTION FOR REAL-TIME PROGRESS
  // ═══════════════════════════════════════════════════════════════════════════
  const connectToSSE = (sessionId: string) => {
    console.log('[VendorFlow] Connecting to SSE:', sessionId);
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const sseUrl = `${API_BASE}/api/sse/progress/${sessionId}`;
    console.log('[VendorFlow] SSE URL:', sseUrl);
    
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      console.log('[SSE] Connection opened');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Progress update:', data);
        handleSSEProgress(data);
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      eventSource.close();
      
      // If we haven't completed yet, fall back to simulation
      if (processingProgress < 100) {
        console.log('[VendorFlow] SSE failed, falling back to simulation');
        startSimulatedProcessing();
      }
    };
  };

  const handleSSEProgress = (data: any) => {
    // Handle connected message
    if (data.connected) {
      setProcessingMessage('Connected to processing server...');
      return;
    }
    
    // Update step number
    if (data.step !== undefined) {
      setProcessingStep(data.step);
    }
    
    // Update progress percentage
    if (data.progress !== undefined) {
      setProcessingProgress(data.progress);
    }
    
    // Update message and speak it
    if (data.message) {
      setProcessingMessage(data.message);
      speak(data.message);
    }
    
    // Check for completion
    if (data.complete || data.progress >= 100 || (data.data && data.data.complete)) {
      const finalData = data.data || data;
      
      setTotalProducts(finalData.totalProducts || finalData.productCount || 12);
      setTotalImages(finalData.totalImages || finalData.imageCount || 24);
      
      // Close SSE
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Fetch actual products from backend
      fetchProducts();
      
      // Move to complete step
      setTimeout(() => {
        setStep('complete');
        speak('All done! Your products are now live on VistaView!');
      }, 1500);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH PRODUCTS FROM BACKEND
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      const products = await response.json();
      
      if (Array.isArray(products) && products.length > 0) {
        // Get last 5 products
        const recentProducts = products.slice(-5).map((p: any) => ({
          name: p.name,
          price: p.price
        }));
        setExtractedProducts(recentProducts);
      }
    } catch (e) {
      console.log('[VendorFlow] Could not fetch products');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SIMULATED PROCESSING (Fallback when backend unavailable)
  // ═══════════════════════════════════════════════════════════════════════════
  const startSimulatedProcessing = async () => {
    console.log('[VendorFlow] Starting simulated processing');
    
    const steps = [
      { step: 1, msg: 'Parsing your catalog... found product data! 📖', delay: 2000, progress: 20 },
      { step: 2, msg: 'Extracting images from PDF pages! 📸', delay: 2500, progress: 40 },
      { step: 3, msg: 'Enhancing images for web display! ✨', delay: 2000, progress: 60 },
      { step: 4, msg: 'Saving products to database! 💾', delay: 2500, progress: 80 },
      { step: 5, msg: 'Vectorizing and publishing to catalog! 🚀', delay: 2000, progress: 100 }
    ];

    for (const stepData of steps) {
      setProcessingStep(stepData.step);
      setProcessingMessage(stepData.msg);
      speak(stepData.msg);
      
      // Animate progress
      const startProgress = stepData.step === 1 ? 0 : steps[stepData.step - 2].progress;
      for (let p = startProgress; p <= stepData.progress; p += 2) {
        setProcessingProgress(p);
        await new Promise(r => setTimeout(r, stepData.delay / 10));
      }
    }

    // Set demo results
    setTotalProducts(12);
    setTotalImages(24);
    setExtractedProducts([
      { name: 'Modern Oak Dining Table', price: 899.99 },
      { name: 'Velvet Accent Chair', price: 349.99 },
      { name: 'Ceramic Table Lamp', price: 129.99 },
      { name: 'Wool Area Rug 8x10', price: 599.99 },
    ]);

    // Move to complete
    setTimeout(() => {
      setStep('complete');
      speak('Demo complete! Check your Product Catalog page.');
    }, 500);
  };

  // Voice command handler
  const handleVoiceCommand = useCallback((text: string) => {
    const lower = text.toLowerCase().trim();
    console.log(`🎤 [${step}]`, lower);

    if (isNextCommand(lower)) {
      if (step === 'phone' && phone.length === 10) { speak('Sending verification code.'); goNext(); }
      else if (step === 'otp' && otp.length === 6) { speak('Verifying.'); goNext(); }
      else if (step === 'company' && companyName.trim()) { saveVendor(); speak('Got it!'); goNext(); }
      else if (step === 'description' && description.trim()) { speak('Saving your description.'); goNext(); }
      else if (step === 'upload') { speak('Processing your catalog.'); }
      else speak('Please complete this field first.');
      return;
    }

    if (isBackCommand(lower)) { speak('Going back.'); goBack(); return; }

    if (step === 'phone') {
      const digits = extractDigits(lower);
      if (digits.length > 0) {
        const newPhone = (phone + digits).slice(0, 10);
        typeIntoField(phoneInputRef, newPhone, setPhone);
        if (newPhone.length === 10) speak('Phone complete! Say next to continue.');
      }
      return;
    }

    if (step === 'otp') {
      const digits = extractDigits(lower);
      if (digits.length > 0) {
        const newOtp = (otp + digits).slice(0, 6);
        typeIntoField(otpInputRef, newOtp, setOtp);
        if (newOtp.length === 6) speak('Code complete! Say verify to continue.');
      }
      return;
    }

    if (step === 'company') {
      const cleanedName = text
        .replace(/^(my company is|company name is|we are|i'm from|this is|it's called|called)\s*/i, '')
        .replace(/\s+(inc|llc|corp|company|co)\.?$/i, ' $1')
        .trim();
      
      if (cleanedName.length > 1) {
        typeIntoField(companyInputRef, cleanedName, setCompanyName);
        speak(`Got it, ${cleanedName}! Say next when ready.`);
      }
      return;
    }

    if (step === 'description') {
      if (lower.includes('beautify') || lower.includes('enhance') || lower.includes('improve')) {
        handleBeautify();
        return;
      }
      if (lower.includes('clear') || lower.includes('reset')) {
        setDescription('');
        if (descriptionRef.current) descriptionRef.current.value = '';
        speak('Cleared. Tell me about your products.');
        return;
      }
      const cleanedDesc = text
        .replace(/^(we sell|we offer|we make|we provide|we specialize in|we deal in|our products are|products include)\s*/i, '')
        .trim();
      
      if (cleanedDesc.length > 2) {
        const newDesc = description ? `${description} ${cleanedDesc}` : cleanedDesc;
        typeIntoField(descriptionRef, newDesc, setDescription);
        speak('Got it! Say beautify to enhance, or next to continue.');
      }
      return;
    }

    if (step === 'upload') {
      if (lower.includes('upload') || lower.includes('pdf') || lower.includes('catalog') || lower.includes('open')) {
        speak('Opening file selector.');
        fileInputRef.current?.click();
        return;
      }
      if (lower.includes('skip')) {
        speak('Skipping upload.');
        goNext();
        return;
      }
    }

    if (step === 'complete') {
      if (lower.includes('view') || lower.includes('catalog') || lower.includes('products')) {
        handleViewCatalog();
        return;
      }
    }
  }, [step, phone, otp, companyName, description, goNext, goBack, speak]);

  // Beautify description
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
        speak('Beautiful! Here is your enhanced description. Say next when ready.');
      }
    } catch {
      const enhanced = `${companyName || 'We'} offer premium ${description}. Our products feature exceptional quality, competitive pricing, and outstanding customer service.`;
      await typeIntoField(descriptionRef, enhanced, setDescription);
      speak('Enhanced! Say next to continue.');
    }
    setIsBeautifying(false);
  };

  // Save vendor to backend
  const saveVendor = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, companyName, description })
      });
      const data = await res.json();
      if (data.id) {
        setVendorId(data.id);
        console.log('[VendorFlow] Vendor saved with ID:', data.id);
      }
    } catch (e) { 
      console.error('[VendorFlow] Error saving vendor:', e); 
    }
  };

  // Navigate to product catalog
  const handleViewCatalog = () => {
    speak('Taking you to your product catalog!');
    
    // Dispatch event for navigation
    window.dispatchEvent(new CustomEvent('navigateToCatalog', { 
      detail: { 
        products: extractedProducts,
        totalProducts: totalProducts,
        totalImages: totalImages
      }
    }));
    
    // Navigate to catalog page
    window.location.href = '/v3/product-catalog';
    
    if (onComplete) onComplete();
    onClose();
  };

  const formatPhone = (p: string) => {
    if (p.length <= 3) return p;
    if (p.length <= 6) return `${p.slice(0,3)}-${p.slice(3)}`;
    return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`;
  };

  const stepIndex = STEPS.indexOf(step);

  const getWelcome = () => {
    switch (step) {
      case 'phone': return 'Welcome vendor! Say your phone number digit by digit.';
      case 'otp': return 'Say the 6-digit code.';
      case 'company': return 'What is your company name?';
      case 'description': return 'What products do you sell? Say beautify when done.';
      case 'upload': return 'Say upload PDF to select your catalog.';
      default: return '';
    }
  };

  const getHints = () => {
    switch (step) {
      case 'phone': return ['seven zero three...', 'next'];
      case 'otp': return ['one two three...', 'verify'];
      case 'company': return ['ABC Materials', 'next'];
      case 'description': return ['flooring and tiles', 'beautify', 'next'];
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
              <span style={{ fontSize: '3em' }}>📦</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>Vendor Phone</h3>
              <p style={{ color: '#888', fontSize: '0.9em' }}>Say: "seven zero three..."</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#888' }}>+1</span>
              <input id="phone-input" ref={phoneInputRef} type="tel" value={formatPhone(phone)} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="000-000-0000" style={{ padding: '16px 20px', fontSize: '1.5em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${phone.length === 10 ? '#10b981' : THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 220 }} />
            </div>
            <button onClick={goNext} disabled={phone.length !== 10} style={{ padding: '14px 40px', background: phone.length === 10 ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center', cursor: phone.length === 10 ? 'pointer' : 'not-allowed' }}>Send OTP →</button>
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
            <input id="otp-input" ref={otpInputRef} type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} style={{ padding: '16px 20px', fontSize: '2em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${otp.length === 6 ? '#10b981' : THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 200, letterSpacing: 10, alignSelf: 'center' }} />
            <button onClick={goNext} disabled={otp.length !== 6} style={{ padding: '14px 40px', background: otp.length === 6 ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center', cursor: otp.length === 6 ? 'pointer' : 'not-allowed' }}>Verify →</button>
          </div>
        );

      case 'company':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>🏢</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>Company Name</h3>
            </div>
            <input id="company-input" ref={companyInputRef} type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your Company Name" style={{ padding: '16px 20px', fontSize: '1.2em', background: 'rgba(0,0,0,0.3)', border: `2px solid ${companyName ? '#10b981' : THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center' }} />
            <button onClick={() => { saveVendor(); goNext(); }} disabled={!companyName.trim()} style={{ padding: '14px 40px', background: companyName.trim() ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center', cursor: companyName.trim() ? 'pointer' : 'not-allowed' }}>Next →</button>
          </div>
        );

      case 'description':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5em' }}>📝</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>What do you sell?</h3>
            </div>
            <textarea id="description-input" ref={descriptionRef} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your products..." rows={4} style={{ padding: '16px 20px', fontSize: '1em', background: 'rgba(0,0,0,0.3)', border: `2px solid ${description ? '#10b981' : THEME.accent}40`, borderRadius: 12, color: '#fff', resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={handleBeautify} disabled={isBeautifying || !description.trim()} style={{ padding: '12px 24px', borderRadius: 25, border: 'none', background: `linear-gradient(135deg, ${THEME.purple}, ${THEME.teal})`, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: !description.trim() ? 0.5 : 1 }}>
                {isBeautifying ? '⏳' : '✨'} Beautify
              </button>
              <button onClick={goNext} disabled={!description.trim()} style={{ padding: '12px 24px', background: description.trim() ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 25, color: '#fff', fontWeight: 600, cursor: description.trim() ? 'pointer' : 'not-allowed' }}>Next →</button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>📄</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0' }}>Upload Catalog</h3>
            </div>
            <input type="file" ref={fileInputRef} accept=".pdf,.xlsx,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            <div id="upload-area" onClick={() => fileInputRef.current?.click()} style={{ border: `3px dashed ${THEME.teal}60`, borderRadius: 16, padding: 40, textAlign: 'center', cursor: 'pointer', background: 'rgba(0,212,170,0.05)', transition: 'all 0.3s' }}>
              <div style={{ fontSize: 50, marginBottom: 16 }}>📁</div>
              <p style={{ color: THEME.teal, fontWeight: 600 }}>Click or say "upload PDF"</p>
              <p style={{ color: '#666', fontSize: '0.85em' }}>Supports PDF, Excel, CSV</p>
            </div>
            <button onClick={() => { speak('Skipping upload.'); goNext(); }} style={{ padding: '12px 24px', border: `1px solid ${THEME.teal}40`, background: 'transparent', borderRadius: 25, color: '#888', cursor: 'pointer', alignSelf: 'center' }}>Skip for now →</button>
          </div>
        );

      // ═══════════════════════════════════════════════════════════════════════
      // PROCESSING STEP - THE 5-STEP PIPELINE
      // ═══════════════════════════════════════════════════════════════════════
      case 'processing':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>⚙️</span>
              <h3 style={{ background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '10px 0' }}>Processing Catalog</h3>
              {isRealProcessing && <span style={{ color: THEME.teal, fontSize: '0.8em' }}>🔗 Connected to backend</span>}
            </div>
            
            {/* Progress message */}
            {processingMessage && (
              <p style={{ textAlign: 'center', color: THEME.teal, fontStyle: 'italic', margin: 0 }}>
                "{processingMessage}"
              </p>
            )}
            
            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, height: 12, overflow: 'hidden' }}>
              <div style={{ width: `${processingProgress}%`, height: '100%', background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.purple})`, transition: 'width 0.3s', borderRadius: 10 }} />
            </div>
            <p style={{ textAlign: 'center', color: '#888', margin: 0 }}>{processingProgress}% Complete</p>
            
            {/* 5 Step indicators */}
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
                background: processingStep >= i ? 'rgba(0,212,170,0.15)' : 'rgba(0,0,0,0.2)', 
                borderRadius: 12, 
                border: `1px solid ${processingStep === i ? THEME.purple : processingStep > i ? THEME.teal : 'transparent'}`,
                transition: 'all 0.3s'
              }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  background: processingStep > i ? '#10b981' : processingStep === i ? THEME.purple : 'rgba(255,255,255,0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: processingStep >= i ? '#fff' : '#666', 
                  fontWeight: 700 
                }}>
                  {processingStep > i ? '✓' : processingStep === i ? '⏳' : i}
                </div>
                <span style={{ color: processingStep >= i ? '#fff' : '#666', flex: 1 }}>
                  {PROCESSING_STEP_NAMES[i - 1]}
                </span>
                {processingStep === i && (
                  <div style={{ width: 18, height: 18, border: `2px solid ${THEME.purple}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
            <h2 style={{ background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '20px 0 10px' }}>
              Catalog Published!
            </h2>
            
            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '24px 0' }}>
              <div style={{ background: `rgba(0,212,170,0.1)`, borderRadius: 12, padding: '16px 28px', border: `1px solid ${THEME.teal}44` }}>
                <p style={{ color: THEME.teal, fontSize: '2em', margin: 0, fontWeight: 700 }}>{totalProducts}</p>
                <p style={{ color: '#888', margin: 0 }}>Products</p>
              </div>
              <div style={{ background: `rgba(139,92,246,0.1)`, borderRadius: 12, padding: '16px 28px', border: `1px solid ${THEME.purple}44` }}>
                <p style={{ color: THEME.purple, fontSize: '2em', margin: 0, fontWeight: 700 }}>{totalImages}</p>
                <p style={{ color: '#888', margin: 0 }}>Images</p>
              </div>
            </div>
            
            {/* Sample products */}
            {extractedProducts.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
                <p style={{ color: THEME.teal, marginBottom: 10, fontWeight: 600 }}>📦 Sample Products:</p>
                {extractedProducts.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ color: '#fff' }}>{p.name}</span>
                    <span style={{ color: THEME.accent }}>${p.price}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* View Catalog button */}
            <button onClick={handleViewCatalog} style={{ padding: '16px 48px', background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})`, border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1.1em', boxShadow: `0 4px 20px ${THEME.teal}40` }}>
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
      <div style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'hidden', border: `1px solid ${THEME.teal}33`, boxShadow: `0 25px 80px rgba(0,0,0,0.5)` }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.teal}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.5em' }}>📦</span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Vendor Setup</h2>
              <span style={{ color: '#888', fontSize: '0.8em' }}>Step {stepIndex + 1}/{STEPS.length}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', padding: '10px 24px', gap: 4, background: 'rgba(0,0,0,0.2)' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIndex ? THEME.accent : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>

        {/* Back button */}
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
      
      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VendorFlow;
