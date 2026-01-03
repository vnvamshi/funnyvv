import React from 'react';
import BottomModal from '../../../../../components/BottomModal';
import useIsMobile from '../../../../../hooks/useIsMobile';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface SaleCategoryFormProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  onSubmit: () => void;
  canContinue: boolean;
  saleCategories: { value: string; label: string }[];
  title?: string;
  subtitle?: string;
  showDivider?: boolean;
  buttonText?: string;
  onOpenCategoryModal: () => void;
  showCategoryModal: boolean;
  onCloseCategoryModal: () => void;
}

const SaleCategoryForm: React.FC<SaleCategoryFormProps> = ({
  selectedCategory,
  onCategoryChange,
  onSubmit,
  canContinue,
  saleCategories,
  title = 'Add your property for sale',
  subtitle = 'Sell your properties at ease with Vistaview',
  showDivider = true,
  buttonText = 'Continue',
  onOpenCategoryModal,
  showCategoryModal,
  onCloseCategoryModal,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full text-left">
        {title && <div className="text-2xl font-light text-[#222] mb-2">{title}</div>}
        {subtitle && <div className="text-base text-[#222] mb-6">{subtitle}</div>}
        {showDivider && <div className="border-b border-[#E5E7EB] mb-8" />}
        <div className="font-semibold text-base mb-3">First select the sale category</div>
        <div className="mb-5">
          {isMobile ? (
            <>
              <button
                type="button"
                className="w-full p-4 border rounded-lg text-lg bg-white text-left flex items-center justify-between"
                onClick={onOpenCategoryModal}
              >
                <span className={selectedCategory ? 'text-black' : 'text-gray-400'}>
                  {selectedCategory || 'Select category'}
                </span>
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path d="M6 8l4 4 4-4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <BottomModal
                open={showCategoryModal}
                title="Select Category"
                onCancel={onCloseCategoryModal}
                onSubmit={undefined}
                submitLabel={undefined}
                cancelLabel={undefined}
              >
                <div className="flex flex-col gap-2">
                  {saleCategories.map(opt => (
                    <button
                      key={opt.value}
                      className={`w-full text-left px-4 py-3 rounded-lg text-lg ${selectedCategory === opt.value ? 'bg-green-100 text-green-900 font-bold' : 'bg-white text-black'}`}
                      onClick={() => {
                        onCategoryChange(opt.value);
                        onCloseCategoryModal();
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </BottomModal>
            </>
          ) : (
            <FormControl fullWidth>
              <Select
                id="sale-category-select"
                value={selectedCategory}
                displayEmpty
                renderValue={(selected) =>
                  selected ? saleCategories.find(opt => opt.value === selected)?.label : <span style={{ color: '#9ca3af' }}>Select category</span>
                }
                onChange={(e) => onCategoryChange(e.target.value)}
                sx={{
                  borderRadius: '8px',
                  fontSize: '18px',
                  height: '56px',
                  background: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007E67' },
                  '.MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    height: '56px',
                    padding: '0 14px',
                  },
                  '.MuiSvgIcon-root': { color: '#007E67' },
                }}
              >
                <MenuItem value="" disabled hidden>Select category</MenuItem>
                {saleCategories.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        <div className="flex justify-center mt-2 mb-1">
          <button
            onClick={onSubmit}
            disabled={!canContinue}
            className={`settings-gradient-btn w-full max-w-xs py-3 rounded-full font-bold text-lg transition-all duration-200 ${canContinue ? 'bg-green-900 text-white shadow-lg' : 'bg-gray-300 text-gray-500'}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleCategoryForm; 