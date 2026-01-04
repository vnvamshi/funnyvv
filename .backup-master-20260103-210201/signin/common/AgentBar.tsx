// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - AGENTBAR v3.0 (FIXED)
// RULE-004: Full voice UI with navigation controls
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

type Mode = 'interactive' | 'talkative' | 'text';

interface AgentBarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  transcript: string;
  displayText: string;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBack?: () => void;
  onNext?: () => void;
  onClose?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  currentStep?: string;
  stepNumber?: number;
  totalSteps?: number;
  showModes?: boolean;
  showNavButtons?: boolean;
}

const AgentBar: React.FC<AgentBarProps> = ({
  isListening,
  isSpeaking,
  isPaused,
  transcript,
  displayText,
  onStop,
  onPause,
  onResume,
  onBack,
  onNext,
  onClose,
  canGoBack = true,
  canGoNext = false,
  showModes = true,
  showNavButtons = true
}) => {
  const [mode, setMode] = useState<Mode>('interactive');

  const getStatusIcon = () => {
    if (isSpeaking) return '🔊';
    if (isPaused) return '⏸️';
    if (isListening) return '🎤';
    return '💤';
  };

  const getStatusText = () => {
    if (isSpeaking) return 'Speaking...';
    if (isPaused) return 'Paused';
    if (isListening) return 'Listening';
    return 'Idle';
  };

  return (
    <div style={{ 
      padding: '14px 20px', 
      background: 'rgba(0,0,0,0.25)', 
      borderBottom: `1px solid ${THEME.gold}30` 
    }}>
      {/* Top Row: Status + Mode Buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: isListening ? '#4CAF50' : '#888',
            boxShadow: isListening ? '0 0 10px #4CAF50' : 'none',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: THEME.gold, fontWeight: 600, fontSize: '0.95em' }}>MR. V:</span>
          <span style={{ color: '#aaa', fontSize: '0.9em' }}>
            {getStatusIcon()} {getStatusText()}
          </span>
        </div>
        
        {/* Mode Buttons */}
        {showModes && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['interactive', 'talkative', 'text'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: mode === m ? `1px solid ${THEME.gold}` : '1px solid #555',
                  background: mode === m ? 'rgba(184,134,11,0.25)' : 'transparent',
                  color: mode === m ? '#fff' : '#888',
                  cursor: 'pointer',
                  fontSize: '0.75em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {m === 'interactive' && '🎤'}
                {m === 'talkative' && '💬'}
                {m === 'text' && '📝'}
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Teleprompter - What Mr. V is saying */}
      <div style={{ 
        background: 'rgba(0,0,0,0.35)', 
        borderRadius: '12px', 
        padding: '14px 18px',
        minHeight: '50px',
        marginBottom: '10px'
      }}>
        <div style={{ color: '#fff', fontSize: '0.95em', lineHeight: 1.5 }}>
          {displayText || 'Say a command or click an option...'}
        </div>
      </div>

      {/* Transcript - What user said */}
      {transcript && (
        <div style={{ 
          color: '#888', 
          fontSize: '0.85em', 
          marginBottom: '12px',
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px'
        }}>
          💬 You said: "{transcript}"
        </div>
      )}

      {/* Control Buttons Row */}
      {showNavButtons && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Left: Back Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: `1px solid ${THEME.gold}`,
                  color: '#fff',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Back
              </button>
            )}
          </div>

          {/* Center: Pause/Stop */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {isSpeaking && (
              <button
                onClick={onStop}
                style={{
                  padding: '8px 20px',
                  background: '#e74c3c',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                ■ Stop
              </button>
            )}
            {!isSpeaking && onPause && !isPaused && (
              <button
                onClick={onPause}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(255,152,0,0.3)',
                  border: '1px solid #FF9800',
                  color: '#fff',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                ⏸ Pause
              </button>
            )}
            {isPaused && onResume && (
              <button
                onClick={onResume}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(76,175,80,0.3)',
                  border: '1px solid #4CAF50',
                  color: '#fff',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                ▶ Resume
              </button>
            )}
          </div>

          {/* Right: Next / Close */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {canGoNext && onNext && (
              <button
                onClick={onNext}
                style={{
                  padding: '8px 16px',
                  background: THEME.gold,
                  border: 'none',
                  color: '#000',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  fontWeight: 600
                }}
              >
                Next →
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#888',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Voice Hints */}
      <div style={{ 
        textAlign: 'center', 
        color: '#555', 
        fontSize: '0.7em', 
        marginTop: '12px' 
      }}>
        Say: "Hey" to pause • "Back" • "Next" • "Stop" • "Close"
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default AgentBar;
