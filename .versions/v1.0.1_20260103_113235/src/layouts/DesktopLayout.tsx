import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AppRoutes from '../routes';
import ScrollToTop from '../components/ScrollToTop';

const DesktopLayout = () => {
  const [showHeaderFooter, setShowHeaderFooter] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 1024 : true);
  const location = useLocation();
  
  // Check if current route is a plan page (which has its own V3Footer)
  const isPlanPage = location.pathname.startsWith('/plan');

  useEffect(() => {
    function handleResize() {
      setShowHeaderFooter(window.innerWidth > 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {showHeaderFooter && <Header />}
      <main className={`flex-grow ${showHeaderFooter ? 'pt-20' : ''}`}>
        <ScrollToTop />
        <AppRoutes />
      </main>
      {showHeaderFooter && !isPlanPage && <Footer />}
    </div>
  );
};

export default DesktopLayout;