#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# UNIFIED AGENTIC BAR - One voice, one brain, everywhere
# 
# Problem: Multiple voice instances fighting each other
# Solution: ONE global voice service, UI just displays state
# ═══════════════════════════════════════════════════════════════════════════════

WORKING_DIR="/Users/vistaview/vistaview_WORKING"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  UNIFIED AGENTIC BAR"
echo "═══════════════════════════════════════════════════════════════════════════════"

# Backup
BACKUP_DIR="/Users/vistaview/vistaview_BACKUPS/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$WORKING_DIR/src/hooks" "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$WORKING_DIR/src/components/signin/vendor" "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup: $BACKUP_DIR"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: Create Voice Service (Singleton - only ONE instance ever)
# ═══════════════════════════════════════════════════════════════════════════════

mkdir -p "$WORKING_DIR/src/services"

cat > "$WORKING_DIR/src/services/voiceService.ts" << 'SVCEOF'
// ═══════════════════════════════════════════════════════════════════════════════
// VOICE SERVICE - SINGLETON
// Only ONE instance of speech recognition/synthesis for the entire app
// All components subscribe to state changes, don't create their own
// ═══════════════════════════════════════════════════════════════════════════════

type VoiceState = 'IDLE' | 'LISTENING' | 'SPEAKING' | 'PAUSED';
type Listener = (state: VoiceServiceState) => void;

interface VoiceServiceState {
  state: VoiceState;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

// Word to digit mapping
const W2D: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3',
  'four': '4', 'for': '4',
  'five': '5', 'six': '6', 'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9', 'nein': '9'
};

export function extractDigits(text: string): string {
  const words = text.toLowerCase().split(/\s+/);
  let digits = '';
  for (const w of words) {
    if (W2D[w]) digits += W2D[w];
    else if (/^\d$/.test(w)) digits += w;
  }
  const raw = text.replace(/\D/g, '');
  return digits.length >= raw.length ? digits : raw;
}

