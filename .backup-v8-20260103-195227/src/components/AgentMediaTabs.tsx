import React, { useState, useMemo, useEffect } from 'react';
import PropertyMedia from '../pages/agent/properties/addProperty/PropertyMedia';
import { PropertyDetails } from '../pages/PropertyDetails/types';
import { PropertyDetailsHeader } from '../pages/agent/properties/AgentPropertyListingDetails';
import api from '../utils/api';

interface AgentMediaTabsProps {
  property: PropertyDetails;
  editable?: boolean;
  initialTab?: 'photos' | 'videos' | 'floorplans' | 'vr';
  onMediaChange?: (media?: any) => void;
}

const MEDIA_TABS = [
  { key: 'photos', label: 'Photos' },
  { key: 'videos', label: 'Videos' },
  { key: 'floorplans', label: 'Floorplans' },
  { key: 'vr', label: 'VR Request' },
];

const AgentMediaTabs: React.FC<AgentMediaTabsProps> = ({ property, editable = false, initialTab = 'photos', onMediaChange }) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'floorplans' | 'vr'>(initialTab);
  const [mediaState, setMediaState] = useState({
    property_photos: (property.property_photos || []).map(photo => ({
      ...photo,
      isMain: photo.main_photo || false,
    })),
    property_videos: property.property_videos || [],
    property_floorplans: property.property_floorplans || [],
  });
  const [unsaved, setUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Prepare initialValues for PropertyMedia
  const initialValues = useMemo(() => ({
    property_photos: (property.property_photos || []).map(photo => ({
      ...photo,
      isMain: photo.main_photo || false,
    })),
    property_videos: property.property_videos || [],
    property_floorplans: property.property_floorplans || [],
    property_virtual_tours: property.property_virtual_tours || [],
    propertyType: property.property_type, // For compatibility with PropertyMedia
    agent: property.agent,
    property_id: property.property_id, // <-- Ensure property_id is passed
    vr_submitted: property.vr_submitted, // <-- Pass vr_submitted for VR card logic
  }), [property]);

  // Detect unsaved changes
  useEffect(() => {
    const mappedPhotos = (property.property_photos || []).map(photo => ({
      ...photo,
      isMain: photo.main_photo || false,
    }));
    
    setUnsaved(
      JSON.stringify(mediaState.property_photos) !== JSON.stringify(mappedPhotos) ||
      JSON.stringify(mediaState.property_videos) !== JSON.stringify(property.property_videos) ||
      JSON.stringify(mediaState.property_floorplans) !== JSON.stringify(property.property_floorplans)
    );
  }, [mediaState, property]);

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    let updateKey = '';
    let updateValue: any = undefined;
    if (JSON.stringify(mediaState.property_photos) !== JSON.stringify(property.property_photos)) {
      updateKey = 'property_photos';
      // Convert isMain back to main_photo for API
      updateValue = mediaState.property_photos.map(photo => {
        const { isMain, ...photoWithoutIsMain } = photo;
        return {
          ...photoWithoutIsMain,
          main_photo: isMain || false,
        };
      });
    } else if (JSON.stringify(mediaState.property_videos) !== JSON.stringify(property.property_videos)) {
      updateKey = 'property_videos';
      updateValue = mediaState.property_videos;
    } else if (JSON.stringify(mediaState.property_floorplans) !== JSON.stringify(property.property_floorplans)) {
      updateKey = 'property_floorplans';
      updateValue = mediaState.property_floorplans;
    }
    if (updateKey && property.property_id) {
      try {
        await api.patch(`/agent/properties/${property.property_id}/`, {
          [updateKey]: updateValue,
        });
        setUnsaved(false);
        // Notify parent component of media changes
        if (onMediaChange) {
          onMediaChange();
        }
        // Optionally, show a toast or feedback
      } catch (e) {
        // Optionally, show error feedback
      }
    }
    setSaving(false);
  };

  // Handlers for PropertyMedia (edit mode)
  const handleBack = () => {};
  const handleSaveDraft = (photos: any, videos: any, floorplans: any, arvrRequestId: any, arvrPhotos: any) => {
    setMediaState({ property_photos: photos, property_videos: videos, property_floorplans: floorplans });
    // Convert isMain back to main_photo for API consistency
    const photosForAPI = photos.map((photo: any) => {
      const { isMain, ...photoWithoutIsMain } = photo;
      return {
        ...photoWithoutIsMain,
        main_photo: isMain || false,
      };
    });
    if (onMediaChange) onMediaChange({ photos: photosForAPI, videos, floorplans, arvrRequestId, arvrPhotos });
  };
  const handleNext = (photos: any, videos: any, floorplans: any, arvrRequestId: any, arvrPhotos: any) => {
    setMediaState({ property_photos: photos, property_videos: videos, property_floorplans: floorplans });
    // Convert isMain back to main_photo for API consistency
    const photosForAPI = photos.map((photo: any) => {
      const { isMain, ...photoWithoutIsMain } = photo;
      return {
        ...photoWithoutIsMain,
        main_photo: isMain || false,
      };
    });
    if (onMediaChange) onMediaChange({ photos: photosForAPI, videos, floorplans, arvrRequestId, arvrPhotos });
  };

  // Render tab content
  const renderTabContent = () => {
    if (editable) {
      // Use PropertyMedia for editing
      return (
        <div>
          <PropertyMedia
            initialValues={initialValues}
            step={3}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            onNext={handleNext}
            hideHeader={true}
            hideNextButton={true}
            isARVRRequested={true}
            onSaveSuccess={onMediaChange}
          />
          {unsaved && (
            <div className="flex justify-end mt-4">
              <button
                className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      );
    }
    // Read-only view
    switch (activeTab) {
      case 'photos':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.property_photos && property.property_photos.length > 0 ? (
              property.property_photos.map((photo, idx) => (
                <img key={idx} src={photo.url} alt={`Photo ${idx + 1}`} className="w-full h-40 object-cover rounded" />
              ))
            ) : (
              <div>No photos available.</div>
            )}
          </div>
        );
      case 'videos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.property_videos && property.property_videos.length > 0 ? (
              property.property_videos.map((video, idx) => (
                <video key={idx} src={video.url} controls className="w-full h-48 rounded" />
              ))
            ) : (
              <div>No videos available.</div>
            )}
          </div>
        );
      case 'floorplans':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.property_floorplans && property.property_floorplans.length > 0 ? (
              property.property_floorplans.map((fp, idx) => (
                <img key={idx} src={fp.url} alt={`Floorplan ${idx + 1}`} className="w-full h-48 object-contain bg-gray-50 rounded" />
              ))
            ) : (
              <div>No floorplans available.</div>
            )}
          </div>
        );
      case 'vr':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.property_virtual_tours && property.property_virtual_tours.length > 0 ? (
              property.property_virtual_tours.map((vt, idx) => (
                <iframe key={idx} src={vt.url} title={`Virtual Tour ${idx + 1}`} className="w-full h-64 rounded" allowFullScreen />
              ))
            ) : (
              <div>No VR requests available.</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Common Header */}
      <PropertyDetailsHeader property={property} />
      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default AgentMediaTabs; 