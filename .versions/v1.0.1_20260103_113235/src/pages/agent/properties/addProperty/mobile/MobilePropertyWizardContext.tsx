/**
 * MobilePropertyWizardContext with localStorage persistence
 * 
 * This context provides centralized state management for the mobile property listing flow
 * with automatic localStorage persistence to ensure data consistency across:
 * - Component re-renders
 * - Page refreshes
 * - Browser sessions
 * - Navigation between steps
 * 
 * Features:
 * - Automatic data persistence to localStorage
 * - Data restoration on context initialization
 * - Utility functions for data management
 * - Error handling for localStorage operations
 * 
 * Usage:
 * 1. Wrap your component tree with MobilePropertyWizardProvider
 * 2. Use useMobilePropertyWizard() hook to access context data and handlers
 * 3. Use useMobilePropertyWizardStorage() hook for direct localStorage access
 * 
 * Example:
 * ```tsx
 * const { locationData, setLocationData } = useMobilePropertyWizard();
 * const { getLocationData, clearLocationData } = useMobilePropertyWizardStorage();
 * 
 * // Data is automatically persisted when you update it
 * setLocationData(newData);
 * 
 * // Access data directly from localStorage
 * const storedData = getLocationData();
 * ```
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../../utils/api';
import { showGlobalToast } from '../../../../../utils/toast';
import { useAuthData } from '../../../../../contexts/AuthContext';

// localStorage keys
const STORAGE_KEYS = {
  SALE_CATEGORY_DATA: 'mobile_property_wizard_sale_category_data',
  PROPERTY_DETAILS_DATA: 'mobile_property_wizard_property_details_data',
  LOCATION_DATA: 'mobile_property_wizard_location_data',
  PROPERTY_INFO_DATA: 'mobile_property_wizard_property_info_data',
  USER_DATA: 'mobile_property_wizard_user_data',
};

// localStorage utilities
export const localStorageUtils = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key ${key}:`, error);
    }
  },
  
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

/**
 * Utility hook to access localStorage data directly
 * Use this when you need to access data outside of the context
 */
export const useMobilePropertyWizardStorage = () => {
  return {
    getSaleCategoryData: () => localStorageUtils.get(STORAGE_KEYS.SALE_CATEGORY_DATA),
    getPropertyDetailsData: () => localStorageUtils.get(STORAGE_KEYS.PROPERTY_DETAILS_DATA),
    getLocationData: () => localStorageUtils.get(STORAGE_KEYS.LOCATION_DATA),
    getPropertyInfoData: () => localStorageUtils.get(STORAGE_KEYS.PROPERTY_INFO_DATA),
    getUserData: () => localStorageUtils.get(STORAGE_KEYS.USER_DATA),
    clearAllData: () => localStorageUtils.clear(),
    clearLocationData: () => localStorageUtils.remove(STORAGE_KEYS.LOCATION_DATA),
    clearPropertyData: () => {
      localStorageUtils.remove(STORAGE_KEYS.PROPERTY_INFO_DATA);
      localStorageUtils.remove(STORAGE_KEYS.PROPERTY_DETAILS_DATA);
    }
  };
};

interface MobilePropertyWizardContextType {
  // Sale category data
  saleCategoryData: {
    saleCategory: string;
    propertyType: any;
    streetAddress: string;
    unitNumber: string;
    city: any;
    state: any;
    postalCode: string;
    country: any;
  };
  setSaleCategoryData: (data: any) => void;
  
  // Property details data (from details page)
  propertyDetailsData: {
    propertyType: any;
    streetAddress: string;
    unitNumber: string;
    city: any;
    state: any;
    postalCode: string;
    country: any;
  };
  setPropertyDetailsData: (data: any) => void;
  
  // Location data
  locationData: {
    address: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    city_detail: any;
    state_detail: any;
    country_detail: any;
    propertyType: string;
    propertyType_detail: any;
    unitNumber: string;
  };
  setLocationData: (data: any) => void;
  
  // Property info data
  propertyInfoData: any;
  setPropertyInfoData: (data: any) => void;
  
  // User data
  userData: any;
  
  // Loading state
  isLoadingProperty: boolean;
  isSaving: boolean;
  
  // Sale category handlers
  handleSaleCategorySubmit: (data: any) => void;
  
  // Property details handlers
  handlePropertyDetailsSubmit: (data: any) => void;
  
  // Navigation handlers
  handleLocationConfirm: () => void;
  handleChangeLocation: () => void;
  handleSelectOnMap: (lat: number, lng: number) => void;
  
  // Property Info handlers
  handlePropertyInfoBack: (values: any) => void;
  handlePropertyInfoSaveDraft: (values: any) => void;
  handlePropertyInfoNext: (values: any) => void;
  
  // Property Media handlers
  handlePropertyMediaBack: (photos: any, videos: any, floorplans: any, arvrRequestId?: any) => void;
  handlePropertyMediaSaveDraft: (photos: any, videos: any, floorplans: any, arvrRequestId?: any) => Promise<void>;
  handlePropertyMediaNext: (photos: any, videos: any, floorplans: any, arvrRequestId?: any) => void;
  
  // Property Amenities handlers
  handlePropertyAmenitiesBack: (values: any) => void;
  handlePropertyAmenitiesSaveDraft: (values: any) => Promise<void>;
  handlePropertyAmenitiesNext: (values: any) => void;
  
  // Contact Info handlers
  handleContactInfoBack: () => void;
  handleContactInfoSaveDraft: (data?: any) => Promise<void>;
  handleContactInfoNext: () => void;
  
  // Property Review handlers
  handlePropertyReviewBack: () => void;
  handlePropertyReviewSaveDraft: () => Promise<void>;
  handlePropertyReviewPublish: () => void;
  handlePropertyReviewUnpublish: () => void;
  
  // Success modal
  showPublishSuccess: boolean;
  setShowPublishSuccess: (show: boolean) => void;
  handlePublishSuccessClose: () => void;
  
