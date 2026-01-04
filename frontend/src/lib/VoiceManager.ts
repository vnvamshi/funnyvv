/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VISTAVIEW VOICE MANAGER - SINGLE OWNER OF THE MICROPHONE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This is the ONLY thing that talks to the browser's Speech API.
 * All components (AgenticBar, Modals, Pages) subscribe to this.
 * 
 * Rules:
 * 1. Only ONE recognition instance ever
 * 2. TTS always pauses STT (duplex policy)
 * 3. No auto-restart loops - controlled restart only
 * 4. All events logged to backend
 */

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'paused';
type VoiceMode = 'interactive' | 'talkative' | 'text';

interface VoiceListener {
    onStateChange?: (state: VoiceState) => void;
    onTranscript?: (text: string, isFinal: boolean) => void;
    onResponse?: (response: any) => void;
    onError?: (error: string) => void;
}

class VoiceManager {
    private static instance: VoiceManager | null = null;
    
    private recognition: any = null;
    private synthesis: SpeechSynthesis | null = null;
    private state: VoiceState = 'idle';
    private mode: VoiceMode = 'interactive';
    private listeners: Set<VoiceListener> = new Set();
    private isInitialized = false;
    private shouldBeListening = false;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private restartTimeout: any = null;
    private lastTranscript = '';
    
    // Prevent multiple instances
    private constructor() {}
    
    static getInstance(): VoiceManager {
        if (!VoiceManager.instance) {
            VoiceManager.instance = new VoiceManager();
        }
        return VoiceManager.instance;
    }
    
    /**
     * Initialize the voice system (call once on app mount)
     */
    init(): boolean {
        if (this.isInitialized) {
            console.log('[VoiceManager] Already initialized');
            return true;
        }
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('[VoiceManager] Speech recognition not supported');
            this.setState('error');
            return false;
        }
        
        this.synthesis = window.speechSynthesis;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
        
        // Event handlers
        this.recognition.onstart = () => {
            console.log('[VoiceManager] 🎤 Recognition STARTED');
            this.setState('listening');
        };
        
