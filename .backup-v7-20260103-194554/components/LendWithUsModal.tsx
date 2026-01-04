// VISTAVIEW - LEND WITH US MODAL
// Copy to: ~/vistaview_WORKING/src/components/LendWithUsModal.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LendWithUsModalProps { isOpen: boolean; onClose: () => void; }
interface SubPage { id: string; title: string; icon: string; content: string; highlights?: string[]; }
interface LendingSection { id: string; title: string; icon: string; voiceAliases: string[]; summary: string; fullDescription: string; subPages: SubPage[]; }

const LENDING_DATA: LendingSection[] = [
  { id: 'how-lending-works', title: 'How Lending Works', icon: '🏦', voiceAliases: ['how lending works', 'lending', 'how does lending work'], summary: 'AI-driven lending with 24-hour approvals',
    fullDescription: `VistaView Lending is algorithmic confidence, voice-guided approvals, and capital deployed with precision. This is not traditional lending - real estate, capital, and AI converge into a single execution engine!`,
    subPages: [
      { id: 'ai-approvals', title: '24-Hour AI Approvals', icon: '⚡', content: `Traditional lending takes weeks. VistaView does it in 24 hours! Our AI evaluates risk, timing, and return continuously. No endless paperwork. Just algorithmic confidence!`, highlights: ['24-hour turnaround', 'AI risk modeling', 'Zero paperwork'] },
      { id: 'capital-flow', title: 'Capital Flow', icon: '💰', content: `Capital should accelerate projects! Builders receive funds upfront - no cash flow choking. Customers aren't burdened with early EMIs. Everyone wins!`, highlights: ['Upfront builder capital', 'No early customer burden', 'Project velocity'] },
      { id: 'voice-guided', title: 'Voice-Guided Process', icon: '🎙️', content: `Inside Lend With Us, you converse with intelligence! Say "Show me lending opportunities" or "What's my portfolio status?" and the system responds visually and verbally!`, highlights: ['Voice commands', 'Natural conversation', 'Always interruptible'] }
    ]
  },
  { id: 'lending-club', title: 'The Lending Club', icon: '🎯', voiceAliases: ['lending club', 'club', 'investor club'], summary: 'Where Capital Meets Conviction',
    fullDescription: `The VistaView Lending Club is an invite-only network of accredited investors who believe capital should work faster and smarter. Members participate in pre-qualified, AI-vetted opportunities!`,
    subPages: [
      { id: 'membership', title: 'Membership', icon: '🎫', content: `The Lending Club is invite-only for accredited investors. Access curated, real estate-backed opportunities with AI-assisted risk modeling and transparent performance tracking!`, highlights: ['Invite-only', 'Accredited investors', 'Pre-qualified deals'] },
      { id: 'opportunities', title: 'Opportunities', icon: '📊', content: `Members participate in AI-vetted opportunities - every one is pre-qualified, risk-modeled, and continuously monitored. You see risk profile, expected returns, and real-time status!`, highlights: ['AI-vetted', 'Continuous monitoring', 'Clear visibility'] },
      { id: 'returns', title: 'Returns & Reporting', icon: '📈', content: `Transparent performance tracking you can query by voice! "What's my current yield?" The system responds with data, not dashboards. Exportable intelligence for your records!`, highlights: ['Voice-queryable', 'Real-time tracking', 'Full transparency'] }
    ]
  },
  { id: 'million-dollar-club', title: 'Million Dollar Club', icon: '💎', voiceAliases: ['million dollar club', 'million dollar', 'premium club', 'vip'], summary: 'For Those Who Build at Scale',
    fullDescription: `The Million Dollar Club is a premium inner circle for investors, builders, and visionaries operating at seven-figure and above levels. It's about capacity - move capital, build faster, compound intelligently!`,
    subPages: [
      { id: 'priority-access', title: 'Priority Access', icon: '🚀', content: `Million Dollar Club members get first look at high-value projects, early visibility into landmark developments, and structured participation in large-scale financing!`, highlights: ['First look access', 'Landmark projects', 'Large-scale financing'] },
      { id: 'ai-dashboards', title: 'AI Dashboards', icon: '🖥️', content: `Your personal AI-driven performance dashboard with real-time portfolio status, voice-queryable insights, and direct collaboration with VistaView's intelligence systems!`, highlights: ['Personal dashboard', 'Real-time status', 'AI collaboration'] },
      { id: 'direct-collaboration', title: 'Direct Collaboration', icon: '🤝', content: `Work directly with VistaView leadership. Strategic input on platform direction. Early access to new capabilities. You're a co-builder of the future!`, highlights: ['Leadership access', 'Strategic input', 'Early features'] }
    ]
  },
  { id: 'compliance', title: 'Trust & Compliance', icon: '🔐', voiceAliases: ['compliance', 'trust', 'security', 'audit'], summary: 'Built for Discipline, Not Hype',
    fullDescription: `Lend With Us operates on unchanging principles: Compliance-first, data-backed decisions, confirm-before-execute governance, full auditability. Every action is tracked and explainable!`,
    subPages: [
      { id: 'audit-trail', title: 'Full Audit Trail', icon: '📋', content: `Every action in the lending ecosystem is recorded - who, what, when, why. All logged and exportable for compliance reporting and tax documentation!`, highlights: ['Complete logging', 'Exportable records', 'Tax-ready'] },
      { id: 'accreditation', title: 'Accreditation', icon: '✅', content: `This is for accredited investors only. We verify, validate, and protect. The integrity of the Lending Club depends on disciplined membership!`, highlights: ['Verified members', 'Strict validation', 'Protected ecosystem'] },
      { id: 'regulatory', title: 'Regulatory Framework', icon: '⚖️', content: `VistaView Lending operates within established regulatory frameworks. Every structure, process, and disclosure is designed for regulatory comfort!`, highlights: ['Regulatory compliant', 'Full disclosure', 'Disciplined innovation'] }
    ]
  }
];

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };
interface NavState { view: 'grid' | 'section' | 'subpage'; section: LendingSection | null; subPage: SubPage | null; }

