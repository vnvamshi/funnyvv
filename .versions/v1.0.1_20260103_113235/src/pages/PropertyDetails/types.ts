export type PropertyTab = 'overview' | 'location' | 'details' | 'contact' | 'media';

export interface PropertyPhoto {
  url: string;
  caption?: string;
  main_photo?: boolean;
}

export interface PropertyVideo {
  url: string;
  caption?: string;
}

export interface PropertyFloorplan {
  url: string;
  caption?: string;
}

export interface PropertyVirtualTour {
  url: string;
  caption?: string;
}

export interface Amenity {
  id: string;
  name: string;
}

export interface AgentIdObject {
  username?: string;
  name?: string;
  profile_photo_url?: string;
  email?: string;
  mobile_number?: string | null;
  office_address?: string;
  mls_agent_id?: string;
  service_areas?: string[];
}

export interface Agent {
  id?: string | AgentIdObject;
  name?: string;
  mobile_number?: string | null;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_photo_url?: string;
  email?: string;
  office_address?: string;
}

export interface PropertyType {
  id: string;
  name: string;
}

export interface PropertyDetails {
  property_id: string;
  name: string;
  status: string;
  property_status: string;
  property_statuses?: Amenity[];
  listing_type: string;
  selling_price: number;
  max_hoa_fees?: number;
  agent: Agent;
  property_type: PropertyType;
  home_type: string;
  address: string;
  unit_number?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  lot_size?: number;
  lot_size_uom?: string;
  total_sqft?: number;
  basement_sqft?: number | null;
  year_built?: number;
  bedrooms?: number;
  full_bathrooms?: number;
  half_bathrooms?: number;
  details?: string;
  total_rooms?: number;
  parking_spaces?: number;
  num_stories?: number;
  view_count?: number;
  save_count?: number;
  mainphoto_url?: string;
  property_photos?: PropertyPhoto[];
  property_videos?: PropertyVideo[];
  property_floorplans?: PropertyFloorplan[];
  property_virtual_tours?: PropertyVirtualTour[];
  outdoor_amenities?: Amenity[];
  indoor_features?: Amenity[];
  appliance_types?: Amenity[];
  view_types?: Amenity[];
  community_types?: Amenity[];
  floor_coverings?: Amenity[];
  architectural_styles?: Amenity[];
  basement_types?: Amenity[];
  building_rooms?: Amenity[];
  is_saved?: boolean;
  created_at?: string;
  updated_at?: string;
  photos?: { count: number; results: PropertyPhoto[] };
  listing_strength_percentage?: number;
  vr_submitted?: any;
} 