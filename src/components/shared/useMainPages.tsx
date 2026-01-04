// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - MAIN PAGE INTEGRATION HOOK
// Use this to connect all 4 main icons to their pages
// ═══════════════════════════════════════════════════════════════════════════════
//
// USAGE in your main App or Home component:
//
// import { useMainPages, MainPageModals } from './components/shared/useMainPages';
//
// function App() {
//   const pages = useMainPages();
//   
//   return (
//     <>
//       {/* Your main page with 4 icons */}
//       <div onClick={pages.openRealEstate}>🏠 Real Estate</div>
//       <div onClick={pages.openCatalog}>🛒 Product Catalog</div>
//       <div onClick={pages.openInteriorDesign}>🎨 Interior Design</div>
//       <div onClick={pages.openServices}>🛠️ Services</div>
//       
//       {/* Render the page modals */}
//       <MainPageModals {...pages} />
//     </>
//   );
// }
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';
import { ProductCatalogPage } from '../catalog';
import RealEstatePage from '../pages/RealEstatePage';
import ServicesPage from '../pages/ServicesPage';
import InteriorDesignPage from '../pages/InteriorDesignPage';

export const useMainPages = () => {
  const [showCatalog, setShowCatalog] = useState(false);
  const [showRealEstate, setShowRealEstate] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showInterior, setShowInterior] = useState(false);

  const openCatalog = useCallback(() => setShowCatalog(true), []);
  const openRealEstate = useCallback(() => setShowRealEstate(true), []);
  const openServices = useCallback(() => setShowServices(true), []);
  const openInteriorDesign = useCallback(() => setShowInterior(true), []);

  const closeAll = useCallback(() => {
    setShowCatalog(false);
    setShowRealEstate(false);
    setShowServices(false);
    setShowInterior(false);
  }, []);

  return {
    showCatalog, showRealEstate, showServices, showInterior,
    openCatalog, openRealEstate, openServices, openInteriorDesign,
    closeCatalog: () => setShowCatalog(false),
    closeRealEstate: () => setShowRealEstate(false),
    closeServices: () => setShowServices(false),
    closeInterior: () => setShowInterior(false),
    closeAll
  };
};

export const MainPageModals: React.FC<ReturnType<typeof useMainPages>> = (props) => {
  return (
    <>
      {props.showCatalog && <ProductCatalogPage isOpen={true} onClose={props.closeCatalog} />}
      {props.showRealEstate && <RealEstatePage isOpen={true} onClose={props.closeRealEstate} />}
      {props.showServices && <ServicesPage isOpen={true} onClose={props.closeServices} />}
      {props.showInterior && <InteriorDesignPage isOpen={true} onClose={props.closeInterior} />}
    </>
  );
};

export default useMainPages;
