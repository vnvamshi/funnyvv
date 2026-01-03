import React, { use, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PropertyLocation from './PropertyLocation';
import PropertyInfo from './PropertyInfo';
import PropertyMedia from './PropertyMedia';
import PropertyAmenities from './PropertyAmenities';
import PropertyContactInfo from './PropertyContactInfo';
import PropertyReview, { PublishSuccessModal } from './PropertyReview';
import TickIcon from '../../../../assets/images/tick-icon.svg';
import api from '../../../../utils/api';
import { showGlobalToast } from '../../../../utils/toast';
import { useContext } from 'react';
import { ToastContext } from '../../../../App';
import { useAuthData } from '../../../../contexts/AuthContext';
import { getAdjustedRect } from '@dnd-kit/core/dist/utilities';
import StepperComplete from '../../../../assets/images/stepper-complete.svg';
import StepperActive from '../../../../assets/images/stepper-active.svg';
import StepperIncomplete from '../../../../assets/images/stepper-incomplete.svg';
import { MasterDataProvider } from './hooks/useMasterDataContext';
import ButtonLoader from '../../../../components/ButtonLoader';

const TOTAL_STEPS = 6;

const AddOrUpdatePropertyWizard: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const initialData = location.state?.initialData || {};
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);   
  const [userData, setUserData] = useState<any>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);

  const agentId = useAuthData().user?.user_id;
  
  // Fallback to global toast if context is not available
  const showToastMessage = (message: string, duration?: number) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
    } else {
      showGlobalToast(message, duration);
    }
  };

  const [locationData, setLocationData] = useState({
    address: initialData.streetAddress || '',
    lat: initialData.lat || 18.5601, // default Punta Cana
    lng: initialData.lng || -68.3725,
    city: initialData.city?.name || '',
    state: initialData.state?.name || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country?.name || '',
    city_detail: initialData.city || null,
    state_detail: initialData.state|| null,
    country_detail: initialData.country || null,
    propertyType: initialData.propertyType || '',
    propertyType_detail: initialData.propertyType_detail || null,
    unitNumber: initialData.unitNumber || '',

  });
  const handleLocationDataChange = (updates: Partial<typeof locationData>) => {
    setLocationData(prev => ({ ...prev, ...updates }));
  };

  const [propertyInfoData, setPropertyInfoData] = useState({});
  // TODO: Add state for media and other steps as needed

  const handleLocationConfirm = () => {
    console.log("locationData", locationData);
    setPropertyInfoData({
      ...propertyInfoData,
      city: locationData.city_detail?.id || '',
      state: locationData.state_detail?.id || '',
      country: locationData.country_detail?.id || '',
      postalCode: locationData.postalCode,
      city_detail: locationData.city_detail,
      state_detail: locationData.state_detail,
      country_detail: locationData.country_detail,
      propertyType: locationData.propertyType_detail || locationData.propertyType,
      propertyType_detail: locationData.propertyType_detail || null,
      address: locationData.address,
      lat: locationData.lat,
      lng: locationData.lng,
      unitNumber: locationData.unitNumber,
    });
    setStep(2); // Go to next step (PropertyDetails)
  };

  const handleChangeLocation = () => {
    // This function is called when user wants to change location on map
    // The actual map editing is handled in the PropertyLocation component
    console.log('User wants to change location on map');
  };

  useEffect(() => {
    getUser();
  }, []);

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo(0, 0);
    // Also scroll all elements with .scrollable or [data-scrollable]
    document.querySelectorAll('.scrollable, [data-scrollable]').forEach(el => {
      if ('scrollTop' in el) (el as HTMLElement).scrollTop = 0;
    });
    console.log('Desktop wizard: ScrollToTop triggered for step', step);
  }, [step]);

  const getUser = async () => {
    const response = await api.get('/common/profile-subscription/');
    if(response?.data?.status_code === 200){
        if(response?.data?.data?.profile){
            setUserData(response?.data?.data?.profile);   
            setPropertyInfoData({
              ...propertyInfoData,
              agent: response?.data?.data?.profile
            })
        }
    }
  }

  const handleSelectOnMap = (lat: number, lng: number) => {
    console.log('Desktop handleSelectOnMap: Updating coordinates to:', { lat, lng });
    handleLocationDataChange({ lat, lng });
  };

  // Add saveProperty function here
  const saveProperty = async (values: any, status: string) => {
    setIsLoadingProperty(true);
    try {
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
        latitude: values.lat ? parseFloat(values.lat) : 18.5601,
        longitude: values.lng ? parseFloat(values.lng) : -68.3725,
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
        stories: values.stories, // from amenities step
        property_statuses: Array.isArray(values.propertyStatus) ? values.propertyStatus : [],
        listing_types: Array.isArray(values.listingType) ? values.listingType : [],
        mortgage_types: values.mortgageType ? [values.mortgageType] : [],
        max_hoa_fees: values.max_hoa_fees ? Number(values.max_hoa_fees) : undefined,
        room_types_input: (values.buildingRooms || []).map((item: any) => item.id),
        basement_types_input: (values.basementTypes || []).map((item: any) => item.id),
        floor_coverings_input: (values.floorCoverings || []).map((item: any) => item.id),
        architectural_styles_input: (values.architecturalStyles || []).map((item: any) => item.id),
        exterior_types_input: (values.exteriors || []).map((item: any) => item.id),
        roof_types_input: (values.roofs || []).map((item: any) => item.id),
        parking_types_input: (values.parkings || []).map((item: any) => item.id),
        appliance_types_input: (values.appliances || []).filter(Boolean),
        indoor_features_input: (values.indoorFeatures || []).filter(Boolean),
        outdoor_amenities_input: (values.outdoorAmenities || []).filter(Boolean),
        view_types_input: (values.view || []).filter(Boolean),
        community_types_input: (values.community || []).filter(Boolean),
        property_photos: property_photos,
        property_videos: (values.property_videos || []).map((item: any) => item),
        property_floorplans: (values.property_floorplans || []).map((item: any) => item),
        property_virtual_tours: (values.property_virtual_tours || []).map((item: any) => item),
        vr_request_id: values.vr_request_id || (values.property_virtual_tours && values.property_virtual_tours.length > 0 ? values.property_virtual_tours[0] : null),
        other_features: Array.isArray(values.otherFeatures) ? values.otherFeatures : [],
      };

      let response;
      if (values.id) {
        // Update existing property
        response = await api.put(`/agent/properties/${values.id}/`, propertyData);
      } else {
        // Create new property
        response = await api.post('/agent/properties/', propertyData);
      }

      if (response) {
        const action = values.id ? 'updated' : 'saved';
        showToastMessage(`Property ${action} successfully`, 3000);
        if (status === 'published') {
          setShowPublishSuccess(true);
        } else {
          navigate('/agent/properties/listings');
        }
      }
    } catch (error: any) {
      const action = values.id ? 'updating' : 'saving';
      showToastMessage(error.response?.data?.message || `Error ${action} property`);
    } finally {
      setIsLoadingProperty(false);
    }
  };

  // Property Info step handlers
  const handlePropertyInfoBack = (values: any) => {
    // Preserve existing VR data when going back from Property Info
    const merged = {
      ...propertyInfoData,
      ...values,
      buildingRooms: values.buildingRooms,
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
    setPropertyInfoData(merged);
    setStep(step - 1);
  };
  const handlePropertyInfoSaveDraft = (values: any) => {
    const merged = {
      ...propertyInfoData,
      ...values,
      buildingRooms: values.buildingRooms,
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
    setPropertyInfoData(merged);
    saveProperty(merged, "draft");
  };

  const handlePropertyInfoNext = (values: any) => {
    console.log('AddOrUpdatePropertyWizard: handlePropertyInfoNext called with values:', values);
    console.log('AddOrUpdatePropertyWizard: propertyStatus from values:', values.propertyStatus);
    
    setPropertyInfoData({
      ...propertyInfoData,
      ...values,
      buildingRooms: values.buildingRooms,
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
    });
    
    console.log('AddOrUpdatePropertyWizard: propertyInfoData after update:', propertyInfoData);
    setStep(3);
  };

  // Property Media step handlers
  const handlePropertyMediaBack = (photos: any, videos: any, floorplans: any, arvrRequestId?: any, arvrPhotos?: any) => {
    setPropertyInfoData({
      ...propertyInfoData,
      property_photos: photos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      vr_request_id: arvrRequestId || null,
      arvr_photos: arvrPhotos || {},
    });
    setStep(2);
  };
  const handlePropertyMediaSaveDraft = async (photos: any, videos: any, floorplans: any, arvrRequestId?: any, arvrPhotos?: any) => {
    const merged = {
      ...propertyInfoData,
      property_photos: photos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      vr_request_id: arvrRequestId || null,
      arvr_photos: arvrPhotos || {},
    };
    setPropertyInfoData(merged);
    await saveProperty(merged, "draft");
    // Redirect to property listing page after successful save
    navigate('/agent/properties/listings');
  };
  const handlePropertyMediaNext = (photos: any, videos: any, floorplans: any, arvrRequestId?: any, arvrPhotos?: any) => {
    setPropertyInfoData({
      ...propertyInfoData,
      property_photos: photos,
      property_videos: videos,
      property_floorplans: floorplans,
      property_virtual_tours: arvrRequestId ? [arvrRequestId] : [],
      vr_request_id: arvrRequestId || null,
      arvr_photos: arvrPhotos || {},
    });
    setStep(4);
  };

  // Property Amenities step handlers
  const handlePropertyAmenitiesBack = (values: any) => {
    setStep(3);
  };
  const handlePropertyAmenitiesSaveDraft = async (values: any) => {
    const merged = {
      ...propertyInfoData,
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
    const merged = {
      ...propertyInfoData,
      appliances: values.appliances,
      indoorFeatures: values.indoorFeatures,
      outdoorAmenities: values.outdoorAmenities,
      view: values.view,
      community: values.community,
      stories: values.stories,
      otherFeatures: values.otherFeatures,
    };
    setPropertyInfoData(merged);
    setStep(5);
  };

  // Contact Info step handlers
  const handleContactInfoBack = () => {
    setStep(4);
  };
  const handleContactInfoSaveDraft = async () => {
    try {
      await saveProperty(propertyInfoData, "draft");
      setStep(4);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };
  const handleContactInfoNext = () => {
    console.log(propertyInfoData);
    setStep(6);
  };

  // Property Review step handlers
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const handlePropertyReviewBack = () => {
    setStep(5);
  };
  const handlePropertyReviewSaveDraft = async () => {
    await saveProperty(propertyInfoData, "draft");
    // Redirect to property listing page after successful save
    navigate('/agent/properties/listings');
  };
  const handlePropertyReviewPublish = () => {
    saveProperty(propertyInfoData, "published");
  };
  const handlePropertyReviewUnpublish = () => {
    saveProperty(propertyInfoData, "inactive");
  };
  const handlePublishSuccessClose = () => {
    setShowPublishSuccess(false);
    navigate('/agent/properties/listings');
    // Optionally redirect or reset wizard here
  };

  // Render Back button above the stepper for step 2, 3, 4, 5, 6
  const showBackButton = step === 2 || step === 3 || step === 4 || step === 5 || step === 6;

  // Handle back button click
  const handleBackClick = () => {
    if (step === 2) {
      handlePropertyInfoBack(propertyInfoData);
    } else if (step === 3) {
      const photos = (propertyInfoData as any)?.property_photos || [];
      const videos = (propertyInfoData as any)?.property_videos || [];
      const floorplans = (propertyInfoData as any)?.property_floorplans || [];
      const arvrRequestId = (propertyInfoData as any)?.property_virtual_tours?.[0] || null;
      const arvrPhotos = (propertyInfoData as any)?.arvr_photos || {};
      handlePropertyMediaBack(photos, videos, floorplans, arvrRequestId, arvrPhotos);
    } else if (step === 4) {
      handlePropertyAmenitiesBack(propertyInfoData);
    } else if (step === 5) {
      handleContactInfoBack();
    } else if (step === 6) {
      handlePropertyReviewBack();
    }
  };

  // Function to map API data to component format
  const mapApiToPropertyDetails = (apiData: any) => {
    console.log('Mapping API data to property details:', apiData);
    console.log('API vr_submitted:', apiData.vr_submitted);
    
    const result = {
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
        listing_type: apiData.listing_type,
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
        buildingRooms: (apiData.room_types || []).map((item: any) => ({ id: item.id, value: item.name })),
        basementTypes: (apiData.basement_types || []).map((item: any) => ({ id: item.id, value: item.name })),
        floorCoverings: (apiData.floor_coverings || []).map((item: any) => ({ id: item.id, value: item.name })),
        architecturalStyles: (apiData.architectural_styles || []).slice(0, 1).map((item: any) => ({ id: item.id, value: item.name })),
        exteriors: (apiData.exterior_types || []).map((item: any) => ({ id: item.id, value: item.name })),
        roofs: (apiData.roof_types || []).map((item: any) => ({ id: item.id, value: item.name })),
        parkings: (apiData.parking_types || []).map((item: any) => ({ id: item.id, value: item.name })),
        appliances: (apiData.appliance_types || []).map((item: any) => item.id),
        indoorFeatures: (apiData.indoor_features || []).map((item: any) => item.id),
        outdoorAmenities: (apiData.outdoor_amenities || []).map((item: any) => item.id),
        view: (apiData.view_types || []).map((item: any) => item.id),
        community: (apiData.community_types || []).map((item: any) => item.id),
        otherFeatures: [],
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
        property_statuses: apiData.property_statuses || [],
        mortgage_types: apiData.mortgage_types || [],
        listing_types: apiData.listing_types || [],
        max_hoa_fees: apiData.max_hoa_fees || '',
        stories: apiData.stories || '',
        other_features: apiData.other_features || [],
        vr_submitted: apiData.vr_submitted || null,
      }
    };
    
    console.log('Mapped vr_submitted:', result.propertyInfoData.vr_submitted);
    
    return result;
  };
  
  // Fetch property data when ID is present
  useEffect(() => {
    if (id) {
      console.log('Fetching property data for ID:', id);
      setIsLoadingProperty(true);
      
      api.get(`/agent/properties/${id}/`)
        .then(res => {
          const apiData = res.data?.data || res.data;
          console.log('API response:', apiData);
          console.log('API response vr_submitted:', apiData?.vr_submitted);
          
          if (apiData) {
            const mappedData = mapApiToPropertyDetails(apiData);
            
            // Set location data
            setLocationData(mappedData.locationData);
            
            // Set property info data
            setPropertyInfoData(mappedData.propertyInfoData);
            
            console.log('Property data loaded successfully:', mappedData);
          }
          setIsLoadingProperty(false);
        })
        .catch(err => {
          console.error('Error fetching property details:', err);
          showToastMessage(err?.response?.data?.message || 'Failed to fetch property details');
          setIsLoadingProperty(false);
        });
    }
  }, [id]);

  return (
    <MasterDataProvider>
      {isLoadingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <ButtonLoader text="Processing..." />
          </div>
        </div>
      )}
      <div className="w-full pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          {/* Left: Back button and step label */}
          <div className="flex items-center min-w-[180px]">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="flex items-center mb-1 px-4 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg text-[#222] font-medium shadow-none border border-[#E5E7EB]"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="mr-2"><path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
            )}
            <div className="ml-4 flex flex-col justify-center">
              <div className="font-bold text-base text-[#222] leading-tight">
                {step === 1 && 'Location 1 of 6'}
                {step === 2 && 'Info 2 of 6'}
                {step === 3 && 'Media 3 of 6'}
                {step === 4 && 'Amenities 4 of 6'}
                {step === 5 && 'Contact 5 of 6'}
                {step === 6 && 'Review 6 of 6'}
              </div>
              <div className="text-xs text-[#555] leading-tight max-w-xs whitespace-normal break-words">
                List your property with more details & amenities to attract the buyer
              </div>
            </div>
          </div>
          {/* Center: Title and Stepper */}
          <div className="flex-1 flex flex-col items-center">
            <div className="text-3xl font-light text-center mb-2 mt-0">Property Listing</div>
            <div className="flex items-center justify-center w-full mb-4 mt-0 gap-0">
              {['Location', 'Property Info', 'Media', 'Amenities', 'Contact Info', 'Review'].map((label, idx, arr) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className="flex items-center justify-center" style={{ height: '2.5rem' }}>
                      <img
                        src={idx + 1 < step ? StepperComplete : idx + 1 === step ? StepperActive : StepperIncomplete}
                        alt={idx + 1 < step ? 'Step Complete' : idx + 1 === step ? 'Step Active' : 'Step Incomplete'}
                        className="w-8 h-8"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <div className={`mt-2 text-sm ${idx + 1 === step ? 'font-bold text-[#004236]' : 'text-[#888]'}`}>{label}</div>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="flex-grow h-0.5 bg-[#D1D5DB] mx-2 min-w-[32px] max-w-[80px]" style={{ alignSelf: 'center' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <hr className="mb-4 border-[#E5E7EB] mt-0" />
      </div>
      <div className="w-full">
        {step === 1 && (
          <PropertyLocation
            locationData={locationData}
            onLocationDataChange={handleLocationDataChange}
            onConfirm={handleLocationConfirm}
            onChangeLocation={handleChangeLocation}
            onSelectOnMap={handleSelectOnMap}
            isLoading={isLoadingProperty}
          />
        )}
        {step === 2 && (
          <PropertyInfo
            initialValues={propertyInfoData}
            onBack={() => {}}
            onSaveDraft={handlePropertyInfoSaveDraft}
            onNext={handlePropertyInfoNext}
          />
        )}
        {step === 3 && (
          (() => {
            console.log('PropertyMedia initialValues:', propertyInfoData);
            console.log('PropertyMedia vr_submitted:', (propertyInfoData as any)?.vr_submitted);
            return (
              <PropertyMedia
                initialValues={propertyInfoData}
                step={3}
                onBack={handlePropertyMediaBack}
                onSaveDraft={handlePropertyMediaSaveDraft}
                onNext={handlePropertyMediaNext}
              />
            );
          })()
        )}
        {step === 4 && (
          <PropertyAmenities
            initialValues={propertyInfoData}
            onBack={handlePropertyAmenitiesBack}
            onSaveDraft={handlePropertyAmenitiesSaveDraft}
            onNext={handlePropertyAmenitiesNext}
          />
        )}
        {step === 5 && (
          <PropertyContactInfo
            initialValues={propertyInfoData}
            userData = {userData}
            onBack={handleContactInfoBack}
            onSaveDraft={handleContactInfoSaveDraft}
            onNext={handleContactInfoNext}
          />
        )}
        {step === 6 && (
          <PropertyReview
            initialValues={propertyInfoData}
            onBack={handlePropertyReviewBack}
            onSaveDraft={handlePropertyReviewSaveDraft}
            onPublish={handlePropertyReviewPublish}
            onUnpublish={handlePropertyReviewUnpublish}
          />
        )}
        <PublishSuccessModal open={showPublishSuccess} onClose={handlePublishSuccessClose} />
      </div>
    </MasterDataProvider>
  );
};

export default AddOrUpdatePropertyWizard; 