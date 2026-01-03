// Property type for listings
export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
  description: string;
  isSaved?: boolean;
  images?: string[];
  lat: number;
  lng: number;
}

// Filter types for the property listing
export interface PropertyFilters {
  search: string;
  priceRange: [number, number];
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
}

// Mock data list type
export type PropertyList = Property[]; 