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
