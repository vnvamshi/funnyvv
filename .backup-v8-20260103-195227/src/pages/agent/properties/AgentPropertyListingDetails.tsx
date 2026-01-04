import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { PropertyDetails } from '../../PropertyDetails/types';
import shareIcon from '../../../assets/images/gold-share.svg';
import editIcon from '../../../assets/images/edit-icon.svg';
import viewsIcon from '../../../assets/images/pd-home.svg';
import savesIcon from '../../../assets/images/pd-bathrooms.svg';
import otherIcon from '../../../assets/images/pd-interior.svg';
import virtualTourBtn from '../../../assets/images/v-tour-btn.svg';
import playBtn from '../../../assets/images/play-btn.svg';
import floorBtn from '../../../assets/images/floor-btn.svg';
import pdHome from '../../../assets/images/pd-home.svg';
import pdInterior from '../../../assets/images/pd-interior.svg';
import pdBathroom from '../../../assets/images/pd-bathrooms.svg';
import sampleFloor from '../../../assets/images/sample-floor.svg';
import { getStaticMapUrl } from '../../../utils/googleMaps';
import markerMap from '../../../assets/images/marker-map.svg';
import GoogleMapWithMarker from '../../../components/GoogleMapWithMarker';
import ImageGalleryModal from '../../../components/ImageGalleryModal';
import AgentPropertyDetailsContactInfo from './AgentPropertyDetailsContactInfo';
import barIcon from '../../../assets/images/bar.svg';
import ShareButton from '../../../components/ShareButton';

export interface PropertyDetailsHeaderProps {
  property: PropertyDetails;
}

export const PropertyDetailsHeader: React.FC<PropertyDetailsHeaderProps> = ({ property }) => {
  const navigate = useNavigate();
  const address = `${property.address}, ${property.city}, ${property.state}, ${property.country}`;
  const propertyType = property.property_type?.name || '';
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="font-bold text-lg mb-1">{address}</div>
        <div className="text-base mb-4">Property type : <span className="font-bold">{propertyType}</span></div>
      </div>
      <div className="flex gap-2">
        <ShareButton
          variant="green"
          title={`${property.name} - ${property.selling_price ? `$${property.selling_price.toLocaleString()}` : 'Contact for price'}`}
          text={`Check out this ${property.property_type?.name || 'property'} at ${property.address || 'this location'}. ${property.selling_price ? `Priced at $${property.selling_price.toLocaleString()}` : 'Contact for pricing'}`}
        />
        <button className="flex items-center gap-1 border px-4 py-2 rounded-lg text-green-900 border-green-200" onClick={() => navigate(`/agent/properties/${property.property_id}`)}><img src={editIcon} alt="Edit" className="w-4 h-4" /><span>Edit</span></button>
      </div>
    </div>
  );
};

interface AgentPropertyListingDetailsProps {
  property?: PropertyDetails;
}

// Remove the TABS array and all tab bar/tab switching logic.

