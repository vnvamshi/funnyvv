// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - WHO ARE YOU MODAL
// The ONLY sign-in entry point - voice-first role selection
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import AgentBar from './common/AgentBar';
import { useVoice } from './common/useVoice';
import { useNavStack } from './common/useNavStack';
import VendorFlow from './vendor/VendorFlow';

interface WhoAreYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected?: (role: string) => void;
}

const ROLES = [
  { id: 'customer', title: 'Customer', icon: '👤', aliases: ['customer', 'user'], desc: 'Browse & shop' },
  { id: 'home_buyer', title: 'Home Buyer', icon: '🏠', aliases: ['home buyer', 'buyer'], desc: 'Find your home' },
  { id: 'investor', title: 'Investor', icon: '💰', aliases: ['investor'], desc: 'Invest in real estate' },
  { id: 'agent', title: 'Real Estate Agent', icon: '🏢', aliases: ['agent', 'realtor'], desc: 'Manage clients' },
  { id: 'builder', title: 'Builder', icon: '🏗️', aliases: ['builder', 'developer'], desc: 'Showcase projects' },
  { id: 'vendor', title: 'Vendor', icon: '📦', aliases: ['vendor', 'seller', 'supplier'], desc: 'Sell products' }
];

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const WhoAreYouModal: React.FC<WhoAreYouModalProps> = ({ isOpen, onClose, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  const navStack = useNavStack({ id: 'who-are-you', label: 'Who Are You?' });

  const handleCommand = useCallback((cmd: string) => {
    if (cmd.includes('stop') || cmd.includes('pause')) { voice.stop(); return; }
    if (cmd.includes('close') || cmd.includes('exit')) { voice.stop(); onClose(); return; }
    if (cmd.includes('back') || cmd.includes('go back')) {
      if (navStack.canGoBack) {
        navStack.pop();
        setSelectedRole(null);
        voice.speak("Back to role selection.");
      }
      return;
    }

    // Match role
    for (const role of ROLES) {
      if (role.aliases.some(a => cmd.includes(a))) {
        selectRole(role);
        return;
      }
    }
  }, [navStack, onClose]);

  const voice = useVoice({ onCommand: handleCommand, autoStart: isOpen });

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(null);
      navStack.reset({ id: 'who-are-you', label: 'Who Are You?' });
      setTimeout(() => voice.speak("Who are you? Are you a Customer, Home Buyer, Investor, Real Estate Agent, Builder, or Vendor?"), 300);
    }
  }, [isOpen]);

  const selectRole = (role: typeof ROLES[0]) => {
    setWalkingTo(role.id);
    voice.speak(`Got it! You're a ${role.title}. Setting up your experience...`);

    setTimeout(() => {
      setWalkingTo(null);
      setSelectedRole(role.id);
      navStack.push({ id: `role:${role.id}`, label: role.title });
    }, 1200);
  };

  if (!isOpen) return null;

  // Show Vendor Flow if vendor selected
  if (selectedRole === 'vendor') {
    return (
      <VendorFlow
        isOpen={true}
        onClose={onClose}
        onComplete={() => { onRoleSelected?.('vendor'); onClose(); }}
        onBack={() => { setSelectedRole(null); navStack.pop(); }}
      />
    );
  }

  // Show other role flows (simplified for now)
  if (selectedRole && selectedRole !== 'vendor') {
    // For non-vendor roles, just complete
    setTimeout(() => {
      onRoleSelected?.(selectedRole);
      onClose();
    }, 1000);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '20px', width: '100%', maxWidth: '650px', overflow: 'hidden', border: `2px solid ${THEME.gold}40` }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.gold}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2em' }}>👤 Who Are You?</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5em', cursor: 'pointer', opacity: 0.7 }}>✕</button>
        </div>

        {/* Agent Bar */}
        <AgentBar
          isListening={voice.isListening}
          isSpeaking={voice.isSpeaking}
          isPaused={voice.isPaused}
          transcript={voice.transcript}
          displayText={voice.displayText}
          onStop={voice.stop}
        />

        {/* Role Grid */}
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => selectRole(role)}
              style={{
                background: walkingTo === role.id ? THEME.gold : THEME.teal,
                border: `1px solid ${walkingTo === role.id ? THEME.gold : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s',
                transform: walkingTo === role.id ? 'scale(1.03)' : 'scale(1)'
              }}
            >
              <span style={{ fontSize: '2em' }}>{role.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: walkingTo === role.id ? '#000' : '#fff', fontWeight: 600 }}>{role.title}</div>
                <div style={{ color: walkingTo === role.id ? '#333' : '#888', fontSize: '0.8em' }}>{role.desc}</div>
              </div>
              {walkingTo === role.id && <span style={{ marginLeft: 'auto', fontSize: '1.2em' }}>🚶</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhoAreYouModal;
