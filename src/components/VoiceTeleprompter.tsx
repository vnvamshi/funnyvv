// ═══════════════════════════════════════════════════════════════════════════════
// VOICE TELEPROMPTER - Real-time voice feedback for modals
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { useVoiceContext } from '../contexts/VoiceContext';

interface Props {
  compact?: boolean;
  showModes?: boolean;
}

const VoiceTeleprompter: React.FC<Props> = ({ compact = false, showModes = false }) => {
  const voice = useVoiceContext();
  const isActive = voice.isListening && !voice.isPaused;
  
  const statusColor = voice.isSpeaking ? '#FFD700' : isActive ? '#4CAF50' : '#f44336';
  
  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        background: isActive ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.1)',
        borderRadius: '20px',
        border: `1px solid ${statusColor}`,
        cursor: 'pointer'
      }} onClick={() => voice.isPaused ? voice.resume() : voice.pause()}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: statusColor,
          animation: isActive ? 'tele-pulse 1.5s infinite' : 'none'
        }} />
        <span style={{ color: statusColor, fontSize: '0.9em', fontWeight: 500 }}>
          {voice.isSpeaking ? '🔊 Speaking' : isActive ? '🎤 Listening' : '⏸️ Paused'}
        </span>
        <style>{`@keyframes tele-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }`}</style>
      </div>
    );
  }
  
  return (
    <div style={{
      margin: '16px 0',
      padding: '16px',
      background: isActive ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.08)',
      border: `2px solid ${statusColor}`,
      borderRadius: '14px',
      transition: 'all 0.3s ease'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: (voice.transcript || voice.interimTranscript) ? '14px' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: statusColor,
            boxShadow: isActive ? `0 0 10px ${statusColor}` : 'none',
            animation: isActive ? 'tele-pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: statusColor, fontWeight: 600, fontSize: '1em' }}>
            {voice.isSpeaking ? '🔊 Mr. V is speaking...' : isActive ? '🎤 Listening - speak now!' : '⏸️ Voice paused'}
          </span>
        </div>
        
        {/* Action Button */}
        {voice.isPaused ? (
          <button 
            onClick={() => voice.resume()} 
            style={{ 
              padding: '8px 18px', 
              background: 'linear-gradient(135deg, #4CAF50, #45a049)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '18px', 
              cursor: 'pointer', 
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(76,175,80,0.3)'
            }}
          >
            ▶ Resume
          </button>
        ) : (
          <button 
            onClick={() => voice.pause()} 
            style={{ 
              padding: '8px 18px', 
              background: 'rgba(255,255,255,0.1)', 
              color: '#888', 
              border: '1px solid #555', 
              borderRadius: '18px', 
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            ⏸ Pause
          </button>
        )}
      </div>
      
      {/* Transcript Display */}
      {(voice.transcript || voice.interimTranscript) && (
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '14px', 
          borderRadius: '10px',
          position: 'relative'
        }}>
          <div style={{ 
            color: voice.interimTranscript ? '#888' : '#4CAF50', 
            fontSize: '0.7em', 
            fontWeight: 600,
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {voice.interimTranscript ? '🎤 Hearing...' : '✓ Heard'}
          </div>
          <div style={{ 
            color: '#fff', 
            fontSize: '1.15em',
            fontStyle: voice.interimTranscript ? 'italic' : 'normal',
            opacity: voice.interimTranscript ? 0.7 : 1
          }}>
            "{voice.interimTranscript || voice.transcript}"
          </div>
        </div>
      )}
      
      {/* Mode Selector */}
      {showModes && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {(['interactive', 'talkative', 'silent'] as const).map(m => (
            <button
              key={m}
              onClick={() => voice.setMode(m)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: voice.mode === m ? 'rgba(184,134,11,0.3)' : 'rgba(255,255,255,0.05)',
                color: voice.mode === m ? '#B8860B' : '#666',
                cursor: 'pointer',
                fontSize: '0.8em',
                fontWeight: 500
              }}
            >
              {m === 'interactive' ? '🎤' : m === 'talkative' ? '💬' : '🔇'} {m}
            </button>
          ))}
        </div>
      )}
      
      {/* Error */}
      {voice.error && (
        <div style={{ 
          marginTop: '12px', 
          padding: '10px 12px', 
          background: 'rgba(244,67,54,0.15)', 
          borderRadius: '8px',
          color: '#f44336',
          fontSize: '0.85em'
        }}>
          ⚠️ {voice.error}
        </div>
      )}
      
      <style>{`@keyframes tele-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }`}</style>
    </div>
  );
};

export default VoiceTeleprompter;
