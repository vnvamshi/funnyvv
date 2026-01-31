// ═══════════════════════════════════════════════════════════════════════════════
// DIGITAL AVATAR ASSISTANT
// Walking, talking human-like AI that guides users through products
// Increases engagement & conversions
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';

interface DigitalAvatarProps {
  isVisible?: boolean;
  autoGreet?: boolean;
  position?: 'left' | 'right';
  onProductClick?: (productUrl: string) => void;
}

type AvatarState = 'idle' | 'walking' | 'talking' | 'pointing' | 'waving' | 'thinking';
type AvatarMood = 'happy' | 'excited' | 'helpful' | 'neutral';

const DigitalAvatar: React.FC<DigitalAvatarProps> = ({
  isVisible = true,
  autoGreet = true,
  position = 'right',
  onProductClick
}) => {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [mood, setMood] = useState<AvatarMood>('happy');
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [positionX, setPositionX] = useState(position === 'right' ? 85 : 15);

  // Avatar expressions based on mood
  const expressions: Record<AvatarMood, string> = {
    happy: '😊',
    excited: '🤩',
    helpful: '🤗',
    neutral: '😌'
  };

  // Greeting messages
  const greetings = [
    "Hi there! 👋 I'm Vista, your furniture shopping guide!",
    "Welcome! Looking for something special today?",
    "Hey! Need help finding the perfect piece?",
    "Hello! I can help you compare prices across 100+ stores!"
  ];

  // Product suggestions based on time/context
  const suggestions = [
    { text: "🛋️ Mid-century sofas are trending!", search: "mid century sofa" },
    { text: "🛏️ Check out our bed frame deals!", search: "queen bed frame" },
    { text: "💺 Ergonomic chairs for your home office?", search: "ergonomic office chair" },
    { text: "🪑 IKEA just dropped new designs!", search: "ikea furniture" },
    { text: "🔥 Temu has crazy deals right now!", search: "furniture temu" }
  ];

  // Auto-greet on first visit
  useEffect(() => {
    if (autoGreet && !hasGreeted && isVisible) {
      const timer = setTimeout(() => {
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        speak(greeting, 'waving');
        setHasGreeted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoGreet, hasGreeted, isVisible]);

  // Random idle animations
  useEffect(() => {
    if (avatarState === 'idle' && !showBubble) {
      const interval = setInterval(() => {
        const actions: AvatarState[] = ['waving', 'pointing', 'thinking'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        // Occasionally give a suggestion
        if (Math.random() > 0.7) {
          const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
          speak(suggestion.text, 'pointing');
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [avatarState, showBubble]);

  const speak = useCallback((text: string, action: AvatarState = 'talking') => {
    setMessage(text);
    setShowBubble(true);
    setAvatarState(action);

    // Use Web Speech API for voice
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[🛋️🛏️💺🪑🔥👋]/g, ''));
      utterance.rate = 1;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      // Find a nice voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Google') ||
        v.name.includes('Female')
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
      setShowBubble(false);
      setAvatarState('idle');
    }, 5000);
  }, []);

  const walkTo = useCallback((targetX: number) => {
    setAvatarState('walking');
    const startX = positionX;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic

      setPositionX(startX + (targetX - startX) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAvatarState('idle');
      }
    };

    requestAnimationFrame(animate);
  }, [positionX]);

  const handleSuggestionClick = (search: string) => {
    speak(`Great choice! Let me show you the best deals!`, 'excited');
    setTimeout(() => {
      window.location.href = `/compare?q=${encodeURIComponent(search)}`;
    }, 1500);
  };

  const handleAvatarClick = () => {
    if (isMinimized) {
      setIsMinimized(false);
      speak("I'm back! How can I help you find great furniture deals?", 'waving');
    } else {
      const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      speak(suggestion.text, 'pointing');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 z-40 transition-all duration-500 ${isMinimized ? 'scale-75' : 'scale-100'}`}
      style={{ left: `${positionX}%`, transform: 'translateX(-50%)' }}
    >
      {/* Speech Bubble */}
      {showBubble && !isMinimized && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 animate-bounce-in">
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200 relative">
            <p className="text-sm text-gray-800">{message}</p>

            {/* Quick action buttons */}
            {avatarState === 'pointing' && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleSuggestionClick(suggestions[0].search)}
                  className="text-xs px-3 py-1 bg-teal-500 text-white rounded-full hover:bg-teal-600"
                >
                  Show me!
                </button>
                <button
                  onClick={() => setShowBubble(false)}
                  className="text-xs px-3 py-1 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
                >
                  Maybe later
                </button>
              </div>
            )}

            {/* Bubble tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Avatar Character */}
      <div
        onClick={handleAvatarClick}
        className={`relative cursor-pointer transition-transform hover:scale-110 ${
          avatarState === 'walking' ? 'animate-walk' : ''
        } ${avatarState === 'waving' ? 'animate-wave' : ''}`}
      >
        {/* Avatar Body */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-30 animate-pulse"></div>

          {/* Main avatar circle */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-3xl">
              {avatarState === 'thinking' ? '🤔' :
               avatarState === 'waving' ? '👋' :
               avatarState === 'pointing' ? '👉' :
               avatarState === 'excited' ? '🤩' :
               expressions[mood]}
            </span>
          </div>

          {/* Name tag */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
            Vista AI
          </div>

          {/* Status indicator */}
          <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            avatarState === 'idle' ? 'bg-green-400' :
            avatarState === 'talking' ? 'bg-blue-400 animate-pulse' :
            'bg-yellow-400'
          }`}></div>
        </div>

        {/* Minimize button */}
        {!isMinimized && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs"
          >
            −
          </button>
        )}
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes bounce-in {
          0% { transform: translateX(-50%) scale(0); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.1); }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes walk {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-3px) rotate(-5deg); }
          75% { transform: translateY(-3px) rotate(5deg); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-bounce-in { animation: bounce-in 0.3s ease-out; }
        .animate-walk { animation: walk 0.5s ease-in-out infinite; }
        .animate-wave { animation: wave 0.5s ease-in-out 3; }
      `}</style>
    </div>
  );
};

export default DigitalAvatar;
