// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - ABOUT US MODAL (Enhanced v2)
// With subpages for CEO and each team member - same pattern as How It Works
// Place this file in: ~/vistaview_WORKING/src/components/AboutUsModal.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubPage {
  id: string;
  title: string;
  icon: string;
  content: string;
  highlights?: string[];
}

interface AboutSection {
  id: string;
  title: string;
  icon: string;
  voiceAliases: string[];
  summary: string;
  fullDescription: string;
  subPages: SubPage[];
}

const ABOUT_US_DATA: AboutSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: '🏢',
    voiceAliases: ['overview', 'about', 'what is vistaview', 'vistaview'],
    summary: "World's first hands-free real estate intelligence platform",
    fullDescription: `VistaView is the world's first hands-free, self-learning real estate intelligence platform.

It doesn't just display information — it listens, understands, builds, and evolves. With VistaView, conversations turn into execution. Documents turn into intelligence.`,
    subPages: [
      { id: 'what-we-do', title: 'What We Do', icon: '🎯', content: `VistaView is revolutionizing real estate! We've built the world's first platform where you can literally TALK to find properties, order products, and get services. No more endless clicking. Just speak naturally!`, highlights: ['Voice-driven', 'Agentic AI', 'Self-learning', 'Hands-free'] },
      { id: 'our-mission', title: 'Our Mission', icon: '🚀', content: `Our mission: Make real estate intelligent, hands-free, and globally scalable. We believe everyone deserves access to premium real estate experiences. If you can speak it, VistaView can build it!`, highlights: ['Global access', 'Remove barriers', 'Premium for all'] },
      { id: 'why-different', title: 'Why Different', icon: '⭐', content: `There's nothing else like VistaView! Traditional platforms show listings. VistaView CONVERSES with you. Other sites make you fill forms. VistaView lets you just TALK. We're creating a new category!`, highlights: ['First in category', 'Conversation not search', 'Zero manual setup'] }
    ]
  },
  {
    id: 'ceo',
    title: 'CEO',
    icon: '👔',
    voiceAliases: ['ceo', 'founder', 'vamshi', 'krishna', 'vuppaladadium'],
    summary: 'Vamshi Krishna Vuppaladadium - Founder & CEO',
    fullDescription: `Vamshi Krishna Vuppaladadium is the visionary founder and CEO of VistaView. He is redefining how the world experiences real estate.

His vision: "If a human can explain it, VistaView should be able to build it."`,
    subPages: [
      { id: 'ceo-vision', title: 'CEO Vision', icon: '🔮', content: `"If a human can explain it, VistaView should be able to build it." This isn't just a tagline - it's the north star. His vision: A world where anyone can create and transact in real estate just by having a conversation!`, highlights: ['Human-first', 'Technology disappears', 'Universal access'] },
      { id: 'ceo-message', title: 'CEO Message', icon: '💬', content: `Welcome to VistaView. Real estate has remained complex, manual, and fragmented for far too long. We are creating an intelligence layer where vendors go live in under an hour, builders publish without barriers, and users explore by simply speaking. VistaView is not a tool. It is an evolving intelligence!`, highlights: ['Welcome message', 'Change industry', 'Global standard'] },
      { id: 'ceo-journey', title: 'The Journey', icon: '🛤️', content: `This journey started with a simple frustration: Why is real estate so complicated? The solution wasn't another listing site - it was to reimagine the entire interaction model. What if you could just TALK to real estate? That question became VistaView!`, highlights: ['Personal journey', 'Revolutionary solution', 'Vision to reality'] }
    ]
  },
  {
    id: 'sunitha',
    title: 'Sunitha Tripuram',
    icon: '👩‍💼',
    voiceAliases: ['sunitha', 'tripuram', 'it operations', 'operations'],
    summary: 'IT Operations - Multi-team coordination',
    fullDescription: `Sunitha Tripuram leads IT Operations at VistaView, ensuring seamless coordination across multiple teams, systems, and workflows. She keeps the platform execution-ready, stable, and scalable!`,
    subPages: [
      { id: 'sunitha-role', title: 'Her Role', icon: '⚙️', content: `Sunitha is the operational backbone of VistaView! She ensures all systems - voice recognition, AI processing, cloud infrastructure - work together seamlessly. When you click and it works? That's Sunitha's team!`, highlights: ['Operational backbone', 'System coordination', 'Reliability'] },
      { id: 'sunitha-impact', title: 'Her Impact', icon: '📈', content: `Under Sunitha's leadership: 99.9% uptime, sub-second response times, seamless deployments, zero-downtime updates. When we say VistaView "just works" - Sunitha is the reason why!`, highlights: ['99.9% uptime', 'Fast responses', 'Seamless deploys'] },
      { id: 'sunitha-philosophy', title: 'Philosophy', icon: '💡', content: `"Operations isn't about fighting fires. It's about preventing them." Great operations are invisible. When everything works perfectly, nobody notices. And that's exactly the point!`, highlights: ['Proactive approach', 'Invisible excellence', 'Flawless delivery'] }
    ]
  },
  {
    id: 'krishna',
    title: 'Krishna Yashodha',
    icon: '👨‍💻',
    voiceAliases: ['krishna', 'yashodha', 'chief architect', 'architect'],
    summary: 'Chief Architect & IT Director',
    fullDescription: `Krishna Yashodha is the Chief Architect and IT Director at VistaView, with deep expertise in database architecture, AI-driven vectorization, and large-scale cloud infrastructure. The magic of VistaView is his architecture!`,
    subPages: [
      { id: 'krishna-role', title: 'His Role', icon: '🏗️', content: `Krishna is the technical visionary! He architects vector databases, embedding pipelines, RAG systems, and cloud infrastructure. When Mr. V understands your question? That's Krishna's architecture!`, highlights: ['Technical visionary', 'Vector databases', 'AI pipelines', 'Global scale'] },
      { id: 'krishna-tech', title: 'Technology', icon: '🔧', content: `Krishna built: Vector Intelligence (semantic meaning), Document Processing (PDFs, CADs), Real-time AI (sub-second responses), Scalable Infrastructure (AWS, globally distributed). Ready for millions!`, highlights: ['Vector intelligence', 'Document processing', 'Real-time AI'] },
      { id: 'krishna-philosophy', title: 'Philosophy', icon: '💡', content: `"Architecture should be invisible but indispensable." Great technology disappears. Users shouldn't think about databases or vectors - they should just experience magic!`, highlights: ['Invisible sophistication', 'User-first', 'Effortless magic'] }
    ]
  },
  {
    id: 'vikram',
    title: 'Vikram Jangam',
    icon: '👨‍💼',
    voiceAliases: ['vikram', 'jangam', 'advisor', 'investor', 'strategist'],
    summary: 'Advisor · Investor · Strategist',
    fullDescription: `Vikram Jangam serves as Advisor, Investor, and Strategic Leader at VistaView. He contributes to high-level strategy, market positioning, and long-term growth direction!`,
    subPages: [
      { id: 'vikram-role', title: 'His Role', icon: '🎯', content: `Vikram brings strategic firepower! Market positioning strategy, investment guidance, partnership development, long-term growth planning, competitive analysis. He's the strategic compass!`, highlights: ['Strategic leadership', 'Market positioning', 'Investment guidance'] },
      { id: 'vikram-strategy', title: 'Strategy', icon: '📊', content: `Vikram's vision: Market Domination (own the category), Global Scale (every market), Network Effects (everyone makes it better), Sustainable Growth (fast AND lasting)!`, highlights: ['Market domination', 'Global scale', 'Network effects'] },
      { id: 'vikram-philosophy', title: 'Philosophy', icon: '💡', content: `"Strategy without execution is hallucination. Execution without strategy is chaos." Bold vision paired with disciplined execution. Every decision backed by data and market validation!`, highlights: ['Vision + execution', 'Data-driven', 'Fast and right'] }
    ]
  },
  {
    id: 'vision',
    title: 'Vision',
    icon: '🔮',
    voiceAliases: ['vision', 'future', 'roadmap', 'where are we going'],
    summary: 'The future of real estate intelligence',
    fullDescription: `VistaView's vision: Building the operating system for real estate intelligence. Anyone can participate without barriers. Vendors go live instantly. This is just the beginning!`,
    subPages: [
      { id: 'vision-soon', title: 'Coming Soon', icon: '📅', content: `What's coming: 500,000+ product SKUs, expanded metro coverage, enhanced 3D/VR experiences, deeper insurance/finance integrations, multi-language voice. Every month, VistaView gets smarter!`, highlights: ['500K+ SKUs', 'VR experiences', 'Multi-language'] },
      { id: 'vision-global', title: 'Global Vision', icon: '🌍', content: `Real estate is a $300+ trillion asset class worldwide. Our vision: VistaView in every major market, every major language, serving millions globally. One platform. Global reach!`, highlights: ['$300T+ market', 'Every country', 'Millions of users'] },
      { id: 'vision-impact', title: 'The Impact', icon: '💥', content: `For Buyers: Platform that UNDERSTANDS you. For Vendors: Go live in minutes. For Builders: Showcase immersively. For Industry: New standard for how real estate works!`, highlights: ['Better for buyers', 'Faster for vendors', 'New standard'] }
    ]
  }
];