        this.recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript;
                } else {
                    interim += transcript;
                }
            }
            
            const text = final || interim;
            const isFinal = !!final;
            
            if (text !== this.lastTranscript) {
                this.lastTranscript = text;
                this.notifyListeners('onTranscript', text, isFinal);
            }
            
            if (isFinal && final.trim()) {
                this.processTranscript(final.trim());
            }
        };
        
        this.recognition.onerror = (event: any) => {
            // Ignore harmless errors
            if (event.error === 'aborted' || event.error === 'no-speech') {
                console.log('[VoiceManager] Harmless error:', event.error);
                return;
            }
            
            console.error('[VoiceManager] Error:', event.error);
            
            if (event.error === 'not-allowed') {
                this.notifyListeners('onError', 'Microphone access denied');
                this.setState('error');
                this.shouldBeListening = false;
            }
        };
        
        this.recognition.onend = () => {
            console.log('[VoiceManager] Recognition ENDED, shouldBeListening:', this.shouldBeListening);
            
            // Clear any pending restart
            if (this.restartTimeout) {
                clearTimeout(this.restartTimeout);
                this.restartTimeout = null;
            }
            
            // Only restart if we should be listening AND not speaking
            if (this.shouldBeListening && this.state !== 'speaking' && this.state !== 'paused') {
                this.restartTimeout = setTimeout(() => {
                    if (this.shouldBeListening && this.state !== 'speaking') {
                        console.log('[VoiceManager] Restarting recognition...');
                        this.startRecognition();
                    }
                }, 300); // Small delay to prevent rapid restart loop
            } else {
                this.setState('idle');
            }
        };
        
        this.isInitialized = true;
        console.log('[VoiceManager] ✅ Initialized');
        return true;
    }
    
    /**
     * Subscribe to voice events
     */
    subscribe(listener: VoiceListener): () => void {
        this.listeners.add(listener);
        // Immediately notify of current state
        listener.onStateChange?.(this.state);
        
        return () => {
            this.listeners.delete(listener);
        };
    }
    
    /**
     * Start listening
     */
    start(): void {
        if (!this.isInitialized) {
            this.init();
        }
        
        console.log('[VoiceManager] START requested, current state:', this.state);
        
        // Stop any TTS first
        this.stopSpeaking();
        
        this.shouldBeListening = true;
        
        if (this.state !== 'listening') {
            this.startRecognition();
        }
    }
    
    /**
     * Stop listening
     */
    stop(): void {
        console.log('[VoiceManager] STOP requested');
        
        this.shouldBeListening = false;
        
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }
        
        try {
            this.recognition?.stop();
        } catch (e) {
            // Ignore
        }
        
        this.setState('idle');
    }
    
    /**
     * Toggle listening
     */
    toggle(): void {
        if (this.shouldBeListening || this.state === 'listening') {
            this.stop();
        } else {
            this.start();
        }
    }
    
    /**
     * Pause listening (for TTS)
     */
    pause(): void {
        console.log('[VoiceManager] PAUSE');
        
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }
        
        try {
            this.recognition?.stop();
        } catch (e) {}
        
        this.setState('paused');
    }
    
    /**
     * Resume listening (after TTS)
     */
    resume(): void {
        console.log('[VoiceManager] RESUME, shouldBeListening:', this.shouldBeListening);
        
        if (this.shouldBeListening) {
            setTimeout(() => {
                if (this.shouldBeListening && this.state !== 'speaking') {
                    this.startRecognition();
                }
            }, 200);
        }
    }
    
    /**
     * Speak text (TTS) - automatically pauses STT
     */
    speak(text: string): void {
        if (!this.synthesis) return;
        
        console.log('[VoiceManager] SPEAK:', text.substring(0, 50) + '...');
        
        // DUPLEX POLICY: Stop listening while speaking
        this.pause();
        
        // Cancel any current speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
            console.log('[VoiceManager] TTS started');
            this.setState('speaking');
        };
        
        utterance.onend = () => {
            console.log('[VoiceManager] TTS ended');
            this.currentUtterance = null;
            
            // DUPLEX POLICY: Resume listening after speaking
            this.resume();
        };
        
        utterance.onerror = (e) => {
            console.error('[VoiceManager] TTS error:', e);
            this.currentUtterance = null;
            this.resume();
        };
        
        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
    }
    
    /**
     * Stop speaking
     */
    stopSpeaking(): void {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        this.currentUtterance = null;
    }
    
    /**
     * Set mode
     */
    setMode(mode: VoiceMode): void {
        console.log('[VoiceManager] Mode:', mode);
        this.mode = mode;
        
        if (mode === 'text') {
            this.stop();
        }
    }
    
    /**
     * Get current state
     */
    getState(): VoiceState {
        return this.state;
    }
    
    /**
     * Get current mode
     */
    getMode(): VoiceMode {
        return this.mode;
    }
    
    /**
     * Check if listening
     */
    isListening(): boolean {
        return this.state === 'listening';
    }
    
    /**
     * Check if speaking
     */
    isSpeaking(): boolean {
        return this.state === 'speaking';
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    private startRecognition(): void {
        try {
            this.recognition?.start();
        } catch (e: any) {
            // "already started" error is fine
            if (!e.message?.includes('already started')) {
                console.error('[VoiceManager] Start error:', e);
            }
        }
    }
    
    private setState(newState: VoiceState): void {
        if (this.state !== newState) {
            console.log('[VoiceManager] State:', this.state, '→', newState);
            this.state = newState;
            this.notifyListeners('onStateChange', newState);
        }
    }
    
    private notifyListeners(event: keyof VoiceListener, ...args: any[]): void {
        this.listeners.forEach(listener => {
            const handler = listener[event];
            if (typeof handler === 'function') {
                (handler as Function)(...args);
            }
        });
    }
    
    private async processTranscript(text: string): Promise<void> {
        console.log('[VoiceManager] Processing:', text);
        this.setState('processing');
        
        try {
            // Send to backend
            const response = await fetch('http://localhost:1117/api/ledger/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_type: 'boss',
                    raw_transcript: text,
                    page_route: window.location.pathname
                })
            });
            
            const data = await response.json();
            this.notifyListeners('onResponse', data);
            
            // Speak response if in talkative mode
            if (this.mode === 'talkative' && data?.tts_response?.text) {
                this.speak(data.tts_response.text);
            } else {
                // Resume listening
                if (this.shouldBeListening) {
                    this.setState('listening');
                } else {
                    this.setState('idle');
                }
            }
        } catch (e) {
            console.error('[VoiceManager] Process error:', e);
            this.setState(this.shouldBeListening ? 'listening' : 'idle');
        }
    }
}

// Export singleton instance
export const voiceManager = VoiceManager.getInstance();
export default voiceManager;
