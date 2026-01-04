import React from 'react';
import { PropertyDetails } from '../../PropertyDetails/types';
import pdHome from '../../../assets/images/pd-home.svg';
import pdInterior from '../../../assets/images/pd-interior.svg';
import pdBathroom from '../../../assets/images/pd-bathrooms.svg';
import GoogleMapWithMarker from '../../../components/GoogleMapWithMarker';

interface AgentPropertyListingDetailsMobileProps {
  property?: PropertyDetails;
}

const AgentPropertyListingDetailsMobile: React.FC<AgentPropertyListingDetailsMobileProps> = ({ property }) => {
  if (!property) {
    return <div className="w-full h-96 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Promote Yourself / Listing Strength Card */}
      <div className="bg-white rounded-xl shadow p-4 mb-2">
        <div className="font-semibold text-base mb-2">Property listing strength</div>
        <div className="w-full bg-[#EAF4F2] rounded-full h-3 mb-2 overflow-hidden">
          <div
            className="bg-[#007E67] h-3 rounded-full transition-all duration-700"
            style={{ width: `${property.listing_strength_percentage ?? 0}%` }}
          />
        </div>
        <div className="text-xs text-[#007E67] font-medium">
          Your profile is <span className="font-bold">{property.listing_strength_percentage ?? 0}%</span> complete
        </div>
      </div>
      {/* Main Photo with Views and Saves overlay */}
      {property.mainphoto_url && (
        <div className="relative w-full mb-4 rounded-xl overflow-hidden" style={{ height: 220 }}>
          <img src={property.mainphoto_url} alt="Property" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex justify-between items-end">
            <div className="flex flex-col items-start">
              <span className="text-white text-xs">Views</span>
              <span className="text-lg font-bold text-white">{property.view_count ?? 0}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white text-xs">Saves</span>
              <span className="text-lg font-bold text-white">{property.save_count ?? 0}</span>
            </div>
          </div>
        </div>
      )}
      {/* About Section */}
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-bold mb-3 text-green-900">About - {property.name}</h2>
        <div className="text-gray-700 text-sm mb-4 leading-relaxed">
          {property.details || 'No description available.'}
        </div>
        {/* Key Property Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <img src={pdHome} alt="Property Type" className="w-6 h-6" />
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">PROPERTY TYPE</div>
              <div className="text-sm font-bold text-gray-900">{property.property_type?.name || '--'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src={pdInterior} alt="Status" className="w-6 h-6" />
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">STATUS</div>
              <div className="text-sm font-bold text-gray-900">{property.property_status || '--'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src={pdHome} alt="Year Built" className="w-6 h-6" />
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">YEAR BUILT</div>
              <div className="text-sm font-bold text-gray-900">{property.year_built || '--'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src={pdBathroom} alt="Bathrooms" className="w-6 h-6" />
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">BATHROOMS</div>
              <div className="text-sm font-bold text-gray-900">{property.full_bathrooms || '--'}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Location Section */}
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-bold mb-3 text-green-900">Location</h2>
        <div className="text-gray-700 text-base font-medium mb-4">
          {[property.address, property.city, property.state, property.country].filter(Boolean).join(', ') || '--'}
        </div>
        <div className="w-full rounded-none overflow-hidden shadow-sm" style={{ height: '50vh', minHeight: 320 }}>
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
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-bold mb-3 text-green-900">Amenities & Features</h2>
        {/* Interior Section */}
        <div className="mb-4">
          <div className="bg-gray-100 px-3 py-2 rounded-t-lg font-semibold text-gray-800">Interior</div>
          <div className="border border-gray-200 rounded-b-lg p-3 space-y-3">

            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">BASEMENT</div>
              <div className="text-sm font-medium text-gray-900">
                {property.basement_types?.map(f => f?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">FLOOR COVERINGS</div>
              <div className="text-sm font-medium text-gray-900">
                {property.floor_coverings?.map(f => f?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">BEDROOMS</div>
                <div className="text-sm font-medium text-gray-900">{property.bedrooms ?? '--'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">FULL BATHROOMS</div>
                <div className="text-sm font-medium text-gray-900">{property.full_bathrooms ?? '--'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">PARTIAL BATH</div>
                <div className="text-sm font-medium text-gray-900">{property.half_bathrooms ?? '--'}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">APPLIANCES</div>
              <div className="text-sm font-medium text-gray-900">
                {property.appliance_types?.map(a => a?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
            </div>
          </div>
        </div>
        {/* Additional Features Section */}
        <div className="mb-4">
          <div className="bg-gray-100 px-3 py-2 rounded-t-lg font-semibold text-gray-800">Additional Features</div>
          <div className="border border-gray-200 rounded-b-lg p-3 space-y-3">
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">INDOOR FEATURES</div>
              <div className="text-sm font-medium text-gray-900">
                {property.indoor_features?.map(f => f?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">OUTDOOR AMENITIES</div>
              <div className="text-sm font-medium text-gray-900">
                {property.outdoor_amenities && property.outdoor_amenities.length > 0
                  ? property.outdoor_amenities.map(f => f?.name || '').filter(Boolean).join(', ')
                  : '--'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">VIEWS</div>
              <div className="text-sm font-medium text-gray-900">
                {property.view_types?.map(v => v?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">COMMUNITY FEATURES</div>
              <div className="text-sm font-medium text-gray-900">
                {property.community_types && property.community_types.length > 0
                  ? property.community_types.map(c => c?.name || '').filter(Boolean).join(', ')
                  : '--'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">PARKING LOT</div>
              <div className="text-sm font-medium text-gray-900">{property.parking_spaces ?? '--'}</div>
            </div>
          </div>
        </div>
        {/* Building Section */}
        <div className="mb-4">
          <div className="bg-gray-100 px-3 py-2 rounded-t-lg font-semibold text-gray-800">Building</div>
          <div className="border border-gray-200 rounded-b-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">YEAR BUILT</div>
                <div className="text-sm font-medium text-gray-900">{property.year_built ?? '--'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">STYLE</div>
                <div className="text-sm font-medium text-gray-900">
                  {property.architectural_styles?.map(f => f?.name || '').filter(Boolean).join(', ') || '--'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">TOTAL SQ. FT.</div>
                <div className="text-sm font-medium text-gray-900">
                  {property.total_sqft ? property.total_sqft.toLocaleString() : '--'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">LOT SIZE</div>
                <div className="text-sm font-medium text-gray-900">
                  {property.lot_size ? property.lot_size + ' ' + (property.lot_size_uom || '') : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Listing Type Section */}
        <div>
          <div className="bg-gray-100 px-3 py-2 rounded-t-lg font-semibold text-gray-800">Listing Type</div>
          <div className="border border-gray-200 rounded-b-lg p-3 space-y-3">
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">PROPERTY ID</div>
              <div className="text-sm font-medium text-gray-900">{property.unit_number || '--'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">PROPERTY TYPE</div>
              <div className="text-sm font-medium text-gray-900">{property.property_type?.name || '--'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">MARKETED BY</div>
              <div className="text-sm font-medium text-gray-900">
                Agent: {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.username ? property.agent.id.username : '--'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">STATUS</div>
              <div className="text-sm font-medium text-gray-900">{property.property_status || '--'}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Floorplans Section */}
      {property.property_floorplans && property.property_floorplans.length > 0 && (
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-xl font-bold mb-3 text-green-900">Floor Plan</h2>
          <div className="space-y-3">
            {property.property_floorplans.map((plan, idx) => (
              <img
                key={idx}
                src={plan.url}
                alt={`Floor Plan ${idx + 1}`}
                className="w-full rounded-lg border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPropertyListingDetailsMobile; 