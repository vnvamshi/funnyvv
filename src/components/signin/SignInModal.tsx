// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - SIGNIN MODAL v11.0
// Main entry point - Role selection → Buyer or Vendor flow
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { VendorFlow } from './vendor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSignInComplete?: (role: 'buyer' | 'vendor') => void;
  onViewProducts?: () => void;
}

const THEME = { teal: '#004236', gold: '#B8860B', goldLight: '#F5EC9B' };

type View = 'role' | 'buyer' | 'vendor';

const SignInModal: React.FC<Props> = ({ isOpen, onClose, onSignInComplete, onViewProducts }) => {
  const [view, setView] = useState<View>('role');
  const [isListening, setIsListening] = useState(false);

  // Voice recognition for role selection
  useEffect(() => {
    if (!isOpen || view !== 'role') return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[e.results.length - 1][0]?.transcript?.toLowerCase() || '';
      console.log('[SignIn] Heard:', text);
      
      if (text.includes('vendor') || text.includes('seller') || text.includes('sell')) {
        rec.stop();
        setView('vendor');
      } else if (text.includes('buyer') || text.includes('buy') || text.includes('shop') || text.includes('customer')) {
        rec.stop();
        setView('buyer');
      } else if (text.includes('close') || text.includes('cancel')) {
        rec.stop();
        onClose();
      }
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    setTimeout(() => {
      try { rec.start(); } catch(e) {}
    }, 500);

    // Speak welcome
    setTimeout(() => {
      const synth = window.speechSynthesis;
      if (synth) {
        synth.cancel();
        const u = new SpeechSynthesisUtterance("Welcome to VistaView! Are you a Buyer or a Vendor? Say your role or click below.");
        u.rate = 1.0;
        synth.speak(u);
      }
    }, 800);

    return () => {
      try { rec.stop(); } catch(e) {}
    };
  }, [isOpen, view, onClose]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) setView('role');
  }, [isOpen]);

  const handleBuyerComplete = useCallback(() => {
    onSignInComplete?.('buyer');
    onClose();
  }, [onSignInComplete, onClose]);

  const handleVendorComplete = useCallback(() => {
    onSignInComplete?.('vendor');
    if (onViewProducts) {
      onViewProducts();
    }
    onClose();
  }, [onSignInComplete, onViewProducts, onClose]);

  if (!isOpen) return null;

  // Show VendorFlow
  if (view === 'vendor') {
    return (
      <VendorFlow
        isOpen={true}
        onClose={onClose}
        onComplete={handleVendorComplete}
        onBack={() => setView('role')}
      />
    );
  }

  // Show Buyer flow (simplified for now)
  if (view === 'buyer') {
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
          maxWidth: '500px',
          padding: '40px',
          textAlign: 'center',
          border: `2px solid ${THEME.gold}40`
        }}>
          <span style={{ fontSize: '4em' }}>🛒</span>
          <h2 style={{ color: '#fff', margin: '20px 0 12px' }}>Welcome, Buyer!</h2>
          <p style={{ color: '#aaa', marginBottom: '30px' }}>
            Browse our curated marketplace with AI-powered recommendations.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleBuyerComplete}
              style={{
                padding: '14px 32px',
                background: THEME.gold,
                color: '#000',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🛍️ Start Shopping
            </button>
            <button
              onClick={() => setView('role')}
              style={{
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: `1px solid ${THEME.gold}`,
                borderRadius: '25px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Role Selection Screen
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
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        padding: '40px',
        textAlign: 'center',
        border: `2px solid ${THEME.gold}40`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.2em'
          }}
        >✕</button>

        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${THEME.gold}, #D4A84B)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(184,134,11,0.3)'
        }}>
          <span style={{ fontSize: '2.5em' }}>🏠</span>
        </div>

        <h1 style={{ color: '#fff', margin: '0 0 8px', fontSize: '1.8em' }}>Welcome to VistaView</h1>
        <p style={{ color: THEME.goldLight, margin: '0 0 32px' }}>Voice-First AI Marketplace</p>

        {/* Voice status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '24px',
          padding: '12px 20px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '30px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isListening ? '#4CAF50' : '#888',
            boxShadow: isListening ? '0 0 10px #4CAF50' : 'none',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: isListening ? '#4CAF50' : '#888', fontSize: '0.9em' }}>
            {isListening ? '🎤 Listening... Say "Buyer" or "Vendor"' : 'Voice ready'}
          </span>
        </div>

        {/* Role buttons */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setView('buyer')}
            style={{
              padding: '24px 40px',
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${THEME.gold}60`,
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              minWidth: '180px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(184,134,11,0.15)';
              e.currentTarget.style.borderColor = THEME.gold;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = `${THEME.gold}60`;
            }}
          >
            <span style={{ fontSize: '2.5em', display: 'block', marginBottom: '8px' }}>🛒</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.1em' }}>I'm a Buyer</span>
            <p style={{ color: '#888', margin: '8px 0 0', fontSize: '0.8em' }}>Shop & Discover</p>
          </button>

          <button
            onClick={() => setView('vendor')}
            style={{
              padding: '24px 40px',
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${THEME.gold}60`,
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              minWidth: '180px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(184,134,11,0.15)';
              e.currentTarget.style.borderColor = THEME.gold;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = `${THEME.gold}60`;
            }}
          >
            <span style={{ fontSize: '2.5em', display: 'block', marginBottom: '8px' }}>📦</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.1em' }}>I'm a Vendor</span>
            <p style={{ color: '#888', margin: '8px 0 0', fontSize: '0.8em' }}>Sell Products</p>
          </button>
        </div>

        <p style={{ color: '#555', marginTop: '32px', fontSize: '0.85em' }}>
          💡 Tip: Just say "Buyer" or "Vendor" to get started!
        </p>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SignInModal;
