import { PropertyList } from '../types';

// This is a placeholder for map marker logic. In a real app, you would use lat/lng from the property data.
export const useMapMarkers = (properties: PropertyList) => {
  // Mock marker positions (in a real app, use geocoding or lat/lng from property data)
  return properties.map((property, idx) => ({
    id: property.id,
    label: (idx + 1).toString(),
    position: {
      lat: property.lat,
      lng: property.lng,
    },
    price: property.price,
    title: property.title,
    location: property.location,
    image: property.image,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    description: property.description,
  }));
}; 