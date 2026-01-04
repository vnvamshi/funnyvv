// ═══════════════════════════════════════════════════════════════════════════════
// TELEPROMPTER - Shows what Mr. V is saying in real-time
// Like a call center agent reading script
// ═══════════════════════════════════════════════════════════════════════════════

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
  const [text, setText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const charIndex = useRef(0);
  const animationFrame = useRef<number>();

  // Intercept speak calls to get text
  useEffect(() => {
    const originalSpeak = voiceBrain.speak.bind(voiceBrain);
    
    voiceBrain.speak = (newText: string, onDone?: () => void) => {
      if (newText) {
        setText(newText);
        setDisplayText('');
        setIsVisible(true);
        charIndex.current = 0;
      }
      
      originalSpeak(newText, () => {
        setTimeout(() => setIsVisible(false), 1500);
        onDone?.();
      });
    };

    return () => {
      voiceBrain.speak = originalSpeak;
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!text || !isVisible) return;

    const animate = () => {
      if (charIndex.current < text.length) {
        setDisplayText(text.slice(0, charIndex.current + 1));
        charIndex.current++;
        animationFrame.current = requestAnimationFrame(() => {
          setTimeout(animate, 25);
        });
      }
    };

    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [text, isVisible]);

  if (!isVisible || !displayText) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: '100px', left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: '120px', left: '50%', transform: 'translateX(-50%)' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };

  const styleVariants: Record<string, React.CSSProperties> = {
    minimal: {
      background: 'rgba(0,0,0,0.8)',
      padding: '12px 24px',
      borderRadius: '24px',
      maxWidth: '500px'
    },
    full: {
      background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(40,40,40,0.95))',
      padding: '20px 28px',
      borderRadius: '16px',
      border: '2px solid #B8860B',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      maxWidth: '550px'
    },
    caption: {
      background: 'rgba(0,0,0,0.9)',
      padding: '14px 20px',
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
      animation: 'teleprompterFadeIn 0.3s ease'
    }}>
      {style === 'full' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <span style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #B8860B, #DAA520)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3em'
          }}>
            🤖
          </span>
          <div>
            <div style={{ color: '#B8860B', fontWeight: 700 }}>Mr. V</div>
            <div style={{ color: '#666', fontSize: '0.75em' }}>Speaking...</div>
          </div>
          <span style={{
            marginLeft: 'auto',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#4CAF50',
            animation: 'teleprompterPulse 1s infinite'
          }} />
        </div>
      )}
      
      <div style={{
        color: '#fff',
        fontSize: style === 'caption' ? '1.1em' : '1.25em',
        lineHeight: 1.5,
        textAlign: style === 'caption' ? 'center' : 'left'
      }}>
        {displayText}
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '1.1em',
          background: '#B8860B',
          marginLeft: '3px',
          animation: 'teleprompterCursor 0.5s infinite'
        }} />
      </div>

      <style>{`
        @keyframes teleprompterFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes teleprompterPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes teleprompterCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Teleprompter;
