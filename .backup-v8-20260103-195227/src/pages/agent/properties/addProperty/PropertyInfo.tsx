import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../utils/api';
import { useMasterData } from './hooks/useMasterDataContext';
import Skeleton from '@mui/material/Skeleton'; // or your own skeleton loader

// Temporary arrays for dropdowns and checkboxes
const lotSizeUnits = ['Sq. Ft.', 'Sq. M.', 'Acres'];
const homeTypes = ['Single family home', 'Multi family home', 'Condo', 'Townhouse', 'Villa'];
const yearBuiltOptions = Array.from({ length: 50 }, (_, i) => `${2024 - i}`);

interface PropertyInfoProps {
  initialValues?: any;
  onBack: () => void;
  onSaveDraft: (values: any) => void;
  onNext: (values: any) => void;
}

interface MasterDataItem {
  id: string | number;
  value: string;
}

const PropertyInfo: React.FC<PropertyInfoProps> = ({ initialValues = {}, onBack, onSaveDraft, onNext }) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const [form, setForm] = useState({
    name : "",
    lotSize: null,
    lotSizeUnit: 'Sq. Ft.',
    totalSqft: null,
    totalSqftUnit: 'Sq. Ft.',
    basementSqft: null,
    basementSqftUnit: 'Sq. Ft.',
    homeType: homeTypes[0],
    yearBuilt: yearBuiltOptions[0],
    bedrooms: null,
    fullBathrooms: null,
    halfBathrooms: null,
    sellingPrice: null,
    details: '',
    buildingRooms: [] as {id: string | number, value: string}[],
    basement: [] as {id: string | number, value: string}[],
    floorCovering: [] as {id: string | number, value: string}[],
    architecturalStyle: [] as {id: string | number, value: string}[],
    exterior: [] as {id: string | number, value: string}[],
    roof: [] as {id: string | number, value: string}[],
    parking: [] as {id: string | number, value: string}[],
    totalRooms: null,
    parkingSpaces: null,
    propertyStatus: [] as (string | number)[],
    listingType: [] as (string | number)[],
    mortgageType: '' as string | number,
    hoaSearch: '' as string,
    max_hoa_fees: '' as string,
    unitNumber: '', // Added unitNumber
    ...initialValues,
  });

  const { masterData, loading: masterDataLoading, fetchMasterData } = useMasterData();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    fetchMasterData(['roomtype', 'basementtype', 'floorcovering', 'architecturalstyle', 'exteriortype', 'rooftype', 'parkingtype', 'propertystatus', 'listingtype', 'mortgagetype']);
  }, [fetchMasterData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof form) => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    // Name
    if (!form.name || form.name.trim() === '') {
      errors.name = 'Property name is required.';
    } else if (form.name.length > 100) {
      errors.name = 'Property name cannot exceed 100 characters.';
    }
    // Unit Number
    if (form.unitNumber && form.unitNumber.length > 20) {
      errors.unitNumber = 'Unit number cannot exceed 20 characters.';
    }
    // Lot Size
    if (form.lotSize && form.lotSize.toString().length > 10) {
      errors.lotSize = 'Lot size cannot exceed 10 digits.';
    } else if (form.lotSize && Number(form.lotSize) < 0) {
      errors.lotSize = 'Lot size cannot be negative.';
    }
    // Total Sqft
    if (form.totalSqft && form.totalSqft.toString().length > 10) {
      errors.totalSqft = 'Total square footage cannot exceed 10 digits.';
    } else if (form.totalSqft && Number(form.totalSqft) < 0) {
      errors.totalSqft = 'Total square footage cannot be negative.';
    }
    // Basement Sqft
    if (form.basementSqft && form.basementSqft.toString().length > 10) {
      errors.basementSqft = 'Basement square footage cannot exceed 10 digits.';
    } else if (form.basementSqft && Number(form.basementSqft) < 0) {
      errors.basementSqft = 'Basement square footage cannot be negative.';
    }
    // Bedrooms
    if (form.bedrooms && (Number(form.bedrooms) < 0 || Number(form.bedrooms) > 100)) {
      errors.bedrooms = 'Please enter a value between 0 and 100 for bedrooms.';
    }
    // Full Bathrooms
    if (form.fullBathrooms && (Number(form.fullBathrooms) < 0 || Number(form.fullBathrooms) > 50)) {
      errors.fullBathrooms = 'Please enter a value between 0 and 50 for full bathrooms.';
    }
    // Half Bathrooms
    if (form.halfBathrooms && (Number(form.halfBathrooms) < 0 || Number(form.halfBathrooms) > 50)) {
      errors.halfBathrooms = 'Please enter a value between 0 and 50 for half bathrooms.';
    }
    // Selling Price
    if (!form.sellingPrice || form.sellingPrice === null || form.sellingPrice === '') {
      errors.sellingPrice = 'Selling price is required.';
    } else {
      const price = Number(form.sellingPrice);
      if (isNaN(price) || price <= 0) {
        errors.sellingPrice = 'Please enter a valid selling price.';
      } else if (price < 1000000) {
        errors.sellingPrice = 'Selling price must be at least $1,000,000.';
      } else if (price > 9999999999.99) {
        errors.sellingPrice = 'Selling price cannot exceed $9,999,999,999.99.';
      } else if (!/^\d+(\.\d{1,2})?$/.test(form.sellingPrice.toString())) {
        errors.sellingPrice = 'Please enter a price with up to 2 decimal places.';
      }
    }
    setValidationErrors(errors);
    // Auto focus on first invalid field
    if (errors.name && nameRef.current) {
      nameRef.current.focus();
    } else if (errors.sellingPrice && priceRef.current) {
      priceRef.current.focus();
    }
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      console.log('PropertyInfo: handleNext called with form data:', form);
      console.log('PropertyInfo: propertyStatus in form:', form.propertyStatus);
      onNext(form);
    }
  };

  const handleCheckbox = (name: string, value: {id: string | number, value: string}) => {
    setForm((prev: typeof form) => {
      // For architectural style and basement, make it single select
      if (name === 'architecturalStyle' || name === 'basement') {
        return {
          ...prev,
          [name]: [value], // Only allow one selection
        };
      }
      // For other fields, keep multi-select behavior
      const arr = prev[name] as {id: string | number, value: string}[];
      return {
        ...prev,
        [name]: arr.some(item => item.id === value.id)
          ? arr.filter(item => item.id !== value.id)
          : [...arr, value],
      };
    });
  };

  const isChecked = (name: string, id: string | number) => {
    return form[name]?.some((item: any) => item.id === id) || false;
  };

  const normalizeArray = (arr: any[] = [], master: {id: string | number, value: string}[] = []) => {
    // If array contains objects with id/value, return as is. If array contains only IDs, map to objects using master data.
    if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null && 'id' in arr[0] && 'value' in arr[0]) {
      return arr;
    }
    if (arr.length > 0 && master.length > 0) {
      return arr.map((id: string | number) => {
        const found = master.find((item: {id: string | number, value: string}) => item.id === id);
        return found ? { id: found.id, value: found.value } : { id, value: '' };
      });
    }
    return [];
  };

  useEffect(() => {
    // When master data is loaded or initialValues change, normalize all checkbox arrays
    setForm((prev: typeof form) => ({
      ...prev,
      buildingRooms: normalizeArray(initialValues.buildingRooms, masterData.roomtype || []),
      basement: normalizeArray(initialValues.basementTypes || initialValues.basement, masterData.basementtype || []),
      floorCovering: normalizeArray(initialValues.floorCoverings || initialValues.floorCovering, masterData.floorcovering || []),
      architecturalStyle: normalizeArray(initialValues.architecturalStyles || initialValues.architecturalStyle, masterData.architecturalstyle || []),
      exterior: normalizeArray(initialValues.exteriors || initialValues.exterior, masterData.exteriortype || []),
      roof: normalizeArray(initialValues.roofs || initialValues.roof, masterData.rooftype || []),
      parking: normalizeArray(initialValues.parkings || initialValues.parking, masterData.parkingtype || []),
      // Only set these values if they're not already present in the form state (preserve user changes)
      propertyStatus: prev.propertyStatus && prev.propertyStatus.length > 0 
        ? prev.propertyStatus 
        : (initialValues.property_statuses || []).map((item: any) => item.id),
      listingType: prev.listingType && prev.listingType.length > 0 
        ? prev.listingType 
        : (initialValues.listing_types || []).map((item: any) => item.id),
      mortgageType: prev.mortgageType 
        ? prev.mortgageType 
        : (initialValues.mortgage_types && initialValues.mortgage_types[0]?.id) || '',
      hoaSearch: prev.hoaSearch || initialValues.max_hoa_fees || '',
      max_hoa_fees: prev.max_hoa_fees || initialValues.max_hoa_fees || '',
    }));
  }, [initialValues, masterData.roomtype, masterData.basementtype, masterData.floorcovering, masterData.architecturalstyle, masterData.exteriortype, masterData.rooftype, masterData.parkingtype, masterData.propertystatus, masterData.listingtype, masterData.mortgagetype]);

  useEffect(() => {
    console.log("form", form);
  }, [form]);

  return (
    <div className="w-full bg-white rounded-lg shadow p-8">
      <div className="text-2xl font-semibold mb-1 mt-2">Add your property details</div>
      <div className="text-base text-[#222] mb-0">{form.address}, {form.city_detail?.name}, {form.state_detail?.name}, {form.country_detail?.name},  {form.postalCode}</div>
      <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{form.propertyType?.name}</span></div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1">Name <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input 
            ref={nameRef}
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            type="text" 
            className={`w-full border ${validationErrors.name ? 'border-red-500' : 'border-[#E5E7EB]'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]`} 
            placeholder="Enter property name" 
          />
        </div>
        {validationErrors.name && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Lot Size</label>
          <div className="flex gap-2">
            <input name="lotSize" value={form.lotSize} onChange={handleChange} type="number" className={`w-full border ${validationErrors.lotSize ? 'border-red-500' : 'border-[#E5E7EB]'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]`} placeholder="" />
            <select name="lotSizeUnit" value={form.lotSizeUnit} onChange={handleChange} className="border border-[#E5E7EB] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]">
              {lotSizeUnits.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          {validationErrors.lotSize && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.lotSize}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Total sq. ft.</label>
          <div className="flex gap-2">
            <input name="totalSqft" value={form.totalSqft} onChange={handleChange} type="number" className={`w-full border ${validationErrors.totalSqft ? 'border-red-500' : 'border-[#E5E7EB]'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]`} placeholder="" />
            <select name="totalSqftUnit" value={form.totalSqftUnit} onChange={handleChange} disabled className="border border-[#E5E7EB] rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed">
              <option>Sq. Ft.</option>
            </select>
          </div>
          {validationErrors.totalSqft && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.totalSqft}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Basement sq. ft.</label>
          <div className="flex gap-2">
            <input name="basementSqft" value={form.basementSqft} onChange={handleChange} type="number" className={`w-full border ${validationErrors.basementSqft ? 'border-red-500' : 'border-[#E5E7EB]'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]`} placeholder="" />
            <select name="basementSqftUnit" value={form.basementSqftUnit} onChange={handleChange} disabled className="border border-[#E5E7EB] rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed">
              <option>Sq. Ft.</option>
            </select>
          </div>
          {validationErrors.basementSqft && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.basementSqft}</p>
          )}
        </div>
      </div>
      {/* Home type, Year built */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="w-full">
          <label className="block text-sm font-semibold mb-1">Home type</label>
          <select name="homeType" value={form.homeType} onChange={handleChange} className="w-full border border-[#E5E7EB] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67] min-w-0">
            {homeTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="w-full">
          <label className="block text-sm font-semibold mb-1">Year Built</label>
          <select name="yearBuilt" value={form.yearBuilt} onChange={handleChange} className="w-full border border-[#E5E7EB] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67] min-w-0">
            {yearBuiltOptions.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>
      {/* Bedroom(s) & Bathroom(s) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Bed rooms</label>
          <input name="bedrooms" value={form.bedrooms} onChange={handleChange} type="number" className={`w-full border ${validationErrors.bedrooms ? 'border-red-500' : 'border-[#E5E7EB]'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]`} />
          {validationErrors.bedrooms && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.bedrooms}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Full Bathrooms</label>
          <input name="fullBathrooms" value={form.fullBathrooms} onChange={handleChange} type="number" className={`w-full border ${validationErrors.fullBathrooms ? 'border-red-500' : 'border-[#E5E7EB]'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]`} />
          {validationErrors.fullBathrooms && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.fullBathrooms}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Half Bathrooms</label>
          <input name="halfBathrooms" value={form.halfBathrooms} onChange={handleChange} type="number" className={`w-full border ${validationErrors.halfBathrooms ? 'border-red-500' : 'border-[#E5E7EB]'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]`} />
          {validationErrors.halfBathrooms && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.halfBathrooms}</p>
          )}
        </div>
      </div>
      {/* Set your price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Selling Price <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-[#F3F3F3] border border-[#E5E7EB] rounded-l">$</span>
            <input 
              ref={priceRef}
              name="sellingPrice" 
              value={form.sellingPrice} 
              onChange={handleChange} 
              type="number" 
              className={`w-full border ${validationErrors.sellingPrice ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-l-none rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]`} 
              placeholder="Enter selling price"
            />
          </div>
          {validationErrors.sellingPrice && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.sellingPrice}</p>
          )}
        </div>
      </div>
      {/* Describe the property */}
      <div className="mb-6">
        <div className="font-bold text-base mb-2">Describe the property</div>
        <label className="block text-sm font-semibold mb-1">Details</label>
        <textarea name="details" value={form.details} onChange={handleChange} className="w-full border border-[#E5E7EB] rounded px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#007E67]" />
      </div>
      
      {/* Building Details */}
      <div className="mb-6">
        <div className="font-semibold mb-2 text-base">Building Details</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ROOMS */}
          <div className="flex flex-col gap-1">
            <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Rooms</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.roomtype || []).map((item: {id: string | number, value: string}) => (
                <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                  <input
                    type="checkbox"
                    checked={isChecked('buildingRooms', item.id)}
                    onChange={() => handleCheckbox('buildingRooms', item)}
                    className="mr-2 accent-[#007E67]"
                  />
                  {item.value}
                </label>
              ))}
            </div>
            <div className="mt-2">
              <label className="block text-xs font-semibold mb-1 flex items-center">Total Rooms
                <span className="ml-1 text-xs text-[#007E67] cursor-pointer" title="Total number of rooms including all types.">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#007E67" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="#007E67">?</text></svg>
                </span>
              </label>
              <input name="totalRooms" value={form.totalRooms} onChange={handleChange} type="number" className="w-42 border border-[#E5E7EB] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#007E67]" />
              <div className="mb-6"></div>
            </div>
          </div>
          {/* BASEMENT + FLOOR COVERING */}
          <div className="flex flex-col gap-2">
            <div>
              <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Basement</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.basementtype || []).map((item: {id: string | number, value: string}) => (
                  <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                    <input
                      type="checkbox"
                      checked={isChecked('basement', item.id)}
                      onChange={() => handleCheckbox('basement', item)}
                      className="mr-2 accent-[#007E67]"
                    />
                    {item.value}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Floor Covering</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.floorcovering || []).map((item: {id: string | number, value: string}) => (
                  <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                    <input
                      type="checkbox"
                      checked={isChecked('floorCovering', item.id)}
                      onChange={() => handleCheckbox('floorCovering', item)}
                      className="mr-2 accent-[#007E67]"
                    />
                    {item.value}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {/* ARCHITECTURAL STYLE */}
          <div className="flex flex-col gap-1">
            <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Architectural Style</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.architecturalstyle || []).map((item: {id: string | number, value: string}) => (
                <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                  <input
                    type="checkbox"
                    checked={isChecked('architecturalStyle', item.id)}
                    onChange={() => handleCheckbox('architecturalStyle', item)}
                    className="mr-2 accent-[#007E67]"
                  />
                  {item.value}
                </label>
              ))}
            </div>
          </div>

          {/* NEW ROW: Property Status, Listing Type, Mortgage Type */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {/* Property Status */}
            <div className="flex flex-col gap-1">
              <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Property Status</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.propertystatus || []).map((item: {id: string | number, value: string}) => (
                  <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                    <input
                      type="checkbox"
                      checked={form.propertyStatus?.includes(item.id)}
                      onChange={() => {
                        // For property status, make it single select like architectural style
                        setForm((prev: typeof form) => ({ 
                          ...prev, 
                          propertyStatus: [item.id] // Only allow one selection
                        }));
                      }}
                      className="mr-2 accent-[#007E67]"
                    />
                    {item.value}
                  </label>
                ))}
              </div>
            </div>
            {/* Listing Type */}
            <div className="flex flex-col gap-1">
              <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Listing Type</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.listingtype || []).map((item: {id: string | number, value: string}) => (
                  <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                    <input
                      type="checkbox"
                      checked={form.listingType?.includes(item.id)}
                      onChange={() => {
                        const currentListing = form.listingType || [];
                        const newListing = currentListing.includes(item.id)
                          ? currentListing.filter((id: any) => id !== item.id)
                          : [...currentListing, item.id];
                        setForm((prev: typeof form) => ({ ...prev, listingType: newListing }));
                      }}
                      className="mr-2 accent-[#007E67]"
                    />
                    {item.value}
                  </label>
                ))}
              </div>
            </div>
            {/* Mortgage Type */}
            <div className="flex flex-col gap-1">
              <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Mortgage Type</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.mortgagetype || []).map((item: {id: string | number, value: string}) => (
                  <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                    <input
                      type="radio"
                      name="mortgageType"
                      value={item.id}
                      checked={form.mortgageType === item.id}
                      onChange={handleChange}
                      className="mr-2 accent-[#007E67]"
                    />
                    {item.value}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* HOA Fees (after new row) */}
          <div className="col-span-1 md:col-span-3 mt-2">
            <label className="block text-sm font-semibold mb-1">HOA Fees</label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-[#F3F3F3] border border-[#E5E7EB] rounded-l">$</span>
              <input 
                name="max_hoa_fees" 
                value={form.max_hoa_fees} 
                onChange={handleChange} 
                type="number" 
                className="w-full border border-[#E5E7EB] rounded-l-none rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E67]" 
                placeholder="Enter HOA fee"
                min="0"
              />
            </div>
          </div>
          {/* EXTERIOR */}
          <div className="flex flex-col gap-1">
            <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Exterior</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.exteriortype || []).map((item: {id: string | number, value: string}) => (
                <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                  <input
                    type="checkbox"
                    checked={isChecked('exterior', item.id)}
                    onChange={() => handleCheckbox('exterior', item)}
                    className="mr-2 accent-[#007E67]"
                  />
                  {item.value}
                </label>
              ))}
            </div>
          </div>
          {/* ROOF */}
          <div className="flex flex-col gap-1">
            <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Roof</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.rooftype || []).map((item: {id: string | number, value: string}) => (
                <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                  <input
                    type="checkbox"
                    checked={isChecked('roof', item.id)}
                    onChange={() => handleCheckbox('roof', item)}
                    className="mr-2 accent-[#007E67]"
                  />
                  {item.value}
                </label>
              ))}
            </div>
          </div>
          {/* PARKING */}
          <div className="flex flex-col gap-1">
            <div className="mb-1 uppercase text-left text-sm text-gray-600 font-normal">Parking</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {masterDataLoading ? <Skeleton variant="rectangular" width={210} height={60} /> : (masterData.parkingtype || []).map((item: {id: string | number, value: string}) => (
                <label key={item.id} className="flex items-center mb-1 text-sm text-gray-700 font-normal">
                  <input
                    type="checkbox"
                    checked={isChecked('parking', item.id)}
                    onChange={() => handleCheckbox('parking', item)}
                    className="mr-2 accent-[#007E67]"
                  />
                  {item.value}
                </label>
              ))}
            </div>
            <div className="mt-2 w-full">
              <label className="block text-xs font-semibold mb-1">Parking Spaces</label>
              <input name="parkingSpaces" value={form.parkingSpaces} onChange={handleChange} type="number" className="w-42 border border-[#E5E7EB] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#007E67]" />
            </div>
          </div>
        </div>
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        {!id && (
          <button
            onClick={async () => {
              // setLoading(true); // This line is removed as loading state is now managed by masterDataLoading
              await onSaveDraft(form);
              // setLoading(false); // This line is removed as loading state is now managed by masterDataLoading
            }}
            className="px-6 py-2 border border-[#007E67] rounded text-[#007E67] font-semibold bg-white hover:bg-[#F3F3F3]"
            disabled={masterDataLoading}
          >
            {masterDataLoading ? 'Saving...' : 'Save as draft'}
          </button>
        )}
        <button onClick={handleNext} className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90">Next</button>
      </div>
    </div>
  );
};

export default PropertyInfo; 