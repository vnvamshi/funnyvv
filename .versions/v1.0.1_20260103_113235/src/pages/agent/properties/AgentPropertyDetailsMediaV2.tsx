import React, { useState, useMemo } from 'react';
import PropertyMedia from './addProperty/PropertyMedia';
import { PropertyDetails } from '../../PropertyDetails/types';

interface AgentPropertyDetailsMediaV2Props {
  property: PropertyDetails;
  editable?: boolean;
  initialTab?: 'photos' | 'videos' | 'floorplans' | 'vr';
  onMediaChange?: (media: any) => void;
}

const MEDIA_TABS = [
  { key: 'photos', label: 'Photos' },
  { key: 'videos', label: 'Videos' },
  { key: 'floorplans', label: 'Floorplans' },
  { key: 'vr', label: 'VR Request' },
];

const AgentPropertyDetailsMediaV2: React.FC<AgentPropertyDetailsMediaV2Props> = ({ property, editable = false, initialTab = 'photos', onMediaChange }) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'floorplans' | 'vr'>(initialTab);

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
    agent: property.agent || {}, // Ensure agent is always present
  }), [property]);

  // Helper function to convert isMain to main_photo for API
  const convertPhotosForAPI = (photos: any[]) => {
    return photos.map(photo => {
      const { isMain, ...photoWithoutIsMain } = photo;
      return {
        ...photoWithoutIsMain,
        main_photo: isMain || false,
      };
    });
  };

  // Handlers for PropertyMedia (edit mode)
  const handleBack = () => {};
  const handleSaveDraft = (photos: any, videos: any, floorplans: any, arvrRequestId: any, arvrPhotos: any) => {
    if (onMediaChange) onMediaChange({ photos: convertPhotosForAPI(photos), videos, floorplans, arvrRequestId, arvrPhotos });
  };
  const handleNext = (photos: any, videos: any, floorplans: any, arvrRequestId: any, arvrPhotos: any) => {
    if (onMediaChange) onMediaChange({ photos: convertPhotosForAPI(photos), videos, floorplans, arvrRequestId, arvrPhotos });
  };

  // Render tab content
  const renderTabContent = () => {
    if (editable) {
      // Use PropertyMedia for editing
      return (
        <PropertyMedia
          initialValues={initialValues}
          step={3}
          onBack={handleBack}
          onSaveDraft={handleSaveDraft}
          onNext={handleNext}
        />
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
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default AgentPropertyDetailsMediaV2; 