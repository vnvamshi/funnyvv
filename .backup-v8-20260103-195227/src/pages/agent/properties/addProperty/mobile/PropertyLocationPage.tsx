import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileAddPropertyTabs from './MobileAddPropertyTabs';
import { MobilePropertyWizardProvider, useMobilePropertyWizard, useMobilePropertyWizardStorage } from './MobilePropertyWizardContext';

const PropertyLocationPageInner: React.FC = () => {
  const { handleLocationConfirm, locationData, handleSelectOnMap, propertyInfoData, isLoadingProperty } = useMobilePropertyWizard();
  const { getLocationData } = useMobilePropertyWizardStorage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);

  // Use context data as primary source, fallback to localStorage
  const [addressData, setAddressData] = useState(() => {
    const storedData = getLocationData();
    return storedData && Object.keys(storedData).length > 0 ? storedData : locationData;
  });

  // Format the address for display
  const formatAddress = () => {
    const parts = [
      addressData.address,
      addressData.city,
      addressData.state,
      addressData.postalCode,
      addressData.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Sync addressData with context data when it changes
  useEffect(() => {
    if (locationData && Object.keys(locationData).length > 0) {
      console.log('Context locationData updated:', locationData);
      console.log('Coordinates from context:', { lat: locationData.lat, lng: locationData.lng });
      setAddressData(locationData);
    }
  }, [locationData]);

  useEffect(() => {
    console.log('addressData changed:', addressData);
    if (addressData && Object.keys(addressData).length > 0) {
      console.log('Current location data:', {
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
        lat: addressData.lat,
        lng: addressData.lng
      });
    }
  }, [addressData]);

  const handleLocationConfirmClick = () => {
    // Ensure the latest lat/lng are included in the API payload
    setIsSelectingOnMap(false);
    console.log('Confirming location with coordinates:', { lat: addressData.lat, lng: addressData.lng });
    handleLocationConfirm();
  };

  const handleChangeLocationClick = () => {
    setIsSelectingOnMap(true);
    console.log('Enabling map selection mode');
  };

  const handleMarkerUpdate = (lat: number, lng: number) => {
    console.log('Marker updated to coordinates:', { lat, lng });
    
    // Update both local state and context
    setAddressData((prev: any) => ({ ...prev, lat, lng }));
    handleSelectOnMap(lat, lng);
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked at coordinates:', { lat, lng });
    handleMarkerUpdate(lat, lng);
  };

  // Show loading state while API is fetching property data
  if (isLoadingProperty) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
          <button
            className="mr-2 p-2 -ml-2"
            onClick={() => navigate('/agent/properties/listings')}
            aria-label="Back"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-green-900 text-2xl font-bold">Add property</span>
        </div>
        <MobileAddPropertyTabs currentStep={0} />
        <div className="flex flex-col px-6 pt-6 pb-8">
          <div className="text-3xl font-bold text-[#222] mb-2">Property Location</div>
          <div className="text-base text-[#222] mb-6">Loading property data...</div>
          {/* Map loading state */}
          <div className="w-full h-64 rounded-lg mb-8 bg-gray-100 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
              <div className="text-sm text-gray-600">Loading map...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have valid coordinates for the map
  // Show markers if we have valid coordinates that are not the default coordinates
  const lat = Number(addressData.lat);
  const lng = Number(addressData.lng);
  const hasValidCoordinates = addressData.lat && addressData.lng && 
    !isNaN(lat) && !isNaN(lng) &&
    (lat !== 18.5601 || lng !== -68.3725); // Don't show default coordinates

  // Debug logging for coordinates
  console.log('PropertyLocationPage: addressData:', addressData);
  console.log('PropertyLocationPage: hasValidCoordinates:', hasValidCoordinates);
  console.log('PropertyLocationPage: coordinates:', { lat: addressData.lat, lng: addressData.lng });
  console.log('PropertyLocationPage: isLoadingProperty:', isLoadingProperty);
  console.log('PropertyLocationPage: isSelectingOnMap:', isSelectingOnMap);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
        <button
          className="mr-2 p-2 -ml-2"
          onClick={() => navigate('/agent/properties/listings')}
          aria-label="Back"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-green-900 text-2xl font-bold">{propertyInfoData?.id ? 'Update Property' : 'Add Property'}</span>
      </div>
      <MobileAddPropertyTabs currentStep={0} />
      {/* Main Content */}
      <div className="flex flex-col px-6 pt-6 pb-8">
        <div className="text-3xl font-bold text-[#222] mb-2">Property Location</div>
        <div className="text-base text-[#222] mb-6">
          {formatAddress() || 'No address data available'}
        </div>
        
        <div className="border-b border-[#E5E7EB] mb-8" />
        <div className="flex items-center mb-2 text-green-900 font-semibold">
          <span>Is this your property accurate location? If not, </span>
          <span className="underline cursor-pointer ml-1" onClick={handleChangeLocationClick}>select on map</span>
        </div>
        
        {isSelectingOnMap && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              <strong>Map editing mode:</strong> Tap anywhere on the map or drag the marker to set the property location.
            </div>
          </div>
        )}
        
        <div className="w-full h-64 rounded-lg mb-8">
          <GoogleMap
            markers={hasValidCoordinates ? [
              {
                position: { lat, lng },
                title: formatAddress(),
              },
            ] : []}
            draggableMarker={isSelectingOnMap}
            onMarkerDragEnd={handleMarkerUpdate}
            onMapClick={handleMapClick}
            center={hasValidCoordinates ? { lat, lng } : undefined}
            isLoading={isLoadingProperty}
          />
        </div>
        <button
          className="settings-gradient-btn full-width py-3 rounded-full font-bold text-lg shadow-lg mb-4"
          onClick={handleLocationConfirmClick}
          disabled={isLoadingProperty}
        >
          Yes, It's the correct location
        </button>
        <button
          className="w-full py-3 rounded-lg font-bold text-lg border-2 border-green-900 text-green-900 bg-white"
          onClick={handleChangeLocationClick}
          disabled={isLoadingProperty}
        >
          No, Let me change it
        </button>
      </div>
    </div>
  );
};

