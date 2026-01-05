// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - WALKING CURSOR COMPONENT
// Animated cursor that walks to targets in modals
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';

interface WalkingCursorProps {
  isWalking: boolean;
  targetName?: string;
  position: { x: number; y: number };
}

const WalkingCursor: React.FC<WalkingCursorProps> = ({ isWalking, targetName, position }) => {
  if (!isWalking) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'left 0.8s ease-out, top 0.8s ease-out',
      }}
    >
      {/* Cursor pointer */}
      <div style={{
        fontSize: '2em',
        animation: 'walk 0.3s ease-in-out infinite alternate',
      }}>
        🚶
      </div>
      
      {/* Target label */}
      {targetName && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(184, 134, 11, 0.9)',
          color: '#000',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75em',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          marginTop: '8px',
        }}>
          Walking to {targetName}...
        </div>
      )}

      {/* Ripple effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '2px solid #B8860B',
        animation: 'ripple 1s ease-out infinite',
        opacity: 0.6,
      }} />

      <style>{`
        @keyframes walk {
          0% { transform: translateY(0) rotate(-5deg); }
          100% { transform: translateY(-5px) rotate(5deg); }
        }
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WalkingCursor;
