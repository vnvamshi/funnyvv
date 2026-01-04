/**
 * useVoice - Voice recognition with form filling support
 */

import { useState, useEffect, useRef, useCallback } from 'react';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceOptions {
    userType?: 'boss' | 'team' | 'user';
    context?: string;
    onTranscript?: (text: string, isFinal: boolean) => void;
    onResponse?: (data: any) => void;
    onStateChange?: (state: VoiceState) => void;
    onFormData?: (fields: Record<string, string>) => void;
}

let globalRecognition: SpeechRecognition | null = null;
let globalIsActive = false;
let initDone = false;

function initRecognition() {
    if (initDone || typeof window === 'undefined') return;
    initDone = true;
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    
    globalRecognition = new SR();
    globalRecognition.continuous = true;
    globalRecognition.interimResults = true;
    globalRecognition.lang = 'en-US';
    
    console.log('[Voice] ✅ Singleton initialized');
}

export function useVoice(options: VoiceOptions = {}) {
    const [state, setState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [lastFormData, setLastFormData] = useState<Record<string, string>>({});
    
    const shouldRunRef = useRef(false);
    const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSpeakingRef = useRef(false);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const optionsRef = useRef(options);
    
    useEffect(() => { optionsRef.current = options; }, [options]);
    
    useEffect(() => {
        initRecognition();
        synthRef.current = window.speechSynthesis;
        return () => { if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current); };
    }, []);
    
    const safeStart = useCallback(() => {
        if (!globalRecognition || globalIsActive) return;
        try { globalRecognition.start(); } catch {}
    }, []);
    
    const processVoiceInput = useCallback(async (text: string) => {
        console.log('[Voice] 📤 Sending:', text);
        setState('processing');
        optionsRef.current.onStateChange?.('processing');
        
        try {
            const response = await fetch('http://localhost:1117/api/voice/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    user_type: optionsRef.current.userType || 'user',
                    context: optionsRef.current.context || 'general',
                    page_route: window.location.pathname
                })
            });
            
            const data = await response.json();
            console.log('[Voice] 📥 Response:', data);
            
            // Handle form data
            if (data?.formData?.fields) {
                const fields = data.formData.fields;
                setLastFormData(fields);
                optionsRef.current.onFormData?.(fields);
                console.log('[Voice] 📝 Form fields:', fields);
            }
            
            optionsRef.current.onResponse?.(data);
            
            const responseText = data?.response?.text || data?.tts_response?.text;
            if (responseText) {
                speak(responseText);
            } else {
                setState(shouldRunRef.current ? 'listening' : 'idle');
            }
        } catch (err: any) {
            console.error('[Voice] Error:', err);
            setError(err.message);
            setState(shouldRunRef.current ? 'listening' : 'idle');
        }
    }, []);
    
    useEffect(() => {
        if (!globalRecognition) return;
        
        globalRecognition.onstart = () => {
            console.log('[Voice] 🎤 LISTENING');
            globalIsActive = true;
            setState('listening');
            optionsRef.current.onStateChange?.('listening');
        };
        
        globalRecognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            let final = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += t;
                else interim += t;
            }
            
            setInterimTranscript(interim);
            optionsRef.current.onTranscript?.(interim, false);
            
            if (final.trim()) {
                console.log('[Voice] 📝 Got:', final.trim());
                setTranscript(final.trim());
                optionsRef.current.onTranscript?.(final.trim(), true);
                processVoiceInput(final.trim());
            }
        };
        
        globalRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'aborted' || event.error === 'no-speech') return;
            console.error('[Voice] ❌', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone denied');
                setState('error');
                shouldRunRef.current = false;
            }
        };
        
        globalRecognition.onend = () => {
            globalIsActive = false;
            if (shouldRunRef.current && !isSpeakingRef.current) {
                if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
                restartTimeoutRef.current = setTimeout(() => {
                    if (shouldRunRef.current && !globalIsActive && !isSpeakingRef.current) safeStart();
                }, 1000);
            } else {
                setState('idle');
                optionsRef.current.onStateChange?.('idle');
            }
        };
    }, [processVoiceInput, safeStart]);
    
    const start = useCallback(() => {
        synthRef.current?.cancel();
        isSpeakingRef.current = false;
        shouldRunRef.current = true;
        setError(null);
        setState('listening');
        safeStart();
    }, [safeStart]);
    
    const stop = useCallback(() => {
        shouldRunRef.current = false;
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        if (globalRecognition && globalIsActive) try { globalRecognition.stop(); } catch {}
        setState('idle');
        optionsRef.current.onStateChange?.('idle');
    }, []);
    
    const toggle = useCallback(() => {
        shouldRunRef.current || state === 'listening' ? stop() : start();
    }, [state, start, stop]);
    
    const speak = useCallback((text: string) => {
        if (!synthRef.current) return;
        console.log('[Voice] 🔊 Speaking:', text);
        
        const wasRunning = shouldRunRef.current;
        isSpeakingRef.current = true;
        
        if (globalIsActive && globalRecognition) try { globalRecognition.stop(); } catch {}
        
        synthRef.current.cancel();
        setState('speaking');
        optionsRef.current.onStateChange?.('speaking');
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        
        utterance.onend = () => {
            isSpeakingRef.current = false;
            setState('idle');
            if (wasRunning) {
                shouldRunRef.current = true;
                setTimeout(() => safeStart(), 500);
            }
        };
        
        utterance.onerror = () => { isSpeakingRef.current = false; setState('idle'); };
        
        synthRef.current.speak(utterance);
    }, [safeStart]);
    
    const stopSpeaking = useCallback(() => {
        synthRef.current?.cancel();
        isSpeakingRef.current = false;
        setState('idle');
    }, []);
    
    return {
        state, transcript, interimTranscript, error, lastFormData,
        isListening: state === 'listening',
        isSpeaking: state === 'speaking',
        isProcessing: state === 'processing',
        isIdle: state === 'idle',
        start, stop, toggle, speak, stopSpeaking, processVoiceInput
    };
}

export default useVoice;
