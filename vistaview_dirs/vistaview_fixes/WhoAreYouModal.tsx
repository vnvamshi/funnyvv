// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - WHO ARE YOU MODAL v4.0
// Voice-first role selection integrated with AgentBar
// ═══════════════════════════════════════════════════════════════════════════════
//
// ROLES: Customer, Home Buyer, Investor, Agent, Builder, Vendor
// Each role has a tailored onboarding experience
// Vendor/Builder go to continuous onboarding flow (no pop-ups)
//
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { useAgentBar } from './AgentBar';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface WhoAreYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected: (role: Role, needsOnboarding: boolean) => void;
}

type Role = 'customer' | 'home_buyer' | 'investor' | 'agent' | 'builder' | 'vendor';

interface RoleConfig {
  id: Role;
  title: string;
  icon: string;
  color: string;
  description: string;
  voiceAliases: string[];
  needsOnboarding: boolean;
  welcomeMessage: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const THEME = {
  teal: '#004236',
  tealLight: '#007E67',
  gold: '#B8860B',
  goldLight: '#F5EC9B',
  white: '#FFFFFF',
  dark: '#001a15'
};

const ROLES: RoleConfig[] = [
  {
    id: 'customer',
    title: 'Customer',
    icon: '👤',
    color: '#4A90D9',
    description: 'Browse properties, products & services',
    voiceAliases: ['customer', 'user', 'regular', 'browser', 'just browsing', 'looking around'],
    needsOnboarding: false,
    welcomeMessage: "Welcome, Customer! You can browse all our properties, products, and services. Let's find something amazing for you!"
  },
  {
    id: 'home_buyer',
    title: 'Home Buyer',
    icon: '🏠',
    color: '#E74C3C',
    description: 'Find your dream home',
    voiceAliases: ['home buyer', 'buyer', 'buying home', 'looking for home', 'house hunter', 'buying a house'],
    needsOnboarding: false,
    welcomeMessage: "Welcome, Home Buyer! I'll help you find your dream home. Tell me about your preferences!"
  },
  {
    id: 'investor',
    title: 'Investor',
    icon: '💰',
    color: '#27AE60',
    description: 'Discover investment opportunities',
    voiceAliases: ['investor', 'investing', 'investment', 'real estate investor', 'looking to invest'],
    needsOnboarding: false,
    welcomeMessage: "Welcome, Investor! Let me show you the best investment opportunities with detailed ROI analysis."
  },
  {
    id: 'agent',
    title: 'Real Estate Agent',
    icon: '🏢',
    color: '#9B59B6',
    description: 'Manage clients & listings',
    voiceAliases: ['agent', 'real estate agent', 'realtor', 'property agent', 'broker'],
    needsOnboarding: true,
    welcomeMessage: "Welcome, Agent! Let me set up your professional profile so you can manage clients and listings."
  },
  {
    id: 'builder',
    title: 'Builder',
    icon: '🏗️',
    color: '#3498DB',
    description: 'Showcase your projects',
    voiceAliases: ['builder', 'construction', 'developer', 'contractor', 'building company'],
    needsOnboarding: true,
    welcomeMessage: "Welcome, Builder! Let's set up your profile and showcase your amazing projects."
  },
  {
    id: 'vendor',
    title: 'Vendor',
    icon: '📦',
    color: '#F39C12',
    description: 'Sell products on VistaView',
    voiceAliases: ['vendor', 'seller', 'supplier', 'shop', 'store', 'merchant', 'sell products'],
    needsOnboarding: true,
    welcomeMessage: "Welcome, Vendor! Let's get your store set up so you can start selling on VistaView."
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const WhoAreYouModal: React.FC<WhoAreYouModalProps> = ({
  isOpen,
  onClose,
  onRoleSelected
}) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isWalkingTo, setIsWalkingTo] = useState<Role | null>(null);
  
  // Agent Bar integration
  const agentBar = useAgentBar();
  const { speak, stop, onVoiceCommand, setCurrentModal } = agentBar;

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen) {
      setCurrentModal('who-are-you');
      setSelectedRole(null);
      setIsWalkingTo(null);
      
      // Initial greeting
      setTimeout(() => {
        speak(
          "Who are you? I can help you better if I know your role. " +
          "Are you a Customer, Home Buyer, Investor, Real Estate Agent, Builder, or Vendor? " +
          "Just say your role or click on it!"
        );
      }, 300);
    } else {
      setCurrentModal(null);
    }
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE COMMAND HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    onVoiceCommand((cmd: string) => {
      const lower = cmd.toLowerCase();
      
      // Find matching role
      for (const role of ROLES) {
        for (const alias of role.voiceAliases) {
          if (lower.includes(alias)) {
            handleRoleSelection(role);
            return true;
          }
        }
      }
      
      // Help command
      if (lower.includes('help') || lower.includes('what are') || lower.includes('options')) {
        speak(
          "Your options are: Customer for browsing, Home Buyer to find a home, " +
          "Investor for investment opportunities, Agent to manage clients, " +
          "Builder to showcase projects, or Vendor to sell products."
        );
        return true;
      }
      
      return false; // Not handled
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // ROLE SELECTION
  // ═══════════════════════════════════════════════════════════════════════════
  const handleRoleSelection = useCallback((role: RoleConfig) => {
    stop();
    setIsWalkingTo(role.id);
    
    speak(`Got it! You're a ${role.title}. ${role.welcomeMessage}`, () => {
      setTimeout(() => {
        setSelectedRole(role.id);
        setIsWalkingTo(null);
        
        // Notify parent and handle next step
        onRoleSelected(role.id, role.needsOnboarding);
        
        // Close this modal (parent will open onboarding if needed)
        if (!role.needsOnboarding) {
          setTimeout(() => onClose(), 500);
        } else {
          // For roles needing onboarding, close immediately
          // Parent component will handle opening the onboarding modal
          onClose();
        }
      }, 800);
    });
  }, [speak, stop, onRoleSelected, onClose]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        paddingBottom: '80px' // Space for AgentBar
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.dark})`,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '700px',
          overflow: 'hidden',
          border: `2px solid ${THEME.gold}`
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '20px 24px',
            borderBottom: `1px solid ${THEME.gold}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8em' }}>👤</span>
            <h2 style={{ color: THEME.gold, margin: 0 }}>Who Are You?</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: THEME.white,
              border: `1px solid ${THEME.gold}`,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Role Grid */}
        <div style={{ padding: '24px' }}>
          <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
            Select your role to get a personalized experience
          </p>
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}
          >
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              const isWalking = isWalkingTo === role.id;
              
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelection(role)}
                  disabled={!!isWalkingTo && isWalkingTo !== role.id}
                  style={{
                    background: isWalking 
                      ? `linear-gradient(135deg, ${role.color}, ${role.color}88)` 
                      : isSelected 
                        ? `${role.color}30` 
                        : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isWalking || isSelected ? role.color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: isWalkingTo && !isWalking ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.3s ease',
                    transform: isWalking ? 'scale(1.03)' : 'scale(1)',
                    opacity: isWalkingTo && !isWalking ? 0.5 : 1
                  }}
                >
                  <span style={{ fontSize: '2.5em' }}>{role.icon}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div
                      style={{
                        color: THEME.white,
                        fontWeight: 600,
                        fontSize: '1.1em',
                        marginBottom: '4px'
                      }}
                    >
                      {role.title}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.85em' }}>
                      {role.description}
                    </div>
                    {role.needsOnboarding && (
                      <div
                        style={{
                          color: THEME.gold,
                          fontSize: '0.75em',
                          marginTop: '4px'
                        }}
                      >
                        → Requires setup
                      </div>
                    )}
                  </div>
                  {isWalking && (
                    <span
                      style={{
                        fontSize: '1.5em',
                        animation: 'walk 0.3s ease-in-out infinite alternate'
                      }}
                    >
                      🚶
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '12px 24px',
            borderTop: `1px solid ${THEME.gold}40`,
            textAlign: 'center'
          }}
        >
          <span style={{ color: '#666', fontSize: '0.85em' }}>
            💡 Say your role or click to select • "help" for options • "close" to exit
          </span>
        </div>
      </div>

      <style>{`
        @keyframes walk {
          0% { transform: translateY(0) rotate(-5deg); }
          100% { transform: translateY(-5px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default WhoAreYouModal;
