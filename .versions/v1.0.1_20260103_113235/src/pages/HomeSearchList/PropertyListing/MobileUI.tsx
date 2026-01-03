import React, { useRef, useState, useEffect } from 'react';
import { useTranslations } from '../../../hooks/useTranslations';
import { mockProperties } from './mockData';
import { usePropertyFilters } from './logic/usePropertyFilters';
import { useMapMarkers } from './logic/useMapMarkers';
import ShowMapIcon from '../../../assets/images/mobile/show-map.svg';
import PropertyFilterIcon from '../../../assets/images/mobile/property-filter.svg';
import Slider from '@mui/material/Slider';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../utils/api';
import { PropertyType } from './logic/usePropertyTypePopover';
import { usePropertyListing } from './logic/usePropertyListing';
import PropertyListSkeleton from './components/PropertyListSkeleton';
import SavedIcon from '../../../assets/images/saved.svg';
import UnsavedIcon from '../../../assets/images/unsaved.svg';
import { useAuth, useAuthData } from '../../../contexts/AuthContext';
import { MobileMenu } from '../../../components/MobileMenu';
import MobileBuyerMenu from '../../../components/MobileBuyerMenu';
import MobileAgentMenu from '../../../components/MobileAgentMenu';
import { MobileBottonMenu } from '../../../components/MobileMenu';
import BuyerFooterNav from '../../../components/BuyerFooterNav';

const MIN_HEIGHT = 100; // px
const SNAP_THRESHOLD = 0.6; // 60% of max height

const HEADER_HEIGHT = 64; // px, adjust as needed for your header
const NAV_HEIGHT = 64; // px, adjust as needed for your nav bar (updated to match MobileBottonMenu height)

// Google Maps component (copied from DesktopUI, with navigation on marker click)
const GoogleMap: React.FC<{ markers: any[]; navigate: (url: string) => void }> = ({ markers, navigate }) => {
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
        center: { lat: 18.5601, lng: -68.3725 },
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
            <div id="marker-popup-${markerData.id}" style="cursor:pointer; padding: 0; margin: 0; max-width: 320px; min-width: 220px;">
              <div style="padding: 12px 10px 10px 10px; background: #fff; border-radius: 12px;">
                <h3 style="margin: 0 0 6px 0; color: #004236; font-weight: bold; font-size: 18px; line-height: 1.2;">${markerData.title}</h3>
                <div style="color: #666; font-size: 13px; margin-bottom: 4px;">${markerData.location}</div>
                <div style="font-size: 13px; color: #333; margin-bottom: 4px;">${markerData.bedrooms} Bed | ${markerData.bathrooms} Bathroom(s) | ${markerData.sqft ? markerData.sqft.toLocaleString() : 'N/A'} sqft</div>
                <div style="font-size: 16px; color: #007E67; font-weight: bold; margin-bottom: 6px;">$${markerData.price ? markerData.price.toLocaleString() : 'N/A'}</div>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          // Add click handler to popup after it opens
          setTimeout(() => {
            const popup = document.getElementById(`marker-popup-${markerData.id}`);
            if (popup) {
              popup.onclick = () => navigate(`/property/${markerData.id}`);
            }
          }, 0);
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
  }, [map, markers, navigate]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ background: '#fff' }}
    />
  );
};

