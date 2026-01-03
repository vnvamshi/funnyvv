# Speech-to-Text Fallback System Documentation

## Overview

The VistaView application now includes a robust speech-to-text (STT) fallback system that allows you to configure which STT API to use first and which to use as a fallback if the primary API fails. This ensures maximum reliability for voice-to-voice interactions.

## Features

- **Configurable Primary API**: Choose which STT API to use first
- **Automatic Fallback**: Seamlessly switch to backup API if primary fails
- **No API Key Required for Transcribe**: Backend transcribe API doesn't need API keys
- **Environment-based Configuration**: Easy configuration through environment variables
- **Comprehensive Logging**: Detailed logs for debugging and monitoring
- **API Testing**: Built-in functionality to test both APIs

## Supported APIs

### 1. ElevenLabs STT
- **Requires**: `VITE_ELEVENLABS_API_KEY` environment variable
- **Model**: Uses `scribe_v1` model
- **Features**: High-quality transcription, multilingual support
- **Fallback**: Will fail if API key is missing or invalid

### 2. Backend Transcribe API
- **Requires**: No API key needed
- **Endpoint**: `/common/audio/transcribe/`
- **Features**: Server-side processing, reliable fallback
- **Fallback**: Depends on backend service availability

## Environment Configuration

Add these variables to your `.env` file:

```env
# Speech-to-Text API Configuration
# Primary STT API to use first (options: 'elevenlabs', 'transcribe')
VITE_STT_PRIMARY_API=elevenlabs

# Fallback STT API to use if primary fails (options: 'elevenlabs', 'transcribe')
VITE_STT_FALLBACK_API=transcribe

# Enable STT API fallback system (true/false)
VITE_STT_FALLBACK_ENABLED=true

# ElevenLabs API Key (required if using elevenlabs as primary or fallback)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Configuration Options

### Primary API Options
- `elevenlabs`: Use ElevenLabs STT first
- `transcribe`: Use backend transcribe API first

### Fallback API Options
- `elevenlabs`: Use ElevenLabs STT as fallback
- `transcribe`: Use backend transcribe API as fallback

### Fallback System
- `true`: Enable automatic fallback to secondary API
- `false`: Disable fallback, only use primary API

## Usage Examples

### Example 1: ElevenLabs Primary, Transcribe Fallback
```env
VITE_STT_PRIMARY_API=elevenlabs
VITE_STT_FALLBACK_API=transcribe
VITE_STT_FALLBACK_ENABLED=true
VITE_ELEVENLABS_API_KEY=your_key_here
```
**Flow**: Try ElevenLabs → If fails → Try Transcribe API

### Example 2: Transcribe Primary, ElevenLabs Fallback
```env
VITE_STT_PRIMARY_API=transcribe
VITE_STT_FALLBACK_API=elevenlabs
VITE_STT_FALLBACK_ENABLED=true
VITE_ELEVENLABS_API_KEY=your_key_here
```
**Flow**: Try Transcribe API → If fails → Try ElevenLabs

### Example 3: ElevenLabs Only (No Fallback)
```env
VITE_STT_PRIMARY_API=elevenlabs
VITE_STT_FALLBACK_API=transcribe
VITE_STT_FALLBACK_ENABLED=false
VITE_ELEVENLABS_API_KEY=your_key_here
```
**Flow**: Try ElevenLabs only, no fallback

### Example 4: Transcribe Only (No Fallback)
```env
VITE_STT_PRIMARY_API=transcribe
VITE_STT_FALLBACK_API=elevenlabs
VITE_STT_FALLBACK_ENABLED=false
```
**Flow**: Try Transcribe API only, no fallback (no API key needed)

## Implementation Details

### Service Architecture

The STT fallback system is implemented in `src/services/speechToTextService.ts`:

```typescript
import { speechToTextService } from '../services/speechToTextService';

// Basic usage
const result = await speechToTextService.speechToText(audioFile, 'scribe_v1');

if (result.success) {
  console.log('Transcription:', result.text);
  console.log('API used:', result.api); // 'elevenlabs' or 'transcribe'
} else {
  console.error('STT failed:', result.error);
}
```

### Result Object

The service returns a standardized result object:

```typescript
interface STTResult {
  text: string;           // Transcribed text
  api: 'elevenlabs' | 'transcribe';  // Which API was used
  success: boolean;       // Whether transcription succeeded
  error?: string;         // Error message if failed
}
```

### Integration with VoiceToVoiceModal

The `VoiceToVoiceModal` component automatically uses the new STT service:

```typescript
// Old implementation (removed)
const stt = await elevenLabsService.speechToText(audioFile, 'scribe_v1');
if (!stt) {
  response = await transcribeAudio(audioFile);
}

// New implementation
const sttResult = await speechToTextService.speechToText(audioFile, 'scribe_v1');
if (sttResult.success) {
  // Use sttResult.text
  console.log(`Success using ${sttResult.api} API`);
}
```

## Testing and Debugging

### Console Logging

The service provides comprehensive logging:

```
=== STT Service: Starting transcription ===
Audio file type: audio/wav
Audio file size: 12345 bytes
Primary API: elevenlabs
Fallback enabled: true
🎯 Trying elevenlabs API...
❌ elevenlabs API error: API key not found
🔄 Trying fallback API: transcribe
🎯 Trying transcribe API...
✅ Fallback API succeeded: transcribe
```

### API Testing

You can test both APIs programmatically:

```typescript
import { speechToTextService } from '../services/speechToTextService';

