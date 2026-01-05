import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  phone: string;
  onChange: (p: string) => void;
  onNext: () => void;
  speak: (t: string) => void;
}

const THEME = { primary: '#1e3a5f', accent: '#f59e0b' };

const BuilderPhone: React.FC<Props> = ({ phone, onChange, onNext, speak }) => {
  const [localPhone, setLocalPhone] = useState(phone);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastHeard, setLastHeard] = useState('');
  const [filling, setFilling] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message
  useEffect(() => {
    speak("Welcome builder! Please enter your phone number or say it aloud.");
    // Auto-start listening
    setTimeout(() => startListening(), 1000);
  }, []);

  // Voice recognition setup
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
        
        if (event.results[event.resultIndex].isFinal) {
          setLastHeard(text);
          processVoice(text);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current?.start();
      };
    }
    
    return () => recognitionRef.current?.stop();
  }, [isListening]);

  const startListening = () => {
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (e) {}
  };

  const processVoice = useCallback(async (text: string) => {
    // Convert words to digits
    const numberWords: Record<string, string> = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'oh': '0'
    };
    
    let processed = text.toLowerCase();
    for (const [word, digit] of Object.entries(numberWords)) {
      processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    }
    
    const digits = processed.replace(/\D/g, '');
    
    if (digits.length > 0) {
      // Typewriter effect
      setFilling(true);
      inputRef.current?.focus();
      
      const newPhone = (localPhone + digits).slice(0, 10);
      
      for (let i = localPhone.length; i <= newPhone.length; i++) {
        await new Promise(r => setTimeout(r, 80));
        setLocalPhone(newPhone.substring(0, i));
        onChange(newPhone.substring(0, i));
      }
      
      setFilling(false);
      
      if (newPhone.length === 10) {
        speak("Phone number complete! Click Send OTP to continue.");
      }
    }
    
    // Voice commands
    const lower = text.toLowerCase();
    if (lower.includes('next') || lower.includes('send') || lower.includes('continue')) {
      if (localPhone.length === 10) {
        onNext();
      }
    }
    if (lower.includes('clear') || lower.includes('reset')) {
      setLocalPhone('');
      onChange('');
      speak("Cleared. Please say your phone number.");
    }
  }, [localPhone, onChange, speak, onNext]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startListening();
    }
  };

  const formatPhone = (p: string) => {
    if (p.length <= 3) return p;
    if (p.length <= 6) return `${p.slice(0,3)}-${p.slice(3)}`;
    return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`;
  };

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setLocalPhone(digits);
    onChange(digits);
  };

  const isValid = localPhone.length === 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '3em' }}>🏗️</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Builder Phone Number</h3>
        <p style={{ color: '#888', fontSize: '0.9em' }}>Say your digits: "seven zero three..."</p>
      </div>

      {/* Phone Input */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#888', fontSize: '1.2em' }}>+1</span>
        <input
          ref={inputRef}
          id="builder-phone-input"
          type="tel"
          value={formatPhone(localPhone)}
          onChange={e => handleChange(e.target.value)}
          placeholder="000-000-0000"
          className={filling ? 'vv-filling' : ''}
          style={{
            padding: '16px 20px',
            fontSize: '1.5em',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.3)',
            border: `2px solid ${filling ? '#06b6d4' : isValid ? '#10b981' : THEME.accent}40`,
            borderRadius: 12,
            color: '#fff',
            textAlign: 'center',
            width: 220,
            outline: 'none',
            transition: 'all 0.3s',
            boxShadow: filling ? '0 0 20px rgba(6, 182, 212, 0.3)' : 'none'
          }}
        />
      </div>

      {/* Send OTP Button */}
      <button
        onClick={onNext}
        disabled={!isValid}
        style={{
          padding: '14px 40px',
          background: isValid ? THEME.accent : 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 30,
          color: isValid ? '#000' : '#666',
          fontSize: '1em',
          fontWeight: 600,
          cursor: isValid ? 'pointer' : 'not-allowed',
          alignSelf: 'center'
        }}
      >
        Send OTP →
      </button>

      {/* AgenticBar */}
      <div style={{
        marginTop: 10,
        padding: 16,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}`
      }}>
        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isListening ? '#10b981' : '#64748b',
            animation: isListening ? 'pulse 1s infinite' : 'none'
          }} />
          <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>
            🎤 {isListening ? 'LISTENING' : 'READY'}
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.75em',
            padding: '2px 8px',
            borderRadius: 10,
            background: 'rgba(6, 182, 212, 0.2)',
            color: '#06b6d4'
          }}>
            LIVE
          </span>
        </div>

        {/* Waveform */}
        {isListening && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 25, alignItems: 'center', marginBottom: 10 }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  background: 'linear-gradient(to top, #10b981, #06b6d4)',
                  borderRadius: 2,
                  animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`,
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
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 10,
            textAlign: 'center'
          }}>
            <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>⚡ Filling phone number...</span>
          </div>
        )}

        {/* Transcript */}
        {(transcript || lastHeard) && (
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 12
          }}>
            <span style={{ color: '#10b981', fontSize: '0.75em' }}>✓ HEARD</span>
            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: '0.95em' }}>
              "{transcript || lastHeard}"
            </p>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button
            onClick={toggleListening}
            style={{
              padding: '10px 24px',
              borderRadius: 25,
              border: 'none',
              background: isListening ? '#ef4444' : '#10b981',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isListening ? '⏹️ Stop' : '🎤 Listen'}
          </button>
          
          <button
            onClick={() => speak("Say your phone number digit by digit, like seven zero three.")}
            style={{
              padding: '10px 24px',
              borderRadius: 25,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
          >
            🔊 Help
          </button>
        </div>

        {/* Hint */}
        <p style={{ color: '#64748b', fontSize: '0.75em', textAlign: 'center', margin: '12px 0 0' }}>
          💡 Say: "seven zero three five five five one two three four" • "clear" to reset • "next" when done
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes wave { from { height: 6px; } to { height: 20px; } }
        .vv-filling { border-color: #06b6d4 !important; box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2) !important; }
      `}</style>
    </div>
  );
};

export default BuilderPhone;