export function formatPhone(d: string): string {
  const c = d.replace(/\D/g, '').slice(0, 10);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0,3)}-${c.slice(3)}`;
  return `${c.slice(0,3)}-${c.slice(3,6)}-${c.slice(6)}`;
}

class VoiceService {
  private static instance: VoiceService | null = null;
  
  private recognition: SpeechRecognition | null = null;
  private synth: SpeechSynthesis | null = null;
  private listeners: Set<Listener> = new Set();
  private digitHandlers: Set<(digits: string) => void> = new Set();
  private commandHandlers: Set<(cmd: string) => void> = new Set();
  
  private currentState: VoiceServiceState = {
    state: 'IDLE',
    transcript: '',
    interimTranscript: '',
    error: null
  };
  
  private shouldRestart = false;
  private isInitialized = false;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }
  
  init(): void {
    if (this.isInitialized) {
      console.log('[VoiceService] Already initialized');
      return;
    }
    
    console.log('[VoiceService] Initializing...');
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      this.updateState({ error: 'Speech not supported. Use Chrome.' });
      console.error('[VoiceService] Speech Recognition not supported');
      return;
    }
    
    this.synth = window.speechSynthesis;
    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.recognition.onstart = () => {
      console.log('[VoiceService] ✅ LISTENING');
      this.updateState({ state: 'LISTENING', error: null });
    };
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      const isFinal = result.isFinal;
      
      console.log(`[VoiceService] Heard: "${text}" (final: ${isFinal})`);
      
      if (isFinal) {
        this.updateState({ transcript: text, interimTranscript: '' });
        
        // Extract and dispatch digits
        const digits = extractDigits(text);
        if (digits) {
          console.log('[VoiceService] Digits:', digits);
          this.digitHandlers.forEach(h => h(digits));
        }
        
        // Dispatch command
        this.commandHandlers.forEach(h => h(text.toLowerCase()));
      } else {
        this.updateState({ interimTranscript: text });
      }
    };
    
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[VoiceService] Error:', event.error);
      if (event.error === 'not-allowed') {
        this.updateState({ state: 'IDLE', error: 'Mic blocked. Click 🔒 → Allow' });
        this.shouldRestart = false;
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        this.updateState({ error: event.error });
      }
    };
    
    this.recognition.onend = () => {
      console.log('[VoiceService] Ended, shouldRestart:', this.shouldRestart);
      if (this.shouldRestart && this.currentState.state !== 'SPEAKING') {
        setTimeout(() => this.startListening(), 100);
      } else if (this.currentState.state !== 'SPEAKING') {
        this.updateState({ state: 'IDLE' });
      }
    };
    
    this.isInitialized = true;
    console.log('[VoiceService] ✅ Initialized');
  }
  
  private updateState(partial: Partial<VoiceServiceState>): void {
    this.currentState = { ...this.currentState, ...partial };
    this.listeners.forEach(l => l(this.currentState));
  }
  
  getState(): VoiceServiceState {
    return this.currentState;
  }
  
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }
  
  onDigits(handler: (digits: string) => void): () => void {
    this.digitHandlers.add(handler);
    return () => this.digitHandlers.delete(handler);
  }
  
  onCommand(handler: (cmd: string) => void): () => void {
    this.commandHandlers.add(handler);
    return () => this.commandHandlers.delete(handler);
  }
  
  startListening(): void {
    if (!this.recognition) {
      this.init();
      if (!this.recognition) return;
    }
    
    // Don't start if speaking
    if (this.currentState.state === 'SPEAKING') {
      console.log('[VoiceService] Cannot start while speaking');
      return;
    }
    
    this.shouldRestart = true;
    try {
      this.recognition.start();
    } catch (e) {
      // Already started, ignore
    }
  }
  
  stopListening(): void {
    this.shouldRestart = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.updateState({ state: 'IDLE' });
  }
  
  speak(text: string, onDone?: () => void): void {
    if (!text || !this.synth) {
      onDone?.();
      return;
    }
    
    console.log('[VoiceService] 🔊 Speaking:', text);
    
    // Stop listening while speaking (Audio Mutex)
    const wasListening = this.shouldRestart;
    this.shouldRestart = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    
    this.synth.cancel();
    this.updateState({ state: 'SPEAKING' });
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get best voice
    const voices = this.synth.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) ||
                  voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                  voices.find(v => v.lang.startsWith('en-US'));
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => {
      console.log('[VoiceService] Speech ended');
      this.updateState({ state: 'IDLE' });
      onDone?.();
      
      // Resume listening if was listening before
      if (wasListening) {
        this.shouldRestart = true;
        setTimeout(() => this.startListening(), 200);
      }
    };
    
    utterance.onerror = () => {
      this.updateState({ state: 'IDLE' });
      onDone?.();
      if (wasListening) {
        this.shouldRestart = true;
        setTimeout(() => this.startListening(), 200);
      }
    };
    
    // Speak after small delay
    setTimeout(() => this.synth?.speak(utterance), 50);
  }
  
  stopSpeaking(): void {
    this.synth?.cancel();
    this.updateState({ state: 'IDLE' });
  }
}

// Export singleton instance
export const voiceService = VoiceService.getInstance();
export default voiceService;
SVCEOF

echo "✅ Created voiceService.ts (Singleton)"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: Create useVoice hook that uses the singleton
# ═══════════════════════════════════════════════════════════════════════════════

mkdir -p "$WORKING_DIR/src/hooks"

cat > "$WORKING_DIR/src/hooks/useVoice.ts" << 'HOOKEOF'
// useVoice.ts - Hook that connects to the singleton VoiceService
import { useState, useEffect, useCallback } from 'react';
import { voiceService, extractDigits, formatPhone } from '../services/voiceService';

export { extractDigits, formatPhone };

interface UseVoiceOptions {
  onDigits?: (digits: string) => void;
  onCommand?: (cmd: string) => void;
  autoStart?: boolean;
}

export function useVoice(options: UseVoiceOptions = {}) {
  const { onDigits, onCommand, autoStart = true } = options;
  
  const [state, setState] = useState(voiceService.getState());
  
  // Subscribe to voice service state changes
  useEffect(() => {
    voiceService.init();
    return voiceService.subscribe(setState);
  }, []);
  
  // Register digit handler
  useEffect(() => {
    if (onDigits) {
      return voiceService.onDigits(onDigits);
    }
  }, [onDigits]);
  
  // Register command handler
  useEffect(() => {
    if (onCommand) {
      return voiceService.onCommand(onCommand);
    }
  }, [onCommand]);
  
  // Auto-start listening
  useEffect(() => {
    if (autoStart) {
      voiceService.startListening();
    }
  }, [autoStart]);
  
  return {
    isListening: state.state === 'LISTENING',
    isSpeaking: state.state === 'SPEAKING',
    isPaused: state.state === 'PAUSED',
    transcript: state.transcript,
    interimTranscript: state.interimTranscript,
    error: state.error,
    start: useCallback(() => voiceService.startListening(), []),
    stop: useCallback(() => voiceService.stopListening(), []),
    speak: useCallback((text: string, onDone?: () => void) => voiceService.speak(text, onDone), []),
    stopSpeaking: useCallback(() => voiceService.stopSpeaking(), [])
  };
}

export default useVoice;
HOOKEOF

echo "✅ Created useVoice.ts (uses singleton)"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Create Agentic Bar Component (THE ONE TRUE BAR)
# ═══════════════════════════════════════════════════════════════════════════════

cat > "$WORKING_DIR/src/components/AgenticBar.tsx" << 'BAREOF'
// ═══════════════════════════════════════════════════════════════════════════════
// AGENTIC BAR - The ONE unified voice interface for ALL of VistaView
// Shows at bottom of modals, controls the singleton voice service
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { useVoice } from '../hooks/useVoice';

interface AgenticBarProps {
  context?: string; // e.g., "Phone Entry", "OTP Verification"
  hints?: string[]; // e.g., ["say digits", "say 'clear'"]
  compact?: boolean;
}

const AgenticBar: React.FC<AgenticBarProps> = ({ context, hints, compact = false }) => {
  const voice = useVoice({ autoStart: false }); // Don't auto-start, let parent control
  
  const isActive = voice.isListening;
  const statusColor = voice.isSpeaking ? '#FFD700' : isActive ? '#4CAF50' : '#f44336';
  const statusText = voice.isSpeaking ? '🔊 Speaking...' : isActive ? '🎤 Listening...' : '■ Stopped';
  
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 14px',
        background: isActive ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.1)',
        border: `2px solid ${statusColor}`,
        borderRadius: '20px'
      }}>
        <span style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: statusColor,
          animation: isActive ? 'agentic-pulse 1.5s infinite' : 'none'
        }} />
        <span style={{ color: statusColor, fontWeight: 600, fontSize: '0.9em' }}>
          {statusText}
        </span>
        {!isActive && (
          <button onClick={() => voice.start()} style={{
            padding: '4px 12px', background: '#4CAF50', color: '#fff',
            border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85em'
          }}>▶</button>
        )}
        <style>{`@keyframes agentic-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    );
  }
  
  return (
    <div style={{
      margin: '16px 0 0',
      padding: '14px 16px',
      background: isActive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.08)',
      border: `2px solid ${statusColor}`,
      borderRadius: '14px',
      transition: 'all 0.3s ease'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '14px', height: '14px', borderRadius: '50%',
            background: statusColor,
            boxShadow: isActive ? `0 0 10px ${statusColor}` : 'none',
            animation: isActive ? 'agentic-pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: statusColor, fontWeight: 600, fontSize: '1em' }}>
            {statusText}
          </span>
          {context && (
            <span style={{ color: '#666', fontSize: '0.85em', marginLeft: '8px' }}>
              • {context}
            </span>
          )}
        </div>
        
        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isActive ? (
            <button onClick={() => voice.start()} style={{
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95em',
              boxShadow: '0 2px 8px rgba(76,175,80,0.3)'
            }}>
              ▶ Start
            </button>
          ) : (
            <button onClick={() => voice.stop()} style={{
              padding: '8px 18px',
              background: 'rgba(255,255,255,0.1)',
              color: '#888',
              border: '1px solid #555',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              ⏹ Stop
            </button>
          )}
          {voice.isSpeaking && (
            <button onClick={() => voice.stopSpeaking()} style={{
              padding: '8px 14px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer'
            }}>
              🔇
            </button>
          )}
        </div>
      </div>
      
      {/* Transcript Display */}
      {(voice.transcript || voice.interimTranscript) && (
        <div style={{
          marginTop: '12px',
          background: 'rgba(0,0,0,0.3)',
          padding: '12px',
          borderRadius: '10px'
        }}>
          <div style={{
            color: voice.interimTranscript ? '#888' : '#4CAF50',
            fontSize: '0.7em',
            fontWeight: 600,
            marginBottom: '4px'
          }}>
            {voice.interimTranscript ? '🎤 HEARING...' : '✓ HEARD'}
          </div>
          <div style={{
            color: '#fff',
            fontSize: '1.1em',
            fontStyle: voice.interimTranscript ? 'italic' : 'normal',
            opacity: voice.interimTranscript ? 0.7 : 1
          }}>
            "{voice.interimTranscript || voice.transcript}"
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {voice.error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: 'rgba(244,67,54,0.15)',
          borderRadius: '8px',
          color: '#f44336',
          fontSize: '0.9em'
        }}>
          ⚠️ {voice.error}
        </div>
      )}
      
      {/* Hints */}
      {hints && hints.length > 0 && (
        <div style={{
          marginTop: '10px',
          color: '#666',
          fontSize: '0.8em',
          textAlign: 'center'
        }}>
          💡 {hints.join(' • ')}
        </div>
      )}
      
      <style>{`@keyframes agentic-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.1); } }`}</style>
    </div>
  );
};

