import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DesktopPropertyDetailsUI from '../../../PropertyDetails/DesktopPropertyDetailsUI';
import api from '../../../../utils/api';
import ButtonLoader from '../../../../components/ButtonLoader';
import successImg from '../../../../assets/images/success-img.svg';

const PropertyReview = ({ initialValues, onBack, onSaveDraft, onPublish, onUnpublish }: { 
  initialValues: any; 
  onBack: () => void; 
  onSaveDraft: () => void; 
  onPublish: () => void;
  onUnpublish?: () => void;
}) => {
  const [loading, setLoading] = React.useState<'draft' | 'publish' | 'unpublish' | null>(null);
  const { id } = useParams<{ id: string }>();
  const [masterData, setMasterData] = React.useState<any>({
    appliances: [],
    outdoorAmenities: [],
    view: [],
    community: [],
    basementtype: [],
    architecturalstyle: [],
    floorcovering: [],
  });

  React.useEffect(() => {
    api.post('/common/master/list/', {
      tables: ['appliancetype', 'outdooramenity', 'indoorfeature', 'viewtype', 'communitytype', 'roomtype', 'basementtype', 'architecturalstyle', 'floorcovering', 'propertystatus']
    }).then((response: any) => {
      setMasterData({
        appliances: response.data.appliancetype || [],
        outdoorAmenities: response.data.outdooramenity || [],
        indoorFeatures: response.data.indoorfeature || [],
        view: response.data.viewtype || [],
        community: response.data.communitytype || [],
        roomtype: response.data.roomtype || [],
        basementtype: response.data.basementtype || [],
        architecturalstyle: response.data.architecturalstyle || [],
        floorcovering: response.data.floorcovering || [],
        propertystatus: response.data.propertystatus || [],
      });
    });
  }, []);

  useEffect(() => {
      console.log('PropertyReview: initialValues received:', initialValues);
      console.log('PropertyReview: propertyStatus in initialValues:', initialValues?.propertyStatus);
  }, [initialValues]);

  // Helper to map selected IDs to display names using master data
  function toNameArray(ids: any[] = [], masterList: any[] = []) {
    return ids.map(item => {
      // Handle both simple IDs and objects with id/value properties
      const id = typeof item === 'object' && item !== null ? item.id : item;
      const value = typeof item === 'object' && item !== null ? (item.value || item.name) : null;
      
      // If we have a value from the object, use it
      if (value) {
        return { id, name: value };
      }
      
      // Otherwise, try to find in master data
      const found = masterList.find(masterItem => masterItem.id === id);
      return found ? { id, name: found.value || found.name } : { id, name: String(id) };
    });
  }

  // Map initialValues to PropertyDetails format for DesktopPropertyDetailsUI
  function mapToPropertyDetails(values: any): any {
    console.log('PropertyReview: mapToPropertyDetails called with values:', values);
    console.log('PropertyReview: propertyStatus from values:', values.propertyStatus);
    console.log('PropertyReview: masterData.propertystatus:', masterData.propertystatus);
    
    const normalizeRooms = (rooms: any[] = []) => {
      if (!rooms || rooms.length === 0) return [];
      
      const result = rooms.map((room: any) => {
        // If room is already an object with name/value, return as is
        if (room && typeof room === 'object' && room.name && room.value) {
          console.log('PropertyReview: Room already has name/value:', room);
          return room;
        }
        
        // Try to find room in master data
        if (masterData.roomtype && masterData.roomtype.length > 0) {
          const found = masterData.roomtype.find((item: any) => {
            console.log('PropertyReview: Comparing room.id:', room.id, 'with master item.id:', item.id);
            return item.id === room.id || item.id === room;
          });
          
          if (found) {
            console.log('PropertyReview: Found room in master data:', found);
            return {
              id: found.id,
              name: found.value,
              value: found.value
            };
          }
          
          // If room object has id but no name/value, try to find it in master data
          if (room.id && !room.name && !room.value) {
            const foundById = masterData.roomtype?.find((item: any) => item.id === room.id);
            if (foundById) {
              console.log('PropertyReview: Found room by ID in master data:', foundById);
              return {
                id: foundById.id,
                name: foundById.value,
                value: foundById.value
              };
            }
          }
        }
        
        // Fallback
        console.log('PropertyReview: Using fallback for room:', room);
        return { id: room, name: 'Room', value: 'Room' };
      });
      
      console.log('PropertyReview: normalizeRooms result:', result);
      return result;
    };

    // Helper function to get property status name from ID
    const getPropertyStatusName = (statusIds: any[] = []) => {
      console.log('PropertyReview: getPropertyStatusName called with statusIds:', statusIds);
      if (!statusIds || statusIds.length === 0) {
        console.log('PropertyReview: No status IDs provided, returning default');
        return 'For Sale';
      }
      
      // Get the first status ID (since it's now single select)
      const statusId = statusIds[0];
      console.log('PropertyReview: Using status ID:', statusId);
      
      // Find the status name in master data
      if (masterData.propertystatus && masterData.propertystatus.length > 0) {
        const found = masterData.propertystatus.find((item: any) => {
          console.log('PropertyReview: Comparing status ID:', statusId, 'with master item.id:', item.id);
          return item.id === statusId;
        });
        if (found) {
          console.log('PropertyReview: Found status in master data:', found);
          return found.value;
        }
      }
      
      console.log('PropertyReview: Status not found in master data, returning default');
      return 'For Sale'; // Fallback
    };

    const propertyStatusName = getPropertyStatusName(values.propertyStatus);
    console.log('PropertyReview: Final property status name:', propertyStatusName);

    return {
      property_id: values.property_id || values.id || '',
      name: values.name || '',
      status: values.status || 'draft',
      property_status: propertyStatusName,
      listing_type: values.listing_type || 'For Sale',
      selling_price: values.sellingPrice ? Number(values.sellingPrice) : 0,
      max_hoa_fees: values.max_hoa_fees ? Number(values.max_hoa_fees) : '',
      agent: { 
        id: values.agent?.user_id, 
        name: values.agent?.username || values.agent?.first_name + ' ' + values.agent?.last_name,
        profile_photo_url: values.agent?.profile_photo_url
      },
      home_type: values.homeType || 'Single Family Home',
      address: values.address || '',
      unit_number: values.unitNumber || '',
      city: values.city_detail?.name || '',
      state: values.state_detail?.name || '',
      country: values.country_detail?.name || '',
      postal_code: values.postalCode || '',
      latitude: values.lat ? Number(values.lat) : 0,
      longitude: values.lng ? Number(values.lng) : 0,
      lot_size: values.lotSize ? Number(values.lotSize) : 0,
      lot_size_uom: values.lotSizeUnit || 'Sq. Ft.',
      total_sqft: values.totalSqft ? Number(values.totalSqft) : 0,
      basement_sqft: values.basementSqft ? Number(values.basementSqft) : 0,
      year_built: values.yearBuilt ? Number(values.yearBuilt) : new Date().getFullYear(),
      bedrooms: values.bedrooms || '0',
      full_bathrooms: values.fullBathrooms || '0',
      half_bathrooms: values.halfBathrooms || '0',
      details: values.details || '',
      total_rooms: values.totalRooms || '0',
      parking_spaces: values.parkingSpaces || '0',
      num_stories: values.stories || '1',
      view_count: 0,
      mainphoto_url: values.property_photos?.[0]?.url || '',
      photos: {
        "count" : values.property_photos.length,
        "results" : values.property_photos?.map((photo: any) => ({
          id: photo.id,
          url: photo.url,
          type: 'photo',
          isMain: photo.main_photo || false,
          name: photo.caption || 'Property Photo',
          sort_order: photo.sort_order || 0
        }))
      },
      videos: values.property_videos || [],
      property_floorplans: values.property_floorplans || [],
      virtual_tours: values.property_virtual_tours || [],
      outdoor_amenities: toNameArray(values.outdoorAmenities, masterData.outdoorAmenities),
      indoor_features: toNameArray(values.indoorFeatures, masterData.indoorFeatures),
      appliance_types: toNameArray(values.appliances, masterData.appliances),
      view_types: toNameArray(values.view, masterData.view),
      community_types: toNameArray(values.community, masterData.community),
      is_saved: false,
      architectural_styles: toNameArray(values.architecturalStyle || [], masterData.architecturalstyle || []),
      building_rooms: normalizeRooms(values.buildingRooms),
      exterior: values.exterior || [],
      floor_coverings: toNameArray(values.floorCovering || [], masterData.floorcovering || []),
      basement_types: toNameArray(values.basementTypes || [], masterData.basementtype || []),
      parking: values.parking || [],
      roof: values.roof || [],
      property_type:{ id : values.propertyType?.id , name : values.propertyType?.name },

    };
  }

  return (
    <div className="w-full px-2 py-8 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="text-2xl font-bold mb-1">Review and publish your listing</div>
          <div className="text-base text-[#222] mb-0">{initialValues?.address}, {initialValues?.city_detail?.name}, {initialValues?.state_detail?.name}, {initialValues?.country_detail?.name}, {initialValues?.postalCode}</div>
        <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{initialValues?.propertyType?.name}</span></div>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          {!id && (
            <button
              onClick={async () => {
                setLoading('draft');
                await onSaveDraft();
                await new Promise(res => setTimeout(res, 500));
                setLoading(null);
              }}
              className="px-6 py-2 border border-[#007E67] rounded text-[#007E67] font-semibold bg-white hover:bg-[#F3F3F3] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading === 'draft' || loading === 'publish' || loading === 'unpublish'}
            >
              {loading === 'draft' ? <ButtonLoader text="Saving..." /> : 'Save as draft'}
            </button>
          )}
          {id && initialValues?.status === 'published' && onUnpublish && (
            <button
              onClick={async () => {
                setLoading('unpublish');
                await onUnpublish();
                await new Promise(res => setTimeout(res, 500));
                setLoading(null);
              }}
              className="px-6 py-2 border border-red-600 rounded text-red-600 font-semibold bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading === 'draft' || loading === 'publish' || loading === 'unpublish'}
            >
              {loading === 'unpublish' ? <ButtonLoader text="Unpublishing..." /> : 'Unpublish'}
            </button>
          )}
          <button
            onClick={async () => {
              setLoading('publish');
              await onPublish();
              await new Promise(res => setTimeout(res, 500));
              setLoading(null);
            }}
            className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading === 'draft' || loading === 'publish' || loading === 'unpublish'}
          >
            {loading === 'publish' ? <ButtonLoader text="Publishing..." /> : 'Publish'}
          </button>
        </div>
      </div>
      {/* Other review components will be added here */}
      <DesktopPropertyDetailsUI
        property={mapToPropertyDetails(initialValues)}
        preview={'yes'}
        activeTab="overview"
        setActiveTab={() => {}}
        onToggleSave={() => {}}
      />
      {(loading === 'draft' || loading === 'publish' || loading === 'unpublish') && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <ButtonLoader text={
              loading === 'draft' ? 'Saving...'
              : loading === 'publish' ? 'Publishing...'
              : loading === 'unpublish' ? 'Unpublishing...'
              : ''
            } />
          </div>
        </div>
      )}
    </div>
  );
};

export const PublishSuccessModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 md:px-12 w-full max-w-md flex flex-col items-center">
        <img src={successImg} alt="Success" className="w-40 h-40 mb-4" />
        <div className="text-2xl font-bold mb-2 text-center">Your property has been published!</div>
        <div className="text-base text-[#444] mb-8 text-center">Your listing is submitted and will be reviewed by Vistaview team and publish in the portal.</div>
        <button onClick={() => navigate('/agent/properties/listings')} className="w-full px-8 py-3 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow text-base">Continue</button>
      </div>
    </div>
  ) : null;
};

export default PropertyReview; 