import React, { useState, useEffect } from 'react';

interface AnimatedCursorProps {
  enabled?: boolean;
}

const AnimatedCursor: React.FC<AnimatedCursorProps> = ({ enabled = true }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isWalking, setIsWalking] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  // Animation to walk cursor to element
  const walkTo = (element: HTMLElement) => {
    if (!element) return;
    setIsWalking(true);
    setTargetElement(element);
    
    const rect = element.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    
    const startX = position.x;
    const startY = position.y;
    const duration = 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setPosition({
        x: startX + (targetX - startX) * eased,
        y: startY + (targetY - startY) * eased
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsWalking(false);
        element.click();
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Expose walkTo globally for AI to use
  useEffect(() => {
    (window as any).aiWalkTo = (selector: string) => {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) walkTo(el);
    };
  }, [position]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x - 15,
        top: position.y - 15,
        width: 30,
        height: 30,
        pointerEvents: 'none',
        zIndex: 999999,
        transition: isWalking ? 'none' : 'transform 0.1s',
        transform: isWalking ? 'scale(1.2)' : 'scale(1)',
      }}
    >
      {isWalking ? (
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #B8860B 0%, #F5EC9B 100%)',
          boxShadow: '0 2px 10px rgba(184,134,11,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 0.5s infinite',
          fontSize: 16
        }}>
          🚶
        </div>
      ) : (
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #B8860B 0%, #F5EC9B 100%)',
          boxShadow: '0 2px 8px rgba(184,134,11,0.4)',
          margin: 9
        }} />
      )}
    </div>
  );
};

export default AnimatedCursor;
