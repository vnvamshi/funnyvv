import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
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

export const ToastContext = React.createContext<{ showToast: (msg: string, duration?: number) => void }>({ showToast: () => {} });

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation();
  const isNoLayoutPage = location.pathname === '/' || 
                        location.pathname === '/landing' ||
                        location.pathname === '/services' ||
                        location.pathname === '/location-select' ||
                        location.pathname === '/location-select/info' ||
                        location.pathname === '/skyven-data' ||
                        location.pathname.startsWith('/v3');
  if (isNoLayoutPage) {
    return (<><ScrollToTop /><Routes /></>);
  }
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}

function ChatbotModalWrapper() {
  const { isOpen, initialMessage, closeChatbot } = useChatbot();
  return <ChatbotModal isOpen={isOpen} onClose={closeChatbot} initialMessage={initialMessage} />;
}

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

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
