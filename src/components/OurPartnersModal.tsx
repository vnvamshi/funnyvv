// VISTAVIEW - OUR PARTNERS MODAL
// Copy to: ~/vistaview_WORKING/src/components/OurPartnersModal.tsx

import React, { useState, useEffect, useRef } from 'react';

interface OurPartnersModalProps { isOpen: boolean; onClose: () => void; }

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const REGIONS = [
  { icon: '🇺🇸', name: 'USA', status: 'Active' },
  { icon: '🇬🇧', name: 'United Kingdom', status: 'Active' },
  { icon: '🇪🇺', name: 'Europe', status: 'Active' },
  { icon: '🇮🇹', name: 'Italy', status: 'Active' },
  { icon: '🇦🇪', name: 'UAE', status: 'Active' },
  { icon: '🇮🇳', name: 'India', status: 'Active' },
  { icon: '🇦🇺', name: 'Australia', status: 'Coming soon' },
  { icon: '🇯🇵', name: 'Japan', status: 'Coming soon' },
  { icon: '🇻🇳', name: 'Vietnam', status: 'Coming soon' },
  { icon: '🇨🇳', name: 'China', status: 'Coming soon' },
];

const PARTNER_TYPES = [
  { icon: '🏗️', title: 'Ultra-Luxury Developers', desc: 'World-class residential and commercial builders' },
  { icon: '🏭', title: 'Global Manufacturers', desc: 'Leading home products and building materials' },
  { icon: '🛋️', title: 'Interior & Design', desc: 'Premium furniture and decor brands' },
  { icon: '🔧', title: 'Service Providers', desc: 'Insurance, finance, and home services' },
];

const OurPartnersModal: React.FC<OurPartnersModalProps> = ({ isOpen, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
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
      if(res.isFinal) {
        const cmd = res[0].transcript.toLowerCase();
        if (cmd.includes('stop') || cmd.includes('pause')) stop();
        else if (cmd.includes('close') || cmd.includes('exit')) { stop(); onClose(); }
        else if (cmd.includes('read') || cmd.includes('tell me')) speakOverview();
      }
    };
    r.onend = () => { if (isListening && isOpen) try { r.start(); } catch(e) {} };
    recRef.current = r;
  }, [isOpen, isListening]);

  useEffect(() => {
    if (isOpen) { setIsListening(true); try { recRef.current?.start(); } catch(e) {} setTimeout(() => speakOverview(), 500); }
    else { setIsListening(false); try { recRef.current?.stop(); } catch(e) {} stop(); }
  }, [isOpen]);

  const speakOverview = () => { speak(`Our Partners! VistaView is building a global ecosystem of world-class partners across real estate, construction, manufacturing, interiors, and services. Partners from USA, Europe, UAE, India, and more are actively onboarding. We will be revealing these partnerships very soon!`); };
  const speak = (text: string) => { if (!synthRef.current) return; stop(); setDisplayText(text); setIsSpeaking(true); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.onend = () => setIsSpeaking(false); synthRef.current.speak(u); };
  const stop = () => { synthRef.current?.cancel(); setIsSpeaking(false); };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '24px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderBottom: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: THEME.gold, margin: 0 }}>🤝 Our Partners</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isListening ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isListening ? '#00ff00' : '#666' }} />
              <span style={{ color: '#fff', fontSize: '0.85em' }}>{isListening ? 'Listening...' : 'Paused'}</span>
            </div>
            {isSpeaking && <button onClick={stop} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>⏹ Stop</button>}
            <button onClick={onClose} style={{ background: 'transparent', color: '#fff', border: `1px solid ${THEME.gold}`, width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ background: `rgba(184,134,11,0.15)`, padding: '12px 24px', minHeight: '50px', display: 'flex', alignItems: 'center' }}>
          <div style={{ color: isSpeaking ? THEME.goldLight : '#888', fontStyle: 'italic' }}>{isSpeaking ? `🎙️ ${displayText.substring(0, 120)}...` : transcript ? `💬 "${transcript}"` : 'Say "Read" to hear overview, or "Close" to exit'}</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ color: THEME.gold, fontSize: '1.6em', marginBottom: '15px' }}>Building a Global Ecosystem</h3>
            <p style={{ color: '#ddd', fontSize: '1.1em', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>VistaView is assembling a world-class network of partners across real estate, construction, manufacturing, interiors, and services.</p>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ color: THEME.gold, marginBottom: '16px' }}>Partner Categories</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {PARTNER_TYPES.map((p, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}30`, borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}><span style={{ fontSize: '1.8em' }}>{p.icon}</span><span style={{ color: '#fff', fontWeight: 600 }}>{p.title}</span></div>
                  <p style={{ color: '#aaa', fontSize: '0.9em', margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ color: THEME.gold, marginBottom: '16px' }}>Global Reach</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {REGIONS.map((r, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}30`, borderRadius: '10px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5em' }}>{r.icon}</span>
                  <div><div style={{ color: '#fff', fontWeight: 500 }}>{r.name}</div><div style={{ color: r.status === 'Active' ? '#00ff88' : '#888', fontSize: '0.75em' }}>{r.status}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '30px', background: `${THEME.gold}15`, borderRadius: '16px', border: `1px solid ${THEME.gold}30` }}>
            <span style={{ fontSize: '3em', display: 'block', marginBottom: '15px' }}>🚀</span>
            <h4 style={{ color: THEME.gold, marginBottom: '10px' }}>Partnerships Revealing Soon</h4>
            <p style={{ color: '#aaa', maxWidth: '500px', margin: '0 auto' }}>Ultra-luxury developers, global manufacturers, and category-leading vendors are actively onboarding.<br/><br/><strong style={{ color: THEME.goldLight }}>We will be revealing these partnerships very soon.</strong></p>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 24px', borderTop: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={speakOverview} style={{ background: `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)`, color: '#000', border: 'none', padding: '10px 24px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}>🎙️ Read Overview</button>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${THEME.gold}`, padding: '10px 24px', borderRadius: '20px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default OurPartnersModal;
