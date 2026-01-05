/**
 * UnifiedAgenticBar - THE ONE AGENTIC BAR FOR ENTIRE APP
 * 
 * Use this EVERYWHERE:
 * - Landing page
 * - Modals
 * - Flows (Vendor, Builder, Agent)
 * - Any page
 * 
 * Features:
 * - Voice recognition
 * - Text-to-speech
 * - Form filling
 * - Waveform animation
 * - Customizable appearance
 */

import React, { useState, useEffect } from 'react';
import { useAgentic } from './useAgentic';

interface FieldMapping {
  [voiceKey: string]: string | { selector: string; setter?: (value: string) => void };
}

interface UnifiedAgenticBarProps {
  // Behavior
  context?: string;
  fields?: FieldMapping;
  autoStart?: boolean;
  
  // Callbacks
  onCommand?: (command: string, intent: string) => void;
  onTranscript?: (text: string) => void;
  onFill?: (field: string, value: string) => void;
  speak?: (text: string) => void;
  
  // Appearance
  position?: 'fixed' | 'inline' | 'bottom' | 'top';
  variant?: 'full' | 'minimal' | 'floating';
  theme?: 'dark' | 'light' | 'teal' | 'gold';
  hints?: string;
  showInput?: boolean;
  showStats?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const THEMES = {
  dark: { bg: 'rgba(15, 23, 42, 0.95)', border: 'rgba(255,255,255,0.1)', accent: '#06b6d4' },
  light: { bg: 'rgba(255, 255, 255, 0.95)', border: 'rgba(0,0,0,0.1)', accent: '#0891b2' },
  teal: { bg: 'rgba(0, 66, 54, 0.95)', border: 'rgba(184, 134, 11, 0.4)', accent: '#B8860B' },
  gold: { bg: 'rgba(30, 30, 30, 0.95)', border: 'rgba(184, 134, 11, 0.5)', accent: '#B8860B' }
};

export const UnifiedAgenticBar: React.FC<UnifiedAgenticBarProps> = ({
  context = 'general',
  fields = {},
  autoStart = false,
  onCommand,
  onTranscript,
  onFill,
  speak: externalSpeak,
  position = 'inline',
  variant = 'full',
  theme = 'teal',
  hints = 'Speak naturally or type below...',
  showInput = true,
  showStats = false,
  className = '',
  style = {}
}) => {
  const [inputText, setInputText] = useState('');
  const [filling, setFilling] = useState<string | null>(null);
  const [lastHeard, setLastHeard] = useState('');
  
  const colors = THEMES[theme];
  
  // Handle form field filling
  const handleFormData = async (formFields: Record<string, string>) => {
    for (const [key, value] of Object.entries(formFields)) {
      if (!value) continue;
      
      const fieldConfig = fields[key];
      if (!fieldConfig) continue;
      
      const selector = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.selector;
      const setter = typeof fieldConfig === 'object' ? fieldConfig.setter : undefined;
      
      setFilling(key);
      await agentic.fillField(selector, value, true);
      setter?.(value);
      onFill?.(key, value);
      setFilling(null);
      
      await new Promise(r => setTimeout(r, 200));
    }
  };
  
  const agentic = useAgentic({
    context,
    autoStart,
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        setLastHeard(text);
        onTranscript?.(text);
      }
    },
    onCommand,
    onFormData: handleFormData
  });
  
  // Use external speak if provided
  const speakFn = externalSpeak || agentic.speak;
  
  const handleSend = () => {
    if (inputText.trim()) {
      agentic.processText(inputText.trim());
      setInputText('');
    }
  };
  
  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    fixed: { position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '90%', maxWidth: 500 },
    bottom: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 },
    top: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 },
    inline: { width: '100%' }
  };
  
  const isActive = agentic.isListening || agentic.isSpeaking;
  const borderColor = agentic.isListening ? '#10b981' : agentic.isSpeaking ? '#eab308' : agentic.isProcessing ? '#f97316' : colors.border;
  
  if (variant === 'minimal') {
    return (
      <div className={className} style={{ ...positionStyles[position], ...style }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          background: colors.bg,
          borderRadius: 25,
          border: `2px solid ${borderColor}`
        }}>
          <button
            onClick={agentic.toggle}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: agentic.isListening ? '#ef4444' : '#10b981',
              border: 'none', color: 'white', fontSize: 18, cursor: 'pointer'
            }}
          >
            {agentic.isListening ? '⏹' : '🎤'}
          </button>
          <span style={{ color: '#e2e8f0', fontSize: 14, flex: 1 }}>
            {agentic.interimTranscript || lastHeard || 'Click to speak...'}
          </span>
          <button
            onClick={() => speakFn('How can I help you?')}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', fontSize: 18, cursor: 'pointer'
            }}
          >
            🔊
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className} style={{ ...positionStyles[position], ...style }}>
      <div style={{
        background: colors.bg,
        border: `2px solid ${borderColor}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: isActive ? `0 0 30px ${borderColor}40` : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'all 0.3s'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: agentic.isListening ? '#10b981' : agentic.isSpeaking ? '#eab308' : agentic.isProcessing ? '#f97316' : '#64748b',
              animation: isActive ? 'pulse 1s infinite' : 'none'
            }} />
            <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>
              {agentic.isListening && '🎤 LISTENING'}
              {agentic.isSpeaking && '🔊 SPEAKING'}
              {agentic.isProcessing && '⚡ PROCESSING'}
              {agentic.state === 'idle' && '🎙️ READY'}
              {agentic.state === 'error' && '❌ ERROR'}
            </span>
            <span style={{ color: '#64748b', fontSize: 11 }}>• {context}</span>
          </div>
          <span style={{
            fontSize: 10, padding: '3px 10px', borderRadius: 10,
            background: `${colors.accent}30`, color: colors.accent
          }}>
            INTERACTIVE
          </span>
        </div>
        
        {/* Waveform */}
        {agentic.isListening && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 30, alignItems: 'center', marginBottom: 12 }}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  background: 'linear-gradient(to top, #10b981, #06b6d4)',
                  borderRadius: 2,
                  animation: `wave 0.4s ease-in-out ${i * 0.03}s infinite alternate`,
                  height: 8
                }}
              />
            ))}
          </div>
        )}
        
        {/* Filling indicator */}
        {filling && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.2)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 12, textAlign: 'center'
          }}>
            <span style={{ color: '#06b6d4', fontSize: 13 }}>⚡ Filling {filling}...</span>
          </div>
        )}
        
        {/* Transcript */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12, padding: 14, marginBottom: 14, minHeight: 50
        }}>
          {agentic.interimTranscript && (
            <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0, fontSize: 14 }}>
              {agentic.interimTranscript}
            </p>
          )}
          {lastHeard && !agentic.interimTranscript && (
            <div>
              <span style={{ color: '#10b981', fontSize: 11, fontWeight: 600 }}>✓ HEARD</span>
              <p style={{ color: '#e2e8f0', margin: '6px 0 0', fontSize: 14 }}>"{lastHeard}"</p>
            </div>
          )}
          {!agentic.interimTranscript && !lastHeard && (
            <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>
              {agentic.isListening ? 'Listening...' : 'Click Listen to start'}
            </p>
          )}
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={agentic.toggle}
            style={{
              padding: '10px 24px', borderRadius: 25, border: 'none',
              background: agentic.isListening ? '#ef4444' : '#10b981',
              color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            {agentic.isListening ? '⏹️ Stop' : '🎤 Listen'}
          </button>
          
          <button
            onClick={() => speakFn('How can I help you?')}
            style={{
              padding: '10px 24px', borderRadius: 25,
              border: '1px solid rgba(255,255,255,0.2)',
              background: agentic.isSpeaking ? '#eab308' : 'transparent',
              color: agentic.isSpeaking ? '#000' : '#e2e8f0',
              fontWeight: 500, cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            🔊 Speak
          </button>
          
          <button
            onClick={agentic.stop}
            style={{
              padding: '10px 24px', borderRadius: 25,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent', color: '#e2e8f0',
              fontWeight: 500, cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            ⏸️ Pause
          </button>
        </div>
        
        {/* Text Input */}
        {showInput && (
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a command..."
              style={{
                flex: 1, padding: '12px 16px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 25, color: '#e2e8f0', fontSize: 14, outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '12px 20px',
                background: colors.accent, border: 'none',
                borderRadius: 25, color: '#000', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        )}
        
        {/* Hints */}
        {hints && (
          <p style={{ color: '#64748b', fontSize: 11, textAlign: 'center', margin: '14px 0 0' }}>
            💡 {hints}
          </p>
        )}
      </div>
      
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes wave { from { height: 6px; } to { height: 24px; } }
        .agentic-filling {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2) !important;
          animation: pulse 0.5s infinite !important;
        }
        .agentic-filled {
          animation: successFlash 0.5s ease-out !important;
        }
        @keyframes successFlash {
          0% { background-color: rgba(34, 197, 94, 0.3); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
};

export default UnifiedAgenticBar;
