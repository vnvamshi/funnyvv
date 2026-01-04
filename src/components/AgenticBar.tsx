// ═══════════════════════════════════════════════════════════════════════════════
// AGENTIC BAR - The ONE unified voice interface for ALL of VistaView
// Shows at bottom of modals, controls the singleton voice service
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { useVoice } from '../hooks/useVoice';

interface AgenticBarProps {
  context?: string; // e.g., "Phone Entry", "OTP Verification"
  hints?: string[]; // e.g., ["say digits", "say 'clear'"]
  compact?: boolean;
}

const AgenticBar: React.FC<AgenticBarProps> = ({ context, hints, compact = false }) => {
  const voice = useVoice({ autoStart: false }); // Don't auto-start, let parent control
  
  const isActive = voice.isListening;
  const statusColor = voice.isSpeaking ? '#FFD700' : isActive ? '#4CAF50' : '#f44336';
  const statusText = voice.isSpeaking ? '🔊 Speaking...' : isActive ? '🎤 Listening...' : '■ Stopped';
  
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 14px',
        background: isActive ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.1)',
        border: `2px solid ${statusColor}`,
        borderRadius: '20px'
      }}>
        <span style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: statusColor,
          animation: isActive ? 'agentic-pulse 1.5s infinite' : 'none'
        }} />
        <span style={{ color: statusColor, fontWeight: 600, fontSize: '0.9em' }}>
          {statusText}
        </span>
        {!isActive && (
          <button onClick={() => voice.start()} style={{
            padding: '4px 12px', background: '#4CAF50', color: '#fff',
            border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85em'
          }}>▶</button>
        )}
        <style>{`@keyframes agentic-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    );
  }
  
  return (
    <div style={{
      margin: '16px 0 0',
      padding: '14px 16px',
      background: isActive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.08)',
      border: `2px solid ${statusColor}`,
      borderRadius: '14px',
      transition: 'all 0.3s ease'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '14px', height: '14px', borderRadius: '50%',
            background: statusColor,
            boxShadow: isActive ? `0 0 10px ${statusColor}` : 'none',
            animation: isActive ? 'agentic-pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: statusColor, fontWeight: 600, fontSize: '1em' }}>
            {statusText}
          </span>
          {context && (
            <span style={{ color: '#666', fontSize: '0.85em', marginLeft: '8px' }}>
              • {context}
            </span>
          )}
        </div>
        
        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isActive ? (
            <button onClick={() => voice.start()} style={{
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95em',
              boxShadow: '0 2px 8px rgba(76,175,80,0.3)'
            }}>
              ▶ Start
            </button>
          ) : (
            <button onClick={() => voice.stop()} style={{
              padding: '8px 18px',
              background: 'rgba(255,255,255,0.1)',
              color: '#888',
              border: '1px solid #555',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              ⏹ Stop
            </button>
          )}
          {voice.isSpeaking && (
            <button onClick={() => voice.stopSpeaking()} style={{
              padding: '8px 14px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer'
            }}>
              🔇
            </button>
          )}
        </div>
      </div>
      
      {/* Transcript Display */}
      {(voice.transcript || voice.interimTranscript) && (
        <div style={{
          marginTop: '12px',
          background: 'rgba(0,0,0,0.3)',
          padding: '12px',
          borderRadius: '10px'
        }}>
          <div style={{
            color: voice.interimTranscript ? '#888' : '#4CAF50',
            fontSize: '0.7em',
            fontWeight: 600,
            marginBottom: '4px'
          }}>
            {voice.interimTranscript ? '🎤 HEARING...' : '✓ HEARD'}
          </div>
          <div style={{
            color: '#fff',
            fontSize: '1.1em',
            fontStyle: voice.interimTranscript ? 'italic' : 'normal',
            opacity: voice.interimTranscript ? 0.7 : 1
          }}>
            "{voice.interimTranscript || voice.transcript}"
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {voice.error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: 'rgba(244,67,54,0.15)',
          borderRadius: '8px',
          color: '#f44336',
          fontSize: '0.9em'
        }}>
          ⚠️ {voice.error}
        </div>
      )}
      
      {/* Hints */}
      {hints && hints.length > 0 && (
        <div style={{
          marginTop: '10px',
          color: '#666',
          fontSize: '0.8em',
          textAlign: 'center'
        }}>
          💡 {hints.join(' • ')}
        </div>
      )}
      
      <style>{`@keyframes agentic-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.1); } }`}</style>
    </div>
  );
};

export default AgenticBar;
