// StatusIndicator.tsx - Visual indicator of current audio state
import React from 'react';
import { useVoice } from './AgenticBar';

interface StatusIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showWaveform?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  size = 'medium',
  showLabel = true,
  showWaveform = true
}) => {
  const voice = useVoice();
  
  const sizes = {
    small: { indicator: 8, font: '0.7em', waveHeight: 16 },
    medium: { indicator: 14, font: '0.9em', waveHeight: 24 },
    large: { indicator: 20, font: '1.1em', waveHeight: 32 }
  };

  const s = sizes[size];
  
  const stateConfig = {
    IDLE: { color: '#666', icon: '■', label: 'Ready' },
    LISTENING: { color: '#4CAF50', icon: '🎤', label: 'Listening' },
    SPEAKING: { color: '#FFD700', icon: '🔊', label: 'Speaking' },
    PAUSED: { color: '#FF9800', icon: '⏸️', label: 'Paused' },
    THINKING: { color: '#2196F3', icon: '🤔', label: 'Thinking' }
  };

  const config = stateConfig[voice.audioState] || stateConfig.IDLE;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {/* Main Indicator */}
      <div style={{
        position: 'relative',
        width: s.indicator,
        height: s.indicator
      }}>
        <span style={{
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: config.color,
          boxShadow: voice.isListening || voice.isSpeaking ? `0 0 ${s.indicator}px ${config.color}` : 'none'
        }} />
        {(voice.isListening || voice.isSpeaking) && (
          <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `2px solid ${config.color}`,
            animation: 'status-ripple 1.5s infinite'
          }} />
        )}
      </div>

      {/* Waveform */}
      {showWaveform && (voice.isListening || voice.isSpeaking) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          height: s.waveHeight
        }}>
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              style={{
                width: '3px',
                background: config.color,
                borderRadius: '2px',
                animation: `waveform ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <span style={{
          color: config.color,
          fontSize: s.font,
          fontWeight: 600
        }}>
          {config.icon} {config.label}
        </span>
      )}

      <style>{`
        @keyframes status-ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes waveform {
          0% { height: 30%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StatusIndicator;
