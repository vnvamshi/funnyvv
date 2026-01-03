// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - HOW IT WORKS MODAL
// Interactive modal with 10 icons, subpages, voice, and teleprompter
// Place this file in: ~/vistaview_WORKING/src/components/HowItWorksModal.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HOW_IT_WORKS_DATA, HowItWorksItem, SubPage, findItemByVoice } from './HowItWorksData';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME = { teal: '#004236', tealLight: '#007E67', gold: '#B8860B', goldLight: '#F5EC9B' };

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  // Navigation state
  const [currentView, setCurrentView] = useState<'grid' | 'item' | 'subpage'>('grid');
  const [selectedItem, setSelectedItem] = useState<HowItWorksItem | null>(null);
  const [selectedSubPage, setSelectedSubPage] = useState<SubPage | null>(null);
  
  // Voice state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recRef = useRef<any>(null);

  // Initialize speech
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    
    r.onresult = (e: any) => {
      const res = e.results[e.results.length - 1];
      setTranscript(res[0].transcript.trim());
      if (res.isFinal) handleVoiceCommand(res[0].transcript.toLowerCase());
    };
    
    r.onend = () => {
      if (isListening && isOpen) try { r.start(); } catch(e) {}
    };
    
    recRef.current = r;
  }, [isOpen, isListening, currentView, selectedItem]);

  // Start/stop on modal open/close
  useEffect(() => {
    if (isOpen) {
      setIsListening(true);
      setCurrentView('grid');
      setSelectedItem(null);
      setSelectedSubPage(null);
      try { recRef.current?.start(); } catch(e) {}
      setTimeout(() => {
        speak("Welcome to How It Works! I'll show you everything about VistaView. Click any icon or just tell me what you want to learn about!");
      }, 500);
    } else {
      setIsListening(false);
      try { recRef.current?.stop(); } catch(e) {}
      stop();
    }
  }, [isOpen]);

  // Voice command handler
  const handleVoiceCommand = useCallback((cmd: string) => {
    // Global commands
    if (cmd.includes('stop') || cmd.includes('pause') || cmd.includes('hey')) {
      stop();
      return;
    }
    
    if (cmd.includes('close') || cmd.includes('exit')) {
      stop();
      onClose();
      return;
    }
    
    if (cmd.includes('back') || cmd.includes('go back')) {
      goBack();
      return;
    }

    // Navigation commands
    if (currentView === 'grid') {
      const item = findItemByVoice(cmd);
      if (item) {
        walkToItem(item);
        return;
      }
    }
    
    if (currentView === 'item' && selectedItem) {
      // Check for subpage navigation
      for (const sp of selectedItem.subPages) {
        if (cmd.includes(sp.title.toLowerCase()) || cmd.includes(sp.id)) {
          walkToSubPage(sp);
          return;
        }
      }
    }

    // Read commands
    if (cmd.includes('read') || cmd.includes('tell me') || cmd.includes('explain')) {
      if (currentView === 'subpage' && selectedSubPage) {
        speak(selectedSubPage.content);
      } else if (currentView === 'item' && selectedItem) {
        speak(selectedItem.fullDescription);
      }
    }
  }, [currentView, selectedItem, selectedSubPage, onClose]);

  // Walking animation to item
  const walkToItem = (item: HowItWorksItem) => {
    setWalkingTo(item.id);
    speak(`Walking to ${item.title}...`);
    
    setTimeout(() => {
      setWalkingTo(null);
      setSelectedItem(item);
      setCurrentView('item');
      setTimeout(() => {
        speak(`${item.title}! ${item.summary}. Would you like me to explain more, or click on any topic below!`);
      }, 300);
    }, 1000);
  };

  // Walking animation to subpage
  const walkToSubPage = (subPage: SubPage) => {
    setWalkingTo(subPage.id);
    speak(`Opening ${subPage.title}...`);
    
    setTimeout(() => {
      setWalkingTo(null);
      setSelectedSubPage(subPage);
      setCurrentView('subpage');
      setTimeout(() => {
        speak(subPage.content);
      }, 300);
    }, 800);
  };

  // Go back one level
  const goBack = () => {
    stop();
    if (currentView === 'subpage') {
      setSelectedSubPage(null);
      setCurrentView('item');
      speak("Going back to the topics. What else would you like to explore?");
    } else if (currentView === 'item') {
      setSelectedItem(null);
      setCurrentView('grid');
      speak("Back to the main menu. Pick any icon or tell me what interests you!");
    }
  };

  // Speech functions
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

  const stop = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`,
        borderRadius: '24px', width: '100%', maxWidth: '1100px', maxHeight: '90vh',
        overflow: 'hidden', border: `2px solid ${THEME.gold}`,
        display: 'flex', flexDirection: 'column'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'rgba(0,0,0,0.3)', padding: '16px 24px',
          borderBottom: `1px solid ${THEME.gold}40`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {currentView !== 'grid' && (
              <button onClick={goBack} style={{
                background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`,
                color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                ← Back
              </button>
            )}
            <h2 style={{ color: THEME.gold, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚡</span> How It Works
              {selectedItem && <span style={{ color: '#fff', fontWeight: 400 }}> / {selectedItem.title}</span>}
              {selectedSubPage && <span style={{ color: THEME.goldLight, fontWeight: 400 }}> / {selectedSubPage.title}</span>}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: isListening ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: '20px', border: `1px solid ${isListening ? '#00ff00' : '#ffffff40'}`
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: isListening ? '#00ff00' : '#666',
                boxShadow: isListening ? '0 0 10px #00ff00' : 'none'
              }} />
              <span style={{ color: '#fff', fontSize: '0.85em' }}>{isListening ? 'Listening...' : 'Paused'}</span>
            </div>
            {isSpeaking && (
              <button onClick={stop} style={{
                background: '#ff4444', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '20px', cursor: 'pointer'
              }}>⏹ Stop</button>
            )}
            <button onClick={onClose} style={{
              background: 'transparent', color: '#fff', border: `1px solid ${THEME.gold}`,
              width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2em'
            }}>✕</button>
          </div>
        </div>

        {/* Teleprompter */}
        <div style={{
          background: `rgba(184,134,11,0.15)`, padding: '12px 24px',
          minHeight: '50px', display: 'flex', alignItems: 'center',
          borderBottom: `1px solid ${THEME.gold}20`
        }}>
          {walkingTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: THEME.goldLight }}>
              <span style={{ fontSize: '1.5em', animation: 'walk 0.5s infinite' }}>🚶</span>
              Walking to {walkingTo}...
            </div>
          )}
          {!walkingTo && (
            <div style={{ color: isSpeaking ? THEME.goldLight : '#888', fontStyle: 'italic' }}>
              {isSpeaking ? `🎙️ ${displayText.substring(0, 120)}...` : 
               transcript ? `💬 "${transcript}"` : 
               'Say any icon name, "back", or "close"'}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          
          {/* GRID VIEW - 10 Icons */}
          {currentView === 'grid' && (
            <div>
              <p style={{ color: THEME.goldLight, textAlign: 'center', marginBottom: '24px', fontSize: '1.1em' }}>
                Click any icon or say its name to explore!
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '20px'
              }}>
                {HOW_IT_WORKS_DATA.map(item => (
                  <button
                    key={item.id}
                    onClick={() => walkToItem(item)}
                    style={{
                      background: walkingTo === item.id 
                        ? `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)` 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${walkingTo === item.id ? THEME.gold : THEME.gold + '40'}`,
                      borderRadius: '16px',
                      padding: '20px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={e => {
                      if (walkingTo !== item.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (walkingTo !== item.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '2.5em' }}>{item.icon}</span>
                    <span style={{ 
                      color: walkingTo === item.id ? '#000' : '#fff', 
                      fontWeight: 500, 
                      fontSize: '0.9em',
                      textAlign: 'center'
                    }}>
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ITEM VIEW - Selected icon with subpages */}
          {currentView === 'item' && selectedItem && (
            <div>
              {/* Item Header */}
              <div style={{
                background: `linear-gradient(135deg, ${THEME.gold}20, transparent)`,
                borderRadius: '16px', padding: '24px', marginBottom: '24px',
                border: `1px solid ${THEME.gold}40`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '3em' }}>{selectedItem.icon}</span>
                  <div>
                    <h3 style={{ color: THEME.gold, margin: 0, fontSize: '1.5em' }}>{selectedItem.title}</h3>
                    <p style={{ color: THEME.goldLight, margin: '5px 0 0' }}>{selectedItem.summary}</p>
                  </div>
                </div>
                <p style={{ color: '#ddd', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {selectedItem.fullDescription}
                </p>
              </div>

              {/* Subpages Grid */}
              <h4 style={{ color: THEME.gold, marginBottom: '16px' }}>Explore Topics:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {selectedItem.subPages.map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => walkToSubPage(sp)}
                    style={{
                      background: walkingTo === sp.id 
                        ? `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)` 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${walkingTo === sp.id ? THEME.gold : THEME.gold + '30'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => {
                      if (walkingTo !== sp.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (walkingTo !== sp.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.8em', display: 'block', marginBottom: '8px' }}>{sp.icon}</span>
                    <span style={{ 
                      color: walkingTo === sp.id ? '#000' : '#fff', 
                      fontWeight: 500 
                    }}>
                      {sp.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SUBPAGE VIEW - Deep content */}
          {currentView === 'subpage' && selectedSubPage && selectedItem && (
            <div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px', padding: '30px',
                borderLeft: `4px solid ${THEME.gold}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '2.5em' }}>{selectedSubPage.icon}</span>
                  <div>
                    <h3 style={{ color: THEME.gold, margin: 0 }}>{selectedSubPage.title}</h3>
                    <p style={{ color: '#888', margin: '5px 0 0', fontSize: '0.9em' }}>
                      Part of: {selectedItem.title}
                    </p>
                  </div>
                </div>
                
                <p style={{ color: '#ddd', lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '1.05em' }}>
                  {selectedSubPage.content}
                </p>

                {selectedSubPage.highlights && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ color: THEME.gold, marginBottom: '12px' }}>Key Points:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {selectedSubPage.highlights.map((h, i) => (
                        <span key={i} style={{
                          background: `${THEME.gold}30`,
                          color: THEME.goldLight,
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.85em'
                        }}>
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Other subpages quick nav */}
              <div style={{ marginTop: '24px' }}>
                <p style={{ color: '#888', marginBottom: '12px' }}>Other topics in {selectedItem.title}:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedItem.subPages.filter(sp => sp.id !== selectedSubPage.id).map(sp => (
                    <button
                      key={sp.id}
                      onClick={() => walkToSubPage(sp)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${THEME.gold}30`,
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {sp.icon} {sp.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with quick actions */}
        <div style={{
          background: 'rgba(0,0,0,0.3)', padding: '12px 24px',
          borderTop: `1px solid ${THEME.gold}40`,
          display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap'
        }}>
          {currentView === 'grid' ? (
            <>
              <button onClick={() => walkToItem(HOW_IT_WORKS_DATA[0])} style={quickBtnStyle}>
                🌐 Overall Flow
              </button>
              <button onClick={() => walkToItem(HOW_IT_WORKS_DATA[1])} style={quickBtnStyle}>
                🤖 Mr. V Agent
              </button>
              <button onClick={() => walkToItem(HOW_IT_WORKS_DATA[9])} style={quickBtnStyle}>
                ⭐ Why VistaView
              </button>
            </>
          ) : (
            <>
              <button onClick={goBack} style={quickBtnStyle}>← Back</button>
              <button onClick={() => {
                if (currentView === 'subpage' && selectedSubPage) speak(selectedSubPage.content);
                else if (currentView === 'item' && selectedItem) speak(selectedItem.fullDescription);
              }} style={{...quickBtnStyle, background: `linear-gradient(135deg, ${THEME.gold}, #6d4c1d)`}}>
                🎙️ Read Aloud
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes walk {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

const quickBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  border: '1px solid #B8860B',
  padding: '10px 20px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '0.9em'
};

export default HowItWorksModal;
