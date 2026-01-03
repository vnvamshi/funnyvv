import { transcribeAudio } from '../utils/api';
import { elevenLabsService } from './elevenlabsService';

export interface STTResult {
  text: string;
  api: 'elevenlabs' | 'transcribe';
  success: boolean;
  error?: string;
}

export interface STTConfig {
  primaryApi: 'elevenlabs' | 'transcribe';
  fallbackApi: 'elevenlabs' | 'transcribe';
  fallbackEnabled: boolean;
}

class SpeechToTextService {
  private config: STTConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): STTConfig {
    const primaryApi = (import.meta.env.VITE_STT_PRIMARY_API as 'elevenlabs' | 'transcribe') || 'elevenlabs';
    const fallbackApi = (import.meta.env.VITE_STT_FALLBACK_API as 'elevenlabs' | 'transcribe') || 'transcribe';
    const fallbackEnabled = import.meta.env.VITE_STT_FALLBACK_ENABLED === 'true';

    console.log('STT Service Config:', {
      primaryApi,
      fallbackApi,
      fallbackEnabled
    });

    return {
      primaryApi,
      fallbackApi,
      fallbackEnabled
    };
  }

  /**
   * Convert speech to text using configured APIs with fallback
   * @param audioFile - Audio file to transcribe
   * @param modelId - Model ID for ElevenLabs (optional)
   * @returns Promise<STTResult> - Transcription result with API used
   */
  public async speechToText(
    audioFile: File | Blob,
    modelId: string = 'scribe_v1'
  ): Promise<STTResult> {
    console.log('=== STT Service: Starting transcription ===');
    console.log('Audio file type:', audioFile instanceof File ? audioFile.type : 'Blob');
    console.log('Audio file size:', audioFile.size, 'bytes');
    console.log('Primary API:', this.config.primaryApi);
    console.log('Fallback enabled:', this.config.fallbackEnabled);

    // Try primary API first
    const primaryResult = await this.tryApi(this.config.primaryApi, audioFile, modelId);
    
    if (primaryResult.success) {
      console.log('✅ Primary API succeeded:', this.config.primaryApi);
      return primaryResult;
    }

    console.log('❌ Primary API failed:', this.config.primaryApi, primaryResult.error);

    // Try fallback API if enabled and different from primary
    if (this.config.fallbackEnabled && this.config.fallbackApi !== this.config.primaryApi) {
      console.log('🔄 Trying fallback API:', this.config.fallbackApi);
      const fallbackResult = await this.tryApi(this.config.fallbackApi, audioFile, modelId);
      
      if (fallbackResult.success) {
        console.log('✅ Fallback API succeeded:', this.config.fallbackApi);
        return fallbackResult;
      }

      console.log('❌ Fallback API also failed:', this.config.fallbackApi, fallbackResult.error);
    }

    // Both APIs failed
    console.log('💥 All STT APIs failed');
    return {
      text: '',
      api: this.config.primaryApi,
      success: false,
      error: `Both ${this.config.primaryApi} and ${this.config.fallbackApi} APIs failed`
    };
  }

  /**
   * Try a specific API for speech-to-text
   * @param api - API to use ('elevenlabs' or 'transcribe')
   * @param audioFile - Audio file to transcribe
   * @param modelId - Model ID for ElevenLabs
   * @returns Promise<STTResult> - Result from the specific API
   */
  private async tryApi(
    api: 'elevenlabs' | 'transcribe',
    audioFile: File | Blob,
    modelId: string
  ): Promise<STTResult> {
    try {
      console.log(`🎯 Trying ${api} API...`);

      if (api === 'elevenlabs') {
        return await this.tryElevenLabs(audioFile, modelId);
      } else if (api === 'transcribe') {
        return await this.tryTranscribe(audioFile);
      } else {
        throw new Error(`Unknown API: ${api}`);
      }
    } catch (error) {
      console.error(`❌ ${api} API error:`, error);
      return {
        text: '',
        api,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Try ElevenLabs speech-to-text API
   * @param audioFile - Audio file to transcribe
   * @param modelId - Model ID for ElevenLabs
   * @returns Promise<STTResult> - Result from ElevenLabs
   */
  private async tryElevenLabs(audioFile: File | Blob, modelId: string): Promise<STTResult> {
    // Check if ElevenLabs service is ready
    if (!elevenLabsService.isReady()) {
      throw new Error('ElevenLabs service not ready - API key may be missing');
    }

    // Ensure we have a File object for ElevenLabs
    const file = audioFile instanceof File ? audioFile : new File([audioFile], 'audio.wav', { 
      type: (audioFile as any).type || 'audio/wav' 
    });

    const result = await elevenLabsService.speechToText(file, modelId);
    
    if (result && result.text) {
      return {
        text: result.text,
        api: 'elevenlabs',
        success: true
      };
    } else {
      throw new Error('ElevenLabs returned empty or invalid result');
    }
  }

  /**
   * Try backend transcribe API
   * @param audioFile - Audio file to transcribe
   * @returns Promise<STTResult> - Result from transcribe API
   */
  private async tryTranscribe(audioFile: File | Blob): Promise<STTResult> {
    // Ensure we have a File object for transcribe API
    const file = audioFile instanceof File ? audioFile : new File([audioFile], 'audio.wav', { 
      type: (audioFile as any).type || 'audio/wav' 
    });

    const result = await transcribeAudio(file);
    
    if (result && result.success && result.data && result.data.text) {
      return {
        text: result.data.text,
        api: 'transcribe',
        success: true
      };
    } else {
      throw new Error('Transcribe API returned empty or invalid result');
    }
  }

  /**
   * Get current configuration
   * @returns STTConfig - Current configuration
   */
  public getConfig(): STTConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (useful for testing)
   * @param config - New configuration
   */
  public updateConfig(config: Partial<STTConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('STT Service config updated:', this.config);
  }

  /**
   * Test both APIs to check their availability
   * @param audioFile - Test audio file
   * @returns Promise<{elevenlabs: boolean, transcribe: boolean}> - API availability
   */
  public async testApis(audioFile: File | Blob): Promise<{elevenlabs: boolean, transcribe: boolean}> {
    console.log('🧪 Testing STT APIs availability...');
    
    const results = {
      elevenlabs: false,
      transcribe: false
    };

    // Test ElevenLabs
    try {
      const elevenLabsResult = await this.tryElevenLabs(audioFile, 'scribe_v1');
      results.elevenlabs = elevenLabsResult.success;
      console.log('ElevenLabs test:', elevenLabsResult.success ? '✅' : '❌');
    } catch (error) {
      console.log('ElevenLabs test: ❌', error);
    }

    // Test Transcribe
    try {
      const transcribeResult = await this.tryTranscribe(audioFile);
      results.transcribe = transcribeResult.success;
      console.log('Transcribe test:', transcribeResult.success ? '✅' : '❌');
    } catch (error) {
      console.log('Transcribe test: ❌', error);
    }

    console.log('STT APIs test results:', results);
    return results;
  }
}

// Export a singleton instance
export const speechToTextService = new SpeechToTextService();
export default speechToTextService;
