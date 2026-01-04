// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - MAIN PAGE INTEGRATION
// Helper component to integrate all sections with voice
// ═══════════════════════════════════════════════════════════════════════════════
// 
// USAGE: Import this in your main App.tsx and use the provided handlers
// for the 4 main icons: Real Estate, Product Catalogue, Interior Design, Services
//
// Example:
// import { useMainPageIntegration } from './components/shared/MainPageIntegration';
// 
// function App() {
//   const integration = useMainPageIntegration();
//   return (
//     <>
//       {/* Your existing content */}
//       <button onClick={integration.openRealEstate}>Real Estate</button>
//       <button onClick={integration.openCatalog}>Product Catalogue</button>
//       <button onClick={integration.openInteriorDesign}>Interior Design</button>
//       <button onClick={integration.openServices}>Services</button>
//       
//       {/* Render the modals */}
//       {integration.renderModals()}
//     </>
//   );
// }
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';
import { ProductCatalogPage } from '../catalog';
import { RealEstatePage } from '../realestate';
import { ServicesPage } from '../services';
import { InteriorDesignPage } from '../interiordesign';

export const useMainPageIntegration = () => {
  const [showCatalog, setShowCatalog] = useState(false);
  const [showRealEstate, setShowRealEstate] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showInteriorDesign, setShowInteriorDesign] = useState(false);

  const openCatalog = useCallback(() => setShowCatalog(true), []);
  const openRealEstate = useCallback(() => setShowRealEstate(true), []);
  const openServices = useCallback(() => setShowServices(true), []);
  const openInteriorDesign = useCallback(() => setShowInteriorDesign(true), []);

  const closeAll = useCallback(() => {
    setShowCatalog(false);
    setShowRealEstate(false);
    setShowServices(false);
    setShowInteriorDesign(false);
  }, []);

  const renderModals = useCallback(() => (
    <>
      {showCatalog && (
        <ProductCatalogPage 
          isOpen={showCatalog} 
          onClose={() => setShowCatalog(false)} 
        />
      )}
      {showRealEstate && (
        <RealEstatePage 
          isOpen={showRealEstate} 
          onClose={() => setShowRealEstate(false)} 
        />
      )}
      {showServices && (
        <ServicesPage 
          isOpen={showServices} 
          onClose={() => setShowServices(false)} 
        />
      )}
      {showInteriorDesign && (
        <InteriorDesignPage 
          isOpen={showInteriorDesign} 
          onClose={() => setShowInteriorDesign(false)} 
        />
      )}
    </>
  ), [showCatalog, showRealEstate, showServices, showInteriorDesign]);

  // Handle voice navigation from teleprompter
  const handleVoiceNavigation = useCallback((target: string) => {
    closeAll();
    switch (target) {
      case 'catalog':
      case 'products':
        setShowCatalog(true);
        break;
      case 'realestate':
      case 'real estate':
      case 'properties':
        setShowRealEstate(true);
        break;
      case 'services':
        setShowServices(true);
        break;
      case 'interior':
      case 'design':
      case 'interiordesign':
        setShowInteriorDesign(true);
        break;
      case 'home':
        closeAll();
        break;
    }
  }, [closeAll]);

  return {
    // States
    showCatalog,
    showRealEstate,
    showServices,
    showInteriorDesign,
    
    // Openers
    openCatalog,
    openRealEstate,
    openServices,
    openInteriorDesign,
    
    // Close
    closeAll,
    
    // Voice navigation
    handleVoiceNavigation,
    
    // Render
    renderModals
  };
};

export default useMainPageIntegration;
