/**
 * VoiceFormFiller - Drop-in component that fills form fields from voice
 * 
 * Usage:
 *   <VoiceFormFiller 
 *     fields={{ companyName: '#company-input', description: '#desc-input' }}
 *     onFill={(field, value) => setFormData(prev => ({...prev, [field]: value}))}
 *   />
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useVoice } from '../../hooks/useVoice';

interface VoiceFormFillerProps {
    fields: Record<string, string>;  // { fieldName: 'selector' }
    context?: string;
    onFill?: (field: string, value: string) => void;
    onTranscript?: (text: string) => void;
    typingSpeed?: number;
}

export function VoiceFormFiller({
    fields,
    context = 'form',
    onFill,
    onTranscript,
    typingSpeed = 25
}: VoiceFormFillerProps) {
    const fillingRef = useRef(false);
    
    // Typewriter effect
    const typeIntoField = useCallback(async (selector: string, text: string) => {
        const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
        if (!element) {
            console.warn('[VoiceFormFiller] Element not found:', selector);
            return;
        }
        
        fillingRef.current = true;
        element.focus();
        element.classList.add('vv-filling');
        
        // Clear and type
        element.value = '';
        for (let i = 0; i < text.length; i++) {
            element.value = text.substring(0, i + 1);
            
            // Dispatch events for React
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            await new Promise(r => setTimeout(r, typingSpeed));
        }
        
        element.classList.remove('vv-filling');
        element.classList.add('vv-filled');
        setTimeout(() => element.classList.remove('vv-filled'), 1000);
        
        fillingRef.current = false;
    }, [typingSpeed]);
    
    // Handle voice response with form data
    const handleResponse = useCallback(async (data: any) => {
        const formData = data?.formData?.fields;
        if (!formData) return;
        
        console.log('[VoiceFormFiller] Got fields:', formData);
        
        for (const [field, value] of Object.entries(formData)) {
            if (!value || typeof value !== 'string') continue;
            
            const selector = fields[field];
            if (selector) {
                await typeIntoField(selector, value);
                onFill?.(field, value);
            }
        }
    }, [fields, typeIntoField, onFill]);
    
    const { transcript, interimTranscript } = useVoice({
        context,
        onResponse: handleResponse,
        onTranscript: (text, isFinal) => {
            if (isFinal) onTranscript?.(text);
        }
    });
    
    return null; // This is a logic-only component
}

export default VoiceFormFiller;
