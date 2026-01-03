import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface Property {
  property_id: string;
  location: {
    lat: string | number;
    lng: string | number;
  };
  name: string;
  mainphoto_url: string;
  selling_price: string | number;
  bedrooms: number;
  bathrooms: number;
  sqft: string | number | null;
  address: string;
}

interface LocationState {
  cities: string[];
  country: string;
}

const Map3DPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Initialize map
  const initializeMap = () => {
    if (mapRef.current && !mapInstanceRef.current && window.google) {
      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 18.5601, lng: -68.3725 },
          zoom: 7,
          mapTypeId: window.google.maps.MapTypeId.HYBRID,
          tilt: 45,
          heading: 0,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'administrative',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'road',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'water',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: window.google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [
              window.google.maps.MapTypeId.ROADMAP,
              window.google.maps.MapTypeId.HYBRID,
              window.google.maps.MapTypeId.SATELLITE,
              window.google.maps.MapTypeId.TERRAIN
            ]
          }
        });

        // Enable 45-degree imagery where available
        mapInstance.setTilt(45);
        mapInstanceRef.current = mapInstance;
        setIsMapInitialized(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  };

  // Load Google Maps script
  useEffect(() => {
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

        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();

    return () => {
      // Cleanup markers when component unmounts
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, []);

  // Create custom marker
  const createCustomMarker = (property: Property) => {
    const markerDiv = document.createElement('div');
    markerDiv.className = 'custom-marker';
    markerDiv.style.position = 'absolute';
    markerDiv.style.width = '150px';
    markerDiv.style.transform = 'translate(-50%, -50%)';
    markerDiv.style.cursor = 'pointer';
    markerDiv.style.zIndex = '1000';

    // Create the HTML content with circular image and gold gradient border
    markerDiv.innerHTML = `
      <div style="text-align: center;">
        <div style="
          width: 100px;
          height: 100px;
          margin: 0 auto;
          position: relative;
          border-radius: 50%;
          padding: 4px;
          background: linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%);
        ">
          <div style="
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            position: relative;
          ">
            <img 
              src="${property.mainphoto_url || ''}"
              alt="${property.name}"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
              "
            />
          </div>
        </div>
        <div style="
          margin-top: 8px;
          padding: 6px 12px;
          max-width: 150px;
        ">
          <p style="
            color: white;
            font-size: 13px;
            margin: 0;
            white-space: normal;
            word-wrap: break-word;
            text-align: center;
            line-height: 1.2;
            text-shadow: 
              -1px -1px 0 #000,
              1px -1px 0 #000,
              -1px 1px 0 #000,
              1px 1px 0 #000;
            font-weight: bold;
            font-family: 'DM Serif Display', serif;
          ">${property.name}</p>
        </div>
      </div>
    `;

    return markerDiv;
  };

  // Update map markers
  const updateMapMarkers = (properties: Property[]) => {
    if (!mapInstanceRef.current || !window.google || !isMapInitialized) {
      console.log('Map not ready yet, skipping marker update');
      return;
    }

    console.log('Updating markers for properties:', properties);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (properties.length === 0) return;

    // Create bounds object
    const bounds = new window.google.maps.LatLngBounds();
    const validMarkers: google.maps.LatLng[] = [];

    // Add new markers
    properties.forEach(property => {
      // Convert string coordinates to numbers
      const lat = parseFloat(property.location.lat as string);
      const lng = parseFloat(property.location.lng as string);

      // Skip if location coordinates are invalid
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid location for property: ${property.property_id}`, property.location);
        return;
      }

      const position = new window.google.maps.LatLng(lat, lng);
      validMarkers.push(position);
      console.log('Creating marker at position:', { lat, lng });

      // Create custom overlay
      class CustomMarker extends window.google.maps.OverlayView {
        private position: google.maps.LatLng;
        private content: HTMLElement;
        private div?: HTMLElement;

        constructor(position: google.maps.LatLng, content: HTMLElement) {
          super();
          this.position = position;
          this.content = content;
        }

        onAdd() {
          this.div = document.createElement('div');
          this.div.style.position = 'absolute';
          this.div.appendChild(this.content);

          const panes = this.getPanes();
          panes?.overlayMouseTarget.appendChild(this.div);
        }

        draw() {
          if (!this.div) return;

          const overlayProjection = this.getProjection();
          const point = overlayProjection.fromLatLngToDivPixel(this.position);

          if (point) {
            this.div.style.left = point.x + 'px';
            this.div.style.top = point.y + 'px';
          }
        }

        onRemove() {
          if (this.div) {
            this.div.parentNode?.removeChild(this.div);
            delete this.div;
          }
        }

        getPosition() {
          return this.position;
        }
      }

      // Create and add custom marker
      const customMarkerElement = createCustomMarker(property);
      const customMarker = new CustomMarker(position, customMarkerElement);

      customMarker.setMap(mapInstanceRef.current);
      markersRef.current.push(customMarker);

      // Add click listener to the custom marker element
      customMarkerElement.addEventListener('click', () => {
        setSelectedProperty(property);
        navigate(`/property3d/${property.property_id}`);
      });
    });

    // Extend bounds with valid markers
    validMarkers.forEach(position => {
      bounds.extend(position);
    });

    // Fit map to bounds if we have markers
    if (validMarkers.length > 0) {
      console.log('Fitting bounds for markers:', validMarkers.length);
      
      // Add a small padding to the bounds
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const latPadding = (ne.lat() - sw.lat()) * 0.1;
      const lngPadding = (ne.lng() - sw.lng()) * 0.1;
      bounds.extend(new google.maps.LatLng(ne.lat() + latPadding, ne.lng() + lngPadding));
      bounds.extend(new google.maps.LatLng(sw.lat() - latPadding, sw.lng() - lngPadding));
      
      mapInstanceRef.current.fitBounds(bounds);
      
      // If we only have one marker, zoom out a bit
      if (validMarkers.length === 1) {
        const listener = mapInstanceRef.current.addListener('idle', () => {
          mapInstanceRef.current.setZoom(Math.min(12, mapInstanceRef.current.getZoom()));
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  };

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      if (!isMapInitialized) {
        console.log('Map not initialized yet, waiting...');
        return;
      }

      try {
        const state = location.state as LocationState;
        if (!state || !state.cities) {
          throw new Error('No location data provided');
        }

        // Fetch properties for each selected city
        const promises = state.cities.map(city => 
          api.post('/buyer/properties/?page=1&page_size=10', {
            search: city
          })
        );

        const responses = await Promise.all(promises);
        const allProperties = responses.flatMap(response => response.data.results);
        
        // Remove duplicates based on property_id
        const uniqueProperties = Array.from(
          new Map(allProperties.map(item => [item.property_id, item])).values()
        );

        console.log('Fetched properties:', uniqueProperties);
        setProperties(uniqueProperties);
        updateMapMarkers(uniqueProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [location.state, isMapInitialized]);

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="absolute inset-0 w-full h-full"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading properties...</div>
        </div>
      )}

      {/* Property Count */}
      {!loading && properties.length > 0 && (
        <div className="absolute top-3 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-emerald-800 font-semibold">
            {properties.length} Properties Found
          </p>
        </div>
      )}

      {/* Selected Property Details */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 mx-auto max-w-2xl">
          <div className="flex gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-[#F5EC9B]">
              {selectedProperty.mainphoto_url && (
                <img 
                  src={selectedProperty.mainphoto_url} 
                  alt={selectedProperty.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-800">{selectedProperty.name}</h3>
              <p className="text-gray-600">{selectedProperty.address}</p>
              <p className="text-lg font-bold text-[#905E26] mt-2">
                ${Number(selectedProperty.selling_price).toLocaleString()}
              </p>
              <div className="flex gap-4 mt-2">
                <span className="text-gray-600">{selectedProperty.bedrooms} Beds</span>
                <span className="text-gray-600">{selectedProperty.bathrooms} Baths</span>
                {selectedProperty.sqft && (
                  <span className="text-gray-600">{selectedProperty.sqft} sqft</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map3DPage; 