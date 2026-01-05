#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# PART 5: Teleprompter Display + Enhanced UI
# VISTAVIEW_AGENTIC_STANDARD_V1 Compliant
# ═══════════════════════════════════════════════════════════════════════════════

W="/Users/vistaview/vistaview_WORKING"
TS=$(date -u +%Y%m%d_%H%M%S)
BK="/Users/vistaview/vistaview_BACKUPS/$TS"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  PART 5: Teleprompter + Enhanced UI"
echo "  Timestamp: $TS"
echo "═══════════════════════════════════════════════════════════════════════════════"

# BACKUP
mkdir -p "$BK"
cp -r "$W/src/agentic" "$BK/" 2>/dev/null
echo "✅ Backup: $BK"

# ═══════════════════════════════════════════════════════════════════════════════
# Create Teleprompter Component
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Creating Teleprompter.tsx..."

cat > "$W/src/agentic/Teleprompter.tsx" << 'EOF'
// Teleprompter.tsx - Shows what Mr. V is saying in real-time
import React, { useState, useEffect, useRef } from 'react';
import { voiceBrain } from './VoiceBrain';

interface TeleprompterProps {
  position?: 'top' | 'bottom' | 'center';
  style?: 'minimal' | 'full' | 'caption';
}

const Teleprompter: React.FC<TeleprompterProps> = ({ 
  position = 'bottom',
  style = 'full'
}) => {
  const [currentText, setCurrentText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number>();
  const charIndexRef = useRef(0);

  // Subscribe to speech events
  useEffect(() => {
    // Intercept speak function to get text
    const originalSpeak = voiceBrain.sp.bind(voiceBrain);
    
    voiceBrain.sp = (text: string, onDone?: () => void) => {
      if (text) {
        setCurrentText(text);
        setIsVisible(true);
        charIndexRef.current = 0;
        setDisplayText('');
      }
      originalSpeak(text, () => {
        setTimeout(() => setIsVisible(false), 1000);
        onDone?.();
      });
    };

    return () => {
      voiceBrain.sp = originalSpeak;
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!currentText || !isVisible) return;

    const animate = () => {
      if (charIndexRef.current < currentText.length) {
        setDisplayText(currentText.slice(0, charIndexRef.current + 1));
        charIndexRef.current++;
        animationRef.current = requestAnimationFrame(() => {
          setTimeout(animate, 30); // Typing speed
        });
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentText, isVisible]);

  if (!isVisible || !displayText) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: '80px', left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: '100px', left: '50%', transform: 'translateX(-50%)' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };

  const styleVariants: Record<string, React.CSSProperties> = {
    minimal: {
      background: 'rgba(0,0,0,0.7)',
      padding: '12px 24px',
      borderRadius: '24px'
    },
    full: {
      background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(40,40,40,0.95))',
      padding: '20px 32px',
      borderRadius: '16px',
      border: '2px solid #B8860B',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    },
    caption: {
      background: 'rgba(0,0,0,0.85)',
      padding: '16px 24px',
      borderRadius: '8px',
      maxWidth: '600px'
    }
  };

  return (
    <div style={{
      position: 'fixed',
      zIndex: 99999,
      ...positionStyles[position],
      ...styleVariants[style],
      animation: 'teleprompter-fade-in 0.3s ease'
    }}>
      {style === 'full' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <span style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #B8860B, #DAA520)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2em'
          }}>
            🤖
          </span>
          <div>
            <div style={{ color: '#B8860B', fontWeight: 700, fontSize: '0.9em' }}>Mr. V</div>
            <div style={{ color: '#666', fontSize: '0.75em' }}>Speaking...</div>
          </div>
          <span style={{
            marginLeft: 'auto',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#4CAF50',
            animation: 'teleprompter-pulse 1s infinite'
          }} />
        </div>
      )}
      
      <div style={{
        color: '#fff',
        fontSize: style === 'caption' ? '1.1em' : '1.3em',
        lineHeight: 1.5,
        maxWidth: '500px',
        textAlign: style === 'caption' ? 'center' : 'left'
      }}>
        {displayText}
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '1.2em',
          background: '#B8860B',
          marginLeft: '2px',
          animation: 'teleprompter-cursor 0.5s infinite'
        }} />
      </div>

      <style>{`
        @keyframes teleprompter-fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes teleprompter-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes teleprompter-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Teleprompter;
EOF
echo "✅ Teleprompter.tsx created"

# ═══════════════════════════════════════════════════════════════════════════════
# Create Enhanced Status Indicator
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Creating StatusIndicator.tsx..."

cat > "$W/src/agentic/StatusIndicator.tsx" << 'EOF'
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
EOF
echo "✅ StatusIndicator.tsx created"

# ═══════════════════════════════════════════════════════════════════════════════
# Create VoiceCommandPalette (quick commands overlay)
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Creating VoiceCommandPalette.tsx..."

cat > "$W/src/agentic/VoiceCommandPalette.tsx" << 'EOF'
// VoiceCommandPalette.tsx - Quick voice command reference
import React, { useState } from 'react';
import { speak } from './AgenticBar';

interface Command {
  phrase: string;
  description: string;
  category: 'navigation' | 'action' | 'mode' | 'control';
}

const COMMANDS: Command[] = [
  // Navigation
  { phrase: 'sign in', description: 'Open sign in modal', category: 'navigation' },
  { phrase: "I'm a vendor", description: 'Start vendor onboarding', category: 'navigation' },
  { phrase: 'go back', description: 'Navigate back', category: 'navigation' },
  { phrase: 'close', description: 'Close current modal', category: 'navigation' },
  { phrase: 'home', description: 'Go to home page', category: 'navigation' },
  { phrase: 'products', description: 'View products', category: 'navigation' },
  
  // Actions
  { phrase: 'yes / confirm', description: 'Confirm current action', category: 'action' },
  { phrase: 'clear / reset', description: 'Clear current input', category: 'action' },
  { phrase: 'beautify', description: 'AI enhance profile', category: 'action' },
  { phrase: 'save', description: 'Save and continue', category: 'action' },
  { phrase: 'upload', description: 'Start file upload', category: 'action' },
  
  // Mode
  { phrase: 'talkative mode', description: 'More verbose responses', category: 'mode' },
  { phrase: 'interactive mode', description: 'Brief responses', category: 'mode' },
  { phrase: 'text mode', description: 'Silent mode', category: 'mode' },
  
  // Control
  { phrase: 'hey / pause', description: 'Pause listening', category: 'control' },
  { phrase: 'resume', description: 'Resume listening', category: 'control' },
  { phrase: 'help', description: 'Get help', category: 'control' },
];

const VoiceCommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', 'navigation', 'action', 'mode', 'control'];
  const filteredCommands = filter === 'all' 
    ? COMMANDS 
    : COMMANDS.filter(c => c.category === filter);

  const categoryColors: Record<string, string> = {
    navigation: '#4CAF50',
    action: '#2196F3',
    mode: '#9C27B0',
    control: '#FF9800'
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          padding: '10px 16px',
          background: 'rgba(30,30,30,0.9)',
          color: '#888',
          border: '1px solid #555',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.85em',
          zIndex: 9998
        }}
      >
        💡 Voice Commands
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '320px',
      maxHeight: '400px',
      background: 'rgba(20,20,20,0.98)',
      borderRadius: '16px',
      border: '1px solid #444',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 9998,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#fff', fontWeight: 600 }}>💡 Voice Commands</span>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '1.2em'
          }}
        >
          ×
        </button>
      </div>

      {/* Category Filter */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #333',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '4px 10px',
              background: filter === cat ? '#B8860B' : 'rgba(255,255,255,0.1)',
              color: filter === cat ? '#000' : '#888',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.75em',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Commands List */}
      <div style={{
        maxHeight: '280px',
        overflowY: 'auto',
        padding: '8px'
      }}>
        {filteredCommands.map((cmd, i) => (
          <div
            key={i}
            onClick={() => speak(`Try saying: ${cmd.phrase}`)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              marginBottom: '4px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px'
            }}>
              <span style={{
                padding: '2px 8px',
                background: categoryColors[cmd.category],
                color: '#000',
                borderRadius: '8px',
                fontSize: '0.7em',
                fontWeight: 600
              }}>
                {cmd.phrase}
              </span>
            </div>
            <div style={{ color: '#888', fontSize: '0.8em' }}>
              {cmd.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceCommandPalette;
EOF
echo "✅ VoiceCommandPalette.tsx created"

# ═══════════════════════════════════════════════════════════════════════════════
# Update agentic index to export new components
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Updating agentic/index.ts..."

cat > "$W/src/agentic/index.ts" << 'EOF'
// Agentic Module - Complete Exports
export { voiceBrain, extractDigits, formatPhone, type AudioState, type VoiceMode } from './VoiceBrain';
export { handleNavigation, initWalkAndClick } from './WalkAndClick';
export { 
  default as AgenticBar,
  useVoice,
  speak,
  onDigits,
  onCommand,
  startListening,
  stopListening,
  setContext,
  setMode
} from './AgenticBar';
export { default as Teleprompter } from './Teleprompter';
export { default as StatusIndicator } from './StatusIndicator';
export { default as VoiceCommandPalette } from './VoiceCommandPalette';
EOF
echo "✅ agentic/index.ts updated"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  PART 5 COMPLETE"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  Created:"
echo "    ✅ Teleprompter.tsx       - Real-time speech display"
echo "    ✅ StatusIndicator.tsx    - Visual audio state indicator"
echo "    ✅ VoiceCommandPalette.tsx - Quick command reference"
echo "  Backup: $BK"
echo "═══════════════════════════════════════════════════════════════════════════════"
