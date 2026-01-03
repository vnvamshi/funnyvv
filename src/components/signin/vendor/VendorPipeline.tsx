import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
  speak: (text: string) => void;
}

const STEPS = [
  { label: 'Parsing catalog', msg: 'Parsing your catalog... extracting product names and sections.' },
  { label: 'Extracting images', msg: 'Extracting images... organizing them cleanly.' },
  { label: 'Enhancing quality', msg: 'Enhancing image quality... cropping and upscaling.' },
  { label: 'Creating tables', msg: 'Creating product tables... SKU, price, materials, dimensions.' },
  { label: 'Publishing products', msg: 'Vectorizing descriptions... publishing to Product Catalog!' }
];

const VendorPipeline: React.FC<Props> = ({ onComplete, speak }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < STEPS.length) {
      speak(STEPS[currentStep].msg);
      const timer = setTimeout(() => setCurrentStep(s => s + 1), 2500);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [currentStep]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h3 style={{ color: '#B8860B', marginBottom: '30px' }}>🔄 Processing Your Catalog</h3>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', marginBottom: '10px', background: currentStep > i ? 'rgba(0,255,0,0.1)' : currentStep === i ? 'rgba(184,134,11,0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '10px', border: currentStep === i ? '1px solid #B8860B' : '1px solid transparent' }}>
            <span style={{ fontSize: '1.3em' }}>{currentStep > i ? '✅' : currentStep === i ? '⏳' : '⬜'}</span>
            <span style={{ color: currentStep >= i ? '#fff' : '#666', flex: 1, textAlign: 'left' }}>{step.label}</span>
            {currentStep === i && <span style={{ color: '#B8860B', fontSize: '0.85em' }}>Processing...</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorPipeline;
