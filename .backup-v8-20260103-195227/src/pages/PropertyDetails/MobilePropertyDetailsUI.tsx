import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PropertyDetails, PropertyTab } from './types';
import { useTranslations } from '../../hooks/useTranslations';
import { TranslationKeys } from '../../types/i18n';
import useIsMobile from '../../hooks/useIsMobile';
import backBtn from '../../assets/images/mobile/pd-back-arrow.svg';
import savedIcon from '../../assets/images/saved.svg';
import vTourBtn from '../../assets/images/mobile/pd-v-tour.svg';
import playBtn from '../../assets/images/mobile/pd-gold-play.svg';
import planHeader from '../../assets/images/mobile/pd-floor.svg';
import pdViewMap from '../../assets/images/mobile/pd-back-arrow.svg';
import pdPhone from '../../assets/images/mobile/pd-phone.svg';
import pdBed from '../../assets/images/mobile/pd-gold-home.svg';
import pdBath from '../../assets/images/mobile/pd-gold-bath.svg';
import pdInterior from '../../assets/images/mobile/pd-gold-interior.svg';
import userIcon from '../../assets/images/mobile/user-icon.svg';
import planSuccess from '../../assets/images/mobile/plan-success.svg';
import pdMap from '../../assets/images/mobile/pd-map.svg';
import markerMap from '../../assets/images/marker-map.svg';
import pdShare from '../../assets/images/mobile/pd-share.svg';
import videoThumbFallback from '../../assets/images/mobile/video-thumb-fallback.svg';
import ImageGalleryModal from '../../components/ImageGalleryModal';
import MobileImageGallery from '../../components/MobileImageGallery';
import BottomModal from '../../components/BottomModal';
import ShareButton from '../../components/ShareButton';
import ShareModal from '../../components/ShareModal';
import ModalCloseButton from '../../components/ModalCloseButton';
import api from '../../utils/api';
import { showGlobalToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Custom Share Button Component with specific icon
const CustomShareButton: React.FC<{
  title: string;
  text: string;
  className?: string;
}> = ({ title, text, className = '' }) => {
  const { t } = useTranslations();
  const isMobile = useIsMobile();
  const [isSharing, setIsSharing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;
    const shareText = text || title;

    // For desktop users, show the share modal
    if (!isMobile) {
      setShowModal(true);
      return;
    }

    setIsSharing(true);
    
    try {
      // Check if native sharing is available (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        showGlobalToast(t('common.shareSuccess' as TranslationKeys), 3000);
      } else {
        // Fallback for mobile devices without native sharing
        await navigator.clipboard.writeText(shareUrl);
        showGlobalToast(t('common.linkCopied' as TranslationKeys), 3000);
      }
    } catch (error: any) {
      console.error('Share failed:', error);
      
      // If clipboard fails, try alternative method
      if (error.name === 'NotAllowedError' || error.name === 'TypeError') {
        try {
          // Fallback: create temporary input element
          const tempInput = document.createElement('input');
          tempInput.value = shareUrl;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          
          showGlobalToast(t('common.linkCopied' as TranslationKeys), 3000);
        } catch (fallbackError) {
          console.error('Fallback copy failed:', fallbackError);
          showGlobalToast(t('common.shareError' as TranslationKeys), 3000);
        }
      } else {
        showGlobalToast(t('common.shareError' as TranslationKeys), 3000);
      }
    } finally {
      setIsSharing(false);
    }
  }, [title, text, isMobile, t]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`p-2 bg-white bg-opacity-80 rounded-full ${className}`}
        title={t('property.details.share' as TranslationKeys)}
        aria-label={t('property.details.share' as TranslationKeys)}
      >
        {isSharing ? (
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60 20" />
          </svg>
        ) : (
          <img src={pdShare} alt="Share" className="w-6 h-6" />
        )}
      </button>
      
      {/* Share Modal for desktop */}
      <ShareModal
        isOpen={showModal}
        onClose={handleModalClose}
        url={window.location.href}
        title={title}
        text={text}
      />
    </>
  );
};

const TABS: { key: PropertyTab; label: TranslationKeys }[] = [
  { key: 'overview', label: 'property.details.overview' as TranslationKeys },
  { key: 'location', label: 'property.details.location' as TranslationKeys },
  { key: 'details', label: 'property.details.features' as TranslationKeys },
];

type Props = {
  property: PropertyDetails;
  activeTab: PropertyTab;
  setActiveTab: (tab: PropertyTab) => void;
  onToggleSave: (userId: string, is_saved: boolean) => void;
  hideHeader?: boolean;
  hideFooter?: boolean;
  isPropertyAddUpdateFlow?: boolean; // New prop to detect property add/update flow
};

