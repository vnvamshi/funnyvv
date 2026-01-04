import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileAddPropertyTabs from './MobileAddPropertyTabs';
import BottomSelectField from '../components/BottomSelectField';
import BottomModal from '../../../../../components/BottomModal';
import { MinusIcon, PlusIcon } from '../../../../../assets/icons/CommonIcons';
import { MobilePropertyWizardProvider, useMobilePropertyWizard, useMobilePropertyWizardStorage } from './MobilePropertyWizardContext';
import { useMasterData } from '../hooks/useMasterDataContext';
import Skeleton from '@mui/material/Skeleton';
// Inline skeleton loader for property details loading state
const PropertyDetailsSkeleton: React.FC = () => (
  <div className="bg-white min-h-screen flex flex-col animate-pulse">
    <div className="sticky top-0 z-30 bg-white flex items-center justify-between px-2 py-2 border-b border-gray-100">
      <div className="h-8 w-24 bg-gray-200 rounded" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    </div>
    <div className="relative mb-4">
      <div className="rounded-xl w-full h-[200px] bg-gray-200" />
    </div>
    <div className="mb-2 ml-3">
      <div className="h-7 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-5 w-1/2 bg-gray-200 rounded mb-1" />
      <div className="h-7 w-1/3 bg-gray-200 rounded" />
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4 px-2">
      <div className="bg-gray-200 rounded-2xl p-4 h-16" />
      <div className="bg-gray-200 rounded-2xl p-4 h-16" />
      <div className="bg-gray-200 rounded-2xl p-4 h-16" />
      <div className="bg-gray-200 rounded-2xl p-4 h-16" />
    </div>
    <div className="flex-1 px-3">
      <div className="h-5 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
    </div>
    <div className="sticky bottom-0 z-30 bg-white flex items-center justify-between px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] gap-2">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"></div>
        <div className="flex flex-col">
          <span className="font-bold text-green-900 text-sm">--</span>
          <span className="text-xs text-gray-500 block">--</span>
        </div>
      </div>
      <div className="h-8 w-24 bg-gray-200 rounded" />
    </div>
  </div>
);

// Options from desktop PropertyInfo.tsx
const lotSizeUnits = ['Sq. Ft.', 'Sq. M.', 'Acres'];
const homeTypes = ['Single family home', 'Multi family home', 'Condo', 'Townhouse', 'Villa'];
const yearBuiltOptions = Array.from({ length: 50 }, (_, i) => `${2024 - i}`);

interface MasterDataItem {
  id: string | number;
  value: string;
}

