// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - AGENT BAR (Teleprompter + Controls)
// Must appear on EVERY modal/page/subpage
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';

interface AgentBarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused?: boolean;
  transcript: string;
  displayText: string;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  mode?: 'interactive' | 'talkative' | 'text';
}

const AgentBar: React.FC<AgentBarProps> = ({
  isListening,
  isSpeaking,
  isPaused = false,
  transcript,
  displayText,
  onStop,
  onPause,
  onResume,
  mode = 'interactive'
}) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #004236, #002920)',
      borderBottom: '1px solid rgba(184,134,11,0.3)',
      padding: '12px 20px'
    }}>
      {/* Mr. V Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isPaused ? '#FFD700' : isListening ? '#00ff00' : '#666',
            animation: isListening && !isPaused ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: '#B8860B', fontWeight: 600 }}>MR. V:</span>
          <span style={{ color: '#888', fontSize: '0.85em' }}>
            {isPaused ? '⏸️ Waiting for you...' : isListening ? '🎤 Listening' : 'Paused'}
          </span>
        </div>
        
        {/* Mode Badges */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['interactive', 'talkative', 'text'].map(m => (
            <span key={m} style={{
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '0.75em',
              background: mode === m ? '#B8860B' : 'rgba(255,255,255,0.1)',
              color: mode === m ? '#000' : '#888',
              textTransform: 'capitalize'
            }}>{m === 'interactive' ? '🎤 Interactive' : m === 'talkative' ? '💬 Talkative' : '📝 Text'}</span>
          ))}
        </div>
      </div>

      {/* Teleprompter */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        minHeight: '50px'
      }}>
        <p style={{
          color: isSpeaking ? '#F5EC9B' : '#aaa',
          margin: 0,
          lineHeight: 1.6,
          fontSize: '0.95em'
        }}>
          {isSpeaking ? displayText : transcript ? `💬 "${transcript}"` : 'Say a command or click an option...'}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
        {isSpeaking && (
          <button onClick={onStop} style={{
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ⏹ Stop
          </button>
        )}
        {onPause && !isPaused && (
          <button onClick={onPause} style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid #B8860B',
            padding: '8px 20px',
            borderRadius: '20px',
            cursor: 'pointer'
          }}>
            ⏸️ Pause
          </button>
        )}
        {onResume && isPaused && (
          <button onClick={onResume} style={{
            background: '#B8860B',
            color: '#000',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '20px',
            cursor: 'pointer'
          }}>
            ▶️ Resume
          </button>
        )}
      </div>

      {/* Voice Hints */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <span style={{ color: '#666', fontSize: '0.75em' }}>
          Say "Hey" to pause • "About us" • "Real estate" • "Sign in" • "Go back"
        </span>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
};

export default AgentBar;
