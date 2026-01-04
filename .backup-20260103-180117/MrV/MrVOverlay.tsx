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
  const [teleprompter, setTeleprompter] = useState('Welcome to VistaView! I\'m Mr. V, your AI assistant.');
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({ conversations: 0, patterns: 0, confidence: 94.5 });
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (e: any) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setInput(transcript);
        if (e.results[e.resultIndex].isFinal) {
          processVoice(transcript);
        }
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Text-to-Speech
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

  // Process Voice Command
  const processVoice = async (text: string) => {
    const lower = text.toLowerCase();
    setStats(s => ({ ...s, conversations: s.conversations + 1 }));
    
    // Send to backend
    try {
      const res = await fetch('http://localhost:1117/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command_text: text })
      });
      const data = await res.json();
      if (data.response) {
        speak(data.response);
      }
      if (data.result?.navigate && onNavigate) {
        onNavigate(data.result.navigate);
      }
    } catch (e) {
      // Fallback responses
      if (lower.includes('real estate') || lower.includes('properties')) {
        speak('Opening real estate section.');
        onNavigate?.('/v3/real-estate');
      } else if (lower.includes('catalog') || lower.includes('products')) {
        speak('Opening product catalog.');
        onNavigate?.('/v3/product-catalog');
      } else if (lower.includes('hello') || lower.includes('hi')) {
        speak('Hello! I\'m Mr. V, your AI assistant. I can help you navigate, answer questions, and guide you through VistaView.');
      } else if (lower.includes('status') || lower.includes('ai')) {
        speak(`AI Status: ${stats.conversations} conversations, ${stats.patterns} patterns learned, ${stats.confidence}% confidence.`);
      } else {
        speak('I heard: ' + text + '. How can I help you?');
      }
    }
  };

  // Toggle Listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Pause/Resume
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      speak('I\'m back! How can I help?');
    } else {
      setIsPaused(true);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setTeleprompter('I\'m listening...');
    }
  };

  if (!isOpen) {
    // Floating Button
    return (
      <div 
        onClick={() => { setIsOpen(true); speak('Hello! I\'m Mr. V. How can I help you today?'); }}
        style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          width: 65,
          height: 65,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${D} 0%, #F5EC9B 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(144,94,38,0.4)',
          zIndex: 99999,
          fontSize: 28,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        🎙️
      </div>
    );
  }

  return (
    <>
      {/* AI Training Stats - Left Panel */}
      <div style={{
        position: 'fixed',
        left: 12,
        top: 80,
        zIndex: 99998,
        background: `linear-gradient(145deg, ${G}f8, #005544f8)`,
        color: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        width: 200,
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        fontSize: 12
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
          🧠 AI Training Status
        </div>
        <div style={{ marginBottom: 5 }}>💬 Conversations: {stats.conversations}</div>
        <div style={{ marginBottom: 5 }}>🎯 Patterns: {stats.patterns}</div>
        <div style={{ marginBottom: 5 }}>📊 Tables: 38</div>
        <div style={{ marginBottom: 5 }}>📈 Confidence: {stats.confidence.toFixed(1)}%</div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: 10, opacity: 0.8 }}>
          Learning: Active 24/7
        </div>
      </div>

      {/* Mr. V Panel - Right */}
      <div style={{
        position: 'fixed',
        right: 12,
        top: 80,
        zIndex: 99998,
        background: `linear-gradient(145deg, ${G}f8, #005544f8)`,
        color: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        width: 300,
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 45,
            height: 45,
            borderRadius: '50%',
            background: isPaused ? '#f59e0b' : isSpeaking ? D : isListening ? '#22c55e' : 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22
          }}>
            {isPaused ? '⏸️' : isSpeaking ? '🗣️' : isListening ? '👂' : '🤖'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Mr. V</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              {isPaused ? "I'm listening..." : isSpeaking ? 'Speaking...' : isListening ? '🎤 Listening...' : 'Ready'}
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
          >×</button>
        </div>

        {/* Teleprompter */}
        <div style={{
          fontSize: 13,
          lineHeight: 1.5,
          padding: '12px 0',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          maxHeight: 100,
          overflow: 'auto'
        }}>
          {teleprompter}
        </div>

        {/* Input */}
        <div style={{ marginTop: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && processVoice(input)}
            placeholder="Type or speak..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: 13
            }}
          />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            onClick={togglePause}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 8,
              border: 'none',
              background: isPaused ? '#f59e0b' : 'rgba(255,255,255,0.15)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            onClick={toggleListening}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 8,
              border: 'none',
              background: isListening ? '#22c55e' : D,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            {isListening ? '🎤 Listening...' : '🎙️ Speak'}
          </button>
        </div>
      </div>
    </>
  );
};

export default MrVOverlay;