export const PropertyDetailsSkeleton: React.FC = () => (
  <div className="bg-white min-h-screen flex flex-col animate-pulse">
    {/* Actual Header (copied from main UI) */}
    <div className="sticky top-0 z-30 bg-white flex items-center justify-between px-2 py-2 border-b border-gray-100">
      <button className="p-2 bg-white bg-opacity-80 rounded-full"><img src={backBtn} alt="Back" /></button>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        {/* Save button placeholder for skeleton, no icon needed */}
      </div>
    </div>
    {/* Main Image Skeleton */}
    <div className="relative mb-4">
      <div className="rounded-xl w-full h-[290px] bg-gray-200" />
    </div>
    {/* Title, Location, Price Skeleton */}
    <div className="mb-2 ml-3">
      <div className="h-7 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-5 w-1/2 bg-gray-200 rounded mb-1" />
      <div className="h-7 w-1/3 bg-gray-200 rounded" />
    </div>
    {/* Info Cards Skeleton */}
    <div className="grid grid-cols-2 gap-4 mb-4 px-2">
      <div className="bg-gray-200 rounded-2xl p-4 h-20" />
      <div className="bg-gray-200 rounded-2xl p-4 h-20" />
      <div className="bg-gray-200 rounded-2xl p-4 h-20" />
      <div className="bg-gray-200 rounded-2xl p-4 h-20" />
    </div>
    {/* Tab Section Skeleton */}
    <div className="sticky top-[56px] z-20 bg-white flex justify-between border-b border-gray-200 mb-4 mt-2">
      <div className="h-6 w-1/3 bg-gray-200 rounded" />
      <div className="h-6 w-1/3 bg-gray-200 rounded" />
      <div className="h-6 w-1/3 bg-gray-200 rounded" />
    </div>
    {/* Tab Content Skeleton */}
    <div className="flex-1 px-3">
      <div className="h-5 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
    </div>
    {/* Actual Footer (copied from main UI, with placeholder data) */}
    <div className="sticky bottom-0 z-30 bg-white flex items-center justify-between px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] gap-2">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"></div>
        <div className="flex flex-col">
          <span className="font-bold text-green-900 text-sm">--</span>
          <span className="text-xs text-gray-500 block">--</span>
        </div>
      </div>
      <a className="p-2 bg-white bg-opacity-80 rounded-full">
        <img src={pdPhone} alt="Call" />
      </a>
      <button
        style={{
          borderRadius: '10px',
          border: '1px solid var(--Primary-Green, #004236)',
          boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A',
          color: 'var(--Primary-Green, #004236)',
          background: '#fff'
        }}
        className="px-3 py-2 rounded-lg flex items-center gap-1"
      >
        <img src={vTourBtn} alt="Virtual Tour" className="w-5 h-5" />
        Virtual Tour
      </button>
    </div>
  </div>
);

