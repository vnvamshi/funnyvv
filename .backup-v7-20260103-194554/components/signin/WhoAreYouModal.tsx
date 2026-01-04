// ═══════════════════════════════════════════════════════════════════════════════
// WhoAreYouModal v5.0 - Voice-First Role Selection
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback } from 'react';
import AgentBar from './common/AgentBar';
import useVoice from './common/useVoice';
import useNavStack from './common/useNavStack';
import VendorFlow from './vendor/VendorFlow';

type Role = 'customer' | 'buyer' | 'investor' | 'agent' | 'builder' | 'vendor';

interface WhoAreYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected?: (role: string) => void;
}

const THEME = { teal: '#004D40', gold: '#B8860B' };

const ROLES: { role: Role; icon: string; label: string; desc: string }[] = [
  { role: 'customer', icon: '👤', label: 'Customer', desc: 'Browse & shop' },
  { role: 'buyer', icon: '🏠', label: 'Home Buyer', desc: 'Find your home' },
  { role: 'investor', icon: '💰', label: 'Investor', desc: 'Invest in real estate' },
  { role: 'agent', icon: '🏢', label: 'Real Estate Agent', desc: 'Manage clients' },
  { role: 'builder', icon: '🏗️', label: 'Builder', desc: 'Showcase projects' },
  { role: 'vendor', icon: '📦', label: 'Vendor', desc: 'Sell products' },
];

const WhoAreYouModal: React.FC<WhoAreYouModalProps> = ({ isOpen, onClose, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const navStack = useNavStack({ id: 'who-are-you', label: 'Who Are You?' });

  // Voice command handler - recognizes role names
  const handleCommand = useCallback((cmd: string) => {
    const c = cmd.toLowerCase();
    
    // Stop/close commands
    if (c.includes('stop') || c.includes('close') || c.includes('exit') || c.includes('cancel')) {
      voice.stop();
      onClose();
      return;
    }
    
    // Role detection - check for role keywords
    if (c.includes('customer') || c.includes('browse') || c.includes('shop')) {
      selectRole('customer');
    } else if (c.includes('home buyer') || c.includes('buyer') || c.includes('buy home') || c.includes('find home')) {
      selectRole('buyer');
    } else if (c.includes('investor') || c.includes('invest')) {
      selectRole('investor');
    } else if (c.includes('agent') || c.includes('real estate agent') || c.includes('realtor')) {
      selectRole('agent');
    } else if (c.includes('builder') || c.includes('construction') || c.includes('build')) {
      selectRole('builder');
    } else if (c.includes('vendor') || c.includes('sell') || c.includes('supplier') || c.includes('i am a vendor') || c.includes('i\'m a vendor')) {
      selectRole('vendor');
    }
  }, []);

  const voice = useVoice({ onCommand: handleCommand, autoStart: isOpen });

  const selectRole = (role: Role) => {
    setSelectedRole(role);
    navStack.push({ id: `role:${role}`, label: role });
    voice.speak(`Great! You selected ${role}. Let's get you set up.`);
  };

  // Initial greeting
  useEffect(() => {
    if (isOpen && !selectedRole) {
      setTimeout(() => {
        voice.speak("Who are you? Are you a Customer, Home Buyer, Investor, Real Estate Agent, Builder, or Vendor?");
      }, 300);
    }
  }, [isOpen, selectedRole]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedRole(null);
    }
  }, [isOpen]);

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

  // Show completion for non-vendor roles
  if (selectedRole && selectedRole !== 'vendor') {
    setTimeout(() => {
      onRoleSelected?.(selectedRole);
      onClose();
    }, 2000);
    
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '20px', padding: '40px', textAlign: 'center', border: `2px solid ${THEME.gold}40` }}>
          <div style={{ fontSize: '4em', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#fff', margin: 0 }}>Welcome, {selectedRole}!</h2>
          <p style={{ color: '#888', marginTop: '10px' }}>Setting up your experience...</p>
        </div>
      </div>
    );
  }

  // Main role selection UI
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '20px', width: '100%', maxWidth: '600px', overflow: 'hidden', border: `2px solid ${THEME.gold}40` }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.gold}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2em' }}>👤 Who Are You?</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5em', cursor: 'pointer', opacity: 0.7 }}>✕</button>
        </div>

        {/* Agent Bar - Voice Interface */}
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
          {ROLES.map(({ role, icon, label, desc }) => (
            <button
              key={role}
              onClick={() => selectRole(role)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid ${THEME.gold}40`,
                borderRadius: '12px',
                padding: '20px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = THEME.gold; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = `${THEME.gold}40`; }}
            >
              <span style={{ fontSize: '2em' }}>{icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#fff', fontWeight: 600 }}>{label}</div>
                <div style={{ color: '#888', fontSize: '0.85em' }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhoAreYouModal;
