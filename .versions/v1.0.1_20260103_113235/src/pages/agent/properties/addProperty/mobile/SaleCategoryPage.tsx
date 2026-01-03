import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSaleCategoryFlow } from '../hooks/useSaleCategoryFlow';
import SaleCategoryForm from '../components/SaleCategoryForm';
import { useMobilePropertyWizard } from './MobilePropertyWizardContext';

const SaleCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleSaleCategorySubmit, clearAllData } = useMobilePropertyWizard();
  const {
    selectedCategory,
    handleCategoryChange,
    canContinue,
    SALE_CATEGORIES,
  } = useSaleCategoryFlow();

  // State for bottom modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Clear all wizard data on mount to prevent previous property data from persisting
  useEffect(() => {
    clearAllData();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = () => {
    if (canContinue) {
      // Use context handler to submit sale category
      handleSaleCategorySubmit({
        saleCategory: selectedCategory,
        propertyType: null,
        streetAddress: '',
        unitNumber: '',
        city: null,
        state: null,
        postalCode: '',
        country: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
        <button
          className="mr-2 p-2 -ml-2"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-green-900 text-2xl font-bold">Add property</span>
      </div>
      {/* Main Content */}
      <div className="flex flex-col px-6 pt-6">
        <div className="text-3xl font-bold text-[#222] mb-2">Add your property for sale</div>
        <div className="text-base text-[#222] mb-6">Sell your properties at ease with Vistaview</div>
        <div className="border-b border-[#E5E7EB] mb-8" />
        <SaleCategoryForm
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          canContinue={canContinue}
          saleCategories={SALE_CATEGORIES}
          title=""
          subtitle=""
          showDivider={false}
          buttonText="Continue"
          onOpenCategoryModal={() => setShowCategoryModal(true)}
          showCategoryModal={showCategoryModal}
          onCloseCategoryModal={() => setShowCategoryModal(false)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default SaleCategoryPage; 