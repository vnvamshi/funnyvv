import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MobilePropertyWizardProvider } from './MobilePropertyWizardContext';
import { MasterDataProvider } from '../hooks/useMasterDataContext';
import { useEffect } from 'react';
import { useRef } from 'react';
import { localStorageUtils } from './MobilePropertyWizardContext';
import SaleCategoryPage from './SaleCategoryPage';
import AddPropertyDetailsPage from './AddPropertyDetailsPage';
import PropertyLocationPage from './PropertyLocationPage';
import PropertyInfoPage from './PropertyInfoPage';
import PropertyMediaPage from './PropertyMediaPage';
import PropertyAmenitiesPage from './PropertyAmenitiesPage';
import PropertyContactInfoPage from './PropertyContactInfoPage';
import PropertyReviewPage from './PropertyReviewPage';

const MobilePropertyLayout: React.FC = () => {
  const location = useLocation();
  const initialData = location.state?.initialData || {};
  const clearedRef = useRef(false);
  useEffect(() => {
    if (!clearedRef.current) {
      localStorageUtils.clear();
      clearedRef.current = true;
    }
  }, []);

  return (
    <MobilePropertyWizardProvider initialData={initialData}>
      <MasterDataProvider>
        <Routes>
          <Route path="/sale-category" element={<SaleCategoryPage />} />
          <Route path="/details" element={<AddPropertyDetailsPage />} />
          <Route path="/location/:id" element={<PropertyLocationPage />} />
          <Route path="/location" element={<PropertyLocationPage />} />
          <Route path="/info" element={<PropertyInfoPage />} />
          <Route path="/info/:id" element={<PropertyInfoPage />} />
          <Route path="/media" element={<PropertyMediaPage />} />
          <Route path="/media/:id" element={<PropertyMediaPage />} />
          <Route path="/amenities" element={<PropertyAmenitiesPage />} />
          <Route path="/amenities/:id" element={<PropertyAmenitiesPage />} />
          <Route path="/contact-info" element={<PropertyContactInfoPage />} />
          <Route path="/contact-info/:id" element={<PropertyContactInfoPage />} />
          <Route path="/review" element={<PropertyReviewPage />} />
          <Route path="/review/:id" element={<PropertyReviewPage />} />
        </Routes>
      </MasterDataProvider>
    </MobilePropertyWizardProvider>
  );
};

export default MobilePropertyLayout; 