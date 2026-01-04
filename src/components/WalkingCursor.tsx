/**
 * WalkingCursor - A character that follows the mouse
 */
import React, { useState, useEffect, useRef } from 'react';

interface WalkingCursorProps {
    character?: string;
    enabled?: boolean;
}

export const WalkingCursor: React.FC<WalkingCursorProps> = ({
    character = '🚶',
    enabled = true
}) => {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isWalking, setIsWalking] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const targetRef = useRef({ x: 100, y: 100 });
    const animationRef = useRef<number>();
    
    useEffect(() => {
        if (!enabled) return;
        
        const handleMouseMove = (e: MouseEvent) => {
            targetRef.current = { x: e.clientX - 16, y: e.clientY - 32 };
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [enabled]);
    
    useEffect(() => {
        if (!enabled) return;
        
        const animate = () => {
            setPosition(prev => {
                const dx = targetRef.current.x - prev.x;
                const dy = targetRef.current.y - prev.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 5) {
                    setIsWalking(false);
                    return prev;
                }
                
                setIsWalking(true);
                setDirection(dx > 0 ? 'right' : 'left');
                
                const speed = 0.1;
                return {
                    x: prev.x + dx * speed,
                    y: prev.y + dy * speed
                };
            });
            
            animationRef.current = requestAnimationFrame(animate);
        };
        
        animationRef.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [enabled]);
    
    if (!enabled) return null;
    
    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                fontSize: '32px',
                pointerEvents: 'none',
                zIndex: 99999,
                transform: `scaleX(${direction === 'left' ? -1 : 1})`,
                transition: 'transform 0.2s',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                opacity: isWalking ? 1 : 0.7
            }}
        >
            {character}
        </div>
    );
};

export default WalkingCursor;
