import { useState, useEffect, useRef, useCallback } from 'react';

// Word to digit
const W2D: Record<string,string> = {
  'zero':'0','oh':'0','one':'1','two':'2','to':'2','three':'3','four':'4','for':'4',
  'five':'5','six':'6','seven':'7','eight':'8','ate':'8','nine':'9'
};

export const extractDigits = (t: string): string => {
  if (!t) return '';
  let d = '';
  t.toLowerCase().split(/\s+/).forEach(w => { if (W2D[w]) d += W2D[w]; else if (/^\d$/.test(w)) d += w; });
  const raw = t.replace(/\D/g, '');
  return d.length >= raw.length ? d : raw;
};

export const formatPhoneNumber = (d: string): string => {
  const c = d.replace(/\D/g, '').slice(0, 10);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0,3)}-${c.slice(3)}`;
  return `${c.slice(0,3)}-${c.slice(3,6)}-${c.slice(6)}`;
};

export const speakablePhone = (d: string): string => {
  const m: Record<string,string> = {'0':'zero','1':'one','2':'two','3':'three','4':'four','5':'five','6':'six','7':'seven','8':'eight','9':'nine'};
  return d.replace(/\D/g,'').split('').map(x => m[x] || x).join(' ');
};

interface VoiceOpts {
  onDigits?: (d: string) => void;
  onCommand?: (c: string) => void;
}

export const useVoice = (opts: VoiceOpts = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  
  const recRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const optsRef = useRef(opts);
  const mountedRef = useRef(true);
  const shouldRunRef = useRef(true);
  
  useEffect(() => { optsRef.current = opts; }, [opts]);
  
  // Initialize and START recognition
  useEffect(() => {
    mountedRef.current = true;
    shouldRunRef.current = true;
    synthRef.current = window.speechSynthesis;
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.error('[VOICE] Not supported');
      return;
    }
    
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recRef.current = rec;
    
    rec.onstart = () => {
      console.log('[VOICE] ✅ STARTED');
      if (mountedRef.current) {
        setIsListening(true);
        setIsPaused(false);
      }
    };
    
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const res = e.results[e.results.length - 1];
      const txt = res[0]?.transcript?.trim() || '';
      
      console.log('[VOICE] HEARD:', txt, 'final:', res.isFinal);
      
      if (mountedRef.current && txt) {
        setTranscript(txt);
      }
      
      if (res.isFinal && txt) {
        const lower = txt.toLowerCase();
        
        // Check for "hey" command to pause
        if (lower.includes('hey') || lower.includes('stop') || lower.includes('pause')) {
          console.log('[VOICE] Pause command detected');
          shouldRunRef.current = false;
          try { rec.stop(); } catch(e) {}
          if (mountedRef.current) setIsPaused(true);
          return;
        }
        
        // Extract digits
        const digits = extractDigits(txt);
        if (digits) {
          console.log('[VOICE] DIGITS:', digits);
          optsRef.current.onDigits?.(digits);
        }
        
        // Send command
        optsRef.current.onCommand?.(lower);
      }
    };
    
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.log('[VOICE] Error:', e.error);
      if (e.error === 'not-allowed') {
        setDisplayText('⚠️ Microphone blocked! Click 🔒 in address bar to allow.');
      }
    };
    
    rec.onend = () => {
      console.log('[VOICE] Ended, shouldRun:', shouldRunRef.current);
      if (mountedRef.current && shouldRunRef.current) {
        // Auto restart
        setTimeout(() => {
          if (mountedRef.current && shouldRunRef.current && recRef.current) {
            try { recRef.current.start(); } catch(e) {}
          }
        }, 100);
      } else {
        if (mountedRef.current) setIsListening(false);
      }
    };
    
    // START IMMEDIATELY
    console.log('[VOICE] Starting...');
    setTimeout(() => {
      if (mountedRef.current && shouldRunRef.current) {
        try { rec.start(); } catch(e) { console.log('[VOICE] Start error:', e); }
      }
    }, 500);
    
    return () => {
      mountedRef.current = false;
      shouldRunRef.current = false;
      try { rec.stop(); } catch(e) {}
    };
  }, []);
  
  const speak = useCallback((text: string) => {
    if (!text || !synthRef.current) return;
    setDisplayText(text);
    synthRef.current.cancel();
    setIsSpeaking(true);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(u);
  }, []);
  
  const resume = useCallback(() => {
    shouldRunRef.current = true;
    setIsPaused(false);
    if (recRef.current) {
      try { recRef.current.start(); } catch(e) {}
    }
  }, []);
  
  const pause = useCallback(() => {
    shouldRunRef.current = false;
    setIsPaused(true);
    if (recRef.current) {
      try { recRef.current.stop(); } catch(e) {}
    }
  }, []);
  
  return { isListening, isPaused, isSpeaking, transcript, displayText, speak, pause, resume, stop: pause, startListening: resume, stopListening: pause };
};

export default useVoice;
