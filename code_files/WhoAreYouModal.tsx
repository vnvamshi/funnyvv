// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - WHO ARE YOU MODAL v3.0
// Voice-first role selection with teleprompter
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import VendorOnboardingModal from './VendorOnboardingModal';

interface WhoAreYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected?: (role: string) => void;
}

const ROLES = [
  { id: 'customer', title: 'Customer', icon: '👤', color: '#4A90D9', voiceAliases: ['customer', 'user', 'regular'], desc: 'Browse properties, products & services' },
  { id: 'home_buyer', title: 'Home Buyer', icon: '🏠', color: '#E74C3C', voiceAliases: ['home buyer', 'buyer', 'buying home'], desc: 'Find your dream home' },
  { id: 'investor', title: 'Investor', icon: '💰', color: '#27AE60', voiceAliases: ['investor', 'investing', 'investment'], desc: 'Discover investment opportunities' },
  { id: 'agent', title: 'Real Estate Agent', icon: '🏢', color: '#9B59B6', voiceAliases: ['agent', 'real estate agent', 'realtor'], desc: 'Manage clients & listings' },
  { id: 'builder', title: 'Builder', icon: '🏗️', color: '#3498DB', voiceAliases: ['builder', 'construction', 'developer'], desc: 'Showcase your projects' },
  { id: 'vendor', title: 'Vendor', icon: '📦', color: '#F39C12', voiceAliases: ['vendor', 'seller', 'supplier', 'shop'], desc: 'Sell products on VistaView' }
];

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const WhoAreYouModal: React.FC<WhoAreYouModalProps> = ({ isOpen, onClose, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => { if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis; }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e: any) => {
      const res = e.results[e.results.length-1];
      setTranscript(res[0].transcript.trim());
      if (res.isFinal) handleVoiceCommand(res[0].transcript.toLowerCase());
    };
    r.onend = () => { if (isListening && isOpen && !isPaused) try { r.start(); } catch(e) {} };
    recRef.current = r;
  }, [isOpen, isListening, isPaused]);

  useEffect(() => {
    if (isOpen) {
      setIsListening(true);
      setSelectedRole(null);
      setShowOnboarding(false);
      try { recRef.current?.start(); } catch(e) {}
      setTimeout(() => speak("Who are you? Are you a Customer, Home Buyer, Investor, Real Estate Agent, Builder, or Vendor? Just say your role or click!"), 500);
    } else {
      setIsListening(false);
      try { recRef.current?.stop(); } catch(e) {}
      stop();
    }
  }, [isOpen]);

  const handleVoiceCommand = useCallback((cmd: string) => {
    // Pause on "hey Mr V"
    if (cmd.includes('hey') && (cmd.includes('mr') || cmd.includes('mister') || cmd.includes('vista'))) {
      stop();
      setIsPaused(true);
      speak("Yes? I'm listening. Tell me who you are!");
      setTimeout(() => setIsPaused(false), 8000);
      return;
    }
    
    setIsPaused(false);
    
    if (cmd.includes('stop') || cmd.includes('pause')) { stop(); return; }
    if (cmd.includes('close') || cmd.includes('exit') || cmd.includes('cancel')) { stop(); onClose(); return; }
    
    // Find matching role
    for (const role of ROLES) {
      for (const alias of role.voiceAliases) {
        if (cmd.includes(alias)) {
          selectRole(role);
          return;
        }
      }
    }
  }, [onClose]);

  const selectRole = (role: typeof ROLES[0]) => {
    setWalkingTo(role.id);
    speak(`Got it! You're a ${role.title}. Let me set that up for you...`);
    
    setTimeout(() => {
      setWalkingTo(null);
      setSelectedRole(role.id);
      
      // For Vendor, show onboarding
      if (role.id === 'vendor') {
        setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
      } else {
        // For other roles, just notify and close
        setTimeout(() => {
          speak(`Welcome, ${role.title}! Opening your personalized experience...`);
          onRoleSelected?.(role.id);
          setTimeout(() => onClose(), 2000);
        }, 500);
      }
    }, 1200);
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    stop();
    setDisplayText(text);
    setIsSpeaking(true);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = () => setIsSpeaking(false);
    synthRef.current.speak(u);
  };

  const stop = () => { synthRef.current?.cancel(); setIsSpeaking(false); };

  if (!isOpen) return null;

  // Show Vendor Onboarding if selected
  if (showOnboarding && selectedRole === 'vendor') {
    return (
      <VendorOnboardingModal
        isOpen={true}
        onClose={() => { setShowOnboarding(false); onClose(); }}
        onComplete={() => { onRoleSelected?.('vendor'); onClose(); }}
      />
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '24px', width: '100%', maxWidth: '700px', overflow: 'hidden', border: `2px solid ${THEME.gold}` }}>
        
        {/* Header */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderBottom: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: THEME.gold, margin: 0 }}>👤 Who Are You?</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isPaused ? 'rgba(255,200,0,0.3)' : isListening ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isPaused ? '#FFD700' : isListening ? '#00ff00' : '#666' }} />
              <span style={{ color: '#fff', fontSize: '0.85em' }}>{isPaused ? 'Waiting...' : isListening ? 'Listening...' : 'Paused'}</span>
            </div>
            {isSpeaking && <button onClick={stop} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>⏹ Stop</button>}
            <button onClick={onClose} style={{ background: 'transparent', color: '#fff', border: `1px solid ${THEME.gold}`, width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Teleprompter */}
        <div style={{ background: `rgba(184,134,11,0.15)`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff00' }} />
          <span style={{ color: '#B8860B', fontWeight: 600 }}>MR. V:</span>
          <span style={{ color: isSpeaking ? THEME.goldLight : '#aaa', fontStyle: isSpeaking ? 'normal' : 'italic' }}>
            {isSpeaking ? displayText : transcript ? `"${transcript}"` : 'Say your role or click below...'}
          </span>
        </div>

        {/* Role Grid */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => selectRole(role)}
                style={{
                  background: walkingTo === role.id ? `linear-gradient(135deg, ${role.color}, ${role.color}88)` : selectedRole === role.id ? `${role.color}30` : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${walkingTo === role.id || selectedRole === role.id ? role.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.3s ease',
                  transform: walkingTo === role.id ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <span style={{ fontSize: '2.5em' }}>{role.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: walkingTo === role.id ? '#fff' : '#fff', fontWeight: 600, fontSize: '1.1em' }}>{role.title}</div>
                  <div style={{ color: walkingTo === role.id ? 'rgba(255,255,255,0.8)' : '#888', fontSize: '0.85em' }}>{role.desc}</div>
                </div>
                {walkingTo === role.id && <span style={{ marginLeft: 'auto', fontSize: '1.5em' }}>🚶</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 24px', borderTop: `1px solid ${THEME.gold}40`, textAlign: 'center' }}>
          <span style={{ color: '#888', fontSize: '0.85em' }}>Say "hey Mr V" anytime to pause • "close" to exit</span>
        </div>
      </div>
    </div>
  );
};

export default WhoAreYouModal;
