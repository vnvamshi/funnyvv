import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { PropertyDetails, PropertyTab } from '../types';

function mapApiToPropertyDetails(apiData: any): PropertyDetails {
  // Normalize photos array to handle all possible API shapes
  let photosArray: any[] = [];
  if (Array.isArray(apiData.photos)) {
    photosArray = apiData.photos;
  } else if (apiData.photos?.results && Array.isArray(apiData.photos.results)) {
    photosArray = apiData.photos.results;
  } else if (Array.isArray(apiData.photos?.photos)) {
    photosArray = apiData.photos.photos;
  } else {
    photosArray = [];
  }

  // Map property_statuses array to property_status string
  const propertyStatusNames = apiData.property_statuses?.map((status: any) => status.name).join(', ') || apiData.property_status || '--';

  return {
    property_id: apiData.id,
    name: apiData.name,
    status: apiData.status,
    property_status: propertyStatusNames,
    property_statuses: apiData.property_statuses || [],
    listing_type: apiData.listing_type,
    selling_price: apiData.selling_price ? Number(apiData.selling_price) : 0,
    max_hoa_fees: apiData.max_hoa_fees ? Number(apiData.max_hoa_fees) : undefined,
    agent: apiData.agent_detail || { id: apiData.agent, name: '' },
    property_type: apiData.property_type_detail || { id: apiData.property_type, name: '' },
    home_type: apiData.home_type,
    address: apiData.address,
    unit_number: apiData.unit_number,
    city: apiData.city_detail ? apiData.city_detail.name : apiData.city,
    state: apiData.state_detail ? apiData.state_detail.name : apiData.state,
    country: apiData.country_detail ? apiData.country_detail.name : apiData.country,
    postal_code: apiData.postal_code,
    latitude: apiData.latitude ? Number(apiData.latitude) : 0,
    longitude: apiData.longitude ? Number(apiData.longitude) : 0,
    lot_size: apiData.lot_size ? Number(apiData.lot_size) : undefined,
    lot_size_uom: apiData.lot_size_uom,
    total_sqft: apiData.total_sqft ? Number(apiData.total_sqft) : undefined,
    basement_sqft: apiData.basement_sqft ? Number(apiData.basement_sqft) : undefined,
    year_built: apiData.year_built ? Number(apiData.year_built) : undefined,
    bedrooms: apiData.bedrooms,
    full_bathrooms: apiData.full_bathrooms,
    half_bathrooms: apiData.half_bathrooms,
    details: apiData.details,
    total_rooms: apiData.total_rooms,
    parking_spaces: apiData.parking_spaces,
    num_stories: apiData.num_stories,
    view_count: apiData.view_count,
    mainphoto_url: photosArray.find((p: any) => p.main_photo)?.url || photosArray[0]?.url,
    property_photos: photosArray,
    photos: { count: photosArray.length, results: photosArray },
    property_videos: apiData.videos || [],
    property_floorplans: apiData.floorplans || [],
    property_virtual_tours: apiData.virtual_tours || [],
    outdoor_amenities: apiData.outdoor_amenities || [],
    indoor_features: apiData.indoor_features || [],
    appliance_types: apiData.appliance_types || [],
    view_types: apiData.view_types || [],
    community_types: apiData.community_types || [],
    floor_coverings: apiData.floor_coverings || [],
    architectural_styles: apiData.architectural_styles || [],
    basement_types: apiData.basement_types || [],
    building_rooms: apiData.room_types || [],
    is_saved: apiData.is_saved,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
  };
}

export default function usePropertyDetails() {
  const [activeTab, setActiveTab] = useState<PropertyTab>('overview');
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.get(`/buyer/properties/${id}/`)
      .then(res => {
        const apiData = res.data?.data || res.data;
        setProperty(mapApiToPropertyDetails(apiData));
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to fetch property details');
        setLoading(false);
      });
  }, [id]);

  return {
    property,
    loading,
    error,
    activeTab,
    setActiveTab,
  };
} 