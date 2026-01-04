// ═══════════════════════════════════════════════════════════════════════════════
// VOICE BRAIN - SINGLETON
// One instance controls all voice for the entire app
// Based on proven working code from HTML test
// ═══════════════════════════════════════════════════════════════════════════════

export type AudioState = 'IDLE' | 'LISTENING' | 'SPEAKING' | 'PAUSED';
export type VoiceMode = 'interactive' | 'talkative' | 'text';

// Word to digit mapping - PROVEN WORKING
const W2D: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3',
  'four': '4', 'for': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
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
  if (c.length <= 6) return `${c.slice(0, 3)}-${c.slice(3)}`;
  return `${c.slice(0, 3)}-${c.slice(3, 6)}-${c.slice(6)}`;
}

interface BrainState {
  audioState: AudioState;
  mode: VoiceMode;
  transcript: string;
  interim: string;
  context: string;
  error: string | null;
}

type StateListener = (state: BrainState) => void;
type DigitHandler = (digits: string) => void;
type CommandHandler = (cmd: string) => void;

class VoiceBrainClass {
  private static instance: VoiceBrainClass;
  
  private recognition: SpeechRecognition | null = null;
  private synth: SpeechSynthesis | null = null;
  
  private state: BrainState = {
    audioState: 'IDLE',
    mode: 'interactive',
    transcript: '',
    interim: '',
    context: '',
    error: null
  };
  
  private listeners = new Set<StateListener>();
  private digitHandlers = new Set<DigitHandler>();
  private commandHandlers = new Set<CommandHandler>();
  
  private shouldRestart = true;
  private initialized = false;
  private ttsUnlocked = false;
  
  private constructor() {}
  
  static getInstance(): VoiceBrainClass {
    if (!VoiceBrainClass.instance) {
      VoiceBrainClass.instance = new VoiceBrainClass();
    }
    return VoiceBrainClass.instance;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────
  init(): boolean {
    if (this.initialized) return true;
    
    console.log('[VoiceBrain] Initializing...');
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      this.updateState({ error: 'Speech not supported. Use Chrome.' });
      console.error('[VoiceBrain] Speech Recognition not supported');
      return false;
    }
    
    this.synth = window.speechSynthesis;
    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
    
    this.recognition.onstart = () => {
      console.log('[VoiceBrain] ✅ LISTENING');
      this.updateState({ audioState: 'LISTENING', error: null });
    };
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0]?.transcript?.trim() || '';
      const isFinal = result.isFinal;
      
