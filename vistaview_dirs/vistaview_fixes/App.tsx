// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - APP.TSX v4.0
// Integrated AgentBar Provider with modal management
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import Routes from './routes';
import useMediaQuery from '@mui/material/useMediaQuery';
import DesktopLayout from './layouts/DesktopLayout';
import MobileLayout from './layouts/MobileLayout';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n';
import { AuthProvider } from './contexts/AuthContext';
import { useToast } from './hooks/useToast';
import { setGlobalToast } from './utils/toast';
import { Provider } from 'react-redux';
import store from './store/index';
import { FloatingAskBarProvider } from './contexts/FloatingAskBarContext';
import { ChatbotProvider, useChatbot } from './contexts/ChatbotContext';
import { CartProvider } from './contexts/CartContext';
import { AIModeProvider } from './contexts/AIModeContext';
import FloatingAskBar from './components/FloatingAskBar';
import ChatbotModal from './components/ChatbotModal';

// NEW: Import AgentBar components
import { AgentBarProvider, AgentBar } from './components/AgentBar';
import WhoAreYouModal from './components/WhoAreYouModal';
import VendorOnboardingModal from './components/VendorOnboardingModal';
import BuilderOnboardingModal from './components/BuilderOnboardingModal';

export const ToastContext = React.createContext<{ showToast: (msg: string, duration?: number) => void }>({ showToast: () => {} });

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL MANAGER - Central control for all modals
// ═══════════════════════════════════════════════════════════════════════════════
type ModalType = 
  | 'who-are-you' 
  | 'vendor-onboarding' 
  | 'builder-onboarding' 
  | 'agent-onboarding'
  | 'sign-in'
  | 'about-us'
  | 'how-it-works'
  | 'partners'
  | 'lend-with-us'
  | null;

interface ModalState {
  type: ModalType;
  data?: any;
}