// Google Maps component with draggable marker
const GoogleMap: React.FC<{ 
  markers: any[]; 
  draggableMarker?: boolean; 
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: { lat: number; lng: number };
  isLoading?: boolean;
}> = ({ markers, draggableMarker, onMarkerDragEnd, onMapClick, center, isLoading = false }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const mapClickListenerRef = React.useRef<any>(null);

  // Show loading state if API is loading
  if (isLoading) {
    return (
      <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
          <div className="text-sm text-gray-600">Loading property data...</div>
        </div>
      </div>
    );
  }

  // Initialize map
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else if (mapRef.current && !map) {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;
    
    // Only set center if we have valid coordinates, otherwise use a neutral center
    const defaultCenter = center || { lat: 18.5601, lng: -68.3725 };
    const newMap = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: center ? 15 : 12,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
    setMap(newMap);
  };

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
      map.setZoom(15);
    }
  }, [map, center]);

  // Handle map click listener
  useEffect(() => {
    if (!map) return;
    
    // Remove existing click listener
    if (mapClickListenerRef.current) {
      window.google.maps.event.removeListener(mapClickListenerRef.current);
      mapClickListenerRef.current = null;
    }
    
    // Add click listener when in selection mode
    if (draggableMarker && onMapClick) {
      mapClickListenerRef.current = map.addListener('click', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        console.log('GoogleMap: Map clicked at:', { lat, lng });
        onMapClick(lat, lng);
      });
    }
    
    return () => {
      if (mapClickListenerRef.current) {
        window.google.maps.event.removeListener(mapClickListenerRef.current);
        mapClickListenerRef.current = null;
      }
    };
  }, [map, draggableMarker, onMapClick]);

  // Handle markers
  useEffect(() => {
    if (!map || !window.google) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    console.log('GoogleMap: Setting up markers:', markers);
    console.log('GoogleMap: draggableMarker:', draggableMarker);
    
    if (markers.length > 0) {
      markers.forEach((markerData) => {
        console.log('GoogleMap: Creating marker at:', markerData.position);
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map: map,
          title: markerData.title,
          draggable: !!draggableMarker,
        });
        
        if (draggableMarker && onMarkerDragEnd) {
          marker.addListener('dragend', (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            console.log('GoogleMap: Marker dragged to:', { lat, lng });
            onMarkerDragEnd(lat, lng);
          });
        }
        
        markersRef.current.push(marker);
      });
      
      // Auto-fit map to markers if not in selection mode
      if (!draggableMarker && markers.length === 1) {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach(markerData => {
          if (
            markerData.position &&
            typeof markerData.position.lat === 'number' &&
            typeof markerData.position.lng === 'number'
          ) {
            bounds.extend(new window.google.maps.LatLng(markerData.position.lat, markerData.position.lng));
          }
        });
        
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
          map.setZoom(Math.min(map.getZoom(), 15)); // Don't zoom in too much
        }
      }
    }
    
    // If no markers but we have a center, ensure the map is centered properly
    if (markers.length === 0 && center) {
      console.log('GoogleMap: No markers, centering map at:', center);
      map.setCenter(center);
      map.setZoom(15);
      
      // Create a marker at the center if in selection mode
      if (draggableMarker && onMapClick) {
        onMapClick(center.lat, center.lng);
      }
    }
  }, [map, markers, draggableMarker, onMarkerDragEnd, center]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-lg bg-gray-200"
      style={{ background: '#fff', minHeight: 256 }}
    ></div>
  );
};

const PropertyLocationPage: React.FC = () => (
  <MobilePropertyWizardProvider>
    <PropertyLocationPageInner />
  </MobilePropertyWizardProvider>
);

export default PropertyLocationPage; 