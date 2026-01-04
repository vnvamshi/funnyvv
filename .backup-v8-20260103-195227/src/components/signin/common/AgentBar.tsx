// ═══════════════════════════════════════════════════════════════════════════════
// AgentBar v5.0 - Unified Voice Interface Component
// ═══════════════════════════════════════════════════════════════════════════════
import React from 'react';

const THEME = { teal: '#004D40', gold: '#B8860B' };

interface AgentBarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  transcript: string;
  displayText: string;
  onStop: () => void;
}

const AgentBar: React.FC<AgentBarProps> = ({
  isListening, isSpeaking, isPaused, transcript, displayText, onStop
}) => {
  return (
    <div style={{ padding: '12px 20px', borderBottom: `1px solid ${THEME.gold}30`, background: 'rgba(0,0,0,0.2)' }}>
      {/* Status Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isListening ? '#4CAF50' : '#888', boxShadow: isListening ? '0 0 8px #4CAF50' : 'none' }} />
          <span style={{ color: THEME.gold, fontWeight: 600 }}>MR. V:</span>
          <span style={{ color: '#888', fontSize: '0.9em' }}>
            {isSpeaking ? '🔊 Speaking...' : isListening ? '🎤 Listening' : isPaused ? '⏸️ Paused' : '💤 Idle'}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ background: 'rgba(184,134,11,0.3)', border: `1px solid ${THEME.gold}`, color: '#fff', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8em', cursor: 'pointer' }}>🎤 Interactive</button>
          <button style={{ background: 'transparent', border: '1px solid #666', color: '#888', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8em', cursor: 'pointer' }}>💬 Talkative</button>
          <button style={{ background: 'transparent', border: '1px solid #666', color: '#888', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8em', cursor: 'pointer' }}>📝 Text</button>
        </div>
      </div>

      {/* Teleprompter - What Mr. V is saying */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px' }}>
        <div style={{ color: '#fff', fontSize: '0.95em', lineHeight: 1.5, minHeight: '24px' }}>
          {displayText || 'Say a command or click an option...'}
        </div>
      </div>

      {/* Transcript - What user is saying */}
      {transcript && (
        <div style={{ color: '#888', fontSize: '0.85em', marginBottom: '8px' }}>
          💬 "{transcript}"
        </div>
      )}

      {/* Stop Button */}
      {isSpeaking && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onStop}
            style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9em' }}
          >
            ■ Stop
          </button>
        </div>
      )}

      {/* Hint */}
      <div style={{ textAlign: 'center', color: '#666', fontSize: '0.75em', marginTop: '8px' }}>
        Say "Hey" to pause • "About us" • "Real estate" • "Sign in" • "Go back"
      </div>
    </div>
  );
};

export default AgentBar;
