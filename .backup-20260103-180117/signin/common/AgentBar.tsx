// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - AGENT BAR v5.0 (USES GLOBAL VOICE)
// Connects to VoiceContext, smooth transitions, text input works
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';

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
  onTextSubmit?: (text: string) => void;
  canGoBack?: boolean;
  showModes?: boolean;
  showNavButtons?: boolean;
  showTextInput?: boolean;
  currentStep?: string;
  totalSteps?: number;
  stepNumber?: number;
  placeholder?: string;
}

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

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
  onTextSubmit,
  canGoBack = true,
  showModes = true,
  showNavButtons = true,
  showTextInput = true,
  currentStep,
  totalSteps,
  stepNumber,
  placeholder = "Type here or speak..."
}) => {
  const [mode, setMode] = useState<'interactive' | 'talkative' | 'text'>('interactive');
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const getStatus = () => {
    if (isPaused) return { text: 'Waiting...', color: '#FFD700', pulse: false };
    if (isSpeaking) return { text: 'Speaking...', color: '#00BFFF', pulse: false };
    if (isListening) return { text: 'Listening...', color: '#00ff00', pulse: true };
    return { text: 'Ready', color: '#666', pulse: false };
  };

  const status = getStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textValue.trim() && onTextSubmit) {
      onTextSubmit(textValue.trim());
      setTextValue('');
    }
  };

  return (
    <div style={{
      background: `linear-gradient(180deg, ${THEME.teal}, #002a20)`,
      borderBottom: `1px solid ${THEME.gold}30`,
      padding: '8px 14px'
    }}>
      {/* Row 1: Status + Step + Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: status.color,
            boxShadow: status.pulse ? `0 0 8px ${status.color}` : 'none',
            animation: status.pulse ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: THEME.gold, fontWeight: 600, fontSize: '0.85em' }}>MR. V</span>
          <span style={{ color: '#777', fontSize: '0.7em' }}>{status.text}</span>
          {currentStep && (
            <span style={{ background: `${THEME.gold}30`, color: THEME.goldLight, padding: '2px 8px', borderRadius: '8px', fontSize: '0.65em' }}>
              {stepNumber && totalSteps ? `${stepNumber}/${totalSteps}: ` : ''}{currentStep}
            </span>
          )}
        </div>

        {showModes && (
          <div style={{ display: 'flex', gap: '3px' }}>
            {(['interactive', 'talkative', 'text'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); if (m === 'text') inputRef.current?.focus(); }}
                style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '0.6em', border: 'none', cursor: 'pointer',
                  background: mode === m ? THEME.gold : 'rgba(255,255,255,0.08)', color: mode === m ? '#000' : '#666', fontWeight: mode === m ? 600 : 400 }}>
                {m === 'interactive' ? '🎤' : m === 'talkative' ? '💬' : '📝'} {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        )}

        {showNavButtons && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {onBack && canGoBack && (
              <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${THEME.gold}40`, padding: '3px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7em' }}>← Back</button>
            )}
            {onClose && (
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7em' }}>✕</button>
            )}
          </div>
        )}
      </div>

      {/* Row 2: Teleprompter */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '8px 12px', minHeight: '36px', border: isSpeaking ? `1px solid ${THEME.gold}25` : '1px solid transparent' }}>
        <p style={{ color: isSpeaking ? THEME.goldLight : '#888', margin: 0, fontSize: '0.8em', lineHeight: 1.4 }}>
          {isSpeaking ? displayText : transcript ? `💬 "${transcript}"` : '🎤 Listening...'}
        </p>
      </div>

      {/* Row 3: Text Input */}
      {showTextInput && (
        <form onSubmit={handleSubmit} style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
          <input ref={inputRef} type="text" value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder={placeholder}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '16px', border: `1px solid ${THEME.gold}30`, background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: '0.8em', outline: 'none' }} />
          <button type="submit" style={{ padding: '8px 16px', borderRadius: '16px', border: 'none', background: textValue.trim() ? THEME.gold : 'rgba(255,255,255,0.1)', color: textValue.trim() ? '#000' : '#555', cursor: textValue.trim() ? 'pointer' : 'default', fontWeight: 600, fontSize: '0.75em' }}>
            Send
          </button>
        </form>
      )}

      {/* Row 4: Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
        {isSpeaking && (
          <button onClick={onStop} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.75em' }}>■ Stop</button>
        )}
        {onPause && !isPaused && !isSpeaking && isListening && (
          <button onClick={onPause} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${THEME.gold}`, padding: '5px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.75em' }}>⏸️ Pause</button>
        )}
        {onResume && isPaused && (
          <button onClick={onResume} style={{ background: THEME.gold, color: '#000', border: 'none', padding: '5px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.75em', fontWeight: 600 }}>▶️ Resume</button>
        )}
      </div>

      {/* Row 5: Hints */}
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <span style={{ color: '#444', fontSize: '0.6em' }}>
          Say <span style={{ color: THEME.goldLight }}>"Hey"</span> to pause • <span style={{ color: THEME.goldLight }}>"Go back"</span> • <span style={{ color: THEME.goldLight }}>"Stop"</span>
        </span>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
};

export default AgentBar;
