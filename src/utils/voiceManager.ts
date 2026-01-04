// ═══════════════════════════════════════════════════════════════════════════════
// VOICE MANAGER v7.0 - Single Mic Control (Prevents Conflicts)
// Only ONE component can use the mic at a time
// ═══════════════════════════════════════════════════════════════════════════════

type VoiceOwner = 'landing' | 'modal' | 'dashboard' | 'vendor' | null;

interface VoiceManagerState {
  currentOwner: VoiceOwner;
  isListening: boolean;
  isSpeaking: boolean;
  subscribers: Map<VoiceOwner, (event: VoiceEvent) => void>;
}

interface VoiceEvent {
  type: 'acquired' | 'released' | 'denied' | 'transcript' | 'speaking';
  owner?: VoiceOwner;
  data?: any;
}

class VoiceManager {
  private state: VoiceManagerState = {
    currentOwner: null,
    isListening: false,
    isSpeaking: false,
    subscribers: new Map()
  };

  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        this.recognition = new SR();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onresult = (e: any) => {
          const result = e.results[e.results.length - 1];
          const text = result[0]?.transcript?.trim() || '';
          if (this.state.currentOwner) {
            this.notify(this.state.currentOwner, { type: 'transcript', data: { text, isFinal: result.isFinal } });
          }
        };

        this.recognition.onend = () => {
          if (this.state.isListening && this.state.currentOwner) {
            setTimeout(() => { try { this.recognition?.start(); } catch(e) {} }, 100);
          }
        };
      }
    }
  }

  // Request mic control
  acquire(owner: VoiceOwner): boolean {
    if (this.state.currentOwner && this.state.currentOwner !== owner) {
      console.log(`[VoiceManager] ${owner} denied - ${this.state.currentOwner} has control`);
      this.notify(owner, { type: 'denied', owner: this.state.currentOwner });
      return false;
    }

    this.state.currentOwner = owner;
    this.state.isListening = true;
    console.log(`[VoiceManager] ${owner} acquired mic control`);
    
    try { this.recognition?.start(); } catch(e) {}
    this.notify(owner, { type: 'acquired' });
    return true;
  }

  // Release mic control
  release(owner: VoiceOwner): void {
    if (this.state.currentOwner !== owner) return;
    
    console.log(`[VoiceManager] ${owner} released mic control`);
    this.state.currentOwner = null;
    this.state.isListening = false;
    
    try { this.recognition?.stop(); } catch(e) {}
    this.notify(owner, { type: 'released' });
  }

  // Transfer control (for modal transitions)
  transfer(from: VoiceOwner, to: VoiceOwner): boolean {
    if (this.state.currentOwner !== from) return false;
    
    console.log(`[VoiceManager] Transferring control: ${from} → ${to}`);
    this.state.currentOwner = to;
    this.notify(from, { type: 'released' });
    this.notify(to, { type: 'acquired' });
    return true;
  }

  // Check who has control
  getOwner(): VoiceOwner {
    return this.state.currentOwner;
  }

  // Speak (any owner can speak)
  speak(text: string, owner?: VoiceOwner): void {
    if (!this.synth) return;
    this.synth.cancel();
    
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    
    const voices = this.synth.getVoices();
    const voice = voices.find(v => v.name.includes('Samantha')) ||
                  voices.find(v => v.lang.includes('en-US')) ||
                  voices[0];
    if (voice) u.voice = voice;

    this.state.isSpeaking = true;
    u.onend = () => { this.state.isSpeaking = false; };
    u.onerror = () => { this.state.isSpeaking = false; };
    
    this.synth.speak(u);
  }

  // Stop speaking
  stopSpeaking(): void {
    this.synth?.cancel();
    this.state.isSpeaking = false;
  }

  // Subscribe to events
  subscribe(owner: VoiceOwner, callback: (event: VoiceEvent) => void): void {
    this.state.subscribers.set(owner, callback);
  }

  // Unsubscribe
  unsubscribe(owner: VoiceOwner): void {
    this.state.subscribers.delete(owner);
  }

  // Notify subscriber
  private notify(owner: VoiceOwner, event: VoiceEvent): void {
    const callback = this.state.subscribers.get(owner);
    if (callback) callback(event);
  }

  // Get state
  isListening(): boolean { return this.state.isListening; }
  isSpeaking(): boolean { return this.state.isSpeaking; }
}

// Singleton
export const voiceManager = new VoiceManager();
export default voiceManager;
