import React, { useState, useEffect, useRef } from 'react';

const G = '#003B32';
const D = '#B8860B';

interface MrVOverlayProps {
  onNavigate?: (path: string) => void;
}

const MrVOverlay: React.FC<MrVOverlayProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [teleprompter, setTeleprompter] = useState("Welcome to VistaView! I'm Mr. V, your AI assistant.");
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({ conversations: 0, patterns: 0, confidence: 94.5 });
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // NOTE: Speech recognition is now handled by global VoiceContext
  // This component only handles TTS and UI

  const speak = (text: string, callback?: () => void) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setTeleprompter(text);
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      setIsSpeaking(false);
      callback?.();
    };
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const processCommand = async (text: string) => {
    const lower = text.toLowerCase();
    setStats(s => ({ ...s, conversations: s.conversations + 1 }));
    
    try {
      const res = await fetch('http://localhost:1117/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command_text: text })
      });
      const data = await res.json();
      if (data.response) speak(data.response);
      if (data.result?.navigate && onNavigate) onNavigate(data.result.navigate);
    } catch (e) {
      if (lower.includes('real estate') || lower.includes('properties')) {
        speak('Opening real estate section.');
        onNavigate?.('/v3/real-estate');
      } else if (lower.includes('catalog') || lower.includes('products')) {
        speak('Opening product catalog.');
        onNavigate?.('/v3/product-catalog');
      } else if (lower.includes('hello') || lower.includes('hi')) {
        speak("Hello! I'm Mr. V. How can I help?");
      } else {
        speak('How can I help you with: ' + text + '?');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      processCommand(input.trim());
      setInput('');
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={{ position: 'fixed', bottom: 20, right: 20, width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${G}, #006B5A)`, border: `2px solid ${D}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 9999 }}>
        🤖
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 320, background: `linear-gradient(135deg, ${G}, #001a15)`, borderRadius: 16, border: `2px solid ${D}40`, boxShadow: '0 10px 40px rgba(0,0,0,0.4)', zIndex: 9999, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${D}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${D}, #F5EC9B)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95em' }}>Mr. V</div>
            <div style={{ color: '#888', fontSize: '0.7em' }}>🎤 Listening</div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2em', cursor: 'pointer' }}>✕</button>
      </div>

      {/* Modes */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: `1px solid ${D}20` }}>
        {['Interactive', 'Talkative', 'Text'].map(m => (
          <button key={m} style={{ flex: 1, padding: '6px 10px', borderRadius: 12, border: 'none', background: m === 'Interactive' ? D : 'rgba(255,255,255,0.08)', color: m === 'Interactive' ? '#000' : '#888', fontSize: '0.7em', cursor: 'pointer' }}>
            {m === 'Interactive' ? '🎤' : m === 'Talkative' ? '💬' : '📝'} {m}
          </button>
        ))}
      </div>

      {/* Teleprompter */}
      <div style={{ padding: 16 }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 12, minHeight: 60 }}>
          <div style={{ color: '#888', fontSize: '0.7em', marginBottom: 4 }}>● MR. V:</div>
          <p style={{ color: '#F5EC9B', margin: 0, fontSize: '0.85em', lineHeight: 1.5 }}>{teleprompter}</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
        {isSpeaking && (
          <button onClick={stopSpeaking} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>⏸️ Pause</button>
        )}
        <button style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>🎤 On</button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type or speak..." style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: `1px solid ${D}40`, background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85em', outline: 'none' }} />
        <button type="submit" style={{ padding: '10px 16px', borderRadius: 20, border: 'none', background: input.trim() ? D : 'rgba(255,255,255,0.1)', color: input.trim() ? '#000' : '#666', cursor: input.trim() ? 'pointer' : 'default' }}>Send</button>
      </form>

      {/* Hints */}
      <div style={{ padding: '8px 16px 12px', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
        <span style={{ color: '#555', fontSize: '0.65em' }}>Say "Hey" to pause • "About us" • "Real estate" • "Sign in" • "Go back"</span>
      </div>
    </div>
  );
};

export default MrVOverlay;
