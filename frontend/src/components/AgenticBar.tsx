/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VISTAVIEW AGENTIC BAR - UNIFIED VOICE CONTROL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This is the SINGLE voice controller for the entire app.
 * It uses VoiceManager singleton - no duplicate mic access.
 */

import React, { useState, useEffect } from 'react';
import { useVoiceManager } from '../hooks/useVoiceManager';

interface AgenticBarProps {
    context?: string;
    onNavigate?: (route: string) => void;
}

export const AgenticBar: React.FC<AgenticBarProps> = ({ context = 'Home', onNavigate }) => {
    const {
        state,
        transcript,
        lastResponse,
        isListening,
        isSpeaking,
        isProcessing,
        start,
        stop,
        toggle,
        speak,
        setMode
    } = useVoiceManager();
    
    const [currentMode, setCurrentMode] = useState<'interactive' | 'talkative' | 'text'>('interactive');
    
    const handleModeChange = (mode: 'interactive' | 'talkative' | 'text') => {
        setCurrentMode(mode);
        setMode(mode);
        
        if (mode === 'text') {
            stop();
        }
    };
    
    const getStateIcon = () => {
        switch (state) {
            case 'listening': return '🎤';
            case 'speaking': return '🔊';
            case 'processing': return '⏳';
            case 'error': return '❌';
            case 'paused': return '⏸️';
            default: return '🎤';
        }
    };
    
    const getStateColor = () => {
        switch (state) {
            case 'listening': return '#10b981';
            case 'speaking': return '#3b82f6';
            case 'processing': return '#f59e0b';
            case 'error': return '#ef4444';
            default: return '#6b7280';
        }
    };
    
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, rgba(0,59,50,0.98), rgba(0,37,32,0.98))',
            borderTop: '2px solid #B8860B',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 10000
        }}>
            {/* Status indicator */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getStateColor(),
                    animation: isListening ? 'pulse 1.5s infinite' : 'none'
                }} />
                <span style={{ color: getStateColor(), fontWeight: 600, fontSize: '0.85em' }}>
                    {state.toUpperCase()}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75em' }}>
                    • {context}
                </span>
            </div>
            
            {/* Mode selector */}
            <div style={{ display: 'flex', gap: '4px' }}>
                {(['interactive', 'talkative', 'text'] as const).map(mode => (
                    <button
                        key={mode}
                        onClick={() => handleModeChange(mode)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            border: 'none',
                            background: currentMode === mode ? '#B8860B' : 'rgba(255,255,255,0.1)',
                            color: currentMode === mode ? '#000' : '#fff',
                            fontSize: '0.75em',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {mode}
                    </button>
                ))}
            </div>
            
            {/* Teleprompter */}
            <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <span style={{
                    color: isListening ? '#F5EC9B' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.9em',
                    fontStyle: transcript ? 'normal' : 'italic'
                }}>
                    {transcript || (isListening ? 'Listening...' : 'Click mic to speak')}
                </span>
            </div>
            
            {/* Control buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={toggle}
                    disabled={currentMode === 'text'}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isListening 
                            ? 'linear-gradient(135deg, #ef4444, #f87171)' 
                            : 'linear-gradient(135deg, #B8860B, #F5EC9B)',
                        color: isListening ? '#fff' : '#000',
                        fontSize: '1.2em',
                        cursor: currentMode === 'text' ? 'not-allowed' : 'pointer',
                        opacity: currentMode === 'text' ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isListening ? '⏹️' : '🎤'}
                </button>
                
                {isSpeaking && (
                    <button
                        onClick={() => {/* stopSpeaking handled by VoiceManager */}}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            background: 'rgba(239,68,68,0.2)',
                            color: '#ef4444',
                            fontSize: '0.8em',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Stop Speaking
                    </button>
                )}
            </div>
            
            <style>{`
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
                }
            `}</style>
        </div>
    );
};

export default AgenticBar;
