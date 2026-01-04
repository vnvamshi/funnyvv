import React, { useRef, useEffect, useState } from 'react';

interface LocationMapProps {
  property: {
    lat: number;
    lng: number;
    title: string;
    price: number;
    location: string;
    image: string;
    isCardData?: boolean;
    cardPrice?: number;
  };
}

const LocationMap: React.FC<LocationMapProps> = ({ property }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Validate coordinates
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return typeof lat === 'number' && !isNaN(lat) && 
           typeof lng === 'number' && !isNaN(lng) &&
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180 &&
           (lat !== 0 || lng !== 0); // Exclude 0,0 which is in the ocean
  };

  const hasValidCoordinates = isValidCoordinate(property.lat, property.lng);

  // Helper function to get info window content
  const getInfoWindowContent = React.useCallback(() => {
      return `
        <div style="max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0;">
          <style>
            .gm-ui-hover-effect { display: none !important; }
            button[aria-label*="Close"], button[title*="Close"] { display: none !important; }
            .gm-style-iw-d { overflow: hidden !important; }
          </style>
          <div style="background: linear-gradient(135deg, #004236 0%, #007E67 100%); padding: 12px 16px; border-radius: 12px 12px 0 0;">
            <div style="color: #F5EC9B; font-weight: 700; font-size: 16px; margin-bottom: 4px;">
              ${property.title || 'Property'}
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 12px;">
              ${property.location || 'Location not available'}
            </div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <img src="${property.image}" alt="${property.title || 'Property'}" style="width: 90px; height: 70px; object-fit: cover; border-radius: 8px; border: 2px solid #E5E7EB; flex-shrink: 0;" onerror="this.style.display='none'">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="background: linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; font-size: 18px; line-height: 1.2;">
                    ${property.isCardData && property.cardPrice 
                      ? `Rs. ${property.cardPrice} Cr` 
                      : property.price 
                        ? `$${property.price.toLocaleString()}` 
                        : 'N/A'}
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; color: #004236; font-size: 11px; font-weight: 600;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>View on Map</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
  }, [property.title, property.location, property.price, property.image, property.isCardData, property.cardPrice]);

  // Helper function to hide close button
  const hideCloseButton = React.useCallback(() => {
    setTimeout(() => {
      const closeButton = document.querySelector('.gm-ui-hover-effect');
      if (closeButton) {
        (closeButton as HTMLElement).style.display = 'none';
      }
      const closeButtons = document.querySelectorAll('button[aria-label*="Close"], button[title*="Close"], .gm-style-iw-d button');
      closeButtons.forEach((btn) => {
        (btn as HTMLElement).style.display = 'none';
      });
    }, 100);
  }, []);

  useEffect(() => {
    if (!hasValidCoordinates) {
      setHasError(true);
      return;
    }

    // Update marker position if map is already initialized
    if (mapInstanceRef.current && markerRef.current && hasValidCoordinates) {
      const newPosition = { lat: property.lat, lng: property.lng };
      markerRef.current.setPosition(newPosition);
      markerRef.current.setVisible(true);
      markerRef.current.setMap(mapInstanceRef.current);
      mapInstanceRef.current.setCenter(newPosition);
      // Ensure info window is also updated
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        const newInfoWindowContent = getInfoWindowContent();
        infoWindowRef.current.setContent(newInfoWindowContent);
        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
        hideCloseButton();
      }
      return;
    }

    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initializeMap();
        return;
      }

      if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initializeMap();
        };

        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          setHasError(true);
        };

        document.head.appendChild(script);
      }
    };

    const initializeMap = () => {
      if (mapRef.current && !mapInstanceRef.current && window.google && hasValidCoordinates) {
        try {
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: { lat: property.lat, lng: property.lng },
            zoom: 15,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              },
              {
                featureType: 'transit',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
              position: window.google.maps.ControlPosition.TOP_RIGHT,
            },
            streetViewControl: true,
            streetViewControlOptions: {
              position: window.google.maps.ControlPosition.BOTTOM_RIGHT,
            },
            zoomControl: true,
            zoomControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_CENTER,
            }
          });

          mapInstanceRef.current = mapInstance;

          // Remove existing marker if any
          if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
          }

          // Create custom marker with pin icon - MUST be visible
          const marker = new window.google.maps.Marker({
            position: { lat: property.lat, lng: property.lng },
            map: mapInstance,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30c0-11.046-8.954-20-20-20z" fill="#004236"/>
                  <circle cx="20" cy="20" r="8" fill="white"/>
                  <text x="20" y="25" text-anchor="middle" fill="#004236" font-family="Arial" font-size="12" font-weight="bold">$</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 50),
              anchor: new window.google.maps.Point(20, 50)
            },
            title: property.title || property.location || 'Property Location',
            animation: window.google.maps.Animation.DROP,
            visible: true,
            optimized: false
          });

          markerRef.current = marker;

          // Ensure marker is visible on the map - call multiple times to ensure it sticks
          marker.setMap(mapInstance);
          marker.setVisible(true);
          
          // Force marker to be visible after a short delay to ensure it renders
          setTimeout(() => {
            if (markerRef.current) {
              markerRef.current.setVisible(true);
              markerRef.current.setMap(mapInstance);
            }
          }, 100);

          // Create info window without close button
          const infoWindow = new window.google.maps.InfoWindow({
            content: getInfoWindowContent(),
            disableAutoPan: false
          });

          infoWindowRef.current = infoWindow;

          // Add click listener to marker
          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
            hideCloseButton();
          });

          // Open info window by default
          infoWindow.open(mapInstance, marker);
          hideCloseButton();
          
          // Also hide close button when info window content is set
          google.maps.event.addListener(infoWindow, 'domready', () => {
            hideCloseButton();
          });

          setIsMapReady(true);
          setHasError(false);
        } catch (error) {
          console.error('Error initializing map:', error);
          setHasError(true);
        }
      }
    };

    loadGoogleMaps();

    // Cleanup function
    return () => {
      // Don't remove marker on cleanup - keep it visible
      // Only close info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [property.lat, property.lng, property.title, property.location, property.price, property.image, hasValidCoordinates, getInfoWindowContent, hideCloseButton]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#004236] mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
          Location
        </h2>
        <div className="w-[262px] h-0.5" style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)' }}></div>
      </div>
      
      <div className="bg-white rounded-[22px] overflow-hidden border border-gray-200 shadow-sm relative">
        {hasError || !hasValidCoordinates ? (
          <div className="w-full h-[350px] md:h-[400px] flex items-center justify-center bg-gray-100" style={{ minHeight: '350px' }}>
            <div className="text-gray-500 text-center">
              <p className="mb-2">Map not available</p>
              <p className="text-sm text-gray-400">Location coordinates are not available for this property</p>
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={mapRef} 
              className="w-full h-[350px] md:h-[400px]"
              style={{ minHeight: '350px' }}
            />
            
            {!isMapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-gray-500">Loading map...</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LocationMap;
