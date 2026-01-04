# Agentic Integration Guide

## To Add GlobalAgenticBar to Your App:

Add this to your main App.tsx or layout:

```tsx
import { GlobalAgenticBar } from './components/global';
import { Teleprompter, initWalkAndClick, initGLBVoiceControl } from './agentic';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    initWalkAndClick();
    initGLBVoiceControl();
  }, []);

  return (
    <>
      {/* Your existing app content */}
      <GlobalAgenticBar />
      <Teleprompter position="bottom" style="full" />
    </>
  );
}
```

## Voice Commands:

### Navigation:
- "sign in" / "login" - Opens sign in
- "vendor" - Goes to vendor flow
- "go back" / "back" - Navigate back
- "close" / "cancel" - Close modal
- "products" - Go to products page

### Control:
- "hey" / "pause" - Pause listening
- "resume" / "continue" - Resume listening
- "talkative mode" - More verbose
- "text mode" - Silent mode

### GLB Building (on Skyven page):
- "go to floor 44" - Navigate to floor
- "lobby" / "rooftop" / "pool" - Go to hotspot
- "exterior view" / "aerial view" - Camera presets
- "go up" / "go down" - Next/previous floor