const THEME = { teal: '#004236', tealLight: '#007E67', gold: '#B8860B', goldLight: '#F5EC9B' };

const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<'grid' | 'section' | 'subpage'>('grid');
  const [selectedSection, setSelectedSection] = useState<AboutSection | null>(null);
  const [selectedSubPage, setSelectedSubPage] = useState<SubPage | null>(null);
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
  }, [isOpen, isListening, currentView, selectedSection]);

  useEffect(() => {
    if (isOpen) {
      setIsListening(true); setCurrentView('grid'); setSelectedSection(null); setSelectedSubPage(null);
      try { recRef.current?.start(); } catch(e) {}
      setTimeout(() => speak("Welcome to About VistaView! Click any section or say CEO, Sunitha, Krishna, or Vikram!"), 500);
    } else { setIsListening(false); try { recRef.current?.stop(); } catch(e) {} stop(); }
  }, [isOpen]);

  const handleVoiceCommand = useCallback((cmd: string) => {
    if (cmd.includes('stop') || cmd.includes('pause') || cmd.includes('hey')) { stop(); return; }
    if (cmd.includes('close') || cmd.includes('exit')) { stop(); onClose(); return; }
    if (cmd.includes('back') || cmd.includes('go back')) { goBack(); return; }
    for (const section of ABOUT_US_DATA) {
      for (const alias of section.voiceAliases) {
        if (cmd.includes(alias)) { walkToSection(section); return; }
      }
    }
    if (selectedSection) {
      for (const sp of selectedSection.subPages) {
        if (cmd.includes(sp.title.toLowerCase()) || cmd.includes(sp.id)) { walkToSubPage(sp); return; }
      }
    }
  }, [currentView, selectedSection, selectedSubPage, onClose]);

  const walkToSection = (section: AboutSection) => {
    setWalkingTo(section.id); speak(`Walking to ${section.title}...`);
    setTimeout(() => { setWalkingTo(null); setSelectedSection(section); setCurrentView('section'); setTimeout(() => speak(`${section.title}! ${section.summary}`), 300); }, 1000);
  };

  const walkToSubPage = (sp: SubPage) => {
    setWalkingTo(sp.id); speak(`Opening ${sp.title}...`);
    setTimeout(() => { setWalkingTo(null); setSelectedSubPage(sp); setCurrentView('subpage'); setTimeout(() => speak(sp.content), 300); }, 800);
  };

  const goBack = () => {
    stop();
    if (currentView === 'subpage') { setSelectedSubPage(null); setCurrentView('section'); speak("Going back."); }
    else if (currentView === 'section') { setSelectedSection(null); setCurrentView('grid'); speak("Back to main menu."); }
  };

  const speak = (text: string) => { if (!synthRef.current) return; stop(); setDisplayText(text); setIsSpeaking(true); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.onend = () => setIsSpeaking(false); synthRef.current.speak(u); };
  const stop = () => { synthRef.current?.cancel(); setIsSpeaking(false); };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '24px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.gold}`, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderBottom: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {currentView !== 'grid' && <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`, color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>}
            <h2 style={{ color: THEME.gold, margin: 0 }}>🏢 About VistaView{selectedSection && <span style={{ color: '#fff', fontWeight: 400 }}> / {selectedSection.title}</span>}{selectedSubPage && <span style={{ color: THEME.goldLight, fontWeight: 400 }}> / {selectedSubPage.title}</span>}</h2>
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

        {/* Teleprompter */}
        <div style={{ background: `rgba(184,134,11,0.15)`, padding: '12px 24px', minHeight: '50px', display: 'flex', alignItems: 'center' }}>
          {walkingTo ? <div style={{ color: THEME.goldLight }}><span style={{ fontSize: '1.5em' }}>🚶</span> Walking to {walkingTo}...</div> :
           <div style={{ color: isSpeaking ? THEME.goldLight : '#888', fontStyle: 'italic' }}>{isSpeaking ? `🎙️ ${displayText.substring(0, 120)}...` : transcript ? `💬 "${transcript}"` : 'Say "CEO", "Sunitha", "Krishna", "Vikram", "Back", or "Close"'}</div>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {currentView === 'grid' && (
            <div>
              <p style={{ color: THEME.goldLight, textAlign: 'center', marginBottom: '24px' }}>Click any section or say its name!</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {ABOUT_US_DATA.map(s => (
                  <button key={s.id} onClick={() => walkToSection(s)} style={{ background: walkingTo === s.id ? `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)` : 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}40`, borderRadius: '16px', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '2.5em' }}>{s.icon}</span>
                    <span style={{ color: walkingTo === s.id ? '#000' : '#fff', fontWeight: 600 }}>{s.title}</span>
                    <span style={{ color: walkingTo === s.id ? '#000' : '#aaa', fontSize: '0.8em', textAlign: 'center' }}>{s.summary.substring(0, 40)}...</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentView === 'section' && selectedSection && (
            <div>
              <div style={{ background: `${THEME.gold}20`, borderRadius: '16px', padding: '24px', marginBottom: '24px', border: `1px solid ${THEME.gold}40` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '3em' }}>{selectedSection.icon}</span>
                  <div><h3 style={{ color: THEME.gold, margin: 0 }}>{selectedSection.title}</h3><p style={{ color: THEME.goldLight, margin: '5px 0 0' }}>{selectedSection.summary}</p></div>
                </div>
                <p style={{ color: '#ddd', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{selectedSection.fullDescription}</p>
              </div>
              <h4 style={{ color: THEME.gold, marginBottom: '16px' }}>Explore More:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {selectedSection.subPages.map(sp => (
                  <button key={sp.id} onClick={() => walkToSubPage(sp)} style={{ background: walkingTo === sp.id ? `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)` : 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}30`, borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '1.8em', display: 'block', marginBottom: '8px' }}>{sp.icon}</span>
                    <span style={{ color: walkingTo === sp.id ? '#000' : '#fff', fontWeight: 500 }}>{sp.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentView === 'subpage' && selectedSubPage && selectedSection && (
            <div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '30px', borderLeft: `4px solid ${THEME.gold}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '2.5em' }}>{selectedSubPage.icon}</span>
                  <div><h3 style={{ color: THEME.gold, margin: 0 }}>{selectedSubPage.title}</h3><p style={{ color: '#888', margin: '5px 0 0', fontSize: '0.9em' }}>Part of: {selectedSection.title}</p></div>
                </div>
                <p style={{ color: '#ddd', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{selectedSubPage.content}</p>
                {selectedSubPage.highlights && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ color: THEME.gold, marginBottom: '12px' }}>Key Points:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{selectedSubPage.highlights.map((h, i) => <span key={i} style={{ background: `${THEME.gold}30`, color: THEME.goldLight, padding: '6px 14px', borderRadius: '20px', fontSize: '0.85em' }}>✓ {h}</span>)}</div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: '24px' }}>
                <p style={{ color: '#888', marginBottom: '12px' }}>Other topics:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{selectedSection.subPages.filter(sp => sp.id !== selectedSubPage.id).map(sp => <button key={sp.id} onClick={() => walkToSubPage(sp)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.gold}30`, color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>{sp.icon} {sp.title}</button>)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 24px', borderTop: `1px solid ${THEME.gold}40`, display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {currentView === 'grid' ? (<>
            <button onClick={() => walkToSection(ABOUT_US_DATA[1])} style={qBtn}>👔 CEO</button>
            <button onClick={() => walkToSection(ABOUT_US_DATA[2])} style={qBtn}>👩‍💼 Sunitha</button>
            <button onClick={() => walkToSection(ABOUT_US_DATA[3])} style={qBtn}>👨‍💻 Krishna</button>
            <button onClick={() => walkToSection(ABOUT_US_DATA[4])} style={qBtn}>👨‍💼 Vikram</button>
          </>) : (<>
            <button onClick={goBack} style={qBtn}>← Back</button>
            <button onClick={() => { if (currentView === 'subpage' && selectedSubPage) speak(selectedSubPage.content); else if (selectedSection) speak(selectedSection.fullDescription); }} style={{...qBtn, background: `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)`}}>🎙️ Read Aloud</button>
          </>)}
        </div>
      </div>
    </div>
  );
};

const qBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #B8860B', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' };

export default AboutUsModal;
