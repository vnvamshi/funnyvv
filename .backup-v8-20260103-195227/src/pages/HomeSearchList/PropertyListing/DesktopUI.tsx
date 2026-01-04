import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Slider from '@mui/material/Slider';

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}
import { useTranslations } from '../../../hooks/useTranslations';
import { mockProperties } from './mockData';
import { usePropertyFilters } from './logic/usePropertyFilters';
import { useMapMarkers } from './logic/useMapMarkers';
import { FaHeart, FaRegHeart, FaBed, FaBath, FaSearch, FaTimes } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import Header from '../../../components/Header';
import { usePriceRangePopover } from './logic/usePriceRangePopover';
import { PriceRangePopover } from './PriceRangePopover';
import { useBedsBathsPopover } from './logic/useBedsBathsPopover';
import { BedsBathsPopover } from './BedsBathsPopover';
import { usePropertyTypePopover, PropertyType } from './logic/usePropertyTypePopover';
import { PropertyTypePopover } from './PropertyTypePopover';
import Drawer from '@mui/material/Drawer';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import plusIcon from '../../../assets/images/accordion-plus.svg';
import minusIcon from '../../../assets/images/accordion-minus.svg';
import CloseIcon from '@mui/icons-material/Close';
import { useMoreFiltersDrawer } from './logic/useMoreFiltersDrawer';
import UnsavedIcon from '../../../assets/images/unsaved.svg';
import SavedIcon from '../../../assets/images/saved.svg';
import DotsIcon from '../../../assets/images/dots.svg';
import { useNavigate } from 'react-router-dom';
import { getStaticMapUrl } from '../../../utils/googleMaps';
import api from '../../../utils/api';
import PropertyListSkeleton from './components/PropertyListSkeleton';
import { usePropertyListing } from './logic/usePropertyListing';
import { useAuth } from '../../../contexts/AuthContext';