      if (isFinal && text) {
        console.log('[VoiceBrain] Heard:', text);
        this.updateState({ transcript: text, interim: '' });
        this.processText(text.toLowerCase());
      } else {
        this.updateState({ interim: text });
      }
    };
    
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[VoiceBrain] Error:', event.error);
      if (event.error === 'not-allowed') {
        this.updateState({ 
          audioState: 'IDLE', 
          error: 'Microphone blocked. Click 🔒 in address bar → Allow' 
        });
        this.shouldRestart = false;
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        this.updateState({ error: `Error: ${event.error}` });
      }
    };
    
    this.recognition.onend = () => {
      console.log('[VoiceBrain] Ended, shouldRestart:', this.shouldRestart, 'state:', this.state.audioState);
      if (this.shouldRestart && this.state.audioState !== 'SPEAKING' && this.state.audioState !== 'PAUSED') {
        setTimeout(() => {
          if (this.shouldRestart && this.recognition) {
            try { 
              this.recognition.start(); 
            } catch (e) { 
              console.log('[VoiceBrain] Restart failed:', e);
            }
          }
        }, 100);
      } else if (this.state.audioState !== 'SPEAKING' && this.state.audioState !== 'PAUSED') {
        this.updateState({ audioState: 'IDLE' });
      }
    };
    
    this.initialized = true;
    console.log('[VoiceBrain] ✅ Initialized');
    return true;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────
  private updateState(partial: Partial<BrainState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(l => l(this.state));
  }
  
  getState(): BrainState {
    return { ...this.state };
  }
  
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }
  
  onDigits(handler: DigitHandler): () => void {
    this.digitHandlers.add(handler);
    return () => this.digitHandlers.delete(handler);
  }
  
  onCommand(handler: CommandHandler): () => void {
    this.commandHandlers.add(handler);
    return () => this.commandHandlers.delete(handler);
  }
  
  setContext(context: string): void {
    this.updateState({ context });
    console.log('[VoiceBrain] Context:', context);
  }
  
  setMode(mode: VoiceMode): void {
    this.updateState({ mode });
    console.log('[VoiceBrain] Mode:', mode);
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // TEXT PROCESSING
  // ─────────────────────────────────────────────────────────────────────────
  private processText(text: string): void {
    // Pause commands
    if (text.includes('hey') || text === 'stop' || text === 'pause' || text.includes('wait')) {
      this.pause();
      this.speak("I'm here when you need me. Say resume to continue.");
      return;
    }
    
    // Resume commands
    if (text === 'resume' || text === 'continue' || text === 'go ahead') {
      this.resume();
      return;
    }
    
    // Mode switching
    if (text.includes('talkative mode')) {
      this.setMode('talkative');
      this.speak('Talkative mode. I will give more details.');
      return;
    }
    if (text.includes('text mode') || text.includes('silent')) {
      this.setMode('text');
      this.speak('Text mode. I will stay quiet.');
      return;
    }
    if (text.includes('interactive mode')) {
      this.setMode('interactive');
      this.speak('Interactive mode.');
      return;
    }
    
    // Extract digits
    const digits = extractDigits(text);
    if (digits) {
      console.log('[VoiceBrain] Digits:', digits);
      this.digitHandlers.forEach(h => h(digits));
    }
    
    // Dispatch to command handlers
    this.commandHandlers.forEach(h => h(text));
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // AUDIO CONTROL (with Mutex)
  // ─────────────────────────────────────────────────────────────────────────
  start(): void {
    if (!this.init()) return;
    
    // Audio Mutex: Don't start listening if speaking
    if (this.state.audioState === 'SPEAKING') {
      console.log('[VoiceBrain] Cannot start while speaking');
      return;
    }
    
    this.shouldRestart = true;
    if (this.recognition) {
      try { 
        this.recognition.start(); 
      } catch (e) { 
        console.log('[VoiceBrain] Start error (may already be running):', e);
      }
    }
  }
  
  stop(): void {
    this.shouldRestart = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.updateState({ audioState: 'IDLE' });
  }
  
  pause(): void {
    this.shouldRestart = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.updateState({ audioState: 'PAUSED' });
  }
  
  resume(): void {
    this.shouldRestart = true;
    this.updateState({ audioState: 'LISTENING' });
    if (this.recognition) {
      try { this.recognition.start(); } catch (e) {}
    }
    this.speak("I'm listening.");
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // TEXT-TO-SPEECH (with Mutex)
  // ─────────────────────────────────────────────────────────────────────────
  speak(text: string, onDone?: () => void): void {
    if (!text) {
      onDone?.();
      return;
    }
    
    // Text mode = silent
    if (this.state.mode === 'text') {
      console.log('[VoiceBrain] Text mode, skipping TTS:', text);
      onDone?.();
      return;
    }
    
    if (!this.init() || !this.synth) {
      onDone?.();
      return;
    }
    
    console.log('[VoiceBrain] Speaking:', text);
    
    // AUDIO MUTEX: Stop listening while speaking
    const wasListening = this.shouldRestart;
    this.shouldRestart = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    
    // Cancel any ongoing speech
    this.synth.cancel();
    this.updateState({ audioState: 'SPEAKING' });
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get best voice
    const voices = this.synth.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) ||
                  voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                  voices.find(v => v.lang.startsWith('en-US') && !v.name.includes('Compact'));
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => {
      console.log('[VoiceBrain] Speech ended');
      this.updateState({ audioState: wasListening ? 'LISTENING' : 'IDLE' });
      onDone?.();
      
      // Resume listening if was listening before
      if (wasListening) {
        this.shouldRestart = true;
        setTimeout(() => this.start(), 200);
      }
    };
    
    utterance.onerror = (e) => {
      console.log('[VoiceBrain] Speech error:', e);
      this.updateState({ audioState: 'IDLE' });
      onDone?.();
      
      if (wasListening) {
        this.shouldRestart = true;
        setTimeout(() => this.start(), 200);
      }
    };
    
    // Small delay then speak
    setTimeout(() => {
      if (this.synth) {
        this.synth.speak(utterance);
      }
    }, 50);
  }
  
  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.state.audioState === 'SPEAKING') {
      this.updateState({ audioState: 'IDLE' });
    }
  }
}

// Export singleton
export const voiceBrain = VoiceBrainClass.getInstance();
export default voiceBrain;
