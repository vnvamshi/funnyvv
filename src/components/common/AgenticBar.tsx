/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VISTAVIEW AGENTIC BAR - Universal Voice Interface
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Use this component on ANY page for consistent voice experience.
 * 
 * Usage:
 *   import { AgenticBar } from '@/components/common/AgenticBar';
 *   <AgenticBar mode="floating" />
 */

import React, { useState, useEffect } from 'react';
import { useVoice } from '../../hooks/useVoice';

interface AgenticBarProps {
    mode?: 'floating' | 'inline' | 'minimal';
    position?: 'bottom' | 'top' | 'left' | 'right';
    userType?: 'boss' | 'team' | 'user';
    showTranscript?: boolean;
    onCommand?: (text: string, response: any) => void;
}

export function AgenticBar({
    mode = 'floating',
    position = 'bottom',
    userType = 'boss',
    showTranscript = true,
    onCommand
}: AgenticBarProps) {
    const [lastResponse, setLastResponse] = useState<string>('');
    
    const {
        state,
        transcript,
        interimTranscript,
        isListening,
        isSpeaking,
        isProcessing,
        start,
        stop,
        toggle,
        speak
    } = useVoice({
        userType,
        onResponse: (data) => {
            const responseText = data?.response?.text || data?.tts_response?.text || '';
            setLastResponse(responseText);
            onCommand?.(transcript, data);
        }
    });
    
    // Keyboard shortcut: Space to toggle (when focused)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                toggle();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle]);
    
    // Status colors
    const statusColors = {
        idle: 'bg-gray-500',
        listening: 'bg-green-500 animate-pulse',
        processing: 'bg-yellow-500 animate-spin',
        speaking: 'bg-blue-500 animate-pulse',
        error: 'bg-red-500'
    };
    
    // Position styles
    const positionStyles = {
        bottom: 'bottom-4 left-1/2 -translate-x-1/2',
        top: 'top-4 left-1/2 -translate-x-1/2',
        left: 'left-4 top-1/2 -translate-y-1/2',
        right: 'right-4 top-1/2 -translate-y-1/2'
    };
    
    if (mode === 'minimal') {
        return (
            <button
                onClick={toggle}
                className={`w-12 h-12 rounded-full ${statusColors[state]} text-white flex items-center justify-center shadow-lg transition-all`}
                title={isListening ? 'Stop listening' : 'Start listening'}
            >
                {isListening ? '🎤' : '🎙️'}
            </button>
        );
    }
    
    return (
        <div className={`fixed ${positionStyles[position]} z-50`}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-4 min-w-[300px] border border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusColors[state]}`} />
                        <span className="text-white text-sm font-medium">
                            {state === 'listening' && 'Listening...'}
                            {state === 'processing' && 'Processing...'}
                            {state === 'speaking' && 'Speaking...'}
                            {state === 'idle' && 'Ready'}
                            {state === 'error' && 'Error'}
                        </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                        {userType === 'boss' ? '👔 Boss' : '👤 User'}
                    </span>
                </div>
                
                {/* Transcript Display */}
                {showTranscript && (
                    <div className="bg-gray-800 rounded-lg p-3 mb-3 min-h-[60px]">
                        {interimTranscript && (
                            <p className="text-gray-400 text-sm italic">{interimTranscript}</p>
                        )}
                        {transcript && (
                            <p className="text-white text-sm">{transcript}</p>
                        )}
                        {lastResponse && (
                            <p className="text-green-400 text-sm mt-2">→ {lastResponse}</p>
                        )}
                        {!transcript && !interimTranscript && !lastResponse && (
                            <p className="text-gray-500 text-sm">Say something...</p>
                        )}
                    </div>
                )}
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={toggle}
                        className={`w-14 h-14 rounded-full ${
                            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        } text-white text-2xl flex items-center justify-center transition-all shadow-lg`}
                    >
                        {isListening ? '⏹️' : '🎤'}
                    </button>
                </div>
                
                {/* Hint */}
                <p className="text-gray-500 text-xs text-center mt-3">
                    Press Space or click to {isListening ? 'stop' : 'start'}
                </p>
            </div>
        </div>
    );
}

export default AgenticBar;
