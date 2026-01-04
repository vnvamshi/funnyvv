import React, { useState, useEffect, useRef } from 'react';
const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };
interface Props { fileName?: string; onComplete: (p: any[]) => void; speak: (t: string) => void; onBrowseHome?: () => void; }
const STEPS = [
  { label: 'Parsing catalog', icon: '📋', duration: 2500, say: "Step 1: Parsing your catalog structure." },
  { label: 'Extracting images', icon: '🖼️', duration: 3000, say: "Step 2: Extracting product images." },
  { label: 'Enhancing quality', icon: '✨', duration: 3500, say: "Step 3: Enhancing image quality with AI." },
  { label: 'Creating database', icon: '📊', duration: 2500, say: "Step 4: Creating product database." },
  { label: 'Publishing', icon: '🚀', duration: 2000, say: "Step 5: Publishing to VistaView catalog." }
];
const VendorPipeline: React.FC<Props> = ({ fileName, onComplete, speak, onBrowseHome }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    speak("Starting 5-step pipeline. I'll narrate each step.");
    let i = 0;
    const run = () => {
      if (!mounted.current) return;
      if (i < STEPS.length) {
        setStep(i + 1);
        speak(STEPS[i].say);
        const start = (i / STEPS.length) * 100, end = ((i + 1) / STEPS.length) * 100, t0 = Date.now();
        const animate = () => {
          if (!mounted.current) return;
          const p = Math.min((Date.now() - t0) / STEPS[i].duration, 1);
          setProgress(start + (end - start) * p);
          if (p < 1) requestAnimationFrame(animate);
          else { i++; setTimeout(run, 800); }
        };
        requestAnimationFrame(animate);
      } else {
        speak("Done! Your products are live.");
        setTimeout(() => mounted.current && onComplete([{ id: '1', name: 'Sample Product', price: 99 }]), 1500);
      }
    };
    setTimeout(run, 1000);
    return () => { mounted.current = false; };
  }, []);
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>⚙️</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Processing</h3>
      {fileName && <p style={{ color: '#888' }}>{fileName}</p>}
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '20px', margin: '20px 0', overflow: 'hidden' }}>
        <div style={{ background: THEME.gold, height: '100%', width: `${progress}%`, transition: 'width 0.1s' }} />
      </div>
      <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
        {STEPS.map((s, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: step === idx + 1 ? 'rgba(184,134,11,0.15)' : 'transparent', borderRadius: '8px', marginBottom: '4px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step > idx + 1 ? '#4CAF50' : step === idx + 1 ? THEME.gold : '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step > idx + 1 ? '✓' : s.icon}</span>
            <span style={{ color: step > idx + 1 ? '#4CAF50' : step === idx + 1 ? '#fff' : '#666' }}>{s.label}</span>
          </div>
        ))}
      </div>
      {step >= 2 && onBrowseHome && <button onClick={onBrowseHome} style={{ marginTop: '20px', padding: '10px 20px', background: 'transparent', border: '1px solid #555', color: '#888', borderRadius: '20px', cursor: 'pointer' }}>🏠 Browse while processing</button>}
    </div>
  );
};
export default VendorPipeline;