const PropertyInfoPageInner: React.FC = () => {
  // All hooks at the top!
  const { handlePropertyInfoBack, handlePropertyInfoSaveDraft, handlePropertyInfoNext, propertyInfoData: contextPropertyInfoData, isLoadingProperty, fetchPropertyData } = useMobilePropertyWizard();
  const navigate = useNavigate();
  const { getPropertyInfoData, clearAllData } = useMobilePropertyWizardStorage();
  const { masterData, loading: masterDataLoading, fetchMasterData } = useMasterData();
  const { id } = useParams();
  const { isSaving } = useMobilePropertyWizard();
  
  // Refs for form validation
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Debug: Check if context data is received
  console.log('PropertyInfoPage: Component rendered with id:', id);
  console.log('PropertyInfoPage: contextPropertyInfoData received:', contextPropertyInfoData);
  console.log('PropertyInfoPage: contextPropertyInfoData keys:', contextPropertyInfoData ? Object.keys(contextPropertyInfoData) : 'null');

  // Check if we need to fetch property data
  useEffect(() => {
    // If we have an ID but no property data, trigger API fetch
    if (id && (!contextPropertyInfoData || Object.keys(contextPropertyInfoData).length === 0)) {
      console.log('PropertyInfoPage: No property data found, triggering API fetch for ID:', id);
      fetchPropertyData(id);
    }
  }, [id, contextPropertyInfoData, fetchPropertyData]);

  // Helper to normalize arrays
  const normalizeArray = (arr: any[] = [], master: {id: string | number, value: string}[] = []) => {
    console.log('PropertyInfoPage: normalizeArray called with arr:', arr, 'master:', master);
    if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null && 'id' in arr[0] && 'value' in arr[0]) {
      console.log('PropertyInfoPage: normalizeArray - returning as is (already objects)');
      return arr;
    }
    if (arr.length > 0 && master.length > 0) {
      const normalized = arr.map((id: string | number) => {
        const found = master.find((item: {id: string | number, value: string}) => item.id === id);
        return found ? { id: found.id, value: found.value } : { id, value: '' };
      });
      console.log('PropertyInfoPage: normalizeArray - normalized result:', normalized);
      return normalized;
    }
    console.log('PropertyInfoPage: normalizeArray - returning empty array');
    return [];
  };

  // Helper to extract IDs from objects/arrays
  const extractIds = (arr: any) => Array.isArray(arr) ? arr.map((item: any) => item.id) : [];

  // State for propertyInfoData and form
  const [propertyInfoData, setPropertyInfoData] = useState<any>(() => {
    if (contextPropertyInfoData?.id) return contextPropertyInfoData;
    const storedData = getPropertyInfoData();
    return storedData && Object.keys(storedData).length > 0 ? storedData : contextPropertyInfoData;
  });
  // Separate state for building details (like PropertyAmenitiesPage)
  const [selectedBuildingRooms, setSelectedBuildingRooms] = useState<(string|number)[]>([]);
  const [selectedBasement, setSelectedBasement] = useState<(string|number)[]>([]);
  const [selectedFloorCovering, setSelectedFloorCovering] = useState<(string|number)[]>([]);
  const [selectedArchitecturalStyle, setSelectedArchitecturalStyle] = useState<(string|number)[]>([]);
  const [selectedExterior, setSelectedExterior] = useState<(string|number)[]>([]);
  const [selectedRoof, setSelectedRoof] = useState<(string|number)[]>([]);
  const [selectedParking, setSelectedParking] = useState<(string|number)[]>([]);
  
  // Property status, listing type, and mortgage type state variables
  const [selectedPropertyStatus, setSelectedPropertyStatus] = useState<(string|number)[]>([]);
  const [selectedListingType, setSelectedListingType] = useState<(string|number)[]>([]);
  const [selectedMortgageType, setSelectedMortgageType] = useState<string|number|null>(null);

  const [form, setForm] = useState<any>(() => {
    if (contextPropertyInfoData?.id) return { ...contextPropertyInfoData };
    const storedData = getPropertyInfoData();
    const base = {
      name: "",
      lotSize: null,
      lotSizeUnit: lotSizeUnits[0],
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
      buildingRooms: [],
      basement: [],
      floorCovering: [],
      architecturalStyle: [],
      exterior: [],
      roof: [],
      parking: [],
      totalRooms: null,
      parkingSpaces: null,
      propertyStatus: [],
      listingType: [],
      mortgageType: null,
      hoaSearch: '',
      max_hoa_fees: '',
      ...(storedData && Object.keys(storedData).length > 0 ? storedData : contextPropertyInfoData),
    };
    // Don't normalize arrays here - wait for master data to be loaded
    return base;
  });
  const [showAccordion, setShowAccordion] = useState(true);
  const [modalKey, setModalKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Add modalKey state for property info modals
  const [propertyInfoModalKey, setPropertyInfoModalKey] = useState<string | null>(null);

  // Always update form and propertyInfoData when contextPropertyInfoData changes
  useEffect(() => {
    if (contextPropertyInfoData && Object.keys(contextPropertyInfoData).length > 0) {
      console.log('PropertyInfoPage: contextPropertyInfoData changed:', contextPropertyInfoData);
      console.log('PropertyInfoPage: Building details data from context:', {
        buildingRooms: contextPropertyInfoData.buildingRooms,
        basement: contextPropertyInfoData.basement,
        basementTypes: contextPropertyInfoData.basementTypes,
        floorCovering: contextPropertyInfoData.floorCovering,
        floorCoverings: contextPropertyInfoData.floorCoverings,
        architecturalStyle: contextPropertyInfoData.architecturalStyle,
        architecturalStyles: contextPropertyInfoData.architecturalStyles,
        exterior: contextPropertyInfoData.exterior,
        exteriors: contextPropertyInfoData.exteriors,
        roof: contextPropertyInfoData.roof,
        roofs: contextPropertyInfoData.roofs,
        parking: contextPropertyInfoData.parking,
        parkings: contextPropertyInfoData.parkings,
      });
      setPropertyInfoData(contextPropertyInfoData);
      setForm((prev: typeof form) => ({
        ...contextPropertyInfoData,
        // Handle both old and new field names for building details
        buildingRooms: normalizeArray(contextPropertyInfoData.buildingRooms || contextPropertyInfoData.buildingRooms, masterData.roomtype || []),
        basement: normalizeArray(contextPropertyInfoData.basement || contextPropertyInfoData.basementTypes, masterData.basementtype || []),
        floorCovering: normalizeArray(contextPropertyInfoData.floorCovering || contextPropertyInfoData.floorCoverings, masterData.floorcovering || []),
        architecturalStyle: normalizeArray(contextPropertyInfoData.architecturalStyle || contextPropertyInfoData.architecturalStyles, masterData.architecturalstyle || []),
        exterior: normalizeArray(contextPropertyInfoData.exterior || contextPropertyInfoData.exteriors, masterData.exteriortype || []),
        roof: normalizeArray(contextPropertyInfoData.roof || contextPropertyInfoData.roofs, masterData.rooftype || []),
        parking: normalizeArray(contextPropertyInfoData.parking || contextPropertyInfoData.parkings, masterData.parkingtype || []),
      }));

      // Also set the selected states for building details
      const normalizeAmenityData = (data: any) => {
        if (!data || !Array.isArray(data)) return [];
        if (data.length === 0) return [];
        // If first item is an object with id property, extract ids
        if (typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]) {
          return data.map((item: any) => item.id);
        }
        // If array contains only IDs, return them directly
        return data;
      };

      setSelectedBuildingRooms(normalizeAmenityData(contextPropertyInfoData.buildingRooms));
      setSelectedBasement(normalizeAmenityData(contextPropertyInfoData.basement || contextPropertyInfoData.basementTypes));
      setSelectedFloorCovering(normalizeAmenityData(contextPropertyInfoData.floorCovering || contextPropertyInfoData.floorCoverings));
      setSelectedArchitecturalStyle(normalizeAmenityData(contextPropertyInfoData.architecturalStyle || contextPropertyInfoData.architecturalStyles));
      setSelectedExterior(normalizeAmenityData(contextPropertyInfoData.exterior || contextPropertyInfoData.exteriors));
      setSelectedRoof(normalizeAmenityData(contextPropertyInfoData.roof || contextPropertyInfoData.roofs));
      setSelectedParking(normalizeAmenityData(contextPropertyInfoData.parking || contextPropertyInfoData.parkings));
    }
  }, [contextPropertyInfoData, masterData]);

  // Separate effect for property status, listing type, and mortgage type
  useEffect(() => {
    if (contextPropertyInfoData && Object.keys(contextPropertyInfoData).length > 0) {
      console.log('PropertyInfoPage: Setting property status, listing type, mortgage type from context:', contextPropertyInfoData);
      console.log('PropertyInfoPage: Raw property_statuses:', contextPropertyInfoData.property_statuses);
      console.log('PropertyInfoPage: Raw listing_types:', contextPropertyInfoData.listing_types);
      console.log('PropertyInfoPage: Raw mortgage_types:', contextPropertyInfoData.mortgage_types);
      console.log('PropertyInfoPage: property_statuses type:', typeof contextPropertyInfoData.property_statuses);
      console.log('PropertyInfoPage: property_statuses isArray:', Array.isArray(contextPropertyInfoData.property_statuses));
      console.log('PropertyInfoPage: property_statuses length:', contextPropertyInfoData.property_statuses?.length);
      if (contextPropertyInfoData.property_statuses && contextPropertyInfoData.property_statuses.length > 0) {
        console.log('PropertyInfoPage: First property_status item:', contextPropertyInfoData.property_statuses[0]);
        console.log('PropertyInfoPage: First property_status item type:', typeof contextPropertyInfoData.property_statuses[0]);
        console.log('PropertyInfoPage: First property_status item keys:', Object.keys(contextPropertyInfoData.property_statuses[0]));
      }
      
      // Extract IDs from the context structure {id, value} (not {id, name})
      const statusIds = Array.isArray(contextPropertyInfoData.property_statuses)
        ? contextPropertyInfoData.property_statuses.map((item: any) => item.id)
        : [];
      const listingIds = Array.isArray(contextPropertyInfoData.listing_types)
        ? contextPropertyInfoData.listing_types.map((item: any) => item.id)
        : [];
      const mortgageId = Array.isArray(contextPropertyInfoData.mortgage_types) && contextPropertyInfoData.mortgage_types.length > 0
        ? contextPropertyInfoData.mortgage_types[0].id
        : null;
      
      console.log('PropertyInfoPage: Extracted IDs - statusIds:', statusIds, 'listingIds:', listingIds, 'mortgageId:', mortgageId);
      
      setSelectedPropertyStatus(statusIds);
      setSelectedListingType(listingIds);
      setSelectedMortgageType(mortgageId);
      
      console.log('PropertyInfoPage: selectedPropertyStatus set to:', statusIds);
      console.log('PropertyInfoPage: selectedListingType set to:', listingIds);
      console.log('PropertyInfoPage: selectedMortgageType set to:', mortgageId);
    }
  }, [contextPropertyInfoData]);

  // Always overwrite form state for these fields on API load
  useEffect(() => {
    if (contextPropertyInfoData && Object.keys(contextPropertyInfoData).length > 0) {
      setForm((prev: any) => ({
        ...prev,
        propertyStatus: Array.isArray(contextPropertyInfoData.property_statuses)
          ? contextPropertyInfoData.property_statuses.map((item: any) => item.id)
          : [],
        listingType: Array.isArray(contextPropertyInfoData.listing_types)
          ? contextPropertyInfoData.listing_types.map((item: any) => item.id)
          : [],
        mortgageType: Array.isArray(contextPropertyInfoData.mortgage_types) && contextPropertyInfoData.mortgage_types.length > 0
          ? contextPropertyInfoData.mortgage_types[0].id
          : '',
        max_hoa_fees: contextPropertyInfoData.max_hoa_fees || '',
      }));
    }
  }, [contextPropertyInfoData]);

  useEffect(() => {
    fetchMasterData(['roomtype', 'basementtype', 'floorcovering', 'architecturalstyle', 'exteriortype', 'rooftype', 'parkingtype', 'propertystatus', 'listingtype', 'mortgagetype']);
  }, [fetchMasterData]);

  // Normalize building details when master data is loaded
  useEffect(() => {
    if (masterData && Object.keys(masterData).length > 0 && !masterDataLoading) {
      console.log('PropertyInfoPage: Normalizing building details with master data:', masterData);
      console.log('PropertyInfoPage: Master data keys:', Object.keys(masterData));
      console.log('PropertyInfoPage: Master data samples:', {
        roomtype: masterData.roomtype?.slice(0, 3),
        basementtype: masterData.basementtype?.slice(0, 3),
        floorcovering: masterData.floorcovering?.slice(0, 3),
        architecturalstyle: masterData.architecturalstyle?.slice(0, 3),
        exteriortype: masterData.exteriortype?.slice(0, 3),
        rooftype: masterData.rooftype?.slice(0, 3),
        parkingtype: masterData.parkingtype?.slice(0, 3),
      });
      setForm((prev: any) => ({
        ...prev,
        buildingRooms: normalizeArray(prev.buildingRooms || prev.buildingRooms, masterData.roomtype || []),
        basement: normalizeArray(prev.basement || prev.basementTypes, masterData.basementtype || []),
        floorCovering: normalizeArray(prev.floorCovering || prev.floorCoverings, masterData.floorcovering || []),
        architecturalStyle: normalizeArray(prev.architecturalStyle || prev.architecturalStyles, masterData.architecturalstyle || []),
        exterior: normalizeArray(prev.exterior || prev.exteriors, masterData.exteriortype || []),
        roof: normalizeArray(prev.roof || prev.roofs, masterData.rooftype || []),
        parking: normalizeArray(prev.parking || prev.parkings, masterData.parkingtype || []),
      }));
    }
  }, [masterData, masterDataLoading]);

  // Re-set property status, listing type, mortgage type when master data loads
  useEffect(() => {
    if (masterData && Object.keys(masterData).length > 0 && !masterDataLoading && contextPropertyInfoData && Object.keys(contextPropertyInfoData).length > 0) {
      console.log('PropertyInfoPage: Master data loaded, re-setting property status, listing type, mortgage type');
      
      // Re-set property status, listing type, mortgage type from context data
      const statusIds = Array.isArray(contextPropertyInfoData.property_statuses)
        ? contextPropertyInfoData.property_statuses.map((item: any) => item.id)
        : [];
      const listingIds = Array.isArray(contextPropertyInfoData.listing_types)
        ? contextPropertyInfoData.listing_types.map((item: any) => item.id)
        : [];
      const mortgageId = Array.isArray(contextPropertyInfoData.mortgage_types) && contextPropertyInfoData.mortgage_types.length > 0
        ? contextPropertyInfoData.mortgage_types[0].id
        : null;
      
      console.log('PropertyInfoPage: Re-setting - statusIds:', statusIds, 'listingIds:', listingIds, 'mortgageId:', mortgageId);
      
      setSelectedPropertyStatus(statusIds);
      setSelectedListingType(listingIds);
      setSelectedMortgageType(mortgageId);
    }
  }, [masterData, masterDataLoading, contextPropertyInfoData]);

  // Debug form state changes
  useEffect(() => {
    console.log('PropertyInfoPage: form state updated:', {
      buildingRooms: form.buildingRooms,
      basement: form.basement,
      floorCovering: form.floorCovering,
      architecturalStyle: form.architecturalStyle,
      exterior: form.exterior,
      roof: form.roof,
      parking: form.parking,
      propertyStatus: form.propertyStatus,
      listingType: form.listingType,
      mortgageType: form.mortgageType,
      max_hoa_fees: form.max_hoa_fees,
    });
  }, [form.buildingRooms, form.basement, form.floorCovering, form.architecturalStyle, form.exterior, form.roof, form.parking, form.propertyStatus, form.listingType, form.mortgageType, form.max_hoa_fees]);

  // Debug selected states
  useEffect(() => {
    console.log('PropertyInfoPage: selected states updated:', {
      selectedBuildingRooms,
      selectedBasement,
      selectedFloorCovering,
      selectedArchitecturalStyle,
      selectedExterior,
      selectedRoof,
      selectedParking,
      selectedPropertyStatus,
      selectedListingType,
      selectedMortgageType,
    });
    console.log('PropertyInfoPage: selectedPropertyStatus length:', selectedPropertyStatus?.length);
    console.log('PropertyInfoPage: selectedListingType length:', selectedListingType?.length);
    console.log('PropertyInfoPage: selectedMortgageType value:', selectedMortgageType);
  }, [selectedBuildingRooms, selectedBasement, selectedFloorCovering, selectedArchitecturalStyle, selectedExterior, selectedRoof, selectedParking, selectedPropertyStatus, selectedListingType, selectedMortgageType]);



  // Only after all hooks:
  if (isLoadingProperty) {
    return <PropertyDetailsSkeleton />;
  }

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
      nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (errors.sellingPrice && priceRef.current) {
      priceRef.current.focus();
      priceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return Object.keys(errors).length === 0;
  };

  const handleCheckbox = (sectionKey: string, value: {id: string | number, value: string}) => {
    console.log(`PropertyInfoPage: handleCheckbox called for ${sectionKey} with value:`, value);
    const setSelected = BUILDING_SECTIONS.find(s => s.key === sectionKey)?.setSelected;
    if (setSelected) {
      setSelected((prev: (string|number)[]) => {
        // For architectural style and basement, make it single select
        if (sectionKey === 'architecturalStyle' || sectionKey === 'basement') {
          const newSelected = [value.id]; // Only allow one selection
          console.log(`PropertyInfoPage: ${sectionKey} updated from`, prev, 'to', newSelected);
          return newSelected;
        } else {
          // For other fields, keep multi-select behavior
          const newSelected = prev.includes(value.id)
            ? prev.filter(id => id !== value.id)
            : [...prev, value.id];
          console.log(`PropertyInfoPage: ${sectionKey} updated from`, prev, 'to', newSelected);
          return newSelected;
        }
      });
    }
  };

  const isChecked = (sectionKey: string, id: string | number) => {
    const selected = BUILDING_SECTIONS.find(s => s.key === sectionKey)?.selected;
    return selected ? selected.includes(id) : false;
  };

  // Building sections array (like PropertyAmenitiesPage)
  const BUILDING_SECTIONS = [
    { key: 'buildingRooms', label: 'ROOMS', options: masterData.roomtype || [], selected: selectedBuildingRooms, setSelected: setSelectedBuildingRooms },
    { key: 'basement', label: 'BASEMENT', options: masterData.basementtype || [], selected: selectedBasement, setSelected: setSelectedBasement },
    { key: 'floorCovering', label: 'FLOOR COVERING', options: masterData.floorcovering || [], selected: selectedFloorCovering, setSelected: setSelectedFloorCovering },
    { key: 'architecturalStyle', label: 'ARCHITECTURAL STYLE', options: masterData.architecturalstyle || [], selected: selectedArchitecturalStyle, setSelected: setSelectedArchitecturalStyle },
    { key: 'exterior', label: 'EXTERIOR', options: masterData.exteriortype || [], selected: selectedExterior, setSelected: setSelectedExterior },
    { key: 'roof', label: 'ROOF', options: masterData.rooftype || [], selected: selectedRoof, setSelected: setSelectedRoof },
    { key: 'parking', label: 'PARKING', options: masterData.parkingtype || [], selected: selectedParking, setSelected: setSelectedParking },
  ];

  const getSummary = (name: string) => {
    const arr = form[name] as {id: string | number, value: string}[];
    if (!arr || arr.length === 0) return '0';
    if (arr.length === 1) return arr[0].value;
    return arr.slice(0, 2).map((item: {id: string | number, value: string}) => item.value).join(', ') + (arr.length > 2 ? ` +${arr.length - 2}` : '');
  };

  // In handleBack, handleSaveDraft, handleNext, always include propertyStatus, listingType, mortgageType from dedicated state
  const handleBack = () => {
    // Convert selected IDs back to objects with names using master data
    const convertIdsToObjects = (ids: (string|number)[], masterDataKey: string) => {
      return ids.map(id => {
        const found = masterData[masterDataKey]?.find((item: any) => item.id === id);
        return found ? { id: found.id, value: found.value } : { id, value: 'Unknown' };
      });
    };

    const updatedForm = {
      ...form,
      // Map building details to both old and new field names for compatibility
      buildingRooms: convertIdsToObjects(selectedBuildingRooms, 'roomtype'),
      basement: convertIdsToObjects(selectedBasement, 'basementtype'),
      floorCovering: convertIdsToObjects(selectedFloorCovering, 'floorcovering'),
      architecturalStyle: convertIdsToObjects(selectedArchitecturalStyle, 'architecturalstyle'),
      exterior: convertIdsToObjects(selectedExterior, 'exteriortype'),
      roof: convertIdsToObjects(selectedRoof, 'rooftype'),
      parking: convertIdsToObjects(selectedParking, 'parkingtype'),
      // Also map to the API field names used in desktop
      basementTypes: convertIdsToObjects(selectedBasement, 'basementtype'),
      floorCoverings: convertIdsToObjects(selectedFloorCovering, 'floorcovering'),
      architecturalStyles: convertIdsToObjects(selectedArchitecturalStyle, 'architecturalstyle'),
      exteriors: convertIdsToObjects(selectedExterior, 'exteriortype'),
      roofs: convertIdsToObjects(selectedRoof, 'rooftype'),
      parkings: convertIdsToObjects(selectedParking, 'parkingtype'),
      // Persist propertyStatus, listingType, mortgageType
      propertyStatus: selectedPropertyStatus,
      listingType: selectedListingType,
      mortgageType: selectedMortgageType,
    };
    setPropertyInfoData(updatedForm);
    handlePropertyInfoBack(updatedForm);
  };

  const handleSaveDraft = () => {
    setLoading(true);
    // Convert selected IDs back to objects with names using master data
    const convertIdsToObjects = (ids: (string|number)[], masterDataKey: string) => {
      return ids.map(id => {
        const found = masterData[masterDataKey]?.find((item: any) => item.id === id);
        return found ? { id: found.id, value: found.value } : { id, value: 'Unknown' };
      });
    };

    const updatedForm = {
      ...form,
      // Map building details to both old and new field names for compatibility
      buildingRooms: convertIdsToObjects(selectedBuildingRooms, 'roomtype'),
      basement: convertIdsToObjects(selectedBasement, 'basementtype'),
      floorCovering: convertIdsToObjects(selectedFloorCovering, 'floorcovering'),
      architecturalStyle: convertIdsToObjects(selectedArchitecturalStyle, 'architecturalstyle'),
      exterior: convertIdsToObjects(selectedExterior, 'exteriortype'),
      roof: convertIdsToObjects(selectedRoof, 'rooftype'),
      parking: convertIdsToObjects(selectedParking, 'parkingtype'),
      // Also map to the API field names used in desktop
      basementTypes: convertIdsToObjects(selectedBasement, 'basementtype'),
      floorCoverings: convertIdsToObjects(selectedFloorCovering, 'floorcovering'),
      architecturalStyles: convertIdsToObjects(selectedArchitecturalStyle, 'architecturalstyle'),
      exteriors: convertIdsToObjects(selectedExterior, 'exteriortype'),
      roofs: convertIdsToObjects(selectedRoof, 'rooftype'),
      parkings: convertIdsToObjects(selectedParking, 'parkingtype'),
      // Persist propertyStatus, listingType, mortgageType
      propertyStatus: selectedPropertyStatus,
      listingType: selectedListingType,
      mortgageType: selectedMortgageType,
      id: propertyInfoData?.id // Ensure id is present if editing
    };
    setPropertyInfoData(updatedForm);
    // Call saveProperty with the merged data (not the old context)
    handlePropertyInfoSaveDraft(updatedForm);
    setLoading(false);
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    
    console.log('PropertyInfoPage: handleNext called');
    console.log('PropertyInfoPage: selectedPropertyStatus:', selectedPropertyStatus);
    console.log('PropertyInfoPage: selectedListingType:', selectedListingType);
    console.log('PropertyInfoPage: selectedMortgageType:', selectedMortgageType);
    
    // Convert selected IDs back to objects with names using master data
    const convertIdsToObjects = (ids: (string|number)[], masterDataKey: string) => {
      return ids.map(id => {
        const found = masterData[masterDataKey]?.find((item: any) => item.id === id);
        return found ? { id: found.id, value: found.value } : { id, value: 'Unknown' };
      });
    };

    const updatedForm = {
      ...form,
      // Map building details to both old and new field names for compatibility
      buildingRooms: convertIdsToObjects(selectedBuildingRooms, 'roomtype'),
      basement: convertIdsToObjects(selectedBasement, 'basementtype'),
      floorCovering: convertIdsToObjects(selectedFloorCovering, 'floorcovering'),
      architecturalStyle: convertIdsToObjects(selectedArchitecturalStyle, 'architecturalstyle'),
      exterior: convertIdsToObjects(selectedExterior, 'exteriortype'),
      roof: convertIdsToObjects(selectedRoof, 'rooftype'),
      parking: convertIdsToObjects(selectedParking, 'parkingtype'),
      // Also map to the API field names used in desktop
      basementTypes: convertIdsToObjects(selectedBasement, 'basementtype'),
      floorCoverings: convertIdsToObjects(selectedFloorCovering, 'floorcovering'),
      architecturalStyles: convertIdsToObjects(selectedArchitecturalStyle, 'architecturalstyle'),
      exteriors: convertIdsToObjects(selectedExterior, 'exteriortype'),
      roofs: convertIdsToObjects(selectedRoof, 'rooftype'),
      parkings: convertIdsToObjects(selectedParking, 'parkingtype'),
      // Persist propertyStatus, listingType, mortgageType
      propertyStatus: selectedPropertyStatus,
      listingType: selectedListingType,
      mortgageType: selectedMortgageType,
    };
    
    console.log('PropertyInfoPage: updatedForm being passed:', updatedForm);
    console.log('PropertyInfoPage: propertyStatus in updatedForm:', updatedForm.propertyStatus);
    
    setPropertyInfoData(updatedForm);
    handlePropertyInfoNext(updatedForm);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Spinner overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-30 bg-white flex flex-col shadow-md">
        <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
          <button
            className="mr-2 p-2 -ml-2"
            onClick={handlePropertyInfoBack}
            aria-label="Back"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-green-900 text-2xl font-bold">{contextPropertyInfoData?.id ? 'Update Property' : 'Add Property'}</span>
        </div>
        <MobileAddPropertyTabs currentStep={1} />
      </div>
      {/* Main Content with padding for header and footer */}
      <div className="flex flex-col px-6 pt-32 pb-32">
        <div className="text-3xl font-bold text-[#222] mb-2">Add your property details</div>
        <div className="text-base text-[#222] mb-6">{form.address}, {form.city_detail?.name}, {form.state_detail?.name}, {form.country_detail?.name}, {form.postalCode}</div>
        <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{form.propertyType?.name}</span></div>
        <div className="border-b border-[#E5E7EB] mb-8" />
        
        {/* Name */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Name <span className="text-red-500">*</span></label>
          <input
            ref={nameRef}
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg text-lg bg-white ${validationErrors.name ? 'border-red-500' : ''}`}
            placeholder="Enter property name"
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>
        {/* Lot Size */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Lot Size</label>
          <div className="flex gap-2">
            <input
              name="lotSize"
              value={form.lotSize}
              onChange={handleChange}
              type="number"
              className={`w-full p-4 border rounded-lg text-lg bg-white ${validationErrors.lotSize ? 'border-red-500' : ''}`}
              placeholder=""
            />
            <select
              name="lotSizeUnit"
              value={form.lotSizeUnit}
              onChange={handleChange}
              className="border p-4 rounded-lg text-lg bg-white"
            >
              {lotSizeUnits.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          {validationErrors.lotSize && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.lotSize}</p>
          )}
        </div>
        {/* Total Sqft */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Total sq. ft.</label>
          <div className="flex gap-2">
            <input
              name="totalSqft"
              value={form.totalSqft}
              onChange={handleChange}
              type="number"
              className={`w-full p-4 border rounded-lg text-lg bg-white ${validationErrors.totalSqft ? 'border-red-500' : ''}`}
              placeholder=""
            />
            <select
              name="totalSqftUnit"
              value={form.totalSqftUnit}
              onChange={handleChange}
              disabled
              className="border p-4 rounded-lg text-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              <option>Sq. Ft.</option>
            </select>
          </div>
          {validationErrors.totalSqft && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.totalSqft}</p>
          )}
        </div>
        {/* Basement Sqft */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Basement sq. ft.</label>
          <div className="flex gap-2">
            <input
              name="basementSqft"
              value={form.basementSqft}
              onChange={handleChange}
              type="number"
              className={`w-full p-4 border rounded-lg text-lg bg-white ${validationErrors.basementSqft ? 'border-red-500' : ''}`}
              placeholder=""
            />
            <select
              name="basementSqftUnit"
              value={form.basementSqftUnit}
              onChange={handleChange}
              disabled
              className="border p-4 rounded-lg text-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              <option>Sq. Ft.</option>
            </select>
          </div>
          {validationErrors.basementSqft && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.basementSqft}</p>
          )}
        </div>
        {/* Bedrooms */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Bedrooms</label>
          <input
            name="bedrooms"
            value={form.bedrooms}
            onChange={handleChange}
            type="number"
            className={`w-full p-4 border rounded-lg text-lg bg-white ${validationErrors.bedrooms ? 'border-red-500' : ''}`}
            placeholder=""
          />
          {validationErrors.bedrooms && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.bedrooms}</p>
          )}
        </div>
        {/* Full Bathrooms */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Full Bathrooms</label>
          <input
            name="fullBathrooms"
            value={form.fullBathrooms}
            onChange={handleChange}
            type="number"
            className={`w-full p-4 border rounded-lg text-lg bg-white ${validationErrors.fullBathrooms ? 'border-red-500' : ''}`}
            placeholder=""
          />
          {validationErrors.fullBathrooms && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.fullBathrooms}</p>
          )}
        </div>
        {/* Half Bathrooms */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Half Bathrooms</label>
          <input
            name="halfBathrooms"
            value={form.halfBathrooms}
            onChange={handleChange}
            type="number"
            className={`w-full p-4 border rounded-lg text-lg bg-white ${validationErrors.halfBathrooms ? 'border-red-500' : ''}`}
            placeholder=""
          />
          {validationErrors.halfBathrooms && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.halfBathrooms}</p>
          )}
        </div>
        {/* Selling Price */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Selling Price <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <span className="px-4 py-4 bg-[#F3F3F3] border border-[#E5E7EB] rounded-l text-lg">$</span>
            <input
              ref={priceRef}
              name="sellingPrice"
              value={form.sellingPrice}
              onChange={handleChange}
              type="number"
              className={`w-full border ${validationErrors.sellingPrice ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-l-none rounded-r px-4 py-4 text-lg bg-white`}
              placeholder="Enter selling price"
            />
          </div>
          {validationErrors.sellingPrice && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.sellingPrice}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Details</label>
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            className="w-full border rounded-lg text-lg bg-white min-h-[100px] p-4"
            placeholder="Write about the property"
          />
        </div>

        {/* Property Status, Listing Type, Mortgage Type */}
        <div className="mb-4">
          <div className="text-xl font-bold mb-4">Property Information</div>
          {/* Property Status */}
          <div className="flex items-center justify-between border rounded-lg px-4 py-4 bg-white cursor-pointer mb-4" onClick={() => setPropertyInfoModalKey('propertyStatus')}>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-white text-base font-normal" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}>
                {selectedPropertyStatus?.length || 0}
              </span>
              <span className="font-semibold">Property Status</span>
            </div>
            <span className="text-green-900 text-xl">→</span>
          </div>
          {/* Listing Type */}
          <div className="flex items-center justify-between border rounded-lg px-4 py-4 bg-white cursor-pointer mb-4" onClick={() => setPropertyInfoModalKey('listingType')}>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-white text-base font-normal" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}>
                {selectedListingType?.length || 0}
              </span>
              <span className="font-semibold">Listing Type</span>
            </div>
            <span className="text-green-900 text-xl">→</span>
          </div>
          {/* Mortgage Type */}
          <div className="flex items-center justify-between border rounded-lg px-4 py-4 bg-white cursor-pointer mb-4" onClick={() => setPropertyInfoModalKey('mortgageType')}>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-white text-base font-normal" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}>
                {selectedMortgageType ? 1 : 0}
              </span>
              <span className="font-semibold">Mortgage Type</span>
            </div>
            <span className="text-green-900 text-xl">→</span>
          </div>
          {/* HOA */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">HOA</label>
            <input
              type="number"
              name="max_hoa_fees"
              placeholder="Enter HOA fee"
              value={form.max_hoa_fees ?? ''}
              onChange={e => {
                const value = e.target.value;
                setForm((prev: any) => ({ ...prev, hoaSearch: value, max_hoa_fees: value }));
              }}
              className="w-full p-4 border rounded-lg text-lg bg-white"
              min="0"
            />
          </div>
        </div>

        {/* Building Details Accordion */}
        <div className="mb-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAccordion(v => !v)}>
            <div className="text-xl font-bold">Building Details</div>
            {showAccordion ? <MinusIcon /> : <PlusIcon />}
          </div>
          {showAccordion && (
            <div className="flex flex-col gap-2 mt-4">
              {BUILDING_SECTIONS.map((detail, idx) => (
                <React.Fragment key={detail.key}>
                  <div className="flex items-center justify-between border rounded-lg px-4 py-4 bg-white cursor-pointer" onClick={() => setModalKey(detail.key)}>
                    <div className="flex items-center gap-2">
                      {/* Chosen count badge (gradient, count only) */}
                      <span className="px-3 py-1 rounded-full text-white text-base font-normal" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}>
                        {(() => {
                          const count = detail.selected.length;
                          console.log(`PropertyInfoPage: ${detail.key} count:`, count, 'data:', detail.selected);
                          return count;
                        })()}
                      </span>
                      <span className="font-semibold">{detail.label}</span>
                    </div>
                    <span className="text-green-900 text-xl">→</span>
                  </div>
                  {/* Insert Total Rooms input after ARCHITECTURAL STYLE */}
                  {detail.key === 'architecturalStyle' && (
                    <div className="mb-4 mt-2">
                      <label className="block mb-2 font-semibold">Total Rooms</label>
                      <input
                        name="totalRooms"
                        value={form.totalRooms ?? ''}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-lg text-lg bg-white"
                        placeholder="Total Rooms"
                        type="number"
                        min="0"
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        {/* Parking Spaces */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Parking Spaces</label>
          <input
            name="parkingSpaces"
            value={form.parkingSpaces ?? ''}
            onChange={handleChange}
            className="w-full p-4 border rounded-lg text-lg bg-white"
            placeholder="Parking Spaces"
            type="number"
            min="0"
          />
        </div>

        {/* Footer Buttons */}
        {/* This div is now fixed at the bottom */}
      </div>

      {/* Fixed Bottom Footer */}
      <div className="fixed bottom-0 left-0 w-full z-30 bg-white border-t flex gap-4 px-6 py-4">
        <button 
          className="flex-1 py-3 rounded-lg font-bold text-lg border-2 border-green-900 text-green-900 bg-white"
          onClick={handleSaveDraft}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save as draft'}
        </button>
        <button 
          className="gradient-btn-equal flex-1 py-3 rounded-lg font-bold text-lg shadow-lg"
          onClick={handleNext}
        >
          Next
        </button>
      </div>

      {/* BottomModal for building details multi-select */}
      {modalKey && BUILDING_SECTIONS.some(d => d.key === modalKey) && (
        <BottomModal
          open={!!modalKey}
          title={BUILDING_SECTIONS.find(d => d.key === modalKey)?.label}
          onCancel={() => setModalKey(null)}
          onSubmit={() => setModalKey(null)}
          submitLabel="Select"
        >
          {(() => {
            console.log(`PropertyInfoPage: Modal opened for ${modalKey}`);
            console.log(`PropertyInfoPage: Current form state for ${modalKey}:`, form[modalKey]);
            console.log(`PropertyInfoPage: Master data for ${modalKey}:`, masterData[modalKey === 'buildingRooms' ? 'roomtype' : modalKey === 'basement' ? 'basementtype' : modalKey === 'floorCovering' ? 'floorcovering' : modalKey === 'architecturalStyle' ? 'architecturalstyle' : modalKey === 'exterior' ? 'exteriortype' : modalKey === 'roof' ? 'rooftype' : 'parkingtype']);
            return null;
          })()}
          {masterDataLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
            </div>
          ) : (
            (() => {
              const options = BUILDING_SECTIONS.find(d => d.key === modalKey)?.options || [];
              console.log(`PropertyInfoPage: Modal options for ${modalKey}:`, options);
              console.log(`PropertyInfoPage: Current form state for ${modalKey}:`, form[modalKey]);
              if (!options.length) {
                return <div className="text-center text-gray-400 py-8">No options available</div>;
              }
              return (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {options.map(opt => (
                    <label key={modalKey + '-' + opt.id} className="flex items-center gap-2 py-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked(modalKey, opt.id)}
                        onChange={() => {
                          console.log(`PropertyInfoPage: Checkbox clicked for ${modalKey} with option:`, opt);
                          handleCheckbox(modalKey, opt);
                        }}
                        className="sr-only peer"
                        id={`custom-checkbox-${modalKey}-${opt.id}`}
                      />
                      <span
                        className="w-5 h-5 rounded border border-[#007E67] flex items-center justify-center peer-checked:bg-[linear-gradient(111.83deg,_#004236_11.73%,_#007E67_96.61%)] bg-white transition-colors duration-200"
                        style={{
                          background: isChecked(modalKey, opt.id)
                            ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                            : '#fff',
                          borderColor: '#007E67',
                        }}
                        tabIndex={0}
                        aria-checked={isChecked(modalKey, opt.id)}
                        role="checkbox"
                      >
                        {isChecked(modalKey, opt.id) && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-base font-normal">{opt.value}</span>
                    </label>
                  ))}
                </div>
              );
            })()
          )}
        </BottomModal>
      )}
      {propertyInfoModalKey === 'propertyStatus' && (
        <BottomModal
          open={true}
          title="Select Property Status"
          onCancel={() => setPropertyInfoModalKey(null)}
          onSubmit={() => setPropertyInfoModalKey(null)}
          submitLabel="Select"
        >
          {masterDataLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(masterData.propertystatus || []).map((item: any) => {
                const isChecked = selectedPropertyStatus.some(id => String(id) === String(item.id));
                console.log(`PropertyInfoPage: Property Status checkbox for ${item.value} (${item.id}) - checked: ${isChecked}, selectedPropertyStatus:`, selectedPropertyStatus, 'item.id type:', typeof item.id);
                return (
                  <label key={item.id} className="flex items-center gap-2 py-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        // For property status, make it single select like architectural style
                        setSelectedPropertyStatus([item.id]); // Only allow one selection
                      }}
                      className="sr-only peer"
                      id={`property-status-modal-${item.id}`}
                    />
                    <span
                      className="w-5 h-5 rounded border border-[#007E67] flex items-center justify-center peer-checked:bg-[linear-gradient(111.83deg,_#004236_11.73%,_#007E67_96.61%)] bg-white transition-colors duration-200"
                      style={{
                        background: isChecked
                          ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                          : '#fff',
                        borderColor: '#007E67',
                      }}
                      tabIndex={0}
                      aria-checked={isChecked}
                      role="checkbox"
                    >
                      {isChecked && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-base font-normal">{item.value}</span>
                  </label>
                );
              })}
            </div>
          )}
        </BottomModal>
      )}
      {propertyInfoModalKey === 'listingType' && (
        <BottomModal
          open={true}
          title="Select Listing Type"
          onCancel={() => setPropertyInfoModalKey(null)}
          onSubmit={() => setPropertyInfoModalKey(null)}
          submitLabel="Select"
        >
          {masterDataLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(masterData.listingtype || []).map((item: any) => {
                const isChecked = selectedListingType.some(id => String(id) === String(item.id));
                console.log(`PropertyInfoPage: Listing Type checkbox for ${item.value} (${item.id}) - checked: ${isChecked}, selectedListingType:`, selectedListingType, 'item.id type:', typeof item.id);
                return (
                  <label key={item.id} className="flex items-center gap-2 py-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setSelectedListingType((prev: (string | number)[]): (string | number)[] => {
                          return prev.some(id => String(id) === String(item.id))
                            ? prev.filter((id: string | number) => String(id) !== String(item.id))
                            : [...prev, item.id];
                        });
                      }}
                      className="sr-only peer"
                      id={`listing-type-modal-${item.id}`}
                    />
                    <span
                      className="w-5 h-5 rounded border border-[#007E67] flex items-center justify-center peer-checked:bg-[linear-gradient(111.83deg,_#004236_11.73%,_#007E67_96.61%)] bg-white transition-colors duration-200"
                      style={{
                        background: isChecked
                          ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                          : '#fff',
                        borderColor: '#007E67',
                      }}
                      tabIndex={0}
                      aria-checked={isChecked}
                      role="checkbox"
                    >
                      {isChecked && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-base font-normal">{item.value}</span>
                  </label>
                );
              })}
            </div>
          )}
        </BottomModal>
      )}
      {propertyInfoModalKey === 'mortgageType' && (
        <BottomModal
          open={true}
          title="Select Mortgage Type"
          onCancel={() => setPropertyInfoModalKey(null)}
          onSubmit={() => setPropertyInfoModalKey(null)}
          submitLabel="Select"
        >
          {masterDataLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(masterData.mortgagetype || []).map((item: any) => {
                const isChecked = String(selectedMortgageType) === String(item.id);
                console.log(`PropertyInfoPage: Mortgage Type radio for ${item.value} (${item.id}) - checked: ${isChecked}, selectedMortgageType:`, selectedMortgageType, 'item.id type:', typeof item.id);
                return (
                  <label key={item.id} className="flex items-center gap-2 py-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="mortgageType"
                      checked={isChecked}
                      onChange={() => setSelectedMortgageType(item.id)}
                      className="sr-only peer"
                      id={`mortgage-type-modal-${item.id}`}
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-[#007E67] flex items-center justify-center peer-checked:bg-[linear-gradient(111.83deg,_#004236_11.73%,_#007E67_96.61%)] bg-white transition-colors duration-200"
                      style={{
                        background: isChecked
                          ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                          : '#fff',
                        borderColor: '#007E67',
                      }}
                      tabIndex={0}
                      aria-checked={isChecked}
                      role="radio"
                    >
                      {isChecked && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="7" cy="7" r="4" fill="white" />
                        </svg>
                      )}
                    </span>
                    <span className="text-base font-normal">{item.value}</span>
                  </label>
                );
              })}
            </div>
          )}
        </BottomModal>
      )}
    </div>
  );
};

const PropertyInfoPage: React.FC = () => (
  <MobilePropertyWizardProvider>
    <PropertyInfoPageInner />
  </MobilePropertyWizardProvider>
);

export default PropertyInfoPage; 