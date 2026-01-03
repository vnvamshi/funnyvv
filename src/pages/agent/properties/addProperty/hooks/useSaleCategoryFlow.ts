import { useState } from 'react';

// tell where this useSaleCategoryFlow is used:
// 1. in the SaleCategoryPage component
// 2. in the AddOrUpdatePropertyWizard component
// 3. in the PropertyInfo component
// 4. in the PropertyMedia component
// 5. in the PropertyAmenities component
// 6. in the PropertyContactInfo component
// 7. in the PropertyReview component

// TODO: Add the sale categories from the backend

export const SALE_CATEGORIES = [
  { value: 'Property', label: 'Property' },
  { value: 'Land Property', label: 'MLS Properties' },
];

export function useSaleCategoryFlow(initialCategory = '') {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const canContinue = !!selectedCategory;

  return {
    selectedCategory,
    setSelectedCategory,
    handleCategoryChange,
    canContinue,
    SALE_CATEGORIES,
  };
} 