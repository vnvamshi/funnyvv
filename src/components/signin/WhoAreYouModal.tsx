import React, { useState, useEffect, useCallback, useRef } from 'react';
import VendorFlow from './vendor/VendorFlow';
import { BuilderFlow } from './builder';
import { AgentFlow } from './agent';
import { CustomerFlow } from './customer';
import { HomeBuyerFlow } from './buyer';
import { InvestorFlow } from './investor';
import WalkingCursor from './common/WalkingCursor';

interface Props { isOpen: boolean; onClose: () => void; }

type RoleType = 'selector' | 'customer' | 'homebuyer' | 'investor' | 'agent' | 'builder' | 'vendor';

const THEME = { teal: '#004236', gold: '#B8860B' };

const WhoAreYouModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<RoleType>('selector');
  const [hovered, setHovered] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [walkerActive, setWalkerActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event: any) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; i++) text += event.results[i][0].transcript;
          setTranscript(text);
          if (event.results[event.resultIndex].isFinal) handleVoiceCommand(text.toLowerCase());
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => { if (isListening) recognitionRef.current?.start(); };
      }
    }
  }, [isListening]);

  useEffect(() => {
    if (isOpen && selectedRole === 'selector') {
      setTimeout(() => {
        speak("Welcome! Who are you? Say customer, home buyer, investor, agent, builder, or vendor.");
        setWalkerActive(true);
        startListening();
      }, 500);
    }
  }, [isOpen, selectedRole]);

  useEffect(() => {
    if (!isOpen) { setSelectedRole('selector'); setIsListening(false); setTranscript(''); setWalkerActive(false); recognitionRef.current?.stop(); }
  }, [isOpen]);

  const speak = useCallback((text: string) => { if (!synthRef.current) return; synthRef.current.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; synthRef.current.speak(u); }, []);
  const startListening = () => { try { recognitionRef.current?.start(); setIsListening(true); } catch (e) {} };
  const toggleListening = () => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { startListening(); } };

  const handleVoiceCommand = useCallback((text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('vendor') || lower.includes('sell product')) { speak("Opening vendor registration."); setWalkerActive(false); setSelectedRole('vendor'); }
    else if (lower.includes('builder') || lower.includes('construction') || lower.includes('contractor')) { speak("Opening builder registration."); setWalkerActive(false); setSelectedRole('builder'); }
    else if (lower.includes('agent') || lower.includes('real estate') || lower.includes('realtor')) { speak("Opening agent registration."); setWalkerActive(false); setSelectedRole('agent'); }
    else if (lower.includes('buyer') || lower.includes('home buyer') || lower.includes('buy home') || lower.includes('buy a home')) { speak("Opening home buyer registration."); setWalkerActive(false); setSelectedRole('homebuyer'); }
    else if (lower.includes('investor') || lower.includes('invest')) { speak("Opening investor registration."); setWalkerActive(false); setSelectedRole('investor'); }
    else if (lower.includes('customer') || lower.includes('browse') || lower.includes('shop')) { speak("Opening customer registration."); setWalkerActive(false); setSelectedRole('customer'); }
    else if (lower.includes('close') || lower.includes('cancel') || lower.includes('exit')) { speak("Closing."); onClose(); }
  }, [speak, onClose]);

  if (!isOpen) return null;

  // Render flows
  if (selectedRole === 'vendor') return <VendorFlow onClose={onClose} onBack={() => setSelectedRole('selector')} />;
  if (selectedRole === 'builder') return <BuilderFlow onClose={onClose} onBack={() => setSelectedRole('selector')} />;
  if (selectedRole === 'agent') return <AgentFlow onClose={onClose} onBack={() => setSelectedRole('selector')} />;
  if (selectedRole === 'customer') return <CustomerFlow onClose={onClose} onBack={() => setSelectedRole('selector')} />;
  if (selectedRole === 'homebuyer') return <HomeBuyerFlow onClose={onClose} onBack={() => setSelectedRole('selector')} />;
  if (selectedRole === 'investor') return <InvestorFlow onClose={onClose} onBack={() => setSelectedRole('selector')} />;

  const roles = [
    { id: 'customer', icon: '🛒', title: 'Customer', desc: 'Browse & shop products', color: '#06b6d4' },
    { id: 'homebuyer', icon: '🏡', title: 'Home Buyer', desc: 'Find your dream home', color: '#8b5cf6' },
    { id: 'investor', icon: '💰', title: 'Investor', desc: 'Investment opportunities', color: '#f59e0b' },
    { id: 'agent', icon: '🏠', title: 'Real Estate Agent', desc: 'List & sell properties', color: '#10b981' },
    { id: 'builder', icon: '🏗️', title: 'Builder', desc: 'Construction services', color: '#ec4899' },
    { id: 'vendor', icon: '📦', title: 'Vendor', desc: 'Sell products & materials', color: THEME.gold }
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div ref={containerRef} style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: 24, width: '100%', maxWidth: 1000, maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}40`, position: 'relative' }}>
        <WalkingCursor containerRef={containerRef} isActive={walkerActive} onComplete={() => setWalkerActive(false)} speed={1200} variant="hand" color={THEME.gold} loop={true} selectors=".role-card" />
        
        <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.gold}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h2 style={{ color: '#fff', margin: 0, fontSize: '1.5em' }}>Who Are You?</h2><p style={{ color: '#94a3b8', margin: '5px 0 0', fontSize: '0.9em' }}>Select your role or say it aloud</p></div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: '1.3em' }}>✕</button>
        </div>

        <div style={{ padding: 30, overflow: 'auto', maxHeight: 'calc(90vh - 280px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {roles.map(role => (
              <div key={role.id} data-role={role.title} className="role-card" onClick={() => { speak(`Opening ${role.title}.`); setWalkerActive(false); setSelectedRole(role.id as RoleType); }} onMouseEnter={() => setHovered(role.id)} onMouseLeave={() => setHovered(null)} style={{ background: 'rgba(0,0,0,0.3)', border: `2px solid ${hovered === role.id ? role.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, padding: 25, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s', transform: hovered === role.id ? 'translateY(-5px)' : 'none', boxShadow: hovered === role.id ? `0 15px 30px ${role.color}30` : 'none' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{role.icon}</div>
                <h3 style={{ color: role.color, fontSize: 18, margin: '0 0 6px' }}>{role.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{role.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 30px', background: 'rgba(0,0,0,0.4)', borderTop: `1px solid ${THEME.gold}30` }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 16, border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: isListening ? '#10b981' : '#64748b', animation: isListening ? 'pulse 1s infinite' : 'none' }} />
              <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>🎤 {isListening ? 'LISTENING' : 'READY'}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75em', padding: '2px 8px', borderRadius: 10, background: walkerActive ? `${THEME.gold}30` : 'rgba(6, 182, 212, 0.2)', color: walkerActive ? THEME.gold : '#06b6d4' }}>{walkerActive ? '🚶 GUIDING' : 'INTERACTIVE'}</span>
            </div>
            {isListening && (<div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 25, alignItems: 'center', marginBottom: 10 }}>{[...Array(15)].map((_, i) => (<div key={i} style={{ width: 3, background: 'linear-gradient(to top, #10b981, #06b6d4)', borderRadius: 2, animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`, height: 8 }} />))}</div>)}
            {transcript && (<div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><span style={{ color: '#10b981', fontSize: '0.75em' }}>✓ HEARD</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: '0.95em' }}>"{transcript}"</p></div>)}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={toggleListening} style={{ padding: '10px 24px', borderRadius: 25, border: 'none', background: isListening ? '#ef4444' : '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{isListening ? '⏹️ Stop' : '🎤 Listen'}</button>
              <button onClick={() => setWalkerActive(!walkerActive)} style={{ padding: '10px 24px', borderRadius: 25, border: `1px solid ${THEME.gold}`, background: walkerActive ? `${THEME.gold}20` : 'transparent', color: THEME.gold, cursor: 'pointer' }}>{walkerActive ? '⏸️ Pause' : '🚶 Guide'}</button>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.75em', textAlign: 'center', margin: '12px 0 0' }}>💡 Say: "I'm a customer" • "I want to buy a home" • "I'm a builder"</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes wave { from { height: 6px; } to { height: 20px; } }`}</style>
    </div>
  );
};

export default WhoAreYouModal;
