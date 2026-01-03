import React, { useRef, useEffect } from 'react';

interface MarkerData {
  id?: string | number;
  position: { lat: number; lng: number };
  title: string;
  address: string;
  city: string;
  state: string;
  country: string;
  price?: number;
  image?: string;
}

interface MapPolygon {
  path: Array<{ lat: number; lng: number }>;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
}

let googleMapsScriptLoaded = false;

type GoogleMapWithMarkerProps = {
  markers: MarkerData[];
  polygon?: MapPolygon;
  mapTypeId?: 'ROADMAP' | 'HYBRID' | 'SATELLITE' | 'TERRAIN';
  onMarkerClick?: (marker: MarkerData) => void;
};

// Build a gold-gradient marker icon as an inline SVG data URL
function getGoldMarkerIcon(google: any) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#905E26" />
        <stop offset="25.82%" stop-color="#F5EC9B" />
        <stop offset="100%" stop-color="#905E26" />
      </linearGradient>
      <mask id="cut">
        <rect width="38" height="48" fill="#fff"/>
        <circle cx="19" cy="17.5" r="5.5" fill="#000"/>
      </mask>
    </defs>
    <path d="M19 1.5C10.163 1.5 3 8.663 3 17.5c0 9.72 12.61 21.61 15.2 24.12a1.5 1.5 0 0 0 2.1 0C22.89 39.11 35 27.22 35 17.5 35 8.663 27.837 1.5 19 1.5z" fill="url(#g)" mask="url(#cut)"/>
  </svg>`;
  const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  return {
    url,
    size: new google.maps.Size(38, 48),
    scaledSize: new google.maps.Size(38, 48),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(19, 48),
  };
}

const GoogleMapWithMarker: React.FC<GoogleMapWithMarkerProps> = ({ markers, polygon, mapTypeId = 'ROADMAP', onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const prevMarkersRef = useRef<any[]>([]);
  const polygonRef = useRef<any | null>(null);
  const currentInfoWindowRef = useRef<any | null>(null);
  const [isMapReady, setIsMapReady] = React.useState<boolean>(false);

  useEffect(() => {
    if (!window.google && !googleMapsScriptLoaded) 
    {
      googleMapsScriptLoaded = true;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: markers[0]?.position || { lat: 18.5601, lng: -68.3725 },
            zoom: 1,
            mapTypeId: (window.google.maps.MapTypeId as any)[mapTypeId] || window.google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });
          setIsMapReady(true);
        }
      };
      document.head.appendChild(script);
    } else if (window.google && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: markers[0]?.position || { lat: 18.5601, lng: -68.3725 },
        zoom: 1,
        mapTypeId: (window.google.maps.MapTypeId as any)[mapTypeId] || window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setIsMapReady(true);
    }
    return () => {
      // For debugging: warn if unmounted
      // console.warn('GoogleMap component unmounted!');
    };
  }, [mapTypeId]);

  // Polygon overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google || !isMapReady) return;

    if (!polygon || !polygon.path || polygon.path.length === 0) {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
      return;
    }

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    polygonRef.current = new window.google.maps.Polygon({
      paths: polygon.path,
      strokeColor: polygon.strokeColor ?? '#007E67',
      strokeOpacity: polygon.strokeOpacity ?? 0.9,
      strokeWeight: polygon.strokeWeight ?? 1.5,
      fillColor: polygon.fillColor ?? '#007E67',
      fillOpacity: polygon.fillOpacity ?? 0.28,
    });
    polygonRef.current.setMap(map);
  }, [polygon, isMapReady]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google || !isMapReady) return;
    const markersChanged = JSON.stringify(prevMarkersRef.current) !== JSON.stringify(markers);
    if (!markersChanged) return;
    prevMarkersRef.current = markers;
    const hideCloseButton = () => {
      const closeButtons = document.querySelectorAll('.gm-ui-hover-effect');
      closeButtons.forEach(btn => (btn as HTMLElement).style.display = 'none');
    };
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (markers.length > 0) {
      markers.forEach((markerData) => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map: map,
          title: markerData.title,
          icon: getGoldMarkerIcon(window.google),
        });
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="display: flex; flex-direction: row; align-items: center; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); padding: 12px 20px; min-width: 240px; max-width: 420px;">
              <img src="${markerData.image}" alt="${markerData.title}" style="width: 64px; height: 56px; object-fit: cover; border-radius: 10px; margin-right: 18px;" />
              <div style="display: flex; flex-direction: column; justify-content: center; flex: 1;">
                <div style="font-weight: bold; color: #007E67; font-size: 17px; line-height: 1.3; margin-bottom: 4px;">${markerData.title}</div>
                <div style="color: #000; font-size: 15px; margin-bottom: 4px;">${[markerData.address, markerData.city, markerData.state, markerData.country].filter(Boolean).join(', ')}</div>
                <div style="font-weight: bold; font-size: 16px; background: linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent;">$${markerData.price ? Number(markerData.price).toLocaleString() : '--'}</div>
              </div>
            </div>
          `
        });
        // Show info window only on hover
        window.google.maps.event.addListener(marker, 'mouseover', () => {
          if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close();
          }
          infoWindow.open(map, marker);
          currentInfoWindowRef.current = infoWindow;
          window.google.maps.event.addListenerOnce(infoWindow, 'domready', hideCloseButton);
        });
        window.google.maps.event.addListener(marker, 'mouseout', () => {
          infoWindow.close();
          if (currentInfoWindowRef.current === infoWindow) {
            currentInfoWindowRef.current = null;
          }
        });
        window.google.maps.event.addListener(marker, 'click', () => {
          if (onMarkerClick) onMarkerClick(markerData);
        });
        markersRef.current.push(marker);
      });
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
      }
    }
  }, [markers, isMapReady, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      id="property-details-google-map"
      className="w-full h-full"
      style={{ background: '#fff', minHeight: 420, borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
    />
  );
};

export default GoogleMapWithMarker; 