const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=Punta+Cana&zoom=11&size=600x600&maptype=roadmap&key=AIzaSyAPoZgE4lQyj4L8Nxqls3GhRSYxCKcVGQA`;

// Google Maps component
const GoogleMap: React.FC<{ markers: any[] }> = ({ markers }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<any>(null);
  const markersRef = React.useRef<any[]>([]);

  React.useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAPoZgE4lQyj4L8Nxqls3GhRSYxCKcVGQA&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (mapRef.current) {
          const newMap = new window.google.maps.Map(mapRef.current, {
            center: { lat: 18.5601, lng: -68.3725 }, // Punta Cana coordinates
            zoom: 11,
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
        center: { lat: 18.5601, lng: -68.3725 }, // Punta Cana coordinates
        zoom: 11,
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

  // Add markers when map is ready
  React.useEffect(() => {
    if (!map || !window.google) return;
    // Only update markers when the markers prop changes and map is ready
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (markers.length > 0) {
      markers.forEach((markerData, index) => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map: map,
          title: `Property ${markerData.label}`,
          icon: {
            url: `data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='11.73%' stop-color='%23004236'/><stop offset='96.61%' stop-color='%23007E67'/></linearGradient></defs><circle cx='24' cy='24' r='20' fill='url(%23g)'/></svg>`,
            scaledSize: new window.google.maps.Size(40, 40),
            labelOrigin: new window.google.maps.Point(20, 20),
            anchor: new window.google.maps.Point(20, 20)
          },
          label: {
            text: markerData.label,
            color: 'white',
            fontWeight: 'bold',
                    fontSize: '16px',
        fontFamily: 'Inter',
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <a href="/property/${markerData.id}" style="text-decoration: none; color: inherit; display: block; cursor: pointer; padding: 0; margin: 0;">
              <div style="padding: 10px; min-width: 240px; max-width: 320px;">
                <img src="${markerData.image}" alt="${markerData.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                <h3 style="margin: 0 0 5px 0; color: #004236; font-weight: bold; font-size: 18px;">${markerData.title}</h3>
                <div style="color: #666; font-size: 13px; margin-bottom: 4px;">${markerData.location}</div>
                <div style="font-size: 13px; color: #333; margin-bottom: 4px;">${markerData.bedrooms} Bed | ${markerData.bathrooms} Bathroom(s) | ${markerData.sqft ? markerData.sqft.toLocaleString() : 'N/A'} sqft</div>
                <div style="font-size: 14px; color: #007E67; font-weight: bold; margin-bottom: 6px;">$${markerData.price ? markerData.price.toLocaleString() : 'N/A'}</div>
                <div style="font-size: 12px; color: #444;">${markerData.description}</div>
              </div>
            </a>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
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
      className="w-full h-full"
      style={{ background: '#fff' }}
    />
  );
};

// Define type for lastFilters
interface LastFilters {
  price: [number, number];
  beds: [number, number];
  baths: [number, number];
  search: string;
  propertyTypes: string[];
}

// PropertyCard component for image lazy loading (desktop)
const PropertyCard: React.FC<{ property: any; onClick: () => void; onToggleSave: (propertyId: string, isSaved: boolean) => void }> = ({ property, onClick, onToggleSave }) => {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  return (
    <div
      key={property.id}
      className="bg-white rounded-2xl shadow-md border border-gray-200 relative flex flex-col overflow-hidden p-0 cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      {/* Heart and menu icons */}
      <div className="absolute top-1 right-1 z-10">
        <div className="flex items-center gap-2 bg-white/50 rounded-lg px-2 py-1 shadow-md backdrop-blur-sm">
          <button className="focus:outline-none" onClick={e => { e.stopPropagation(); onToggleSave(property.id, !property.isSaved); }}>
            <img
              src={property.isSaved ? SavedIcon : UnsavedIcon}
              alt={property.isSaved ? 'Saved' : 'Save'}
              className="w-6 h-6"
            />
          </button>
          {/* Removed the three dot (more options) icon/button */}
        </div>
      </div>
      <div className="relative w-full h-56">
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="w-10 h-10 border-4 border-t-4 border-t-[#007E67] border-gray-300 rounded-full animate-spin" />
          </div>
        )}
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-56 object-cover"
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between p-4">
        <div>
          <div
            className="bg-[linear-gradient(111.83deg,_#004236_11.73%,_#007E67_96.61%)] bg-clip-text text-transparent"
            style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 550, fontSize: 20, lineHeight: '20px', letterSpacing: '0.25px', verticalAlign: 'middle', marginBottom: 4 }}
          >
            {property.title}
          </div>
          <div className="text-xs text-gray-500 mb-2">{property.location}</div>
          <div className="flex items-center font-semibold text-xs text-black mb-1 gap-1">
            <span className="flex items-center gap-1">{property.bedrooms} Bed</span>
            <span className="h-5 border-l border-black mx-2" />
            <span className="flex items-center gap-1">{property.bathrooms} Bathroom(s)</span>
            <span className="h-5 border-l border-black mx-2" />
            <span className="flex items-center gap-1">{property.sqft ? property.sqft.toLocaleString() : 'N/A'} sqft</span>
          </div>
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 24,
            marginTop: 8,
            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          ${property.price ? property.price.toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  );
};

const DesktopUI: React.FC = () => {
  const { t } = useTranslations();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || 'Punta Cana';
  const {
    // Data
    properties, loading, page, setPage, hasMore, totalCount,
    // Filters
    priceRangePopover, bedsBathsPopover, propertyTypePopover, propertyTypes, setPropertyTypes,
    searchChip, setSearchChip,
    propertyStatus, setPropertyStatus,
    parkingSlots, setParkingSlots,
    totalSqft, setTotalSqft,
    lotSqft, setLotSqft,
    maxHoa, setMaxHoa,
    listingTypes, setListingTypes,
    selectedAppliances, setSelectedAppliances,
    selectedIndoor, setSelectedIndoor,
    selectedOutdoor, setSelectedOutdoor,
    selectedCommunity, setSelectedCommunity,
    selectedLifestyles, setSelectedLifestyles,
    sortOrder, setSortOrder,
    amenities, showMoreAmenities, setShowMoreAmenities,
    masterData,
    // API
    fetchProperties,
    // Helpers
    resetAllFilters,
    loadingMore,
  } = usePropertyListing({ initialSearch });
  const {
    moreDrawerOpen,
    handleMoreOpen,
    handleMoreClose,
    expandedAccordion,
    handleAccordionChange,
  } = useMoreFiltersDrawer();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [isBuy, setIsBuy] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const debounceTimers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});
  const [localProperties, setLocalProperties] = useState<any[]>([]);
  useEffect(() => {
    setLocalProperties(prev => {
      // Create a map of previous properties by id
      const prevMap = new Map(prev.map(p => [p.id, p]));
      // Merge: if a property exists in prev, keep its isSaved, else use new
      return properties.map(p => {
        const prevProp = prevMap.get(p.id);
        return prevProp ? { ...p, isSaved: prevProp.isSaved } : p;
      });
    });
  }, [properties]);

  // Helper to compare arrays
  const isArrayEqual = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];

  const parseHoaValue = (hoa: string) => {
    if (!hoa || hoa === 'No HOA') return undefined;
    const match = hoa.match(/\$?(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  };

  // On mount and filter change, reset page to 1 and fetch
  React.useEffect(() => {
    setPage(1);
    if (searchChip) {
      fetchProperties(searchChip, 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchChip]);

  // Use API properties instead of mockProperties
  const { filteredProperties } = usePropertyFilters(properties);
  const pagedProperties = filteredProperties.slice(0, page * 10);
  const markers = useMapMarkers(pagedProperties);

  useEffect(() => {
    api.post('/common/master/list/', { tables: ['propertytype'] })
      .then((res: any) => setPropertyTypes(res.data.propertytype || []))
      .catch(() => setPropertyTypes([]));
  }, []);

  // Remove API call from handleApply wrappers
  const handlePriceApply = () => {
    priceRangePopover.handleApply();
  };
  const handleBedsBathsApply = () => {
    bedsBathsPopover.handleApply();
  };

  // Remove API call from property type handleApply wrapper
  const handlePropertyTypeApply = () => {
    propertyTypePopover.handleApply();
  };

  // Show More handler
  const handleShowMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProperties(searchChip, nextPage, true);
  };

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Debug logging
    console.log('Scroll Debug:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollPercentage,
      hasMore,
      loadingMore,
      page
    });
    
    // Trigger load more when user scrolls to 70% of the list (more aggressive)
    if (scrollPercentage > 0.7 && hasMore && !loadingMore) {
      console.log('Triggering next page load:', page + 1);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProperties(searchChip, nextPage, true);
    }
  };

  // Add useEffect for more reliable scroll detection
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScrollEvent = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Trigger load more when user scrolls to 80% of the list
      if (scrollPercentage > 0.8 && hasMore && !loadingMore) {
        console.log('useEffect Scroll - Triggering next page load:', page + 1);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProperties(searchChip, nextPage, true);
      }
    };

    scrollContainer.addEventListener('scroll', handleScrollEvent);
    return () => scrollContainer.removeEventListener('scroll', handleScrollEvent);
  }, [hasMore, loadingMore, page, searchChip]);

  const handleToggleSave = (propertyId: string, isSaved: boolean) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setLocalProperties(prev => prev.map(p => p.id === propertyId ? { ...p, isSaved } : p));
    if (debounceTimers.current[propertyId]) {
      clearTimeout(debounceTimers.current[propertyId]);
    }
    debounceTimers.current[propertyId] = setTimeout(async () => {
      try {
        await api.post('/buyer/saved-homes/toggle/', {
          user_id: user?.user_id,
          property_id: propertyId,
          is_saved: isSaved,
        });
        // No refetch
      } catch (err) {
        // Optionally revert UI on error
        setLocalProperties(prev => prev.map(p => p.id === propertyId ? { ...p, isSaved: !isSaved } : p));
      }
    }, 400);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Sticky Top Bar below header */}
        <div
          className="fixed top-20 z-30 w-full px-10 pt-6 pb-3 flex flex-col"
          style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
        >
          <div className="flex items-center w-full justify-center gap-8 max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-2">
            {/* Search by location */}
            <div className="flex flex-col min-w-[320px] max-w-[420px] w-full relative mb-0 max-[1024px]:mb-2">
              <div className="flex items-center bg-transparent relative">
                <FaSearch className="text-white opacity-80 ml-3 mr-2" style={{ width: 20, height: 20, minWidth: 20, minHeight: 20 }} />
                {searchChip && (
                  <span className="flex items-center bg-white/30 rounded px-3 py-1 text-white font-medium text-sm mr-2 z-10 whitespace-nowrap">
                    {searchChip}
                    <button className="ml-2 text-green-900 hover:text-green-700" onClick={() => setSearchChip('')}>
                      <FaTimes size={12} />
                    </button>
                  </span>
                )}
                <input
                  className="w-full pr-24 py-2 rounded bg-transparent border-none text-white placeholder-white/70 text-base focus:outline-none"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && search.trim() && !searchChip) {
                      setSearchChip(search.trim());
                      setSearch('');
                    }
                  }}
                  placeholder={!searchChip ? String(t('home.hero.searchPlaceholder' as any)) : ''}
                  disabled={!!searchChip}
                />
              </div>
              {/* Underline only under search bar */}
              <div className="w-full h-[2px] bg-white/40 mt-1" />
            </div>
            {/* Filter Buttons */}
            <div className="flex items-center gap-3 max-[1024px]:w-full max-[1024px]:justify-start max-[1024px]:flex-wrap">
              <div className="flex border-2 border-white rounded-lg overflow-hidden">
                <button
                  className={`px-5 py-1.5 font-bold text-base transition-colors focus:outline-none ${isBuy ? 'bg-white text-green-900' : 'bg-transparent text-white'} rounded-l-lg`}
                  onClick={() => setIsBuy(true)}
                >
                  {String(t('navigation.buy' as any))}
                </button>
                <button
                  className={`px-5 py-1.5 font-bold text-base transition-colors focus:outline-none ${!isBuy ? 'bg-white text-green-900' : 'bg-transparent text-white'} rounded-r-lg`}
                  onClick={() => setIsBuy(false)}
                >
                  {String(t('navigation.rent' as any))}
                </button>
              </div>
              <button
                className="border-2 border-white text-white bg-transparent rounded-lg px-5 py-1.5 font-medium text-base"
                onClick={priceRangePopover.openPopover}
                ref={el => {
                  // For anchorEl, we need a real HTMLElement, so we use the event in openPopover
                }}
              >
                {String(t('property.filters.priceRange' as any))}
              </button>
              <PriceRangePopover
                anchorEl={priceRangePopover.anchorEl}
                open={priceRangePopover.open}
                tempRange={priceRangePopover.tempRange}
                onClose={priceRangePopover.closePopover}
                onSliderChange={priceRangePopover.handleSliderChange}
                onApply={handlePriceApply}
                onClear={priceRangePopover.handleClear}
              />
              <button
                className="border-2 border-white text-white bg-transparent rounded-lg px-5 py-1.5 font-medium text-base"
                onClick={bedsBathsPopover.openPopover}
              >
                {String(t('property.filters.bedsBath' as any))}
              </button>
              <BedsBathsPopover
                anchorEl={bedsBathsPopover.anchorEl}
                open={bedsBathsPopover.open}
                tempBeds={bedsBathsPopover.tempBeds}
                tempBaths={bedsBathsPopover.tempBaths}
                onClose={bedsBathsPopover.closePopover}
                onBedsChange={bedsBathsPopover.handleBedsChange}
                onBathsChange={bedsBathsPopover.handleBathsChange}
                onApply={handleBedsBathsApply}
                onClear={bedsBathsPopover.handleClear}
              />
              <button
                className="border-2 border-white text-white bg-transparent rounded-lg px-5 py-1.5 font-medium text-base"
                onClick={propertyTypePopover.openPopover}
              >
                {String(t('property.filters.propertyType' as any))}
              </button>
              <PropertyTypePopover
                anchorEl={propertyTypePopover.anchorEl}
                open={propertyTypePopover.open}
                tempChecked={propertyTypePopover.tempChecked}
                search={propertyTypePopover.search}
                setSearch={propertyTypePopover.setSearch}
                filteredTypes={propertyTypePopover.filteredTypes}
                onClose={propertyTypePopover.closePopover}
                onCheck={propertyTypePopover.handleCheck}
                onApply={handlePropertyTypeApply}
                onClear={propertyTypePopover.handleClear}
              />
              <button
                className="border-2 border-white text-white bg-transparent rounded-lg px-5 py-1.5 font-medium text-base"
                onClick={handleMoreOpen}
              >
                {String(t('property.filters.more' as any))}
              </button>
            </div>
          </div>
        </div>
        {/* Spacer to prevent content from being hidden under sticky header */}
        <div style={{ height: 80 }} />
        {/* Main Content: Map + List side by side */}
        <div className="flex flex-1 min-h-[calc(100vh-80px)]">
          {/* Map Section */}
          <div className="sticky top-40 h-[calc(100vh-80px)] w-1/2 min-w-[600px] max-w-[900px] bg-white flex items-start justify-center z-10 p-0 m-0">
            <div className="relative w-full h-[77vh]">
              <GoogleMap markers={markers} />
              {(loading || loadingMore) && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 30,
                }}>
                  <div className="loader" style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #007E67',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    animation: 'spin 1s linear infinite',
                  }} />
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              )}
              {hasMore && (
                <button
                  onClick={handleShowMore}
                  style={{
                    position: 'absolute',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px 32px',
                    borderRadius: 24,
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#fff',
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 20,
                  }}
                >
                  Show More
                </button>
              )}
            </div>
          </div>
          {/* Property List Section */}
          <div className="flex-1 overflow-y-auto bg-white h-[calc(100vh-80px)]" onScroll={handleScroll} ref={scrollContainerRef}>
            <div className="w-full px-10 pt-8 pb-4">
              {/* Property count and sort */}
              {loading ? (
                <div className="flex items-center justify-between mb-4 animate-pulse">
                  <div>
                    <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-8 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-lg text-gray-900">
                      Viewing <b>{pagedProperties.length}</b> of <b>{totalCount}</b> for sale in
                      <span
                        className="bg-gradient-to-r from-[#004236] to-[#007E67] bg-clip-text text-transparent font-bold mx-1"
                      >
                        &quot;{searchChip}&quot;
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{String(t('property.listing.showingAllBrokers' as any))}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">{String(t('property.listing.sort' as any))} :</span>
                    <select className="border border-gray-300 rounded-lg px-2 py-1 text-xs text-green-900 font-semibold outline-none">
                      <option>{String(t('property.listing.homesForYou' as any))}</option>
                      <option>{String(t('property.listing.priceLowToHigh' as any))}</option>
                      <option>{String(t('property.listing.priceHighToLow' as any))}</option>
                    </select>
                  </div>
                </div>
              )}
              {/* Property cards */}
              {loading ? (
                <PropertyListSkeleton />
              ) : (
                <>
                  <div className="grid grid-cols-1 max-[1024px]:grid-cols-1 min-[1025px]:grid-cols-2 gap-4 md:gap-6">
                    {localProperties.map(property => (
                      <PropertyCard key={property.id} property={property} onClick={() => navigate(`/property/${property.id}`)} onToggleSave={handleToggleSave} />
                    ))}
                  </div>
                  {/* Skeleton cards for loading more items */}
                  {loadingMore && (
                    <div className="grid grid-cols-1 max-[1024px]:grid-cols-1 min-[1025px]:grid-cols-2 gap-4 md:gap-6 mt-4">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={`skeleton-${idx}`}
                          className="bg-gray-200 rounded-2xl shadow-md border border-gray-200 relative flex flex-col overflow-hidden p-0 animate-pulse"
                          style={{ minHeight: 340 }}
                        >
                          <div className="absolute top-2 left-2 bg-gray-300 rounded px-6 py-2 w-32 h-6 z-20" />
                          <div className="w-full h-56 bg-gray-300" />
                          <div className="flex-1 flex flex-col justify-between p-4">
                            <div>
                              <div className="h-6 w-2/3 bg-gray-300 rounded mb-2" />
                              <div className="h-3 w-1/3 bg-gray-300 rounded mb-2" />
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-3 w-10 bg-gray-300 rounded" />
                                <div className="h-3 w-10 bg-gray-300 rounded" />
                                <div className="h-3 w-16 bg-gray-300 rounded" />
                              </div>
                            </div>
                            <div className="h-6 w-1/4 bg-gray-300 rounded mt-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
      <Drawer
        anchor="right"
        open={moreDrawerOpen}
        onClose={handleMoreClose}
        PaperProps={{
          sx: {
            width: 480,
            borderRadius: '12px 0 0 12px',
            p: 3,
            background: '#fff',
            boxShadow: 6,
          },
        }}
      >
        <div style={{ padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>MORE FILTERS</div>
            <IconButton onClick={handleMoreClose} size="small" sx={{ ml: 2 }}>
              <CloseIcon fontSize="medium" />
            </IconButton>
          </div>
          <Accordion expanded={expandedAccordion === 'hoa'} onChange={handleAccordionChange('hoa')} sx={{ boxShadow: 'none', borderBottom: '1px solid #eee', px: 0 }}>
            <AccordionSummary
              expandIcon={
                <img src={expandedAccordion === 'hoa' ? minusIcon : plusIcon} alt={expandedAccordion === 'hoa' ? 'Collapse' : 'Expand'} style={{ width: 24, height: 24 }} />
              }
              sx={{ minHeight: 48, px: 1 }}
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Max HOA</span>
                <span style={{ fontSize: 14, color: '#222', fontWeight: 500, marginRight: 16 }}>
                  {expandedAccordion !== 'hoa' && maxHoa}
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 1, px: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <select 
                  style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, fontWeight: 500 }}
                  value={maxHoa}
                  onChange={(e) => setMaxHoa(e.target.value)}
                >
                  <option>No HOA</option>
                  <option>Up to $100</option>
                  <option>Up to $200</option>
                  <option>Up to $300</option>
                </select>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expandedAccordion === 'listingType'} onChange={handleAccordionChange('listingType')} sx={{ boxShadow: 'none', borderBottom: '1px solid #eee', px: 0 }}>
            <AccordionSummary
              expandIcon={
                <img src={expandedAccordion === 'listingType' ? minusIcon : plusIcon} alt={expandedAccordion === 'listingType' ? 'Collapse' : 'Expand'} style={{ width: 24, height: 24 }} />
              }
              sx={{ minHeight: 48, px: 1 }}
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Listing Type</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 28, marginRight: 16 }}>
                  {expandedAccordion !== 'listingType' && (
                    <span style={{ fontSize: 14, color: '#222', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                      {listingTypes.length > 0 ? `${listingTypes.length} chosen` : 'Any'}
                    </span>
                  )}
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 1, px: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ...(masterData?.listingtype || []).map(item => ({ ...item, _key: `listing_${item.id}` })),
                  ...(masterData?.mortgagetype || []).map(item => ({ ...item, _key: `mortgage_${item.id}` }))
                ].map((item: any) => {
                  const value = item._key;
                  return (
                    <label key={value} style={{ fontWeight: 500, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        style={{ marginRight: 8, accentColor: '#007E67' }}
                        checked={listingTypes.includes(value)}
                        onChange={() => setListingTypes(listingTypes.includes(value)
                          ? listingTypes.filter(v => v !== value)
                          : [...listingTypes, value])}
                      />
                      {item.name || item.label || item.value || item}
                    </label>
                  );
                })}
              </div>
            </AccordionDetails>
          </Accordion>
          {['Property Status', 'Parking slots', 'Square feet', 'Other Amenities', 'Lifestyles'].map((label, idx) => (
            <Accordion key={label} expanded={expandedAccordion === label} onChange={handleAccordionChange(label)} sx={{ boxShadow: 'none', borderBottom: '1px solid #eee', px: 0 }}>
              <AccordionSummary
                expandIcon={
                  <img src={expandedAccordion === label ? minusIcon : plusIcon} alt={expandedAccordion === label ? 'Collapse' : 'Expand'} style={{ width: 24, height: 24 }} />
                }
                sx={{ minHeight: 48, px: 1 }}
              >
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
                    {expandedAccordion !== label && (
                      <span style={{ fontSize: 14, color: '#222', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {/* Custom summary value logic for all */}
                        {label === 'Property Status' && (propertyStatus.length > 0 ? `${propertyStatus.length} chosen` : 'Any')}
                        {label === 'Parking slots' && (() => {
                          const [min, max] = parkingSlots;
                          if (min === 0 && max === 5) return 'Any';
                          const minLabel = min === 0 ? 'No Min' : min;
                          const maxLabel = max === 5 ? 'No Max' : max;
                          return `${minLabel} - ${maxLabel}`;
                        })()}
                        {label === 'Square feet' && (() => {
                          const [totalMin, totalMax] = totalSqft;
                          const [lotMin, lotMax] = lotSqft;
                          const totalText = totalMin === 0 && totalMax === 10000 ? 'Any' : `${totalMin === 0 ? 'No Min' : totalMin} - ${totalMax === 10000 ? 'No Max' : totalMax}`;
                          const lotText = lotMin === 0 && lotMax === 50000 ? 'Any' : `${lotMin === 0 ? 'No Min' : lotMin} - ${lotMax === 50000 ? 'No Max' : lotMax}`;
                          return `${totalText} / ${lotText}`;
                        })()}
                        {label === 'Other Amenities' && (
                          selectedAppliances.length + selectedIndoor.length + selectedOutdoor.length + selectedCommunity.length > 0
                            ? `${selectedAppliances.length + selectedIndoor.length + selectedOutdoor.length + selectedCommunity.length} chosen`
                            : 'Any'
                        )}
                        {label === 'Lifestyles' && (selectedLifestyles.length > 0 ? `${selectedLifestyles.length} chosen` : 'Any')}
                        {label !== 'Property Status' && label !== 'Parking slots' && label !== 'Square feet' && label !== 'Other Amenities' && label !== 'Lifestyles' && 'Any'}
                      </span>
                    )}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 1, px: 1 }}>
                {/* Only render checkboxes for Property Status */}
                {label === 'Property Status' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(masterData?.propertystatus || []).map((item: any) => {
                      const value = item.id || item.value || item;
                      return (
                        <label key={value} style={{ fontWeight: 500, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            style={{ marginRight: 8, accentColor: '#007E67' }}
                            checked={propertyStatus.includes(value)}
                            onChange={() => setPropertyStatus(propertyStatus.includes(value)
                              ? propertyStatus.filter(v => v !== value)
                              : [...propertyStatus, value])}
                          />
                          {item.name || item.label || item.value || item}
                        </label>
                      );
                    })}
                  </div>
                )}
                {/* Render slider for Parking slots */}
                {label === 'Parking slots' && (
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>Parking slots</span>
                      <span style={{ color: '#222', fontWeight: 500 }}>
                        {(() => {
                          const [min, max] = parkingSlots;
                          if (min === 0 && max === 5) return 'Any';
                          const minLabel = min === 0 ? 'No Min' : min;
                          const maxLabel = max === 5 ? 'No Max' : max;
                          return `${minLabel} - ${maxLabel}`;
                        })()}
                      </span>
                    </div>
                    <Slider
                      value={parkingSlots}
                      onChange={(_e, newValue) => {
                        if (Array.isArray(newValue)) setParkingSlots(newValue as [number, number]);
                      }}
                      min={0}
                      max={5}
                      step={1}
                      sx={{
                        mb: 1,
                        height: 8,
                        '& .MuiSlider-track': {
                          background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                          border: 'none',
                          height: 4,
                          borderRadius: 2,
                        },
                        '& .MuiSlider-rail': {
                          background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                          opacity: 0.3,
                          height: 4,
                          borderRadius: 2,
                        },
                        '& .MuiSlider-thumb': {
                          width: 24,
                          height: 24,
                          backgroundColor: '#007E67',
                          border: '3px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          '&:focus, &:hover, &.Mui-active': {
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                          },
                        },
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ color: '#222' }}>0</span>
                      <span style={{ color: '#222' }}>5+</span>
                    </div>
                  </div>
                )}
                {/* Render sliders for Square feet */}
                {label === 'Square feet' && (
                  <div style={{ width: '100%' }}>
                    {/* Total sqft slider */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>Total sqft</span>
                        <span style={{ color: '#222', fontWeight: 500 }}>
                          {(() => {
                            const [min, max] = totalSqft;
                            if (min === 0 && max === 10000) return 'Any';
                            const minLabel = min === 0 ? 'No Min' : min;
                            const maxLabel = max === 10000 ? 'No Max' : max;
                            return `${minLabel} - ${maxLabel}`;
                          })()}
                        </span>
                      </div>
                      <Slider
                        value={totalSqft}
                        onChange={(_e, newValue) => {
                          if (Array.isArray(newValue)) setTotalSqft(newValue as [number, number]);
                        }}
                        min={0}
                        max={10000}
                        step={100}
                        sx={{
                          mb: 1,
                          height: 8,
                          '& .MuiSlider-track': {
                            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            border: 'none',
                            height: 4,
                            borderRadius: 2,
                          },
                          '& .MuiSlider-rail': {
                            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            opacity: 0.3,
                            height: 4,
                            borderRadius: 2,
                          },
                          '& .MuiSlider-thumb': {
                            width: 24,
                            height: 24,
                            backgroundColor: '#007E67',
                            border: '3px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            '&:focus, &:hover, &.Mui-active': {
                              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            },
                          },
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#222' }}>0</span>
                        <span style={{ color: '#222' }}>10000+</span>
                      </div>
                    </div>
                    
                    {/* Lot sqft slider */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>Lot sqft</span>
                        <span style={{ color: '#222', fontWeight: 500 }}>
                          {(() => {
                            const [min, max] = lotSqft;
                            if (min === 0 && max === 50000) return 'Any';
                            const minLabel = min === 0 ? 'No Min' : min;
                            const maxLabel = max === 50000 ? 'No Max' : max;
                            return `${minLabel} - ${maxLabel}`;
                          })()}
                        </span>
                      </div>
                      <Slider
                        value={lotSqft}
                        onChange={(_e, newValue) => {
                          if (Array.isArray(newValue)) setLotSqft(newValue as [number, number]);
                        }}
                        min={0}
                        max={50000}
                        step={500}
                        sx={{
                          mb: 1,
                          height: 8,
                          '& .MuiSlider-track': {
                            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            border: 'none',
                            height: 4,
                            borderRadius: 2,
                          },
                          '& .MuiSlider-rail': {
                            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            opacity: 0.3,
                            height: 4,
                            borderRadius: 2,
                          },
                          '& .MuiSlider-thumb': {
                            width: 24,
                            height: 24,
                            backgroundColor: '#007E67',
                            border: '3px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            '&:focus, &:hover, &.Mui-active': {
                              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            },
                          },
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ color: '#222' }}>0</span>
                        <span style={{ color: '#222' }}>50000+</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Render grouped checkboxes for Other Amenities */}
                {label === 'Other Amenities' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { key: 'appliancetype', label: 'Appliances', data: amenities.appliancetype, selected: selectedAppliances, setSelected: setSelectedAppliances },
                      { key: 'indoorfeature', label: 'Indoor Features', data: amenities.indoorfeature, selected: selectedIndoor, setSelected: setSelectedIndoor },
                      { key: 'outdooramenity', label: 'Outdoor Amenities', data: amenities.outdooramenity, selected: selectedOutdoor, setSelected: setSelectedOutdoor },
                      { key: 'communitytype', label: 'Community', data: amenities.communitytype, selected: selectedCommunity, setSelected: setSelectedCommunity },
                    ].map(group => (
                      <div key={group.key} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{group.label}</div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '6px 24px',
                          alignItems: 'start',
                        }}>
                          {(showMoreAmenities[group.key] ? group.data : group.data.slice(0, 7)).map((item: any) => (
                            <label key={item.id || item.value || item} style={{ fontWeight: 500, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                style={{ marginRight: 8, accentColor: '#007E67' }}
                                checked={group.selected.includes(item.id || item.value || item)}
                                onChange={() => {
                                  const value = item.id || item.value || item;
                                  if (group.selected.includes(value)) {
                                    group.setSelected(group.selected.filter((v: string) => v !== value));
                                  } else {
                                    group.setSelected([...group.selected, value]);
                                  }
                                }}
                              />
                              {item.name || item.label || item.value || item}
                            </label>
                          ))}
                        </div>
                        {group.data.length > 7 && (
                          <button
                            type="button"
                            style={{ color: '#007E67', background: 'none', border: 'none', fontWeight: 600, fontSize: 15, marginTop: 2, cursor: 'pointer', textAlign: 'left' }}
                            onClick={() => setShowMoreAmenities(s => ({ ...s, [group.key]: !s[group.key] }))}
                          >
                            {showMoreAmenities[group.key] ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Render lifestyles checkboxes */}
                {label === 'Lifestyles' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px 24px',
                    alignItems: 'start',
                  }}>
                    {amenities.viewtype.map((item: any) => (
                      <label key={item.id || item.value || item} style={{ fontWeight: 500, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          style={{ marginRight: 8, accentColor: '#007E67' }}
                          checked={selectedLifestyles.includes(item.id || item.value || item)}
                          onChange={() => {
                            const value = item.id || item.value || item;
                            if (selectedLifestyles.includes(value)) {
                              setSelectedLifestyles(selectedLifestyles.filter((v: string) => v !== value));
                            } else {
                              setSelectedLifestyles([...selectedLifestyles, value]);
                            }
                          }}
                        />
                        {item.name || item.label || item.value || item}
                      </label>
                    ))}
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 32, gap: 16 }}>
            <Button onClick={resetAllFilters} sx={{ color: '#007E67', textTransform: 'none' }}>Reset all</Button>
            <Button variant="outlined" sx={{ color: '#007E67', borderColor: '#007E67', textTransform: 'none', minWidth: 80 }}
              onClick={() => {
                setPage(1);
                fetchProperties(searchChip, 1, false);
                handleMoreClose();
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default DesktopUI; 