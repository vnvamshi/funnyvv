/**
 * AgentKOverlay.tsx
 * 
 * GLOBAL OVERLAY - This component wraps your ENTIRE APP and provides:
 * 1. GLB Avatar cursor that follows mouse (wiggly animation)
 * 2. Welcome greeting on page load
 * 3. Voice-enabled floating Ask Anything button
 * 4. Speech-to-Text and Text-to-Speech
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Speech Recognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const speechSynthesis = window.speechSynthesis;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AgentKOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Avatar cursor state
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isWiggling, setIsWiggling] = useState(true);
  
  // Chat state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // AVATAR CURSOR - Follows mouse with wiggly animation
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Wiggle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsWiggling(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-GREETING - Speaks "Welcome to VistaView" on first load
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (!hasGreeted) {
      const timer = setTimeout(() => {
        speak("Welcome to VistaView! I'm AgentK, your AI assistant. Click on me or the Ask Anything button to get started!");
        setHasGreeted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasGreeted]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION SETUP
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal) {
          handleUserMessage(text);
          setTranscript('');
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // SPEECH FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const speak = useCallback((text: string) => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      speechSynthesis?.cancel();
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AI RESPONSE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const getAIResponse = async (query: string): Promise<string> => {
    const q = query.toLowerCase();
    
    // Intent detection
    if (q.includes('hodgins') || q.includes('173') || q.includes('lot')) {
      return "V2 Exclusive at Hodgins features 173 acres in Van Alstyne, Texas! We have 113 estate lots at $300,000 each, plus amazing amenities including 5 tennis courts, 5 basketball courts, 2 resort pools, and 3.2 miles of walking trails. Would you like to see available lots?";
    }
    if (q.includes('propert') || q.includes('home') || q.includes('house') || q.includes('real estate')) {
      return "We have beautiful luxury properties available! You can browse our properties in the Real Estate section. Would you like me to show you featured homes?";
    }
    if (q.includes('product') || q.includes('furniture') || q.includes('catalog') || q.includes('shop')) {
      return "Our product catalog has premium furniture, flooring, lighting, and home essentials. Click on any product to see details and hear descriptions. What category interests you?";
    }
    if (q.includes('vendor') || q.includes('upload') || q.includes('sell')) {
      return "As a vendor, you can upload your product catalog! Sign in with vendor1/vendor123 to access the vendor portal and upload your products.";
    }
    if (q.includes('builder')) {
      return "Builders can manage projects and portfolios! Sign in with builder1/builder123 to access the builder dashboard.";
    }
    if (q.includes('sign') || q.includes('login') || q.includes('account')) {
      return "You can sign in with different roles: vendor1/vendor123 for vendors, builder1/builder123 for builders, agent1/agent123 for agents, or user1/user123 as a customer!";
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return "Hello! Welcome to VistaView - the World's First Real Estate Intelligence Platform! I can help you explore properties, lots, products, and more. What would you like to know?";
    }
    if (q.includes('help') || q.includes('what can')) {
      return "I can help you with: browsing properties, exploring V2 Hodgins 173 acres, shopping products, vendor and builder information, and much more! Just ask me anything!";
    }
    
    // Try Ollama
    try {
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `You are AgentK, VistaView's friendly AI assistant. Keep responses brief (2-3 sentences). User: ${query}`,
          stream: false
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.response || "I'd be happy to help! What would you like to know about VistaView?";
      }
    } catch (e) { /* Ollama not available */ }
    
    return `I understand you're asking about "${query}". Let me help you with that! You can explore our properties, products, or V2 Hodgins lots. What interests you most?`;
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    
    const response = await getAIResponse(text);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    speak(response);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value;
    if (value) {
      handleUserMessage(value);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  
  return (
    <>
      {/* Your app content */}
      {children}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ANIMATED AVATAR CURSOR - Follows mouse */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          left: cursorPos.x + 15,
          top: cursorPos.y + 15,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #003B32 0%, #005544 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9998,
          pointerEvents: 'auto',
          boxShadow: '0 4px 15px rgba(0,59,50,0.4)',
          transform: isWiggling ? 'rotate(-5deg) scale(1.1)' : 'rotate(5deg) scale(1)',
          transition: 'transform 0.3s ease',
          animation: isSpeaking ? 'pulse 0.5s infinite' : 'none',
        }}
      >
        <span style={{ fontSize: '24px' }}>{isSpeaking ? '🗣️' : isListening ? '👂' : '🤖'}</span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FLOATING ASK ANYTHING BUTTON - Enhanced */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '15px 25px',
            background: 'linear-gradient(135deg, #003B32 0%, #005544 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,59,50,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🎙️</span>
          Ask Anything
          <span style={{ 
            width: '10px', 
            height: '10px', 
            background: '#4ade80', 
            borderRadius: '50%',
            animation: 'pulse 1s infinite'
          }}></span>
        </button>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CHAT MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            margin: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #003B32 0%, #005544 100%)',
              color: 'white',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    animation: isSpeaking ? 'pulse 0.5s infinite' : 'none',
                  }}>
                    {isSpeaking ? '🗣️' : isListening ? '👂' : '🤖'}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>AgentK AI Assistant</h2>
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                      {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '● Online - Voice Enabled'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '18px',
                }}>✕</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              background: '#f9fafb',
            }}>
              {messages.length === 0 && (
                <div style={{
                  padding: '20px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                  <p style={{ margin: 0, color: '#003B32', fontWeight: 'bold' }}>Welcome to VistaView! 🏠</p>
                  <p style={{ margin: '10px 0 0', color: '#666', fontSize: '14px' }}>
                    I can help you with properties, V2 Hodgins lots, products, and more. 
                    Tap the microphone to speak or type below!
                  </p>
                  <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Show properties', 'V2 Hodgins lots', 'Browse products', 'How to sign in?'].map(q => (
                      <button key={q} onClick={() => handleUserMessage(q)} style={{
                        padding: '8px 12px',
                        background: '#e5e7eb',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: '12px',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>
                  <div style={{
                    display: 'inline-block',
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? '#003B32' : 'white',
                    color: msg.role === 'user' ? 'white' : '#333',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {transcript && (
                <div style={{ textAlign: 'right', marginBottom: '12px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    background: '#e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: '#666',
                  }}>{transcript}...</div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '15px', borderTop: '1px solid #e5e7eb', background: 'white' }}>
              {/* Voice Button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <button
                  onClick={isListening ? stopListening : startListening}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isListening ? '#ef4444' : '#003B32',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '24px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transform: isListening ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  🎤
                </button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', margin: '0 0 10px' }}>
                {isListening ? 'Listening... tap to stop' : 'Tap microphone to speak'}
              </p>
              
              {/* Text Input */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Or type your message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '25px',
                    outline: 'none',
                  }}
                />
                <button type="submit" style={{
                  padding: '12px 20px',
                  background: '#003B32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                }}>Send</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </>
  );
};

export default AgentKOverlay;