const AgentPropertyListingDetails: React.FC<AgentPropertyListingDetailsProps> = ({ property: propProperty }) => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyDetails | null>(propProperty || null);
  const [loading, setLoading] = useState(!propProperty);
  const [error, setError] = useState<string | null>(null);
  // Remove activeTab state and tab switching logic
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [listingStrength, setListingStrength] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (propProperty) {
      setProperty(propProperty);
      if (typeof propProperty.listing_strength_percentage === 'number') {
        setListingStrength(propProperty.listing_strength_percentage);
      }
      return;
    }
    if (!id) return;
    setLoading(true);
    setError(null);
    api.get(`/agent/properties/${id}/`)
      .then(res => {
        const apiData = res.data?.data || res.data;
        const mapped = mapApiToPropertyDetails(apiData);
        setProperty(mapped);
        if (typeof mapped.listing_strength_percentage === 'number') {
          setListingStrength(mapped.listing_strength_percentage);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to fetch property details');
        setLoading(false);
      });
  }, [id, propProperty]);

  function mapApiToPropertyDetails(apiData: any): PropertyDetails {
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
      agent: apiData.agent_detail || apiData.agent || { id: apiData.agent, name: '' },
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
      save_count: apiData.save_count,
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
      is_saved: apiData.is_saved,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at,
      listing_strength_percentage: apiData.listing_strength_percentage !== undefined
        ? Number(apiData.listing_strength_percentage)
        : 0,
      building_rooms: apiData.building_rooms || [],
    };
  }

  if (loading) {
    return <div className="w-full h-96 flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="w-full text-center py-8 text-red-500">{error}</div>;
  }
  if (!property) {
    return <div className="w-full text-center py-8">No property found.</div>;
  }

  // API-driven values
  const address = `${property.address}, ${property.city}, ${property.state}, ${property.country}`;
  const propertyType = property.property_type?.name || '';
  const mainImage = property.mainphoto_url || property.property_photos?.[0]?.url || 'https://via.placeholder.com/800x428?text=No+Image';
  const views = property.view_count || 0;
  const saves = property.is_saved ? 1 : 0; // Replace with actual saves if available
  const other = 135; // Placeholder, replace with API value if available

  // Listing strength (example values, replace with API if available)
  const profileStrength = 68;
  const checklist = [
    { icon: playBtn, label: 'Add a video', desc: 'Make your listing stand out' },
    { icon: floorBtn, label: 'Add Floorplan', desc: 'Make your property deep plan to portrait' },
    { icon: virtualTourBtn, label: 'Add a 3D model for Virtual tour', desc: 'Make it attractive and experience the property' },
    { icon: pdHome, label: 'Add more photos', desc: '20+ photos get more views' },
  ];

  const galleryImages = property.property_photos?.map((p) => ({ url: p.url, caption: p.caption })) || [];
  const photoCount = galleryImages.length;
  const gridImagesToShow = galleryImages.slice(0, 5);

  return (
    <div className="w-full">
      {/* Only render the listing details content here. No tab bar. */}
      <PropertyDetailsHeader property={property} />
      {/* Removed the contact info card here */}
      <div className="flex gap-8 mt-8">
        {/* Left: Main photo (70%) */}
        <div className="w-[70%]">
          <div className="relative rounded-xl overflow-hidden" style={{ height: 340 }}>
            <img src={mainImage} alt="Property" className="w-full h-full object-cover" />
            {/* Overlay stats */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                background: 'linear-gradient(358.85deg, rgba(0, 66, 54, 0.9) 3.14%, rgba(26, 142, 194, 0.1) 37.65%), linear-gradient(179.43deg, rgba(26, 142, 194, 0.4) 3.13%, rgba(0, 66, 54, 0) 72.82%)',
                borderRadius: 12,
              }}
            >
              <div className="absolute left-6 bottom-6 flex items-center gap-6">
                <img src={barIcon} alt="Bar Icon" className="w-8 h-8" />
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-2xl text-white">{property.view_count ?? 0}</span>
                      <span className="text-xs text-white">Views</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-2xl text-white">{property.save_count ?? 0}</span>
                      <span className="text-xs text-white">Saves</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Property listing strength card (30%) */}
        <div className="w-[30%] flex items-stretch">
          <div className="bg-white rounded-xl shadow p-6 w-full flex flex-col gap-2">
            <div>
              <div className="font-semibold text-lg mb-2">Property listing strength</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${listingStrength}%` }}
                />
              </div>
              <div className="text-xs mb-2">Your profile is <b>{listingStrength}%</b> complete</div>
              <div className="text-xs text-gray-600 mb-4">We've analysed your listing and it looks great! You can make it stand out by adding just few more details</div>
            </div>
            <ul className="space-y-3">
              {checklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <img src={item.icon} alt="icon" className="w-6 h-6" />
                  <div>
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex gap-8 mt-12">
        {/* Left: About, Location, Amenities, Floorplans (70%) */}
        <div className="w-[70%]">
          {/* About Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{
              fontFamily: 'DM Serif Display',
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
            }}>About - {property.name}</h2>
            <div className="text-gray-800 text-base mb-4">{property.details || '--'}</div>
            <div className="flex gap-8 mt-8 mb-6 w-full">
              <div className="flex flex-1 items-start gap-3">
                <img src={pdHome} alt="Property Type" className="w-8 h-8 mt-1" />
                <div>
                  <div className="text-xs text-[#757575] font-semibold tracking-wide uppercase">PROPERTY TYPE</div>
                  <div className="text-2xl font-bold text-[#181A1B] leading-tight">{property.property_type?.name || '--'}</div>
                </div>
              </div>
              <div className="flex flex-1 items-start gap-3">
                <img src={pdInterior} alt="Status" className="w-9 h-9 mt-1" />
                <div>
                  <div className="text-xs text-[#757575] font-semibold tracking-wide uppercase">STATUS</div>
                  <div className="text-2xl font-bold text-[#181A1B] leading-tight">{property.property_status || '--'}</div>
                </div>
              </div>
              <div className="flex flex-1 items-start gap-3">
                <img src={pdHome} alt="Year Built" className="w-8 h-8 mt-1" />
                <div>
                  <div className="text-xs text-[#757575] font-semibold tracking-wide uppercase">YEAR BUILT</div>
                  <div className="text-2xl font-bold text-[#181A1B] leading-tight">{property.year_built || '--'}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Location Section with Google MapWithMarker */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{
              fontFamily: 'DM Serif Display',
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
            }}>Location</h2>
            <div style={{ width: 180, height: 2, background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 100%, #905E26 100%)', borderRadius: 2, margin: '8px 0 24px 0' }} />
            <div className="text-black text-lg font-[550] text-[20px] mb-4">{[property.address, property.city, property.state, property.country].filter(Boolean).join(', ') || '--'}</div>
            <div className="rounded-xl overflow-hidden shadow" style={{ width: '100%', height: 420, background: '#f3f3f3', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <GoogleMapWithMarker
                markers={[{
                  position: { lat: property.latitude, lng: property.longitude },
                  title: property.name,
                  address: property.address,
                  city: property.city,
                  state: property.state,
                  country: property.country,
                  price: property.selling_price,
                  image: property.mainphoto_url || property.property_photos?.[0]?.url || '',
                }]}
              />
            </div>
          </div>
          {/* Amenities & Features Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{
              fontFamily: 'DM Serif Display',
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
            }}>Amenities & Features</h2>
            <div style={{ width: 180, height: 2, background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 100%, #905E26 100%)', borderRadius: 2, margin: '8px 0 24px 0' }} />
            {/* Interior Section */}
            <div style={{ borderRadius: 4, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Interior</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px 0 24px', gap: 32 }}>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>BASEMENT</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.basement_types?.map(f => f.name).join(', ') || '--'}</div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>FLOOR COVERINGS</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.floor_coverings?.map(f => f.name).join(', ') || '--'}</div>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>BEDROOMS</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.bedrooms ?? '--'}</div>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>PARTIAL BATH</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.half_bathrooms ?? '--'}</div>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>FULL BATHROOMS</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.full_bathrooms ?? '--'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px', gap: 32 }}>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4, marginTop: 12 }}>APPLIANCES</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.appliance_types?.map(a => a.name).join(', ') || '--'}</div>
                </div>
              </div>
            </div>
            {/* Rooms Section */}
            {property.building_rooms && property.building_rooms.length > 0 && (
              <div style={{ borderRadius: 4, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Rooms</div>
                <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                  {property.building_rooms.map((room: any, idx: number) => (
                    <div key={room.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
                      <img 
                        src={`https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80&${idx}`} 
                        alt={room.name || room.value} 
                        style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} 
                      />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#333', textAlign: 'center' }}>
                        {room.name || room.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Additional Features Section */}
            <div style={{ borderRadius: 4, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Additional Features</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px', gap: 32 }}>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>INDOOR FEATURES</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {property.indoor_features && property.indoor_features.length > 0
                      ? property.indoor_features.map(f => f.name).join(', ')
                      : '--'}
                  </div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>OUTDOOR AMENITIES</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {property.outdoor_amenities && property.outdoor_amenities.length > 0
                      ? property.outdoor_amenities.map(f => f.name).join(', ')
                      : '--'}
                  </div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>VIEWS</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {property.view_types && property.view_types.length > 0
                      ? property.view_types.map(v => v.name).join(', ')
                      : '--'}
                  </div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>COMMUNITY FEATURES</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {property.community_types && property.community_types.length > 0
                      ? property.community_types.map(c => c.name).join(', ')
                      : '--'}
                  </div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>PARKING LOT</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.parking_spaces ?? '--'}</div>
                </div>
              </div>
            </div>
            {/* Building Section */}
            <div style={{ borderRadius: 4, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Building</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px', gap: 32 }}>
                <div style={{ minWidth: 120 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>YEAR BUILT</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.year_built ?? '--'}</div>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>STYLE</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.architectural_styles?.map(f => f.name).join(', ') || '--'}</div>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>TOTAL SQ. FT.</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.total_sqft ? property.total_sqft.toLocaleString() : '--'}</div>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>LOT SIZE</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.lot_size ? property.lot_size + ' ' + (property.lot_size_uom || '') : '--'}</div>
                </div>
              </div>
            </div>
            {/* Listing Type Section */}
            <div style={{ borderRadius: 4, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Listing Type</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px', gap: 32 }}>
                <div style={{ minWidth: 180 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>PROPERTY ID</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.unit_number || '--'}</div>
                </div>
                <div style={{ minWidth: 180 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>PROPERTY TYPE</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.property_type?.name || '--'}</div>
                </div>
                <div style={{ minWidth: 180 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>MARKETED BY</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Agent : {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.username ? property.agent.id.username : '--'}</div>
                </div>
                <div style={{ minWidth: 180 }}>
                  <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>STATUS</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{property.property_status || '--'}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Floorplans Section */}
          <div className="mb-8" style={{ borderRadius: 4, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>
              Floor Plan
            </div>
            <div style={{ padding: 24 }}>
              {property.property_floorplans && property.property_floorplans.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                  {property.property_floorplans.map((plan, idx) => (
                    <img
                      key={idx}
                      src={plan.url}
                      alt={`Floor Plan ${idx + 1}`}
                      style={{ width: '100%', maxWidth: 700, borderRadius: 8, margin: '0 auto', display: 'block' }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>No floor plan available</div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Property Details Card, Agent Card, Photo Grid (30%) */}
        <div className="w-[30%] flex flex-col gap-8">
          {/* Property Details Card */}
          <div className="bg-white rounded-2xl shadow p-8 border border-[#ECECEC]">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 items-center">
              <div className="flex items-center gap-3">
                <img src={pdHome} alt="Bedroom(s)" className="w-8 h-8" />
                <div>
                  <div className="text-xs font-bold text-[#3B414D] tracking-wide text-left">BEDS</div>
                  <div className="text-xl font-bold text-black mt-1">{property.bedrooms ?? '--'} Bedroom(s)</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img src={pdInterior} alt="Interior" className="w-8 h-8" />
                <div>
                  <div className="text-xs font-bold text-[#3B414D] tracking-wide text-left">INTERIOR</div>
                  <div className="text-xl font-bold text-black mt-1">{property.total_sqft ? property.total_sqft.toLocaleString() : '--'} Sq. Ft.</div>
                </div>
              </div>
              <div className="col-span-2 my-2 border-t border-[#ECECEC]" />
              <div className="flex items-center gap-3">
                <img src={pdBathroom} alt="Bathroom(s)" className="w-8 h-8" />
                <div>
                  <div className="text-xs font-bold text-[#3B414D] tracking-wide text-left">BATH</div>
                  <div className="text-xl font-bold text-black mt-1">{property.full_bathrooms ?? '--'} Bathrooms</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img src={pdHome} alt="Exterior" className="w-8 h-8" />
                <div>
                  <div className="text-xs font-bold text-[#3B414D] tracking-wide text-left">EXTERIOR</div>
                  <div className="text-xl font-bold text-black mt-1">{property.total_sqft ? property.total_sqft.toLocaleString() : '--'} Sq. Ft.</div>
                </div>
              </div>
            </div>
          </div>
          {/* Agent Card */}
          <div className="rounded-2xl shadow p-6 flex flex-col items-start" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}>
            <div className="flex items-center mb-6 w-full">
              <img src={property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.profile_photo_url ? property.agent.id.profile_photo_url : 'https://randomuser.me/api/portraits/men/32.jpg'} alt="Agent" className="w-16 h-16 rounded-full object-cover mr-4" />
              <div>
                <div className="font-bold text-white text-xl mb-1">{property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.username ? property.agent.id.username : '--'}</div>
                <div className="text-white text-base mb-1">Agent</div>
                {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.email && (
                  <div className="text-white text-xs mb-1">{property.agent.id.email}</div>
                )}
                {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.mobile_number && (
                  <div className="text-white text-xs mb-1">{property.agent.id.mobile_number}</div>
                )}
              </div>
            </div>
            <div className="flex gap-4 w-full mt-2">
              <button className="flex-1 bg-white text-[#007E67] py-3 rounded-xl font-semibold text-lg transition hover:bg-gray-100 border-none">Contact Agent</button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-lg transition hover:bg-[#f6e27a1a] bg-transparent" style={{ color: 'white', border: '1px solid', borderImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%) 1', borderRadius: 10 }}>
                <img src={virtualTourBtn} alt="VR Tour" className="w-6 h-6" />
                VR Tour
              </button>
            </div>
          </div>
          {/* Photo Grid Section */}
          <div>
            <h3 className="text-lg font-bold mb-2">Photo Gallery</h3>
            <div className="grid grid-cols-2 gap-2 relative" style={{ minHeight: 140 }}>
              {gridImagesToShow.map((img, idx) => {
                // If last image and more than 5, show overlay
                if (idx === 4 && photoCount > 5) {
                  return (
                    <div key={idx} className="relative cursor-pointer" onClick={() => { setGalleryIndex(idx); setShowGalleryModal(true); }}>
                      <img src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <div className="absolute inset-0 flex items-center justify-center cursor-pointer" style={{ background: 'rgba(0, 42, 36, 0.75)', borderRadius: 12 }}>
                        <div className="flex flex-col items-center text-white font-semibold">
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="2" stroke="white" strokeWidth="2" /><path d="M8 11h.01M12 11h.01M16 11h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                          <span>Show more (+{photoCount - 5})</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                    onClick={() => { setGalleryIndex(idx); setShowGalleryModal(true); }}
                  />
                );
              })}
            </div>
            <ImageGalleryModal
              images={galleryImages}
              open={showGalleryModal}
              onClose={() => setShowGalleryModal(false)}
              initialIndex={galleryIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPropertyListingDetails; 