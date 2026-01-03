import React, { useRef, useEffect, useState } from 'react';
import { PropertyDetails, PropertyTab } from './types';
import { useTranslations } from '../../hooks/useTranslations';
import { TranslationKeys } from '../../types/i18n';
import virtualTourBtn from '../../assets/images/v-tour-btn.svg';
import playBtn from '../../assets/images/play-btn.svg';
import floorBtn from '../../assets/images/floor-btn.svg';
import btnBack from '../../assets/images/back-btn.svg';
import goldSave from '../../assets/images/gold-save.svg';
import goldThreeDots from '../../assets/images/gold-three-dots.svg';
import pdHome from '../../assets/images/pd-home.svg';
import pdInterior from '../../assets/images/pd-interior.svg';
import pdBathroom from '../../assets/images/pd-bathrooms.svg';
import sampleFloor from '../../assets/images/sample-floor.svg';
import ServiceSection from '../Home/DesktopServiceSectionUI';
import SimilarListingsCarousel, { SimilarListing } from './SimilarListingsCarousel';
import exploreImg1 from '../../assets/images/land-img-1.svg';
import exploreImg2 from '../../assets/images/explore-img2.svg';
import exploreImg3 from '../../assets/images/explore-img3.svg';
import exploreImg4 from '../../assets/images/explore-img4.svg';
import exploreImg5 from '../../assets/images/explore-img5.svg';
import { getStaticMapUrl } from '../../utils/googleMaps';
import markerMap from '../../assets/images/marker-map.svg';
import { GoldSaveIcon } from '../../assets/icons/ProfileMenuIcons';
import ShareButton from '../../components/ShareButton';
import api from '../../utils/api';
import { useAuthData } from '../../contexts/AuthContext';
import WebLogin from '../auth/WebLogin';
import ImageGalleryModal from '../../components/ImageGalleryModal';

import { showGlobalToast } from '../../utils/toast';


const TABS: { key: PropertyTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'location', label: 'Location' },
  { key: 'details', label: 'Property Details' },
  { key: 'contact', label: 'Get in Touch' },
];

type Props = {
  property: PropertyDetails;
  preview : string;
  activeTab: PropertyTab;
  setActiveTab: (tab: PropertyTab) => void;
  onToggleSave: (userId: string, is_saved: boolean) => void;

};

const NAVBAR_HEIGHT = 80; // Adjust if your navbar is a different height

