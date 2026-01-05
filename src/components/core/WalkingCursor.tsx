/**
 * WalkingCursor - THE ONE WALKER FOR ENTIRE APP
 * 
 * Features:
 * - Auto-discovers interactive elements on page
 * - Walks between fields with smooth animation
 * - Works in modals, pages, anywhere
 * - Customizable appearance and behavior
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface WalkingCursorProps {
  enabled?: boolean;
  autoStart?: boolean;
  walkSpeed?: number;        // ms between steps
  pauseAtElement?: number;   // ms to pause at each element
  selectors?: string;        // CSS selectors to target
  excludeSelectors?: string; // CSS selectors to exclude
  containerRef?: React.RefObject<HTMLElement>;
  onVisit?: (element: HTMLElement, index: number) => void;
  onComplete?: () => void;
  variant?: 'pointer' | 'dot' | 'glow' | 'hand';
  color?: string;
  size?: number;
  zIndex?: number;
}

const DEFAULT_SELECTORS = 'input, textarea, button, a, [role="button"], select, [tabindex]:not([tabindex="-1"])';
const DEFAULT_EXCLUDE = '[disabled], [hidden], [aria-hidden="true"], .walker-exclude';

export const WalkingCursor: React.FC<WalkingCursorProps> = ({
  enabled = true,
  autoStart = true,
  walkSpeed = 2000,
  pauseAtElement = 500,
  selectors = DEFAULT_SELECTORS,
  excludeSelectors = DEFAULT_EXCLUDE,
  containerRef,
  onVisit,
  onComplete,
  variant = 'pointer',
  color = '#06b6d4',
  size = 24,
  zIndex = 99999
}) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isWalking, setIsWalking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elements, setElements] = useState<HTMLElement[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  const walkingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Discover elements
  const discoverElements = useCallback(() => {
    const container = containerRef?.current || document.body;
    const found = container.querySelectorAll(selectors);
    
    const filtered = Array.from(found).filter(el => {
      if (!el.matches || el.matches(excludeSelectors)) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) as HTMLElement[];
    
    // Sort by position (top-to-bottom, left-to-right)
    filtered.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      if (Math.abs(aRect.top - bRect.top) < 20) {
        return aRect.left - bRect.left;
      }
      return aRect.top - bRect.top;
    });
    
    setElements(filtered);
    return filtered;
  }, [selectors, excludeSelectors, containerRef]);

  // Move to element
  const moveToElement = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    setPosition({
      x: rect.left + scrollX + rect.width / 2,
      y: rect.top + scrollY + rect.height / 2
    });
    
    // Add highlight to element
    element.classList.add('walker-highlight');
    setTimeout(() => element.classList.remove('walker-highlight'), pauseAtElement);
  }, [pauseAtElement]);

  // Walk to next element
  const walkNext = useCallback(() => {
    if (!walkingRef.current || elements.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % elements.length;
    const element = elements[nextIndex];
    
    if (element) {
      moveToElement(element);
      setCurrentIndex(nextIndex);
      onVisit?.(element, nextIndex);
      
      if (nextIndex === 0 && currentIndex !== 0) {
        onComplete?.();
      }
    }
    
    timeoutRef.current = setTimeout(walkNext, walkSpeed);
  }, [elements, currentIndex, moveToElement, walkSpeed, onVisit, onComplete]);

  // Start walking
  const startWalking = useCallback(() => {
    const found = discoverElements();
    if (found.length === 0) return;
    
    walkingRef.current = true;
    setIsWalking(true);
    setIsVisible(true);
    setCurrentIndex(0);
    
    // Move to first element
    moveToElement(found[0]);
    onVisit?.(found[0], 0);
    
    timeoutRef.current = setTimeout(walkNext, walkSpeed);
  }, [discoverElements, moveToElement, walkNext, walkSpeed, onVisit]);

  // Stop walking
  const stopWalking = useCallback(() => {
    walkingRef.current = false;
    setIsWalking(false);
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Toggle walking
  const toggleWalking = useCallback(() => {
    if (isWalking) stopWalking();
    else startWalking();
  }, [isWalking, startWalking, stopWalking]);

  // Auto-start
  useEffect(() => {
    if (enabled && autoStart) {
      const timer = setTimeout(startWalking, 1000);
      return () => clearTimeout(timer);
    }
  }, [enabled, autoStart]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Re-discover on resize
  useEffect(() => {
    const handleResize = () => discoverElements();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [discoverElements]);

  if (!enabled || !isVisible) return null;

  // Cursor variants
  const cursorStyles: Record<string, React.CSSProperties> = {
    pointer: {
      width: 0, height: 0,
      borderLeft: `${size/2}px solid transparent`,
      borderRight: `${size/2}px solid transparent`,
      borderBottom: `${size}px solid ${color}`,
      transform: 'rotate(-45deg)'
    },
    dot: {
      width: size, height: size,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 ${size}px ${color}`
    },
    glow: {
      width: size * 2, height: size * 2,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: 0.8
    },
    hand: {
      fontSize: size,
      lineHeight: 1
    }
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex,
          transition: `all ${walkSpeed * 0.3}ms ease-out`,
          ...cursorStyles[variant]
        }}
      >
        {variant === 'hand' && '👆'}
      </div>
      
      {/* Control button */}
      <button
        onClick={toggleWalking}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: isWalking ? '#ef4444' : color,
          border: 'none',
          color: 'white',
          fontSize: 20,
          cursor: 'pointer',
          zIndex: zIndex + 1,
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
        title={isWalking ? 'Stop Walker' : 'Start Walker'}
      >
        {isWalking ? '⏹' : '🚶'}
      </button>
      
      <style>{`
        .walker-highlight {
          outline: 3px solid ${color} !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 20px ${color}40 !important;
          transition: all 0.3s ease !important;
        }
      `}</style>
    </>
  );
};

export default WalkingCursor;
