/**
 * useFormFiller - Animates text into form fields
 * Works with useVoice to fill forms from speech
 */

import { useCallback, useRef } from 'react';

interface FormFillerOptions {
    typingSpeed?: number;  // ms per character
    onComplete?: () => void;
    onStart?: () => void;
}

export function useFormFiller(options: FormFillerOptions = {}) {
    const { typingSpeed = 30, onComplete, onStart } = options;
    const isFillingRef = useRef(false);
    const abortRef = useRef(false);
    
    /**
     * Fill a field with typewriter animation
     */
    const fillField = useCallback(async (
        element: HTMLInputElement | HTMLTextAreaElement | null,
        text: string
    ): Promise<void> => {
        if (!element || !text) return;
        
        isFillingRef.current = true;
        abortRef.current = false;
        onStart?.();
        
        // Clear existing value
        element.value = '';
        element.focus();
        
        // Add filling class for styling
        element.classList.add('vv-filling');
        
        // Type each character
        for (let i = 0; i < text.length; i++) {
            if (abortRef.current) break;
            
            element.value = text.substring(0, i + 1);
            
            // Trigger input event for React state updates
            const event = new Event('input', { bubbles: true });
            element.dispatchEvent(event);
            
            // Also trigger change for some frameworks
            const changeEvent = new Event('change', { bubbles: true });
            element.dispatchEvent(changeEvent);
            
            await new Promise(r => setTimeout(r, typingSpeed));
        }
        
        element.classList.remove('vv-filling');
        element.classList.add('vv-filled');
        
        // Remove filled class after animation
        setTimeout(() => element.classList.remove('vv-filled'), 1000);
        
        isFillingRef.current = false;
        onComplete?.();
    }, [typingSpeed, onComplete, onStart]);
    
    /**
     * Fill multiple fields from formData
     */
    const fillForm = useCallback(async (
        formData: Record<string, string>,
        fieldMap: Record<string, string>  // { fieldName: 'selector' }
    ): Promise<void> => {
        for (const [field, value] of Object.entries(formData)) {
            const selector = fieldMap[field];
            if (!selector || !value) continue;
            
            const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
            if (element) {
                await fillField(element, value);
                await new Promise(r => setTimeout(r, 200)); // Pause between fields
            }
        }
    }, [fillField]);
    
    /**
     * Fill by field ID
     */
    const fillById = useCallback(async (
        id: string,
        text: string
    ): Promise<void> => {
        const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
        await fillField(element, text);
    }, [fillField]);
    
    /**
     * Fill by field name
     */
    const fillByName = useCallback(async (
        name: string,
        text: string
    ): Promise<void> => {
        const element = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement;
        await fillField(element, text);
    }, [fillField]);
    
    /**
     * Abort current filling
     */
    const abort = useCallback(() => {
        abortRef.current = true;
    }, []);
    
    return {
        fillField,
        fillForm,
        fillById,
        fillByName,
        abort,
        isFilling: isFillingRef.current
    };
}

export default useFormFiller;
