// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - AGENT BAR v2.0 (UNIFIED)
// Must appear on EVERY modal/page/subpage
// Features: Teleprompter, Modes, Back/Close/Stop, Voice Hints, Status
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';

type AgentMode = 'interactive' | 'talkative' | 'text';

interface AgentBarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused?: boolean;
  transcript: string;
  displayText: string;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  canGoBack?: boolean;
  showModes?: boolean;
  showNavButtons?: boolean;
  currentStep?: string;
  totalSteps?: number;
  stepNumber?: number;
}

const THEME = {
  teal: '#004236',
  tealDark: '#002920',
  gold: '#B8860B',
  goldLight: '#F5EC9B'
};

const AgentBar: React.FC<AgentBarProps> = ({
  isListening,
  isSpeaking,
  isPaused = false,
  transcript,
  displayText,
  onStop,
  onPause,
  onResume,
  onBack,
  onClose,
  canGoBack = true,
  showModes = true,
  showNavButtons = true,
  currentStep,
  totalSteps,
  stepNumber
}) => {
  const [mode, setMode] = useState<AgentMode>('interactive');

  // Get status text
  const getStatusText = () => {
    if (isPaused) return '⏸️ Waiting for you...';
    if (isSpeaking) return '🔊 Speaking...';
    if (isListening) return '🎤 Listening...';
    return '💤 Idle';
  };

  // Get status color
  const getStatusColor = () => {
    if (isPaused) return '#FFD700';
    if (isSpeaking) return '#00BFFF';
    if (isListening) return '#00ff00';
    return '#666';
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.tealDark})`,
      borderBottom: `1px solid rgba(184,134,11,0.3)`,
      padding: '12px 20px'
    }}>
      {/* Top Row: Status + Modes + Nav Buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Left: Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Pulsing indicator */}
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: getStatusColor(),
            boxShadow: isListening && !isPaused ? `0 0 10px ${getStatusColor()}` : 'none',
            animation: isListening && !isPaused ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: THEME.gold, fontWeight: 600, fontSize: '1em' }}>MR. V</span>
          <span style={{ color: '#aaa', fontSize: '0.85em' }}>{getStatusText()}</span>
          
          {/* Step indicator */}
          {currentStep && (
            <span style={{
              background: 'rgba(184,134,11,0.2)',
              color: THEME.goldLight,
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8em'
            }}>
              {stepNumber && totalSteps ? `Step ${stepNumber}/${totalSteps}: ` : ''}{currentStep}
            </span>
          )}
        </div>

        {/* Center: Mode Badges */}
        {showModes && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['interactive', 'talkative', 'text'] as AgentMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '15px',
                  fontSize: '0.75em',
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === m ? THEME.gold : 'rgba(255,255,255,0.08)',
                  color: mode === m ? '#000' : '#888',
                  fontWeight: mode === m ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {m === 'interactive' ? '🎤 Interactive' : m === 'talkative' ? '💬 Talkative' : '📝 Text'}
              </button>
            ))}
          </div>
        )}

        {/* Right: Navigation Buttons */}
        {showNavButtons && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onBack && canGoBack && (
              <button
                onClick={onBack}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: `1px solid ${THEME.gold}50`,
                  padding: '6px 14px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ← Back
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: `1px solid rgba(255,255,255,0.2)`,
                  padding: '6px 14px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                ✕ Close
              </button>
            )}
          </div>
        )}
      </div>

      {/* Teleprompter */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '10px',
        padding: '14px 18px',
        minHeight: '55px',
        border: isSpeaking ? `1px solid ${THEME.gold}40` : '1px solid transparent',
        transition: 'border 0.3s'
      }}>
        <p style={{
          color: isSpeaking ? THEME.goldLight : '#aaa',
          margin: 0,
          lineHeight: 1.7,
          fontSize: '0.95em',
          fontStyle: isSpeaking ? 'normal' : 'italic'
        }}>
          {isSpeaking 
            ? displayText 
            : transcript 
              ? `💬 You said: "${transcript}"` 
              : '🎙️ Say a command or click an option...'}
        </p>
      </div>

      {/* Control Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginTop: '12px' 
      }}>
        {isSpeaking && (
          <button
            onClick={onStop}
            style={{
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              color: '#fff',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(231,76,60,0.3)'
            }}
          >
            ⏹ Stop
          </button>
        )}
        
        {onPause && !isPaused && !isSpeaking && (
          <button
            onClick={onPause}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: `1px solid ${THEME.gold}`,
              padding: '8px 24px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            ⏸️ Pause
          </button>
        )}
        
        {onResume && isPaused && (
          <button
            onClick={onResume}
            style={{
              background: THEME.gold,
              color: '#000',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ▶️ Resume
          </button>
        )}
      </div>

      {/* Voice Hints */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '10px',
        padding: '8px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px'
      }}>
        <span style={{ color: '#666', fontSize: '0.75em' }}>
          💡 Say <span style={{ color: THEME.goldLight }}>"Hey"</span> to pause • 
          <span style={{ color: THEME.goldLight }}> "Go back"</span> • 
          <span style={{ color: THEME.goldLight }}> "Stop"</span> • 
          <span style={{ color: THEME.goldLight }}> "Close"</span>
        </span>
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
