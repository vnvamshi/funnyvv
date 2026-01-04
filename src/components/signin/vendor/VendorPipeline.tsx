import React, { useState, useEffect } from 'react';
import UnifiedAgenticBar from '../common/UnifiedAgenticBar';

interface Props {
  products: any[];
  onComplete: () => void;
  speak: (t: string) => void;
}

const THEME = { teal: '#004236', gold: '#B8860B' };

const VendorPipeline: React.FC<Props> = ({ products, onComplete, speak }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Processing catalog...');

  useEffect(() => {
    const steps = [
      { p: 20, s: 'Extracting products...' },
      { p: 40, s: 'Analyzing content...' },
      { p: 60, s: 'Generating listings...' },
      { p: 80, s: 'Optimizing for search...' },
      { p: 100, s: 'Complete!' }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].p);
        setStatus(steps[i].s);
        speak(steps[i].s);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleCommand = (cmd: string) => {
    if (cmd.toLowerCase().includes('done') || cmd.toLowerCase().includes('finish')) {
      if (progress === 100) onComplete();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>⚙️</span>
        <h3 style={{ color: THEME.gold, margin: '10px 0 5px' }}>Processing Catalog</h3>
        <p style={{ color: '#888' }}>{status}</p>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${THEME.gold}, #10b981)`,
            transition: 'width 0.5s'
          }} />
        </div>
        <p style={{ color: '#ccc', textAlign: 'center', margin: '15px 0 0' }}>{progress}%</p>
      </div>

      {progress === 100 && (
        <button
          onClick={onComplete}
          style={{
            padding: '14px 40px',
            background: THEME.gold,
            border: 'none',
            borderRadius: '30px',
            color: '#000',
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'center'
          }}
        >
          Complete Setup ✓
        </button>
      )}

      {/* UNIFIED AGENTIC BAR */}
      <UnifiedAgenticBar
        context="Pipeline"
        onCommand={handleCommand}
        speak={speak}
        hints='Say "done" when processing completes'
      />
    </div>
  );
};

export default VendorPipeline;
