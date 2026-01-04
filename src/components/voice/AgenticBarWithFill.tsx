/**
 * AgenticBarWithFill - AgenticBar that automatically fills form fields
 * 
 * Usage in VendorFlow:
 *   <AgenticBarWithFill
 *     fields={{ companyName: '#company-input', description: '#desc-textarea' }}
 *     context="business_profile"
 *     onFill={(field, value) => handleFieldUpdate(field, value)}
 *   />
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useVoice } from '../../hooks/useVoice';

interface AgenticBarWithFillProps {
    fields?: Record<string, string>;  // { fieldKey: 'selector' }
    context?: string;
    onFill?: (field: string, value: string) => void;
    onTranscript?: (text: string) => void;
    position?: 'bottom' | 'inline';
    showHints?: boolean;
}

export function AgenticBarWithFill({
    fields = {},
    context = 'form',
    onFill,
    onTranscript,
    position = 'bottom',
    showHints = true
}: AgenticBarWithFillProps) {
    const [lastHeard, setLastHeard] = useState('');
    const [filling, setFilling] = useState<string | null>(null);
    const [filled, setFilled] = useState<string[]>([]);
    
    // Typewriter fill
    const typeIntoField = useCallback(async (selector: string, text: string, fieldName: string) => {
        const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
        if (!element) {
            console.warn('[AgenticBar] Element not found:', selector);
            return false;
        }
        
        setFilling(fieldName);
        element.focus();
        element.classList.add('vv-filling');
        element.value = '';
        
        for (let i = 0; i < text.length; i++) {
            element.value = text.substring(0, i + 1);
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(r => setTimeout(r, 25));
        }
        
        element.classList.remove('vv-filling');
        element.classList.add('vv-filled');
        setTimeout(() => element.classList.remove('vv-filled'), 1000);
        
        setFilling(null);
        setFilled(prev => [...prev, fieldName]);
        return true;
    }, []);
    
    // Handle voice response
    const handleResponse = useCallback(async (data: any) => {
        const formFields = data?.formData?.fields;
        if (!formFields) return;
        
        console.log('[AgenticBar] Filling fields:', formFields);
        
        for (const [field, value] of Object.entries(formFields)) {
            if (!value || typeof value !== 'string') continue;
            const selector = fields[field];
            if (selector) {
                const success = await typeIntoField(selector, value, field);
                if (success) onFill?.(field, value);
            }
        }
    }, [fields, typeIntoField, onFill]);
    
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
        context,
        onResponse: handleResponse,
        onTranscript: (text, isFinal) => {
            if (isFinal) {
                setLastHeard(text);
                onTranscript?.(text);
            }
        }
    });
    
    // Status styling
    const statusConfig = {
        idle: { bg: 'rgba(100, 116, 139, 0.9)', icon: '🎙️', text: 'Click to speak' },
        listening: { bg: 'rgba(16, 185, 129, 0.9)', icon: '🎤', text: 'Listening...' },
        processing: { bg: 'rgba(245, 158, 11, 0.9)', icon: '⚡', text: 'Processing...' },
        speaking: { bg: 'rgba(139, 92, 246, 0.9)', icon: '🔊', text: 'Speaking...' },
        error: { bg: 'rgba(239, 68, 68, 0.9)', icon: '❌', text: 'Error' }
    };
    
    const config = statusConfig[state] || statusConfig.idle;
    
    const containerStyle: React.CSSProperties = position === 'bottom' ? {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999
    } : {
        width: '100%'
    };
    
    return (
        <div style={containerStyle}>
            <div style={{
                background: '#1a1a2e',
                border: `2px solid ${isListening ? '#10b981' : isSpeaking ? '#8b5cf6' : '#4a5568'}`,
                borderRadius: '16px',
                padding: '16px',
                minWidth: '320px',
                boxShadow: isListening ? '0 0 30px rgba(16, 185, 129, 0.3)' : '0 10px 40px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: isListening ? '#10b981' : isSpeaking ? '#8b5cf6' : '#64748b',
                            animation: isListening || isSpeaking ? 'pulse 1s infinite' : 'none'
                        }} />
                        <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 500 }}>
                            {config.icon} {state.toUpperCase()}
                        </span>
                    </div>
                    <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: 'rgba(6, 182, 212, 0.2)',
                        color: '#06b6d4'
                    }}>
                        INTERACTIVE
                    </span>
                </div>
                
                {/* Waveform when listening */}
                {isListening && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', height: '30px', alignItems: 'center', marginBottom: '12px' }}>
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '3px',
                                    background: 'linear-gradient(to top, #10b981, #06b6d4)',
                                    borderRadius: '2px',
                                    animation: `wave 0.5s ease-in-out ${i * 0.05}s infinite alternate`,
                                    height: `${10 + Math.random() * 20}px`
                                }}
                            />
                        ))}
                    </div>
                )}
                
                {/* Transcript display */}
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '12px',
                    minHeight: '50px'
                }}>
                    {interimTranscript && (
                        <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
                            {interimTranscript}
                        </p>
                    )}
                    {lastHeard && !interimTranscript && (
                        <div>
                            <span style={{ color: '#10b981', fontSize: '11px' }}>✓ HEARD</span>
                            <p style={{ color: '#e2e8f0', fontSize: '14px', margin: '4px 0 0 0' }}>
                                "{lastHeard}"
                            </p>
                        </div>
                    )}
                    {!interimTranscript && !lastHeard && (
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                            {config.text}
                        </p>
                    )}
                </div>
                
                {/* Filling indicator */}
                {filling && (
                    <div style={{
                        background: 'rgba(6, 182, 212, 0.2)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ animation: 'spin 1s linear infinite' }}>⚡</span>
                        <span style={{ color: '#06b6d4', fontSize: '13px' }}>
                            Filling {filling}...
                        </span>
                    </div>
                )}
                
                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button
                        onClick={toggle}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '25px',
                            border: 'none',
                            background: isListening ? '#ef4444' : '#10b981',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {isListening ? '⏹️ Stop' : '🎤 Listen'}
                    </button>
                    
                    <button
                        onClick={() => speak('How can I help you?')}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '25px',
                            border: '1px solid #4a5568',
                            background: 'transparent',
                            color: '#e2e8f0',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        🔊 Speak
                    </button>
                </div>
                
                {/* Hints */}
                {showHints && (
                    <p style={{
                        color: '#64748b',
                        fontSize: '11px',
                        textAlign: 'center',
                        marginTop: '12px',
                        margin: '12px 0 0 0'
                    }}>
                        💡 Try: "My company name is..." • "We sell..." • "beautify" to enhance
                    </p>
                )}
            </div>
            
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes wave {
                    from { height: 8px; }
                    to { height: 25px; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default AgenticBarWithFill;
