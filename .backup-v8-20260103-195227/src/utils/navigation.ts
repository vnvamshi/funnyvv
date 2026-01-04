import { NavigateFunction } from 'react-router-dom';
import api from './api';

/**
 * Navigate to mobile property add screen with prefilled data
 * @param navigate - React Router navigate function
 * @param initialData - Data to prefills the form
 * @param startStep - Which step to start at (optional, defaults to 'details')
 */
export const navigateToMobilePropertyAdd = (
  navigate: NavigateFunction,
  initialData: any = {},
  startStep: string = 'details'
) => {
  navigate(`/agent/properties/add/${startStep}`, {
    state: { initialData }
  });
};

/**
 * Navigate to mobile property add screen with property data for editing
 * @param navigate - React Router navigate function
 * @param property - Property object with data to prefills the form
 * @param startStep - Which step to start at (optional, defaults to 'details')
 */
export const navigateToMobilePropertyEdit = (
  navigate: NavigateFunction,
  property: any,
  startStep: string = 'details'
) => {
  // Transform property data to match the expected format
  const initialData = {
    // Sale category data
    saleCategory: property.listing_type || 'sale',
    propertyType: property.property_type_detail,
    streetAddress: property.address || '',
    unitNumber: property.unit_number || '',
    city: property.city_detail,
    state: property.state_detail,
    postalCode: property.postal_code || '',
    country: property.country_detail,
    
    // Property info data
    id: property.property_id || property.id,
    name: property.name,
    status: property.status,
    homeType: property.home_type,
    lotSize: property.lot_size,
    lotSizeUnit: property.lot_size_uom,
    totalSqft: property.total_sqft,
    basementSqft: property.basement_sqft,
    yearBuilt: property.year_built,
    bedrooms: property.bedrooms,
    fullBathrooms: property.full_bathrooms,
    halfBathrooms: property.half_bathrooms,
    sellingPrice: property.selling_price,
    details: property.details,
    totalRooms: property.total_rooms,
    parkingSpaces: property.parking_spaces,
    numStories: property.num_stories,
    max_hoa_fees: property.max_hoa_fees,
    
    // Location data
    lat: parseFloat(property.latitude) || 18.5601,
    lng: parseFloat(property.longitude) || -68.3725,
    
    // Arrays
    buildingRooms: property.room_types || [],
    basementTypes: property.basement_types || [],
    floorCoverings: property.floor_coverings || [],
    architecturalStyles: (property.architectural_styles || []).slice(0, 1),
    exteriors: property.exterior_types || [],
    roofs: property.roof_types || [],
    parkings: property.parking_types || [],
    appliances: property.appliance_types || [],
    indoorFeatures: property.indoor_features || [],
    outdoorAmenities: property.outdoor_amenities || [],
    view: property.view_types || [],
    community: property.community_types || [],
    otherFeatures: property.other_features || [],
    
    // Media
    property_photos: property.photos?.results || [],
    property_videos: property.videos || [],
    property_floorplans: property.floorplans || [],
    property_virtual_tours: property.virtual_tours || [],
    
    // VR data
    vr_submitted: property.vr_submitted,
  };

  navigate(`/agent/properties/add/${startStep}`, {
    state: { initialData }
  });
};

/**
 * Navigate to mobile property add screen with property data fetched from API
 * @param navigate - React Router navigate function
 * @param propertyId - Property ID to fetch data for
 * @param startStep - Which step to start at (optional, defaults to 'details')
 */
export const navigateToMobilePropertyEditWithAPI = async (
  navigate: NavigateFunction,
  propertyId: string,
  startStep: string = 'details'
) => {
  try {
    console.log('Fetching property data for ID:', propertyId);
    
    const response = await api.get(`/agent/properties/${propertyId}/`);
    const property = response.data?.data || response.data;
    
    if (property) {
      console.log('Property data fetched:', property);
      
      // Transform property data to match the expected format
      const initialData = {
        // Sale category data
        saleCategory: property.listing_type || 'sale',
        propertyType: property.property_type_detail,
        streetAddress: property.address || '',
        unitNumber: property.unit_number || '',
        city: property.city_detail,
        state: property.state_detail,
        postalCode: property.postal_code || '',
        country: property.country_detail,
        
        // Property info data
        id: property.id,
        name: property.name,
        status: property.status,
        listing_type: property.listing_type,
        homeType: property.home_type,
        lotSize: property.lot_size,
        lotSizeUnit: property.lot_size_uom,
        totalSqft: property.total_sqft,
        basementSqft: property.basement_sqft,
        yearBuilt: property.year_built,
        bedrooms: property.bedrooms,
        fullBathrooms: property.full_bathrooms,
        halfBathrooms: property.half_bathrooms,
        sellingPrice: property.selling_price,
        details: property.details,
        totalRooms: property.total_rooms,
        parkingSpaces: property.parking_spaces,
        numStories: property.num_stories,
        max_hoa_fees: property.max_hoa_fees,
        
        // Location data
        lat: parseFloat(property.latitude) || 18.5601,
        lng: parseFloat(property.longitude) || -68.3725,
        
        // Arrays
        buildingRooms: property.room_types || [],
        basementTypes: property.basement_types || [],
        floorCoverings: property.floor_coverings || [],
        architecturalStyles: (property.architectural_styles || []).slice(0, 1),
        exteriors: property.exterior_types || [],
        roofs: property.roof_types || [],
        parkings: property.parking_types || [],
        appliances: property.appliance_types || [],
        indoorFeatures: property.indoor_features || [],
        outdoorAmenities: property.outdoor_amenities || [],
        view: property.view_types || [],
        community: property.community_types || [],
        otherFeatures: property.other_features || [],
        
        // Media
        property_photos: property.photos?.results || [],
        property_videos: property.videos || [],
        property_floorplans: property.floorplans || [],
        property_virtual_tours: property.virtual_tours || [],
        
        // VR data
        vr_submitted: property.vr_submitted,
      };

      console.log('Navigating with initial data:', initialData);
      
      navigate(`/agent/properties/add/${startStep}`, {
        state: { initialData }
      });
    } else {
      console.error('No property data received from API');
    }
  } catch (error) {
    console.error('Error fetching property data:', error);
    // Fallback to navigation without data
    navigate(`/agent/properties/add/${startStep}`);
  }
};

/**
 * Navigate to mobile property add screen starting from a specific step
 * @param navigate - React Router navigate function
 * @param step - Step to start at ('sale-category', 'details', 'location', 'info', 'media', 'amenities', 'contact-info', 'review')
 * @param initialData - Data to prefills the form
 */
export const navigateToMobilePropertyStep = (
  navigate: NavigateFunction,
  step: string,
  initialData: any = {}
) => {
  navigate(`/agent/properties/add/${step}`, {
    state: { initialData }
  });
}; 