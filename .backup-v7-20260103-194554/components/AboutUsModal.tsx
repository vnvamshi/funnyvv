// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - ABOUT US MODAL v2.2
// Enhanced: Fixed back, pause on "hey Mr V", walking cursor
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import WalkingCursor from './WalkingCursor';

interface AboutUsModalProps { isOpen: boolean; onClose: () => void; }
interface SubPage { id: string; title: string; icon: string; content: string; highlights?: string[]; }
interface AboutSection { id: string; title: string; icon: string; voiceAliases: string[]; summary: string; fullDescription: string; subPages: SubPage[]; }

const ABOUT_US_DATA: AboutSection[] = [
  { id: 'overview', title: 'Overview', icon: '🏢', voiceAliases: ['overview', 'about', 'vistaview'], summary: "World's first hands-free real estate intelligence platform",
    fullDescription: `VistaView is the world's first hands-free, self-learning real estate intelligence platform. It listens, understands, builds, and evolves.`,
    subPages: [
      { id: 'what-we-do', title: 'What We Do', icon: '🎯', content: `VistaView is revolutionizing real estate! We've built the world's first platform where you can literally TALK to find properties, order products, and get services.`, highlights: ['Voice-driven', 'Agentic AI', 'Self-learning'] },
      { id: 'our-mission', title: 'Our Mission', icon: '🚀', content: `Our mission: Make real estate intelligent, hands-free, and globally scalable. If you can speak it, VistaView can build it!`, highlights: ['Global access', 'Remove barriers', 'Premium for all'] },
      { id: 'why-different', title: 'Why Different', icon: '⭐', content: `Traditional platforms show listings. VistaView CONVERSES with you. We're creating a new category!`, highlights: ['First in category', 'Conversation not search'] }
    ]
  },
  { id: 'ceo', title: 'CEO', icon: '👔', voiceAliases: ['ceo', 'founder', 'vamshi'], summary: 'Vamshi Krishna Vuppaladadium - Founder & CEO',
    fullDescription: `Vamshi Krishna Vuppaladadium is the visionary founder and CEO. His vision: "If a human can explain it, VistaView should be able to build it."`,
    subPages: [
      { id: 'ceo-vision', title: 'CEO Vision', icon: '🔮', content: `"If a human can explain it, VistaView should be able to build it." A world where anyone can transact in real estate just by conversing!`, highlights: ['Human-first', 'Universal access'] },
      { id: 'ceo-message', title: 'CEO Message', icon: '💬', content: `Welcome to VistaView. We're creating an intelligence layer where vendors go live in under an hour, builders publish without barriers.`, highlights: ['Welcome message', 'Global standard'] },
      { id: 'ceo-journey', title: 'The Journey', icon: '🛤️', content: `What if you could just TALK to real estate? That question became VistaView!`, highlights: ['Revolutionary solution', 'Vision to reality'] }
    ]
  },
  { id: 'sunitha', title: 'Sunitha Tripuram', icon: '👩‍💼', voiceAliases: ['sunitha', 'tripuram', 'operations'], summary: 'IT Operations',
    fullDescription: `Sunitha Tripuram leads IT Operations, ensuring seamless coordination across teams.`,
    subPages: [
      { id: 'sunitha-role', title: 'Her Role', icon: '⚙️', content: `Sunitha is the operational backbone! When you click and it works? That's Sunitha's team!`, highlights: ['System coordination', 'Reliability'] },
      { id: 'sunitha-impact', title: 'Her Impact', icon: '📈', content: `99.9% uptime, sub-second response times. When we say "just works" - Sunitha is why!`, highlights: ['99.9% uptime', 'Fast responses'] },
      { id: 'sunitha-philosophy', title: 'Philosophy', icon: '💡', content: `"Operations isn't about fighting fires. It's about preventing them."`, highlights: ['Proactive approach'] }
    ]
  },
  { id: 'krishna', title: 'Krishna Yashodha', icon: '👨‍💻', voiceAliases: ['krishna', 'yashodha', 'architect'], summary: 'Chief Architect',
    fullDescription: `Krishna Yashodha is Chief Architect with expertise in AI-driven vectorization and cloud infrastructure.`,
    subPages: [
      { id: 'krishna-role', title: 'His Role', icon: '🏗️', content: `Krishna architects vector databases, RAG systems, and cloud infrastructure. When Mr. V understands you? That's Krishna's architecture!`, highlights: ['Vector databases', 'AI pipelines'] },
      { id: 'krishna-tech', title: 'Technology', icon: '🔧', content: `Vector Intelligence, Document Processing, Real-time AI, Scalable Infrastructure. Ready for millions!`, highlights: ['Vector intelligence', 'Real-time AI'] },
      { id: 'krishna-philosophy', title: 'Philosophy', icon: '💡', content: `"Architecture should be invisible but indispensable."`, highlights: ['User-first'] }
    ]
  },
  { id: 'vikram', title: 'Vikram Jangam', icon: '👨‍💼', voiceAliases: ['vikram', 'jangam', 'advisor'], summary: 'Advisor · Investor · Strategist',
    fullDescription: `Vikram Jangam contributes to high-level strategy, market positioning, and growth direction.`,
    subPages: [
      { id: 'vikram-role', title: 'His Role', icon: '🎯', content: `Market positioning, investment guidance, partnership development. He's the strategic compass!`, highlights: ['Strategic leadership'] },
      { id: 'vikram-strategy', title: 'Strategy', icon: '📊', content: `Market Domination, Global Scale, Network Effects, Sustainable Growth!`, highlights: ['Market domination', 'Global scale'] },
      { id: 'vikram-philosophy', title: 'Philosophy', icon: '💡', content: `"Strategy without execution is hallucination. Execution without strategy is chaos."`, highlights: ['Vision + execution'] }
    ]
  },
  { id: 'vision', title: 'Vision', icon: '🔮', voiceAliases: ['vision', 'future', 'roadmap'], summary: 'The future of real estate',
    fullDescription: `Building the operating system for real estate intelligence. This is just the beginning!`,
    subPages: [
      { id: 'vision-soon', title: 'Coming Soon', icon: '📅', content: `500,000+ SKUs, expanded metros, 3D/VR experiences, multi-language voice. Every month, smarter!`, highlights: ['500K+ SKUs', 'Multi-language'] },
      { id: 'vision-global', title: 'Global Vision', icon: '🌍', content: `$300+ trillion market. VistaView in every major market, serving millions globally!`, highlights: ['$300T+ market', 'Millions of users'] },
      { id: 'vision-impact', title: 'The Impact', icon: '💥', content: `For Buyers: Platform that UNDERSTANDS. For Vendors: Go live in minutes. New industry standard!`, highlights: ['Better for everyone'] }
    ]
  }
];

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

