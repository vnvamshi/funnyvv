// ═══════════════════════════════════════════════════════════════════════════════
// AGENTIC BAR - The unified voice UI component
// All screens use this one component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { voiceBrain, extractDigits, formatPhone, AudioState, VoiceMode } from './VoiceBrain';

export { extractDigits, formatPhone };

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL FUNCTIONS (can be imported anywhere)
// ─────────────────────────────────────────────────────────────────────────────
export const speak = (text: string, onDone?: () => void) => voiceBrain.speak(text, onDone);
export const onDigits = (handler: (d: string) => void) => voiceBrain.onDigits(handler);
export const onCommand = (handler: (c: string) => void) => voiceBrain.onCommand(handler);
export const startListening = () => voiceBrain.start();
export const stopListening = () => voiceBrain.stop();
export const setContext = (ctx: string) => voiceBrain.setContext(ctx);
export const setMode = (mode: VoiceMode) => voiceBrain.setMode(mode);

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: useVoice
// ─────────────────────────────────────────────────────────────────────────────
export function useVoice() {
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    voiceBrain.init();
    return voiceBrain.subscribe(() => forceUpdate(x => x + 1));
  }, []);

  const state = voiceBrain.getState();
  return {
    ...state,
    isListening: state.audioState === 'LISTENING',
    isSpeaking: state.audioState === 'SPEAKING',
    isPaused: state.audioState === 'PAUSED',
    isIdle: state.audioState === 'IDLE',
    start: () => voiceBrain.start(),
    stop: () => voiceBrain.stop(),
    pause: () => voiceBrain.pause(),
    resume: () => voiceBrain.resume(),
    speak: (text: string, onDone?: () => void) => voiceBrain.speak(text, onDone),
    stopSpeaking: () => voiceBrain.stopSpeaking(),
    setMode: (mode: VoiceMode) => voiceBrain.setMode(mode),
    setContext: (ctx: string) => voiceBrain.setContext(ctx)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface AgenticBarProps {
  context?: string;
  hints?: string[];
  welcomeMessage?: string;
  autoStart?: boolean;
  showTypeInput?: boolean;
  onDigits?: (d: string) => void;
  onCommand?: (c: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AgenticBar: React.FC<AgenticBarProps> = ({
  context,
  hints,
  welcomeMessage,
  autoStart = true,
  showTypeInput = true,
  onDigits: onDigitsProp,
  onCommand: onCommandProp
}) => {
  const voice = useVoice();
  const welcomeSpoken = useRef(false);
  const [textInput, setTextInput] = useState('');
  const [showModes, setShowModes] = useState(false);

  // Register digit handler
  useEffect(() => {
    if (onDigitsProp) {
      return voiceBrain.onDigits(onDigitsProp);
    }
  }, [onDigitsProp]);

  // Register command handler
  useEffect(() => {
    if (onCommandProp) {
      return voiceBrain.onCommand(onCommandProp);
    }
  }, [onCommandProp]);

  // Set context
  useEffect(() => {
    if (context) {
      voiceBrain.setContext(context);
    }
  }, [context]);

  // Welcome message + auto-start
  useEffect(() => {
    if (!welcomeSpoken.current) {
      welcomeSpoken.current = true;
      if (welcomeMessage) {
        setTimeout(() => {
          voiceBrain.speak(welcomeMessage, () => {
            if (autoStart) {
              voiceBrain.start();
            }
          });
        }, 600);
      } else if (autoStart) {
        setTimeout(() => voiceBrain.start(), 500);
      }
    }
  }, [welcomeMessage, autoStart]);

  // Handle text input submit
  const handleTextSubmit = useCallback(() => {
    if (textInput.trim()) {
      const digits = extractDigits(textInput);
      if (digits && onDigitsProp) {
        onDigitsProp(digits);
      }
      if (onCommandProp) {
        onCommandProp(textInput.toLowerCase());
      }
      setTextInput('');
    }
  }, [textInput, onDigitsProp, onCommandProp]);

  // Colors based on state
  const stateColors: Record<AudioState, string> = {
    'IDLE': '#666',
    'LISTENING': '#4CAF50',
    'SPEAKING': '#FFD700',
    'PAUSED': '#FF9800'
  };

  const stateIcons: Record<AudioState, string> = {
    'IDLE': '■',
    'LISTENING': '🎤',
    'SPEAKING': '🔊',
    'PAUSED': '⏸️'
  };

  const statusColor = stateColors[voice.audioState];
  const statusIcon = stateIcons[voice.audioState];

  return (
    <div style={{
      margin: '16px 0 0',
      padding: '16px',
      background: `linear-gradient(135deg, rgba(${voice.isListening ? '76,175,80' : voice.isSpeaking ? '255,215,0' : '40,40,40'}, 0.15), rgba(0,0,0,0.3))`,
      border: `2px solid ${statusColor}`,
      borderRadius: '16px'
    }}>
      {/* Status Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '12px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: statusColor,
            boxShadow: (voice.isListening || voice.isSpeaking) ? `0 0 12px ${statusColor}` : 'none',
            animation: voice.isListening ? 'agenticPulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: statusColor, fontWeight: 700 }}>
            {statusIcon} {voice.audioState}
          </span>
          {context && (
            <span style={{ color: '#888', fontSize: '0.85em' }}>• {context}</span>
          )}
          <span style={{
            padding: '2px 8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '0.7em',
            color: '#aaa',
            textTransform: 'uppercase'
          }}>
            {voice.mode}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {/* Listen/Stop */}
        <button
          onClick={() => voice.isListening ? voice.stop() : voice.start()}
          style={{
            padding: '10px 16px',
            background: voice.isListening ? '#4CAF50' : 'rgba(255,255,255,0.1)',
            color: voice.isListening ? '#fff' : '#aaa',
            border: voice.isListening ? 'none' : '1px solid #555',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          🎤 {voice.isListening ? 'Stop' : 'Listen'}
        </button>

        {/* Speak Test */}
        <button
          onClick={() => voice.speak('Hello! I am Mr. V, your VistaView assistant.')}
          style={{
            padding: '10px 16px',
            background: voice.isSpeaking ? '#FFD700' : 'rgba(255,255,255,0.1)',
            color: voice.isSpeaking ? '#000' : '#aaa',
            border: voice.isSpeaking ? 'none' : '1px solid #555',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          🔊 Speak
        </button>

        {/* Pause/Resume */}
        <button
          onClick={() => voice.isPaused ? voice.resume() : voice.pause()}
          style={{
            padding: '10px 16px',
            background: voice.isPaused ? '#FF9800' : 'rgba(255,255,255,0.1)',
            color: voice.isPaused ? '#fff' : '#aaa',
            border: voice.isPaused ? 'none' : '1px solid #555',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {voice.isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>

        {/* Mode Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowModes(!showModes)}
            style={{
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.1)',
              color: '#aaa',
              border: '1px solid #555',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            💬 Mode ▾
          </button>
          {showModes && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '8px',
              background: 'rgba(30,30,30,0.95)',
              border: '1px solid #555',
              borderRadius: '12px',
              padding: '8px',
              zIndex: 100
            }}>
              {(['interactive', 'talkative', 'text'] as VoiceMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => { voice.setMode(mode); setShowModes(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 16px',
                    background: voice.mode === mode ? '#B8860B' : 'transparent',
                    color: voice.mode === mode ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '4px'
                  }}
                >
                  {mode === 'interactive' && '⚡ Interactive'}
                  {mode === 'talkative' && '💬 Talkative'}
                  {mode === 'text' && '📝 Text Only'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Text Input */}
      {showTypeInput && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Type here or speak..."
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid #555',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1em'
            }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            style={{
              padding: '12px 20px',
              background: textInput.trim() ? '#B8860B' : 'rgba(255,255,255,0.1)',
              color: textInput.trim() ? '#000' : '#555',
              border: 'none',
              borderRadius: '12px',
              cursor: textInput.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 700
            }}
          >
            Send
          </button>
        </div>
      )}

      {/* Transcript */}
      {(voice.transcript || voice.interim) && (
        <div style={{
          marginBottom: '12px',
          padding: '12px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '12px',
          border: `1px solid ${voice.interim ? '#666' : '#4CAF50'}`
        }}>
          <div style={{
            fontSize: '0.7em',
            color: voice.interim ? '#888' : '#4CAF50',
            marginBottom: '4px',
            fontWeight: 600
          }}>
            {voice.interim ? '🎤 HEARING...' : '✓ HEARD'}
          </div>
          <div style={{
            color: '#fff',
            fontSize: '1.1em',
            fontStyle: voice.interim ? 'italic' : 'normal',
            opacity: voice.interim ? 0.7 : 1
          }}>
            "{voice.interim || voice.transcript}"
          </div>
        </div>
      )}

      {/* Error */}
      {voice.error && (
        <div style={{
          marginBottom: '12px',
          padding: '12px',
          background: 'rgba(244,67,54,0.15)',
          border: '1px solid #f44336',
          borderRadius: '12px',
          color: '#f44336'
        }}>
          ⚠️ {voice.error}
        </div>
      )}

      {/* Hints */}
      {hints && hints.length > 0 && (
        <div style={{ color: '#666', fontSize: '0.8em', textAlign: 'center' }}>
          💡 Try: {hints.join(' • ')}
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes agenticPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default AgenticBar;