// PropertyCard component for image lazy loading
const PropertyCard: React.FC<{ property: any; onClick: () => void; onToggleSave: (propertyId: string, isSaved: boolean) => void }> = ({ property, onClick, onToggleSave }) => {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  return (
    <div className="bg-white rounded-xl shadow min-w-0 relative" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Heart icon at top right */}
      <button
        className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1 shadow"
        onClick={e => { e.stopPropagation(); onToggleSave(property.id, !property.isSaved); }}
      >
        <img
          src={property.isSaved ? SavedIcon : UnsavedIcon}
          alt={property.isSaved ? 'Saved' : 'Save'}
          className="w-6 h-6"
        />
      </button>
      <div className="relative w-full h-32 md:h-40">
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="w-8 h-8 border-4 border-t-4 border-t-[#007E67] border-gray-300 rounded-full animate-spin" />
          </div>
        )}
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-32 object-cover rounded-t-xl md:h-40"
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <div className="font-semibold text-sm md:text-base text-teal-700 line-clamp-2">{property.title}</div>
        <div className="text-xs text-gray-500 mb-1">{property.location}</div>
        <div className="flex items-center text-xs text-gray-600 mb-2 flex-wrap">
          <span>{property.bedrooms} Bed</span>
          <span className="mx-1">|</span>
          <span>{property.bathrooms} Bathroom(s)</span>
          <span className="mx-1">|</span>
          <span>{property.sqft ? property.sqft.toLocaleString() : 'N/A'} sqft</span>
        </div>
        <div className="font-bold text-base md:text-lg text-gray-900">${property.price ? property.price.toLocaleString() : 'N/A'}</div>
      </div>
    </div>
  );
};