// Google Maps component (copied from DesktopPropertyDetailsUI)
const GoogleMap: React.FC<{ markers: any[] }> = ({ markers }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<any>(null);
  const markersRef = React.useRef<any[]>([]);

  React.useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (mapRef.current) {
          const newMap = new window.google.maps.Map(mapRef.current, {
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
          setMap(newMap);
        }
      };
      document.head.appendChild(script);
    } else if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
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
      setMap(newMap);
    }
  }, [map]);

  React.useEffect(() => {
    if (!map || !window.google) return;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (markers.length > 0) {
      markers.forEach((markerData, index) => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map: map,
          title: markerData.title,
          icon: {
            url: markerMap,
            scaledSize: new window.google.maps.Size(38, 48),
            labelOrigin: new window.google.maps.Point(19, 24),
            anchor: new window.google.maps.Point(19, 48)
          },
          // label: {
          //   text: '',
          //   color: 'white',
          //   fontWeight: 'bold',
          //   fontSize: '16px',
          //   fontFamily: 'Arial',
          // },
        });
        // Info window content: name and address only, address in black
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style=\"display: flex; flex-direction: column; justify-content: center; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); padding: 12px 20px; min-width: 160px; max-width: 320px;\">
              <div style=\"font-weight: bold; color: #007E67; font-size: 14px; line-height: 1.3; margin-bottom: 4px;\">${markerData.title}</div>
              <div style=\"color: #000; font-size: 12px; font-weight: 500;\">${markerData.location || [markerData.address, markerData.city, markerData.state, markerData.country].filter(Boolean).join(', ')}</div>
            </div>
            <style> .gm-ui-hover-effect { display: none !important; } </style>
          `
        });
        infoWindow.open(map, marker);
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
  }, [map, markers]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[240px] rounded-xl bg-gray-200"
      style={{ background: '#fff', minHeight: 240 }}
    ></div>
  );
};

const MobilePropertyDetailsUI: React.FC<Props> = ({ property , activeTab, setActiveTab, onToggleSave, hideHeader, hideFooter, isPropertyAddUpdateFlow = false }) => {
  const { t } = useTranslations();
  const contactRef = useRef<HTMLDivElement>(null);
  const tabSectionRef = useRef<HTMLDivElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMode, setGalleryMode] = useState<'grid' | 'fullscreen'>('grid');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryMediaType, setGalleryMediaType] = useState<'photos' | 'videos' | 'floorplans'>('photos');
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', lastName: '', email: '', mobile: '', message: '', agree: false });
  const [enquiryErrors, setEnquiryErrors] = useState<{ [k: string]: string }>({});
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const { isLoggedIn, user } = useAuth();

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
  const navigate = useNavigate();
  const location = useLocation();

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  const images =
    galleryMediaType === 'photos'
      ? property.property_photos?.filter(p => typeof p.url === 'string' && !!p.url).map(p => ({ url: p.url as string, caption: p.caption })) || []
      : galleryMediaType === 'videos'
      ? property.property_videos?.filter(v => typeof v.url === 'string' && !!v.url).map(v => ({ url: v.url as string, caption: v.caption })) || []
      : galleryMediaType === 'floorplans'
      ? property.property_floorplans?.filter(f => typeof f.url === 'string' && !!f.url).map(f => ({ url: f.url as string, caption: f.caption })) || []
      : [];

  // Swipe logic for fullscreen
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) {
      // Swipe right
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    } else if (deltaX < -50) {
      // Swipe left
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
    touchStartX.current = null;
  };

  const handleTabClick = (tab: PropertyTab) => {
    setActiveTab(tab);
    if (tab === 'contact' && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper for capitalizing a string
  function capitalize(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }
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

  const handleEnquiryInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEnquiryForm(f => ({ ...f, [name]: value }));
    setEnquiryErrors(e => ({ ...e, [name]: '' }));
  };
  const validateEnquiry = () => {
    const errs: any = {};
    if (!enquiryForm.name || enquiryForm.name.trim().length < 2) errs.name = 'First name is required (min 2 characters)';
    else if (enquiryForm.name.length > 100) errs.name = 'First name cannot exceed 100 characters.';
    if (!enquiryForm.lastName || enquiryForm.lastName.trim().length < 2) errs.lastName = 'Last name is required (min 2 characters)';
    else if (enquiryForm.lastName.length > 100) errs.lastName = 'Last name cannot exceed 100 characters.';
    if (!enquiryForm.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(enquiryForm.email)) errs.email = 'Invalid email';
    else if (enquiryForm.email.length > 100) errs.email = 'Email cannot exceed 100 characters.';
    if (!enquiryForm.mobile) errs.mobile = 'Mobile number is required';
    else if (!/^\d{10,15}$/.test(enquiryForm.mobile)) errs.mobile = 'Mobile number must be 10-15 digits';
    else if (enquiryForm.mobile.length > 100) errs.mobile = 'Mobile number cannot exceed 100 characters.';
    if (!enquiryForm.message || enquiryForm.message.trim().length < 10) errs.message = 'Message is required (min 10 characters)';
    else if (enquiryForm.message.length > 100) errs.message = 'Message cannot exceed 100 characters.';
    if (!enquiryForm.agree) errs.agree = 'You must agree to the terms';
    setEnquiryErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleEnquirySubmit = async () => {
    if (!validateEnquiry()) return;
    setEnquiryLoading(true);
    try {
      const agent_email = property.agent && property.agent.id && typeof property.agent.id === 'object' ? property.agent.id.email : '';
      const res = await api.post('/common/contact/agent/', {
        first_name: enquiryForm.name,
        last_name: enquiryForm.lastName,
        email: enquiryForm.email,
        mobile: enquiryForm.mobile,
        message: enquiryForm.message,
        agent_email,
      });
      if (res.data && res.data.success) {
        showGlobalToast(res.data.message || 'Message sent successfully!');
        setEnquiryOpen(false);
        setEnquiryForm({ name: '', lastName: '', email: '', mobile: '', message: '', agree: false });
      } else {
        showGlobalToast(res.data?.message || 'Failed to send message');
      }
    } catch (err: any) {
      showGlobalToast(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setEnquiryLoading(false);
    }
  };

  useEffect(() => {
    if (enquiryOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [enquiryOpen]);

  // Save button click handler
  const handleSaveClick = () => {
    if (!isLoggedIn) {
      // Redirect to login, with state to return after login
      navigate('/login', { state: { from: location } });
      return;
    }
    if (user?.user_id) {
      onToggleSave(user.user_id, !property.is_saved);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Sticky Header (always at the top) */}
      {!hideHeader && (
        <div className="sticky top-0 z-30 bg-white flex items-center justify-between px-2 py-2 border-b border-gray-100">
          <button className="p-2 bg-white bg-opacity-80 rounded-full" onClick={handleBackClick}><img src={backBtn} alt="Back" /></button>
          <div className="flex items-center gap-2">
            <CustomShareButton
              title={`${property.name} - ${property.selling_price ? `$${property.selling_price.toLocaleString()}` : 'Contact for price'}`}
              text={`Check out this ${property.property_type?.name || 'property'} at ${property.address || 'this location'}. ${property.selling_price ? `Priced at $${property.selling_price.toLocaleString()}` : 'Contact for pricing'}`}
            />
            {!isPropertyAddUpdateFlow && (
              <button className="p-2 bg-white bg-opacity-80 rounded-full" onClick={handleSaveClick}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="16" fill="white"/>
                  <path d="M16 21.3334C19 19.232 22 16.8906 22 13.7806C22.0011 13.3719 21.9243 12.967 21.7739 12.5891C21.6236 12.2113 21.4026 11.868 21.1238 11.5789C20.845 11.2899 20.5139 11.0609 20.1494 10.905C19.7849 10.7491 19.3943 10.6695 19 10.6707C18.2286 10.6707 17.4657 10.9728 16.8786 11.5814L16 12.4922L15.1214 11.5814C14.8434 11.2916 14.5129 11.0615 14.1488 10.9045C13.7847 10.7476 13.3943 10.6667 13 10.6667C12.6057 10.6667 12.2153 10.7476 11.8512 10.9045C11.4871 11.0615 11.1566 11.2916 10.8786 11.5814C10.5996 11.87 10.3784 12.2128 10.2276 12.5902C10.0769 12.9676 9.99951 13.3721 10 13.7806C10 16.8906 13 19.232 16 21.3334Z"
                    stroke="#0A0A0A" stroke-width="1.5" fill={property.is_saved ? 'black' : 'none'} />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      {/* Image and Overlayed Buttons */}
      <div className="relative mb-4 px-4 pt-2">
        <img
          src={property.property_photos?.[0]?.url || property.mainphoto_url || ''}
          alt="Main"
          className="rounded-xl w-full h-[290px] object-cover cursor-pointer"
          onClick={() => { if (isMobile) { setGalleryOpen(true); setGalleryMode('grid'); setGalleryMediaType('photos'); } else { setGalleryOpen(true); } }}
        />
        {/* Overlayed Buttons */}
        <div className="absolute bottom-4 left-0 w-full flex justify-center items-center space-x-2 z-10 px-2">
          <button
            className="custom-vtour-gradient-btn flex items-center gap-1 text-white px-3 h-10 rounded-lg shadow text-sm"
          >
            <img src={vTourBtn} alt="V Tour" className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{t('property.details.virtualTour' as TranslationKeys)}</span>
          </button>
          {property.property_videos && property.property_videos.length > 0 && (
            <button
              style={{ background: '#FFFFFF99' }}
              className="flex items-center gap-1 text-gray-700 px-3 h-10 rounded-lg shadow border border-gray-200 text-sm font-semibold"
              onClick={() => { if (isMobile) { setGalleryOpen(true); setGalleryMode('grid'); setGalleryMediaType('videos'); } }}
            >
              <img src={playBtn} alt="Video" className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{t('property.details.video' as TranslationKeys)}</span>
            </button>
          )}
          {property.property_floorplans && property.property_floorplans.length > 0 && (
            <button
              style={{ background: '#FFFFFF99' }}
              className="flex items-center gap-1 text-gray-700 px-3 h-10 rounded-lg shadow border border-gray-200 text-sm font-semibold"
              onClick={() => { if (isMobile) { setGalleryOpen(true); setGalleryMode('grid'); setGalleryMediaType('floorplans'); } }}
            >
              <img src={planHeader} alt="Floor plan" className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{t('property.details.floorPlan' as TranslationKeys)}</span>
            </button>
          )}
        </div>
        {/* Mobile gallery modal logic */}
        {isMobile && galleryOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header (reuse actual header) */}
            <div className="sticky top-0 z-30 bg-white flex items-center justify-between px-2 py-2 border-b border-gray-100">
              <button className="p-2 bg-white bg-opacity-80 rounded-full" onClick={() => setGalleryOpen(false)}><img src={backBtn} alt="Back" /></button>
              <div className="flex items-center gap-2">
                <CustomShareButton
                  title={`${property.name} - ${property.selling_price ? `$${property.selling_price.toLocaleString()}` : 'Contact for price'}`}
                  text={`Check out this ${property.property_type?.name || 'property'} at ${property.address || 'this location'}. ${property.selling_price ? `Priced at $${property.selling_price.toLocaleString()}` : 'Contact for pricing'}`}
                />
                {!isPropertyAddUpdateFlow && (
                  <button className="p-2 bg-white bg-opacity-80 rounded-full" onClick={handleSaveClick}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="32" height="32" rx="16" fill="white"/>
                      <path d="M16 21.3334C19 19.232 22 16.8906 22 13.7806C22.0011 13.3719 21.9243 12.967 21.7739 12.5891C21.6236 12.2113 21.4026 11.868 21.1238 11.5789C20.845 11.2899 20.5139 11.0609 20.1494 10.905C19.7849 10.7491 19.3943 10.6695 19 10.6707C18.2286 10.6707 17.4657 10.9728 16.8786 11.5814L16 12.4922L15.1214 11.5814C14.8434 11.2916 14.5129 11.0615 14.1488 10.9045C13.7847 10.7476 13.3943 10.6667 13 10.6667C12.6057 10.6667 12.2153 10.7476 11.8512 10.9045C11.4871 11.0615 11.1566 11.2916 10.8786 11.5814C10.5996 11.87 10.3784 12.2128 10.2276 12.5902C10.0769 12.9676 9.99951 13.3721 10 13.7806C10 16.8906 13 19.232 16 21.3334Z"
                        stroke="#0A0A0A" stroke-width="1.5" fill={property.is_saved ? 'black' : 'none'} />
                    </svg>
                  </button>
                )}
                <ModalCloseButton
                  onClick={() => setGalleryOpen(false)}
                  ariaLabel="Close gallery"
                  className="ml-1"
                />
              </div>
            </div>
            {/* Gallery content */}
            {galleryMode === 'grid' ? (
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                {/* Dynamic grid layout for videos */}
                {galleryMediaType === 'videos' ? (
                  images.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-base font-semibold">No videos available</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((img, idx) => (
                        <button key={img.url + idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden" onClick={() => { setGalleryMode('fullscreen'); setCurrentIndex(idx); }}>
                          <img src={img.caption || videoThumbFallback} alt={`Video ${idx + 1}`} className="object-cover w-full h-full" loading="lazy" />
                          {/* Play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.45)" />
                              <polygon points="20,16 34,24 20,32" fill="#fff" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  images.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-base font-semibold">
                      {galleryMediaType === 'photos' ? 'No images available' : 'No floorplans available'}
                    </div>
                  ) : (
                    <>
                      {/* Main image large */}
                      <button onClick={() => { setGalleryMode('fullscreen'); setCurrentIndex(0); }} className="w-full mb-2">
                        <img src={images[0].url} className="w-full h-48 object-cover rounded-xl" loading="lazy" />
                      </button>
                      {/* 2x2 grid for the rest */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-2 gap-2">
                          {images.slice(1).map((img, idx) => (
                            <button key={img.url + (idx + 1)} onClick={() => { setGalleryMode('fullscreen'); setCurrentIndex(idx + 1); }}>
                              <img src={img.url} className="w-full h-32 object-cover rounded-xl" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-black relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {galleryMediaType === 'videos' ? (
                  <video
                    src={images[currentIndex].url}
                    controls
                    autoPlay
                    className="max-h-[60vh] max-w-full rounded-xl bg-black mx-auto"
                    style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
                  />
                ) : (
                  <img src={images[currentIndex].url} alt={`Photo ${currentIndex + 1}`} className="max-h-[60vh] max-w-full rounded-xl object-contain bg-white mx-auto" loading="lazy" />
                )}
                {/* Index at top */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-base font-semibold bg-black/60 rounded-full px-4 py-1">
                  {currentIndex + 1} / {images.length}
                </div>
                {/* Prev/Next arrows removed as per request */}
                {/* Back to grid */}
                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full shadow" onClick={() => setGalleryMode('grid')}>Back to grid</button>
              </div>
            )}
            {/* Footer (reuse actual footer) */}
            <div className="sticky bottom-0 z-30 bg-white flex items-center justify-between px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {property.agent && property.agent.profile_photo_url ? (
                    <img src={property.agent.profile_photo_url} alt="Agent" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" fill="#B0B0B0"/>
                        <rect x="4" y="16" width="16" height="6" rx="3" fill="#B0B0B0"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-green-900 text-sm truncate">{agentUsername}</span>
                  <span className="text-xs text-gray-500 block break-all whitespace-normal">Agent</span>
                  {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.mobile_number && (
                    <a href={`tel:${property.agent.id.mobile_number}`} className="text-xs text-gray-500 block">{property.agent.id.mobile_number}</a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2"
                  style={{
                    borderRadius: '10px',
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A',
                  }}
                  onClick={() => setEnquiryOpen(true)}
                >
                  <img src={pdPhone} alt="Call" />
                </button>
                <button
                  style={{
                    borderRadius: '10px',
                    border: '1px solid var(--Primary-Green, #004236)',
                    color: 'var(--Primary-Green, #004236)',
                    background: '#fff',
                    flexShrink: 0
                  }}
                  className="px-3 py-2 rounded-lg flex items-center gap-1"
                >
                  <img src={vTourBtn} alt="Virtual Tour" className="w-5 h-5" />
                  {t('property.details.virtualTour' as TranslationKeys)}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Desktop gallery modal */}
        {!isMobile && (
          <ImageGalleryModal
            images={images}
            open={galleryOpen}
            onClose={() => setGalleryOpen(false)}
            initialIndex={0}
          />
        )}
      </div>
      {/* Days, Views, Saves Row */}
      {/* <div className="flex gap-4 justify-center text-gray-500 text-sm mb-2">
        <span><span className="font-semibold text-black">{property.daysOnSite}</span> {t('property.details.daysOn' as TranslationKeys)}</span>
        <span className="text-[#E0E0E0]">|</span>
        <span><span className="font-semibold text-black">{property.views}</span> {t('property.details.views' as TranslationKeys)}</span>
        <span className="text-[#E0E0E0]">|</span>
        <span><span className="font-semibold text-black">{property.saves}</span> {t('property.details.saves' as TranslationKeys)}</span>
      </div> */}
      {/* Title, Location, Price */}
      <div className="mb-2 ml-3">
        <h1 className="property-title-gradient mb-1 text-left">{property.name ?? '--'}</h1>
        <div className="text-gray-700 text-sm mb-2" style={{ fontWeight: 550 }}>{[property.address, property.city, property.state, property.country].filter(Boolean).join(', ')}</div>
        <div className="property-price-gradient text-left">$ {property.selling_price?.toLocaleString() ?? '--'}</div>
      </div>
      {/* 2x2 Info Cards Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 px-2">
        {/* Bedroom(s) */}
        <div className="bg-[var(--light-green-1,#DFFFF8)] rounded-2xl p-4 flex items-center gap-3">
          <img src={pdBed} alt="Bedroom(s)" className="w-8 h-8" style={{ color: '#BFA15A' }} />
          <div>
            <div className="uppercase text-xs text-gray-500 font-semibold mb-1">{t('common.beds' as TranslationKeys)}</div>
            <div className="text-sm font-bold text-black leading-tight">{property.bedrooms ?? '--'} {t('common.beds' as TranslationKeys)}</div>
          </div>
        </div>
        {/* Interior */}
        <div className="bg-[var(--light-green-1,#DFFFF8)] rounded-2xl p-4 flex items-center gap-3">
          <img src={pdInterior} alt="Interior" className="w-8 h-8" style={{ color: '#BFA15A' }} />
          <div>
            <div className="uppercase text-xs text-gray-500 font-semibold mb-1">{t('property.details.interior' as TranslationKeys)}</div>
            <div className="text-sm font-bold text-black leading-tight">{property.total_sqft?.toLocaleString() ?? '--'} {t('common.sqft' as TranslationKeys)}</div>
          </div>
        </div>
        {/* Baths */}
        <div className="bg-[var(--light-green-1,#DFFFF8)] rounded-2xl p-4 flex items-center gap-3">
          <img src={pdBath} alt="Baths" className="w-8 h-8" style={{ color: '#BFA15A' }} />
          <div>
            <div className="uppercase text-xs text-gray-500 font-semibold mb-1">{t('common.bathrooms' as TranslationKeys)}</div>
            <div className="text-sm font-bold text-black leading-tight">{property.full_bathrooms ?? '--'} {t('common.bathrooms' as TranslationKeys)}</div>
          </div>
        </div>
        {/* Exterior */}
        <div className="bg-[var(--light-green-1,#DFFFF8)] rounded-2xl p-4 flex items-center gap-3">
          <img src={pdBed} alt="Exterior" className="w-8 h-8" style={{ color: '#BFA15A' }} />
          <div>
            <div className="uppercase text-xs text-gray-500 font-semibold mb-1">{t('property.details.exterior' as TranslationKeys)}</div>
            <div className="text-sm font-bold text-black leading-tight">{property.total_sqft?.toLocaleString() ?? '--'} {t('common.sqft' as TranslationKeys)}</div>
          </div>
        </div>
      </div>
      {/* Tab Section (rendered after the above block) */}
      <div ref={tabSectionRef} className="sticky top-[56px] z-20 bg-white flex justify-between border-b border-gray-200 mb-4 mt-2">
        {TABS.map(tab => (
          <div key={tab.key} className="relative flex-1 flex flex-col items-center">
            <button
              className={
                `${activeTab === tab.key
                  ? 'font-bold text-[#007E67] bg-white'
                  : 'font-normal text-black bg-white'} text-base py-2 w-full`
              }
              onClick={() => handleTabClick(tab.key)}
            >
              {t(tab.label)}
            </button>
            {activeTab === tab.key && (
              <div className="absolute left-0 right-0 -bottom-[2px] h-[3px] rounded-full bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]" />
            )}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <>
            {/* Overview Section */}
            <div className="mb-4 px-3">
              <h2 className="text-green-900 font-bold text-left text-base mb-2" style={{ fontFamily: 'DM Serif Display', fontWeight: 550 }}>
                {t('property.details.overview' as TranslationKeys)} - {property.name ?? '--'}
              </h2>
              <div className="text-gray-700 text-sm mb-4 space-y-3 text-left">
                {property.details?.split('\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {/* Property Type */}
                <div className="bg-[var(--light-green-1,#DFFFF8)] rounded-2xl p-4 flex items-center gap-3">
                  <img src={pdBed} alt="Property Type" className="w-8 h-8" style={{ color: '#BFA15A' }} />
                  <div>
                    <div className="uppercase text-xs text-gray-500 font-semibold mb-1">{t('property.filters.propertyType' as TranslationKeys)}</div>
                    <div className="text-lg font-bold text-black leading-tight">{property.property_type?.name ?? '--'}</div>
                  </div>
                </div>
                {/* Status & Year Built Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Status */}
                  <div className="bg-[var(--light-green-1,#DFFFF8)] rounded-2xl p-4 flex items-center gap-3">
                    <img src={userIcon} alt="Status" className="w-8 h-8" style={{ color: '#BFA15A' }} />
                    <div>
                      <div className="uppercase text-xs text-gray-500 font-semibold mb-1">{t('property.details.status')}</div>
                      <div className="text-lg font-bold text-black leading-tight">{property.property_status ?? '--'}</div>
                    </div>
                  </div>
                  {/* Year Built */}
                  <div className="bg-[var(--light-green-1,#DFFFF8)] rounded-2xl p-4 flex items-center gap-3">
                    <img src={planSuccess} alt="Year Built" className="w-8 h-8" style={{ color: '#BFA15A' }} />
                    <div>
                      <div className="uppercase text-xs text-gray-500 font-semibold mb-1">{t('property.filters.yearBuilt' as TranslationKeys)}</div>
                      <div className="text-lg font-bold text-black leading-tight">{property.year_built ?? '--'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === 'location' && (
          <div className="mb-4 px-4 pt-4 pb-2">
            <h2 className="text-lg font-bold mb-2">{t('property.details.location' as TranslationKeys)}</h2>
            {/* Map section */}
            {hasValidCoordinates ? (
              <div className="mb-4">
                <div className="mx-2">
                  <GoogleMap markers={[{
                    position: { lat: latitude as number, lng: longitude as number },
                    label: property.name ?? '--',
                    id: property.property_id,
                    title: property.name ?? '--',
                    location: [property.address, property.city, property.state, property.country].filter(Boolean).join(', ') || '--',
                    bedrooms: property.bedrooms ?? '--',
                    bathrooms: property.full_bathrooms ?? '--',
                    sqft: property.total_sqft ?? '--',
                    price: property.selling_price ?? '--',
                    image: property.mainphoto_url || '',
                    description: property.details || '--',
                  }]} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-[220px] text-gray-400">Map not available</div>
            )}
            <div className="flex gap-4 mt-2">
              <button
                style={{
                  border: '1px solid var(--Primary-Green, #004236)',
                  borderRadius: '10px',
                  background: '#fff',
                  color: 'var(--Primary-Green, #004236)'
                }}
                className="flex-1 flex items-center justify-center gap-3 py-3 font-bold text-[var(--Primary-Green,#004236)] text-base shadow-none"
              >
                <img src={pdMap} alt="Open Map" className="w-7 h-7" />
                {t('property.details.openMap' as TranslationKeys)}
              </button>
              <ShareButton
                variant="original"
                size="large"
                title={`${property.name} - ${property.selling_price ? `$${property.selling_price.toLocaleString()}` : 'Contact for price'}`}
                text={`Check out this ${property.property_type?.name || 'property'} at ${property.address || 'this location'}. ${property.selling_price ? `Priced at $${property.selling_price.toLocaleString()}` : 'Contact for pricing'}`}
                className="flex-1"
              />
            </div>
          </div>
        )}
        {activeTab === 'details' && (
          <div className="mb-4 px-3">
            {/* Room Images */}
            {property.building_rooms && property.building_rooms.length > 0 && (
              <div className="flex gap-4 overflow-x-auto mb-6">
                {property.building_rooms.map((room: any, idx: number) => (
                  <div key={room.id || idx} className="flex flex-col items-center min-w-[90px]">
                    <img 
                      src={`https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80&${idx}`} 
                      alt={room.name || room.value} 
                      className="w-20 h-20 rounded-xl object-cover mb-1" 
                      loading="lazy" 
                    />
                    <span className="text-xs text-black mt-1">{room.name || room.value}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Interior Section */}
            <div className="mb-6">
              <div className="font-bold text-lg text-black mb-2">Interior</div>
              <div className="uppercase text-xs text-gray-500 mb-1">Basement</div>
              <div className="text-base text-black mb-3">
                {property.basement_types?.map((f: any) => f?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Floor Coverings</div>
              <div className="text-base text-black mb-3">
                {property.floor_coverings?.map(f => f?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Appliances</div>
              <div className="text-base text-black mb-3">{property.appliance_types?.map(a => a?.name || '').filter(Boolean).join(', ') || '--'}</div>
              <div className="border-b border-gray-200 mb-3" />
            </div>
            {/* Additional Features Section */}
            <div className="mb-6">
              <div className="font-bold text-lg text-black mb-2">Additional Features</div>
              <div className="uppercase text-xs text-gray-500 mb-1">Indoor Features</div>
              <div className="text-base text-black mb-3">
                {property.indoor_features?.map(f => f?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Outdoor Amenities</div>
              <div className="text-base text-black mb-3">
                {property.outdoor_amenities?.map(f => f?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Views</div>
              <div className="text-base text-black mb-3">
                {property.view_types?.map(v => v?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Community Features</div>
              <div className="text-base text-black mb-3">{property.community_types?.map(c => c?.name || '').filter(Boolean).join(', ') || '--'}</div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Parking Lot</div>
              <div className="text-base text-black mb-3">{property.parking_spaces ?? '--'}</div>
              <div className="border-b border-gray-200 mb-3" />
            </div>
            {/* Building Section */}
            <div className="mb-6">
              <div className="font-bold text-lg text-black mb-2">Building</div>
              <div className="uppercase text-xs text-gray-500 mb-1">Year Built</div>
              <div className="text-base text-black mb-3">{property.year_built ?? '--'}</div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Style</div>
              <div className="text-base text-black mb-3">
                {property.architectural_styles?.map(f => f?.name || '').filter(Boolean).join(', ') || '--'}
              </div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Total Sq. Ft.</div>
              <div className="text-base text-black mb-3">{property.total_sqft?.toLocaleString() ?? '--'}</div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Lot Size</div>
              <div className="text-base text-black mb-3">{property.lot_size ?? '--'} {property.lot_size_uom ?? '--'}</div>
              <div className="border-b border-gray-200 mb-3" />
            </div>
            {/* Listing Type Section */}
            <div className="mb-6">
              <div className="font-bold text-lg text-black mb-2">Listing Type</div>
              <div className="uppercase text-xs text-gray-500 mb-1">Property ID</div>
              <div className="text-base text-black mb-3">
                {property.property_id ?? '--'}  Unit: {property.unit_number ? property.unit_number : '--'}
              </div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Property Type</div>
              <div className="text-base text-black mb-3">{property.property_type?.name ?? '--'}</div>
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Marketed By</div>
              <div className="text-base text-black mb-3">Agent : {agentUsername}</div>
              {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.email && <span className="text-xs text-gray-500 block">{property.agent.id.email}</span>}
              {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.mobile_number && (
                <a href={`tel:${property.agent.id.mobile_number}`} className="text-xs text-gray-500 block">
                  {property.agent.id.mobile_number}
                </a>
              )}
              {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.mls_agent_id && <span className="text-xs text-gray-500 block">MLS ID: {property.agent.id.mls_agent_id}</span>}
              {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.service_areas && property.agent.id.service_areas.length > 0 && (
                <span className="text-xs text-gray-500 block">Areas: {property.agent.id.service_areas.join(', ')}</span>
              )}
              <div className="border-b border-gray-200 mb-3" />
              <div className="uppercase text-xs text-gray-500 mb-1">Status</div>
              <div className="text-base text-black mb-3">Available</div>
              <div className="border-b border-gray-200 mb-3" />
            </div>
            {/* Floor Plan Section */}
            <div className="mb-6">
              <div className="font-bold text-lg text-black mb-2">Floor Plan</div>
              {property.property_floorplans && property.property_floorplans.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto">
                  {property.property_floorplans.map((plan, idx) => (
                    <img
                      key={idx}
                      src={plan.url}
                      alt={`Floor Plan ${idx + 1}`}
                      className="w-60 h-40 object-cover rounded-xl border border-gray-200"
                      style={{ minWidth: 240, maxWidth: 320 }}
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-base text-center py-4">No floor plan available</div>
              )}
              <div className="border-b border-gray-200 mb-3" />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer (Agent Card + Actions) */}
      {!hideFooter && (
        <div className="sticky bottom-0 z-30 bg-white flex items-center justify-between px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              {property.agent && property.agent.profile_photo_url ? (
                <img src={property.agent.profile_photo_url} alt="Agent" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="#B0B0B0"/>
                    <rect x="4" y="16" width="16" height="6" rx="3" fill="#B0B0B0"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-green-900 text-sm truncate">{agentUsername}</span>
              <span className="text-xs text-gray-500 block break-all whitespace-normal">Agent</span>
              {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.mobile_number && (
                <a href={`tel:${property.agent.id.mobile_number}`} className="text-xs text-gray-500 block">{property.agent.id.mobile_number}</a>
              )}
              {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.mls_agent_id && <span className="text-xs text-gray-500 block">MLS ID: {property.agent.id.mls_agent_id}</span>}
              {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.service_areas && property.agent.id.service_areas.length > 0 && (
                <span className="text-xs text-gray-500 block">Areas: {property.agent.id.service_areas.join(', ')}</span>
              )}
            </div>
          </div>
          {/* Right side: phone and virtual tour buttons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2"
              style={{
                borderRadius: '10px',
                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A',
              }}
              onClick={() => setEnquiryOpen(true)}
            >
              <img src={pdPhone} alt="Call" />
            </button>
            <button
              style={{
                borderRadius: '10px',
                border: '1px solid var(--Primary-Green, #004236)',
                color: 'var(--Primary-Green, #004236)',
                background: '#fff',
                flexShrink: 0
              }}
              className="px-3 py-2 rounded-lg flex items-center gap-1"
            >
              <img src={vTourBtn} alt="Virtual Tour" className="w-5 h-5" />
              {t('property.details.virtualTour' as TranslationKeys)}
            </button>
          </div>
        </div>
      )}
      {/* Enquiry Modal */}
      <BottomModal
        open={enquiryOpen}
        title=""
        onCancel={() => setEnquiryOpen(false)}
        onSubmit={handleEnquirySubmit}
        submitLabel={enquiryLoading ? 'Submitting...' : 'Submit'}
        cancelLabel=""
      >
        {/* Custom full screen modal content */}
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header with back button */}
          <div className="flex items-center px-2 py-2 border-b border-gray-100">
            <button className="p-2 bg-white bg-opacity-80 rounded-full" onClick={() => setEnquiryOpen(false)}><img src={backBtn} alt="Back" /></button>
            <span
              className="text-lg font-semibold property-title-gradient ml-2"
              style={{
                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                textAlign: 'left',
              }}
            >
              Property Enquiry
            </span>
            <div style={{ width: 40 }} />
          </div>
          {/* Property and agent info */}
          <div className="mb-2 px-4 pt-4">
            <div className="text-green-900 text-xl mb-1" style={{ fontFamily: 'DM Serif Display', fontWeight: 550 }}>{property.name ?? '--'}</div>
            <div className="text-gray-700 text-sm mb-2" style={{ fontWeight: 550 }}>{[property.address, property.city, property.state, property.country].filter(Boolean).join(', ')}</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                {property.agent && property.agent.profile_photo_url ? (
                  <img src={property.agent.profile_photo_url} alt="Agent" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="#B0B0B0"/>
                      <rect x="4" y="16" width="16" height="6" rx="3" fill="#B0B0B0"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-green-900 text-base">{agentUsername}</span>
                <span className="text-xs text-[#007E67]">Real Estate Agent</span>
                <hr className="my-2 border-gray-200" />
                {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.mobile_number && (
                  <span className="text-xs text-black">M : {property.agent.id.mobile_number}</span>
                )}
                {property.agent && property.agent.id && typeof property.agent.id === 'object' && property.agent.id.email && (
                  <span className="text-xs text-black">E : {property.agent.id.email}</span>
                )}
              </div>
            </div>
          </div>
          {/* Form */}
          <form className="flex-1 flex flex-col justify-between px-4 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }} onSubmit={e => { e.preventDefault(); handleEnquirySubmit(); }}>
            <div className="space-y-3">
              <div>
                <input
                  name="name"
                  value={enquiryForm.name}
                  onChange={handleEnquiryInput}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter your first name"
                />
                {enquiryErrors.name && <div className="text-xs text-red-500 mt-1">{enquiryErrors.name}</div>}
              </div>
              <div>
                <input
                  name="lastName"
                  value={enquiryForm.lastName}
                  onChange={handleEnquiryInput}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter your last name"
                />
                {enquiryErrors.lastName && <div className="text-xs text-red-500 mt-1">{enquiryErrors.lastName}</div>}
              </div>
              <div>
                <input
                  name="email"
                  value={enquiryForm.email}
                  onChange={handleEnquiryInput}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Email"
                  type="email"
                />
                {enquiryErrors.email && <div className="text-xs text-red-500 mt-1">{enquiryErrors.email}</div>}
              </div>
              <div>
                <input
                  name="mobile"
                  value={enquiryForm.mobile}
                  onChange={handleEnquiryInput}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter your mobile number"
                  type="tel"
                />
                {enquiryErrors.mobile && <div className="text-xs text-red-500 mt-1">{enquiryErrors.mobile}</div>}
              </div>
              <div>
                <textarea
                  name="message"
                  value={enquiryForm.message}
                  onChange={handleEnquiryInput}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Write your message"
                  rows={3}
                />
                {enquiryErrors.message && <div className="text-xs text-red-500 mt-1">{enquiryErrors.message}</div>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="agree"
                  checked={enquiryForm.agree}
                  onChange={e => {
                    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
                      setEnquiryForm(f => ({ ...f, agree: e.target.checked }));
                    }
                  }}
                  className="h-4 w-4"
                />
                <span className="text-xs">By submitting this form, you agree to our <a href="#" className="underline font-semibold">Terms of use</a> and <a href="#" className="underline font-semibold">Privacy Policy</a></span>
              </div>
              {enquiryErrors.agree && <div className="text-xs text-red-500 mt-1">{enquiryErrors.agree}</div>}
            </div>
            {/* Submit button only, green gradient */}
            <button
              type="submit"
              className="w-full mt-6 py-3 rounded-lg text-white font-semibold text-base shadow"
              style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
              disabled={enquiryLoading}
            >
              {enquiryLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </BottomModal>
    </div>
  );
};

export default MobilePropertyDetailsUI; 