interface NavState { view: 'grid' | 'section' | 'subpage'; section: AboutSection | null; subPage: SubPage | null; }

const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  // Navigation stack for proper back functionality
  const [navStack, setNavStack] = useState<NavState[]>([]);
  const [currentNav, setCurrentNav] = useState<NavState>({ view: 'grid', section: null, subPage: null });
  
  // Voice state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [isOpen, isListening, isPaused, currentNav]);

  useEffect(() => {
    if (isOpen) {
      setIsListening(true); setIsPaused(false); setNavStack([]); 
      setCurrentNav({ view: 'grid', section: null, subPage: null });
      try { recRef.current?.start(); } catch(e) {}
      setTimeout(() => speak("Welcome to About VistaView! Say 'hey Mr V' anytime to get my attention. Click any section or say its name!"), 500);
    } else {
      setIsListening(false); try { recRef.current?.stop(); } catch(e) {} stop();
    }
  }, [isOpen]);

  const handleVoiceCommand = useCallback((cmd: string) => {
    // Clear pause timeout on any command
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    
    // "Hey Mr V" - pause and wait for instruction
    if (cmd.includes('hey') && (cmd.includes('mr') || cmd.includes('mister'))) {
      stop();
      setIsPaused(true);
      speak("Yes? I'm listening. What would you like me to do?");
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
        speak("Alright, continuing. Say 'hey Mr V' anytime!");
      }, 8000);
      return;
    }
    
    setIsPaused(false);
    
    if (cmd.includes('stop') || cmd.includes('pause')) { stop(); return; }
    if (cmd.includes('close') || cmd.includes('exit')) { stop(); onClose(); return; }
    if (cmd.includes('back') || cmd.includes('go back')) { goBack(); return; }
    
    // Find matching section
    for (const section of ABOUT_US_DATA) {
      for (const alias of section.voiceAliases) {
        if (cmd.includes(alias)) { navigateToSection(section); return; }
      }
    }
    
    // Find matching subpage
    if (currentNav.section) {
      for (const sp of currentNav.section.subPages) {
        if (cmd.includes(sp.title.toLowerCase()) || cmd.includes(sp.id.replace('-', ' '))) {
          navigateToSubPage(sp); return;
        }
      }
    }
  }, [currentNav, onClose]);

  const navigateToSection = (section: AboutSection) => {
    setWalkingTo(section.id);
    setCursorPos({ x: Math.random() * 60 + 20, y: Math.random() * 60 + 20 });
    speak(`Walking to ${section.title}...`);
    
    setTimeout(() => {
      setWalkingTo(null);
      setNavStack(prev => [...prev, currentNav]);
      setCurrentNav({ view: 'section', section, subPage: null });
      setTimeout(() => speak(`${section.title}! ${section.summary}. Say any topic name to explore, or 'back' to return.`), 300);
    }, 1200);
  };

  const navigateToSubPage = (sp: SubPage) => {
    setWalkingTo(sp.id);
    speak(`Opening ${sp.title}...`);
    
    setTimeout(() => {
      setWalkingTo(null);
      setNavStack(prev => [...prev, currentNav]);
      setCurrentNav({ ...currentNav, view: 'subpage', subPage: sp });
      setTimeout(() => speak(sp.content), 300);
    }, 1000);
  };

  const goBack = () => {
    stop();
    if (navStack.length > 0) {
      const prev = navStack[navStack.length - 1];
      setNavStack(navStack.slice(0, -1));
      setCurrentNav(prev);
      const msg = prev.view === 'grid' ? "Back to About Us main menu." : `Back to ${prev.section?.title}.`;
      speak(msg);
    } else if (currentNav.view !== 'grid') {
      setCurrentNav({ view: 'grid', section: null, subPage: null });
      speak("Back to About Us main menu.");
    } else {
      speak("You're at the main menu. Say a section name or 'close' to exit.");
    }
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
  const { view, section, subPage } = currentNav;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="modal-content" style={{ position: 'relative', background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '24px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}`, display: 'flex', flexDirection: 'column' }}>
        
        {/* Walking Cursor */}
        <WalkingCursor isWalking={!!walkingTo} targetName={walkingTo || undefined} position={cursorPos} />
        
        {/* Header */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderBottom: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {view !== 'grid' && (
              <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}>
                ← Back
              </button>
            )}
            <h2 style={{ color: THEME.gold, margin: 0, fontSize: '1.3em' }}>
              🏢 About VistaView
              {section && <span style={{ color: '#fff', fontWeight: 400 }}> / {section.title}</span>}
              {subPage && <span style={{ color: THEME.goldLight, fontWeight: 400 }}> / {subPage.title}</span>}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isPaused ? 'rgba(255,200,0,0.3)' : isListening ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', border: isPaused ? '1px solid #FFD700' : 'none' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isPaused ? '#FFD700' : isListening ? '#00ff00' : '#666', animation: isPaused ? 'pulse 1s infinite' : 'none' }} />
              <span style={{ color: '#fff', fontSize: '0.85em' }}>{isPaused ? 'Waiting for you...' : isListening ? 'Listening...' : 'Paused'}</span>
            </div>
            {isSpeaking && <button onClick={stop} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>⏹ Stop</button>}
            <button onClick={onClose} style={{ background: 'transparent', color: '#fff', border: `1px solid ${THEME.gold}`, width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2em' }}>✕</button>
          </div>
        </div>

        {/* Teleprompter */}
        <div style={{ background: `rgba(184,134,11,0.15)`, padding: '12px 24px', minHeight: '50px', display: 'flex', alignItems: 'center' }}>
          {walkingTo ? (
            <div style={{ color: THEME.goldLight, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5em', animation: 'bounce 0.5s infinite alternate' }}>🚶</span>
              <span>Walking to {walkingTo}...</span>
            </div>
          ) : (
            <div style={{ color: isSpeaking ? THEME.goldLight : '#888', fontStyle: 'italic' }}>
              {isSpeaking ? `🎙️ ${displayText.substring(0, 150)}${displayText.length > 150 ? '...' : ''}` : 
               transcript ? `💬 "${transcript}"` : 
               isPaused ? '⏸️ Waiting for your command...' :
               'Say "hey Mr V" to get attention, or click any section'}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {view === 'grid' && (
            <div>
              <p style={{ color: THEME.goldLight, textAlign: 'center', marginBottom: '24px' }}>
                Click any section or say its name to explore!
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {ABOUT_US_DATA.map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigateToSection(s)}
                    style={{
                      background: walkingTo === s.id ? `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${walkingTo === s.id ? THEME.gold : THEME.gold + '40'}`,
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.3s ease',
                      transform: walkingTo === s.id ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    <span style={{ fontSize: '2.5em' }}>{s.icon}</span>
                    <span style={{ color: walkingTo === s.id ? '#000' : '#fff', fontWeight: 600 }}>{s.title}</span>
                    <span style={{ color: walkingTo === s.id ? '#000' : '#aaa', fontSize: '0.8em', textAlign: 'center' }}>{s.summary.substring(0, 45)}...</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'section' && section && (
            <div>
              <div style={{ background: `${THEME.gold}20`, borderRadius: '16px', padding: '24px', marginBottom: '24px', border: `1px solid ${THEME.gold}40` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '3em' }}>{section.icon}</span>
                  <div>
                    <h3 style={{ color: THEME.gold, margin: 0 }}>{section.title}</h3>
                    <p style={{ color: THEME.goldLight, margin: '5px 0 0' }}>{section.summary}</p>
                  </div>
                </div>
                <p style={{ color: '#ddd', lineHeight: 1.8 }}>{section.fullDescription}</p>
              </div>
              
              <h4 style={{ color: THEME.gold, marginBottom: '16px' }}>Explore More:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {section.subPages.map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => navigateToSubPage(sp)}
                    style={{
                      background: walkingTo === sp.id ? `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${THEME.gold}30`,
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.8em', display: 'block', marginBottom: '8px' }}>{sp.icon}</span>
                    <span style={{ color: walkingTo === sp.id ? '#000' : '#fff', fontWeight: 500 }}>{sp.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'subpage' && subPage && section && (
            <div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '30px', borderLeft: `4px solid ${THEME.gold}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '2.5em' }}>{subPage.icon}</span>
                  <div>
                    <h3 style={{ color: THEME.gold, margin: 0 }}>{subPage.title}</h3>
                    <p style={{ color: '#888', margin: '5px 0 0', fontSize: '0.9em' }}>Part of: {section.title}</p>
                  </div>
                </div>
                <p style={{ color: '#ddd', lineHeight: 1.9 }}>{subPage.content}</p>
                {subPage.highlights && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ color: THEME.gold, marginBottom: '12px' }}>Key Points:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {subPage.highlights.map((h, i) => (
                        <span key={i} style={{ background: `${THEME.gold}30`, color: THEME.goldLight, padding: '6px 14px', borderRadius: '20px', fontSize: '0.85em' }}>✓ {h}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '24px' }}>
                <p style={{ color: '#888', marginBottom: '12px' }}>Other topics in {section.title}:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {section.subPages.filter(sp => sp.id !== subPage.id).map(sp => (
                    <button key={sp.id} onClick={() => navigateToSubPage(sp)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}30`, color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>
                      {sp.icon} {sp.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 24px', borderTop: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {view === 'grid' ? (
            <>
              <button onClick={() => navigateToSection(ABOUT_US_DATA[1])} style={qBtn}>👔 CEO</button>
              <button onClick={() => navigateToSection(ABOUT_US_DATA[2])} style={qBtn}>👩‍💼 Sunitha</button>
              <button onClick={() => navigateToSection(ABOUT_US_DATA[3])} style={qBtn}>👨‍💻 Krishna</button>
              <button onClick={() => navigateToSection(ABOUT_US_DATA[4])} style={qBtn}>👨‍💼 Vikram</button>
            </>
          ) : (
            <>
              <button onClick={goBack} style={qBtn}>← Back</button>
              <button onClick={() => { if (view === 'subpage' && subPage) speak(subPage.content); else if (section) speak(section.fullDescription); }} style={{...qBtn, background: `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)`, color: '#000'}}>🎙️ Read Aloud</button>
            </>
          )}
          <button onClick={onClose} style={qBtn}>✕ Close</button>
        </div>
        
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-3px); } }
        `}</style>
      </div>
    </div>
  );
};

const qBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #B8860B', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' };

export default AboutUsModal;
