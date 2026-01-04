// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR PIPELINE v2.0
// 5-step processing with live narration
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';

interface VendorPipelineProps {
  fileName?: string;
  onComplete: () => void;
  speak: (text: string) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const PIPELINE_STEPS = [
  { id: 'parse', icon: '📄', label: 'Parsing Catalog', desc: 'Extracting structure, sections, and product data', speech: 'Parsing your catalog. Extracting product titles, specs, and sections.' },
  { id: 'images', icon: '🖼️', label: 'Extracting Images', desc: 'Organizing product images into folders', speech: 'Extracting images. Organizing them into a clean folder structure.' },
  { id: 'enhance', icon: '✨', label: 'Enhancing Quality', desc: 'Smart cropping and upscaling images', speech: 'Enhancing image quality. Smart cropping and upscaling where needed.' },
  { id: 'tables', icon: '📊', label: 'Creating Tables', desc: 'SKU, price, materials, dimensions, warranty', speech: 'Creating product tables. SKU, price, materials, dimensions, warranty fields.' },
  { id: 'publish', icon: '🚀', label: 'Publishing', desc: 'Vectorizing for search & publishing to catalog', speech: 'Vectorizing descriptions for Ask Anything. Publishing your products now!' }
];

const VendorPipeline: React.FC<VendorPipelineProps> = ({ fileName, onComplete, speak }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= PIPELINE_STEPS.length) {
      setCompleted(PIPELINE_STEPS.map((_, i) => i));
      setTimeout(onComplete, 500);
      return;
    }

    // Speak current step
    speak(PIPELINE_STEPS[currentStep].speech);

    // Simulate processing time (2-3 seconds per step)
    const delay = 2000 + Math.random() * 1000;
    const timer = setTimeout(() => {
      setCompleted(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete, speak]);

  const getStepStatus = (index: number) => {
    if (completed.includes(index)) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ fontSize: '3em' }}>🔄</span>
        <h3 style={{ color: THEME.gold, marginTop: '12px', marginBottom: '8px' }}>
          Processing Your Catalog
        </h3>
        {fileName && (
          <p style={{ color: '#888', fontSize: '0.9em' }}>
            📁 {fileName}
          </p>
        )}
      </div>

      {/* Pipeline Steps */}
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {PIPELINE_STEPS.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                marginBottom: '12px',
                background: status === 'active' 
                  ? 'rgba(184,134,11,0.15)' 
                  : status === 'completed' 
                    ? 'rgba(0,255,0,0.08)' 
                    : 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: status === 'active' 
                  ? `2px solid ${THEME.gold}` 
                  : '2px solid transparent',
                transition: 'all 0.3s'
              }}
            >
              {/* Step Number / Status */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: status === 'completed' 
                  ? 'linear-gradient(135deg, #00ff00, #00cc00)' 
                  : status === 'active' 
                    ? THEME.gold 
                    : 'rgba(255,255,255,0.1)',
                fontSize: status === 'completed' ? '1.2em' : '1.4em',
                flexShrink: 0
              }}>
                {status === 'completed' ? '✓' : step.icon}
              </div>

              {/* Step Info */}
              <div style={{ flex: 1 }}>
                <p style={{ 
                  color: status === 'pending' ? '#666' : '#fff', 
                  margin: 0, 
                  fontWeight: 500,
                  fontSize: '1em'
                }}>
                  {step.label}
                </p>
                <p style={{ 
                  color: status === 'pending' ? '#444' : '#888', 
                  margin: '4px 0 0', 
                  fontSize: '0.85em' 
                }}>
                  {step.desc}
                </p>
              </div>

              {/* Status Indicator */}
              <div style={{ flexShrink: 0 }}>
                {status === 'active' && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: `3px solid ${THEME.gold}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {status === 'completed' && (
                  <span style={{ color: '#00ff00', fontSize: '1.2em' }}>✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div style={{ maxWidth: '500px', margin: '24px auto 0' }}>
        <div style={{
          height: '6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${(completed.length / PIPELINE_STEPS.length) * 100}%`,
            background: `linear-gradient(90deg, ${THEME.gold}, ${THEME.goldLight})`,
            borderRadius: '3px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <p style={{ 
          textAlign: 'center', 
          color: '#888', 
          fontSize: '0.85em', 
          marginTop: '8px' 
        }}>
          {completed.length} of {PIPELINE_STEPS.length} steps complete
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VendorPipeline;