export default AgenticBar;
BAREOF

echo "✅ Created AgenticBar.tsx"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: Update VendorPhone - Remove duplicate voice, use AgenticBar
# ═══════════════════════════════════════════════════════════════════════════════

cat > "$WORKING_DIR/src/components/signin/vendor/VendorPhone.tsx" << 'PHONEOF'
// VendorPhone.tsx - Uses unified AgenticBar
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVoice, extractDigits, formatPhone } from '../../../hooks/useVoice';
import AgenticBar from '../../AgenticBar';
import { voiceService } from '../../../services/voiceService';

interface Props {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
}

const VendorPhone: React.FC<Props> = ({ value, onChange, onNext }) => {
  const [digits, setDigits] = useState(value.replace(/\D/g, ''));
  const welcomeSpoken = useRef(false);
  const voice = useVoice({ autoStart: false });
  
  // Handle digits from voice
  const handleDigits = useCallback((newDigits: string) => {
    console.log('[VendorPhone] Digits:', newDigits);
    setDigits(prev => {
      const updated = (prev + newDigits).slice(0, 10);
      onChange(updated);
      
      if (updated.length === 10) {
        voiceService.speak(`Got it! ${formatPhone(updated)}. Say yes to confirm, or clear to reset.`);
      } else if (newDigits) {
        voiceService.speak(`${10 - updated.length} more.`);
      }
      return updated;
    });
  }, [onChange]);
  
  // Handle commands
  const handleCommand = useCallback((cmd: string) => {
    console.log('[VendorPhone] Command:', cmd);
    
    if ((cmd.includes('yes') || cmd.includes('confirm') || cmd.includes('send') || cmd.includes('correct')) && digits.length >= 10) {
      voiceService.speak('Sending verification code.', () => onNext());
    }
    if (cmd.includes('clear') || cmd.includes('reset') || cmd.includes('start over')) {
      setDigits('');
      onChange('');
      voiceService.speak('Cleared. Say your number again.');
    }
  }, [digits, onChange, onNext]);
  
  // Register handlers
  useEffect(() => {
    const unsubDigits = voiceService.onDigits(handleDigits);
    const unsubCommand = voiceService.onCommand(handleCommand);
    return () => { unsubDigits(); unsubCommand(); };
  }, [handleDigits, handleCommand]);
  
  // Welcome + auto-start
  useEffect(() => {
    if (!welcomeSpoken.current) {
      welcomeSpoken.current = true;
      voiceService.init();
      setTimeout(() => {
        voiceService.speak('Welcome to VistaView! Say your phone number. Like seven zero three.', () => {
          voiceService.startListening();
        });
      }, 500);
    }
  }, []);
  
  // Sync with prop
  useEffect(() => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned !== digits) setDigits(cleaned);
  }, [value]);
  
  const canSubmit = digits.length >= 10;
  
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📱</span>
      <h3 style={{ color: '#B8860B', margin: '16px 0 8px', fontSize: '1.4em' }}>
        Enter Your Phone Number
      </h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        Say digits like "seven zero three" or type below
      </p>
      
      {/* Phone Input */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ color: '#888', fontSize: '1.5em' }}>+1</span>
        <input
          type="tel"
          value={formatPhone(digits)}
          onChange={e => {
            const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
            setDigits(clean);
            onChange(clean);
          }}
          placeholder="000-000-0000"
          style={{
            fontSize: '2em', padding: '18px 28px', borderRadius: '14px',
            border: `3px solid ${canSubmit ? '#4CAF50' : 'rgba(184,134,11,0.4)'}`,
            background: 'rgba(0,0,0,0.3)', color: '#fff', textAlign: 'center',
            width: '300px', fontFamily: 'monospace', letterSpacing: '3px'
          }}
        />
        {digits && (
          <button onClick={() => { setDigits(''); onChange(''); voiceService.speak('Cleared.'); }}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#888',
              width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2em' }}>
            ✕
          </button>
        )}
      </div>
      
      {canSubmit && (
        <p style={{ color: '#4CAF50', marginBottom: '16px', fontWeight: 500 }}>
          ✓ Phone complete! Say "yes" to confirm
        </p>
      )}
      
      {/* Submit Button */}
      <button
        onClick={() => canSubmit && voiceService.speak('Sending code.', () => onNext())}
        disabled={!canSubmit}
        style={{
          padding: '16px 52px',
          background: canSubmit ? 'linear-gradient(135deg, #B8860B, #DAA520)' : 'rgba(255,255,255,0.1)',
          color: canSubmit ? '#000' : '#555', border: 'none', borderRadius: '30px',
          cursor: canSubmit ? 'pointer' : 'not-allowed', fontSize: '1.1em', fontWeight: 700,
          boxShadow: canSubmit ? '0 4px 20px rgba(184,134,11,0.3)' : 'none'
        }}
      >
        Send OTP →
      </button>
      
      {/* THE ONE AGENTIC BAR */}
      <AgenticBar 
        context="Phone Entry" 
        hints={['Say: "seven zero three..."', '"yes" to confirm', '"clear" to reset']}
      />
    </div>
  );
};

