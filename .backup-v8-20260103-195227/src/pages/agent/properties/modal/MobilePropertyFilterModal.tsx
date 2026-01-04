import React from 'react';
import BottomModal from '../../../../components/BottomModal';
import Slider from '@mui/material/Slider';
import { HouseIcon, ApartmentIcon, BedBreakfastIcon, VillasIcon, DuplexIcon, PrivateIslandIcon } from '../../../../assets/icons/PropertyTypeIcons';

interface MobilePropertyFilterModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  priceRange: number[];
  onPriceRangeChange: (value: number[]) => void;
  avgPrice?: number;
  bedrooms: number;
  onBedroomsChange: (value: number) => void;
  bathrooms: number;
  onBathroomsChange: (value: number) => void;
  propertyTypes: string[];
  onPropertyTypeToggle: (type: string) => void;
  listingTypes: string[];
  onListingTypeToggle: (type: string) => void;
  propertyTypeOptions: { id: string, value: string }[];
}

const LISTING_TYPE_OPTIONS = [
  'Owner Posted',
  'Agent listed',
  'New Construction',
];

const MobilePropertyFilterModal: React.FC<MobilePropertyFilterModalProps> = ({
  open,
  onCancel,
  onSubmit,
  priceRange,
  onPriceRangeChange,
  avgPrice,
  bedrooms,
  onBedroomsChange,
  bathrooms,
  onBathroomsChange,
  propertyTypes,
  onPropertyTypeToggle,
  listingTypes,
  onListingTypeToggle,
  propertyTypeOptions,
}) => {
  return (
    <BottomModal
      open={open}
      title="Filters"
      onCancel={onCancel}
      onSubmit={onSubmit}
      submitLabel="Apply"
      cancelLabel="Cancel"
    >
      <div className="px-2 pb-2">
        {/* Price Range */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-1">Price range</div>
          {/* {avgPrice && <div className="text-gray-400 text-sm mb-2">The average price is ${avgPrice.toLocaleString()}</div>} */}
          <div className="flex items-center gap-2">
            <span className="text-xs">No Min</span>
            <Slider
              value={priceRange}
              onChange={(_, value) => onPriceRangeChange(value as number[])}
              min={0}
              max={10000000}
              step={10000}
              valueLabelDisplay="auto"
              sx={{
                flex: 1,
                color: 'transparent',
                '& .MuiSlider-thumb': {
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                  border: '2px solid #007E67',
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                  border: 'none',
                },
                '& .MuiSlider-rail': {
                  background: '#E5E7EB',
                  opacity: 1,
                },
              }}
            />
            <span className="text-xs">No Max</span>
          </div>
          <div className="text-center text-base mt-1">
            {priceRange[0] === 0 && priceRange[1] === 10000000
              ? 'Any'
              : <span className="inline-block px-4 py-1 rounded-full text-white font-semibold text-base" style={{background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'}}>
                  ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </span>
            }
          </div>
        </div>
        <hr className="my-4" />
        {/* Bedroom(s) & Baths */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2">Bedroom(s) & Baths</div>
          <div className="mb-2">
            <div className="text-sm mb-1">Bedrooms</div>
            <div className="flex gap-2">
              {[0,1,2,3,4,5].map(n => (
                <button
                  key={n}
                  className={`px-4 py-2 rounded-full border font-semibold ${bedrooms === n ? 'text-white' : 'text-black border-gray-300 bg-white'}`.replace('bg-white', bedrooms === n ? '' : 'bg-white')}
                  style={bedrooms === n ? { background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', border: 'none' } : {}}
                  onClick={() => onBedroomsChange(n)}
                >
                  {n === 0 ? 'Any' : n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm mb-1 mt-2">Bathrooms</div>
            <div className="flex gap-2">
              {[0,1,2,3,4,5].map(n => (
                <button
                  key={n}
                  className={`px-4 py-2 rounded-full border font-semibold ${bathrooms === n ? 'text-white' : 'text-black border-gray-300 bg-white'}`.replace('bg-white', bathrooms === n ? '' : 'bg-white')}
                  style={bathrooms === n ? { background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', border: 'none' } : {}}
                  onClick={() => onBathroomsChange(n)}
                >
                  {n === 0 ? 'Any' : n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <hr className="my-4" />
        {/* Property Type */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2">Property type</div>
          <div className="grid grid-cols-2 gap-3">
            {propertyTypeOptions.map(opt => (
              <button
                key={opt.id}
                className={`flex flex-col items-center justify-center border rounded-xl py-3 ${propertyTypes.includes(opt.value) ? 'border-green-900 bg-green-50' : 'border-gray-300 bg-white'}`}
                onClick={() => onPropertyTypeToggle(opt.value)}
              >
                {/* Optionally, map opt.value to an icon if needed */}
                <span className="text-sm font-semibold">{opt.value}</span>
              </button>
            ))}
          </div>
        </div>
        <hr className="my-4" />
        {/* Listing Type */}
        <div className="mb-2">
          <div className="font-semibold text-lg mb-2">Listing Type</div>
          {LISTING_TYPE_OPTIONS.map(type => (
            <label key={type} className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={listingTypes.includes(type)}
                onChange={() => onListingTypeToggle(type)}
                className="w-5 h-5 border-gray-300 rounded"
              />
              <span className="text-base">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </BottomModal>
  );
};

export default MobilePropertyFilterModal; 