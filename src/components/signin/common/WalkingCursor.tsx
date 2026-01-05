import React, { useState, useEffect, useCallback, useRef } from 'react';

interface WalkingCursorProps {
  containerRef: React.RefObject<HTMLElement>;
  isActive: boolean;
  onElementVisit?: (element: HTMLElement, index: number) => void;
  onComplete?: () => void;
  speed?: number;
  variant?: 'pointer' | 'dot' | 'glow' | 'hand';
  color?: string;
  autoStart?: boolean;
  loop?: boolean;
  selectors?: string;
}

const WalkingCursor: React.FC<WalkingCursorProps> = ({
  containerRef,
  isActive,
  onElementVisit,
  onComplete,
  speed = 800,
  variant = 'hand',
  color = '#06b6d4',
  autoStart = true,
  loop = false,
  selectors = 'button, input, textarea, select, [role="button"], a, .clickable, .role-card'
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetName, setTargetName] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementsRef = useRef<HTMLElement[]>([]);

  // Discover interactive elements
  const discoverElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const elements = Array.from(
      containerRef.current.querySelectorAll(selectors)
    ) as HTMLElement[];
    
    // Filter visible, enabled elements
    const filtered = elements.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        !el.hasAttribute('disabled')
      );
    });
    
    // Sort top-to-bottom, left-to-right
    filtered.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      if (Math.abs(rectA.top - rectB.top) > 20) return rectA.top - rectB.top;
      return rectA.left - rectB.left;
    });
    
    return filtered;
  }, [containerRef, selectors]);

  // Move to element
  const moveToElement = useCallback((element: HTMLElement, index: number) => {
    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    
    // Position cursor at element center
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;
    
    setPosition({ x, y });
    setTargetName(
      element.getAttribute('aria-label') ||
      element.getAttribute('placeholder') ||
      element.textContent?.slice(0, 20) ||
      element.tagName.toLowerCase()
    );
    
    // Highlight element
    element.classList.add('walker-highlight');
    element.style.outline = `2px solid ${color}`;
    element.style.outlineOffset = '3px';
    element.style.boxShadow = `0 0 20px ${color}40`;
    
    // Remove highlight after delay
    setTimeout(() => {
      element.classList.remove('walker-highlight');
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.style.boxShadow = '';
    }, speed - 100);
    
    onElementVisit?.(element, index);
  }, [containerRef, color, speed, onElementVisit]);

  // Walking loop
  useEffect(() => {
    if (!isActive || !autoStart) {
      setVisible(false);
      return;
    }
    
    elementsRef.current = discoverElements();
    
    if (elementsRef.current.length === 0) {
      setVisible(false);
      return;
    }
    
    setVisible(true);
    setCurrentIndex(0);
    
    const walk = (index: number) => {
      if (index >= elementsRef.current.length) {
        if (loop) {
          timeoutRef.current = setTimeout(() => walk(0), speed);
        } else {
          setVisible(false);
          onComplete?.();
        }
        return;
      }
      
      moveToElement(elementsRef.current[index], index);
      setCurrentIndex(index);
      
      timeoutRef.current = setTimeout(() => walk(index + 1), speed);
    };
    
    // Start walking after small delay
    timeoutRef.current = setTimeout(() => walk(0), 500);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isActive, autoStart, discoverElements, moveToElement, speed, loop, onComplete]);

  // Cursor variants
  const getCursor = () => {
    switch (variant) {
      case 'hand':
        return <span style={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>👆</span>;
      case 'pointer':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
            <path d="M4 4l16 8-8 2-2 8z" />
          </svg>
        );
      case 'dot':
        return (
          <div style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 20px ${color}`
          }} />
        );
      case 'glow':
        return (
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            animation: 'cursorPulse 1s infinite'
          }} />
        );
      default:
        return <span style={{ fontSize: 28 }}>👆</span>;
    }
  };

  if (!visible) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: `all ${speed * 0.4}ms ease-out`
        }}
      >
        {getCursor()}
      </div>
      
      {/* Target label */}
      {targetName && (
        <div
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y + 35,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 11,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            transition: `all ${speed * 0.3}ms ease-out`
          }}
        >
          {targetName}
        </div>
      )}
      
      <style>{`
        @keyframes cursorPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        .walker-highlight {
          transition: all 0.2s ease-out !important;
        }
      `}</style>
    </>
  );
};

export default WalkingCursor;