export default VendorPhone;
PHONEOF

echo "✅ Updated VendorPhone.tsx"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: Update VendorOTP
# ═══════════════════════════════════════════════════════════════════════════════

cat > "$WORKING_DIR/src/components/signin/vendor/VendorOTP.tsx" << 'OTPEOF'
// VendorOTP.tsx - Uses unified AgenticBar
import React, { useState, useEffect, useCallback, useRef } from 'react';
import AgenticBar from '../../AgenticBar';
import { voiceService } from '../../../services/voiceService';

interface Props {
  phone: string;
  onVerified: () => void;
}

const VendorOTP: React.FC<Props> = ({ phone, onVerified }) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const welcomeSpoken = useRef(false);
  
  const verifyCode = useCallback((code: string) => {
    if (code === '123456') {
      voiceService.speak('Verified! Welcome aboard.', () => onVerified());
    } else {
      setError('Invalid code. Demo: 123456');
      voiceService.speak('Invalid code. The demo code is one two three four five six.');
    }
  }, [onVerified]);
  
  // Handle digits
  const handleDigits = useCallback((digits: string) => {
    console.log('[VendorOTP] Digits:', digits);
    setOtp(prev => {
      const filled = prev.filter(d => d).length;
      const next = [...prev];
      let idx = filled;
      for (const d of digits) {
        if (idx < 6) { next[idx] = d; idx++; }
      }
      if (next.filter(d => d).length === 6) {
        setTimeout(() => verifyCode(next.join('')), 300);
      }
      return next;
    });
  }, [verifyCode]);
  
  // Handle commands
  const handleCommand = useCallback((cmd: string) => {
    if (cmd.includes('clear') || cmd.includes('reset')) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      voiceService.speak('Cleared.');
    }
  }, []);
  
  // Register handlers
  useEffect(() => {
    const unsubDigits = voiceService.onDigits(handleDigits);
    const unsubCommand = voiceService.onCommand(handleCommand);
    return () => { unsubDigits(); unsubCommand(); };
  }, [handleDigits, handleCommand]);
  
  // Welcome
  useEffect(() => {
    if (!welcomeSpoken.current) {
      welcomeSpoken.current = true;
      setTimeout(() => {
        voiceService.speak('Enter the 6 digit code. Demo code is one two three four five six.', () => {
          voiceService.startListening();
        });
      }, 300);
    }
  }, []);
  
  const handleInput = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[index] = val.slice(-1);
    setOtp(next);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(d => d)) verifyCode(next.join(''));
  };
  
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>🔐</span>
      <h3 style={{ color: '#B8860B', margin: '16px 0 8px', fontSize: '1.4em' }}>Verification Code</h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>Sent to {phone}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
        {otp.map((d, i) => (
          <input key={i} ref={el => inputRefs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleInput(i, e.target.value)}
            style={{
              width: '55px', height: '65px', fontSize: '2em', textAlign: 'center',
              borderRadius: '12px', border: `3px solid ${d ? '#4CAF50' : 'rgba(184,134,11,0.4)'}`,
              background: 'rgba(0,0,0,0.3)', color: '#fff'
            }}
          />
        ))}
      </div>
      
      {error && <p style={{ color: '#f44336', marginBottom: '16px' }}>{error}</p>}
      <p style={{ color: '#555', fontSize: '0.85em' }}>💡 Demo: 123456</p>
      
      <AgenticBar context="OTP Verification" hints={['Say: "one two three four five six"', '"clear" to reset']} />
    </div>
  );
};