const MobileUI: React.FC = () => {
  const { t } = useTranslations();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || 'Punta Cana';
  const {
    // Data
    properties, loading, error, page, setPage, hasMore, totalCount,
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
    // Master Data
    masterData,
    // API
    fetchProperties,
    // Helpers
    resetAllFilters,
    loadingMore,
  } = usePropertyListing({ initialSearch });
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const userData = useAuthData();
  const debounceTimers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const isAgent = userData?.user?.user_type === 'agent';
  const isBuyer = userData?.user?.user_type === 'buyer';

  // Dynamically track max height for the bottom sheet
  const [maxHeight, setMaxHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 600
  );

  // The card should stop just below the header
  const CARD_TOP = HEADER_HEIGHT;
  const CARD_MAX_HEIGHT = maxHeight - HEADER_HEIGHT;
  const INIT_HEIGHT = maxHeight * 0.4;

  // Bottom sheet state
  const [sheetHeight, setSheetHeight] = useState(INIT_HEIGHT);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(INIT_HEIGHT);

  // Calculate map height so it fills from below header to top of bottom card
  const mapHeight = sheetHeight > 0 ? maxHeight - sheetHeight - HEADER_HEIGHT : maxHeight - HEADER_HEIGHT;

  // Show FAB whenever card is fully expanded
  const showFab = sheetHeight === CARD_MAX_HEIGHT;

  useEffect(() => {
    const handleResize = () => setMaxHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag handlers
  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setDragging(true);
    startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startHeight.current = sheetHeight;
    document.body.style.userSelect = 'none';
  };
  const onDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = startY.current - clientY;
    let newHeight = startHeight.current + delta;
    newHeight = Math.max(MIN_HEIGHT, Math.min(CARD_MAX_HEIGHT, newHeight));
    setSheetHeight(newHeight);
  };
  const onDragEnd = () => {
    setDragging(false);
    document.body.style.userSelect = '';
    // If the card is at or above 50% of max height, snap to top
    if (sheetHeight >= CARD_MAX_HEIGHT * 0.5) {
      setSheetHeight(CARD_MAX_HEIGHT);
    } else {
      // Stay at the current height (no snap)
    }
  };

  // FAB click handler: animate card down
  const onFabClick = () => {
    setSheetHeight(INIT_HEIGHT);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: TouchEvent | MouseEvent) => onDragMove(e as any);
    const up = () => onDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [dragging]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterAnim, setFilterAnim] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');

  // Animate filter overlay open/close
  useEffect(() => {
    if (isFilterOpen) {
      setFilterAnim('opening');
      const timer = setTimeout(() => setFilterAnim('open'), 10);
      return () => clearTimeout(timer);
    } else if (filterAnim === 'open') {
      setFilterAnim('closing');
      const timer = setTimeout(() => setFilterAnim('closed'), 300);
      return () => clearTimeout(timer);
    }
  }, [isFilterOpen]);

  // Dummy icons for property type (replace with your SVGs as needed)
  const propertyTypeIcons: Record<string, string> = {
    House: '🏠',
    Apartment: '🏢',
    'Bed & Breakfast': '🛏️',
    Villas: '🏡',
  };
  const allPropertyTypes = ['House', 'Apartment', 'Bed & Breakfast', 'Villas'];
  const allListingTypes = ['Owner Posted', 'Agent listed', 'New Construction', 'Foreclosures', 'Auctions'];
  const allPropertyStatus = ['Coming soon', 'Accepting backup offers', 'Under construction', 'Under contract'];
  const allAmenities = ['Must have AC', 'Swimming pool', 'Water front', 'Lawn'];
  const allLifestyle = ['City view', 'Mountain view', 'Park', 'Water'];

  // Filter state for UI
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [beds, setBeds] = useState('Any');
  const [baths, setBaths] = useState('Any');
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [listingType, setListingType] = useState<string[]>([]);
  const [showMoreListing, setShowMoreListing] = useState(false);
  const [showMoreStatus, setShowMoreStatus] = useState(false);
  const [showMoreLifestyle, setShowMoreLifestyle] = useState(false);

  // Add a function to reset all filters
  const resetFilters = () => {
    setPriceRange([0, 10000000]);
    setBeds('Any');
    setBaths('Any');
    setPropertyType([]);
    setListingType([]);
    setPropertyStatus([]);
    setParkingSlots([0, 5]);
    setMaxHoa('');
    setTotalSqft([0, 0]);
    setLotSqft([0, 0]);
    setSelectedIndoor([]);
    setSelectedOutdoor([]);
    setSelectedCommunity([]);
    setSelectedLifestyles([]);
    setSortOrder('default');
    setSelectedAppliances([]);
    setShowMoreListing(false);
    setShowMoreStatus(false);
    setShowMoreLifestyle(false);
  };

  const propertyListRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(page);
  useEffect(() => { pageRef.current = page; }, [page]);
  const loadingMoreRef = useRef(false);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);

  // Infinite scroll handler
  useEffect(() => {
    const el = propertyListRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      if (
        scrollPercentage > 0.7 &&
        hasMore &&
        !loading &&
        !loadingMoreRef.current
      ) {
        const nextPage = pageRef.current + 1;
        setPage(nextPage);
        fetchProperties(searchChip, nextPage, true);
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, searchChip, fetchProperties, setPage, loadingMore]);

  // Fetch properties on mount and when searchChip changes (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      if (searchChip) {
        fetchProperties(searchChip, 1, false);
      }
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchChip]);

  // Add a function to sync local filter state to usePropertyListing state and fetch properties
  const [pendingFilterApply, setPendingFilterApply] = useState(false);

  const applyFiltersAndFetch = () => {
    // Price range
    if (priceRangePopover && priceRangePopover.setRange) {
      const [min, max] = priceRange;
      priceRangePopover.setRange([min, max]);
    }
    // Bedroom(s) & Baths
    if (bedsBathsPopover && bedsBathsPopover.setBeds && bedsBathsPopover.setBaths) {
      bedsBathsPopover.setBeds(beds === 'Any' ? [0, 5] : [Number(beds), Number(beds)]);
      bedsBathsPopover.setBaths(baths === 'Any' ? [0, 5] : [Number(baths), Number(baths)]);
    }
    // Property type
    if (propertyTypePopover && propertyTypePopover.setChecked) {
      propertyTypePopover.setChecked(propertyType);
    }
    // Listing types (use local state)
    setListingTypes(listingType);
    // Property status (use local state)
    setPropertyStatus(propertyStatus);
    // Parking slots
    setParkingSlots(parkingSlots);
    // Max HOA
    setMaxHoa(maxHoa);
    // Sqft
    setTotalSqft(totalSqft);
    setLotSqft(lotSqft);
    // Amenities
    setSelectedAppliances(selectedAppliances);
    setSelectedIndoor(selectedIndoor);
    setSelectedOutdoor(selectedOutdoor);
    setSelectedCommunity(selectedCommunity);
    // Lifestyle
    setSelectedLifestyles(selectedLifestyles);
    // Sort order (if needed)
    setSortOrder(sortOrder);
    // Set pending flag and close overlay
    setPendingFilterApply(true);
    setIsFilterOpen(false);
  };

  // Watch for filter state changes and pending flag, then fetch
  useEffect(() => {
    if (pendingFilterApply) {
      fetchProperties(searchChip, 1, false);
      setPendingFilterApply(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRangePopover.range, bedsBathsPopover.beds, bedsBathsPopover.baths, propertyTypePopover.checked, propertyStatus, listingTypes, parkingSlots, totalSqft, lotSqft, maxHoa, selectedAppliances, selectedIndoor, selectedOutdoor, selectedCommunity, selectedLifestyles, sortOrder]);

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

  const [localProperties, setLocalProperties] = useState<any[]>([]);
  useEffect(() => {
    setLocalProperties(prev => {
      const prevMap = new Map(prev.map(p => [p.id, p]));
      return properties.map(p => {
        const prevProp = prevMap.get(p.id);
        return prevProp ? { ...p, isSaved: prevProp.isSaved } : p;
      });
    });
  }, [properties]);

  return (
    <div>
      {/* Sticky Header at the very top */}
      <div
        className="fixed top-0 left-0 right-0 z-30 flex items-center px-2 py-2 md:px-3 md:py-3"
        style={{ height: HEADER_HEIGHT, background: 'linear-gradient(90deg, #06605B 0%, #0B8B7D 100%)' }}
      >
        {/* Menu icon */}
        <button className="mr-2" onClick={() => setMenuOpen(true)}>
          <svg width="28" height="28" fill="none" viewBox="0 0 28 28"><rect y="6" width="28" height="2" rx="1" fill="#fff"/><rect y="13" width="28" height="2" rx="1" fill="#fff"/><rect y="20" width="20" height="2" rx="1" fill="#fff"/></svg>
        </button>
        {/* Search bar */}
        <div className="flex items-center flex-1 bg-white rounded-xl px-2 py-1 shadow md:px-3 md:py-2 min-h-[36px] max-h-[44px]">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="mr-2"><circle cx="9" cy="9" r="7" stroke="#06605B" strokeWidth="2"/><path d="M15 15L18 18" stroke="#06605B" strokeWidth="2" strokeLinecap="round"/></svg>
          <input
            className="flex-1 bg-transparent outline-none text-sm md:text-base lg:text-lg text-[#06605B] placeholder:text-[#06605B]"
            placeholder="Enter Location"
            style={{ minWidth: 0 }}
            value={searchChip}
            onChange={e => setSearchChip(e.target.value)}
          />
          <button className="ml-2" onClick={() => setSearchChip('')}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#BDBDBD"/><path d="M8 8L16 16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M16 8L8 16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        {/* Filter icon - ensure this is NOT inside a <form>, <a>, or <Link> */}
        <div>
          <button
            type="button"
            className="ml-2"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsFilterOpen(true);
            }}
          >
            <img src={PropertyFilterIcon} alt="Filter" className="w-7 h-7" />
          </button>
        </div>
      </div>
      {/* Map as background, below header */}
      <div className="fixed left-0 right-0 z-0" style={{ top: HEADER_HEIGHT, height: mapHeight, transition: 'height 0.3s cubic-bezier(.4,2,.6,1)' }}>
        {/* Loader overlay on map while loading or loadingMore */}
        {(loading || loadingMore) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <div className="w-12 h-12 border-4 border-t-4 border-t-[#007E67] border-gray-300 rounded-full animate-spin" />
          </div>
        )}
        <GoogleMap markers={useMapMarkers(properties)} navigate={navigate} />
        {/* Show More button (like desktop) */}
        {hasMore && !loading && (
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchProperties(searchChip, nextPage, true);
            }}
            style={{
              position: 'absolute',
              bottom: 16,
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
      {/* Custom Draggable Bottom Sheet */}
      <div
        className={`fixed left-0 right-0 bg-white shadow-lg z-10 flex flex-col ${sheetHeight === CARD_MAX_HEIGHT ? '' : 'rounded-t-2xl'} max-w-full`}
        style={{
          height: sheetHeight,
          top: sheetHeight === CARD_MAX_HEIGHT
            ? HEADER_HEIGHT
            : HEADER_HEIGHT + (maxHeight - sheetHeight - HEADER_HEIGHT),
          // Only set bottom if not using top
          bottom: sheetHeight === CARD_MAX_HEIGHT ? undefined : NAV_HEIGHT,
          transition: dragging ? 'none' : 'height 0.3s cubic-bezier(.4,2,.6,1), top 0.3s cubic-bezier(.4,2,.6,1)'
        }}
      >
        {/* Drag handle (only if not fully expanded) */}
        {sheetHeight !== CARD_MAX_HEIGHT && (
          <div
            className="w-10 h-2 rounded bg-gray-300 mx-auto my-2 cursor-pointer md:w-12"
            style={{ touchAction: 'none' }}
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
          />
        )}
        {/* Property count */}
        <div className="text-center text-xs text-gray-600 py-2">
          Viewing <b>{properties.length}</b> of <b>{totalCount}</b> results for <b>&quot;{searchChip}&quot;</b>
        </div>
        {/* Property cards */}
        <div className="overflow-y-auto px-1 pb-16 flex-1 md:px-2" ref={propertyListRef}>
          {/* Initial skeleton loading */}
          {loading && properties.length === 0 && <PropertyListSkeleton />}
          {/* Property list */}
          {localProperties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {localProperties.map(property => (
                <PropertyCard key={property.id} property={property} onClick={() => navigate(`/property/${property.id}`)} onToggleSave={handleToggleSave} />
              ))}
            </div>
          )}
          {/* Infinite scroll skeleton loading */}
          {loading && properties.length > 0 && <div className="mt-4"><PropertyListSkeleton /></div>}
        </div>

        {/* Floating Action Button (FAB) */}
        {showFab && (
          <button
            className="fixed left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 text-base md:text-lg font-bold text-white rounded-2xl shadow-lg"
            style={{
              bottom: NAV_HEIGHT + 12,
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              border: 'none',
            }}
            onClick={onFabClick}
          >
            <span>Map</span>
            <img src={ShowMapIcon} alt="Show Map" className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        )}
      </div>
      {/* Mobile Filter Card Overlay */}
      {(isFilterOpen || filterAnim === 'closing') && (
        <div
          className={`fixed inset-0 z-[60] bg-white flex flex-col rounded-t-3xl overflow-hidden transition-transform duration-300
            ${filterAnim === 'opening' || filterAnim === 'open' ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ willChange: 'transform' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10">
            <button type="button" onClick={() => setIsFilterOpen(false)} className="text-black text-2xl font-bold mr-2">&times;</button>
            <span className="font-bold text-lg flex-1 text-center text-black">Filters</span>
            <span className="w-8" /> {/* Spacer for symmetry */}
          </div>
          {/* Filter content */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
            {/* Price range */}
            <div>
              <div className="font-semibold mb-2">Price range</div>
              <div className="flex flex-col items-center">
                <div className="flex w-full items-center gap-2 mb-2">
                  <span className="text-xs">No Min</span>
                  <Slider
                    value={priceRange}
                    min={100}
                    max={10000000}
                    step={100}
                    onChange={(_, value) => setPriceRange(value as [number, number])}
                    sx={{
                      flex: 1,
                      color: '#007E67',
                      height: 8,
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(90deg, #004236 0%, #007E67 100%)',
                        border: 'none',
                        height: 4,
                        borderRadius: 2,
                      },
                      '& .MuiSlider-rail': {
                        background: 'linear-gradient(90deg, #004236 0%, #007E67 100%)',
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
                  <span className="text-xs">No Max</span>
                </div>
                <div className="text-xs text-center font-semibold mb-2">
                  {(() => {
                    const [min, max] = priceRange;
                    if (min === 0 && max === 10000000) return 'Any';
                    const minLabel = min === 0 ? 'No Min' : `$${min.toLocaleString()}`;
                    const maxLabel = max === 10000000 ? 'No Max' : `$${max.toLocaleString()}`;
                    return `${minLabel} - ${maxLabel}`;
                  })()}
                </div>
              </div>
            </div>
            {/* Bedroom(s) & Baths */}
            <div>
              <div className="font-semibold mb-2">Bedroom(s) & Baths</div>
              <div className="flex gap-2 mb-2">
                <span className="text-xs">Bedrooms</span>
                {["Any", 1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    className={`px-2 py-1 rounded border transition-colors duration-150 ${beds === String(val)
                      ? 'text-white border-transparent' : 'bg-white text-gray-700 border'} ${beds === String(val)
                      ? '' : 'border-gray-200'}`}
                    style={beds === String(val) ? { background: 'linear-gradient(90deg, #004236 0%, #007E67 100%)' } : {}}
                    onClick={() => setBeds(String(val))}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <span className="text-xs">Bathrooms</span>
                {["Any", 1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    className={`px-2 py-1 rounded border transition-colors duration-150 ${baths === String(val)
                      ? 'text-white border-transparent' : 'bg-white text-gray-700 border'} ${baths === String(val)
                      ? '' : 'border-gray-200'}`}
                    style={baths === String(val) ? { background: 'linear-gradient(90deg, #004236 0%, #007E67 100%)' } : {}}
                    onClick={() => setBaths(String(val))}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            {/* Property type (from API) */}
            <div>
              <div className="font-semibold mb-2">Property type</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {propertyTypes.map(type => (
                  <label key={type.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="accent-[#007E67]"
                      checked={propertyType.includes(type.id)}
                      onChange={() => setPropertyType(propertyType.includes(type.id) ? propertyType.filter(t => t !== type.id) : [...propertyType, type.id])}
                    />
                    {type.value}
                  </label>
                ))}
              </div>
            </div>
            {/* Listing Type (and Mortgage Type) (checkbox group, like desktop, 2 columns) */}
            <div>
              <div className="font-semibold mb-2">Listing Type</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {[...(masterData.listingtype || []), ...(masterData.mortgagetype || [])].map((item: any) => {
                  const value = item.id || item.value || item;
                  return (
                    <label key={value} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        className="accent-[#007E67]"
                        checked={listingType.includes(value)}
                        onChange={() => setListingType(listingType.includes(value)
                          ? listingType.filter(v => v !== value)
                          : [...listingType, value])}
                      />
                      {item.name || item.label || item.value || item}
                    </label>
                  );
                })}
              </div>
            </div>
            {/* Property Status (checkbox group, like desktop) */}
            <div>
              <div className="font-semibold mb-2">Property Status</div>
              <div className="flex flex-col gap-2 mb-2">
                {masterData.propertystatus.map((item: any) => {
                  const value = item.id || item.value || item;
                  return (
                    <label key={value} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        className="accent-[#007E67]"
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
            </div>
            {/* Parking slots */}
            <div>
              <div className="font-semibold mb-2">Parking slots</div>
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Range</span>
                  <span className="text-xs font-semibold text-gray-700">
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
                  min={0}
                  max={5}
                  step={1}
                  onChange={(_e, newValue) => {
                    if (Array.isArray(newValue)) setParkingSlots(newValue as [number, number]);
                  }}
                  sx={{
                    color: '#007E67',
                    height: 8,
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #004236 0%, #007E67 100%)',
                      border: 'none',
                      height: 4,
                      borderRadius: 2,
                    },
                    '& .MuiSlider-rail': {
                      background: 'linear-gradient(90deg, #004236 0%, #007E67 100%)',
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5+</span>
                </div>
                <label className="flex items-center gap-1 text-xs mt-2">
                  <input type="checkbox" checked={maxHoa === 'Yes'} onChange={() => setMaxHoa(maxHoa === 'Yes' ? '' : 'Yes')} />
                  Have Garage ?
                </label>
              </div>
              <hr className="my-3 border-gray-200" />
            </div>
            {/* Square feet, Lot size, Basement, Year built */}
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Area Sq.ft.', state: totalSqft, setState: setTotalSqft },
                { label: 'Lot size', state: lotSqft, setState: setLotSqft },
              ].map(({ label, state, setState }) => {
                const min = typeof state[0] === 'number' ? state[0] : Number(state[0]) || 0;
                const max = typeof state[1] === 'number' ? state[1] : Number(state[1]) || 0;
                return (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <span className="w-24">{label}</span>
                    <input type="text" className="border rounded px-2 py-1 w-20" placeholder="No min" value={min} onChange={e => setState([Number(e.target.value) || 0, max])} />
                    <span>-</span>
                    <input type="text" className="border rounded px-2 py-1 w-20" placeholder="No max" value={max} onChange={e => setState([min, Number(e.target.value) || 0])} />
                  </div>
                );
              })}
              <hr className="my-3 border-gray-200" />
            </div>
            {/* Amenities (Appliances, Indoor, Outdoor, Community) */}
            <div className="space-y-6">
              {[
                { key: 'appliancetype', label: 'Appliances', data: amenities.appliancetype, selected: selectedAppliances, setSelected: setSelectedAppliances },
                { key: 'indoorfeature', label: 'Indoor Features', data: amenities.indoorfeature, selected: selectedIndoor, setSelected: setSelectedIndoor },
                { key: 'outdooramenity', label: 'Outdoor Amenities', data: amenities.outdooramenity, selected: selectedOutdoor, setSelected: setSelectedOutdoor },
                { key: 'communitytype', label: 'Community', data: amenities.communitytype, selected: selectedCommunity, setSelected: setSelectedCommunity },
              ].map(group => (
                <div key={group.key}>
                  <div className="font-semibold mb-2">{group.label}</div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {(showMoreAmenities[group.key] ? group.data : group.data.slice(0, 7)).map((item: any) => {
                      const value = item.id || item.value || item;
                      return (
                        <label key={value} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            className="accent-[#007E67]"
                            checked={group.selected.includes(value)}
                            onChange={() => {
                              if (group.selected.includes(value)) {
                                group.setSelected(group.selected.filter((v: string) => v !== value));
                              } else {
                                group.setSelected([...group.selected, value]);
                              }
                            }}
                          />
                          {item.name || item.label || item.value || item}
                        </label>
                      );
                    })}
                  </div>
                  {group.data.length > 7 && (
                    <button
                      className="text-xs text-[#007E67] mt-1"
                      onClick={() => setShowMoreAmenities(s => ({ ...s, [group.key]: !s[group.key] }))}
                    >
                      {showMoreAmenities[group.key] ? 'Show less' : 'Show more'}
                    </button>
                  )}
                  <hr className="my-3 border-gray-200" />
                </div>
              ))}
            </div>
            {/* Lifestyle (viewtype from API, 2 columns) */}
            <div>
              <div className="font-semibold mb-2">Lifestyle</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {amenities.viewtype.map((item: any) => {
                  const value = item.id || item.value || item;
                  return (
                    <label key={value} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        className="accent-[#007E67]"
                        checked={selectedLifestyles.includes(value)}
                        onChange={() => {
                          if (selectedLifestyles.includes(value)) {
                            setSelectedLifestyles(selectedLifestyles.filter((v: string) => v !== value));
                          } else {
                            setSelectedLifestyles([...selectedLifestyles, value]);
                          }
                        }}
                      />
                      {item.name || item.label || item.value || item}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Bottom fixed bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-white shadow-lg sticky bottom-0">
            <button className="text-green-900 underline font-medium" onClick={resetFilters}>Reset all</button>
            <button
              className="bg-gradient-to-r from-[#004236] to-[#007E67] text-white font-semibold rounded-xl px-6 py-2 shadow"
              onClick={applyFiltersAndFetch}
            >
              Show homes
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Components */}
      {isLoggedIn && isAgent && (
        <MobileAgentMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
      {isLoggedIn && isBuyer && (
        <MobileBuyerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
      {!isLoggedIn && (
        <MobileMenu 
          isOpen={menuOpen} 
          onClose={() => setMenuOpen(false)} 
          isLoggedIn={isLoggedIn}
          userType={userData?.user?.user_type}
        />
      )}
      
      {/* Footer Navigation */}
      <BuyerFooterNav />
    </div>
  );
};

export default MobileUI; 