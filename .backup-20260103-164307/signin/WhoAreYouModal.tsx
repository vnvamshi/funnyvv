// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - WHO ARE YOU MODAL v2.0
// Voice-first role selection with walking cursor animation
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
  { id: 'customer', title: 'Customer', icon: '👤', color: '#4A90D9', aliases: ['customer', 'user', 'shopper'], desc: 'Browse & shop', needsOnboarding: false },
  { id: 'home_buyer', title: 'Home Buyer', icon: '🏠', color: '#E74C3C', aliases: ['home buyer', 'buyer', 'buying'], desc: 'Find your dream home', needsOnboarding: false },
  { id: 'investor', title: 'Investor', icon: '💰', color: '#27AE60', aliases: ['investor', 'invest', 'investment'], desc: 'Investment properties', needsOnboarding: false },
  { id: 'agent', title: 'Real Estate Agent', icon: '🏢', color: '#9B59B6', aliases: ['agent', 'realtor', 'real estate agent'], desc: 'Manage clients & listings', needsOnboarding: true },
  { id: 'builder', title: 'Builder', icon: '🏗️', color: '#3498DB', aliases: ['builder', 'developer', 'construction'], desc: 'Showcase projects', needsOnboarding: true },
  { id: 'vendor', title: 'Vendor', icon: '📦', color: '#F39C12', aliases: ['vendor', 'seller', 'supplier', 'sell'], desc: 'Sell products', needsOnboarding: true }
];

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const WhoAreYouModal: React.FC<WhoAreYouModalProps> = ({ isOpen, onClose, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  const [showVendorFlow, setShowVendorFlow] = useState(false);

  const navStack = useNavStack({ id: 'who-are-you', label: 'Who Are You?' });

  const handleCommand = useCallback((cmd: string) => {
    // Global commands
    if (cmd.includes('stop') || cmd.includes('quiet')) {
      voice.stop();
      return;
    }
    if (cmd.includes('close') || cmd.includes('exit') || cmd.includes('cancel')) {
      voice.stop();
      onClose();
      return;
    }
    if (cmd.includes('back') || cmd.includes('go back')) {
      if (selectedRole) {
        setSelectedRole(null);
        setShowVendorFlow(false);
        navStack.pop();
        voice.speak("Back to role selection. Who are you?");
      } else {
        onClose();
      }
      return;
    }
    if (cmd.includes('help') || cmd.includes('options') || cmd.includes('what can')) {
      voice.speak("You can be a Customer, Home Buyer, Investor, Real Estate Agent, Builder, or Vendor. Just say which one you are!");
      return;
    }

    // Match role by voice
    for (const role of ROLES) {
      if (role.aliases.some(a => cmd.includes(a))) {
        selectRole(role);
        return;
      }
    }
  }, [selectedRole, onClose]);

  const voice = useVoice({ onCommand: handleCommand, autoStart: isOpen });

  // Welcome message
  useEffect(() => {
    if (isOpen && !selectedRole) {
      navStack.reset({ id: 'who-are-you', label: 'Who Are You?' });
      setTimeout(() => {
        voice.speak("Who are you? Are you a Customer, Home Buyer, Investor, Real Estate Agent, Builder, or Vendor? Just tell me!");
      }, 400);
    }
  }, [isOpen]);

  // Cleanup
  useEffect(() => {
    if (!isOpen) {
      voice.stop();
      setSelectedRole(null);
      setShowVendorFlow(false);
    }
  }, [isOpen]);

  const selectRole = (role: typeof ROLES[0]) => {
    setWalkingTo(role.id);
    voice.speak(`Got it! You're a ${role.title}. ${role.needsOnboarding ? "Let's get you set up!" : "Setting up your experience..."}`);

    setTimeout(() => {
      setWalkingTo(null);
      setSelectedRole(role.id);
      navStack.push({ id: `role:${role.id}`, label: role.title });

      if (role.id === 'vendor') {
        setShowVendorFlow(true);
      } else if (!role.needsOnboarding) {
        // Complete immediately for non-onboarding roles
        setTimeout(() => {
          onRoleSelected?.(role.id);
          onClose();
        }, 1000);
      }
    }, 1200);
  };

  const handleVendorComplete = () => {
    onRoleSelected?.('vendor');
    onClose();
  };

  const handleVendorBack = () => {
    setSelectedRole(null);
    setShowVendorFlow(false);
    navStack.pop();
    voice.speak("Back to role selection. Who are you?");
  };

  if (!isOpen) return null;

  // Show Vendor Flow
  if (showVendorFlow) {
    return (
      <VendorFlow
        isOpen={true}
        onClose={onClose}
        onComplete={handleVendorComplete}
        onBack={handleVendorBack}
      />
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.92)', 
      zIndex: 10000, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '20px' 
    }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, 
        borderRadius: '20px', 
        width: '100%', 
        maxWidth: '700px', 
        overflow: 'hidden', 
        border: `2px solid ${THEME.gold}40`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', 
          background: 'rgba(0,0,0,0.3)',
          borderBottom: `1px solid ${THEME.gold}30`, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.6em' }}>👤</span>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.3em' }}>Who Are You?</h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: '#fff', 
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '1.2em', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Agent Bar */}
        <AgentBar
          isListening={voice.isListening}
          isSpeaking={voice.isSpeaking}
          isPaused={voice.isPaused}
          transcript={voice.transcript}
          displayText={voice.displayText}
          onStop={voice.stop}
          onPause={voice.pause}
          onResume={voice.resume}
          onClose={onClose}
          showModes={false}
          showNavButtons={false}
        />

        {/* Role Grid */}
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '14px' 
          }}>
            {ROLES.map(role => {
              const isWalking = walkingTo === role.id;
              const isSelected = selectedRole === role.id;
              
              return (
                <button
                  key={role.id}
                  onClick={() => !walkingTo && selectRole(role)}
                  disabled={!!walkingTo && walkingTo !== role.id}
                  style={{
                    background: isWalking || isSelected 
                      ? `linear-gradient(135deg, ${role.color}, ${role.color}cc)` 
                      : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isWalking || isSelected ? role.color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: walkingTo ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.3s',
                    transform: isWalking ? 'scale(1.03)' : 'scale(1)',
                    opacity: walkingTo && !isWalking ? 0.5 : 1
                  }}
                >
                  <span style={{ fontSize: '2.2em' }}>{role.icon}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ 
                      color: isWalking || isSelected ? '#fff' : '#fff', 
                      fontWeight: 600,
                      fontSize: '1.05em'
                    }}>
                      {role.title}
                    </div>
                    <div style={{ 
                      color: isWalking || isSelected ? 'rgba(255,255,255,0.8)' : '#888', 
                      fontSize: '0.85em',
                      marginTop: '2px'
                    }}>
                      {role.desc}
                    </div>
                  </div>
                  {isWalking && (
                    <span style={{ fontSize: '1.3em', animation: 'walk 0.5s infinite' }}>🚶</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <style>{`
          @keyframes walk {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default WhoAreYouModal;
