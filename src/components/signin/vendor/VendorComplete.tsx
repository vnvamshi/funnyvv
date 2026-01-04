// VendorComplete.tsx - Onboarding Complete with AgenticBar
import React, { useEffect, useCallback } from 'react';
import AgenticBar, { speak, onCommand } from '../../../agentic';

interface Props {
  vendorName: string;
  stats: { totalProducts: number } | null;
  onViewStore: () => void;
  onClose: () => void;
}

const VendorComplete: React.FC<Props> = ({ vendorName, stats, onViewStore, onClose }) => {
  
  const handleCommand = useCallback((cmd: string) => {
    if (cmd.includes('view') || cmd.includes('store') || cmd.includes('products') || cmd.includes('see')) {
      speak('Opening your store.', () => onViewStore());
    }
    if (cmd.includes('close') || cmd.includes('done') || cmd.includes('finish')) {
      speak('Congratulations on joining VistaView!', () => onClose());
    }
  }, [onViewStore, onClose]);

  useEffect(() => {
    return onCommand(handleCommand);
  }, [handleCommand]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '5em', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ color: '#4CAF50', margin: '16px 0', fontSize: '1.8em' }}>
        Welcome to VistaView!
      </h2>
      <p style={{ color: '#B8860B', fontSize: '1.2em', marginBottom: '8px' }}>
        {vendorName}
      </p>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        Your vendor account is now active
      </p>

      {stats && stats.totalProducts > 0 && (
        <div style={{
          background: 'rgba(76,175,80,0.15)',
          border: '1px solid #4CAF50',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          maxWidth: '300px',
          margin: '0 auto 24px'
        }}>
          <div style={{ fontSize: '3em', fontWeight: 700, color: '#4CAF50' }}>
            {stats.totalProducts}
          </div>
          <div style={{ color: '#888' }}>Products Published</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => speak('Opening your store.', () => onViewStore())}
          style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #B8860B, #DAA520)',
            color: '#000',
            border: 'none',
            borderRadius: '28px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1.1em'
          }}
        >
          🏪 View My Store
        </button>
        <button
          onClick={() => speak('Closing.', () => onClose())}
          style={{
            padding: '16px 32px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '28px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Done
        </button>
      </div>

      <AgenticBar
        context="Setup Complete"
        hints={['"view store" to see products', '"done" to close']}
        welcomeMessage={`Congratulations ${vendorName}! Your vendor account is now live on VistaView with ${stats?.totalProducts || 0} products. Say view store to see your products, or done to close.`}
        autoStart={true}
      />
    </div>
  );
};

export default VendorComplete;
