import React, { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

interface AgenticPageWrapperProps {
  children: ReactNode;
  pageName: string;
  pageDescription?: string;
  welcomeMessage?: string;
  onVoiceCommand?: (command: string) => void;
  walkerSelectors?: string;
  accentColor?: string;
  showOnLoad?: boolean;
}

/**
 * UNIVERSAL AGENTIC PAGE WRAPPER
 * 
 * Wrap any page with this component to add:
 * - Floating AgenticBar
 * - Walking cursor that guides users
 * - Voice commands
 * - Page-level voice navigation
 * 
 * Usage:
 * <AgenticPageWrapper pageName="Product Catalog" welcomeMessage="Welcome to products!">
 *   <YourPageContent />
 * </AgenticPageWrapper>
 */
const AgenticPageWrapper: React.FC<AgenticPageWrapperProps> = ({
  children,
  pageName,
  pageDescription,
  welcomeMessage,
  onVoiceCommand,
  walkerSelectors = 'button, a, input, select, textarea, [role="button"], .clickable, .card',
  accentColor = '#10b981',
  showOnLoad = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [walkerActive, setWalkerActive] = useState(false);
  const [walkerPosition, setWalkerPosition] = useState({ x: 0, y: 0 });
  const [showBar, setShowBar] = useState(showOnLoad);
  const [currentElement, setCurrentElement] = useState<string>('');
  const [elements, setElements] = useState<HTMLElement[]>([]);
  const [elementIndex, setElementIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);

        if (event.results[event.resultIndex].isFinal) {
          handleCommand(text.toLowerCase());
          onVoiceCommand?.(text);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isListening) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }

    // Welcome message
    if (welcomeMessage && showOnLoad) {
      setTimeout(() => speak(welcomeMessage), 500);
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    synthRef.current.speak(u);
  }, []);

  // Universal voice commands
  const handleCommand = (text: string) => {
    // Navigation
    if (text.includes('scroll down')) {
      window.scrollBy({ top: 400, behavior: 'smooth' });
      speak('Scrolling down');
    }
    else if (text.includes('scroll up')) {
      window.scrollBy({ top: -400, behavior: 'smooth' });
      speak('Scrolling up');
    }
    else if (text.includes('go to top') || text.includes('top of page')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      speak('Going to top');
    }
    else if (text.includes('go to bottom') || text.includes('bottom of page')) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      speak('Going to bottom');
    }
    // Walker controls
    else if (text.includes('start guide') || text.includes('guide me') || text.includes('show me around')) {
      setWalkerActive(true);
      speak('Starting guided tour');
    }
    else if (text.includes('stop guide') || text.includes('stop tour')) {
      setWalkerActive(false);
      speak('Tour stopped');
    }
    else if (text.includes('next')) {
      if (walkerActive) moveToNextElement();
    }
    else if (text.includes('previous') || text.includes('back')) {
      if (walkerActive) moveToPreviousElement();
    }
    // Bar controls
    else if (text.includes('hide bar') || text.includes('hide menu')) {
      setShowBar(false);
      speak('Bar hidden');
    }
    else if (text.includes('show bar') || text.includes('show menu')) {
      setShowBar(true);
      speak('Bar shown');
    }
    // Click element
    else if (text.includes('click') || text.includes('select') || text.includes('press')) {
      if (walkerActive && elements[elementIndex]) {
        elements[elementIndex].click();
        speak(`Clicked ${currentElement}`);
      }
    }
    // Help
    else if (text.includes('help') || text.includes('what can')) {
      speak(`On ${pageName}, you can say: scroll up, scroll down, guide me, next, click, or hide bar.`);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        speak(`Listening on ${pageName}`);
      } catch (e) {}
    }
  };

  // Walker logic - discover elements
  useEffect(() => {
    if (!walkerActive || !containerRef.current) return;

    const discovered = Array.from(
      containerRef.current.querySelectorAll(walkerSelectors)
    ) as HTMLElement[];

    const visible = discovered.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && 
             style.display !== 'none' && 
             style.visibility !== 'hidden' &&
             style.opacity !== '0';
    });

    // Sort by position
    visible.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      if (Math.abs(aRect.top - bRect.top) < 20) {
        return aRect.left - bRect.left;
      }
      return aRect.top - bRect.top;
    });

    setElements(visible);
    setElementIndex(0);
    
    if (visible.length > 0) {
      moveToElement(visible[0], 0);
    }
  }, [walkerActive, walkerSelectors]);

  // Move walker to element
  const moveToElement = (el: HTMLElement, idx: number) => {
    const rect = el.getBoundingClientRect();
    setWalkerPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    
    // Highlight
    el.style.outline = `2px solid ${accentColor}`;
    el.style.outlineOffset = '3px';
    el.style.boxShadow = `0 0 20px ${accentColor}40`;
    
    setTimeout(() => {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.boxShadow = '';
    }, 800);
    
    // Get label
    const label = el.getAttribute('aria-label') || 
                  el.getAttribute('placeholder') ||
                  el.textContent?.trim().substring(0, 30) ||
                  el.tagName.toLowerCase();
    setCurrentElement(label || 'element');
    
    // Scroll into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const moveToNextElement = () => {
    const nextIdx = (elementIndex + 1) % elements.length;
    setElementIndex(nextIdx);
    if (elements[nextIdx]) {
      moveToElement(elements[nextIdx], nextIdx);
      speak(currentElement);
    }
  };

  const moveToPreviousElement = () => {
    const prevIdx = (elementIndex - 1 + elements.length) % elements.length;
    setElementIndex(prevIdx);
    if (elements[prevIdx]) {
      moveToElement(elements[prevIdx], prevIdx);
    }
  };

  // Auto-advance walker
  useEffect(() => {
    if (!walkerActive || elements.length === 0) return;

    const interval = setInterval(() => {
      moveToNextElement();
    }, 3000);

    return () => clearInterval(interval);
  }, [walkerActive, elements, elementIndex]);

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: '100vh' }}>
      {children}

      {/* Walking Cursor */}
      {walkerActive && (
        <div
          style={{
            position: 'fixed',
            left: walkerPosition.x,
            top: walkerPosition.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            fontSize: 32,
            transition: 'all 0.4s ease-out',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
          }}
        >
          👆
        </div>
      )}

      {/* Target Label */}
      {walkerActive && currentElement && (
        <div
          style={{
            position: 'fixed',
            left: walkerPosition.x,
            top: walkerPosition.y + 40,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.9)',
            color: accentColor,
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: '0.8em',
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {currentElement}
        </div>
      )}

      {/* Floating AgenticBar */}
      {showBar && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: 25,
            padding: '10px 20px',
            border: `2px solid ${isListening ? accentColor : 'rgba(255,255,255,0.1)'}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Status indicator */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: isListening ? accentColor : walkerActive ? '#f59e0b' : '#64748b',
              animation: isListening ? 'pulse 1s infinite' : 'none',
              boxShadow: isListening ? `0 0 10px ${accentColor}` : 'none'
            }}
          />

          {/* Page name */}
          <span style={{ color: '#94a3b8', fontSize: '0.85em', fontWeight: 500 }}>
            {pageName}
          </span>

          {/* Waveform */}
          {isListening && (
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 2,
                    background: accentColor,
                    borderRadius: 1,
                    animation: `wave 0.3s ease-in-out ${i * 0.05}s infinite alternate`,
                    height: 8
                  }}
                />
              ))}
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <span
              style={{
                color: '#e2e8f0',
                fontSize: '0.85em',
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              "{transcript}"
            </span>
          )}

          {/* Listen button */}
          <button
            onClick={toggleListening}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: isListening ? '#ef4444' : accentColor,
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>

          {/* Walker button */}
          <button
            onClick={() => setWalkerActive(!walkerActive)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: `1px solid ${walkerActive ? accentColor : 'rgba(255,255,255,0.2)'}`,
              background: walkerActive ? `${accentColor}20` : 'transparent',
              color: walkerActive ? accentColor : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            {walkerActive ? '⏸️' : '🚶'}
          </button>

          {/* Close button */}
          <button
            onClick={() => setShowBar(false)}
            style={{
              padding: '4px 8px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.8em'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Show bar button when hidden */}
      {!showBar && (
        <button
          onClick={() => setShowBar(true)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.95)',
            border: `2px solid ${accentColor}30`,
            color: accentColor,
            fontSize: 20,
            cursor: 'pointer',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🎤
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes wave {
          from { height: 4px; }
          to { height: 14px; }
        }
      `}</style>
    </div>
  );
};

export default AgenticPageWrapper;
