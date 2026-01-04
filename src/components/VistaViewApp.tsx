// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW APP v11.0 - COMPLETE INTEGRATION
// 
// This component integrates ALL features:
// - SignIn with Buyer/Vendor flow
// - 4 Main page icons (Real Estate, Catalog, Interior, Services)
// - Voice teleprompter on all pages
// - Notification popups
//
// USAGE: Import and use <VistaViewApp /> in your main App.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';
import { SignInModal } from './signin';
import { ProductCatalogPage } from './catalog';
import { RealEstatePage, ServicesPage, InteriorDesignPage } from './pages';
import { NotificationPopup, VoiceTeleprompter } from './shared';

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B', teal: '#004236' };

interface Notification {
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
  stats?: { products?: number; images?: number };
}

const VistaViewApp: React.FC = () => {
  // Modal states
  const [showSignIn, setShowSignIn] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showRealEstate, setShowRealEstate] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showInterior, setShowInterior] = useState(false);
  
  // User state
  const [userRole, setUserRole] = useState<'buyer' | 'vendor' | null>(null);
  
  // Notifications
  const [notification, setNotification] = useState<Notification | null>(null);

  // Handle sign in complete
  const handleSignInComplete = useCallback((role: 'buyer' | 'vendor') => {
    setUserRole(role);
    if (role === 'vendor') {
      setNotification({
        type: 'success',
        title: 'Welcome, Vendor!',
        message: 'Your products are now live on VistaView.',
        stats: { products: 5 }
      });
    }
  }, []);

  // Voice commands for main page
  const handleVoiceCommand = useCallback((cmd: string) => {
    if (cmd.includes('sign in') || cmd.includes('login')) setShowSignIn(true);
    if (cmd.includes('catalog') || cmd.includes('products') || cmd.includes('shop')) setShowCatalog(true);
    if (cmd.includes('real estate') || cmd.includes('homes') || cmd.includes('property')) setShowRealEstate(true);
    if (cmd.includes('services') || cmd.includes('help')) setShowServices(true);
    if (cmd.includes('interior') || cmd.includes('design')) setShowInterior(true);
  }, []);

  // Main 4 icons data
  const mainIcons = [
    { id: 'realestate', icon: '🏠', title: 'Real Estate', desc: 'Find your dream home', onClick: () => setShowRealEstate(true) },
    { id: 'catalog', icon: '🛒', title: 'Product Catalog', desc: 'Shop curated products', onClick: () => setShowCatalog(true) },
    { id: 'interior', icon: '🎨', title: 'Interior Design', desc: 'AI-powered design', onClick: () => setShowInterior(true) },
    { id: 'services', icon: '🛠️', title: 'Services', desc: 'Professional help', onClick: () => setShowServices(true) },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`,
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${THEME.gold}30`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2em' }}>🏠</span>
          <h1 style={{ margin: 0, fontSize: '1.5em', color: THEME.gold }}>VistaView</h1>
        </div>
        <button
          onClick={() => setShowSignIn(true)}
          style={{
            padding: '12px 28px',
            background: THEME.gold,
            color: '#000',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {userRole ? `👤 ${userRole === 'vendor' ? 'Vendor' : 'Buyer'}` : '🔑 Sign In'}
        </button>
      </header>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 20px 60px' }}>
        <h2 style={{ fontSize: '2.5em', marginBottom: '16px' }}>
          Voice-First <span style={{ color: THEME.gold }}>AI Marketplace</span>
        </h2>
        <p style={{ color: '#aaa', fontSize: '1.2em', maxWidth: '600px', margin: '0 auto' }}>
          Discover products, explore real estate, and design your space with AI assistance.
        </p>
      </section>

      {/* Main 4 Icons */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 20px 80px'
      }}>
        {mainIcons.map(item => (
          <div
            key={item.id}
            onClick={item.onClick}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${THEME.gold}30`,
              borderRadius: '20px',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(184,134,11,0.1)';
              e.currentTarget.style.borderColor = THEME.gold;
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = `${THEME.gold}30`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '3.5em', display: 'block', marginBottom: '16px' }}>{item.icon}</span>
            <h3 style={{ margin: '0 0 8px', color: '#fff' }}>{item.title}</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '0.9em' }}>{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Voice Teleprompter - Always visible on home */}
      <VoiceTeleprompter
        context="home"
        onCommand={handleVoiceCommand}
        initialMessage="Welcome to VistaView! Say 'sign in', 'catalog', 'real estate', 'services', or 'interior design'."
      />

      {/* Modals */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignInComplete={handleSignInComplete}
        onViewProducts={() => setShowCatalog(true)}
      />

      {showCatalog && <ProductCatalogPage isOpen={true} onClose={() => setShowCatalog(false)} />}
      {showRealEstate && <RealEstatePage isOpen={true} onClose={() => setShowRealEstate(false)} />}
      {showServices && <ServicesPage isOpen={true} onClose={() => setShowServices(false)} />}
      {showInterior && <InteriorDesignPage isOpen={true} onClose={() => setShowInterior(false)} />}

      {/* Notification Popup */}
      <NotificationPopup
        notification={notification}
        onDismiss={() => setNotification(null)}
        onAction={() => setShowCatalog(true)}
        actionLabel="View Products"
      />
    </div>
  );
};

export default VistaViewApp;
