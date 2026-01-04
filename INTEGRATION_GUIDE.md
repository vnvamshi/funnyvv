# VistaView MrVAssistant Integration Guide

## How to Connect MrVAssistant to the Agentic Backend

### Step 1: Import the API
In your MrVAssistant.tsx, add at the top:
```typescript
import { sendVoiceToAgentic } from '../utils/agenticAPI';
```

### Step 2: Update processCommand function
Find the `processCommand` function and add this at the beginning:
```typescript
const processCommand = async (text: string) => {
  const lower = text.toLowerCase();
  
  // Send to agentic backend for analysis + learning
  const agenticResponse = await sendVoiceToAgentic(text, 'boss', window.location.pathname);
  
  if (agenticResponse?.analysis) {
    console.log('[MrV] Analysis:', agenticResponse.analysis);
    // Use agenticResponse.tts_response.text for smarter TTS if needed
  }
  
  // ... rest of your existing processCommand logic
};
```

### Step 3: Update API constant
Change the API constant from:
```typescript
const API = 'http://localhost:3005/api';
```
To:
```typescript
const API = 'http://localhost:3005/api';  // Keep for your existing endpoints
const AGENTIC_API = 'http://localhost:1117/api';  // New agentic backend
```

### That's it!
Your MrVAssistant will now:
- Log all voice interactions to the global ledger
- Get empathy analysis
- Learn patterns automatically
- Get context-aware TTS responses