function useModalManager() {
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const openModal = useCallback((type: ModalType, data?: any) => {
    setModalState({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: null });
    setPendingRole(null);
  }, []);

  const handleRoleSelected = useCallback((role: string, needsOnboarding: boolean) => {
    if (needsOnboarding) {
      setPendingRole(role);
      // Close WhoAreYou and open appropriate onboarding
      if (role === 'vendor') {
        setModalState({ type: 'vendor-onboarding' });
      } else if (role === 'builder') {
        setModalState({ type: 'builder-onboarding' });
      } else if (role === 'agent') {
        setModalState({ type: 'agent-onboarding' });
      }
    } else {
      // Just close and proceed
      closeModal();
      // TODO: Store role in AuthContext
      console.log(`Role selected: ${role}`);
    }
  }, [closeModal]);

  const handleOnboardingComplete = useCallback((data: any) => {
    console.log('Onboarding complete:', { role: pendingRole, data });
    closeModal();
    // TODO: Store vendor/builder data and update AuthContext
  }, [pendingRole, closeModal]);

  return {
    modalState,
    openModal,
    closeModal,
    handleRoleSelected,
    handleOnboardingComplete
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP CONTENT WITH MODAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
function AppContent() {
  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    modalState,
    openModal,
    closeModal,
    handleRoleSelected,
    handleOnboardingComplete
  } = useModalManager();

  const isNoLayoutPage = location.pathname === '/' || 
                        location.pathname === '/landing' ||
                        location.pathname === '/services' ||
                        location.pathname === '/location-select' ||
                        location.pathname === '/location-select/info' ||
                        location.pathname === '/skyven-data' ||
                        location.pathname.startsWith('/v3');

  // Handle navigation from AgentBar
  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Handle modal opening from AgentBar voice commands
  const handleOpenModal = useCallback((name: string, data?: any) => {
    openModal(name as ModalType, data);
  }, [openModal]);

  return (
    <AgentBarProvider
      onNavigate={handleNavigate}
      onOpenModal={handleOpenModal}
      onCloseModal={closeModal}
    >
      <ScrollToTop />
      
      {/* Main Content */}
      {isNoLayoutPage ? (
        <Routes />
      ) : (
        isMobile ? <MobileLayout /> : <DesktopLayout />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS - All modals rendered here, controlled by modalState
          No pop-up chains - each modal is independent
          ═══════════════════════════════════════════════════════════════════════ */}
      
      {/* Who Are You Modal */}
      <WhoAreYouModal
        isOpen={modalState.type === 'who-are-you'}
        onClose={closeModal}
        onRoleSelected={handleRoleSelected}
      />

      {/* Vendor Onboarding - Single continuous flow */}
      <VendorOnboardingModal
        isOpen={modalState.type === 'vendor-onboarding'}
        onClose={closeModal}
        onComplete={handleOnboardingComplete}
      />

      {/* Builder Onboarding - Single continuous flow */}
      {/* Note: Create BuilderOnboardingModal similar to VendorOnboardingModal */}
      {modalState.type === 'builder-onboarding' && (
        <BuilderOnboardingModal
          isOpen={true}
          onClose={closeModal}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Agent Onboarding */}
      {modalState.type === 'agent-onboarding' && (
        <AgentOnboardingModal
          isOpen={true}
          onClose={closeModal}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PERSISTENT AGENT BAR - Always visible at bottom
          ═══════════════════════════════════════════════════════════════════════ */}
      <AgentBar 
        position="bottom" 
        variant="full"
      />
    </AgentBarProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHATBOT WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
function ChatbotModalWrapper() {
  const { isOpen, initialMessage, closeChatbot } = useChatbot();
  return <ChatbotModal isOpen={isOpen} onClose={closeChatbot} initialMessage={initialMessage} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER COMPONENTS FOR MISSING MODALS
// ═══════════════════════════════════════════════════════════════════════════════
// These should be created as separate files following the same pattern as VendorOnboardingModal

const BuilderOnboardingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}> = ({ isOpen, onClose, onComplete }) => {
  // Placeholder - implement similar to VendorOnboardingModal
  // Steps: Phone → OTP → Company Profile → Project Upload → Complete
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingBottom: '80px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #004236, #001a15)',
        borderRadius: '24px', padding: '40px', textAlign: 'center',
        border: '2px solid #B8860B', maxWidth: '500px'
      }}>
        <span style={{ fontSize: '4em' }}>🏗️</span>
        <h2 style={{ color: '#B8860B', marginTop: '16px' }}>Builder Onboarding</h2>
        <p style={{ color: '#aaa' }}>Builder onboarding flow coming soon!</p>
        <p style={{ color: '#666', fontSize: '0.9em' }}>
          This will include: Phone verification, Company profile, Project uploads, and Team setup.
        </p>
        <button
          onClick={() => onComplete({ type: 'builder' })}
          style={{
            marginTop: '24px', padding: '12px 32px',
            background: '#B8860B', color: '#000', border: 'none',
            borderRadius: '25px', cursor: 'pointer', fontWeight: 600
          }}
        >
          Continue (Demo)
        </button>
      </div>
    </div>
  );
};

const AgentOnboardingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}> = ({ isOpen, onClose, onComplete }) => {
  // Placeholder - implement similar to VendorOnboardingModal
  // Steps: Phone → OTP → License Verification → Profile → Complete
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingBottom: '80px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #004236, #001a15)',
        borderRadius: '24px', padding: '40px', textAlign: 'center',
        border: '2px solid #B8860B', maxWidth: '500px'
      }}>
        <span style={{ fontSize: '4em' }}>🏢</span>
        <h2 style={{ color: '#B8860B', marginTop: '16px' }}>Agent Onboarding</h2>
        <p style={{ color: '#aaa' }}>Agent onboarding flow coming soon!</p>
        <p style={{ color: '#666', fontSize: '0.9em' }}>
          This will include: Phone verification, License verification, Professional profile, and MLS integration.
        </p>
        <button
          onClick={() => onComplete({ type: 'agent' })}
          style={{
            marginTop: '24px', padding: '12px 32px',
            background: '#B8860B', color: '#000', border: 'none',
            borderRadius: '25px', cursor: 'pointer', fontWeight: 600
          }}
        >
          Continue (Demo)
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL RESTORATION
// ═══════════════════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const App: React.FC = () => {
  const { showToast, ToastComponent } = useToast();
  React.useEffect(() => { setGlobalToast(showToast); }, [showToast]);
  
  return (
    <LanguageProvider>
      <AuthProvider>
        <Provider store={store}>
          <ToastContext.Provider value={{ showToast }}>
            <FloatingAskBarProvider>
              <CartProvider>
                <ChatbotProvider>
                  <AIModeProvider>
                    <Router>
                      <AppContent />
                      <FloatingAskBar />
                      <ChatbotModalWrapper />
                      {ToastComponent}
                    </Router>
                  </AIModeProvider>
                </ChatbotProvider>
              </CartProvider>
            </FloatingAskBarProvider>
          </ToastContext.Provider>
        </Provider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
