// ═══════════════════════════════════════════════════════════════════════════════
// MR. V ASSISTANT - Revolutionary Voice Interface
// The face of VistaView's AI
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { useVoiceContext, VoiceMode } from '../contexts/VoiceContext';

const MrVAssistant: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const voice = useVoiceContext();
  
  // Determine status
  const isActive = voice.isListening && !voice.isPaused;
  const statusColor = voice.isSpeaking ? '#FFD700' : isActive ? '#4CAF50' : '#f44336';
  const statusText = voice.isSpeaking ? 'Speaking...' : isActive ? 'Listening' : voice.isPaused ? 'Paused' : 'Off';
  
  // Emotion to emoji
  const emotionEmoji: Record<string, string> = {
    neutral: '💡',
    happy: '😊',
    thinking: '🤔',
    concerned: '😟',
    excited: '🎉'
  };
  
  // Mode descriptions
  const modeInfo: Record<VoiceMode, { icon: string; desc: string }> = {
    interactive: { icon: '🎤', desc: 'Responds to commands' },
    talkative: { icon: '💬', desc: 'Detailed guidance' },
    silent: { icon: '🔇', desc: 'No voice responses' }
  };
  
  // Welcome animation
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      {/* Floating Orb Button */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: expanded ? '70px' : '60px',
          height: expanded ? '70px' : '60px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%)`,
          boxShadow: `0 4px 25px rgba(184,134,11,0.5), 0 0 ${isActive ? '30px' : '0px'} rgba(76,175,80,0.5)`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          transition: 'all 0.3s ease',
          animation: isActive ? 'breathe 2s infinite' : 'none'
        }}
      >
        <span style={{ fontSize: expanded ? '2em' : '1.8em', transition: 'all 0.3s' }}>
          {emotionEmoji[voice.emotion] || '💡'}
        </span>
        
        {/* Status Ring */}
        <div style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius: '50%',
          border: `3px solid ${statusColor}`,
          animation: isActive ? 'pulse-ring 1.5s infinite' : 'none',
          opacity: isActive ? 1 : 0.5
        }} />
        
        {/* Listening Waves */}
        {isActive && (
          <>
            <div style={{ position: 'absolute', inset: '-15px', borderRadius: '50%', border: '2px solid rgba(76,175,80,0.3)', animation: 'wave 2s infinite' }} />
            <div style={{ position: 'absolute', inset: '-25px', borderRadius: '50%', border: '1px solid rgba(76,175,80,0.2)', animation: 'wave 2s infinite 0.5s' }} />
          </>
        )}
      </div>
      
      {/* Welcome Tooltip */}
      {showWelcome && !expanded && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          background: 'rgba(0,0,0,0.9)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '0.9em',
          maxWidth: '200px',
          zIndex: 9999,
          animation: 'fadeIn 0.5s'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>👋 Hi! I'm Mr. V</div>
          <div style={{ color: '#aaa', fontSize: '0.85em' }}>Click me or just start talking!</div>
          <div style={{ position: 'absolute', bottom: '-8px', right: '30px', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid rgba(0,0,0,0.9)' }} />
        </div>
      )}
      
      {/* Expanded Panel */}
      {expanded && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '340px',
          background: 'linear-gradient(180deg, #1a3a2a 0%, #0d1f17 100%)',
          borderRadius: '20px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
          zIndex: 9999,
          overflow: 'hidden',
          border: '1px solid rgba(184,134,11,0.3)',
          animation: 'slideUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '16px 20px', 
            background: 'rgba(0,0,0,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px' 
          }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #B8860B, #DAA520)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(184,134,11,0.4)'
            }}>
              <span style={{ fontSize: '1.5em' }}>{emotionEmoji[voice.emotion]}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1em' }}>Mr. V</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: statusColor,
                  animation: isActive ? 'pulse 1s infinite' : 'none'
                }} />
                <span style={{ color: statusColor, fontSize: '0.85em' }}>
                  {statusText}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setExpanded(false)} 
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                color: '#888', 
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >×</button>
          </div>
          
          {/* Mode Selector */}
          <div style={{ display: 'flex', padding: '12px 16px', gap: '8px', background: 'rgba(0,0,0,0.1)' }}>
            {(['interactive', 'talkative', 'silent'] as VoiceMode[]).map(m => (
              <button
                key={m}
                onClick={() => voice.setMode(m)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: 'none',
                  background: voice.mode === m ? 'rgba(184,134,11,0.3)' : 'rgba(255,255,255,0.05)',
                  color: voice.mode === m ? '#B8860B' : '#888',
                  cursor: 'pointer',
                  fontSize: '0.8em',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {modeInfo[m].icon} {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Content */}
          <div style={{ padding: '16px' }}>
            {/* Transcript Box */}
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '12px', 
              padding: '16px', 
              marginBottom: '16px',
              minHeight: '80px'
            }}>
              {voice.isSpeaking ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5em' }}>🔊</span>
                  <div>
                    <div style={{ color: '#B8860B', fontSize: '0.75em', marginBottom: '4px' }}>SPEAKING</div>
                    <div style={{ color: '#fff' }}>...</div>
                  </div>
                </div>
              ) : voice.transcript || voice.interimTranscript ? (
                <>
                  <div style={{ color: '#4CAF50', fontSize: '0.7em', marginBottom: '6px' }}>
                    {voice.interimTranscript ? '🎤 HEARING...' : '✓ HEARD'}
                  </div>
                  <div style={{ color: '#fff', fontSize: '1.05em', lineHeight: 1.4 }}>
                    "{voice.interimTranscript || voice.transcript}"
                  </div>
                  {voice.confidence > 0 && !voice.interimTranscript && (
                    <div style={{ color: '#666', fontSize: '0.75em', marginTop: '8px' }}>
                      Confidence: {Math.round(voice.confidence * 100)}%
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#888', textAlign: 'center', padding: '10px 0' }}>
                  {isActive ? '🎤 Listening... Say something!' : '⏸️ Voice is paused'}
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {voice.isPaused ? (
                <button
                  onClick={() => voice.resume()}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '1em',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.3)'
                  }}
                >
                  ▶ Resume Listening
                </button>
              ) : (
                <button
                  onClick={() => voice.pause()}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ⏸ Pause
                </button>
              )}
              
              {voice.isSpeaking && (
                <button
                  onClick={() => voice.stopSpeaking()}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#f44336',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Stop
                </button>
              )}
            </div>
            
            {/* Quick Commands */}
            <div style={{ 
              background: 'rgba(184,134,11,0.1)', 
              borderRadius: '10px', 
              padding: '12px',
              border: '1px solid rgba(184,134,11,0.2)'
            }}>
              <div style={{ color: '#B8860B', fontSize: '0.75em', fontWeight: 600, marginBottom: '8px' }}>
                💡 TRY SAYING:
              </div>
              <div style={{ color: '#888', fontSize: '0.8em', lineHeight: 1.6 }}>
                "Hey" to pause • "Sign in" • "I'm a vendor"<br/>
                "Go back" • "Help" • "Talkative mode"
              </div>
            </div>
            
            {/* Error */}
            {voice.error && (
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: 'rgba(244,67,54,0.1)', 
                borderRadius: '10px',
                border: '1px solid rgba(244,67,54,0.3)'
              }}>
                <div style={{ color: '#f44336', fontSize: '0.85em' }}>⚠️ {voice.error}</div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(0,0,0,0.2)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#555', fontSize: '0.75em' }}>
              Mode: {modeInfo[voice.mode].desc}
            </span>
            <span style={{ color: '#555', fontSize: '0.75em' }}>
              v1.0
            </span>
          </div>
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes wave {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default MrVAssistant;