const LendWithUsModal: React.FC<LendWithUsModalProps> = ({ isOpen, onClose }) => {
  const [navStack, setNavStack] = useState<NavState[]>([]);
  const [currentNav, setCurrentNav] = useState<NavState>({ view: 'grid', section: null, subPage: null });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
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
    r.onresult = (e: any) => { const res = e.results[e.results.length-1]; setTranscript(res[0].transcript.trim()); if(res.isFinal) handleVoiceCommand(res[0].transcript.toLowerCase()); };
    r.onend = () => { if (isListening && isOpen) try { r.start(); } catch(e) {} };
    recRef.current = r;
  }, [isOpen, isListening, currentNav]);

  useEffect(() => {
    if (isOpen) { setIsListening(true); setNavStack([]); setCurrentNav({ view: 'grid', section: null, subPage: null }); try { recRef.current?.start(); } catch(e) {} setTimeout(() => speak("Welcome to Lend With Us - VistaView's private lending intelligence! Click any section or say its name!"), 500); }
    else { setIsListening(false); try { recRef.current?.stop(); } catch(e) {} stop(); }
  }, [isOpen]);

  const handleVoiceCommand = useCallback((cmd: string) => {
    if (cmd.includes('stop') || cmd.includes('pause')) { stop(); return; }
    if (cmd.includes('close') || cmd.includes('exit')) { stop(); onClose(); return; }
    if (cmd.includes('back') || cmd.includes('go back')) { goBack(); return; }
    for (const section of LENDING_DATA) { for (const alias of section.voiceAliases) { if (cmd.includes(alias)) { navigateToSection(section); return; } } }
    if (currentNav.section) { for (const sp of currentNav.section.subPages) { if (cmd.includes(sp.title.toLowerCase())) { navigateToSubPage(sp); return; } } }
  }, [currentNav, onClose]);

  const navigateToSection = (section: LendingSection) => {
    setWalkingTo(section.id); speak(`Got it. Opening ${section.title}...`);
    setTimeout(() => { setWalkingTo(null); setNavStack(prev => [...prev, currentNav]); setCurrentNav({ view: 'section', section, subPage: null }); setTimeout(() => speak(`${section.title}! ${section.summary}`), 300); }, 1000);
  };
  const navigateToSubPage = (sp: SubPage) => {
    setWalkingTo(sp.id); speak(`Opening ${sp.title}...`);
    setTimeout(() => { setWalkingTo(null); setNavStack(prev => [...prev, currentNav]); setCurrentNav({ ...currentNav, view: 'subpage', subPage: sp }); setTimeout(() => speak(sp.content), 300); }, 800);
  };
  const goBack = () => {
    stop();
    if (navStack.length > 0) { const prev = navStack[navStack.length - 1]; setNavStack(navStack.slice(0, -1)); setCurrentNav(prev); speak(prev.view === 'grid' ? "Back to Lend With Us." : `Back to ${prev.section?.title}.`); }
    else if (currentNav.view !== 'grid') { setCurrentNav({ view: 'grid', section: null, subPage: null }); speak("Back to Lend With Us."); }
  };
  const speak = (text: string) => { if (!synthRef.current) return; stop(); setDisplayText(text); setIsSpeaking(true); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.onend = () => setIsSpeaking(false); synthRef.current.speak(u); };
  const stop = () => { synthRef.current?.cancel(); setIsSpeaking(false); };

  if (!isOpen) return null;
  const { view, section, subPage } = currentNav;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '24px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderBottom: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {view !== 'grid' && <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>}
            <h2 style={{ color: THEME.gold, margin: 0 }}>💰 Lend With Us{section && <span style={{ color: '#fff', fontWeight: 400 }}> / {section.title}</span>}{subPage && <span style={{ color: THEME.goldLight, fontWeight: 400 }}> / {subPage.title}</span>}</h2>
          </div>
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
          {walkingTo ? <div style={{ color: THEME.goldLight }}><span style={{ fontSize: '1.5em' }}>🚶</span> Walking to {walkingTo}...</div> : <div style={{ color: isSpeaking ? THEME.goldLight : '#888', fontStyle: 'italic' }}>{isSpeaking ? `🎙️ ${displayText.substring(0, 120)}...` : transcript ? `💬 "${transcript}"` : 'Say "Lending Club", "Million Dollar Club", "Back", or "Close"'}</div>}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {view === 'grid' && (<div><div style={{ textAlign: 'center', marginBottom: '30px' }}><h3 style={{ color: THEME.gold, fontSize: '1.5em', marginBottom: '10px' }}>The VistaView Lending Intelligence</h3><p style={{ color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>Where real estate, capital, and AI converge. Algorithmic confidence. Voice-guided approvals. Capital deployed with precision.</p></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>{LENDING_DATA.map(s => (<button key={s.id} onClick={() => navigateToSection(s)} style={{ background: walkingTo === s.id ? `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)` : 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}40`, borderRadius: '16px', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '2.5em' }}>{s.icon}</span><span style={{ color: walkingTo === s.id ? '#000' : '#fff', fontWeight: 600, fontSize: '1.1em' }}>{s.title}</span><span style={{ color: walkingTo === s.id ? '#000' : '#aaa', fontSize: '0.85em', textAlign: 'center' }}>{s.summary}</span></button>))}</div></div>)}
          {view === 'section' && section && (<div><div style={{ background: `${THEME.gold}20`, borderRadius: '16px', padding: '24px', marginBottom: '24px', border: `1px solid ${THEME.gold}40` }}><div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}><span style={{ fontSize: '3em' }}>{section.icon}</span><div><h3 style={{ color: THEME.gold, margin: 0 }}>{section.title}</h3><p style={{ color: THEME.goldLight, margin: '5px 0 0' }}>{section.summary}</p></div></div><p style={{ color: '#ddd', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{section.fullDescription}</p></div><h4 style={{ color: THEME.gold, marginBottom: '16px' }}>Explore More:</h4><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>{section.subPages.map(sp => (<button key={sp.id} onClick={() => navigateToSubPage(sp)} style={{ background: walkingTo === sp.id ? `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)` : 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}30`, borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'left' }}><span style={{ fontSize: '1.8em', display: 'block', marginBottom: '8px' }}>{sp.icon}</span><span style={{ color: walkingTo === sp.id ? '#000' : '#fff', fontWeight: 500 }}>{sp.title}</span></button>))}</div></div>)}
          {view === 'subpage' && subPage && section && (<div><div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '30px', borderLeft: `4px solid ${THEME.gold}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}><span style={{ fontSize: '2.5em' }}>{subPage.icon}</span><div><h3 style={{ color: THEME.gold, margin: 0 }}>{subPage.title}</h3><p style={{ color: '#888', margin: '5px 0 0', fontSize: '0.9em' }}>Part of: {section.title}</p></div></div><p style={{ color: '#ddd', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{subPage.content}</p>{subPage.highlights && (<div style={{ marginTop: '24px' }}><h4 style={{ color: THEME.gold, marginBottom: '12px' }}>Key Points:</h4><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{subPage.highlights.map((h, i) => <span key={i} style={{ background: `${THEME.gold}30`, color: THEME.goldLight, padding: '6px 14px', borderRadius: '20px', fontSize: '0.85em' }}>✓ {h}</span>)}</div></div>)}</div><div style={{ marginTop: '24px' }}><p style={{ color: '#888', marginBottom: '12px' }}>Other topics:</p><div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{section.subPages.filter(sp => sp.id !== subPage.id).map(sp => <button key={sp.id} onClick={() => navigateToSubPage(sp)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}30`, color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>{sp.icon} {sp.title}</button>)}</div></div></div>)}
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 24px', borderTop: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {view === 'grid' ? (<><button onClick={() => navigateToSection(LENDING_DATA[0])} style={qBtn}>🏦 How It Works</button><button onClick={() => navigateToSection(LENDING_DATA[1])} style={qBtn}>🎯 Lending Club</button><button onClick={() => navigateToSection(LENDING_DATA[2])} style={qBtn}>💎 Million Dollar Club</button></>) : (<><button onClick={goBack} style={qBtn}>← Back</button><button onClick={() => { if (view === 'subpage' && subPage) speak(subPage.content); else if (section) speak(section.fullDescription); }} style={{...qBtn, background: `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)`}}>🎙️ Read Aloud</button></>)}
        </div>
      </div>
    </div>
  );
};
const qBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #B8860B', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' };
export default LendWithUsModal;
