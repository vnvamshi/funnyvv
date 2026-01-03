import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MobileHeader from './MobileHeader';
import MobilePropertyFilterModal from './modal/MobilePropertyFilterModal';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import EditIcon from '../../../assets/images/edit-icon.svg';
import ShareButton from '../../../components/ShareButton';
import AgentPropertyListSkeletonMobile from './AgentPropertyListSkeletonMobile';
import menuIcon from '../../../assets/images/menu-icon.svg';
import MobileAgentMenu from '../../../components/MobileAgentMenu';
import IcMobileFilter from '../../../assets/images/mobile/ic_mobile_filter.svg';
import AgentFooterNav from '../../../components/AgentFooterNav';
// import BottomMenu from '...'; // TODO: Import when available

const AgentMyPropertyListingsMobile: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddButton, setShowAddButton] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<number | null>(null);
  // Filter state
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [listingTypes, setListingTypes] = useState<string[]>([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<{id: string, value: string}[]>([]);
  const navigate = useNavigate();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Add this state at the top level of the component, after other useState hooks
  const [imageLoadingMap, setImageLoadingMap] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'properties' | 'mlsProperties'>('properties');
  const [menuOpen, setMenuOpen] = useState(false);
  const [republishLoadingId, setRepublishLoadingId] = useState<string | null>(null);
  const [mlsValidationFlags, setMlsValidationFlags] = useState<{
    mls_agent_id: boolean;
    service_areas: boolean;
    past_experiences: boolean;
  } | null>(null);

  // Hide/show Add Property button on scroll (show after idle)
  useEffect(() => {
    const handleScroll = () => {
      setShowAddButton(false);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = window.setTimeout(() => {
        setShowAddButton(true);
      }, 300);
    };
    const node = scrollRef.current;
    if (node) node.addEventListener('scroll', handleScroll);
    return () => {
      if (node) node.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  useEffect(() => {
    api.post('/common/master/list/', { tables: ['propertytype'] })
      .then(res => {
        setPropertyTypeOptions(res.data.propertytype || []);
      })
      .catch(() => setPropertyTypeOptions([]));
  }, []);

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

  // Unified effect for tab changes and search - prevents duplicate API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      const payload: any = { page: 1, property_source: activeTab === 'properties' ? 'vistaview' : 'mls' };
      if (search) payload.search = search;
      api.post('/agent/properties/list/?page=1', payload)
        .then(res => {
          setProperties(res.data.data.results || []);
          setHasMore(!!res.data.data.next);
          // Capture MLS validation flags if present
          if (activeTab === 'mlsProperties' && res.data.data.mls_validation_flags) {
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
    }, search ? 400 : 0); // No delay for tab changes, 400ms debounce for search
    return () => clearTimeout(handler);
  }, [activeTab, search]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const payload: any = { page: page + 1, property_source: activeTab === 'properties' ? 'vistaview' : 'mls' };
    if (search) payload.search = search;
    api.post(`/agent/properties/list/?page=${page + 1}`, payload)
      .then(res => {
        setProperties(prev => [...prev, ...(res.data.data.results || [])]);
        setPage(prev => prev + 1);
        setHasMore(!!res.data.data.next);
      })
      .finally(() => setLoadingMore(false));
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el || loading || loadingMore || !hasMore) return;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
        loadMore();
      }
    };
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, [loading, loadingMore, hasMore]);

  const applyFilters = () => {
    setLoading(true);
    // Map propertyTypes (values) to IDs
    const propertyTypeIds = propertyTypeOptions
      .filter(opt => propertyTypes.includes(opt.value))
      .map(opt => opt.id);
    // Build payload
    const payload: any = { property_source: activeTab === 'properties' ? 'vistaview' : 'mls' };
    if (propertyTypeIds.length > 0) payload.property_type = propertyTypeIds;
    if (listingTypes.length > 0) {
      // Map 'active' to 'published', 'inDraft' to 'draft', 'inActive' to 'inactive', keep others as is
      let apiStatus: string[] = listingTypes.map(s =>
        s === 'active' ? 'published' :
        s === 'inDraft' ? 'draft' :
        s === 'inActive' ? 'inactive' :
        s
      );
      apiStatus = Array.from(new Set(apiStatus));
      payload.status = apiStatus;
    }
    if (bedrooms > 0) payload.bedrooms_from = bedrooms;
    if (bedrooms > 0) payload.bedrooms_to = bedrooms;
    if (bathrooms > 0) payload.bathrooms_from = bathrooms;
    if (bathrooms > 0) payload.bathrooms_to = bathrooms;
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

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAF9]">
      {/* Header with hamburger, search, filter */}
      <div className="flex items-center px-3 py-2 bg-[#007E67] w-full" style={{height: 56}}>
        <button onClick={() => setMenuOpen(true)} className="mr-3">
          <img src={menuIcon} alt="Menu" className="w-6 h-6 text-white" />
        </button>
        <input
          className="flex-1 rounded bg-white px-3 py-2 text-sm outline-none"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => setShowFilterModal(true)} className="ml-3">
          <img src={IcMobileFilter} alt="Filter" className="w-6 h-6" />
        </button>
      </div>
      {/* Tabs */}
      <div className="flex w-full border-b border-[#E5E7EB] mt-2">
        <button
          className="flex-1 py-3 text-center font-normal relative bg-white"
          style={{
            color: activeTab === 'properties' ? 'transparent' : '#121212',
            background: activeTab === 'properties' ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' : undefined,
            WebkitBackgroundClip: activeTab === 'properties' ? 'text' : undefined,
            WebkitTextFillColor: activeTab === 'properties' ? 'transparent' : undefined,
            fontWeight: activeTab === 'properties' ? 700 : 400,
          }}
          onClick={() => setActiveTab('properties')}
        >
          Properties
          {activeTab === 'properties' && (
            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
              style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)' }}
            />
          )}
        </button>
        <button
          className="flex-1 py-3 text-center font-normal relative bg-white"
          style={{
            color: activeTab === 'mlsProperties' ? 'transparent' : '#121212',
            background: activeTab === 'mlsProperties' ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' : undefined,
            WebkitBackgroundClip: activeTab === 'mlsProperties' ? 'text' : undefined,
            WebkitTextFillColor: activeTab === 'mlsProperties' ? 'transparent' : undefined,
            fontWeight: activeTab === 'mlsProperties' ? 700 : 400,
          }}
          onClick={() => setActiveTab('mlsProperties')}
        >
          MLS Properties
          {activeTab === 'mlsProperties' && (
            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
              style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)' }}
            />
          )}
        </button>
      </div>
      {/* Listings */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 pb-24">
        {loading ? (
          <AgentPropertyListSkeletonMobile />
        ) : (
          (() => {
            // Show MLS validation screen if on MLS tab and validation flags are present
            if (activeTab === 'mlsProperties' && mlsValidationFlags) {
              return (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  {/* Red exclamation icon */}
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-xl font-normal text-black mb-6 text-center">
                    {t('property.mlsValidation.title')}
                  </h2>
                  
                  {/* Validation items list */}
                  <div className="flex flex-col gap-3 mb-6 w-full max-w-sm">
                    {/* License ID */}
                    <div className="flex items-center gap-3">
                      {mlsValidationFlags.mls_agent_id ? (
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                          }}
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'var(--Bg-light-green, rgba(208, 242, 235, 0.7))',
                          }}
                        >
                          <span className="text-black font-semibold text-xs">1</span>
                        </div>
                      )}
                      <span 
                        className="text-sm"
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
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                          }}
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'var(--Bg-light-green, rgba(208, 242, 235, 0.7))',
                          }}
                        >
                          <span className="text-black font-semibold text-xs">2</span>
                        </div>
                      )}
                      <span 
                        className="text-sm"
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
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                          }}
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'var(--Bg-light-green, rgba(208, 242, 235, 0.7))',
                          }}
                        >
                          <span className="text-black font-semibold text-xs">3</span>
                        </div>
                      )}
                      <span 
                        className="text-sm"
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
                    className="px-6 py-2.5 text-white text-sm font-normal rounded hover:opacity-90 transition-opacity"
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
            return <>
              {properties.map(property => {
                const propertyKey = property.name + property.address + property.posted_date;
                const imageLoading = imageLoadingMap[propertyKey] !== undefined ? imageLoadingMap[propertyKey] : true;
                const handleImageLoad = () => setImageLoadingMap(prev => ({ ...prev, [propertyKey]: false }));
                const handleImageError = () => setImageLoadingMap(prev => ({ ...prev, [propertyKey]: false }));
                // Format posted date
                const postedDate = property.posted_date ? new Date(property.posted_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '--';
                const statusBadge = getStatusBadgeConfig(property?.status);
                const propertyFromBadge = getPropertyFromBadgeConfig(property?.property_from);
                return (
                  <div key={propertyKey} className="bg-white rounded-2xl shadow-md p-4 mb-5">
                    {/* Top row: posted date and badges */}
                    <div className="flex justify-between items-start mb-2" style={{ gap: '12px' }}>
                      <span className="italic text-xs text-[#7C7C7C]">Posted on {postedDate}</span>
                      <div className="flex flex-wrap gap-2" style={{ justifyContent: 'flex-end', alignItems: 'flex-start', marginLeft: 'auto' }}>
                        {propertyFromBadge && (
                          <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                            style={{
                              background: propertyFromBadge.bg,
                              color: propertyFromBadge.color,
                            }}
                          >
                            {propertyFromBadge.isMls && (
                              <span
                                className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: 'rgba(52, 199, 89, 1)',
                                }}
                              >
                                <svg
                                  width="8"
                                  height="8"
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
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
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
                    {/* Main row: image and details */}
                    <div className="flex gap-3 items-start">
                      {/* Image */}
                      {property.main_photo_url ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                          {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#F0F0F0] z-10 rounded-xl">
                              <div className="w-7 h-7 border-4 border-t-4 border-t-[#007E67] border-gray-300 rounded-full animate-spin" />
                            </div>
                          )}
                          <img
                            src={property.main_photo_url}
                            alt={property.name}
                            className="w-full h-full object-cover"
                            style={{ display: imageLoading ? 'none' : 'block', filter: property.status === 'inactive' ? 'grayscale(1)' : undefined }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[#F0F0F0]" />
                      )}
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base text-[#222] leading-tight mb-1 line-clamp-2">{property.name}</div>
                        <div className="text-xs text-[#7C7C7C] mb-1 truncate">{property.address}</div>
                        <div className="flex gap-2 text-xs text-[#222] mb-2">
                          <span>{property.bedrooms ? `${property.bedrooms}BHK` : '--'}</span>
                          <span>|</span>
                          <span>{property.bathrooms ? `${property.bathrooms} Bathrooms` : '--'}</span>
                          <span>|</span>
                          <span>{property.total_sqft ? `${property.total_sqft.toLocaleString()} Sq. Ft.` : '--'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Price */}
                    <div className="font-bold text-2xl mt-3 mb-2" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', display: 'inline-block' }}>
                      {property.selling_price ? `$${property.selling_price.toLocaleString()}` : '--'}
                    </div>
                    {/* Stats row */}
                    <div className="flex gap-2 mb-3">
                      {/* Days badge */}
                      <span
                        className="text-xs font-semibold rounded px-2 py-1 flex items-center min-w-[70px] justify-center"
                        style={{ background: 'var(--Bg-light-green, #D0F2EBB2)' }}
                      >
                        <span style={{ color: property.days_on_vistaview === 30 ? '#179381' : '#222', fontWeight: 700 }}>{property.days_on_vistaview || 0}</span>
                        <span style={{ color: '#222', fontWeight: 400 }}>&nbsp;days on Vistaview</span>
                      </span>
                      {/* Views badge */}
                      <span
                        className="text-xs font-semibold rounded px-2 py-1 flex items-center min-w-[50px] justify-center"
                        style={{ background: 'var(--Bg-light-yellow, #FBF8E5B2)' }}
                      >
                        <span style={{ color: '#179381', fontWeight: 700 }}>{property.view_count || 0}</span>
                        <span style={{ color: '#222', fontWeight: 400 }}>&nbsp;views</span>
                      </span>
                      {/* Saves badge (same as days badge) */}
                      <span
                        className="text-xs font-semibold rounded px-2 py-1 flex items-center min-w-[50px] justify-center"
                        style={{ background: 'var(--Bg-light-green, #D0F2EBB2)' }}
                      >
                        <span style={{ color: '#179381', fontWeight: 700 }}>{property.save_count || 0}</span>
                        <span style={{ color: '#222', fontWeight: 400 }}>&nbsp;saves</span>
                      </span>
                    </div>
                    {/* Buttons row */}
                    <div className="flex gap-3 mt-2 justify-center mx-auto">
                      <button className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg bg-white hover:bg-[#F0FDF4] transition-all text-sm font-normal max-w-[160px] w-full whitespace-nowrap"
                        style={{ minWidth: '100px', border: '2px solid #004236', color: '#004236' }}
                        onClick={() => navigate('/agent/properties/details/' + property.property_id)}>
                        <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                        <span>Edit</span>
                      </button>
                      {property.status === 'inactive' ? (
                        <button
                          className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg bg-white hover:bg-[#F0FDF4] transition-all text-sm font-normal max-w-[160px] w-full border-2 border-[#004236] text-[#004236] whitespace-nowrap"
                          style={{ minWidth: '100px' }}
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
                          className="max-w-[160px] w-full whitespace-nowrap"
                          style={{minWidth: '100px'}} />
                      )}
                    </div>
                  </div>
                );
              })}
              {loadingMore && <AgentPropertyListSkeletonMobile />}
            </>;
          })()
        )}
      </div>
      {/* Floating Add Property Button */}
      {showAddButton && (
        <button
          className="fixed bottom-20 left-1/2 -translate-x-1/2 text-white px-8 py-3 text-lg shadow-lg z-30 transition-all duration-300 flex items-center justify-center whitespace-nowrap min-w-[180px]"
          style={{
            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
            borderRadius: '4px',
            fontWeight: 400,
            boxShadow: '5px 5px 5px 0px #FFF49233 inset, -5px -5px 10px 0px #FFB86726 inset, 10px 10px 10px 0px #0C656E1A'
          }}
          onClick={() => navigate('/agent/properties/add/sale-category')}
        >
          + Add Property
        </button>
      )}
      {/* Filter Modal (Bottom Sheet) */}
      <MobilePropertyFilterModal
        open={showFilterModal}
        onCancel={() => setShowFilterModal(false)}
        onSubmit={() => { setShowFilterModal(false); applyFilters(); }}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        avgPrice={3250000}
        bedrooms={bedrooms}
        onBedroomsChange={setBedrooms}
        bathrooms={bathrooms}
        onBathroomsChange={setBathrooms}
        propertyTypes={propertyTypes}
        onPropertyTypeToggle={type => setPropertyTypes(types => types.includes(type) ? types.filter(t => t !== type) : [...types, type])}
        listingTypes={listingTypes}
        onListingTypeToggle={type => setListingTypes(types => types.includes(type) ? types.filter(t => t !== type) : [...types, type])}
        propertyTypeOptions={propertyTypeOptions}
      />
      {/* Bottom Menu Placeholder */}
      {/* <BottomMenu /> */}
      {/* Mobile Agent Menu */}
      <MobileAgentMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <AgentFooterNav active="listings" />
    </div>
  );
};

export default AgentMyPropertyListingsMobile; 