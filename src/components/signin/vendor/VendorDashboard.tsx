import React from 'react';
import UnifiedAgenticBar from '../common/UnifiedAgenticBar';

interface Props {
  onUpload: () => void;
  speak: (t: string) => void;
}

const THEME = { teal: '#004236', gold: '#B8860B' };

const VendorDashboard: React.FC<Props> = ({ onUpload, speak }) => {
  const handleCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('upload') || lower.includes('catalog') || lower.includes('next')) {
      onUpload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>📊</span>
        <h3 style={{ color: THEME.gold, margin: '10px 0 5px' }}>Welcome to Your Dashboard</h3>
        <p style={{ color: '#888', fontSize: '0.9em' }}>Your profile is saved. Ready to upload catalog?</p>
      </div>

      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '12px', 
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#ccc', margin: '0 0 20px' }}>
          Next step: Upload your product catalog to create listings
        </p>
        <button
          onClick={onUpload}
          style={{
            padding: '14px 40px',
            background: THEME.gold,
            border: 'none',
            borderRadius: '30px',
            color: '#000',
            fontSize: '1em',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          📄 Upload Catalog →
        </button>
      </div>

      {/* UNIFIED AGENTIC BAR */}
      <UnifiedAgenticBar
        context="Dashboard"
        onCommand={handleCommand}
        speak={speak}
        hints='Say "upload catalog" to continue'
      />
    </div>
  );
};

export default VendorDashboard;