// Test API availability
const testResults = await speechToTextService.testApis(audioFile);
console.log('ElevenLabs available:', testResults.elevenlabs);
console.log('Transcribe available:', testResults.transcribe);
```

### Configuration Testing

You can update configuration at runtime for testing:

```typescript
// Update config for testing
speechToTextService.updateConfig({
  primaryApi: 'transcribe',
  fallbackApi: 'elevenlabs',
  fallbackEnabled: true
});

// Get current config
const config = speechToTextService.getConfig();
console.log('Current config:', config);
```

## Error Handling

### Common Error Scenarios

1. **ElevenLabs API Key Missing**
   - Error: "ElevenLabs service not ready - API key may be missing"
   - Fallback: Automatically tries transcribe API

2. **Network Issues**
   - Error: "STT request failed: 500 Internal Server Error"
   - Fallback: Tries secondary API

3. **Invalid Audio Format**
   - Error: "Unknown error"
   - Both APIs may fail

4. **Backend Service Down**
   - Error: "Transcribe API returned empty or invalid result"
   - Fallback: Tries ElevenLabs if configured

### Error Response Format

```typescript
{
  text: '',
  api: 'elevenlabs',
  success: false,
  error: 'Both elevenlabs and transcribe APIs failed'
}
```

## Best Practices

### 1. Configuration Recommendations

**For Production with ElevenLabs API Key:**
```env
VITE_STT_PRIMARY_API=elevenlabs
VITE_STT_FALLBACK_API=transcribe
VITE_STT_FALLBACK_ENABLED=true
```

**For Development without API Key:**
```env
VITE_STT_PRIMARY_API=transcribe
VITE_STT_FALLBACK_API=elevenlabs
VITE_STT_FALLBACK_ENABLED=false
```

### 2. Monitoring

- Monitor console logs for API success/failure rates
- Track which API is being used most frequently
- Set up alerts for consistent API failures

### 3. Performance Considerations

- ElevenLabs typically provides faster responses
- Transcribe API may have higher latency but better reliability
- Consider your network conditions when choosing primary API

## Troubleshooting

### Issue: Both APIs Failing

**Symptoms:**
- Console shows "All STT APIs failed"
- User gets "Sorry, I couldn't understand what you said" message

**Solutions:**
1. Check network connectivity
2. Verify ElevenLabs API key is valid
3. Check backend transcribe service status
4. Test with different audio formats

### Issue: Fallback Not Working

**Symptoms:**
- Only primary API is tried
- No fallback attempt in logs

**Solutions:**
1. Verify `VITE_STT_FALLBACK_ENABLED=true`
2. Ensure fallback API is different from primary
3. Check environment variable loading

### Issue: Transcribe API Not Working

**Symptoms:**
- "Transcribe API returned empty or invalid result"
- Backend errors in network tab

**Solutions:**
1. Check backend service status
2. Verify audio file format compatibility
3. Check backend logs for specific errors

## Migration Guide

### From Old Implementation

**Before:**
```typescript
// Manual fallback logic
let response = null;
try {
  const stt = await elevenLabsService.speechToText(audioFile, 'scribe_v1');
  if (stt && stt.text) {
    response = { success: true, data: { text: stt.text } };
  }
} catch (_e) {
  // ignore and fallback
}
if (!response) {
  response = await transcribeAudio(audioFile);
}
```

**After:**
```typescript
// Automatic fallback with configuration
const sttResult = await speechToTextService.speechToText(audioFile, 'scribe_v1');
if (sttResult.success) {
  // Use sttResult.text
  console.log(`Success using ${sttResult.api} API`);
}
```

### Environment Variables

Add the new STT configuration variables to your `.env` file:

```env
# Add these new variables
VITE_STT_PRIMARY_API=elevenlabs
VITE_STT_FALLBACK_API=transcribe
VITE_STT_FALLBACK_ENABLED=true
```

## API Reference

### SpeechToTextService Methods

#### `speechToText(audioFile, modelId?)`
Main method for speech-to-text conversion with fallback.

**Parameters:**
- `audioFile`: File | Blob - Audio file to transcribe
- `modelId`: string (optional) - Model ID for ElevenLabs (default: 'scribe_v1')

**Returns:** Promise<STTResult>

#### `getConfig()`
Get current configuration.

**Returns:** STTConfig

#### `updateConfig(config)`
Update configuration at runtime.

**Parameters:**
- `config`: Partial<STTConfig> - Configuration updates

#### `testApis(audioFile)`
Test both APIs for availability.

**Parameters:**
- `audioFile`: File | Blob - Test audio file

**Returns:** Promise<{elevenlabs: boolean, transcribe: boolean}>

This documentation provides comprehensive guidance for implementing and using the STT fallback system in your VistaView application.
