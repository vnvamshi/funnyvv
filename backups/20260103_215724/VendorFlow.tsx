// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR FLOW v12.0 - FIXED DIGIT HANDLER CHAIN
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

interface Props { isOpen: boolean; onClose: () => void; onComplete: () => void; onBack: () => void; }
type Step = 'phone' | 'otp' | 'profile' | 'dashboard' | 'upload' | 'pipeline' | 'complete';

const STEPS: { id: Step; label: string }[] = [
  { id: 'phone', label: 'Phone' }, { id: 'otp', label: 'Verify' }, { id: 'profile', label: 'Profile' },
  { id: 'dashboard', label: 'Dashboard' }, { id: 'upload', label: 'Upload' }, { id: 'pipeline', label: 'Processing' }, { id: 'complete', label: 'Complete' }
];

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorFlow: React.FC<Props> = ({ isOpen, onClose, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [vendorData, setVendorData] = useState({
    phone: '',
    vendorId: '',
    profile: '',
    beautifiedProfile: '',
    companyName: '',
    catalogFile: null as File | null,
    products: [] as any[]
  });

  // CRITICAL: Use a ref that gets updated by child components
  const digitHandlerRef = useRef<((digits: string) => void) | null>(null);
  const navStack = useNavStack({ id: 'vendor:phone', label: 'Phone' });

  // Handle voice digits - passes to current step's handler
  const handleDigits = useCallback((digits: string) => {
    console.log('%c[VendorFlow] ========================================', 'color: green; font-size: 14px');
    console.log('%c[VendorFlow] RECEIVED DIGITS FROM useVoice: ' + digits, 'color: green; font-size: 16px; font-weight: bold');
    console.log('%c[VendorFlow] Current step: ' + step, 'color: green');
    console.log('%c[VendorFlow] Handler exists: ' + (digitHandlerRef.current ? 'YES' : 'NO'), 'color: green');
    
    if (digitHandlerRef.current) {
      console.log('%c[VendorFlow] Calling digitHandlerRef.current()...', 'color: green; font-weight: bold');
      digitHandlerRef.current(digits);
      console.log('%c[VendorFlow] ✅ Handler called successfully', 'color: green; font-weight: bold');
    } else {
      console.log('%c[VendorFlow] ⚠️ NO HANDLER REGISTERED!', 'color: red; font-weight: bold');
    }
    console.log('%c[VendorFlow] ========================================', 'color: green; font-size: 14px');
  }, [step]);

  // Handle voice commands
  const handleCommand = useCallback((cmd: string) => {
    console.log('[VendorFlow] Command:', cmd);
    const c = cmd.toLowerCase();
    
    if (c.includes('stop') || c.includes('quiet')) { voice.stop(); return; }
    if (c.includes('close') || c.includes('exit')) { voice.stop(); onClose(); return; }
    if (c.includes('back')) { goBack(); return; }
    if (c.includes('next')) { goNext(); return; }
    
    if (step === 'phone') {
      if (c.includes('yes') || c.includes('correct') || c.includes('confirm') || c.includes('send')) {
        if (vendorData.phone.length >= 10) {
          goToStep('otp');
          voice.speak("Sending code. Enter 1 2 3 4 5 6 for demo.");
        }
      }
    }
    
    if (step === 'dashboard') {
      if (c.includes('upload') || c.includes('catalog')) {
        goToStep('upload');
        voice.speak("Upload your catalog.");
      }
    }
    
    if (step === 'complete') {
      if (c.includes('view') || c.includes('product')) onComplete();
      if (c.includes('done')) onClose();
    }
  }, [step, vendorData.phone, onClose, onComplete]);

  // Initialize voice with BOTH handlers
  const voice = useVoice({ 
    onCommand: handleCommand, 
    onDigits: handleDigits, 
    autoStart: isOpen 
  });

  const goBack = () => {
    const order: Step[] = ['phone', 'otp', 'profile', 'dashboard', 'upload', 'pipeline'];
    const idx = order.indexOf(step);
    if (idx <= 0) { onBack(); return; }
    const prev = order[idx - 1];
    setStep(prev);
    navStack.pop();
    voice.speak(`Going back to ${STEPS.find(s => s.id === prev)?.label}.`);
  };

  const goNext = () => {
    const order: Step[] = ['phone', 'otp', 'profile', 'dashboard', 'upload', 'pipeline', 'complete'];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) goToStep(order[idx + 1]);
  };

  const goToStep = (newStep: Step) => {
    navStack.push({ id: `vendor:${newStep}`, label: STEPS.find(s => s.id === newStep)?.label || newStep });
    setStep(newStep);
  };

  const saveProfile = async () => {
    voice.speak("Saving profile...");
    try {
      const res = await fetch('http://localhost:1117/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: vendorData.phone,
          profile: vendorData.beautifiedProfile || vendorData.profile,
          companyName: vendorData.companyName
        })
      });
      const data = await res.json();
      setVendorData(d => ({ ...d, vendorId: data.id }));
    } catch (e) {}
    goToStep('dashboard');
    voice.speak("Profile saved! Say upload catalog to continue.");
  };

  // Welcome message
  useEffect(() => {
    if (isOpen && step === 'phone') {
      setTimeout(() => {
        voice.speak("Welcome Vendor! Tell me your phone number, say each digit clearly like seven zero three.");
      }, 500);
    }
  }, [isOpen]);

  // Cleanup
  useEffect(() => {
    if (!isOpen) {
      voice.stop();
      voice.stopListening();
      setStep('phone');
      setVendorData({ phone: '', vendorId: '', profile: '', beautifiedProfile: '', companyName: '', catalogFile: null, products: [] });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stepIndex = STEPS.findIndex(s => s.id === step);
  const canGoBack = step !== 'phone';

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
        flexDirection: 'column'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.6em' }}>📦</span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Vendor Setup</h2>
              <span style={{ color: '#888', fontSize: '0.8em' }}>Step {stepIndex + 1} of {STEPS.length - 1}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.2em'
          }}>✕</button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', padding: '10px 24px', gap: '4px', background: 'rgba(0,0,0,0.2)' }}>
          {STEPS.slice(0, -1).map((s, i) => (
            <div key={s.id} style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: stepIndex >= i ? THEME.gold : 'rgba(255,255,255,0.15)'
            }} />
          ))}
        </div>

        {/* Agent Bar with Debug Log */}
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
          canGoBack={canGoBack}
          showModes={true}
          showNavButtons={true}
        />
        
        {/* Debug Log Display */}
        {voice.debugLog && voice.debugLog.length > 0 && (
          <div style={{
            padding: '8px 24px',
            background: 'rgba(0,0,0,0.5)',
            maxHeight: '80px',
            overflow: 'auto',
            fontSize: '0.7em',
            fontFamily: 'monospace',
            color: '#0f0'
          }}>
            {voice.debugLog.slice(-5).map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}

        {/* Step Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {step === 'phone' && (
            <VendorPhone
              value={vendorData.phone}
              onChange={(phone) => {
                console.log('[VendorFlow] Phone onChange:', phone);
                setVendorData(d => ({ ...d, phone }));
              }}
              onNext={() => {
                goToStep('otp');
                voice.speak(`Sending code to ${speakablePhone(vendorData.phone)}. Enter 1 2 3 4 5 6.`);
              }}
              speak={voice.speak}
              onVoiceDigits={(handler) => {
                console.log('%c[VendorFlow] Phone registering digit handler', 'color: blue; font-weight: bold');
                digitHandlerRef.current = handler;
              }}
            />
          )}

          {step === 'otp' && (
            <VendorOTP
              phone={formatPhoneNumber(vendorData.phone)}
              onVerified={() => {
                goToStep('profile');
                voice.speak("Verified! Tell me about your business.");
              }}
              speak={voice.speak}
              onVoiceDigits={(handler) => {
                console.log('%c[VendorFlow] OTP registering digit handler', 'color: blue; font-weight: bold');
                digitHandlerRef.current = handler;
              }}
            />
          )}

          {step === 'profile' && (
            <VendorProfile
              profile={vendorData.profile}
              beautified={vendorData.beautifiedProfile}
              companyName={vendorData.companyName}
              onChange={(p) => setVendorData(d => ({ ...d, profile: p }))}
              onCompanyChange={(n) => setVendorData(d => ({ ...d, companyName: n }))}
              onBeautify={(b) => setVendorData(d => ({ ...d, beautifiedProfile: b }))}
              onSave={saveProfile}
              speak={voice.speak}
            />
          )}

          {step === 'dashboard' && (
            <VendorDashboard
              vendorName={vendorData.companyName || 'Your Store'}
              onUploadCatalog={() => {
                goToStep('upload');
                voice.speak("Upload your catalog.");
              }}
              speak={voice.speak}
            />
          )}

          {step === 'upload' && (
            <VendorUpload
              onFileSelected={(file) => {
                setVendorData(d => ({ ...d, catalogFile: file }));
                goToStep('pipeline');
                voice.speak(`Processing ${file.name}.`);
              }}
              speak={voice.speak}
            />
          )}

          {step === 'pipeline' && (
            <VendorPipeline
              file={vendorData.catalogFile || undefined}
              fileName={vendorData.catalogFile?.name}
              vendorId={vendorData.vendorId}
              vendorName={vendorData.companyName}
              onComplete={(products) => {
                setVendorData(d => ({ ...d, products }));
                setStep('complete');
              }}
              speak={voice.speak}
              onBrowseHome={() => voice.speak("Feel free to browse.")}
            />
          )}

          {step === 'complete' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 30px rgba(76,175,80,0.4)'
              }}>
                <span style={{ fontSize: '3em', color: '#fff' }}>✓</span>
              </div>
              <h3 style={{ color: THEME.gold, marginBottom: '12px' }}>🎉 You're Live!</h3>
              <p style={{ color: '#aaa', marginBottom: '32px' }}>{vendorData.products?.length || 0} products published</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={onComplete} style={{
                  padding: '14px 32px',
                  background: THEME.gold,
                  color: '#000',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}>📦 View Products</button>
                <button onClick={onClose} style={{
                  padding: '14px 24px',
                  background: 'transparent',
                  color: '#888',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorFlow;