  // Utility functions
  saveProperty: (values: any, status: string) => Promise<any>;
  showToastMessage: (message: string, duration?: number) => void;
  
  // Property fetching
  fetchPropertyData: (propertyId: string) => void;
  
  // localStorage management
  clearAllData: () => void;
  clearLocationData: () => void;
  clearPropertyData: () => void;
}

const MobilePropertyWizardContext = createContext<MobilePropertyWizardContextType | undefined>(undefined);

export const useMobilePropertyWizard = () => {
  const context = useContext(MobilePropertyWizardContext);
  if (!context) {
    throw new Error('useMobilePropertyWizard must be used within a MobilePropertyWizardProvider');
  }
  return context;
};

interface MobilePropertyWizardProviderProps {
  children: ReactNode;
  initialData?: any;
}

export const MobilePropertyWizardProvider: React.FC<MobilePropertyWizardProviderProps> = ({ 
  children, 
  initialData = {} 
}) => {
  console.log('MobilePropertyWizardProvider: Provider initialized');
  console.log('MobilePropertyWizardProvider: initialData:', initialData);
  const navigate = useNavigate();
  const { user } = useAuthData();
  const agentId = user?.user_id;

  const { id } = useParams<{ id: string }>();
  console.log('MobilePropertyWizardProvider: id from useParams:', id);
  
  // State to track if we need to fetch property data
  const [shouldFetchProperty, setShouldFetchProperty] = useState(false);
  const [propertyIdToFetch, setPropertyIdToFetch] = useState<string | null>(null);
  
  // Function to map API data to localStorage format
  const mapApiToPropertyDetails = (apiData: any) => {
    console.log('Mapping API data to property details:', apiData);
    console.log('API property_statuses:', apiData.property_statuses);
    console.log('API listing_types:', apiData.listing_types);
    console.log('API mortgage_types:', apiData.mortgage_types);
    console.log('API coordinates:', { latitude: apiData.latitude, longitude: apiData.longitude });
    
    const result = {
      // Sale category data
      saleCategory: {
        saleCategory: apiData.listing_type || 'sale',
        propertyType: apiData.property_type_detail,
        streetAddress: apiData.address || '',
        unitNumber: apiData.unit_number || '',
        city: apiData.city_detail,
        state: apiData.state_detail,
        postalCode: apiData.postal_code || '',
        country: apiData.country_detail,
      },
      
      // Property details data
      propertyDetailsData: {
        propertyType: apiData.property_type_detail,
        streetAddress: apiData.address || '',
        unitNumber: apiData.unit_number || '',
        city: apiData.city_detail,
        state: apiData.state_detail,
        postalCode: apiData.postal_code || '',
        country: apiData.country_detail,
      },
      
      // Location data
      locationData: {
        address: apiData.address || '',
        lat: parseFloat(apiData.latitude) || 18.5601,
        lng: parseFloat(apiData.longitude) || -68.3725,
        city: apiData.city_detail?.name || '',
        state: apiData.state_detail?.name || '',
        postalCode: apiData.postal_code || '',
        country: apiData.country_detail?.name || '',
        city_detail: apiData.city_detail,
        state_detail: apiData.state_detail,
        country_detail: apiData.country_detail,
        propertyType: apiData.property_type_detail,
        propertyType_detail: apiData.property_type_detail,
        unitNumber: apiData.unit_number || '',
      },
      
      // Property info data
      propertyInfoData: {
        id: apiData.id,
        name: apiData.name,
        status: apiData.status,
        listing_type: apiData.listing_types,
        propertyType: apiData.property_type_detail,
        homeType: apiData.home_type,
        address: apiData.address,
        unitNumber: apiData.unit_number,
        country: apiData.country_detail?.id,
        state: apiData.state_detail?.id,
        city: apiData.city_detail?.id,
        postalCode: apiData.postal_code,
        lat: parseFloat(apiData.latitude) || 18.5601,
        lng: parseFloat(apiData.longitude) || -68.3725,
        country_detail: apiData.country_detail,
        state_detail: apiData.state_detail,
        city_detail: apiData.city_detail,
        lotSize: apiData.lot_size,
        lotSizeUnit: apiData.lot_size_uom,
        totalSqft: apiData.total_sqft,
        basementSqft: apiData.basement_sqft,
        yearBuilt: apiData.year_built,
        bedrooms: apiData.bedrooms,
        fullBathrooms: apiData.full_bathrooms,
        halfBathrooms: apiData.half_bathrooms,
        sellingPrice: apiData.selling_price,
        details: apiData.details,
        totalRooms: apiData.total_rooms,
        parkingSpaces: apiData.parking_spaces,
        numStories: apiData.num_stories,
        // Property status, listing type, mortgage type, and HOA fees mapping
        property_statuses: (apiData.property_statuses || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        listing_types: (apiData.listing_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        mortgage_types: (apiData.mortgage_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        max_hoa_fees: apiData.max_hoa_fees || '',
        buildingRooms: (apiData.room_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        basementTypes: (apiData.basement_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        floorCoverings: (apiData.floor_coverings || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        architecturalStyles: (apiData.architectural_styles || []).slice(0, 1).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        exteriors: (apiData.exterior_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        roofs: (apiData.roof_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        parkings: (apiData.parking_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        appliances: (apiData.appliance_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        indoorFeatures: (apiData.indoor_features || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        outdoorAmenities: (apiData.outdoor_amenities || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        view: (apiData.view_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        community: (apiData.community_types || []).map((item: any) => ({
          id: item.id,
          value: item.name
        })),
        otherFeatures: apiData.other_features || apiData.otherFeatures || [],
        stories: apiData.stories || '',
        property_photos: apiData.photos?.results?.map((photo: any) => ({
          id: photo.id,
          url: photo.url,
          type: 'photo',
          isMain: photo.main_photo || false,
          name: photo.caption || 'Property Photo',
          sort_order: photo.sort_order || 0
        })) || [],
        property_videos: apiData.videos?.map((video: any) => ({
          id: video.id,
          url: video.url,
          type: 'video',
          name: video.caption || 'Property Video',
          sort_order: video.sort_order || 0
        })) || [],
        property_floorplans: apiData.floorplans?.map((floorplan: any) => ({
          id: floorplan.id,
          url: floorplan.url,
          type: 'floorplan',
          name: floorplan.caption || 'Floor Plan',
          sort_order: floorplan.sort_order || 0
        })) || [],
        property_virtual_tours: apiData.virtual_tours?.map((tour: any) => tour.id) || [],
        agent: apiData.agent,
        vr_submitted: apiData.vr_submitted || null,
      }
    };
    
    console.log('Mapped property_statuses:', result.propertyInfoData.property_statuses);
    console.log('Mapped listing_types:', result.propertyInfoData.listing_types);
    console.log('Mapped mortgage_types:', result.propertyInfoData.mortgage_types);
    console.log('Mapped location data coordinates:', { 
      lat: result.locationData.lat, 
      lng: result.locationData.lng 
    });
    
    return result;
  };
  
  // Fetch property data when ID is present (from URL or local state)
  useEffect(() => {
    const targetId = id || propertyIdToFetch;
    console.log('MobilePropertyWizardContext: useEffect triggered with id:', id, 'propertyIdToFetch:', propertyIdToFetch, 'targetId:', targetId);
    
    if (targetId && (id || shouldFetchProperty)) {
      console.log('Fetching property data for ID:', targetId);
      setIsLoadingProperty(true);
      
      api.get(`/agent/properties/${targetId}/`)
        .then(res => {
          const apiData = res.data?.data || res.data;
          console.log('API response:', apiData);
          console.log('API other_features:', apiData?.other_features);
          console.log('API otherFeatures:', apiData?.otherFeatures);
          
          if (apiData) {
            const mappedData = mapApiToPropertyDetails(apiData);
            
            // Set all the data to localStorage and state
            setSaleCategoryData(mappedData.saleCategory);
            setPropertyDetailsData(mappedData.propertyDetailsData);
            setLocationData(mappedData.locationData);
            setPropertyInfoData(mappedData.propertyInfoData);
            
            // Also set to localStorage directly
            localStorageUtils.set(STORAGE_KEYS.SALE_CATEGORY_DATA, mappedData.saleCategory);
            localStorageUtils.set(STORAGE_KEYS.PROPERTY_DETAILS_DATA, mappedData.propertyDetailsData);
            localStorageUtils.set(STORAGE_KEYS.LOCATION_DATA, mappedData.locationData);
            localStorageUtils.set(STORAGE_KEYS.PROPERTY_INFO_DATA, mappedData.propertyInfoData);
            
            console.log('Property data loaded successfully:', mappedData);
          }
          setIsLoadingProperty(false);
          // Reset the fetch state after successful API call
          setShouldFetchProperty(false);
          setPropertyIdToFetch(null);
        })
        .catch(err => {
          console.error('Error fetching property details:', err);
          showToastMessage(err?.response?.data?.message || 'Failed to fetch property details');
          setIsLoadingProperty(false);
          // Reset the fetch state after error
          setShouldFetchProperty(false);
          setPropertyIdToFetch(null);
        });
    }
  }, [id, propertyIdToFetch, shouldFetchProperty]);

  // Handle initial data passed through navigation state
  useEffect(() => {
    console.log('MobilePropertyWizardContext: initialData useEffect triggered');
    console.log('MobilePropertyWizardContext: initialData received:', initialData);
    console.log('MobilePropertyWizardContext: initialData keys:', initialData ? Object.keys(initialData) : 'null');
    
    // Check if we have an ID in initialData that we need to fetch
    if (initialData && initialData.id && !id) {
      console.log('MobilePropertyWizardContext: Found ID in initialData, triggering API fetch:', initialData.id);
      setPropertyIdToFetch(initialData.id);
      setShouldFetchProperty(true);
      return;
    }
    
    if (initialData && Object.keys(initialData).length > 0) {
      console.log('Processing initial data:', initialData);
      console.log('Initial data property_statuses:', initialData.property_statuses);
      console.log('Initial data listing_types:', initialData.listing_types);
      console.log('Initial data mortgage_types:', initialData.mortgage_types);
      
      // Map initial data to the expected format
      const mappedInitialData = {
        // Sale category data
        saleCategory: {
          saleCategory: initialData.saleCategory || 'sale',
          propertyType: initialData.propertyType || null,
          streetAddress: initialData.streetAddress || '',
          unitNumber: initialData.unitNumber || '',
          city: initialData.city || null,
          state: initialData.state || null,
          postalCode: initialData.postalCode || '',
          country: initialData.country || null,
        },
        
        // Property details data
        propertyDetailsData: {
          propertyType: initialData.propertyType || null,
          streetAddress: initialData.streetAddress || '',
          unitNumber: initialData.unitNumber || '',
          city: initialData.city || null,
          state: initialData.state || null,
          postalCode: initialData.postalCode || '',
          country: initialData.country || null,
        },
        
        // Location data
        locationData: {
          address: initialData.streetAddress || '',
          lat: initialData.lat || 18.5601,
          lng: initialData.lng || -68.3725,
          city: initialData.city?.name || '',
          state: initialData.state?.name || '',
          postalCode: initialData.postalCode || '',
          country: initialData.country?.name || '',
          city_detail: initialData.city || null,
          state_detail: initialData.state || null,
          country_detail: initialData.country || null,
          propertyType: initialData.propertyType || '',
          propertyType_detail: initialData.propertyType_detail || null,
          unitNumber: initialData.unitNumber || '',
        },
        
        // Property info data
        propertyInfoData: {
          id: initialData.id,
          name: initialData.name,
          status: initialData.status,
          listing_type: initialData.listing_type,
          propertyType: initialData.propertyType,
          homeType: initialData.homeType,
          address: initialData.streetAddress,
          unitNumber: initialData.unitNumber,
          country: initialData.country?.id,
          state: initialData.state?.id,
          city: initialData.city?.id,
          postalCode: initialData.postalCode,
          lat: initialData.lat || 18.5601,
          lng: initialData.lng || -68.3725,
          country_detail: initialData.country,
          state_detail: initialData.state,
          city_detail: initialData.city,
          lotSize: initialData.lotSize,
          lotSizeUnit: initialData.lotSizeUnit,
          totalSqft: initialData.totalSqft,
          basementSqft: initialData.basementSqft,
          yearBuilt: initialData.yearBuilt,
          bedrooms: initialData.bedrooms,
          fullBathrooms: initialData.fullBathrooms,
          halfBathrooms: initialData.halfBathrooms,
          sellingPrice: initialData.sellingPrice,
          details: initialData.details,
          totalRooms: initialData.totalRooms,
          parkingSpaces: initialData.parkingSpaces,
          numStories: initialData.numStories,
          // Property status, listing type, mortgage type, and HOA fees mapping
          property_statuses: (initialData.property_statuses || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          listing_types: (initialData.listing_types || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          mortgage_types: (initialData.mortgage_types || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          max_hoa_fees: initialData.max_hoa_fees || '',
          buildingRooms: (initialData.buildingRooms || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          basementTypes: (initialData.basementTypes || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          floorCoverings: (initialData.floorCoverings || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          architecturalStyles: (initialData.architecturalStyles || []).slice(0, 1).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          exteriors: (initialData.exteriors || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          roofs: (initialData.roofs || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          parkings: (initialData.parkings || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          appliances: (initialData.appliances || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          indoorFeatures: (initialData.indoorFeatures || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          outdoorAmenities: (initialData.outdoorAmenities || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          view: (initialData.view || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          community: (initialData.community || []).map((item: any) => ({
            id: item.id,
            value: item.name
          })),
          otherFeatures: initialData.otherFeatures || initialData.other_features || [],
          stories: initialData.stories || '',
          property_photos: initialData.property_photos || [],
          property_videos: initialData.property_videos || [],
          property_floorplans: initialData.property_floorplans || [],
          property_virtual_tours: initialData.property_virtual_tours || [],
          vr_submitted: initialData.vr_submitted,
        }
      };
      
      console.log('Mapped initial data:', mappedInitialData);
      console.log('Mapped property_statuses:', mappedInitialData.propertyInfoData.property_statuses);
      console.log('Mapped listing_types:', mappedInitialData.propertyInfoData.listing_types);
      console.log('Mapped mortgage_types:', mappedInitialData.propertyInfoData.mortgage_types);
      console.log('Mapped stories:', mappedInitialData.propertyInfoData.stories);
      console.log('Mapped otherFeatures:', mappedInitialData.propertyInfoData.otherFeatures);
      console.log('Initial data otherFeatures:', initialData.otherFeatures);
      console.log('Initial data other_features:', initialData.other_features);
      console.log('Initial data coordinates:', { lat: initialData.lat, lng: initialData.lng });
      console.log('Mapped location coordinates:', { 
        lat: mappedInitialData.locationData.lat, 
        lng: mappedInitialData.locationData.lng 
      });
      
      // Set all the data to state and localStorage
      setSaleCategoryData(mappedInitialData.saleCategory);
      setPropertyDetailsData(mappedInitialData.propertyDetailsData);
      setLocationData(mappedInitialData.locationData);
      setPropertyInfoData(mappedInitialData.propertyInfoData);
      
      // Also set to localStorage directly
      localStorageUtils.set(STORAGE_KEYS.SALE_CATEGORY_DATA, mappedInitialData.saleCategory);
      localStorageUtils.set(STORAGE_KEYS.PROPERTY_DETAILS_DATA, mappedInitialData.propertyDetailsData);
      localStorageUtils.set(STORAGE_KEYS.LOCATION_DATA, mappedInitialData.locationData);
      localStorageUtils.set(STORAGE_KEYS.PROPERTY_INFO_DATA, mappedInitialData.propertyInfoData);
      
      console.log('Initial data set successfully');
    }
  }, [initialData]);
  
  const [userData, setUserData] = useState<any>(null);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load initial data from localStorage or use provided initialData
  const getInitialData = (key: string, fallback: any) => {
    const stored = localStorageUtils.get(key);
    return stored || fallback;
  };
  
  // Sale category data state
  const [saleCategoryData, setSaleCategoryData] = useState(() => 
    getInitialData(STORAGE_KEYS.SALE_CATEGORY_DATA, {
      saleCategory: initialData.saleCategory || 'Property',
      propertyType: initialData.propertyType || null,
      streetAddress: initialData.streetAddress || '',
      unitNumber: initialData.unitNumber || '',
      city: initialData.city || null,
      state: initialData.state || null,
      postalCode: initialData.postalCode || '',
      country: initialData.country || null,
    })
  );
  
  // Property details data state
  const [propertyDetailsData, setPropertyDetailsData] = useState(() => 
    getInitialData(STORAGE_KEYS.PROPERTY_DETAILS_DATA, {
      propertyType: initialData.propertyType || null,
      streetAddress: initialData.streetAddress || '',
      unitNumber: initialData.unitNumber || '',
      city: initialData.city || null,
      state: initialData.state || null,
      postalCode: initialData.postalCode || '',
      country: initialData.country || null,
    })
  );
  
  // Location data state
  const [locationData, setLocationData] = useState(() => 
    getInitialData(STORAGE_KEYS.LOCATION_DATA, {
      address: initialData.streetAddress || '',
      lat: initialData.lat || 18.5601, // default Punta Cana
      lng: initialData.lng || -68.3725,
      city: initialData.city?.name || '',
      state: initialData.state?.name || '',
      postalCode: initialData.postalCode || '',
      country: initialData.country?.name || '',
      city_detail: initialData.city || null,
      state_detail: initialData.state || null,
      country_detail: initialData.country || null,
      propertyType: initialData.propertyType || '',
      propertyType_detail: initialData.propertyType_detail || null,
      unitNumber: initialData.unitNumber || '',
    })
  );
  
  // Property info data state
  const [propertyInfoData, setPropertyInfoData] = useState(() => 
    getInitialData(STORAGE_KEYS.PROPERTY_INFO_DATA, {})
  );
  
  // Create a wrapper function for setPropertyInfoData that ensures state updates
  const setPropertyInfoDataWithCallback = (data: any, callback?: () => void) => {
    console.log('setPropertyInfoDataWithCallback called with:', data);
    setPropertyInfoData((prev: any) => {
      const newData = typeof data === 'function' ? data(prev) : data;
      console.log('Previous propertyInfoData:', prev);
      console.log('New propertyInfoData:', newData);
      
      // Execute callback after state update if provided
      if (callback) {
        setTimeout(callback, 0);
      }
      
      return newData;
    });
  };
  
  // Fallback to global toast if context is not available
  const showToastMessage = (message: string, duration?: number) => {
    showGlobalToast(message, duration);
  };
  
  // Persist data to localStorage when it changes
  useEffect(() => {
    localStorageUtils.set(STORAGE_KEYS.SALE_CATEGORY_DATA, saleCategoryData);
  }, [saleCategoryData]);
  
  useEffect(() => {
    localStorageUtils.set(STORAGE_KEYS.PROPERTY_DETAILS_DATA, propertyDetailsData);
  }, [propertyDetailsData]);
  
  useEffect(() => {
    localStorageUtils.set(STORAGE_KEYS.LOCATION_DATA, locationData);
  }, [locationData]);
  
  useEffect(() => {
    console.log('propertyInfoData changed:', propertyInfoData);
    localStorageUtils.set(STORAGE_KEYS.PROPERTY_INFO_DATA, propertyInfoData);
  }, [propertyInfoData]);
  
  // Get user data on mount
  useEffect(() => {
    getUser();
  }, []);
  
  const getUser = async () => {
    try {
      const response = await api.get('/common/profile-subscription/');
      if (response?.data?.status_code === 200) {
        if (response?.data?.data?.profile) {
          setUserData(response?.data?.data?.profile);
          setPropertyInfoData((prev: any) => ({
            ...prev,
            agent: response?.data?.data?.profile
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  // Sale category handlers
  const handleSaleCategorySubmit = (data: any) => {
    setSaleCategoryData(data);
    console.log(data);
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      navigate('/agent/properties/add/details');
    }, 0);
  };
  
  // Property details handlers
  const handlePropertyDetailsSubmit = (data: any) => {
    setPropertyDetailsData(data);
    console.log('Property details data:', data);
    
    // Update location data with property details
    const updatedLocationData = {
      address: data.streetAddress,
      city: data.city?.name || '',
      state: data.state?.name || '',
      postalCode: data.postalCode,
      country: data.country?.name || '',
      city_detail: data.city,
      state_detail: data.state,
      country_detail: data.country,
      propertyType: data.propertyType,
      propertyType_detail: data.propertyType,
      unitNumber: data.unitNumber,
      // Preserve existing coordinates if available, otherwise use defaults
      lat: locationData.lat || 18.5601,
      lng: locationData.lng || -68.3725,
    };
    
    console.log('Setting location data:', updatedLocationData);
    setLocationData(updatedLocationData);
    
    // Navigate to location page
    setTimeout(() => {
        if (id) {
          navigate(`/agent/properties/add/location/${id}`);
        } else {
          navigate('/agent/properties/add/location');
        }
    }, 1000);
   
  };
  
  // Save property function
  const saveProperty = async (values: any, status: string) => {
    try {
      setIsSaving(true);
      // --- PHOTO SORTING LOGIC ---
      let property_photos = Array.isArray(values.property_photos) ? [...values.property_photos] : [];
      // Find the main photo (isMain or main_photo true)
      const mainIndex = property_photos.findIndex((p: any) => p.isMain || p.main_photo);
      if (mainIndex !== -1) {
        // Set main_photo and sort_order=1 for main photo
        property_photos[mainIndex] = { ...property_photos[mainIndex], main_photo: true, sort_order: 1 };
        // All others: sort_order 2,3,... (skip main photo)
        let sort = 2;
        for (let i = 0; i < property_photos.length; i++) {
          if (i !== mainIndex) {
            property_photos[i] = { ...property_photos[i], main_photo: false, sort_order: sort++ };
          }
        }
      } else {
        // No main photo, just assign sort_order
        property_photos = property_photos.map((p: any, i: number) => ({ ...p, main_photo: false, sort_order: i + 1 }));
      }
      // --- END PHOTO SORTING LOGIC ---

      // In saveProperty, ensure amenities and stories are always sent as IDs and latest value
      const toIdArray = (arr: any[]) => (arr || []).map((item: any) => typeof item === 'object' ? item.id : item);
      const propertyData = {
        status: status,
        name: values.name,
        agent: agentId,
        property_type: values.propertyType?.id,
        home_type: values.homeType,
        address: values.address,
        unit_number: values.unitNumber,
        country: values.country,
        state: values.state,
        city: values.city,
        postal_code: values.postalCode,
        latitude: values.lat,
        longitude: values.lng,
        lot_size: values.lotSize,
        lot_size_uom: values.lotSizeUnit,
        total_sqft: values.totalSqft,
        basement_sqft: values.basementSqft,
        year_built: values.yearBuilt,
        bedrooms: values.bedrooms,
        full_bathrooms: values.fullBathrooms,
        half_bathrooms: values.halfBathrooms,
        selling_price: values.sellingPrice,
        details: values.details,
        total_rooms: values.totalRooms,
        parking_spaces: values.parkingSpaces,
        stories: values.stories, // always use latest
        property_statuses: Array.isArray(values.propertyStatus) ? values.propertyStatus : [],
        listing_types: Array.isArray(values.listingType) ? values.listingType : [],
        mortgage_types: values.mortgageType ? [values.mortgageType] : [],
        max_hoa_fees: values.max_hoa_fees ? Number(values.max_hoa_fees) : undefined,
        room_types_input: toIdArray(values.buildingRooms),
        basement_types_input: toIdArray(values.basementTypes),
        floor_coverings_input: toIdArray(values.floorCoverings),
        architectural_styles_input: toIdArray(values.architecturalStyles),
        exterior_types_input: toIdArray(values.exteriors),
        roof_types_input: toIdArray(values.roofs),
        parking_types_input: toIdArray(values.parkings),
        appliance_types_input: toIdArray(values.appliances),
        indoor_features_input: toIdArray(values.indoorFeatures),
        outdoor_amenities_input: toIdArray(values.outdoorAmenities),
        view_types_input: toIdArray(values.view),
        community_types_input: toIdArray(values.community),
        property_photos: property_photos,
        property_videos: (values.property_videos || []).map((item: any) => item),
        property_floorplans: (values.property_floorplans || []).map((item: any) => item),
        property_virtual_tours: (values.property_virtual_tours || []).map((item: any) => item),
        vr_request_id: values.vr_request_id || (values.property_virtual_tours && values.property_virtual_tours.length > 0 ? values.property_virtual_tours[0] : null),
        other_features: Array.isArray(values.otherFeatures) ? values.otherFeatures : [],
      };

      // Debug: Log the building details and coordinates being sent to API
      console.log('Mobile saveProperty: Building details being sent to API:', {
        buildingRooms: values.buildingRooms,
        basementTypes: values.basementTypes,
        floorCoverings: values.floorCoverings,
        architecturalStyles: values.architecturalStyles,
        exteriors: values.exteriors,
        roofs: values.roofs,
        parkings: values.parkings,
        room_types_input: propertyData.room_types_input,
        basement_types_input: propertyData.basement_types_input,
        floor_coverings_input: propertyData.floor_coverings_input,
        architectural_styles_input: propertyData.architectural_styles_input,
        exterior_types_input: propertyData.exterior_types_input,
        roof_types_input: propertyData.roof_types_input,
        parking_types_input: propertyData.parking_types_input,
      });
      
      console.log('Mobile saveProperty: Coordinates being sent to API:', {
        lat: values.lat,
        lng: values.lng,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
      });
      
      // Ensure coordinates are valid numbers
      if (values.lat && values.lng) {
        const lat = parseFloat(values.lat);
        const lng = parseFloat(values.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          propertyData.latitude = lat;
          propertyData.longitude = lng;
          console.log('Valid coordinates confirmed:', { latitude: lat, longitude: lng });
        } else {
          console.warn('Invalid coordinates detected:', { lat: values.lat, lng: values.lng });
          // Use default coordinates if invalid
          propertyData.latitude = 18.5601;
          propertyData.longitude = -68.3725;
        }
      } else {
        console.warn('No coordinates provided, using defaults');
        // Use default coordinates if not provided
        propertyData.latitude = 18.5601;
        propertyData.longitude = -68.3725;
      }

      let response;
      // Use propertyInfoData.id from context for method selection
      if (propertyInfoData?.id) {
        // Update existing property - use PUT method
        console.log('Updating existing property with ID:', propertyInfoData.id);
        response = await api.put(`/agent/properties/${propertyInfoData.id}/`, propertyData);
      } else {
        // Create new property - use POST method
        console.log('Creating new property');
        response = await api.post('/agent/properties/', propertyData);
      }
      
      if (response) {
        const action = propertyInfoData?.id ? 'updated' : 'saved';
        
        // Only show toast for draft saves, not for publishing
        if (status !== 'published') {
          showToastMessage(`Property ${action} successfully`, 3000);
        }
        
        // Clear all data after successful save
        clearAllData();
        
        if (status === 'published') {
          setShowPublishSuccess(true);
        } else {
          navigate('/agent/properties/listings');
        }
        return response;
      }
    } catch (error: any) {
      const action = propertyInfoData?.id ? 'updating' : 'saving';
      showToastMessage(error.response?.data?.message || `Error ${action} property`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Location handlers
  const handleLocationConfirm = () => {
    console.log("locationData", locationData);
    
    const newPropertyInfoData = {
      city: locationData.city_detail?.id || '',
      state: locationData.state_detail?.id || '',
      country: locationData.country_detail?.id || '',
      postalCode: locationData.postalCode,
      city_detail: locationData.city_detail,
      state_detail: locationData.state_detail,
      country_detail: locationData.country_detail,
      propertyType: locationData.propertyType,
      address: locationData.address,
      lat: locationData.lat,
      lng: locationData.lng,
      unitNumber: locationData.unitNumber,
    };
    
    console.log("Setting propertyInfoData with location data:", newPropertyInfoData);
    
    // Set the state and wait for it to update before navigating
    setPropertyInfoDataWithCallback((prev: any) => ({
      ...prev,
      ...newPropertyInfoData,
    }), () => {
      console.log("State updated, navigating to info page");
      if (id) {
        navigate(`/agent/properties/add/info/${id}`);
      } else {
        navigate('/agent/properties/add/info');
      }
    });
  };
  
  const handleChangeLocation = () => {
    // This function is called when user wants to change location on map
    // The actual map editing is handled in the PropertyLocationPage component
    console.log('User wants to change location on map');
  };
  
  const handleSelectOnMap = (lat: number, lng: number) => {
    console.log('Mobile handleSelectOnMap: Updating coordinates to:', { lat, lng });
    
    // Update location data
    setLocationData((prev: any) => {
      const updated = { ...prev, lat, lng };
      console.log('Updated locationData with coordinates:', { lat, lng });
      return updated;
    });
    
    // Also update property info data to persist coordinates across navigation
    setPropertyInfoData((prev: any) => {
      const updated = {
        ...prev,
        lat,
        lng,
      };
      console.log('Updated propertyInfoData with coordinates:', { lat, lng });
      return updated;
    });
  };
  
  // Property Info handlers
  const handlePropertyInfoBack = (values: any) => {
    // Preserve existing VR data when going back from Property Info
    const merged = {
      ...propertyInfoData,
      ...values,
      // Keep the original field names that PropertyInfoPage uses
      buildingRooms: values.buildingRooms,
      basement: values.basement,
      floorCovering: values.floorCovering,
      architecturalStyle: values.architecturalStyle,
      exterior: values.exterior,
      roof: values.roof,
      parking: values.parking,
      // Also save with the mapped names for API compatibility
      basementTypes: values.basement,
      floorCoverings: values.floorCovering,
      architecturalStyles: values.architecturalStyle,
      exteriors: values.exterior,
      roofs: values.roof,
      parkings: values.parking,
      // Explicitly preserve property status, listing type, and mortgage type
      propertyStatus: values.propertyStatus,
      listingType: values.listingType,
      mortgageType: values.mortgageType,
      max_hoa_fees: values.max_hoa_fees,
      // Preserve VR data
      property_virtual_tours: (propertyInfoData as any).property_virtual_tours || [],
      vr_request_id: (propertyInfoData as any).vr_request_id || null,
      arvr_photos: (propertyInfoData as any).arvr_photos || {},
    };
    setPropertyInfoDataWithCallback(merged, () => {
      if (id) {
        navigate(`/agent/properties/add/location/${id}`);
      } else {
        navigate('/agent/properties/add/location');
      }
    });
  };
  
  const handlePropertyInfoSaveDraft = (values: any) => {
    const merged = {
      ...propertyInfoData,
      ...values,
      // Keep the original field names that PropertyInfoPage uses
      buildingRooms: values.buildingRooms,
      basement: values.basement,
      floorCovering: values.floorCovering,
      architecturalStyle: values.architecturalStyle,
      exterior: values.exterior,
      roof: values.roof,
      parking: values.parking,
      // Also save with the mapped names for API compatibility
      basementTypes: values.basement,
      floorCoverings: values.floorCovering,
      architecturalStyles: values.architecturalStyle,
      exteriors: values.exterior,
      roofs: values.roof,
      parkings: values.parking,
      // Explicitly preserve property status, listing type, and mortgage type
      propertyStatus: values.propertyStatus,
      listingType: values.listingType,
      mortgageType: values.mortgageType,
      max_hoa_fees: values.max_hoa_fees,
    };
    setPropertyInfoDataWithCallback(merged, () => {
      saveProperty(merged, "draft");
    });
  };
  
  const handlePropertyInfoNext = (values: any) => {
    console.log('MobilePropertyWizardContext: handlePropertyInfoNext called with values:', values);
    console.log('MobilePropertyWizardContext: propertyStatus from values:', values.propertyStatus);
    
    setPropertyInfoDataWithCallback({
      ...propertyInfoData,
      ...values,
      // Keep the original field names that PropertyInfoPage uses
      buildingRooms: values.buildingRooms,
      basement: values.basement,
      floorCovering: values.floorCovering,
      architecturalStyle: values.architecturalStyle,
      exterior: values.exterior,
      roof: values.roof,
      parking: values.parking,
      // Also save with the mapped names for API compatibility
      basementTypes: values.basement,
      floorCoverings: values.floorCovering,
      architecturalStyles: values.architecturalStyle,
      exteriors: values.exterior,
      roofs: values.roof,
      parkings: values.parking,
      // Explicitly preserve property status, listing type, and mortgage type
      propertyStatus: values.propertyStatus,
      listingType: values.listingType,
      mortgageType: values.mortgageType,
      max_hoa_fees: values.max_hoa_fees,
    }, () => {
      console.log('MobilePropertyWizardContext: propertyInfoData after update:', propertyInfoData);
      if (id) {
        navigate(`/agent/properties/add/media/${id}`);
      } else {
        navigate('/agent/properties/add/media');
      }
    });
  };
  
  // Property Media handlers
  const handlePropertyMediaBack = (photos: any, videos: any, floorplans: any, arvrRequestId?: any) => {
    setPropertyInfoDataWithCallback((prev: any) => ({
      ...prev,
      property_photos: photos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      vr_request_id: arvrRequestId || null,
    }), () => {
      if (id) {
        navigate(`/agent/properties/add/info/${id}`);
      } else {
        navigate('/agent/properties/add/info');
      }
    });
  };
  
  const handlePropertyMediaSaveDraft = async (photos: any, videos: any, floorplans: any, arvrRequestId?: any) => {
    const merged = {
      ...propertyInfoData,
      property_photos: photos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      vr_request_id: arvrRequestId || null,
    };
    setPropertyInfoData(merged);
    await saveProperty(merged, "draft");
    // Redirect to property listing page after successful save
    navigate('/agent/properties/listings');
  };
  
  const handlePropertyMediaNext = (photos: any, videos: any, floorplans: any, arvrRequestId?: any) => {
    setPropertyInfoDataWithCallback((prev: any) => ({
      ...prev,
      property_photos: photos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      vr_request_id: arvrRequestId || null,
    }), () => {
      if (id) {
        navigate(`/agent/properties/add/amenities/${id}`);
      } else {
        navigate('/agent/properties/add/amenities');
      }
    });
  };
  
  // Property Amenities handlers
  const handlePropertyAmenitiesBack = (values: any) => {
    if (id) {
      navigate(`/agent/properties/add/media/${id}`);
    } else {
      navigate('/agent/properties/add/media');
    }
  };
  
  const handlePropertyAmenitiesSaveDraft = async (values: any) => {
    const merged = {
      ...propertyInfoData,
      ...values,
      // Ensure amenities data is properly mapped
      appliances: values.appliances,
      indoorFeatures: values.indoorFeatures,
      outdoorAmenities: values.outdoorAmenities,
      view: values.view,
      community: values.community,
      stories: values.stories,
      otherFeatures: values.otherFeatures,
    };
    setPropertyInfoData(merged);
    await saveProperty(merged, "draft");
    // Redirect to property listing page after successful save
    navigate('/agent/properties/listings');
  };
  
  const handlePropertyAmenitiesNext = (values: any) => {
    setPropertyInfoDataWithCallback((prev: any) => ({
      ...prev,
      appliances: values.appliances,
      indoorFeatures: values.indoorFeatures,
      outdoorAmenities: values.outdoorAmenities,
      view: values.view,
      community: values.community,
      stories: values.stories,
      otherFeatures: values.otherFeatures,
    }), () => {
      if (id) {
        navigate(`/agent/properties/add/contact-info/${id}`);
      } else {
        navigate('/agent/properties/add/contact-info');
      }
    });
  };
  
  // Contact Info handlers
  const handleContactInfoBack = () => {
    if (id) {
      navigate(`/agent/properties/add/amenities/${id}`);
    } else {
      navigate('/agent/properties/add/amenities');
    }
  };
  
  const handleContactInfoSaveDraft = async (data?: any) => {
    let merged = propertyInfoData;
    if (data) {
      merged = { ...propertyInfoData, ...data };
      setPropertyInfoData(merged);
    }
    await saveProperty(merged, "draft");
    if (id) {
      navigate(`/agent/properties/add/amenities/${id}`);
    } else {
      navigate('/agent/properties/add/amenities');
    }
  };
  
  const handleContactInfoNext = () => {
    console.log(propertyInfoData);
    if (id) {
      navigate(`/agent/properties/add/review/${id}`);
    } else {
      navigate('/agent/properties/add/review');
    }
  };
  
  // Property Review handlers
  const handlePropertyReviewBack = () => {
    if (id) {
      navigate(`/agent/properties/add/contact-info/${id}`);
    } else {
      navigate('/agent/properties/add/contact-info');
    }
  };
  
  const handlePropertyReviewSaveDraft = async () => {
    await saveProperty(propertyInfoData, "draft");
    // Redirect to property listing page after successful save
    navigate('/agent/properties/listings');
  };
  
  const handlePropertyReviewPublish = () => {
    return saveProperty(propertyInfoData, "published");
  };
  
  const handlePropertyReviewUnpublish = () => {
    saveProperty(propertyInfoData, "draft");
  };
  
  const handlePublishSuccessClose = () => {
    setShowPublishSuccess(false);
    navigate('/agent/properties/listings');
  };
  
  // localStorage management functions
  const clearAllData = () => {
    localStorageUtils.clear();
    setSaleCategoryData({
      saleCategory: 'Property',
      propertyType: null,
      streetAddress: '',
      unitNumber: '',
      city: null,
      state: null,
      postalCode: '',
      country: null,
    });
    setPropertyDetailsData({
      propertyType: null,
      streetAddress: '',
      unitNumber: '',
      city: null,
      state: null,
      postalCode: '',
      country: null,
    });
    setLocationData({
      address: '',
      lat: 18.5601,
      lng: -68.3725,
      city: '',
      state: '',
      postalCode: '',
      country: '',
      city_detail: null,
      state_detail: null,
      country_detail: null,
      propertyType: '',
      propertyType_detail: null,
      unitNumber: '',
    });
    setPropertyInfoData({});
  };
  
  const clearLocationData = () => {
    localStorageUtils.remove(STORAGE_KEYS.LOCATION_DATA);
    setLocationData({
      address: '',
      lat: 18.5601,
      lng: -68.3725,
      city: '',
      state: '',
      postalCode: '',
      country: '',
      city_detail: null,
      state_detail: null,
      country_detail: null,
      propertyType: '',
      propertyType_detail: null,
      unitNumber: '',
    });
  };
  
  const clearPropertyData = () => {
    localStorageUtils.remove(STORAGE_KEYS.PROPERTY_INFO_DATA);
    localStorageUtils.remove(STORAGE_KEYS.PROPERTY_DETAILS_DATA);
    setPropertyInfoData({});
    setPropertyDetailsData({
      propertyType: null,
      streetAddress: '',
      unitNumber: '',
      city: null,
      state: null,
      postalCode: '',
      country: null,
    });
  };

  // Function to manually trigger property data fetching
  const fetchPropertyData = (propertyId: string) => {
    console.log('MobilePropertyWizardContext: fetchPropertyData called with ID:', propertyId);
    setPropertyIdToFetch(propertyId);
    setShouldFetchProperty(true);
  };
  
  const value: MobilePropertyWizardContextType = {
    saleCategoryData,
    setSaleCategoryData,
    propertyDetailsData,
    setPropertyDetailsData,
    locationData,
    setLocationData,
    propertyInfoData,
    setPropertyInfoData,
    userData,
    handleSaleCategorySubmit,
    handlePropertyDetailsSubmit,
    handleLocationConfirm,
    handleChangeLocation,
    handleSelectOnMap,
    handlePropertyInfoBack,
    handlePropertyInfoSaveDraft,
    handlePropertyInfoNext,
    handlePropertyMediaBack,
    handlePropertyMediaSaveDraft,
    handlePropertyMediaNext,
    handlePropertyAmenitiesBack,
    handlePropertyAmenitiesSaveDraft,
    handlePropertyAmenitiesNext,
    handleContactInfoBack,
    handleContactInfoSaveDraft,
    handleContactInfoNext,
    handlePropertyReviewBack,
    handlePropertyReviewSaveDraft,
    handlePropertyReviewPublish,
    handlePropertyReviewUnpublish,
    showPublishSuccess,
    setShowPublishSuccess,
    handlePublishSuccessClose,
    saveProperty,
    showToastMessage,
    fetchPropertyData,
    clearAllData,
    clearLocationData,
    clearPropertyData,
    isLoadingProperty,
    isSaving,
  };
  
  return (
    <MobilePropertyWizardContext.Provider value={value}>
      {children}
    </MobilePropertyWizardContext.Provider>
  );
}; 