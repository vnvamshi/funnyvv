// ElevenLabs Voice type definition
interface Voice {
  voice_id: string;
  name: string;
  labels?: {
    language?: string;
    gender?: string;
    age?: string;
  };
}

class ElevenLabsService {
  private voices: Voice[] = [];
  private isInitialized = false;
  private apiKey: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Get API key from environment variables
      this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!this.apiKey) {
        console.warn('ElevenLabs API key not found. Please set VITE_ELEVENLABS_API_KEY in your .env file');
        return;
      }

      await this.loadVoices();
      this.isInitialized = true;
      console.log('ElevenLabs service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ElevenLabs service:', error);
    }
  }

  private async loadVoices() {
    if (!this.apiKey) {
      console.error('No API key available for loading voices');
      return;
    }

    try {
      console.log('Loading ElevenLabs voices...');
      console.log('API Key present:', !!this.apiKey);
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey
        }
      });

      console.log('Voice API response status:', response.status);
      console.log('Voice API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Voice API error response:', errorText);
        throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Voice API response data:', data);
      
      this.voices = data.voices || [];
      console.log(`Successfully loaded ${this.voices.length} ElevenLabs voices:`, this.voices.map(v => ({ id: v.voice_id, name: v.name })));
    } catch (error) {
      console.error('Failed to load ElevenLabs voices:', error);
      this.voices = []; // Ensure voices array is empty on error
    }
  }

  public async getVoices(): Promise<Voice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.voices;
  }

  public async textToSpeech(
    text: string, 
    voiceId: string, 
    onProgress?: (progress: number) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<AudioBuffer | null> {
    if (!this.apiKey) {
      const error = new Error('ElevenLabs API key not found');
      onError?.(error);
      return null;
    }

    try {
      console.log(`Converting text to speech with voice ${voiceId}:`, text.substring(0, 50) + '...');
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Convert the response to an AudioBuffer (support both promise and callback APIs)
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decode = (buf: ArrayBuffer): Promise<AudioBuffer> => {
        try {
          const maybePromise = (audioContext as any).decodeAudioData(buf);
          if (maybePromise && typeof maybePromise.then === 'function') {
            return maybePromise;
          }
        } catch (_e) {
          // fall through to callback style
        }
        return new Promise((resolve, reject) => {
          (audioContext as any).decodeAudioData(buf, resolve, reject);
        });
      };
      const audioBuffer = await decode(arrayBuffer);
      
      onComplete?.();
      return audioBuffer;
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      onError?.(error as Error);
      return null;
    }
  }

  public async speechToText(
    audioFile: File | Blob,
    modelId: string = 'scribe_v1'
  ): Promise<{ text: string } | null> {
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found for STT');
      return null;
    }

    try {
      const form = new FormData();
      form.append('model_id', modelId);
      // Ensure a File object name is set for proper multipart handling
      const file = audioFile instanceof File ? audioFile : new File([audioFile], 'audio.wav', { type: (audioFile as any).type || 'audio/wav' });
      form.append('file', file);

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey
        },
        body: form
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`STT request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      // API returns { text: string, ... }
      if (data && typeof data.text === 'string') {
        return { text: data.text };
      }
      return null;
    } catch (error) {
      console.error('ElevenLabs STT error:', error);
      return null;
    }
  }

  public async playAudio(audioBuffer: AudioBuffer): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      return new Promise((resolve, reject) => {
        source.onended = () => resolve();
        source.onerror = (error) => reject(error);
        source.start();
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.apiKey !== null;
  }

  public getDefaultVoice(): Voice | null {
    // Prefer a voice named "Roger" if available
    const preferredByName = this.voices.find(v => v.name?.toLowerCase().includes('roger'));
    if (preferredByName) return preferredByName;
    // Otherwise return the first English voice
    const englishVoice = this.voices.find(voice => 
      voice.labels?.language?.toLowerCase().includes('en') || 
      voice.name?.toLowerCase().includes('english')
    );
    return englishVoice || this.voices[0] || null;
  }
}

// Export a singleton instance
export const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;