export default VendorOTP;
OTPEOF

echo "✅ Updated VendorOTP.tsx"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: Update VendorProfile
# ═══════════════════════════════════════════════════════════════════════════════

cat > "$WORKING_DIR/src/components/signin/vendor/VendorProfile.tsx" << 'PROFEOF'
// VendorProfile.tsx - Uses unified AgenticBar
import React, { useState, useEffect, useCallback, useRef } from 'react';
import AgenticBar from '../../AgenticBar';
import { voiceService } from '../../../services/voiceService';

interface Props {
  profile: string;
  beautified: string;
  companyName: string;
  onChange: (profile: string) => void;
  onCompanyChange: (name: string) => void;
  onBeautify: (beautified: string) => void;
  onSave: () => void;
}

const VendorProfile: React.FC<Props> = ({ profile, beautified, companyName, onChange, onCompanyChange, onBeautify, onSave }) => {
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [showBeautified, setShowBeautified] = useState(!!beautified);
  const welcomeSpoken = useRef(false);
  
  const doBeautify = useCallback(() => {
    if (!profile.trim() && !companyName.trim()) {
      voiceService.speak('Enter company name first.');
      return;
    }
    setIsBeautifying(true);
    voiceService.speak('Enhancing your profile with AI...');
    
    setTimeout(() => {
      const enhanced = `🏢 ${companyName || 'Your Company'}

Premium solutions provider specializing in ${profile || 'quality products'}.

✨ Why Choose Us:
• Exceptional quality and craftsmanship
• Customer-focused service excellence  
• Competitive pricing with premium value

🌟 Trusted by homeowners and designers on VistaView - The World's #1 Real Estate Marketplace.`;
      
      onBeautify(enhanced);
      setShowBeautified(true);
      setIsBeautifying(false);
      voiceService.speak('Done! Your profile looks professional now. Say save to continue.');
    }, 1500);
  }, [profile, companyName, onBeautify]);
  
  // Handle commands
  const handleCommand = useCallback((cmd: string) => {
    console.log('[VendorProfile] Command:', cmd);
    if (cmd.includes('beautify') || cmd.includes('enhance')) doBeautify();
    if ((cmd.includes('save') || cmd.includes('next') || cmd.includes('continue')) && companyName.trim()) {
      voiceService.speak('Saving profile.', () => onSave());
    }
    if (cmd.includes('clear') || cmd.includes('reset')) {
      onChange(''); onBeautify(''); setShowBeautified(false);
      voiceService.speak('Cleared.');
    }
  }, [doBeautify, companyName, onSave, onChange, onBeautify]);
  
  // Register handler
  useEffect(() => {
    return voiceService.onCommand(handleCommand);
  }, [handleCommand]);
  
  // Welcome
  useEffect(() => {
    if (!welcomeSpoken.current) {
      welcomeSpoken.current = true;
      setTimeout(() => {
        voiceService.speak('Tell me about your business. Enter company name and description. Say beautify to enhance.', () => {
          voiceService.startListening();
        });
      }, 300);
    }
  }, []);
  
  const displayText = showBeautified && beautified ? beautified : profile;
  
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '3.5em' }}>🏪</span>
      <h3 style={{ color: '#B8860B', margin: '16px 0', fontSize: '1.4em' }}>Business Profile</h3>
      
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <input type="text" value={companyName} onChange={e => onCompanyChange(e.target.value)}
          placeholder="Company Name"
          style={{ width: '100%', padding: '16px 20px', marginBottom: '16px', borderRadius: '12px',
            border: `2px solid ${companyName ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
            background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '1.1em' }}
        />
        
        <textarea value={displayText}
          onChange={e => { onChange(e.target.value); if (showBeautified) { setShowBeautified(false); onBeautify(''); } }}
          placeholder="What do you sell?" rows={showBeautified ? 14 : 5}
          style={{ width: '100%', padding: '16px 20px', marginBottom: '16px', borderRadius: '12px',
            border: `2px solid ${showBeautified ? '#4CAF50' : 'rgba(184,134,11,0.4)'}`,
            background: showBeautified ? 'rgba(76,175,80,0.1)' : 'rgba(0,0,0,0.3)',
            color: '#fff', fontSize: '1em', resize: 'vertical', lineHeight: 1.6 }}
        />
        
        {showBeautified && (
          <div style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid #4CAF50',
            borderRadius: '10px', padding: '14px', marginBottom: '16px', textAlign: 'left' }}>
            <span style={{ color: '#4CAF50', fontWeight: 700 }}>✨ AI Enhanced</span>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginBottom: '16px' }}>
          <button onClick={doBeautify} disabled={isBeautifying}
            style={{ padding: '16px 32px', background: 'transparent', color: '#B8860B',
              border: '2px solid #B8860B', borderRadius: '28px', cursor: 'pointer',
              fontWeight: 700, opacity: isBeautifying ? 0.6 : 1 }}>
            {isBeautifying ? '⏳ Working...' : '✨ Beautify'}
          </button>
          <button onClick={() => voiceService.speak('Saving.', () => onSave())} disabled={!companyName.trim()}
            style={{ padding: '16px 36px',
              background: companyName.trim() ? 'linear-gradient(135deg, #B8860B, #DAA520)' : 'rgba(255,255,255,0.1)',
              color: companyName.trim() ? '#000' : '#555', border: 'none', borderRadius: '28px',
              cursor: companyName.trim() ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
            Save →
          </button>
        </div>
        
        <AgenticBar context="Business Profile" hints={['"beautify"', '"save"', '"clear"']} />
      </div>
    </div>
  );
};

export default VendorProfile;
PROFEOF

echo "✅ Updated VendorProfile.tsx"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7: Remove the old MR. V header status from VendorModal if it exists
# ═══════════════════════════════════════════════════════════════════════════════

# Find the modal file
MODAL_FILE=$(find "$WORKING_DIR/src" -name "*VendorModal*" -o -name "*SignInModal*" | head -1)
if [ -n "$MODAL_FILE" ]; then
  echo "Found modal: $MODAL_FILE"
  # Comment out any duplicate voice status in the modal header
  # This is tricky without seeing the file, so let's just note it
  echo "  ⚠️ Check modal file for duplicate 'MR. V: Listening' header"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# RESTART
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo "Restarting frontend..."

pkill -f vite 2>/dev/null || true
sleep 1

cd "$WORKING_DIR"
npm run dev > /tmp/vistaview_frontend.log 2>&1 &
sleep 3

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  UNIFIED AGENTIC BAR DEPLOYED"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  ✅ voiceService.ts - SINGLETON (one voice for everything)"
echo "  ✅ useVoice.ts - Hook connects to singleton"
echo "  ✅ AgenticBar.tsx - THE ONE TRUE voice UI"
echo "  ✅ VendorPhone/OTP/Profile - Use AgenticBar"
echo ""
echo "  KEY CHANGES:"
echo "    • Only ONE mic instance (no fighting)"
echo "    • Audio Mutex: Speaking stops listening, listening stops speaking"
echo "    • Welcome message plays THEN starts listening"
echo "    • No more flickering"
echo ""
echo "  TEST: http://localhost:5180"
echo "  Sign In → Vendor → Should hear 'Welcome to VistaView!'"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
