/**
 * PipelineStep - Shared processing pipeline step
 */

import React, { useState, useEffect } from 'react';
import { StepProps } from '../BaseFlow';

const THEME = { accent: '#B8860B' };

interface PipelineStepProps extends StepProps {
  entityType?: 'vendor' | 'builder' | 'agent';
}

export const PipelineStep: React.FC<PipelineStepProps> = ({
  data,
  onNext,
  speak,
  isActive,
  entityType = 'vendor'
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    const steps = [
      { p: 20, s: 'Processing uploads...' },
      { p: 40, s: 'Extracting data...' },
      { p: 60, s: 'Analyzing content...' },
      { p: 80, s: 'Generating listings...' },
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
        setComplete(true);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isActive, speak]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>⚙️</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Processing</h3>
        <p style={{ color: '#888' }}>{status}</p>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 24 }}>
        <div style={{ height: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${THEME.accent}, #10b981)`,
            transition: 'width 0.5s'
          }} />
        </div>
        <p style={{ color: '#ccc', textAlign: 'center', margin: '15px 0 0' }}>{progress}%</p>
        
        {data.files?.length > 0 && (
          <p style={{ color: '#64748b', textAlign: 'center', margin: '10px 0 0', fontSize: 13 }}>
            Processing {data.files.length} file{data.files.length > 1 ? 's' : ''}...
          </p>
        )}
      </div>

      {complete && (
        <button
          onClick={onNext}
          style={{
            padding: '14px 40px',
            background: THEME.accent,
            border: 'none',
            borderRadius: 30,
            color: '#000',
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'center'
          }}
        >
          Complete Setup ✓
        </button>
      )}
    </div>
  );
};

export default PipelineStep;
