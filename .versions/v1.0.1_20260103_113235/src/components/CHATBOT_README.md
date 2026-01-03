# Chatbot Modal Feature

## Overview
The chatbot modal is a feature that allows users to interact with an AI assistant through a floating ask bar. When users type or search anything in the floating ask bar, it opens a chatbot window with smooth animations.

## Components

### 1. ChatbotModal (`src/components/ChatbotModal.tsx`)
- Main chatbot interface component
- Displays conversation history with user and AI messages
- Shows property listings in a grid layout
- Includes VR tour functionality
- Features smooth animations and responsive design
- Integrated voice-to-voice functionality

### 2. VoiceToVoiceModal (`src/components/VoiceToVoiceModal.tsx`)
- Dedicated voice conversation modal
- Real-time audio recording and processing
- Speech-to-text and text-to-speech capabilities
- Visual audio level indicators
- ChatGPT-like voice interaction experience

### 3. ChatbotContext (`src/contexts/ChatbotContext.tsx`)
- React context for managing chatbot state
- Provides `openChatbot`, `closeChatbot`, and `toggleChatbot` functions
- Manages initial message state
- Includes voice modal state management

### 4. FloatingAskBar Integration
- Modified to integrate with chatbot modal
- Clicking anywhere on the ask bar opens the chatbot
- Submitting a message opens the chatbot with that message
- Individual buttons (attach, mic, send) have their own functionality

## Features

### Animations
- **Fade In**: Background overlay fades in smoothly
- **Slide Up**: Chatbot modal slides up from bottom with scale effect
- **Property Cards**: Hover effects with scale and shadow transitions

### UI Elements
- **Header**: VistaView AI branding with golden star logo
- **Messages**: User messages (right-aligned, gray) and AI messages (left-aligned, green)
- **Property Cards**: Interactive cards with images, details, and action buttons
- **VR Tour**: Interactive button for virtual tour functionality
- **Input Bar**: Modern input with icons for attach, voice-to-voice, microphone, and send
- **Voice-to-Voice**: Dedicated voice conversation modal with real-time audio processing

### Responsive Design
- Mobile-first approach
- Grid layout adapts to screen size
- Touch-friendly interface elements

## Usage

### Opening the Chatbot
```typescript
const { openChatbot } = useChatbot();

// Open with empty message
openChatbot();

// Open with specific message
openChatbot("I want to check premium properties in New York");
```

### Opening Voice-to-Voice Modal
```typescript
const { openVoiceModal } = useChatbot();
openVoiceModal();
```

### Closing Modals
```typescript
const { closeChatbot, closeVoiceModal } = useChatbot();
closeChatbot();
closeVoiceModal();
```

## Styling

### CSS Classes
- `.animate-chatbot-slide-up`: Main modal entrance animation
- `.animate-fade-in`: Background overlay animation
- `.chatbot-modal`: Responsive modal container
- `.chatbot-property-grid`: Responsive property grid

### Color Scheme
- Primary: `#004236` (Dark green)
- Secondary: `#007E67` (Light green)
- Accent: `#F5EC9B` (Gold)
- Background: White with transparency and backdrop blur

## Integration

The chatbot is integrated into the main App component through:
1. `ChatbotProvider` wraps the entire app
2. `ChatbotModalWrapper` renders the modal
3. `FloatingAskBar` triggers the chatbot

## Future Enhancements

- Real AI integration for dynamic responses
- Property data from API
- Voice input/output capabilities
- Advanced filtering and search
- User authentication integration
- Chat history persistence
