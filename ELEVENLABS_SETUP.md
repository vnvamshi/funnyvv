# ElevenLabs Integration Setup

Your voice chatbot now uses ElevenLabs for high-quality text-to-speech instead of the browser's built-in speech synthesis.

## Setup Instructions

### 1. Get ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for an account
3. Go to your profile settings
4. Copy your API key

### 2. Configure Environment Variables
1. Copy `env.example` to `.env` in your project root
2. Add your ElevenLabs API key:
   ```
   VITE_ELEVENLABS_API_KEY=your_actual_api_key_here
   ```

### 3. Restart Development Server
```bash
npm run dev
```

## Features

### ✅ **High-Quality Voice Synthesis**
- Professional-grade AI voices
- Multiple voice options with different languages, genders, and ages
- Natural-sounding speech with proper intonation

### ✅ **Voice Selection**
- Choose from available ElevenLabs voices
- Voice details show language, gender, and age
- Default voice automatically selected

### ✅ **Seamless Integration**
- Works with existing voice activity detection
- Maintains all current functionality
- Automatic fallback handling

### ✅ **Enhanced Audio Control**
- Better audio quality than browser TTS
- Consistent voice across different browsers
- Professional voice options

## Voice Selection

The voice selection dropdown now shows:
- **Voice Name**: The name of the ElevenLabs voice
- **Language**: Primary language of the voice
- **Gender**: Male/Female voice characteristics
- **Age**: Young/Adult/Mature voice characteristics

## Troubleshooting

### If voices don't load:
1. Check that your API key is correct
2. Ensure you have an active ElevenLabs subscription
3. Check browser console for error messages

### If speech doesn't work:
1. Verify the API key is set correctly
2. Check your ElevenLabs account has available credits
3. Ensure microphone permissions are granted

### Fallback Behavior:
- If ElevenLabs fails to load, the system will show a warning
- Voice features will be disabled until ElevenLabs is properly configured
- All other functionality remains intact

## API Usage

The integration uses the `eleven_multilingual_v2` model with optimized settings:
- **Stability**: 0.5 (balanced between consistency and expressiveness)
- **Similarity Boost**: 0.75 (maintains voice characteristics)
- **Speaker Boost**: Enabled (enhanced clarity)

## Cost Considerations

ElevenLabs charges based on character count. Monitor your usage in the ElevenLabs dashboard to manage costs effectively.
