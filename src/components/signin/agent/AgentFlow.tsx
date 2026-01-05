import React, { useState, useRef, useCallback } from 'react';
import UniversalAgenticBar, { AgenticBarRef } from '../common/UniversalAgenticBar';

interface AgentFlowProps {
  onClose: () => void;
  onComplete?: () => void;
}

const STEPS = ['phone', 'otp', 'license', 'company', 'description', 'upload', 'processing', 'complete'] as const;
type Step = typeof STEPS[number];

const THEME = { primary: '#1a1a2e', secondary: '#16213e', accent: '#10b981' };

const STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
  'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
};

const NAV_NEXT = ['next', 'done', 'continue', 'proceed', 'verify', 'save'];
const NAV_BACK = ['back', 'previous', 'go back'];

const AgentFlow: React.FC<AgentFlowProps> = ({ onClose }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [license, setLicense] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const agenticBarRef = useRef<AgenticBarRef>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speak = useCallback((text: string) => agenticBarRef.current?.speak(text), []);

  const typeIntoField = async (ref: React.RefObject<any>, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    for (let i = 0; i <= value.length; i++) {
      await new Promise(r => setTimeout(r, 25));
      setter(value.slice(0, i));
      if (ref.current) ref.current.value = value.slice(0, i);
    }
  };

  const extractDigits = (text: string): string => {
    let result = '';
    for (const word of text.toLowerCase().split(/\s+/)) {
      if (WORD_TO_DIGIT[word]) result += WORD_TO_DIGIT[word];
      else result += word.replace(/\D/g, '');
    }
    return result;
  };

  const isNextCommand = (t: string) => NAV_NEXT.some(k => t.toLowerCase().includes(k));
  const isBackCommand = (t: string) => NAV_BACK.some(k => t.toLowerCase().includes(k));

  const goNext = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      const nextStep = STEPS[idx + 1];
      setStep(nextStep);
      setTimeout(() => {
        if (nextStep === 'otp') speak('Enter the 6-digit code.');
        else if (nextStep === 'license') speak('What is your real estate license number? Say the state name too.');
        else if (nextStep === 'company') speak('What agency or brokerage are you with?');
        else if (nextStep === 'description') speak('What do you specialize in? Luxury homes, first-time buyers?');
        else if (nextStep === 'upload') speak('Upload property listings or photos.');
        else if (nextStep === 'processing') startProcessing();
        else if (nextStep === 'complete') speak('Your agent profile is complete!');
      }, 300);
    }
  }, [step, speak]);

  const goBack = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else onClose();
  }, [step, onClose]);

  const startProcessing = async () => {
    const steps = ['Uploading listings...', 'Analyzing photos...', 'Extracting property details...', 'Creating search vectors...', 'Publishing profile...'];
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i + 1);
      speak(steps[i]);
      await new Promise(r => setTimeout(r, 1800));
    }
    await saveAgent();
    goNext();
  };

  const handleVoiceCommand = useCallback((text: string) => {
    const lower = text.toLowerCase().trim();

    if (isNextCommand(lower)) {
      if (step === 'phone' && phone.length === 10) { speak('Sending code.'); goNext(); }
      else if (step === 'otp' && otp.length === 6) { speak('Verifying.'); goNext(); }
      else if (step === 'license' && license && licenseState) { speak('Got it!'); goNext(); }
      else if (step === 'company' && companyName.trim()) { speak('Got it!'); goNext(); }
      else if (step === 'description' && description.trim()) { speak('Saving.'); goNext(); }
      else if (step === 'upload') { speak('Processing.'); goNext(); }
      else speak('Please complete this field first.');
      return;
    }
    if (isBackCommand(lower)) { speak('Going back.'); goBack(); return; }

    if (step === 'phone') {
      const digits = extractDigits(lower);
      if (digits.length > 0) {
        const newPhone = (phone + digits).slice(0, 10);
        typeIntoField(phoneInputRef, newPhone, setPhone);
        if (newPhone.length === 10) speak('Phone complete! Say next.');
      }
      return;
    }

    if (step === 'otp') {
      const digits = extractDigits(lower);
      if (digits.length > 0) {
        const newOtp = (otp + digits).slice(0, 6);
        typeIntoField(otpInputRef, newOtp, setOtp);
        if (newOtp.length === 6) speak('Code complete! Say verify.');
      }
      return;
    }

    if (step === 'license') {
      // Check for state name
      for (const state of STATES) {
        if (lower.includes(state.toLowerCase())) {
          setLicenseState(state);
          speak(`State set to ${state}.`);
          break;
        }
      }
      // Check for license number
      const digits = extractDigits(lower);
      if (digits.length > 0) {
        const newLicense = (license + digits).slice(0, 12);
        typeIntoField(licenseInputRef, newLicense, setLicense);
      }
      // Also accept alphanumeric
      const alphaNum = text.match(/[A-Za-z0-9]{5,12}/);
      if (alphaNum && !license) {
        typeIntoField(licenseInputRef, alphaNum[0].toUpperCase(), setLicense);
        speak('Got your license number.');
      }
      return;
    }

    if (step === 'company') {
      const cleanedName = text.replace(/^(my agency is|i work at|i'm with|brokerage is|agency is)\s*/i, '').trim();
      if (cleanedName.length > 1) {
        typeIntoField(companyInputRef, cleanedName, setCompanyName);
        speak(`Got it, ${cleanedName}! Say next.`);
      }
      return;
    }

    if (step === 'description') {
      if (lower.includes('beautify') || lower.includes('enhance')) { handleBeautify(); return; }
      const cleanedDesc = text.replace(/^(i specialize in|i focus on|i help with|my specialty is)\s*/i, '').trim();
      if (cleanedDesc.length > 2) {
        const newDesc = description ? `${description} ${cleanedDesc}` : cleanedDesc;
        typeIntoField(descriptionRef, newDesc, setDescription);
        speak('Got it! Say beautify or next.');
      }
      return;
    }

    if (step === 'upload') {
      if (lower.includes('upload') || lower.includes('listing')) { fileInputRef.current?.click(); return; }
      if (lower.includes('skip')) { speak('Skipping.'); goNext(); }
    }
  }, [step, phone, otp, license, licenseState, companyName, description, goNext, goBack, speak]);

  const handleBeautify = async () => {
    if (!description.trim()) { speak('Add a description first.'); return; }
    setIsBeautifying(true);
    speak('Enhancing your agent profile...');
    try {
      const res = await fetch('http://localhost:1117/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, type: 'agent', companyName })
      });
      const data = await res.json();
      if (data.beautified) await typeIntoField(descriptionRef, data.beautified, setDescription);
    } catch {
      const enhanced = `As a licensed real estate professional with ${companyName}, I specialize in ${description}. I provide expert guidance to help clients achieve their property goals.`;
      await typeIntoField(descriptionRef, enhanced, setDescription);
    }
    speak('Enhanced! Say next.');
    setIsBeautifying(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { speak(`Selected ${file.name}. Processing.`); goNext(); }
  };

  const saveAgent = async () => {
    try {
      await fetch('http://localhost:1117/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, license, licenseState, companyName, description })
      });
    } catch (e) {}
  };

  const formatPhone = (p: string) => p.length <= 3 ? p : p.length <= 6 ? `${p.slice(0,3)}-${p.slice(3)}` : `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`;
  const stepIndex = STEPS.indexOf(step);

  const getWelcome = () => {
    switch (step) {
      case 'phone': return 'Welcome agent! Say your phone number.';
      case 'otp': return 'Say the 6-digit code.';
      case 'license': return 'What is your license number and state?';
      case 'company': return 'What agency are you with?';
      case 'description': return 'What do you specialize in?';
      case 'upload': return 'Upload your listings.';
      default: return '';
    }
  };

  const getHints = () => {
    switch (step) {
      case 'phone': return ['seven zero three...', 'next'];
      case 'otp': return ['one two three...', 'verify'];
      case 'license': return ['Texas', 'California', 'next'];
      case 'company': return ['RE/MAX', 'Keller Williams', 'next'];
      case 'description': return ['luxury homes', 'beautify', 'next'];
      case 'upload': return ['upload listings', 'skip'];
      default: return [];
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🏠</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Agent Phone</h3></div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}><span style={{ color: '#888' }}>+1</span><input ref={phoneInputRef} type="tel" value={formatPhone(phone)} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="000-000-0000" style={{ padding: '16px 20px', fontSize: '1.5em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 220 }} /></div>
            <button onClick={goNext} disabled={phone.length !== 10} style={{ padding: '14px 40px', background: phone.length === 10 ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: phone.length === 10 ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: phone.length === 10 ? 'pointer' : 'not-allowed' }}>Send OTP →</button>
          </div>
        );
      case 'otp':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🔐</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Verification</h3></div>
            <input ref={otpInputRef} type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} style={{ padding: '16px 20px', fontSize: '2em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 200, letterSpacing: 10, alignSelf: 'center' }} />
            <button onClick={goNext} disabled={otp.length !== 6} style={{ padding: '14px 40px', background: otp.length === 6 ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: otp.length === 6 ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: otp.length === 6 ? 'pointer' : 'not-allowed' }}>Verify →</button>
          </div>
        );
      case 'license':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🏆</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>License Verification</h3><p style={{ color: '#888', fontSize: '0.9em' }}>Say your license and state name</p></div>
            <input ref={licenseInputRef} type="text" value={license} onChange={e => setLicense(e.target.value)} placeholder="License Number" style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff' }} />
            <select value={licenseState} onChange={e => setLicenseState(e.target.value)} style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: licenseState ? '#fff' : '#888' }}><option value="">Select State</option>{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <button onClick={goNext} disabled={!license || !licenseState} style={{ padding: '14px 40px', background: (license && licenseState) ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: (license && licenseState) ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: (license && licenseState) ? 'pointer' : 'not-allowed' }}>Next →</button>
          </div>
        );
      case 'company':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🏢</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Agency/Brokerage</h3></div>
            <input ref={companyInputRef} type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your Agency" style={{ padding: '16px 20px', fontSize: '1.2em', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center' }} />
            <button onClick={goNext} disabled={!companyName.trim()} style={{ padding: '14px 40px', background: companyName.trim() ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: companyName.trim() ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: companyName.trim() ? 'pointer' : 'not-allowed' }}>Next →</button>
          </div>
        );
      case 'description':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: '2.5em' }}>📝</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Your Specialties</h3></div>
            <textarea ref={descriptionRef} value={description} onChange={e => setDescription(e.target.value)} placeholder="What do you specialize in?" rows={4} style={{ padding: '16px 20px', fontSize: '1em', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={handleBeautify} disabled={isBeautifying || !description.trim()} style={{ padding: '12px 24px', borderRadius: 25, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: !description.trim() ? 0.5 : 1 }}>{isBeautifying ? '⏳' : '✨'} Beautify</button>
              <button onClick={goNext} disabled={!description.trim()} style={{ padding: '12px 24px', background: description.trim() ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 25, color: description.trim() ? '#000' : '#666', fontWeight: 600, cursor: description.trim() ? 'pointer' : 'not-allowed' }}>Next →</button>
            </div>
          </div>
        );
      case 'upload':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>📸</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Upload Listings</h3></div>
            <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.png,.xlsx" onChange={handleFileUpload} style={{ display: 'none' }} />
            <div onClick={() => fileInputRef.current?.click()} style={{ border: `3px dashed ${THEME.accent}60`, borderRadius: 16, padding: 40, textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 50, marginBottom: 16 }}>📁</div>
              <p style={{ color: THEME.accent, fontWeight: 600 }}>Click or say "upload listings"</p>
            </div>
            <button onClick={() => { speak('Skipping.'); goNext(); }} style={{ padding: '12px 24px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', borderRadius: 25, color: '#888', cursor: 'pointer', alignSelf: 'center' }}>Skip →</button>
          </div>
        );
      case 'processing':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>⚙️</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Processing</h3></div>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: processingStep >= i ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: processingStep >= i ? THEME.accent : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: processingStep >= i ? '#000' : '#666', fontWeight: 700 }}>{processingStep > i ? '✓' : i}</div>
                <span style={{ color: processingStep >= i ? '#fff' : '#666' }}>{['Uploading', 'Analyzing', 'Extracting', 'Vectorizing', 'Publishing'][i-1]}</span>
              </div>
            ))}
          </div>
        );
      case 'complete':
        return (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <span style={{ fontSize: '4em' }}>🎉</span>
            <h2 style={{ color: THEME.accent, margin: '20px 0' }}>Agent Profile Complete!</h2>
            <button onClick={onClose} style={{ padding: '14px 40px', background: THEME.accent, border: 'none', borderRadius: 30, color: '#000', fontWeight: 600, cursor: 'pointer' }}>View Listings →</button>
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.accent}40` }}>
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.accent}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: '1.5em' }}>🏠</span><div><h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Agent Setup</h2><span style={{ color: '#888', fontSize: '0.8em' }}>Step {stepIndex + 1}/{STEPS.length}</span></div></div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', padding: '10px 24px', gap: 4, background: 'rgba(0,0,0,0.2)' }}>{STEPS.map((_, i) => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIndex ? THEME.accent : 'rgba(255,255,255,0.15)' }} />))}</div>
        {!['processing', 'complete'].includes(step) && (<div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.2)' }}><button onClick={goBack} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 15, cursor: 'pointer' }}>← Back</button></div>)}
        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(90vh - 260px)' }}>{renderStep()}</div>
        {!['processing', 'complete'].includes(step) && (<div style={{ padding: '0 24px 24px' }}><UniversalAgenticBar ref={agenticBarRef} welcomeMessage={getWelcome()} hints={getHints()} onCommand={handleVoiceCommand} autoStart={true} accentColor={THEME.accent} stepKey={step} /></div>)}
      </div>
    </div>
  );
};

export default AgentFlow;
