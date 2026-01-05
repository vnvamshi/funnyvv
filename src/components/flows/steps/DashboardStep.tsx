/**
 * DashboardStep - Shared dashboard step
 */

import React, { useEffect } from 'react';
import { StepProps } from '../BaseFlow';

const THEME = { accent: '#B8860B' };

interface DashboardStepProps extends StepProps {
  entityType?: 'vendor' | 'builder' | 'agent';
}

export const DashboardStep: React.FC<DashboardStepProps> = ({
  data,
  onNext,
  speak,
  isActive,
  entityType = 'vendor'
}) => {
  useEffect(() => {
    if (isActive) {
      speak(`Welcome to your ${entityType} dashboard. Say upload to add files or next to continue.`);
    }
  }, [isActive, entityType]);

  const titles: Record<string, string> = {
    vendor: 'Vendor Dashboard',
    builder: 'Builder Dashboard',
    agent: 'Agent Dashboard'
  };

  const icons: Record<string, string> = {
    vendor: '📊',
    builder: '🏗️',
    agent: '🏠'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>{icons[entityType]}</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>{titles[entityType]}</h3>
        <p style={{ color: '#888', fontSize: '0.9em' }}>
          Profile saved! Ready to continue?
        </p>
      </div>

      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: 12, 
        padding: 24,
        textAlign: 'center'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: THEME.accent }}>
              {data.companyName || 'Not set'}
            </div>
            <div style={{ color: '#888', fontSize: 12 }}>Company</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>✓</div>
            <div style={{ color: '#888', fontSize: 12 }}>Verified</div>
          </div>
        </div>

        <button
          onClick={onNext}
          style={{
            padding: '14px 40px',
            background: THEME.accent,
            border: 'none',
            borderRadius: 30,
            color: '#000',
            fontSize: '1em',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          📄 Upload Files →
        </button>
      </div>
    </div>
  );
};

export default DashboardStep;
