import React, { useState } from 'react';

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  transcript: string;
  displayText: string;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onBack?: () => void;
  onClose?: () => void;
  canGoBack?: boolean;
  showModes?: boolean;
  showNavButtons?: boolean;
}

const THEME = { gold: '#B8860B' };

const AgentBar: React.FC<Props> = ({ isListening, isSpeaking, isPaused, transcript, displayText, onStop, onPause, onResume, onBack, onClose, canGoBack = true, showModes = true, showNavButtons = true }) => {
  const [mode, setMode] = useState<'interactive'|'talkative'|'text'>('interactive');

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: `1px solid ${THEME.gold}30` }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isListening ? '#4CAF50' : '#888', boxShadow: isListening ? '0 0 10px #4CAF50' : 'none' }} />
        <span style={{ color: THEME.gold, fontWeight: 600 }}>MR. V:</span>
        <span style={{ color: '#aaa', fontSize: '0.9em' }}>{isSpeaking ? '🔊 Speaking' : isListening ? '🎤 Listening' : '💤 Idle'}</span>
        {showModes && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {(['interactive','talkative','text'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ padding: '6px 12px', borderRadius: '16px', border: mode === m ? `1px solid ${THEME.gold}` : '1px solid transparent', background: mode === m ? 'rgba(184,134,11,0.2)' : 'rgba(255,255,255,0.05)', color: mode === m ? '#fff' : '#666', cursor: 'pointer', fontSize: '0.75em' }}>
                {m === 'interactive' ? '🎤' : m === 'talkative' ? '💬' : '📝'} {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '16px 20px', minHeight: '50px' }}>
        <p style={{ color: '#fff', margin: 0, fontSize: '1em', lineHeight: 1.5 }}>{displayText || 'Listening...'}</p>
        {transcript && <p style={{ color: '#666', margin: '8px 0 0', fontSize: '0.85em' }}>💬 "{transcript}"</p>}
      </div>
      {showNavButtons && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {canGoBack && onBack && <button onClick={onBack} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>}
          <button onClick={isPaused ? onResume : onPause} style={{ padding: '10px 24px', background: THEME.gold, border: 'none', color: '#000', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}>{isPaused ? '▶ Resume' : '⏸ Pause'}</button>
          <div style={{ flex: 1, textAlign: 'center' }}><span style={{ color: '#555', fontSize: '0.75em' }}>Say: "Hey" to pause • "Back" • "Next" • "Stop" • "Close"</span></div>
          {onClose && <button onClick={onClose} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#888', borderRadius: '20px', cursor: 'pointer' }}>✕ Close</button>}
        </div>
      )}
    </div>
  );
};

export default AgentBar;
