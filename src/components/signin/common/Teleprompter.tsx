import React from 'react';

interface Props {
  isListening: boolean;
  isPaused: boolean;
  transcript: string;
  displayText: string;
  onResume?: () => void;
  onPause?: () => void;
}

const Teleprompter: React.FC<Props> = ({ isListening, isPaused, transcript, displayText, onResume, onPause }) => {
  const active = isListening && !isPaused;
  
  return (
    <div style={{
      margin: '16px 0',
      padding: '12px 16px',
      background: active ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.1)',
      border: `2px solid ${active ? '#4CAF50' : '#f44336'}`,
      borderRadius: '12px'
    }}>
      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: transcript ? '10px' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: active ? '#4CAF50' : '#f44336',
            animation: active ? 'pulse 1s infinite' : 'none'
          }} />
          <span style={{ color: active ? '#4CAF50' : '#f44336', fontWeight: 600 }}>
            {active ? '🎤 Listening...' : '⏸️ Voice paused'}
          </span>
        </div>
        
        {isPaused && onResume && (
          <button 
            onClick={onResume}
            style={{
              padding: '6px 14px',
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            ▶ Resume
          </button>
        )}
        
        {active && onPause && (
          <button 
            onClick={onPause}
            style={{
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.1)',
              color: '#888',
              border: '1px solid #666',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            ⏸ Pause
          </button>
        )}
      </div>
      
      {/* Transcript */}
      {transcript && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '10px 12px',
          borderRadius: '8px'
        }}>
          <div style={{ color: '#888', fontSize: '0.7em', marginBottom: '4px' }}>HEARD:</div>
          <div style={{ color: '#fff', fontSize: '1.1em' }}>"{transcript}"</div>
        </div>
      )}
      
      {/* Speaking indicator */}
      {displayText && (
        <div style={{ marginTop: '8px', color: '#B8860B', fontSize: '0.85em' }}>
          🔊 {displayText}
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default Teleprompter;
