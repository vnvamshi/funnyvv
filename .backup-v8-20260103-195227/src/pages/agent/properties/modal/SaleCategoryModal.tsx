import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import SaleCategoryForm from '../addProperty/components/SaleCategoryForm';
import { useSaleCategoryFlow } from '../addProperty/hooks/useSaleCategoryFlow';

interface SaleCategoryModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

const SaleCategoryModal: React.FC<SaleCategoryModalProps> = ({ open, onCancel, onSubmit, selectedCategory, onCategoryChange }) => {
  const { SALE_CATEGORIES } = useSaleCategoryFlow();

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 4 }}>
        <SaleCategoryForm
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          onSubmit={onSubmit}
          canContinue={!!selectedCategory}
          saleCategories={SALE_CATEGORIES}
          title="Add your property for sale"
          subtitle="Sell your properties at ease with Vistaview"
          showDivider={true}
          buttonText="Continue"
        />
      </DialogContent>
    </Dialog>
  );
};

export default SaleCategoryModal; 