#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# PART 4: AgenticBar on ALL Main Pages
# VISTAVIEW_AGENTIC_STANDARD_V1 Compliant
# ═══════════════════════════════════════════════════════════════════════════════

W="/Users/vistaview/vistaview_WORKING"
TS=$(date -u +%Y%m%d_%H%M%S)
BK="/Users/vistaview/vistaview_BACKUPS/$TS"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  PART 4: AgenticBar on ALL Main Pages"
echo "  Timestamp: $TS"
echo "═══════════════════════════════════════════════════════════════════════════════"

# BACKUP
mkdir -p "$BK"
cp -r "$W/src/components" "$BK/" 2>/dev/null
cp -r "$W/src/pages" "$BK/" 2>/dev/null
echo "✅ Backup: $BK"

# ═══════════════════════════════════════════════════════════════════════════════
# Create Global Floating AgenticBar Component
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Creating GlobalAgenticBar.tsx..."

mkdir -p "$W/src/components/global"

cat > "$W/src/components/global/GlobalAgenticBar.tsx" << 'EOF'
// GlobalAgenticBar.tsx - Floating Agentic Bar visible on ALL pages
import React, { useState, useEffect } from 'react';
import { useVoice, speak, startListening, stopListening, setContext } from '../../agentic';
import { useLocation } from 'react-router-dom';

const GlobalAgenticBar: React.FC = () => {
  const voice = useVoice();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Try to get location if react-router is available
  let pathname = '/';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (e) {
    pathname = window.location.pathname;
  }

  // Update context when route changes
  useEffect(() => {
    const contextMap: Record<string, string> = {
      '/': 'Home',
      '/about': 'About Us',
      '/how-it-works': 'How It Works',
      '/partners': 'Our Partners',
      '/lend': 'Lending',
      '/products': 'Products',
      '/real-estate': 'Real Estate',
      '/skyven': 'Skyven GLB Viewer'
    };
    setContext(contextMap[pathname] || 'VistaView');
  }, [pathname]);

  const statusColor = voice.isSpeaking ? '#FFD700' : voice.isListening ? '#4CAF50' : voice.isPaused ? '#FF9800' : '#666';

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${statusColor}, ${statusColor}88)`,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5em',
          animation: voice.isListening ? 'pulse-glow 2s infinite' : 'none'
        }}
      >
        {voice.isSpeaking ? '🔊' : voice.isListening ? '🎤' : '🤖'}
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 4px 20px rgba(76,175,80,0.3); }
            50% { box-shadow: 0 4px 30px rgba(76,175,80,0.6); }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: isExpanded ? '380px' : '280px',
      background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(30,30,30,0.98))',
      borderRadius: '20px',
      border: `2px solid ${statusColor}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 9999,
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: `linear-gradient(90deg, ${statusColor}22, transparent)`,
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
            animation: voice.isListening ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9em' }}>
            Mr. V {voice.isSpeaking ? '🔊' : voice.isListening ? '🎤' : ''}
          </span>
          <span style={{ color: '#666', fontSize: '0.75em' }}>
            • {voice.context || 'Ready'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '1em'
            }}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '1em'
            }}
          >
            _
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 16px' }}>
        {/* Transcript */}
        {voice.transcript && (
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px 12px',
            borderRadius: '10px',
            marginBottom: '12px',
            border: '1px solid rgba(76,175,80,0.3)'
          }}>
            <div style={{ color: '#4CAF50', fontSize: '0.7em', marginBottom: '4px' }}>HEARD</div>
            <div style={{ color: '#fff', fontSize: '0.95em' }}>"{voice.transcript}"</div>
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
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '0.85em',
              fontWeight: 600
            }}
          >
            {voice.isListening ? '🎤 Stop' : '🎤 Listen'}
          </button>
          <button
            onClick={() => speak('Hello! I am Mr. V. How can I help you navigate VistaView today?')}
            style={{
              padding: '8px 14px',
              background: voice.isSpeaking ? '#FFD700' : 'rgba(255,255,255,0.1)',
              color: voice.isSpeaking ? '#000' : '#aaa',
              border: 'none',
              borderRadius: '16px',
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
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                {voice.isPaused ? '▶' : '⏸'}
              </button>
              <button
                onClick={() => speak('Try saying: sign in, go to products, or help.')}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(33,150,243,0.2)',
                  color: '#2196F3',
                  border: 'none',
                  borderRadius: '16px',
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
            fontSize: '0.85em'
          }}>
            ⚠️ {voice.error}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default GlobalAgenticBar;
EOF
echo "✅ GlobalAgenticBar.tsx created"

# ═══════════════════════════════════════════════════════════════════════════════
# Create App wrapper with GlobalAgenticBar
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Creating AgenticProvider.tsx..."

cat > "$W/src/components/global/AgenticProvider.tsx" << 'EOF'
// AgenticProvider.tsx - Wraps app to provide global agentic bar
import React, { useEffect } from 'react';
import GlobalAgenticBar from './GlobalAgenticBar';
import { initWalkAndClick } from '../../agentic';

interface Props {
  children: React.ReactNode;
}

const AgenticProvider: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    // Initialize walk and click on mount
    initWalkAndClick();
    console.log('[AgenticProvider] Initialized');
  }, []);

  return (
    <>
      {children}
      <GlobalAgenticBar />
    </>
  );
};

export default AgenticProvider;
EOF
echo "✅ AgenticProvider.tsx created"

# ═══════════════════════════════════════════════════════════════════════════════
# Create global index
# ═══════════════════════════════════════════════════════════════════════════════
cat > "$W/src/components/global/index.ts" << 'EOF'
export { default as GlobalAgenticBar } from './GlobalAgenticBar';
export { default as AgenticProvider } from './AgenticProvider';
EOF
echo "✅ global/index.ts created"

# ═══════════════════════════════════════════════════════════════════════════════
# Create instruction file for integrating into main App
# ═══════════════════════════════════════════════════════════════════════════════
cat > "$W/AGENTIC_INTEGRATION.md" << 'EOF'
# Agentic Bar Integration Guide

## To add GlobalAgenticBar to your app:

### Option 1: Wrap your App component

```tsx
// In main.tsx or App.tsx
import { AgenticProvider } from './components/global';

function App() {
  return (
    <AgenticProvider>
      {/* Your existing app content */}
      <Router>
        <Routes>
          ...
        </Routes>
      </Router>
    </AgenticProvider>
  );
}
```

### Option 2: Add GlobalAgenticBar directly

```tsx
// At the end of your App component
import { GlobalAgenticBar } from './components/global';

function App() {
  return (
    <>
      {/* Your existing app content */}
      <GlobalAgenticBar />
    </>
  );
}
```

## Voice Commands Available:
- "sign in" / "login" - Opens sign in
- "vendor" / "I'm a vendor" - Vendor flow
- "back" / "go back" - Navigate back
- "close" / "cancel" - Close modal
- "hey" / "pause" - Pause listening
- "resume" / "continue" - Resume listening
- "help" - Get help
EOF
echo "✅ AGENTIC_INTEGRATION.md created"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  PART 4 COMPLETE"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  Created:"
echo "    ✅ GlobalAgenticBar.tsx  - Floating bar for all pages"
echo "    ✅ AgenticProvider.tsx   - App wrapper"
echo "    ✅ AGENTIC_INTEGRATION.md - Integration guide"
echo "  Backup: $BK"
echo "═══════════════════════════════════════════════════════════════════════════════"
