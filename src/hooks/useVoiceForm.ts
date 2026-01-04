/**
 * useVoiceForm - Combines voice recognition with form filling
 * This is the main hook for voice-enabled forms
 */

import { useState, useCallback, useEffect } from 'react';
import { useVoice } from './useVoice';
import { useFormFiller } from './useFormFiller';

interface FieldConfig {
    id?: string;
    name?: string;
    selector?: string;
    voiceKey: string;  // Key in formData.fields from backend
}

interface VoiceFormOptions {
    fields: FieldConfig[];
    context?: string;
    userType?: 'boss' | 'team' | 'user';
    onFieldFilled?: (field: string, value: string) => void;
    onAllFilled?: () => void;
}

export function useVoiceForm(options: VoiceFormOptions) {
    const { fields, context = 'general', userType = 'user', onFieldFilled, onAllFilled } = options;
    const [filledFields, setFilledFields] = useState<Record<string, string>>({});
    const [currentField, setCurrentField] = useState<string | null>(null);
    
    const { fillField, fillById, fillByName } = useFormFiller({
        typingSpeed: 25,
        onComplete: () => setCurrentField(null)
    });
    
    const handleVoiceResponse = useCallback(async (data: any) => {
        const formData = data?.formData?.fields;
        if (!formData || Object.keys(formData).length === 0) return;
        
        console.log('[VoiceForm] Got formData:', formData);
        
        // Fill each field that has data
        for (const fieldConfig of fields) {
            const value = formData[fieldConfig.voiceKey];
            if (!value) continue;
            
            setCurrentField(fieldConfig.voiceKey);
            
            // Find and fill the element
            let element: HTMLInputElement | HTMLTextAreaElement | null = null;
            
            if (fieldConfig.id) {
                element = document.getElementById(fieldConfig.id) as any;
            } else if (fieldConfig.name) {
                element = document.querySelector(`[name="${fieldConfig.name}"]`) as any;
            } else if (fieldConfig.selector) {
                element = document.querySelector(fieldConfig.selector) as any;
            }
            
            if (element) {
                await fillField(element, value);
                setFilledFields(prev => ({ ...prev, [fieldConfig.voiceKey]: value }));
                onFieldFilled?.(fieldConfig.voiceKey, value);
            }
        }
        
        // Check if all fields filled
        const allFilled = fields.every(f => filledFields[f.voiceKey] || formData[f.voiceKey]);
        if (allFilled) {
            onAllFilled?.();
        }
    }, [fields, fillField, filledFields, onFieldFilled, onAllFilled]);
    
    const voice = useVoice({
        userType,
        onResponse: handleVoiceResponse
    });
    
    // Send context with voice commands
    const processWithContext = useCallback(async (text: string) => {
        try {
            const response = await fetch('http://localhost:1117/api/voice/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    user_type: userType,
                    context,
                    page_route: window.location.pathname
                })
            });
            const data = await response.json();
            await handleVoiceResponse(data);
            return data;
        } catch (err) {
            console.error('[VoiceForm] Error:', err);
        }
    }, [context, userType, handleVoiceResponse]);
    
    return {
        ...voice,
        filledFields,
        currentField,
        processWithContext,
        clearFilled: () => setFilledFields({})
    };
}

export default useVoiceForm;