const DesktopPropertyDetailsUI: React.FC<Props> = ({ property, preview, activeTab, setActiveTab, onToggleSave }) => {
  const { t } = useTranslations();
  const contactRef = useRef<HTMLDivElement>(null);

  const normalizeCoordinate = (value: number | string | null | undefined): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const latitude = normalizeCoordinate(property.latitude);
  const longitude = normalizeCoordinate(property.longitude);
  const hasValidCoordinates = latitude !== null && longitude !== null;

  const handleTabClick = (tab: PropertyTab) => {
    console.log('tab', property.agent);
    setActiveTab(tab);
    const sectionId: Record<PropertyTab, string> = {
      overview: 'overview-section',
      location: 'location-section',
      details: 'features-section',
      contact: 'contact-section',
      media: 'media-section',
    };
    const el = document.getElementById(sectionId[tab]);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Helper to scroll to floor plan section and activate tab
  const handleFloorPlanClick = () => {
    setActiveTab('details');
    const el = document.getElementById('floorplan-section');
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Prepare images for gallery layout (new API)
  const gridImages = property.photos?.results?.map(photo => photo.url) || [];
  const photoCount = property.photos?.count || gridImages.length;
  const hasPhotos = photoCount > 0;
  const placeholder = 'https://via.placeholder.com/800x428?text=No+Image';

  // Only show the first 5 images in the grid, but base the 'Show more' overlay on photoCount from the API
  const gridImagesToShow = gridImages.slice(0, 5);

  // Form state and validation
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    message: '',
    agree: false,
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    message: '',
    agree: '',
    api: '',
  });

  const validate = () => {
    const newErrors: any = {};
    if (!form.firstName || form.firstName.trim().length < 2) newErrors.firstName = 'First name is required (min 2 characters)';
    else if (form.firstName.length > 100) newErrors.firstName = 'First name cannot exceed 100 characters.';
    if (!form.lastName || form.lastName.trim().length < 2) newErrors.lastName = 'Last name is required (min 2 characters)';
    else if (form.lastName.length > 100) newErrors.lastName = 'Last name cannot exceed 100 characters.';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email address';
    else if (form.email.length > 100) newErrors.email = 'Email cannot exceed 100 characters.';
    if (!form.mobile) newErrors.mobile = 'Mobile number is required';
    else if (!/^\d{10,15}$/.test(form.mobile)) newErrors.mobile = 'Mobile number must be 10-15 digits';
    else if (form.mobile.length > 100) newErrors.mobile = 'Mobile number cannot exceed 100 characters.';
    if (!form.message || form.message.trim().length < 10) newErrors.message = 'Message is required (min 10 characters)';
    else if (form.message.length > 100) newErrors.message = 'Message cannot exceed 100 characters.';
    if (!form.agree) newErrors.agree = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    setErrors(e => ({ ...e, [name]: '' }));
  };

  const [contactLoading, setContactLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setContactLoading(true);
    setErrors(errors => ({ ...errors, api: '' }));
    try {
      const agent_email = property.agent && property.agent.id && typeof property.agent.id === 'object' ? property.agent.id.email : '';
      const res = await api.post('/common/contact/agent/', {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        mobile: form.mobile,
        message: form.message,
        agent_email,
      });
      if (res.data && res.data.success) {
        showGlobalToast(res.data.message || 'Message sent successfully!', 4000);
        setForm({ firstName: '', lastName: '', email: '', mobile: '', message: '', agree: false });
      } else {
        showGlobalToast(res.data?.message || 'Failed to send message', 4000);
      }
    } catch (err: any) {
      showGlobalToast(err?.response?.data?.message || 'Failed to send message', 4000);
    } finally {
      setContactLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'contact' && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  // Google Maps component (copied from DesktopUI)
  let googleMapsScriptLoaded = false; // module-level flag
  const GoogleMap: React.FC<{ markers: any[] }> = ({ markers }) => {
    const mapRef = React.useRef<HTMLDivElement>(null);
    const mapInstanceRef = React.useRef<any>(null); // store map instance
    const markersRef = React.useRef<any[]>([]);
    const prevMarkersRef = React.useRef<any[]>([]); // for bounds check

    // Load Google Maps script only once
    React.useEffect(() => {
      if (!window.google && !googleMapsScriptLoaded) {
        googleMapsScriptLoaded = true;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (mapRef.current && !mapInstanceRef.current) {
            console.log('Google Map initialized');
            mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
              center: markers[0]?.position || { lat: 18.5601, lng: -68.3725 },
              zoom: 1,
              mapTypeId: window.google.maps.MapTypeId.ROADMAP,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            });
          }
        };
        document.head.appendChild(script);
      } else if (window.google && mapRef.current && !mapInstanceRef.current) {
        console.log('Google Map initialized');
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: markers[0]?.position || { lat: 18.5601, lng: -68.3725 },
          zoom: 1,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
      }
      return () => {
        // For debugging: warn if unmounted
        console.warn('GoogleMap component unmounted!');
      };
    }, []); // Only run on mount

    // Update markers only when markers or map instance changes
    React.useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !window.google) return;
      // Only update if markers actually changed
      const markersChanged = JSON.stringify(prevMarkersRef.current) !== JSON.stringify(markers);
      if (!markersChanged) return;
      prevMarkersRef.current = markers;
      // Hide the close button on all info windows
      const hideCloseButton = () => {
        const closeButtons = document.querySelectorAll('.gm-ui-hover-effect');
        closeButtons.forEach(btn => (btn as HTMLElement).style.display = 'none');
      };
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (markers.length > 0) {
        markers.forEach((markerData, index) => {
          const marker = new window.google.maps.Marker({
            position: markerData.position,
            map: map,
            title: typeof markerData.title === 'string' ? markerData.title : (markerData.title?.name || ''),
            icon: {
              url: markerMap,
              scaledSize: new window.google.maps.Size(38, 48),
              labelOrigin: new window.google.maps.Point(19, 24),
              anchor: new window.google.maps.Point(19, 48)
            },
          });
          // Info window content: single card
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="display: flex; flex-direction: row; align-items: center; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); padding: 12px 20px; min-width: 240px; max-width: 420px;">
                <img src="${markerData.image}" alt="${typeof markerData.title === 'string' ? markerData.title : (markerData.title?.name || '')}" style="width: 64px; height: 56px; object-fit: cover; border-radius: 10px; margin-right: 18px;" />
                <div style="display: flex; flex-direction: column; justify-content: center; flex: 1;">
                  <div style="font-weight: bold; color: #007E67; font-size: 17px; line-height: 1.3; margin-bottom: 4px;">${typeof markerData.title === 'string' ? markerData.title : (markerData.title?.name || '')}</div>
                  <div style="color: #000; font-size: 15px; margin-bottom: 4px;">${[markerData.address, markerData.city, markerData.state, markerData.country].map(val => typeof val === 'string' ? val : (val?.name || '')).filter(Boolean).join(', ')}</div>
                  <div style="font-weight: bold; font-size: 16px; background: linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent;">$${markerData.price ? Number(markerData.price).toLocaleString() : '--'}</div>
                </div>
              </div>
            `
          });
          infoWindow.open(map, marker);
          window.google.maps.event.addListener(infoWindow, 'domready', hideCloseButton);
          markersRef.current.push(marker);
        });
        // Auto-fit map to markers
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
    }, [markers]); // Only update markers when markers change

    return (
      <div 
        ref={mapRef} 
        id="property-details-google-map"
        className="w-full h-full"
        style={{ background: '#fff', minHeight: 420 }}
      />
    );
  };

  // Helper for capitalizing a string
  function capitalize(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // Helper function to get agent profile photo URL
  const getAgentProfilePhotoUrl = () => {
    if (property.agent?.profile_photo_url) {
      return property.agent.profile_photo_url;
    }
    if (property.agent?.id && typeof property.agent.id === 'object') {
      return (property.agent.id as any).profile_photo_url;
    }
    return undefined;
  };

  // Use agent username or fallback to agent name for display, then capitalize
  const agentUsername = (() => {
    // Handle new structure where agent data is directly in property.agent
    if (property.agent && typeof property.agent === 'object') {
      if (property.agent.name) return capitalize(property.agent.name);
      if (property.agent.username) return capitalize(property.agent.username);
    }
    
    // Handle old structure where agent data is in property.agent.id
    if (property.agent && property.agent.id && typeof property.agent.id === 'object') {
      if (property.agent.id.username) return capitalize(property.agent.id.username);
      if (property.agent.id.name) return capitalize(property.agent.id.name);
    }
    
    return '--';
  })();

  // Add a flag for floor plan availability
  const hasFloorPlan = property.property_floorplans && property.property_floorplans.length > 0;

  // Auth and login modal state
  const auth = useAuthData();
  const userId = auth.user?.user_id;
  const authToken = auth.user?.access_token;
  const [showLogin, setShowLogin] = useState(false);
  const [pendingSaveToggle, setPendingSaveToggle] = useState<null | { userId: string; intendedIsSaved: boolean }>(null);

  // Similar listings state
  const [similarListings, setSimilarListings] = useState<SimilarListing[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!property.property_id || !authToken) {
        setSimilarListings([]);
        return;
      }
      setSimilarLoading(true);
      setSimilarError(null);
      try {
        const res = await api.post(
          '/buyer/property/nearby/',
          { property_id: property.property_id }
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSimilarListings(res.data);
        } else {
          setSimilarListings([]);
        }
      } catch (e: any) {
        setSimilarError(e?.response?.data?.message || 'Failed to load similar listings');
        setSimilarListings([]);
      } finally {
        setSimilarLoading(false);
      }
    };
    fetchSimilar();
  }, [property.property_id, authToken]);

  const handleSaveClick = () => {
    if (!userId) {
      setPendingSaveToggle({ userId: '', intendedIsSaved: !property.is_saved });
      setShowLogin(true);
      return;
    }
    onToggleSave(userId, !property.is_saved);
  };

  // After login, trigger the pending save toggle if needed
  const authData = useAuthData();
  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (pendingSaveToggle) {
      // Use the value from the top-level hook
      const userId = authData.user?.user_id;
      if (userId) {
        onToggleSave(userId, pendingSaveToggle.intendedIsSaved);
      }
      setPendingSaveToggle(null);
    }
  };

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ url: string; caption?: string }[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [currentMediaType, setCurrentMediaType] = useState<'photos' | 'videos' | 'floorplans' | 'vtour'>('photos');
  const mediaCache = useRef<{ [key: string]: { url: string; caption?: string }[] }>({});

  const fetchMedia = async (mediaType: 'photos' | 'videos' | 'floorplans' | 'vtour') => {
    if (!property.property_id) return;
    setGalleryLoading(true);
    setGalleryError(null);
    setCurrentMediaType(mediaType);
    // Use cache if available
    if (mediaCache.current[mediaType]) {
      setGalleryImages(mediaCache.current[mediaType]);
      setGalleryLoading(false);
      return;
    }
    try {
      const res = await api.post('/buyer/property/media/', {
        property_id: property.property_id,
        media_type: mediaType,
      });
      const results = res.data?.results || [];
      // For videos, expect url and caption, for floorplans/images, same
      const mapped = results.map((item: any) => ({ url: item.url, caption: item.caption }));
      mediaCache.current[mediaType] = mapped;
      setGalleryImages(mapped);
      setGalleryLoading(false);
    } catch (e: any) {
      setGalleryError(e?.response?.data?.message || 'Failed to load media');
      setGalleryLoading(false);
    }
  };

  const handleShowMoreClick = async () => {
    setShowGalleryModal(true);
    fetchMedia('photos');
  };

  const handleRequestMediaType = (mediaType: 'photos' | 'videos' | 'floorplans' | 'vtour') => {
    fetchMedia(mediaType);
  };

  // Add at the top of the component:
  const hasVideos = property.property_videos && property.property_videos.length > 0;

  return (
    <div className="bg-white min-h-screen p-8" style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Image Gallery Layout */}
      <div
        className="flex gap-4 mb-6 relative w-full max-w-full"
        style={{ height: 428, top: -9 }}
      >
        {/* Gallery rendering logic based on photo count */}
        {photoCount === 0 && (
          <div className="w-full flex items-center justify-center" style={{ height: 428, borderRadius: 18.65, background: '#f3f3f3' }}>
            <img src={placeholder} alt="No Image" style={{ width: 428, height: 428, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
          </div>
        )}
        {photoCount === 1 && (
          <div className="w-full flex items-center justify-center relative" style={{ height: 428, borderRadius: 18.65, background: '#f3f3f3' }}>
            <div className="relative" style={{ width: 700, height: 428 }}>
              <img src={gridImages[0]} alt="Property" style={{ width: '100%', height: 428, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
              {/* Gallery action buttons overlayed inside image */}
              <div className="absolute left-8 bottom-8 flex gap-4 z-10">
                {/* V Tour Button */}
                <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', color: '#fff', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: 'none', outline: 'none', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={virtualTourBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                  <span style={{ color: 'white', fontWeight: 500, fontSize: 18 }}>V Tour</span>
        </button>
                {/* Video Button */}
                {hasVideos && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={() => { setShowGalleryModal(true); fetchMedia('videos'); }}>
                    <span className="mr-3">
                      <img src={playBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Video</span>
                  </button>
                )}
                {/* Floor plan Button */}
                {hasFloorPlan && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={handleFloorPlanClick}>
                    <span className="mr-3">
                      <img src={floorBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Floor plan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {photoCount === 2 && (
          <div className="w-full flex gap-4" style={{ height: 428 }}>
            <div className="relative w-1/2 h-full">
              <img src={gridImages[0]} alt="Property 1" style={{ width: '100%', height: 428, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
              {/* Gallery action buttons overlayed inside left image */}
              <div className="absolute left-8 bottom-8 flex gap-4 z-10">
            {/* V Tour Button */}
                <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', color: '#fff', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: 'none', outline: 'none', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={virtualTourBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
              <span style={{ color: 'white', fontWeight: 500, fontSize: 18 }}>V Tour</span>
            </button>
            {/* Video Button */}
                {hasVideos && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={() => { setShowGalleryModal(true); fetchMedia('videos'); }}>
                    <span className="mr-3">
                      <img src={playBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Video</span>
                  </button>
                )}
            {/* Floor plan Button */}
                {hasFloorPlan && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={handleFloorPlanClick}>
              <span className="mr-3">
                <img src={floorBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
              </span>
              <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Floor plan</span>
            </button>
                )}
          </div>
        </div>
            <div className="w-1/2 h-full">
              <img src={gridImages[1]} alt="Property 2" style={{ width: '100%', height: 428, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
            </div>
          </div>
        )}
        {photoCount === 3 && (
          <div className="w-full flex gap-4" style={{ height: 428 }}>
            <div className="relative" style={{ width: '60%' }}>
              <img src={gridImages[0]} alt="Property 1" style={{ width: '100%', height: 428, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
              {/* Gallery action buttons overlayed inside left image */}
              <div className="absolute left-8 bottom-8 flex gap-4 z-10">
                {/* V Tour Button */}
                <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', color: '#fff', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: 'none', outline: 'none', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={virtualTourBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                  <span style={{ color: 'white', fontWeight: 500, fontSize: 18 }}>V Tour</span>
                </button>
                {/* Video Button */}
                {hasVideos && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={() => { setShowGalleryModal(true); fetchMedia('videos'); }}>
                    <span className="mr-3">
                      <img src={playBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Video</span>
                  </button>
                )}
                {/* Floor plan Button */}
                {hasFloorPlan && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={handleFloorPlanClick}>
                    <span className="mr-3">
                      <img src={floorBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Floor plan</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2" style={{ width: '40%' }}>
              <img src={gridImages[1]} alt="Property 2" style={{ width: '100%', height: 209, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
              <img src={gridImages[2]} alt="Property 3" style={{ width: '100%', height: 209, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
            </div>
          </div>
        )}
        {photoCount === 4 && (
          <div className="w-full flex gap-4" style={{ height: 428 }}>
            <div className="relative" style={{ width: '60%' }}>
              <img src={gridImages[0]} alt="Property 1" style={{ width: '100%', height: 428, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
              {/* Gallery action buttons overlayed inside left image */}
              <div className="absolute left-8 bottom-8 flex gap-4 z-10">
                {/* V Tour Button */}
                <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', color: '#fff', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: 'none', outline: 'none', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={virtualTourBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                  <span style={{ color: 'white', fontWeight: 500, fontSize: 18 }}>V Tour</span>
                </button>
                {/* Video Button */}
                {hasVideos && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={() => { setShowGalleryModal(true); fetchMedia('videos'); }}>
                    <span className="mr-3">
                      <img src={playBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Video</span>
                  </button>
                )}
                {/* Floor plan Button */}
                {hasFloorPlan && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={handleFloorPlanClick}>
                    <span className="mr-3">
                      <img src={floorBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Floor plan</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2" style={{ width: '40%' }}>
          <div className="flex gap-2" style={{ height: 209 }}>
                <img src={gridImages[1]} alt="Gallery 1" style={{ width: '50%', height: 209, borderRadius: 18.65, objectFit: 'cover' }} loading="lazy" />
                <img src={gridImages[2]} alt="Gallery 2" style={{ width: '50%', height: 209, borderRadius: 18.65, objectFit: 'cover' }} loading="lazy" />
          </div>
          <div className="flex gap-2" style={{ height: 209 }}>
                <img src={gridImages[3]} alt="Gallery 3" style={{ width: '50%', height: 209, borderRadius: 18.65, objectFit: 'cover' }} loading="lazy" />
            <div className="relative" style={{ width: '50%', height: 209 }}>
                  {/* Show more overlay with image as background */}
                  <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 18.65, overflow: 'hidden' }}>
                    <img src={gridImages[4]} alt="Gallery 4" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18.65, position: 'absolute', top: 0, left: 0 }} loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer" style={{ background: 'rgba(0, 42, 36, 0.75)', borderRadius: 18.65 }} onClick={handleShowMoreClick}>
                <div className="flex flex-col items-center text-white font-semibold">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="2" stroke="white" strokeWidth="2" /><path d="M8 11h.01M12 11h.01M16 11h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                        <span>Show more (+{photoCount - 5})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
            </div>
          </div>
        )}
        {photoCount > 4 && (
          <div className="w-full flex gap-4" style={{ height: 428 }}>
            <div className="relative" style={{ width: '60%' }}>
              <img src={gridImagesToShow[0]} alt="Property 1" style={{ width: '100%', height: 428, objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
              {/* Gallery action buttons overlayed inside left image */}
              <div className="absolute left-8 bottom-8 flex gap-4 z-10">
                {/* V Tour Button */}
                <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', color: '#fff', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: 'none', outline: 'none', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={virtualTourBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                  <span style={{ color: 'white', fontWeight: 500, fontSize: 18 }}>V Tour</span>
                </button>
                {/* Video Button */}
                {hasVideos && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={() => { setShowGalleryModal(true); fetchMedia('videos'); }}>
                    <span className="mr-3">
                      <img src={playBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Video</span>
                  </button>
                )}
                {/* Floor plan Button */}
                {hasFloorPlan && (
                  <button className="flex items-center px-6 py-2 rounded-[14px]" style={{ background: '#FFFFFF99', minWidth: 160, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} onClick={handleFloorPlanClick}>
                    <span className="mr-3">
                      <img src={floorBtn} alt="V Tour" style={{ width: 22, height: 22, marginRight: 12 }} />
                    </span>
                    <span style={{ color: '#222', fontWeight: 500, fontSize: 18 }}>Floor plan</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2" style={{ width: '40%' }}>
              <div className="flex gap-2" style={{ height: 209 }}>
                <img src={gridImagesToShow[1]} alt="Gallery 1" style={{ width: '50%', height: 209, borderRadius: 18.65, objectFit: 'cover' }} loading="lazy" />
                <img src={gridImagesToShow[2]} alt="Gallery 2" style={{ width: '50%', height: 209, borderRadius: 18.65, objectFit: 'cover' }} loading="lazy" />
              </div>
              <div className="flex gap-2" style={{ height: 209 }}>
                <img src={gridImagesToShow[3]} alt="Gallery 3" style={{ width: '50%', height: 209, borderRadius: 18.65, objectFit: 'cover' }} loading="lazy" />
                <div className="relative" style={{ width: '50%', height: 209 }}>
                  {/* Show more overlay with image as background only if photoCount > 5 */}
                  {photoCount > 5 ? (
                    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 18.65, overflow: 'hidden' }}>
                      <img src={gridImagesToShow[4]} alt="Gallery 4" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18.65, position: 'absolute', top: 0, left: 0 }} loading="lazy" />
                      <div
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        style={{ background: 'rgba(0, 42, 36, 0.75)', borderRadius: 18.65 }}
                        onClick={handleShowMoreClick}
                      >
                        <div className="flex flex-col items-center text-white font-semibold">
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="2" stroke="white" strokeWidth="2" /><path d="M8 11h.01M12 11h.01M16 11h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                          <span>Show more (+{photoCount - 5})</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={gridImagesToShow[4]} alt="Gallery 4" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18.65 }} loading="lazy" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Title, Price, Tabs, and Right Side Fixed Card */}
      <div className="flex gap-8 w-full mb-2">
        {/* Left: Title, Location, Price, Tabs (70%) */}
        <div style={{ width: '70%' }}>
          <h1 className="mb-1 text-green-900" style={{
            fontFamily: 'DM Serif Display',
            fontWeight: 550,
            fontSize: 28,
            lineHeight: '40px',
            letterSpacing: 0,
            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block'
          }}>{property.name || '--'}</h1>
          <div className="text-black text-lg font-[550] text-[20px]">
            {[property.address, property.city, property.state, property.country].filter(Boolean).join(', ') || '--'}
          </div>
          <div
            style={{
              fontFamily: 'DM Serif Display',
              fontWeight: 550,
              fontSize: 40,
              lineHeight: '40px',
              letterSpacing: 0,
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              marginTop: 8
            }}
          >$ {property.selling_price ? property.selling_price.toLocaleString() : '--'}</div>
          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200 mb-6 mt-4 relative">
            {TABS.map(tab => (
              <div key={tab.key} className="flex flex-col items-center" style={{ minWidth: 160 }}>
                <button
                  className={`text-[15px] leading-[32px] font-normal transition-colors ${activeTab === tab.key ? 'text-[#006A5B]' : 'text-black'}`}
                  onClick={() => handleTabClick(tab.key)}
                >
                  {tab.label}
                </button>
                {activeTab === tab.key && (
                  <div style={{
                    height: 2,
                    width: '100%',
                    marginTop: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                  }} />
                )}
              </div>
            ))}
          </div>
          {/* Tab Content (now directly after tabs) */}
          <div id="overview-section" style={{ scrollMarginTop: 140 }}>
            {/* Overview Section */}
            <div className="mb-6">
              <h2
                className="mb-4"
                style={{
                  fontFamily: 'DM Serif Display',
                  fontWeight: 700,
                  fontSize: 28,
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  display: 'inline-block',
                }}
              >
                About - {property.name}
              </h2>
              <div className="text-gray-800 text-base mb-4">
                <p className="mb-4">{property.details || '--'}</p>
                {/* <p className="mb-4">The design maximizes natural light and views with a grand double-height entrance hall. The open, bright layout incorporates materials like coral and marble and seamlessly integrates indoor and outdoor spaces.</p>
                <p>The first floor divides into a social and common wing and a family wing with 2 master-suite bedrooms. The upper floor houses 3 more master-suite bedrooms, including one with stunning sea, golf course, and cliff views. A study living room with a balcony and a corridor overlooking the double-height main living room completes this exceptional villa.</p> */}
              </div>
              {/* Property Type, Status, Year Built */}
              <div className="flex gap-8 mt-8 mb-6 w-full">
                {/* Property Type */}
                <div className="flex flex-1 items-start gap-3">
                  <img src={pdHome} alt="Property Type" className="w-8 h-8 mt-1" />
                  <div>
                    <div className="text-xs text-[#757575] font-semibold tracking-wide uppercase">PROPERTY TYPE</div>
                    <div className="text-2xl font-bold text-[#181A1B] leading-tight">{property.property_type?.name || '--'}</div>
                  </div>
                </div>
                {/* Status */}
                <div className="flex flex-1 items-start gap-3">
                  <img src={pdInterior} alt="Status" className="w-9 h-9 mt-1" />
                  <div>
                    <div className="text-xs text-[#757575] font-semibold tracking-wide uppercase">STATUS</div>
                    <div className="text-2xl font-bold text-[#181A1B] leading-tight">{property.property_status || '--'}</div>
                  </div>
                </div>
                {/* Year Built */}
                <div className="flex flex-1 items-start gap-3">
                  <img src={pdHome} alt="Year Built" className="w-8 h-8 mt-1" />
                  <div>
                    <div className="text-xs text-[#757575] font-semibold tracking-wide uppercase">YEAR BUILT</div>
                    <div className="text-2xl font-bold text-[#181A1B] leading-tight">{property.year_built || '--'}</div>
                  </div>
                </div>
              </div>
              {/* Days, Views, Saves */}
              <div className="flex items-center gap-4 text-base mt-2">
                <span className="font-bold text-black">{property.view_count ?? '--'} views</span>
                <span className="text-[#757575]">on Vistaview</span>
              </div>
            </div>
          </div>
          <div id="location-section" style={{ scrollMarginTop: 140 }}>
            <div className="mb-6">
              {/* Heading with green gradient and gold underline */}
              <div style={{ marginBottom: 16 }}>
                <h2
                  style={{
                    fontFamily: 'DM Serif Display',
                    fontWeight: 550,
                    fontSize: 32,
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                    display: 'inline-block',
                    marginBottom: 0,
                  }}
                >
                  {t('property.details.location' as TranslationKeys)}
                </h2>
                <div style={{
                  width: 300,
                  height: 2,
                  background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                  borderRadius: 2,
                  marginTop: 4,
                }} />
              </div>
              {/* Live Google Map with marker and overlay card */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: 420,
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                background: '#f3f3f3',
                marginBottom: 24,
              }}>
                {hasValidCoordinates ? (
                  <GoogleMap
                    markers={[{
                      position: { lat: latitude as number, lng: longitude as number },
                      title: property.name,
                      address: property.address,
                      city: property.city,
                      state: property.state,
                      country: property.country,
                      price: property.selling_price,
                      image: property.mainphoto_url || gridImages[0] || '',
                    }]}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#757575] text-lg font-medium">
                    Map not available
                  </div>
                )}
              </div>
            </div>
          </div>
          <div id="features-section" style={{ scrollMarginTop: 140 }}>
            <div className="mb-6">
              {/* Heading with green gradient and gold underline */}
              <div style={{ marginBottom: 16 }}>
                <h2
                  style={{
                    fontFamily: 'DM Serif Display',
                    fontWeight: 550,
                    fontSize: 32,
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                    display: 'inline-block',
                    marginBottom: 0,
                  }}
                >
                  Amenities & Features
                </h2>
                <div style={{
                  width: 300,
                  height: 2,
                  background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                  borderRadius: 2,
                  marginTop: 4,
                }} />
              </div>
              {/* Interior Section */}
              <div style={{ borderRadius: 4, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Interior</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px 0 24px', gap: 32 }}>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>BASEMENT</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.basement_types?.map(f => f.name).join(', ') || '--'}</div>
                  </div>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>FLOOR COVERINGS</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.floor_coverings?.map(f => f.name).join(', ') || '--'}</div>
                  </div>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>BEDROOMS</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.bedrooms ?? '--'}</div>
                  </div>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>PARTIAL BATH</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.half_bathrooms ?? '--'}</div>
                  </div>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>FULL BATHROOMS</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.full_bathrooms ?? '--'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px', gap: 32 }}>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4, marginTop: 12 }}>APPLIANCES</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.appliance_types?.map(a => a.name).join(', ') || '--'}</div>
                  </div>
                </div>
              </div>
              {/* Rooms Section */}
              {property.building_rooms && property.building_rooms.length > 0 && (
                <div style={{ borderRadius: 4, marginBottom: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Rooms</div>
                  <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                    {property.building_rooms.map((room: any, idx: number) => (
                      <div key={room.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
                        <img 
                          src={`https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80&${idx}`} 
                          alt={room.name || room.value} 
                          style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} 
                        />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#333', textAlign: 'center' }}>
                          {room.name || room.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Additional Features Section */}
              <div style={{ borderRadius: 4, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Additional Features</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px', gap: 32 }}>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>INDOOR FEATURES</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {property.indoor_features && property.indoor_features.length > 0
                        ? property.indoor_features.map(f => f.name).join(', ')
                        : '--'}
                    </div>
                  </div>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>OUTDOOR AMENITIES</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {property.outdoor_amenities && property.outdoor_amenities.length > 0
                        ? property.outdoor_amenities.map(f => f.name).join(', ')
                        : '--'}
                    </div>
                  </div>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>VIEWS</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {property.view_types && property.view_types.length > 0
                        ? property.view_types.map(v => v.name).join(', ')
                        : '--'}
                    </div>
                  </div>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>COMMUNITY FEATURES</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {property.community_types && property.community_types.length > 0
                        ? property.community_types.map(c => c.name).join(', ')
                        : '--'}
                    </div>
                  </div>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>PARKING LOT</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.parking_spaces ?? '--'}</div>
                  </div>
                </div>
              </div>
              {/* Building Section */}
              <div style={{ borderRadius: 4, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Building</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px', gap: 32 }}>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>YEAR BUILT</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.year_built ?? '--'}</div>
                  </div>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>STYLE</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.architectural_styles?.map(f => f.name).join(', ') || '--'}</div>
                  </div>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>TOTAL SQ. FT.</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.total_sqft ? property.total_sqft.toLocaleString() : '--'}</div>
                  </div>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>LOT SIZE</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.lot_size ? property.lot_size + ' ' + (property.lot_size_uom || '') : '--'}</div>
                  </div>
                </div>
              </div>
              {/* Listing Type Section */}
              <div style={{ borderRadius: 4, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Listing Type</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px 24px', gap: 32 }}>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>PROPERTY ID</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.unit_number || '--'}</div>
                  </div>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>PROPERTY TYPE</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.property_type?.name || '--'}</div>
                  </div>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>MARKETED BY</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Agent : {agentUsername}</div>
                  </div>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ color: '#757575', fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>STATUS</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{property.property_status || '--'}</div>
                  </div>
                </div>
              </div>
              {/* Floor Plan Section */}
              <div id="floorplan-section" style={{ borderRadius: 4, marginBottom: 24, scrollMarginTop: 140 }}>
                <div style={{ fontWeight: 700, fontSize: 20, padding: '6px 24px', background: '#F1F1F1', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottom: '1px solid #e0e0e0' }}>Floor Plan</div>
                <div style={{ padding: 24 }}>
                  {property.property_floorplans && property.property_floorplans.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                      {property.property_floorplans.map((plan, idx) => (
                        <img
                          key={idx}
                          src={plan.url}
                          alt={`Floor Plan ${idx + 1}`}
                          style={{ width: '100%', maxWidth: 700, borderRadius: 8, margin: '0 auto', display: 'block' }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>No floor plan available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
        {/* Right: Info Card (30%) */}
        <div style={{ width: '30%', position: 'relative' }}>
          <div className="sticky" style={{ top: 100, width: '100%' }}>
            {/* Save, Share, More Buttons */}
            <div className="flex items-center justify-end gap-12 mb-4">
              <button
                className="flex items-center gap-2 text-gray-700 font-medium"
                onClick={handleSaveClick}
                aria-pressed={property.is_saved}
              >
                <GoldSaveIcon filled={property.is_saved} size={28} />
                <span>{property.is_saved ? 'Saved' : 'Save'}</span>
              </button>
              <ShareButton
                variant="green"
                title={`${property.name} - ${property.selling_price ? `$${property.selling_price.toLocaleString()}` : 'Contact for price'}`}
                text={`Check out this ${property.property_type?.name || 'property'} at ${property.address || 'this location'}. ${property.selling_price ? `Priced at $${property.selling_price.toLocaleString()}` : 'Contact for pricing'}`}
                className="flex items-center gap-1 border px-4 py-2 rounded-lg text-green-900 border-green-200 text-[15px] font-normal"
              />
              <button className="flex items-center gap-2 text-gray-700 font-medium">
                <img src={goldThreeDots} alt="More" width={28} height={28} />
                <span>More</span>
              </button>
            </div>
            {/* Info Card (beds, baths, agent, etc.) */}
            <div className="bg-white rounded-2xl shadow p-8 mb-4 border border-[#ECECEC]">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 items-center">
                {/* Bedroom(s) (left) */}
                <div className="flex items-center gap-3">
                  <img src={pdHome} alt="Bedroom(s)" className="w-8 h-8" />
                  <div>
                    <div className="text-xs font-bold text-[#3B414D] tracking-wide text-left">BEDS</div>
                    <div className="text-xl font-bold text-black mt-1">{property.bedrooms ?? '--'} Bedroom(s)</div>
                  </div>
                </div>
                {/* Interior (right) */}
                <div className="flex items-center gap-3">
                  <img src={pdInterior} alt="Interior" className="w-8 h-8" />
                  <div>
                    <div className="text-xs font-bold text-[#3B414D] tracking-wide text-left">INTERIOR</div>
                    <div className="text-xl font-bold text-black mt-1">{property.total_sqft ? property.total_sqft.toLocaleString() : '--'} Sq. Ft.</div>
                  </div>
                </div>
                {/* Divider */}
                <div className="col-span-2 my-2 border-t border-[#ECECEC]" />
                {/* Bathroom(s) (left) */}
                <div className="flex items-center gap-3">
                  <img src={pdBathroom} alt="Bathroom(s)" className="w-8 h-8" />
                  <div>
                    <div className="text-xs font-bold text-[#3B414D] tracking-wide text-left">BATH</div>
                    <div className="text-xl font-bold text-black mt-1">{property.full_bathrooms ?? '--'} Bathrooms</div>
                  </div>
                </div>
                {/* Exterior (right) */}
                <div className="flex items-center gap-3">
                  <img src={pdHome} alt="Exterior" className="w-8 h-8" />
                  <div>
                    <div className="text-xs font-bold text-[#3B414D] tracking-wide text-left">EXTERIOR</div>
                    <div className="text-xl font-bold text-black mt-1">{property.total_sqft ? property.total_sqft.toLocaleString() : '--'} Sq. Ft.</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Agent Card */}
            <div className="rounded-2xl shadow p-6 flex flex-col items-start" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}>
              <div className="flex items-center mb-6 w-full">
                {getAgentProfilePhotoUrl() ? (
                  <img src={getAgentProfilePhotoUrl()} alt="Agent" className="w-16 h-16 rounded-full object-cover mr-4" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#E5E7EB] flex items-center justify-center mr-4">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="#B0B0B0"/>
                      <rect x="4" y="16" width="16" height="6" rx="3" fill="#B0B0B0"/>
                    </svg>
                  </div>
                )}
                <div>
                  <div className="font-bold text-white text-xl mb-1">{agentUsername}</div>
                  <div className="text-white text-base mb-1">Agent</div>
                  {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.email && (
                    <div className="text-white text-xs mb-1">{property.agent.id.email}</div>
                  )}
                  {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.mobile_number && (
                    <div className="text-white text-xs mb-1">{property.agent.id.mobile_number}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 w-full mt-2">
                <button
                  className="flex-1 bg-white text-[#007E67] py-3 rounded-xl font-semibold text-lg transition hover:bg-gray-100 border-none"
                  onClick={() => {
                    if (contactRef.current) {
                      contactRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                    setActiveTab('overview');
                  }}
                >
                  {property?.builder_name === 'Skyven Builder' || property?.builder === 'Skyven Builder' || (property?.title && property.title.toLowerCase().includes('skyven')) ? 'Contact Builder' : 'Contact Agent'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-lg transition hover:bg-[#f6e27a1a] bg-transparent"
                  style={{
                    color: 'white',
                    border: '1px solid',
                    borderImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%) 1',
                    borderRadius: 10,
                  }}
                >
                  <img src={virtualTourBtn} alt="VR Tour" className="w-6 h-6" />
                  VR Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!preview && <> <div
        id="contact-section"
        ref={contactRef}
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
          borderRadius: 0,
          padding: '64px 0',
          paddingTop: 128,
          marginTop: 64,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          color: 'white',
          minHeight: 420,
          gap: 48,
          boxSizing: 'border-box',
        }}
      >
        {/* Column 1: Agent Image */}
        <div style={{ width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 0 }}>
          {getAgentProfilePhotoUrl() ? (
            <img
              src={getAgentProfilePhotoUrl()}
              alt="Agent"
              style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }}
            />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#B0B0B0"/>
                <rect x="4" y="16" width="16" height="6" rx="3" fill="#B0B0B0"/>
              </svg>
            </div>
          )}
        </div>
        {/* Column 2: Agent Details */}
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 2 }}>{agentUsername}</div>
          <div style={{ color: 'white', fontSize: 16, marginBottom: 18 }}>Real Estate Agent</div>
          <button
            style={{
              border: '1px solid #fff',
              color: 'white',
              background: 'transparent',
              borderRadius: 8,
              padding: '8px 22px',
              fontWeight: 500,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              marginBottom: 32,
              cursor: 'pointer',
            }}
          >
            Agent Profile
            <span style={{ marginLeft: 10, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </button>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, color: 'white' }}>Office</div>
          {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.office_address && (
            <div style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>
              {property.agent.id.office_address.split('\n').map((line: string, index: number) => (
                <div key={index} style={{ fontWeight: index === 0 ? 700 : 400 }}>
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Column 3: Contact Form */}
        <div style={{ flex: 1, maxWidth: 700, color: 'white', alignSelf: 'flex-start', marginTop: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'DM Serif Display', marginBottom: 0 }}>Let's get in touch</div>
          <div style={{ width: 180, height: 2, background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 100%, #905E26 100%)', borderRadius: 2, margin: '8px 0 24px 0' }} />
          <form className="grid grid-cols-2 gap-4" style={{ color: 'black' }} onSubmit={handleSubmit} noValidate>
            <div className="col-span-1" style={{ display: 'flex', flexDirection: 'column' }}>
              <input name="firstName" value={form.firstName} onChange={handleInput} style={{ padding: 12, border: '1px solid #BDBDBD', borderRadius: 6, background: 'transparent', color: '#fff' }} placeholder="First name" />
              {errors.firstName && <span style={{ color: '#FFD6D6', fontSize: 13, marginTop: 2 }}>{errors.firstName}</span>}
            </div>
            <div className="col-span-1" style={{ display: 'flex', flexDirection: 'column' }}>
              <input name="lastName" value={form.lastName} onChange={handleInput} style={{ padding: 12, border: '1px solid #BDBDBD', borderRadius: 6, background: 'transparent', color: '#fff' }} placeholder="Last name" />
              {errors.lastName && <span style={{ color: '#FFD6D6', fontSize: 13, marginTop: 2 }}>{errors.lastName}</span>}
            </div>
            <div className="col-span-1" style={{ display: 'flex', flexDirection: 'column' }}>
              <input name="email" value={form.email} onChange={handleInput} style={{ padding: 12, border: '1px solid #BDBDBD', borderRadius: 6, background: 'transparent', color: '#fff' }} placeholder="Email address" />
              {errors.email && <span style={{ color: '#FFD6D6', fontSize: 13, marginTop: 2 }}>{errors.email}</span>}
            </div>
            <div className="col-span-1" style={{ display: 'flex', flexDirection: 'column' }}>
              <input name="mobile" value={form.mobile} onChange={handleInput} style={{ padding: 12, border: '1px solid #BDBDBD', borderRadius: 6, background: 'transparent', color: '#fff' }} placeholder="Mobile no" />
              {errors.mobile && <span style={{ color: '#FFD6D6', fontSize: 13, marginTop: 2 }}>{errors.mobile}</span>}
            </div>
            <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column' }}>
              <textarea name="message" value={form.message} onChange={handleInput} style={{ padding: 12, border: '1px solid #BDBDBD', borderRadius: 6, background: 'transparent', color: '#fff', minHeight: 90 }} placeholder="Enter message..." />
              {errors.message && <span style={{ color: '#FFD6D6', fontSize: 13, marginTop: 2 }}>{errors.message}</span>}
            </div>
            <div className="col-span-2 flex items-center gap-2" style={{ color: '#fff', fontSize: 13 }}>
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleInput} style={{ height: 16, width: 16, marginRight: 6 }} />
              <span>By submitting this form, you agree to our <a href="#" style={{ textDecoration: 'underline', color: '#fff', fontWeight: 500 }}>Terms of use</a> and <a href="#" style={{ textDecoration: 'underline', color: '#fff', fontWeight: 500 }}>Privacy Policy</a></span>
            </div>
            {errors.agree && <span className="col-span-2" style={{ color: '#FFD6D6', fontSize: 13, marginTop: -10 }}>{errors.agree}</span>}
            <button type="submit" className="col-span-2" style={{ width: '100%', background: '#fff', color: '#007E67', border: '1px solid #007E67', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 17, marginTop: 8, opacity: contactLoading ? 0.7 : 1, position: 'relative' }} disabled={contactLoading}>
              {contactLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="22" height="22" viewBox="0 0 50 50" style={{ marginRight: 8 }}><circle cx="25" cy="25" r="20" fill="none" stroke="#007E67" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" /></circle></svg>
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </button>
            {errors.api && <span className="col-span-2" style={{ color: '#FFD6D6', fontSize: 13, marginTop: 4 }}>{errors.api}</span>}
          </form>
        </div>
      </div>
      
      <SimilarListingsCarousel listings={similarListings} />
      <div className='mt-12'>
        {/* <ServiceSection /> */}
      </div> </>}
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <WebLogin onClose={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
      {/* ImageGalleryModal for all images */}
      <ImageGalleryModal
        images={galleryImages}
        open={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        initialIndex={Math.min(4, (galleryImages.length ?? 1) - 1)}
        onRequestMediaType={handleRequestMediaType}
        currentMediaType={currentMediaType}
        loading={galleryLoading}
      >
        {galleryLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="text-white text-lg">Loading media...</div>
          </div>
        )}
        {galleryError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="text-red-400 text-lg">{galleryError}</div>
          </div>
        )}
        {!galleryLoading && !galleryError && galleryImages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
            <div className="text-gray-400 text-lg font-semibold">
              {currentMediaType === 'videos' ? 'No videos available' : currentMediaType === 'photos' ? 'No images available' : 'No floorplans available'}
            </div>
          </div>
        )}
      </ImageGalleryModal>
    </div>
  );
};

export default DesktopPropertyDetailsUI;

export const PropertyDetailsSkeleton: React.FC = () => (
  <div className="bg-white min-h-screen p-8 animate-pulse">
    {/* Image Gallery Skeleton */}
    <div className="flex gap-4 mb-6 relative w-full max-w-full" style={{ height: 428 }}>
      <div className="relative flex-1 min-w-0" style={{ maxWidth: '60%' }}>
        <div className="w-full h-full bg-gray-200 rounded-xl" />
      </div>
      <div className="flex flex-col gap-2" style={{ width: '40%', minWidth: 220 }}>
        <div className="flex gap-2" style={{ height: 209 }}>
          <div className="w-1/2 h-full bg-gray-200 rounded-xl" />
          <div className="w-1/2 h-full bg-gray-200 rounded-xl" />
        </div>
        <div className="flex gap-2" style={{ height: 209 }}>
          <div className="w-1/2 h-full bg-gray-200 rounded-xl" />
          <div className="w-1/2 h-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
    {/* Title, Price, Info Cards Skeleton */}
    <div className="mb-6">
      <div className="h-8 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-2" />
      <div className="h-10 w-1/4 bg-gray-200 rounded mb-6" />
      <div className="flex gap-8">
        <div className="flex-1 h-24 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-24 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
    {/* Tab Content Skeleton */}
    <div className="h-6 w-1/4 bg-gray-200 rounded mb-4" />
    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
    <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
  </div>
);