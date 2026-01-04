# 🧠 VOICE FIX INSTRUCTIONS

## THE PROBLEM
Two voice systems (VoiceBrain + useVoice) were fighting for the microphone.
Browser aborts when multiple recognition instances compete → infinite loop.

## THE SOLUTION
Single VoiceManager singleton that OWNS the microphone.
All components subscribe to it instead of creating their own recognition.

## FILES CREATED

1. `src/lib/VoiceManager.ts` - The singleton (ONE mic owner)
2. `src/hooks/useVoiceManager.ts` - React hook to use VoiceManager
3. `src/components/AgenticBar.tsx` - Unified voice control bar

## HOW TO INTEGRATE

### Step 1: Update MrVAssistant.tsx

Remove these imports:
```typescript
// REMOVE:
import { useVoice } from '../hooks/useVoice';
import VoiceBrain from './VoiceBrain';
```

Add this import:
```typescript
// ADD:
import { useVoiceManager } from '../hooks/useVoiceManager';
```

Replace voice hook usage:
```typescript
// BEFORE:
const { isListening, transcript, ... } = useVoice();

// AFTER:
const { isListening, transcript, state, toggle, speak } = useVoiceManager();
```

### Step 2: Remove VoiceBrain component

If you have `<VoiceBrain />` anywhere, REMOVE IT.
The VoiceManager handles everything now.

### Step 3: Use AgenticBar globally

In your App.tsx or layout:
```typescript
import { AgenticBar } from './components/AgenticBar';

function App() {
    return (
        <>
            {/* Your app content */}
            <AgenticBar context="Home" />
        </>
    );
}
```

### Step 4: Initialize VoiceManager early

In your main entry (main.tsx or App.tsx):
```typescript
import { voiceManager } from './lib/VoiceManager';

// Initialize on app start
voiceManager.init();
```

## DUPLEX POLICY (IMPORTANT!)

The VoiceManager enforces:
- When TTS starts → STT pauses automatically
- When TTS ends → STT resumes automatically

You don't need to manage this manually.

## TESTING

1. Open console, should see:
   - `[VoiceManager] ✅ Initialized` (once)
   - `[VoiceManager] 🎤 Recognition STARTED` (when you click mic)
   - NO more `[VoiceBrain]` or duplicate `[VOICE]` logs

2. Speak something:
   - Should see `[VoiceManager] Processing: <your text>`
   - Response from backend
   - TTS plays (if talkative mode)
   - STT resumes after TTS

## TROUBLESHOOTING

If mic still loops:
- Check there's NO other SpeechRecognition.start() anywhere
- Search codebase for `webkitSpeechRecognition` - should only be in VoiceManager.ts
- Check DevTools Network tab - should see POST to /api/ledger/log
