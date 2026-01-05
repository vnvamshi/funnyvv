// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW VENDOR MODAL - 100% REAL PROCESSING (NO FAKE)
// v8.0 - All uploads go to real backend, real AI, real database
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// PRESERVED IMPORTS - Add your AgentBar/Voice imports here if needed:
// import { useAgentBar } from './AgentBar';
// import UniversalAgenticBar from '../common/UniversalAgenticBar';
// ═══════════════════════════════════════════════════════════════════════════════

const API_BASE = 'http://localhost:1117';

interface VendorModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onComplete?: (data?: any) => void;
}

const STEPS = ['phone', 'otp', 'company', 'description', 'upload', 'processing', 'complete'] as const;
type Step = typeof STEPS[number];

const PROCESSING_STEPS = [
  { id: 1, name: 'Parse Catalog', desc: 'Extracting text from PDF' },
  { id: 2, name: 'Extract Images', desc: 'Pulling product images' },
  { id: 3, name: 'Enhance Images', desc: 'AI analyzing products' },
  { id: 4, name: 'Save to Database', desc: 'Storing in PostgreSQL' },
  { id: 5, name: 'Vectorize & Publish', desc: 'Publishing to catalog' }
];

const THEME = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#B8860B',
  teal: '#00d4aa',
  purple: '#8b5cf6'
};

