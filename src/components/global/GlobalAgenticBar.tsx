// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL AGENTIC BAR - Floating voice bar visible on ALL pages
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { useVoice, speak, startListening, stopListening } from '../../agentic';

const GlobalAgenticBar: React.FC = () => {
  const voice = useVoice();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  // Track page changes
  useEffect(() => {
    const updatePage = () => {
      const path = window.location.pathname;
      const pageMap: Record<string, string> = {
        '/': 'Home',
        '/about': 'About',
        '/products': 'Products',
        '/how-it-works': 'How It Works',
        '/partners': 'Partners',
        '/skyven': 'Skyven Building',
        '/real-estate': 'Real Estate'
      };
      setCurrentPage(pageMap[path] || 'VistaView');
      voice.setContext(pageMap[path] || 'VistaView');
    };

    updatePage();
    window.addEventListener('popstate', updatePage);
    
    // Also check on interval for SPA navigation
    const interval = setInterval(updatePage, 1000);
    
    return () => {
      window.removeEventListener('popstate', updatePage);
      clearInterval(interval);
    };
  }, [voice]);

  const statusColor = voice.isSpeaking ? '#FFD700' : voice.isListening ? '#4CAF50' : voice.isPaused ? '#FF9800' : '#666';

  // Minimized state - just a floating button
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${statusColor}, ${statusColor}aa)`,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6em',
          animation: voice.isListening ? 'globalPulse 2s infinite' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {voice.isSpeaking ? '🔊' : voice.isListening ? '🎤' : '🤖'}
        <style>{`
          @keyframes globalPulse {
            0%, 100% { box-shadow: 0 4px 24px rgba(76,175,80,0.4); transform: scale(1); }
            50% { box-shadow: 0 4px 36px rgba(76,175,80,0.7); transform: scale(1.05); }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: isExpanded ? '360px' : '280px',
      background: 'linear-gradient(135deg, rgba(18,18,18,0.97), rgba(28,28,28,0.98))',
      borderRadius: '20px',
      border: `2px solid ${statusColor}`,
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      zIndex: 99999,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: `linear-gradient(90deg, ${statusColor}20, transparent)`,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: statusColor,
            boxShadow: `0 0 8px ${statusColor}`,
            animation: voice.isListening ? 'statusPulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9em' }}>
            Mr. V
          </span>
          <span style={{ color: '#666', fontSize: '0.75em' }}>
            • {currentPage}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '0.9em'
            }}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '0.9em'
            }}
          >
            −
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px' }}>
        {/* Transcript */}
        {(voice.transcript || voice.interim) && (
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '10px 12px',
            borderRadius: '10px',
            marginBottom: '12px',
            border: `1px solid ${voice.interim ? '#555' : '#4CAF50'}40`
          }}>
            <div style={{ 
              color: voice.interim ? '#888' : '#4CAF50', 
              fontSize: '0.65em', 
              marginBottom: '4px',
              fontWeight: 600 
            }}>
              {voice.interim ? '🎤 HEARING...' : '✓ HEARD'}
            </div>
            <div style={{ 
              color: '#fff', 
              fontSize: '0.9em',
              opacity: voice.interim ? 0.7 : 1,
              fontStyle: voice.interim ? 'italic' : 'normal'
            }}>
              "{voice.interim || voice.transcript}"
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => voice.isListening ? stopListening() : startListening()}
            style={{
              padding: '8px 14px',
              background: voice.isListening ? '#4CAF50' : 'rgba(255,255,255,0.1)',
              color: voice.isListening ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.85em',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            🎤 {voice.isListening ? 'Stop' : 'Listen'}
          </button>
          
          <button
            onClick={() => speak('Hello! I am Mr. V. How can I help you today?')}
            style={{
              padding: '8px 14px',
              background: voice.isSpeaking ? '#FFD700' : 'rgba(255,255,255,0.1)',
              color: voice.isSpeaking ? '#000' : '#aaa',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.85em',
              fontWeight: 600
            }}
          >
            🔊 Speak
          </button>

          {isExpanded && (
            <>
              <button
                onClick={() => voice.isPaused ? voice.resume() : voice.pause()}
                style={{
                  padding: '8px 14px',
                  background: voice.isPaused ? '#FF9800' : 'rgba(255,255,255,0.1)',
                  color: voice.isPaused ? '#fff' : '#aaa',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                {voice.isPaused ? '▶️' : '⏸️'}
              </button>
              
              <button
                onClick={() => speak('Try saying: sign in, go to products, or help.')}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(33,150,243,0.2)',
                  color: '#2196F3',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                ❓ Help
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {voice.error && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: 'rgba(244,67,54,0.15)',
            borderRadius: '8px',
            color: '#f44336',
            fontSize: '0.8em'
          }}>
            ⚠️ {voice.error}
          </div>
        )}
      </div>

      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default GlobalAgenticBar;
