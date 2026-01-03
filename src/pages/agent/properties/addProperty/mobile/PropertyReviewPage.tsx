import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileAddPropertyTabs from './MobileAddPropertyTabs';
import BottomModal from '../../../../../components/BottomModal';
import { MobilePropertyWizardProvider, useMobilePropertyWizard } from './MobilePropertyWizardContext';
import MobilePropertyDetailsUI from '../../../../PropertyDetails/MobilePropertyDetailsUI';
import usePropertyDetails from '../../../../PropertyDetails/logic/usePropertyDetails';
import api from '../../../../../utils/api';
import successImg from '../../../../../assets/images/success-img.svg';

const PropertyReviewPageInner: React.FC = () => {
  const { handlePropertyReviewBack, handlePropertyReviewSaveDraft, handlePropertyReviewPublish, handlePropertyReviewUnpublish, propertyInfoData, setPropertyInfoData } = useMobilePropertyWizard();
  const { saveProperty } = useMobilePropertyWizard();
  const [loading, setLoading] = useState<'draft' | 'publish' | 'unpublish' | null>(null);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {error, activeTab, setActiveTab } = usePropertyDetails();
  const [masterData, setMasterData] = useState<any>({ 
    appliancetype: [], 
    communitytype: [],
    floorcovering: [],
    architecturalstyle: [],
    indoorfeature: [],
    outdooramenity: [],
    viewtype: [],
    basementtype: [],
  });

  useEffect(() => {
    console.log('PropertyReviewPage: propertyInfoData received:', propertyInfoData);
    console.log('PropertyReviewPage: propertyStatus in propertyInfoData:', propertyInfoData?.propertyStatus);
  }, [propertyInfoData]);

  useEffect(() => {
    api.post('/common/master/list/', { 
      tables: ['appliancetype', 'communitytype', 'floorcovering', 'architecturalstyle', 'indoorfeature', 'outdooramenity', 'viewtype', 'roomtype', 'basementtype', 'propertystatus'] 
    }).then((response: any) => {
      setMasterData({
        appliancetype: response.data.appliancetype || [],
        communitytype: response.data.communitytype || [],
        floorcovering: response.data.floorcovering || [],
        architecturalstyle: response.data.architecturalstyle || [],
        indoorfeature: response.data.indoorfeature || [],
        outdooramenity: response.data.outdooramenity || [],
        viewtype: response.data.viewtype || [],
        roomtype: response.data.roomtype || [],
        basementtype: response.data.basementtype || [],
        propertystatus: response.data.propertystatus || [],
      });
    });
  }, []);

  // Map propertyInfoData to PropertyDetails format for DesktopPropertyDetailsUI
  function mapToPropertyDetails(values: any): any {
    console.log('PropertyReviewPage: mapToPropertyDetails called with values:', values);
    console.log('PropertyReviewPage: propertyStatus from values:', values.propertyStatus);
    console.log('PropertyReviewPage: masterData.propertystatus:', masterData.propertystatus);
    
    const toNameArrayWithMaster = (arr: any[] = [], masterList: any[] = []) =>
      arr.map((item: any) => {
        if (typeof item === 'object' && item !== null && item.name) {
          return item.name;
        }
        const found = masterList.find((masterItem: any) => masterItem.id === item);
        return found ? found.value : 'Unknown';
      });

    const getNumericValue = (value: any, fallback: number = 0) => {
      if (value === null || value === undefined || value === '') return fallback;
      const num = Number(value);
      return isNaN(num) ? fallback : num;
    };

    const normalizeRooms = (rooms: any[] = []) => {
      if (!rooms || rooms.length === 0) return [];
      
      const result = rooms.map((room: any) => {
        // If room is already an object with name/value, return as is
        if (room && typeof room === 'object' && room.name && room.value) {
          console.log('PropertyReviewPage: Room already has name/value:', room);
          return room;
        }
        
        // Try to find room in master data
        if (masterData.roomtype && masterData.roomtype.length > 0) {
          const found = masterData.roomtype.find((item: any) => {
            console.log('PropertyReviewPage: Comparing room.id:', room.id, 'with master item.id:', item.id);
            return item.id === room.id || item.id === room;
          });
          
          if (found) {
            console.log('PropertyReviewPage: Found room in master data:', found);
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
              console.log('PropertyReviewPage: Found room by ID in master data:', foundById);
              return {
                id: foundById.id,
                name: foundById.value,
                value: foundById.value
              };
            }
          }
        }
        
        // Fallback
        console.log('PropertyReviewPage: Using fallback for room:', room);
        return { id: room, name: 'Room', value: 'Room' };
      });
      
      console.log('PropertyReviewPage: normalizeRooms result:', result);
      return result;
    };

    // Helper function to get property status name from ID
    const getPropertyStatusName = (statusIds: any[] = []) => {
      console.log('PropertyReviewPage: getPropertyStatusName called with statusIds:', statusIds);
      if (!statusIds || statusIds.length === 0) {
        console.log('PropertyReviewPage: No status IDs provided, returning default');
        return 'For Sale';
      }
      
      // Get the first status ID (since it's now single select)
      const statusId = statusIds[0];
      console.log('PropertyReviewPage: Using status ID:', statusId);
      
      // Find the status name in master data
      if (masterData.propertystatus && masterData.propertystatus.length > 0) {
        const found = masterData.propertystatus.find((item: any) => {
          console.log('PropertyReviewPage: Comparing status ID:', statusId, 'with master item.id:', item.id);
          return item.id === statusId;
        });
        if (found) {
          console.log('PropertyReviewPage: Found status in master data:', found);
          return found.value;
        }
      }
      
      console.log('PropertyReviewPage: Status not found in master data, returning default');
      return 'For Sale'; // Fallback
    };

    const propertyStatusName = getPropertyStatusName(values.propertyStatus);
    console.log('PropertyReviewPage: Final property status name:', propertyStatusName);
    
    return {
      property_id: values.property_id || values.id || '',
      name: values.name || '',
      status: values.status || 'draft',
      property_status: propertyStatusName,
      listing_type: values.listing_type || 'For Sale',
      selling_price: getNumericValue(values.sellingPrice),
      max_hoa_fees: getNumericValue(values.max_hoa_fees),
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
      latitude: getNumericValue(values.lat),
      longitude: getNumericValue(values.lng),
      lot_size: getNumericValue(values.lotSize) || getNumericValue(values.lot_size),
      lot_size_uom: values.lotSizeUnit || values.lot_size_uom || 'Sq. Ft.',
      total_sqft: getNumericValue(values.totalSqft) || getNumericValue(values.total_sqft),
      basement_sqft: getNumericValue(values.basementSqft) || getNumericValue(values.basement_sqft),
      year_built: getNumericValue(values.yearBuilt, new Date().getFullYear()),
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
        "count" : values.property_photos?.length || 0,
        "results" : values.property_photos?.map((photo: any) => ({
          id: photo.id,
          url: photo.url,
          type: 'photo',
          isMain: photo.main_photo || false,
          name: photo.caption || 'Property Photo',
          sort_order: photo.sort_order || 0
        })) || []
      },
      videos: values.property_videos || [],
      property_floorplans: values.property_floorplans || [],
      virtual_tours: values.property_virtual_tours || [],
      outdoor_amenities: toNameArrayWithMaster(values.outdoorAmenities || [], masterData.outdooramenity),
      indoor_features: toNameArrayWithMaster(values.indoorFeatures || [], masterData.indoorfeature),
      appliance_types: toNameArrayWithMaster(values.appliances || [], masterData.appliancetype),
      view_types: toNameArrayWithMaster(values.view || [], masterData.viewtype),
      community_types: toNameArrayWithMaster(values.community || [], masterData.communitytype),
      is_saved: false,
      architectural_styles: toNameArrayWithMaster(values.architecturalStyle || [], masterData.architecturalstyle),
      building_rooms: normalizeRooms(values.buildingRooms),
      exterior: values.exterior || [],
      floor_coverings: toNameArrayWithMaster(values.floorCovering || [], masterData.floorcovering),
      basement_types: toNameArrayWithMaster(values.basementTypes || [], masterData.basementtype || []),
      parking: values.parking || [],
      roof: values.roof || [],
      property_type:{ id : values.propertyType?.id , name : values.propertyType?.name },
    };
  }

  const handleBack = () => {
    handlePropertyReviewBack();
  };

  const handleSaveDraft = async () => {
    setLoading('draft');
    // Always use the latest propertyInfoData (with id if present)
    await handlePropertyReviewSaveDraft();
    // Don't set loading to null here - let the context handle it
  };

  const handlePublish = async () => {
    setIsPublishing(true); // Show spinner overlay
    setLoading('publish');
    try {
      await handlePropertyReviewPublish();
      // If we reach here, the API call was successful
      setShowSuccessModal(true);
    } catch (e) {
      // Optionally show an error toast here
    }
    setLoading(null);
    setIsPublishing(false); // Hide spinner overlay
  };

  const handleUnpublish = async () => {
    setLoading('unpublish');
    // Ensure id is present for PUT
    const updated = { ...propertyInfoData, status: 'inactive', id: propertyInfoData?.id };
    await saveProperty(updated, 'inactive');
    setLoading(null);
  };

  const handlePublishSuccessClose = () => {
    setShowPublishSuccess(false);
    navigate('/agent/properties/listings');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/agent/properties/listings');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Spinner overlay for publishing */}
      {isPublishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}
      {/* Mobile Header */}
      <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none fixed top-0 left-0 w-full z-20" style={{maxWidth: '480px', margin: '0 auto'}}>
        <button
          className="mr-2 p-2 -ml-2"
          onClick={handleBack}
          aria-label="Back"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-green-900 text-2xl font-bold">{propertyInfoData?.id ? 'Update Property' : 'Add Property'}</span>
      </div>
      <div className="pt-24"> {/* Add padding to push content below fixed header */}
        <MobileAddPropertyTabs currentStep={5} />
      {/* Main Content */}
        <div className="flex flex-col px-6 pt-6 pb-8 mb-32"> {/* Add bottom margin for fixed footer */}
        
         {/* Other review components will be added here */}
      <MobilePropertyDetailsUI
        property={mapToPropertyDetails(propertyInfoData)}
        activeTab={activeTab} setActiveTab={setActiveTab}
        onToggleSave={() => {}}
        hideHeader={true}
        hideFooter={true}
        isPropertyAddUpdateFlow={true}
      />
        {/* Footer Buttons */}
        </div>
      </div>
      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white z-20 flex gap-4 px-6 py-4 border-t border-gray-200">
        {propertyInfoData?.status === 'published' ? (
          <button 
            className="flex-1 py-3 rounded-lg font-bold text-lg border-2 border-red-600 text-red-600 bg-white"
            onClick={handleUnpublish}
            disabled={loading === 'draft' || loading === 'publish' || loading === 'unpublish'}
          >
            {loading === 'unpublish' ? 'Unpublishing...' : 'Unpublish'}
          </button>
        ) : (
          <button 
            className="flex-1 py-3 rounded-lg font-bold text-lg border-2 border-green-900 text-green-900 bg-white"
            onClick={handleSaveDraft}
            disabled={loading === 'draft' || loading === 'publish' || loading === 'unpublish'}
          >
            {loading === 'draft' ? 'Saving...' : 'Save as draft'}
          </button>
        )}
        <button 
          className="gradient-btn-equal flex-1 py-3 rounded-lg font-bold text-lg shadow-lg"
          onClick={handlePublish}
          disabled={loading === 'draft' || loading === 'publish' || loading === 'unpublish'}
        >
          {loading === 'publish' ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {/* Publish Success Modal */}
      {showPublishSuccess && (
        <BottomModal
          open={showPublishSuccess}
          title="Success!"
          onCancel={handlePublishSuccessClose}
          onSubmit={handlePublishSuccessClose}
          submitLabel="Continue"
        >
          <div className="text-center">
            <img src={successImg} alt="Success" className="w-40 h-40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your property has been published!</h3>
            <p className="text-gray-600">Your listing is submitted and will be reviewed by Vistaview team and publish in the portal.</p>
          </div>
        </BottomModal>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <BottomModal
          open={showSuccessModal}
          title="Success!"
          onCancel={handleSuccessModalClose}
          onSubmit={handleSuccessModalClose}
          submitLabel="Continue"
        >
          <div className="text-center">
            <img src={successImg} alt="Success" className="w-40 h-40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your property has been published!</h3>
            <p className="text-gray-600">Your listing is submitted and will be reviewed by Vistaview team and publish in the portal.</p>
          </div>
        </BottomModal>
      )}
    </div>
  );
};

const PropertyReviewPage: React.FC = () => (
  <MobilePropertyWizardProvider>
    <PropertyReviewPageInner />
  </MobilePropertyWizardProvider>
);

export default PropertyReviewPage; 