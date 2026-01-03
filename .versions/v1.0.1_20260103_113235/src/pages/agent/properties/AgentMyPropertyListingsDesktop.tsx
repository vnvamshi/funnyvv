import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsModal from '../../settings/SettingsModal';
import EditIcon from '../../../assets/images/edit-icon.svg'; // Placeholder, replace with actual edit icon
import ShareButton from '../../../components/ShareButton';
import Slider from '@mui/material/Slider';
import Popover from '@mui/material/Popover';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import AgentPropertyListSkeleton from './AgentPropertyListSkeleton';

const TABS = ['property.tabs.properties', 'property.tabs.landProperty'];
const FILTERS = [
  'property.filters.buyRent',
  'property.filters.status',
  'property.filters.bedsBath',
  'property.filters.propertyType',
];

const STATUS_OPTIONS = [
  { key: 'active', label: 'property.status.active' },
  { key: 'inDraft', label: 'property.status.inDraft' },
  { key: 'inActive', label: 'property.status.inActive' },
];

const PROPERTY_TYPES = [
  'Apartment',
  'Bed and Breakfast Homes',
  'Duplex Homes',
  'Townhouse',
  'Villas',
  'Private Islands',
];

const AgentMyPropertyListingsDesktop: React.FC = () => {
  // All hooks must be inside the function
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [buyOrRent, setBuyOrRent] = useState<'Buy' | 'Rent'>('Buy');
  const [status, setStatus] = useState<string[]>([]);
  const [beds, setBeds] = useState([0, 5]);
  const [baths, setBaths] = useState([0, 5]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [propertyTypeSearch, setPropertyTypeSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);
  const [chipsAnchor, setChipsAnchor] = useState<null | HTMLElement>(null);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<{id: string, value: string}[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const FILTER_FONT = 'font-semibold text-[14px] leading-[100%] tracking-[-0.02em]';
  const [republishLoadingId, setRepublishLoadingId] = useState<string | null>(null);
  const [mlsValidationFlags, setMlsValidationFlags] = useState<{
    mls_agent_id: boolean;
    service_areas: boolean;
    past_experiences: boolean;
  } | null>(null);

  React.useEffect(() => {
    api.post('/common/master/list/', { tables: ['propertytype'] })
      .then(res => {
        setPropertyTypeOptions(res.data.propertytype || []);
      })
      .catch(() => setPropertyTypeOptions([]));
  }, []);

  // Unified effect for tab changes and search - prevents duplicate API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      const payload: any = { page: 1, property_source: activeTab === 0 ? 'vistaview' : 'mls' };
      if (searchInput) payload.search = searchInput;
      api.post('/agent/properties/list/?page=1', payload)
        .then(res => {
          setProperties(res.data.data.results || []);
          setHasMore(!!res.data.data.next);
          // Capture MLS validation flags if present
          if (activeTab === 1 && res.data.data.mls_validation_flags) {
            setMlsValidationFlags(res.data.data.mls_validation_flags);
          } else {
            setMlsValidationFlags(null);
          }
        })
        .catch(() => {
          setProperties([]);
          setMlsValidationFlags(null);
        })
        .finally(() => setLoading(false));
    }, searchInput ? 400 : 0); // No delay for tab changes, 400ms debounce for search
    return () => clearTimeout(handler);
  }, [activeTab, searchInput]);

  // Infinite scroll handler
  React.useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const payload: any = { page: page + 1, property_source: activeTab === 0 ? 'vistaview' : 'mls' };
    if (searchInput) payload.search = searchInput;
    api.post(`/agent/properties/list/?page=${page + 1}`, payload)
      .then(res => {
        setProperties(prev => [...prev, ...(res.data.data.results || [])]);
        setPage(prev => prev + 1);
        setHasMore(!!res.data.data.next);
      })
      .finally(() => setLoadingMore(false));
  };

  // Dropdown close on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
        setFilterAnchor(null);
      }
    }
    if (activeFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeFilter]);

  // Add this function inside the component:
  const applyFilters = () => {
    setLoading(true);
    // Map propertyTypes (values) to IDs
    const propertyTypeIds = propertyTypeOptions
      .filter(opt => propertyTypes.includes(opt.value))
      .map(opt => opt.id);
    // Build payload
    const payload: any = { property_source: activeTab === 0 ? 'vistaview' : 'mls' };
    if (propertyTypeIds.length > 0) payload.property_type = propertyTypeIds;
    if (status.length > 0) {
      // Map 'active' to 'published', 'inDraft' to 'draft', 'inActive' to 'inactive', keep others as is
      let apiStatus = status.map(s =>
        s === 'active' ? 'published' :
        s === 'inDraft' ? 'draft' :
        s === 'inActive' ? 'inactive' :
        s
      );
      apiStatus = Array.from(new Set(apiStatus));
      payload.status = apiStatus;
    }
    if (beds[0] > 0) payload.bedrooms_from = beds[0];
    if (beds[1] < 5) payload.bedrooms_to = beds[1];
    if (baths[0] > 0) payload.bathrooms_from = baths[0];
    if (baths[1] < 5) payload.bathrooms_to = baths[1];
    api.post('/agent/properties/list/?page=1', payload)
      .then(res => {
        setProperties(res.data.data.results || []);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  const handleRepublish = async (property: any) => {
    setRepublishLoadingId(property.property_id);
    try {
      await api.patch(`/agent/properties/${property.property_id}/`, { status: 'published' });
      // Update the property status locally
      setProperties(prevProps => prevProps.map(p =>
        p.property_id === property.property_id ? { ...p, status: 'published' } : p
      ));
      // Optionally show a toast here
    } catch (error) {
      // Optionally show an error toast
    } finally {
      setRepublishLoadingId(null);
    }
  };

  // Dropdown UIs
  const renderDropdown = () => {
    if (!activeFilter || !filterAnchor) return null;
    const anchorRect = filterAnchor.getBoundingClientRect();
    const style = {
      position: 'absolute' as const,
      left: anchorRect.left - filterAnchor.offsetParent!.getBoundingClientRect().left,
      top: anchorRect.bottom - filterAnchor.offsetParent!.getBoundingClientRect().top + 8,
      zIndex: 30,
      minWidth: filterAnchor.offsetWidth,
    };
    if (activeFilter === t('property.filters.status')) {
      return (
        <div ref={dropdownRef} style={style} className="bg-white border rounded-xl shadow-lg p-5 min-w-[220px]">
          <div className="font-bold text-[18px] mb-4 text-left">{t('property.filters.status')}</div>
          <div className="flex flex-col gap-3 mb-4">
            {STATUS_OPTIONS.map(opt => (
              <label key={opt.key} className="flex items-center gap-3 cursor-pointer text-[15px] font-normal text-[#222]">
                <input
                  type="checkbox"
                  checked={status.includes(opt.key)}
                  onChange={() => setStatus(s => s.includes(opt.key) ? s.filter(x => x !== opt.key) : [...s, opt.key])}
                  className="w-4 h-4 accent-green-900 border-gray-300 rounded"
                />
                <span className="text-[15px] text-[#222] font-normal">{t(opt.label)}</span>
              </label>
            ))}
          </div>
          <hr className="my-4 border-[#E0E0E0]" />
          <div className="flex justify-between items-center">
            <button className="text-[#004236] text-[15px] font-normal px-2 py-1 rounded hover:underline" onClick={() => setStatus([])}>{t('common.clear', 'Clear')}</button>
            <button className="border border-[#004236] text-[#004236] text-[15px] font-normal px-4 py-1 rounded transition-colors hover:bg-[#E6FAF2] bg-white" onClick={() => { setActiveFilter(null); applyFilters(); }}>{t('common.apply', 'Apply')}</button>
          </div>
        </div>
      );
    }
    if (activeFilter === t('property.filters.bedsBath')) {
      return (
        <div ref={dropdownRef} style={style} className="bg-white border rounded shadow-lg p-4 w-80">
          <div className="font-bold mb-3 text-[15px] text-[#222]">{t('property.filters.bedsBath')}</div>
          {/* Bedrooms */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[13px] text-[#222]">{t('common.bedrooms')}</span>
              <span className="text-[13px] text-[#222] font-normal">{beds[0] === 0 && beds[1] === 5 ? t('common.any', 'Any') : `${beds[0]} - ${beds[1]}+`}</span>
            </div>
            <Slider
              value={beds}
              onChange={(_, value) => setBeds(value as [number, number])}
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
            <div className="flex justify-between text-[12px] font-semibold text-[#222]">
              <span>0+</span>
              <span>5+</span>
            </div>
          </div>
          <hr className="my-4 border-[#E5E7EB]" />
          {/* Bathrooms */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[13px] text-[#222]">{t('common.bathrooms')}</span>
              <span className="text-[13px] text-[#222] font-normal">{baths[0] === 0 && baths[1] === 5 ? t('common.any', 'Any') : `${baths[0]} - ${baths[1]}+`}</span>
            </div>
            <Slider
              value={baths}
              onChange={(_, value) => setBaths(value as [number, number])}
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
            <div className="flex justify-between text-[12px] font-semibold text-[#222]">
              <span>0+</span>
              <span>5+</span>
            </div>
          </div>
          <hr className="my-4 border-[#E5E7EB]" />
          <div className="flex justify-between items-center mt-3">
            <button className="text-[#007E67] text-[13px] font-medium px-2 py-1 rounded" onClick={() => { setBeds([0, 5]); setBaths([0, 5]); }}>{t('common.clear', 'Clear')}</button>
            <button className="border border-[#007E67] text-[#007E67] text-[13px] font-medium px-3 py-1 rounded transition-colors hover:bg-[#E6FAF2]" onClick={() => { setActiveFilter(null); applyFilters(); }}>{t('common.apply', 'Apply')}</button>
          </div>
        </div>
      );
    }
    if (activeFilter === t('property.filters.propertyType')) {
      // Calculate left position to prevent overflow
      let dropdownLeft = style.left;
      const dropdownWidth = 320; // px, same as w-[320px]
      const viewportWidth = window.innerWidth;
      if (dropdownLeft + dropdownWidth > viewportWidth - 16) { // 16px margin
        dropdownLeft = Math.max(16, viewportWidth - dropdownWidth - 16);
      }
      const adjustedStyle = { ...style, left: dropdownLeft };
      return (
        <div ref={dropdownRef} style={adjustedStyle} className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-6 w-[320px]">
          <div className="font-bold text-[15px] text-[#222] mb-3">{t('property.filters.propertyType')}</div>
          <input
            className="w-full border border-[#E5E7EB] rounded px-3 py-2 mb-3 text-[13px] font-normal text-[#222] focus:outline-none focus:ring-2 focus:ring-green-900"
            placeholder={t('property.filters.propertyType')}
            value={propertyTypeSearch}
            onChange={e => setPropertyTypeSearch(e.target.value)}
          />
          <div className="max-h-40 overflow-y-auto mb-3 flex flex-col gap-2">
            {propertyTypeOptions.filter(type => type.value.toLowerCase().includes(propertyTypeSearch.toLowerCase())).map(type => (
              <label key={type.id} className="flex items-center gap-3 cursor-pointer text-[13px] font-normal text-[#222]">
                <input
                  type="checkbox"
                  checked={propertyTypes.includes(type.value)}
                  onChange={() => setPropertyTypes(s => s.includes(type.value) ? s.filter(x => x !== type.value) : [...s, type.value])}
                  className="w-4 h-4 accent-green-900 border-2 border-[#E5E7EB] rounded"
                />
                {type.value}
              </label>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2">
            <button className="text-[#007E67] text-[13px] font-medium px-2 py-1 rounded hover:underline" onClick={() => { setPropertyTypes([]); setPropertyTypeSearch(''); }}>{t('common.clear', 'Clear')}</button>
            <button className="border border-[#007E67] text-[#007E67] text-[13px] font-medium px-3 py-1 rounded transition-colors hover:bg-[#E6FAF2]" onClick={() => { setActiveFilter(null); applyFilters(); }}>{t('common.apply', 'Apply')}</button>
          </div>
        </div>
      );
    }
    return null;
  };

  const getStatusBadgeConfig = (status?: string | null) => {
    const normalized = status?.toLowerCase() || '';
    if (normalized === 'published' || normalized === 'active') {
      return { label: 'Active', bg: '#E6FAF2', color: '#007E67', border: '#A6F4C5' };
    }
    if (normalized === 'draft' || normalized === 'indraft') {
      return { label: 'In-draft', bg: '#FFF4DB', color: '#B88700', border: '#FFE4A3' };
    }
    return { label: 'Inactive', bg: '#FFEAEA', color: '#D92121', border: '#FFD3D3' };
  };

  const getPropertyFromBadgeConfig = (value?: string | null) => {
    if (!value) return null;
    const normalized = value.toLowerCase().trim();
    // Check for non-MLS first (before checking for MLS)
    if (normalized.includes('non-mls') || normalized.includes('non mls') || normalized === 'non-mls') {
      return { 
        text: value, 
        bg: 'rgba(255, 56, 60, 0.2)', 
        color: 'rgba(255, 56, 60, 1)', 
        isMls: false 
      };
    }
    // Check for MLS (but not non-MLS)
    if (normalized.includes('mls')) {
      return { 
        text: value, 
        bg: 'rgba(52, 199, 89, 0.2)', 
        color: 'rgba(52, 199, 89, 1)', 
        isMls: true 
      };
    }
    // Default to red for anything else
    return { 
      text: value, 
      bg: 'rgba(255, 56, 60, 0.2)', 
      color: 'rgba(255, 56, 60, 1)', 
      isMls: false 
    };
  };

  // Property Card
  const PropertyCard = ({ property }: { property: any }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const statusBadge = getStatusBadgeConfig(property?.status);
    const propertyFromBadge = getPropertyFromBadgeConfig(property?.property_from);
    return (
      <div
        className="flex bg-white mb-6 items-center border border-[#E5E7EB] relative w-full"
        style={{
          minHeight: 200,
          borderRadius: 10,
          boxSizing: 'border-box',
          padding: 0,
          overflow: 'hidden',
          background: property.status === 'inactive' ? '#F3F3F3' : undefined,
        }}
      >
        {property.main_photo_url ? (
          <div style={{ position: 'relative', width: 233, height: 230, marginLeft: 4, marginRight: 36 }}>
            {imageLoading && (
              <div style={{
                position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#F0F0F0', borderRadius: 10
              }}>
                <div className="w-10 h-10 border-4 border-t-4 border-t-[#007E67] border-gray-300 rounded-full animate-spin" />
              </div>
            )}
            <img
              src={property.main_photo_url}
              alt={property.name}
              style={{
                width: 233,
                height: 230,
                borderRadius: 10,
                objectFit: 'cover',
                padding: 6,
                flexShrink: 0,
                display: imageLoading ? 'none' : 'block',
                filter: property.status === 'inactive' ? 'grayscale(1)' : undefined,
              }}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>
        ) : (
          <div
            style={{
              width: 233,
              height: 230,
              borderRadius: 10,
              background: '#F0F0F0',
              marginLeft: 4,
              marginRight: 36,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )}
        <div className="flex-1 flex flex-col justify-center h-full py-4" style={{ minWidth: 0, position: 'relative' }}>
          <div className="flex items-start mb-2" style={{ width: '100%' }}>
            <div className="flex-1 min-w-0" style={{ paddingRight: '16px' }}>
              <div
                className="truncate mb-2"
                style={{
                  fontWeight: 550, // normal font weight
                  fontSize: 24,
                  lineHeight: '30px',
                  letterSpacing: '-0.5px',
                  color: '#222',
                  maxWidth: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {property.name}
              </div>
              <div className="text-[#7C7C7C] text-[15px] mb-2 truncate">{property.address}</div>
              <div className="flex items-center gap-4 text-[15px] mb-2 text-[#222] font-medium">
                <span>{property.bedrooms ? `${property.bedrooms} BHK` : '--'}</span>
                <span className="text-[#C4C4C4]">|</span>
                <span>{property.bathrooms ? `${property.bathrooms} Bathrooms` : '--'}</span>
                <span className="text-[#C4C4C4]">|</span>
                <span>{property.total_sqft ? `${property.total_sqft.toLocaleString()} Sq. Ft.` : '--'}</span>
              </div>
              <div
                className="font-bold text-[25px] mb-2"
                style={{
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  display: 'inline-block',
                }}
              >
                {property.selling_price ? `$${property.selling_price.toLocaleString()}` : '--'}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="italic text-black text-[13px]">Posted on {property.posted_date}</span>
                <span
                  style={{
                    background: '#D0F2EBB2',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '14px',
                    marginLeft: '8px',
                  }}
                >
                  <span style={{ color: '#179381', fontWeight: 700 }}>{property.days_on_vistaview}</span>
                  <span style={{ color: '#222', fontWeight: 400 }}> days on Vistaview</span>
                </span>
                <span
                  style={{
                    background: '#FBF8E5B2',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '14px',
                    marginLeft: '8px',
                  }}
                >
                  <span style={{ color: '#179381', fontWeight: 700 }}>{property.view_count}</span>
                  <span style={{ color: '#222', fontWeight: 400 }}> views</span>
                </span>
                <span
                  style={{
                    background: '#D0F2EBB2',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '14px',
                    marginLeft: '8px',
                  }}
                >
                  <span style={{ color: '#179381', fontWeight: 700 }}>{property.save_count}</span>
                  <span style={{ color: '#222', fontWeight: 400 }}> saves</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0" style={{ alignSelf: 'flex-start', marginRight: 0 }}>
              <div className="flex flex-wrap gap-2" style={{ justifyContent: 'flex-end', alignItems: 'flex-start', marginRight: 0 }}>
                {propertyFromBadge && (
                  <span
                    className="text-[13px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
                    style={{
                      background: propertyFromBadge.bg,
                      color: propertyFromBadge.color,
                    }}
                  >
                    {propertyFromBadge.isMls && (
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(52, 199, 89, 1)',
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                    {propertyFromBadge.text}
                  </span>
                )}
                <span
                  className="text-[13px] font-semibold px-3 py-1 rounded-full border"
                  style={{
                    background: statusBadge.bg,
                    color: statusBadge.color,
                    borderColor: statusBadge.border,
                  }}
                >
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Edit & Share buttons */}
        <div className="flex flex-col gap-4 min-w-[120px] items-center h-full justify-center pr-10">
          <button
            className="flex items-center gap-2 border-[2px] border-[#004236] px-2 py-2 rounded-lg text-black bg-white hover:bg-[#F0FDF4] transition-all text-[15px] font-normal w-[90px] justify-center"
            onClick={() => navigate('/agent/properties/details/' + property.property_id)}
          >
            <img src={EditIcon} alt="Edit" className="w-5 h-5" />
            <span>Edit</span>
          </button>
          {property.status === 'inactive' ? (
            <button
              className="flex items-center gap-2 border-[2px] border-[#004236] px-2 py-2 rounded-lg text-black bg-white hover:bg-[#F0FDF4] transition-all text-[15px] font-normal w-[120px] justify-center whitespace-nowrap"
              onClick={() => handleRepublish(property)}
              disabled={republishLoadingId === property.property_id}
            >
              {republishLoadingId === property.property_id ? (
                <span className="w-5 h-5 flex items-center justify-center">
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#004236" strokeWidth="4" strokeDasharray="60 20" />
                  </svg>
                </span>
              ) : (
                <>
                  <img src={EditIcon} alt="Republish" className="w-5 h-5" />
                  <span>Re-publish</span>
                </>
              )}
            </button>
          ) : (
            <ShareButton
              url={`${window.location.origin}/property/${property.property_id}`}
              title={`${property.name || 'Property'} - ${property.price || 'Contact for price'}`}
              text={`Check out this ${property.property_type?.name || 'property'} at ${property.address || 'this location'}`}
              variant="edit-style"
              className="w-[90px]"
              onShareSuccess={() => {
                // Optional: Track analytics or show additional feedback
                console.log(`Property ${property.property_id} shared successfully`);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#F8FAF9] min-h-screen">
      <div className="w-full px-1">
        {/* Title and Add Property Button */}
        <div className="flex justify-between items-center mt-4 mb-2 relative">
          <div style={{ width: 176, height: 40, visibility: 'hidden' }}></div>
          <h1 className="text-[30px] font-light text-[#222] text-center">My Property Listings</h1>
          <button
            onClick={() => navigate('/agent/properties/add')}
            className="flex items-center justify-center whitespace-nowrap"
            style={{ 
              width: 176, 
              height: 40, 
              fontSize: '1.125rem', 
              fontWeight: 400, // normal font weight
              borderRadius: '4px', // boxy design
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', // brand green gradient
              color: '#fff',
              boxShadow: '5px 5px 5px 0px #FFF49233 inset, -5px -5px 10px 0px #FFB86726 inset, 10px 10px 10px 0px #0C656E1A',
              transition: 'opacity 0.2s'
            }}
          >
            + Add Property
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-8 border-b border-[#E5E7EB] mb-2">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              className={`px-0 pb-3 text-lg font-normal border-b-2 transition-colors ${activeTab === idx ? 'border-b-2 border-transparent bg-clip-text text-transparent' : 'border-transparent text-[#7C7C7C]'}`}
              onClick={() => setActiveTab(idx)}
              style={activeTab === idx
                ? {
                    minWidth: 160,
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    borderImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%) 1',
                  }
                : { minWidth: 160 }}
            >
              {t(tab)}
            </button>
          ))}
        </div>
        {/* Search & Filters Row */}
        <div className="flex items-center gap-4 mb-3">
          {/* Search bar with chips */}
          <div className="w-[420px] flex items-center gap-2 h-10 relative ml-4">
            <span className="flex items-center justify-center w-6 h-6">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.23 22.1883L28 28M25.3333 14.6667C25.3333 20.5577 20.5577 25.3333 14.6667 25.3333C8.77563 25.3333 4 20.5577 4 14.6667C4 8.77563 8.77563 4 14.6667 4C20.5577 4 25.3333 8.77563 25.3333 14.6667Z" stroke="#004236" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <input
              className="outline-none flex-1 text-base font-normal min-w-[80px] bg-transparent pl-1"
              placeholder={t('common.search')}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{fontFamily: 'Inter'}}
            />
            <div className="absolute left-0 right-0 -bottom-2 h-[2px] bg-[#E0E0E0] w-full" />
          </div>
          {/* Filter buttons */}
          <div className="flex gap-2 ml-6">
            {/* Buy | Rent toggle */}
            <div className={`flex border border-[#E5E7EB] rounded-lg overflow-hidden ${FILTER_FONT} flex-shrink-0 flex-grow-0 w-[110px]`}>
              <button
                className={`px-4 py-2 text-sm font-normal w-1/2 whitespace-nowrap ${buyOrRent === 'Buy' ? 'bg-green-900 text-white' : 'bg-white text-green-900'}`}
                onClick={() => setBuyOrRent('Buy')}
              >{t('navigation.buy')}</button>
              <button
                className={`px-4 py-2 text-sm font-normal w-1/2 whitespace-nowrap ${buyOrRent === 'Rent' ? 'bg-green-900 text-white' : 'bg-white text-green-900'}`}
                onClick={() => setBuyOrRent('Rent')}
              >{t('navigation.rent')}</button>
            </div>
            {/* Other filter buttons */}
            {[t('property.filters.status'), t('property.filters.bedsBath'), t('property.filters.propertyType')].map(filter => (
              <button
                key={filter}
                className={`border border-[#E5E7EB] px-4 py-2 rounded-lg bg-white text-green-900 hover:bg-green-50 text-sm font-normal flex-shrink-0 flex-grow-0 whitespace-nowrap`}
                style={{ minWidth: 'max-content' }}
                onClick={e => {
                  setActiveFilter(filter);
                  setFilterAnchor(e.currentTarget);
                }}
              >
                {filter}
              </button>
            ))}
          </div>
          {/* Dropdowns */}
          {activeFilter && renderDropdown()}
        </div>
        {/* Listings Section */}
        <div className="mt-2 w-full mx-auto px-2">
          {loading ? (
            <AgentPropertyListSkeleton />
          ) : (
            (() => {
              // Show MLS validation screen if on MLS tab and validation flags are present
              if (activeTab === 1 && mlsValidationFlags) {
                return (
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    {/* Red exclamation icon */}
                    <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mb-6">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-normal text-black mb-8 text-center">
                      {t('property.mlsValidation.title')}
                    </h2>
                    
                    {/* Validation items list */}
                    <div className="flex flex-col gap-4 mb-8 w-full max-w-md">
                      {/* License ID */}
                      <div className="flex items-center gap-3">
                        {mlsValidationFlags.mls_agent_id ? (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            }}
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'var(--Bg-light-green, rgba(208, 242, 235, 0.7))',
                            }}
                          >
                            <span className="text-black font-semibold text-sm">1</span>
                          </div>
                        )}
                        <span 
                          className="text-base"
                          style={{
                            color: mlsValidationFlags.mls_agent_id ? '#004236' : '#000000',
                          }}
                        >
                          {t('property.mlsValidation.addMlsAgentId')}
                        </span>
                      </div>
                      
                      {/* Service Areas */}
                      <div className="flex items-center gap-3">
                        {mlsValidationFlags.service_areas ? (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            }}
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'var(--Bg-light-green, rgba(208, 242, 235, 0.7))',
                            }}
                          >
                            <span className="text-black font-semibold text-sm">2</span>
                          </div>
                        )}
                        <span 
                          className="text-base"
                          style={{
                            color: mlsValidationFlags.service_areas ? '#004236' : '#000000',
                          }}
                        >
                          {mlsValidationFlags.service_areas 
                            ? t('property.mlsValidation.addedServiceAreas')
                            : t('property.mlsValidation.addServiceAreas')}
                        </span>
                      </div>
                      
                      {/* Past Experiences */}
                      <div className="flex items-center gap-3">
                        {mlsValidationFlags.past_experiences ? (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                            }}
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'var(--Bg-light-green, rgba(208, 242, 235, 0.7))',
                            }}
                          >
                            <span className="text-black font-semibold text-sm">3</span>
                          </div>
                        )}
                        <span 
                          className="text-base"
                          style={{
                            color: mlsValidationFlags.past_experiences ? '#004236' : '#000000',
                          }}
                        >
                          {t('property.mlsValidation.addPastExperiences')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Update Profile Button */}
                    <button
                      onClick={() => navigate('/agent/profile')}
                      className="px-8 py-3 text-white text-base font-normal rounded hover:opacity-90 transition-opacity"
                      style={{
                        background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                      }}
                    >
                      {t('property.mlsValidation.updateProfile')}
                    </button>
                  </div>
                );
              }
              
              if (properties.length === 0) {
                return <div className="text-center py-10">No properties found.</div>;
              }
              return (
                <>
                  {properties.map(property => (
                    <PropertyCard key={property.name + property.address + property.posted_date} property={property} />
                  ))}
                  {loadingMore && <AgentPropertyListSkeleton />}
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentMyPropertyListingsDesktop; 