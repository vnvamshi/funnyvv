// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - WHO ARE YOU MODAL v4.0 (GLOBAL VOICE)
// Uses VoiceContext, smooth transitions, mic stays on
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AgentBar from './common/AgentBar';
import { useGlobalVoice, useVoiceCommands, extractDigits } from './common/VoiceContext';
import { useNavStack } from './common/useNavStack';
import VendorFlow from './vendor/VendorFlow';

interface WhoAreYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected?: (role: string) => void;
}

const ROLES = [
  { id: 'customer', title: 'Customer', icon: '👤', aliases: ['customer', 'user', 'shopper', 'browse'], desc: 'Browse & shop' },
  { id: 'home_buyer', title: 'Home Buyer', icon: '🏠', aliases: ['home buyer', 'buyer', 'buying', 'home'], desc: 'Find your dream home' },
  { id: 'investor', title: 'Investor', icon: '💰', aliases: ['investor', 'invest'], desc: 'Investment properties' },
  { id: 'agent', title: 'Real Estate Agent', icon: '🏢', aliases: ['agent', 'realtor'], desc: 'Manage listings' },
  { id: 'builder', title: 'Builder', icon: '🏗️', aliases: ['builder', 'developer'], desc: 'Showcase projects' },
  { id: 'vendor', title: 'Vendor', icon: '📦', aliases: ['vendor', 'seller', 'supplier', 'sell'], desc: 'Sell products' }
];

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

const WhoAreYouModal: React.FC<WhoAreYouModalProps> = ({ isOpen, onClose, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  const [showVendorFlow, setShowVendorFlow] = useState(false);
  const hasSpokenRef = useRef(false);

  const voice = useGlobalVoice();
  const navStack = useNavStack({ id: 'who-are-you', label: 'Who Are You?' });

  // Find role by text
  const findRole = useCallback((text: string) => {
    const lower = text.toLowerCase();
    return ROLES.find(r => r.aliases.some(a => lower.includes(a))) || null;
  }, []);

  // Select role
  const selectRole = useCallback((role: typeof ROLES[0]) => {
    if (walkingTo) return;
    setWalkingTo(role.id);
    voice.speak(`Got it! You're a ${role.title}.`);

    setTimeout(() => {
      setWalkingTo(null);
      setSelectedRole(role.id);
      if (role.id === 'vendor') {
        setShowVendorFlow(true);
      } else {
        setTimeout(() => { onRoleSelected?.(role.id); onClose(); }, 500);
      }
    }, 800);
  }, [walkingTo, voice, onRoleSelected, onClose]);

  // Command handler for this modal
  const handleCommand = useCallback((cmd: string): boolean => {
    if (!isOpen || showVendorFlow) return false;

    // Close
    if (cmd.includes('close') || cmd.includes('exit') || cmd.includes('cancel')) {
      voice.stop();
      onClose();
      return true;
    }

    // Back
    if (cmd.includes('back') || cmd.includes('go back')) {
      if (selectedRole) {
        setSelectedRole(null);
        setShowVendorFlow(false);
        voice.speak("Back to selection.");
      } else {
        onClose();
      }
      return true;
    }

    // Help
    if (cmd.includes('help') || cmd.includes('options')) {
      voice.speak("Choose: Customer, Home Buyer, Investor, Agent, Builder, or Vendor.");
      return true;
    }

    // Match role
    const role = findRole(cmd);
    if (role && !walkingTo) {
      selectRole(role);
      return true;
    }

    return false;
  }, [isOpen, showVendorFlow, selectedRole, walkingTo, findRole, selectRole, voice, onClose]);

  // Register commands when modal is open
  useVoiceCommands('who-are-you', handleCommand, [isOpen, showVendorFlow, selectedRole, walkingTo]);

  // Welcome message
  useEffect(() => {
    if (isOpen && !selectedRole && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      setTimeout(() => {
        voice.speak("Who are you? Customer, Home Buyer, Investor, Agent, Builder, or Vendor?");
      }, 300);
    }
  }, [isOpen, selectedRole, voice]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedRole(null);
      setShowVendorFlow(false);
      setWalkingTo(null);
      hasSpokenRef.current = false;
    }
  }, [isOpen]);

  // Text submit
  const handleTextSubmit = useCallback((text: string) => {
    const role = findRole(text);
    if (role && !walkingTo) selectRole(role);
    else handleCommand(text.toLowerCase());
  }, [findRole, walkingTo, selectRole, handleCommand]);

  if (!isOpen) return null;

  if (showVendorFlow) {
    return (
      <VendorFlow
        isOpen={true}
        onClose={onClose}
        onComplete={() => { onRoleSelected?.('vendor'); onClose(); }}
        onBack={() => { setSelectedRole(null); setShowVendorFlow(false); voice.speak("Back."); }}
      />
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, borderRadius: '18px', width: '100%', maxWidth: '650px', maxHeight: '85vh', overflow: 'hidden', border: `2px solid ${THEME.gold}40`, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.gold}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4em' }}>👤</span>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Who Are You?</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1em', cursor: 'pointer' }}>✕</button>
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
          onTextSubmit={handleTextSubmit}
          showModes={false}
          showNavButtons={false}
          showTextInput={true}
          placeholder="Type: vendor, customer, etc..."
        />

        {/* Roles */}
        <div style={{ padding: '16px', overflow: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {ROLES.map(role => {
              const isWalking = walkingTo === role.id;
              return (
                <button key={role.id} onClick={() => !walkingTo && selectRole(role)} disabled={!!walkingTo && !isWalking}
                  style={{ background: isWalking ? `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldLight})` : 'rgba(255,255,255,0.05)', border: `2px solid ${isWalking ? THEME.gold : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '14px', cursor: walkingTo ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px', opacity: walkingTo && !isWalking ? 0.5 : 1, transform: isWalking ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '1.8em' }}>{role.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: isWalking ? '#000' : '#fff', fontWeight: 600, fontSize: '0.95em' }}>{role.title}</div>
                    <div style={{ color: isWalking ? '#333' : '#777', fontSize: '0.75em' }}>{role.desc}</div>
                  </div>
                  {isWalking && <span style={{ marginLeft: 'auto', animation: 'walk 0.3s infinite alternate' }}>🚶</span>}
                </button>
              );
            })}
          </div>
        </div>

        <style>{`@keyframes walk { 0% { transform: translateX(0); } 100% { transform: translateX(4px); } }`}</style>
      </div>
    </div>
  );
};

export default WhoAreYouModal;
