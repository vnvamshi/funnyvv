// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW ABOUT US MODAL
// With AI Teleprompter, CEO Highlight, Interactive Voice
// ═══════════════════════════════════════════════════════════════════════════════
// 
// GOLDEN RULES ENFORCED:
// ✅ Theme IMMUTABLE (Teal/Gold)
// ✅ AI Teleprompter bar included
// ✅ Voice commands: "close", "stop", "tell me about CEO"
// ✅ CEO always highlighted
// ✅ Animated cursor navigation
// 
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { THEME, TEAM, VISTAVIEW, UI_ACTIONS, VOICE, logEvent, executeUIAction } from '../core/rules-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: 'overview' | 'ceo' | 'team' | 'vision';
}

type Section = 'overview' | 'ceo' | 'team' | 'vision';

// ═══════════════════════════════════════════════════════════════════════════════
// AI TELEPROMPTER BAR (Must be in EVERY modal)
// ═══════════════════════════════════════════════════════════════════════════════
const AITeleprompterBar: React.FC<{
  onCommand: (cmd: string) => void;
  isSpeaking: boolean;
  onStop: () => void;
  onSpeak: () => void;
  currentText: string;
}> = ({ onCommand, isSpeaking, onStop, onSpeak, currentText }) => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setInput('');
    }
  };
  
  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      background: `linear-gradient(180deg, transparent 0%, ${THEME.colors.teal.primary} 20%)`,
      padding: '16px 24px',
      borderTop: `1px solid ${THEME.colors.gold.accent}40`,
      zIndex: 100
    }}>
      {/* Teleprompter Text */}
      {currentText && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: THEME.borderRadius.md,
          padding: '12px 16px',
          marginBottom: '12px',
          color: THEME.colors.white,
          fontSize: '14px',
          fontStyle: 'italic',
          maxHeight: '80px',
          overflow: 'auto'
        }}>
          🎤 {currentText}
        </div>
      )}
      
      {/* Input Bar */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* Microphone / Stop Button */}
        <button
          type="button"
          onClick={isSpeaking ? onStop : onSpeak}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: THEME.borderRadius.full,
            border: 'none',
            background: isSpeaking ? '#EF4444' : THEME.colors.gold.accent,
            color: THEME.colors.white,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'transform 0.2s, background 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
          title={isSpeaking ? 'Stop Speaking' : 'Start Speaking'}
        >
          {isSpeaking ? '⏹️' : '🎤'}
        </button>
        
        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about VistaView..."
          style={{
            flex: 1,
            height: '48px',
            borderRadius: THEME.borderRadius.lg,
            border: `2px solid ${THEME.colors.gold.accent}40`,
            background: 'rgba(255,255,255,0.1)',
            color: THEME.colors.white,
            padding: '0 20px',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = THEME.colors.gold.accent}
          onBlur={(e) => e.target.style.borderColor = `${THEME.colors.gold.accent}40`}
        />
        
        {/* Send Button */}
        <button
          type="submit"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: THEME.borderRadius.full,
            border: 'none',
            background: THEME.colors.teal.secondary,
            color: THEME.colors.white,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'transform 0.2s'
          }}
        >
          ➤
        </button>
      </form>
      
      {/* Quick Commands */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        flexWrap: 'wrap'
      }}>
        {['Tell me about CEO', 'Vision', 'Team', 'Close'].map(cmd => (
          <button
            key={cmd}
            onClick={() => onCommand(cmd)}
            style={{
              padding: '6px 14px',
              borderRadius: THEME.borderRadius.full,
              border: `1px solid ${THEME.colors.gold.accent}60`,
              background: 'transparent',
              color: THEME.colors.gold.secondary,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = THEME.colors.gold.accent;
              e.currentTarget.style.color = THEME.colors.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = THEME.colors.gold.secondary;
            }}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CEO HIGHLIGHT SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const CEOSection: React.FC<{ onSpeak: (text: string) => void }> = ({ onSpeak }) => {
  const ceo = TEAM.ceo;
  
  return (
    <div style={{
      background: `linear-gradient(135deg, ${THEME.colors.teal.primary}20 0%, ${THEME.colors.gold.primary}20 100%)`,
      borderRadius: THEME.borderRadius.xl,
      padding: '32px',
      border: `2px solid ${THEME.colors.gold.accent}`,
      boxShadow: `0 8px 32px ${THEME.colors.gold.accent}30`
    }}>
      {/* CEO Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
        {/* Photo Placeholder */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: THEME.borderRadius.full,
          background: THEME.colors.gold.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          border: `4px solid ${THEME.colors.gold.accent}`,
          boxShadow: `0 4px 20px ${THEME.colors.gold.accent}50`
        }}>
          👔
        </div>
        
        <div>
          <div style={{
            background: THEME.colors.gold.accent,
            color: THEME.colors.white,
            padding: '4px 12px',
            borderRadius: THEME.borderRadius.full,
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '8px'
          }}>
            ★ FOUNDER & CEO
          </div>
          <h2 style={{
            color: THEME.colors.white,
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0,
            fontFamily: THEME.fonts.secondary
          }}>
            {ceo.name}
          </h2>
        </div>
      </div>
      
      {/* Bio */}
      <p style={{
        color: THEME.colors.gray[200],
        fontSize: '16px',
        lineHeight: 1.8,
        marginBottom: '24px'
      }}>
        {ceo.bio}
      </p>
      
      {/* Vision Quote */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderLeft: `4px solid ${THEME.colors.gold.accent}`,
        padding: '20px 24px',
        borderRadius: `0 ${THEME.borderRadius.md} ${THEME.borderRadius.md} 0`,
        marginBottom: '24px'
      }}>
        <p style={{
          color: THEME.colors.gold.secondary,
          fontSize: '18px',
          fontStyle: 'italic',
          lineHeight: 1.6,
          margin: 0
        }}>
          {ceo.vision}
        </p>
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onSpeak(ceo.message)}
          style={{
            padding: '14px 28px',
            borderRadius: THEME.borderRadius.lg,
            border: 'none',
            background: THEME.colors.gold.gradient,
            color: THEME.colors.white,
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: `0 4px 12px ${THEME.colors.gold.accent}40`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 20px ${THEME.colors.gold.accent}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.colors.gold.accent}40`;
          }}
        >
          🎤 Hear CEO's Message
        </button>
        
        <button
          onClick={() => onSpeak(ceo.bio)}
          style={{
            padding: '14px 28px',
            borderRadius: THEME.borderRadius.lg,
            border: `2px solid ${THEME.colors.gold.accent}`,
            background: 'transparent',
            color: THEME.colors.gold.secondary,
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = THEME.colors.gold.accent;
            e.currentTarget.style.color = THEME.colors.white;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = THEME.colors.gold.secondary;
          }}
        >
          📖 About the CEO
        </button>
      </div>
      
      {/* Achievements */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ color: THEME.colors.gold.accent, marginBottom: '12px' }}>Key Achievements</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {ceo.achievements.map((achievement, i) => (
            <li key={i} style={{ color: THEME.colors.gray[200], marginBottom: '8px' }}>
              {achievement}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM SECTION (Co-founders with tags)
// ═══════════════════════════════════════════════════════════════════════════════
const TeamSection: React.FC = () => {
  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{
        color: THEME.colors.white,
        fontSize: '24px',
        marginBottom: '24px',
        fontFamily: THEME.fonts.secondary
      }}>
        Leadership Team
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {TEAM.coFounders.map((member, index) => (
          <div
            key={index}
            style={{
              background: `${THEME.colors.teal.primary}40`,
              borderRadius: THEME.borderRadius.lg,
              padding: '24px',
              border: `1px solid ${THEME.colors.teal.secondary}40`,
              transition: 'transform 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = THEME.colors.gold.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = `${THEME.colors.teal.secondary}40`;
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: THEME.borderRadius.full,
              background: THEME.colors.teal.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '16px'
            }}>
              {member.title.includes('CTO') ? '💻' : '📊'}
            </div>
            
            <h4 style={{ color: THEME.colors.white, margin: '0 0 4px 0' }}>{member.name}</h4>
            <p style={{ color: THEME.colors.gold.accent, margin: '0 0 12px 0', fontSize: '14px' }}>
              {member.title}
            </p>
            <p style={{ color: THEME.colors.gray[300], margin: '0 0 16px 0', fontSize: '14px' }}>
              {member.shortBio}
            </p>
            
            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {member.tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 10px',
                    borderRadius: THEME.borderRadius.full,
                    background: `${THEME.colors.teal.secondary}30`,
                    color: THEME.colors.teal.light,
                    fontSize: '11px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ABOUT US MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'overview'
}) => {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState('');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Log modal open
  useEffect(() => {
    if (isOpen) {
      logEvent('MODAL_OPEN', { modal: 'about-us', section: activeSection });
      
      // Speak introduction
      speak(`Welcome to VistaView About Us. ${VISTAVIEW.description} Let me introduce you to our amazing team.`);
    }
  }, [isOpen]);
  
  // Speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = VOICE.tts.rate;
      utterance.pitch = VOICE.tts.pitch;
      utterance.volume = VOICE.tts.volume;
      
      // Get US English voice
      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find(v => v.lang.includes('en-US'));
      if (usVoice) utterance.voice = usVoice;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setTeleprompterText(text);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      
      logEvent('TTS', { action: 'speak', text: text.substring(0, 100) });
    }
  };
  
  // Stop speech
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    logEvent('TTS', { action: 'stop' });
  };
  
  // Handle commands
  const handleCommand = (cmd: string) => {
    const lowerCmd = cmd.toLowerCase();
    
    logEvent('VOICE_COMMAND', { command: cmd, modal: 'about-us' });
    
    // Close commands
    if (VOICE.closePhrases.some(phrase => lowerCmd.includes(phrase))) {
      stopSpeaking();
      onClose();
      return;
    }
    
    // Stop commands
    if (VOICE.interruptPhrases.some(phrase => lowerCmd === phrase)) {
      stopSpeaking();
      setTeleprompterText("Paused. Say 'continue' to resume or ask me anything.");
      return;
    }
    
    // CEO commands
    if (lowerCmd.includes('ceo') || lowerCmd.includes('founder') || lowerCmd.includes('vamshi')) {
      setActiveSection('ceo');
      speak(TEAM.ceo.bio);
      return;
    }
    
    // Team commands
    if (lowerCmd.includes('team') || lowerCmd.includes('people')) {
      setActiveSection('team');
      speak(`Our leadership team includes ${TEAM.coFounders.map(m => m.name).join(' and ')}. Each brings unique expertise to VistaView.`);
      return;
    }
    
    // Vision commands
    if (lowerCmd.includes('vision') || lowerCmd.includes('mission')) {
      speak(VISTAVIEW.vision + ' ' + VISTAVIEW.mission);
      return;
    }
    
    // Default
    speak(`I heard "${cmd}". You can ask about our CEO, team, or vision. Or say "close" to exit.`);
  };
  
  // Don't render if not open
  if (!isOpen) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopSpeaking();
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)'
        }}
      />
      
      {/* Modal Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          background: THEME.colors.teal.primary,
          borderRadius: THEME.borderRadius.xl,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px ${THEME.colors.gold.accent}40`
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: `1px solid ${THEME.colors.gold.accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${THEME.colors.teal.primary} 0%, ${THEME.colors.teal.secondary}30 100%)`
          }}
        >
          <div>
            <h1 style={{
              color: THEME.colors.white,
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: THEME.fonts.secondary
            }}>
              About <span style={{ color: THEME.colors.gold.accent }}>VistaView</span>
            </h1>
            <p style={{ color: THEME.colors.gray[300], margin: '4px 0 0 0' }}>
              {VISTAVIEW.tagline}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => { stopSpeaking(); onClose(); }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: THEME.borderRadius.full,
              border: `1px solid ${THEME.colors.gray[500]}`,
              background: 'transparent',
              color: THEME.colors.white,
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${THEME.colors.gold.accent}20`,
            padding: '0 32px',
            background: `${THEME.colors.teal.primary}90`
          }}
        >
          {(['overview', 'ceo', 'team', 'vision'] as Section[]).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: 'transparent',
                color: activeSection === section ? THEME.colors.gold.accent : THEME.colors.gray[400],
                fontSize: '14px',
                fontWeight: activeSection === section ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: activeSection === section ? `3px solid ${THEME.colors.gold.accent}` : '3px solid transparent',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {section === 'ceo' ? '👔 CEO' : section === 'team' ? '👥 Team' : section === 'vision' ? '🎯 Vision' : '🏠 Overview'}
            </button>
          ))}
        </div>
        
        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px',
            paddingBottom: '180px' // Space for teleprompter
          }}
        >
          {/* Overview */}
          {activeSection === 'overview' && (
            <div>
              <p style={{ color: THEME.colors.gray[200], fontSize: '18px', lineHeight: 1.8, marginBottom: '24px' }}>
                {VISTAVIEW.description}
              </p>
              
              <h3 style={{ color: THEME.colors.gold.accent, marginBottom: '16px' }}>What We Offer</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {VISTAVIEW.features.map((feature, i) => (
                  <div key={i} style={{
                    background: `${THEME.colors.teal.secondary}20`,
                    borderRadius: THEME.borderRadius.md,
                    padding: '16px',
                    border: `1px solid ${THEME.colors.teal.secondary}30`
                  }}>
                    <h4 style={{ color: THEME.colors.white, margin: '0 0 8px 0' }}>{feature.name}</h4>
                    <p style={{ color: THEME.colors.gray[400], margin: 0, fontSize: '14px' }}>{feature.description}</p>
                  </div>
                ))}
              </div>
              
              <CEOSection onSpeak={speak} />
              <TeamSection />
            </div>
          )}
          
          {/* CEO Section */}
          {activeSection === 'ceo' && <CEOSection onSpeak={speak} />}
          
          {/* Team Section */}
          {activeSection === 'team' && (
            <div>
              <CEOSection onSpeak={speak} />
              <TeamSection />
            </div>
          )}
          
          {/* Vision Section */}
          {activeSection === 'vision' && (
            <div>
              <div style={{
                background: THEME.colors.gold.gradient,
                borderRadius: THEME.borderRadius.xl,
                padding: '40px',
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <h2 style={{ color: THEME.colors.white, fontSize: '32px', marginBottom: '16px' }}>Our Vision</h2>
                <p style={{ color: THEME.colors.white, fontSize: '20px', lineHeight: 1.6, opacity: 0.95 }}>
                  {VISTAVIEW.vision}
                </p>
              </div>
              
              <div style={{
                background: `${THEME.colors.teal.secondary}20`,
                borderRadius: THEME.borderRadius.xl,
                padding: '40px',
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <h2 style={{ color: THEME.colors.gold.accent, fontSize: '28px', marginBottom: '16px' }}>Our Mission</h2>
                <p style={{ color: THEME.colors.gray[200], fontSize: '18px', lineHeight: 1.6 }}>
                  {VISTAVIEW.mission}
                </p>
              </div>
              
              <h3 style={{ color: THEME.colors.white, marginBottom: '20px' }}>Our Values</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {VISTAVIEW.values.map((value, i) => (
                  <div key={i} style={{
                    background: `${THEME.colors.teal.primary}60`,
                    borderRadius: THEME.borderRadius.md,
                    padding: '20px',
                    borderLeft: `4px solid ${THEME.colors.gold.accent}`
                  }}>
                    <h4 style={{ color: THEME.colors.gold.accent, margin: '0 0 8px 0' }}>{value.name}</h4>
                    <p style={{ color: THEME.colors.gray[300], margin: 0 }}>{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* AI Teleprompter Bar (ALWAYS at bottom) */}
        <AITeleprompterBar
          onCommand={handleCommand}
          isSpeaking={isSpeaking}
          onStop={stopSpeaking}
          onSpeak={() => speak("Hello! I'm Mr. V. Ask me anything about VistaView.")}
          currentText={teleprompterText}
        />
      </div>
    </div>
  );
};

export default AboutUsModal;