const VendorModal: React.FC<VendorModalProps> = ({ isOpen = true, onClose, onComplete }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [vendorId, setVendorId] = useState<string>('');
  
  // Processing state
  const [processingStep, setProcessingStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Results
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [extractedProducts, setExtractedProducts] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sseRef = useRef<EventSource | null>(null);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // REAL BACKEND PROCESSING - NO FAKE/SIMULATION
  // ═══════════════════════════════════════════════════════════════════════════
  const startProcessing = async (file: File) => {
    console.log('[REAL] Starting processing:', file.name);
    
    setStep('processing');
    setProcessingStep(0);
    setProcessingProgress(0);
    setProcessingMessage('Uploading to server...');
    setIsConnected(false);

    const sessionId = crypto.randomUUID();
    const formData = new FormData();
    formData.append('catalog', file);
    formData.append('vendorId', vendorId || crypto.randomUUID());
    formData.append('sessionId', sessionId);

    try {
      // REAL POST to backend
      console.log('[REAL] POSTing to', `${API_BASE}/api/vendor/process-catalog`);
      const response = await fetch(`${API_BASE}/api/vendor/process-catalog`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[REAL] Server response:', data);

      if (data.success) {
        setIsConnected(true);
        setProcessingMessage('Connected to server...');

        // REAL SSE connection for progress
        console.log('[REAL] Connecting SSE:', `${API_BASE}/api/sse/progress/${sessionId}`);
        const sse = new EventSource(`${API_BASE}/api/sse/progress/${sessionId}`);
        sseRef.current = sse;

        sse.onmessage = (event) => {
          try {
            const progress = JSON.parse(event.data);
            console.log('[SSE]', progress);

            if (progress.step) setProcessingStep(progress.step);
            if (progress.progress !== undefined) setProcessingProgress(progress.progress);
            if (progress.message) setProcessingMessage(progress.message);

            // Complete
            if (progress.complete || progress.data?.complete) {
              console.log('[REAL] Processing complete!');
              sse.close();
              sseRef.current = null;
              
              const resultData = progress.data || progress;
              setTotalProducts(resultData.totalProducts || 0);
              setTotalImages(resultData.totalImages || 0);
              setExtractedProducts(resultData.products || []);
              
              setTimeout(() => setStep('complete'), 500);
            }
          } catch (e) {
            console.error('[SSE] Parse error:', e);
          }
        };

        sse.onerror = (e) => {
          console.error('[SSE] Error:', e);
          sse.close();
          sseRef.current = null;
        };
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('[REAL] Processing error:', error);
      setProcessingMessage(`Error: ${error.message}. Is backend running on :1117?`);
      
      // Don't fall back to fake - show error
      setTimeout(() => {
        setStep('upload');
      }, 3000);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('[REAL] File selected:', file.name, file.size, 'bytes');
      startProcessing(file);
    }
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
        console.log('[REAL] Vendor saved:', data.id);
      }
    } catch (e) {
      console.error('[REAL] Vendor save error:', e);
    }
  };

  // Navigation
  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      if (step === 'description') {
        saveVendor();
      }
      setStep(STEPS[idx + 1]);
    }
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else onClose();
  };

  const handleViewCatalog = () => {
    window.location.href = '/v3/product-catalog';
    if (onComplete) onComplete({ totalProducts, totalImages });
    onClose();
  };

  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)}-${digits.slice(3)}`;
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  if (!isOpen) return null;

  const stepIndex = STEPS.indexOf(step);

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
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#888' }}>+1</span>
              <input
                type="tel"
                value={formatPhone(phone)}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="000-000-0000"
                style={{
                  padding: '16px 20px', fontSize: '1.5em', fontFamily: 'monospace',
                  background: 'rgba(0,0,0,0.3)', border: `2px solid ${phone.length === 10 ? '#10b981' : THEME.accent}40`,
                  borderRadius: 12, color: '#fff', textAlign: 'center', width: 220
                }}
              />
            </div>
            <button onClick={goNext} disabled={phone.length !== 10} style={{
              padding: '14px 40px',
              background: phone.length === 10 ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center',
              cursor: phone.length === 10 ? 'pointer' : 'not-allowed'
            }}>Next →</button>
          </div>
        );

      case 'otp':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>🔐</span>
              <h3 style={{ color: THEME.accent }}>Verification Code</h3>
              <p style={{ color: THEME.teal, fontSize: '0.85em' }}>Demo: Enter any 6 digits</p>
            </div>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              style={{
                padding: '16px', fontSize: '2em', fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.3)', border: `2px solid ${otp.length === 6 ? '#10b981' : THEME.accent}40`,
                borderRadius: 12, color: '#fff', textAlign: 'center', width: 180, letterSpacing: 8, alignSelf: 'center'
              }}
            />
            <button onClick={goNext} disabled={otp.length !== 6} style={{
              padding: '14px 40px',
              background: otp.length === 6 ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center',
              cursor: otp.length === 6 ? 'pointer' : 'not-allowed'
            }}>Verify →</button>
          </div>
        );

      case 'company':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>🏢</span>
              <h3 style={{ color: THEME.accent }}>Company Name</h3>
            </div>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Your Company Name"
              style={{
                padding: '16px 20px', fontSize: '1.2em',
                background: 'rgba(0,0,0,0.3)', border: `2px solid ${companyName ? '#10b981' : THEME.accent}40`,
                borderRadius: 12, color: '#fff', textAlign: 'center'
              }}
            />
            <button onClick={goNext} disabled={!companyName.trim()} style={{
              padding: '14px 40px',
              background: companyName.trim() ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center',
              cursor: companyName.trim() ? 'pointer' : 'not-allowed'
            }}>Next →</button>
          </div>
        );

      case 'description':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5em' }}>📝</span>
              <h3 style={{ color: THEME.accent }}>What do you sell?</h3>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your products..."
              rows={4}
              style={{
                padding: '16px', fontSize: '1em',
                background: 'rgba(0,0,0,0.3)', border: `2px solid ${description ? '#10b981' : THEME.accent}40`,
                borderRadius: 12, color: '#fff', resize: 'vertical'
              }}
            />
            <button onClick={goNext} disabled={!description.trim()} style={{
              padding: '14px 40px',
              background: description.trim() ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600, alignSelf: 'center',
              cursor: description.trim() ? 'pointer' : 'not-allowed'
            }}>Next →</button>
          </div>
        );

      case 'upload':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>📄</span>
              <h3 style={{ color: THEME.accent }}>Upload Catalog</h3>
              <p style={{ color: '#888', fontSize: '0.85em' }}>PDF will be processed by REAL AI</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.xlsx,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `3px dashed ${THEME.teal}60`, borderRadius: 16, padding: 40,
                textAlign: 'center', cursor: 'pointer', background: 'rgba(0,212,170,0.05)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: 50, marginBottom: 16 }}>📁</div>
              <p style={{ color: THEME.teal, fontWeight: 600 }}>Click to upload PDF</p>
              <p style={{ color: '#666', fontSize: '0.85em' }}>Real processing • No simulation</p>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>⚙️</span>
              <h3 style={{
                background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.purple})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>Processing Catalog</h3>
              {isConnected && (
                <span style={{ color: THEME.teal, fontSize: '0.8em' }}>🔗 Connected to backend</span>
              )}
            </div>
            
            <p style={{ textAlign: 'center', color: THEME.teal, fontStyle: 'italic' }}>{processingMessage}</p>
            
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, height: 12, overflow: 'hidden' }}>
              <div style={{
                width: `${processingProgress}%`, height: '100%',
                background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.purple})`,
                transition: 'width 0.3s'
              }} />
            </div>
            <p style={{ textAlign: 'center', color: '#888' }}>{processingProgress}%</p>
            
            {PROCESSING_STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: processingStep >= s.id ? 'rgba(0,212,170,0.15)' : 'rgba(0,0,0,0.2)',
                borderRadius: 10,
                border: `1px solid ${processingStep === s.id ? THEME.purple : processingStep > s.id ? THEME.teal : 'transparent'}`
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: processingStep > s.id ? '#10b981' : processingStep === s.id ? THEME.purple : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.8em'
                }}>
                  {processingStep > s.id ? '✓' : s.id}
                </div>
                <div>
                  <span style={{ color: processingStep >= s.id ? '#fff' : '#666' }}>{s.name}</span>
                  {processingStep === s.id && (
                    <span style={{ color: '#888', fontSize: '0.8em', marginLeft: 8 }}>{s.desc}</span>
                  )}
                </div>
                {processingStep === s.id && (
                  <div style={{
                    marginLeft: 'auto', width: 16, height: 16,
                    border: `2px solid ${THEME.purple}`, borderTopColor: 'transparent',
                    borderRadius: '50%', animation: 'spin 1s linear infinite'
                  }} />
                )}
              </div>
            ))}
          </div>
        );

      case 'complete':
        return (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <span style={{ fontSize: '4em' }}>🎉</span>
            <h2 style={{
              background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.accent})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              margin: '20px 0 10px'
            }}>Catalog Published!</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, margin: '20px 0' }}>
              <div style={{
                background: 'rgba(0,212,170,0.1)', borderRadius: 12, padding: '14px 24px',
                border: `1px solid ${THEME.teal}44`
              }}>
                <p style={{ color: THEME.teal, fontSize: '2em', margin: 0, fontWeight: 700 }}>{totalProducts}</p>
                <p style={{ color: '#888', margin: 0 }}>Products</p>
              </div>
              <div style={{
                background: 'rgba(139,92,246,0.1)', borderRadius: 12, padding: '14px 24px',
                border: `1px solid ${THEME.purple}44`
              }}>
                <p style={{ color: THEME.purple, fontSize: '2em', margin: 0, fontWeight: 700 }}>{totalImages}</p>
                <p style={{ color: '#888', margin: 0 }}>Images</p>
              </div>
            </div>
            
            {extractedProducts.length > 0 && (
              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 14,
                marginBottom: 16, textAlign: 'left'
              }}>
                <p style={{ color: THEME.teal, marginBottom: 8, fontWeight: 600 }}>📦 Sample Products:</p>
                {extractedProducts.slice(0, 3).map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ color: '#fff' }}>{p.name}</span>
                    <span style={{ color: THEME.accent }}>${p.price}</span>
                  </div>
                ))}
              </div>
            )}
            
            <button onClick={handleViewCatalog} style={{
              padding: '14px 40px',
              background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})`,
              border: 'none', borderRadius: 30, color: '#fff', fontWeight: 600,
              cursor: 'pointer', fontSize: '1em'
            }}>🛍️ View Product Catalog →</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
        borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh',
        overflow: 'hidden', border: `1px solid ${THEME.teal}33`
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', background: 'rgba(0,0,0,0.3)',
          borderBottom: `1px solid ${THEME.teal}22`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.3em' }}>📦</span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1em' }}>Vendor Setup</h2>
              <span style={{ color: '#888', fontSize: '0.75em' }}>Step {stepIndex + 1}/{STEPS.length}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer'
          }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', padding: '8px 20px', gap: 4, background: 'rgba(0,0,0,0.2)' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= stepIndex ? THEME.accent : 'rgba(255,255,255,0.15)'
            }} />
          ))}
        </div>

        {/* Back button */}
        {!['processing', 'complete'].includes(step) && (
          <div style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.2)' }}>
            <button onClick={goBack} style={{
              padding: '5px 12px', background: 'rgba(255,255,255,0.1)',
              border: 'none', color: '#fff', borderRadius: 12, cursor: 'pointer', fontSize: '0.85em'
            }}>← Back</button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: 20, overflow: 'auto', maxHeight: 'calc(90vh - 150px)' }}>
          {renderStep()}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// Export with both names for compatibility
export default VendorModal;
export { VendorModal as VendorOnboardingModal, VendorModal as VendorFlow };
