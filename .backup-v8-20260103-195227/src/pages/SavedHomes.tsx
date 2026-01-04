import React from 'react';
import ServiceSection from './Home/DesktopServiceSectionUI';
import useWindowSize from '../hooks/useWindowSize';
import { useTranslations } from '../hooks/useTranslations';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Heart, MoreVertical, Menu } from 'lucide-react';
import { TRANSLATION_KEYS } from '../utils/translationKeys';
import house1 from '../assets/images/spotlight-house1.svg';
import { fetchSavedHomes } from '../utils/api';
import { useAuth, useAuthData } from '../contexts/AuthContext';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import SavedIcon from '../assets/images/saved.svg';
import UnsavedIcon from '../assets/images/unsaved.svg';
import { toggleSaveProperty } from '../utils/api';
import PropertyListSkeleton, { SavedHomeListSkeleton, SavedHomeListSkeletonMobile, SavedHomeListSkeletonRow } from '../pages/HomeSearchList/PropertyListing/components/PropertyListSkeleton';
import { MobileMenu } from '../components/MobileMenu';
import MobileBuyerMenu from '../components/MobileBuyerMenu';
import MobileAgentMenu from '../components/MobileAgentMenu';
import BuyerFooterNav from '../components/BuyerFooterNav';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// Define the type for a saved home item
interface SavedHome {
  mainphoto_url: string;
  property_id: string;
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  total_sqft: number;
  selling_price: number;
  isSaved?: boolean; // Add isSaved as optional
}

const PAGE_SIZE = 10;

const SavedHomes = () => {
  const { width } = useWindowSize();
  const { t: tCustom } = useTranslations();
  const { t } = useTranslation();
  const isMobile = width <= 1024;
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const authData = useAuthData();
  const isAgent = authData?.user?.user_type === 'agent';
  const isBuyer = authData?.user?.user_type === 'buyer';
  const navigate = useNavigate();

  const [homes, setHomes] = useState<SavedHome[]>([]);
  const [sortOption, setSortOption] = useState<'all' | 'high' | 'low'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmUnsave, setConfirmUnsave] = useState<{ propertyId: string; idx: number } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Toggle save/unsave handler
  const handleToggleSave = async (propertyId: string, idx: number, isSaved: boolean) => {
    if (!user || !user.user_id) {
      window.location.href = '/login';
      return;
    }
    if (isSaved) {
      setConfirmUnsave({ propertyId, idx });
      return;
    }
    await doToggleSave(propertyId, idx, true);
  };

  // Actual API call and optimistic update
  const doToggleSave = async (propertyId: string, idx: number, isSaved: boolean) => {
    setSaving(propertyId);
    if (!isSaved) {
      // Remove from list immediately on unsave
      setHomes(prev => prev.filter((h, i) => i !== idx));
    } else {
      setHomes(prev => prev.map((h, i) => i === idx ? { ...h, isSaved } : h));
    }
    try {
      await toggleSaveProperty(user?.user_id || '', propertyId, isSaved);
    } catch (e) {
      // Revert on error
      if (!isSaved) {
        // If unsave failed, re-add the property (not trivial, would need to refetch or keep backup)
        // For now, just reload the page
        window.location.reload();
      } else {
        setHomes(prev => prev.map((h, i) => i === idx ? { ...h, isSaved: !isSaved } : h));
      }
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadHomes = async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      try {
        let sort_by: 'low_to_high' | 'high_to_low' | undefined = undefined;
        if (sortOption === 'high') sort_by = 'high_to_low';
        else if (sortOption === 'low') sort_by = 'low_to_high';
        const data = await fetchSavedHomes(page, PAGE_SIZE, sort_by);
        if (!cancelled && data && data.data && Array.isArray(data.data.results)) {
          setHomes(prev => {
            // Prevent duplicates by checking property_id
            const ids = new Set(prev.map((h: SavedHome) => h.property_id));
            const newResults = data.data.results.filter((h: SavedHome) => !ids.has(h.property_id));
            return [...prev, ...newResults];
          });
          setHasMore(data.data.has_more);
          setTotalCount(data.data.count || 0);
        } else if (!cancelled) {
          setHasMore(false);
        }
      } catch (e) {
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadHomes();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortOption]);

  // Infinite scroll logic
  const observer = useRef<IntersectionObserver | null>(null);
  const lastHomeRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prev => prev + 1);
      }
    });
    if (node && hasMore) observer.current.observe(node);
  }, [loading, hasMore]);

  // Remove client-side sorting, use server-side sort
  const sortedHomes = homes;

  // Card for desktop
  const DesktopCard = ({ home, refProp, idx }: { home: SavedHome; refProp?: (node: HTMLDivElement | null) => void; idx: number }) => {
    const typedHome = home as SavedHome & { isSaved?: boolean };
    const [imgLoaded, setImgLoaded] = React.useState(false);
    return (
      <div
        ref={refProp}
        className="bg-white rounded-[10px] shadow-md relative flex flex-col border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        style={{ width: 303, height: 315, minWidth: 303, maxWidth: 303 }}
        onClick={() => navigate(`/property/${typedHome.property_id}`)}
      >
        <div className="relative">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/60 z-10">
              <div className="w-8 h-8 border-4 border-t-4 border-t-[#007E67] border-gray-300 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={typedHome.mainphoto_url}
            alt={typedHome.name || 'Saved Home'}
            className="w-full h-[160px] object-cover rounded-t-[10px] rounded-b-none"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              className="rounded-full px-3 py-1 shadow border border-gray-200 focus:outline-none flex items-center justify-center"
              style={{ background: '#FFFFFF80', borderRadius: '9999px' }}
              onClick={e => { e.stopPropagation(); handleToggleSave(typedHome.property_id, idx, !!typedHome.isSaved); }}
              disabled={saving === typedHome.property_id}
            >
              <img
                src={typedHome.isSaved ? SavedIcon : UnsavedIcon}
                alt={typedHome.isSaved ? 'Saved' : 'Save'}
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>
        <div className="flex flex-col flex-1 px-3 pt-2 pb-2">
          <h2
            className="line-clamp-2 min-h-[20px]"
            style={{
              fontFamily: 'DM Serif Display',
              fontWeight: 550,
              fontSize: 20,
              lineHeight: '15px',
              letterSpacing: 0.25,
              verticalAlign: 'middle',
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            }}
          >
            {typedHome.name || 'No Name'}
          </h2>
          <div className="text-[12px] text-gray-500 mb-1" style={{marginTop: 0}}>{typedHome.address}</div>
          <div
            className="text-[12px]"
            style={{ color: '#111', fontWeight: 550 }}
          >
            {typedHome.bedrooms} Bedroom(s) | {typedHome.bathrooms} Baths | {typedHome.total_sqft} Sq. Ft.
          </div>
          <div className="text-[17px] font-bold text-[#004236] mt-1">${typedHome.selling_price?.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  // Card for mobile
  const MobileCard = ({ home, refProp, idx }: { home: SavedHome; refProp?: (node: HTMLDivElement | null) => void; idx: number }) => {
    const typedHome = home as SavedHome & { isSaved?: boolean };
    const [imgLoaded, setImgLoaded] = React.useState(false);
    return (
      <div 
        ref={refProp} 
        className="bg-white rounded-[10px] shadow mb-4 relative flex flex-col border border-gray-100 w-full cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate(`/property/${typedHome.property_id}`)}
      >
        <div className="relative">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/60 z-10">
              <div className="w-8 h-8 border-4 border-t-4 border-t-[#007E67] border-gray-300 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={typedHome.mainphoto_url}
            alt={typedHome.name || 'Saved Home'}
            className="w-full h-[160px] object-cover rounded-t-[10px] rounded-b-none"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          <button
            className="absolute top-3 right-3 rounded-full px-3 py-1 shadow border border-gray-200 z-10 focus:outline-none flex items-center justify-center"
            style={{ background: '#FFFFFF80', borderRadius: '9999px' }}
            onClick={e => { e.stopPropagation(); handleToggleSave(typedHome.property_id, idx, !!typedHome.isSaved); }}
            disabled={saving === typedHome.property_id}
          >
            <img
              src={typedHome.isSaved ? SavedIcon : UnsavedIcon}
              alt={typedHome.isSaved ? 'Saved' : 'Save'}
              className="w-6 h-6"
            />
          </button>
        </div>
        <div className="flex flex-col flex-1 px-3 pt-2 pb-2">
          <h2
            className="line-clamp-2 min-h-[40px]"
            style={{
              fontFamily: 'DM Serif Display',
              fontWeight: 550,
              fontSize: 18,
              lineHeight: '22px',
              letterSpacing: 0.25,
              verticalAlign: 'middle',
              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              marginBottom: 2,
            }}
          >
            {typedHome.name || 'No Name'}
          </h2>
          <div className="text-[12px] text-gray-500 mb-1" style={{marginTop: 0}}>{typedHome.address}</div>
          <div
            className="text-[12px] mb-2"
            style={{ color: '#111', fontWeight: 550 }}
          >
            {typedHome.bedrooms} Bedroom(s) | {typedHome.bathrooms} Baths | {typedHome.total_sqft} Sq. Ft.
          </div>
          <div className="text-[17px] font-bold text-[#004236] mt-auto">${typedHome.selling_price?.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  // Get translated label for saved homes and sort
  const savedHomesLabel = t('navigation.savedHomes');
  const sortLabel = t('common.sort');

  return (
    <div className="container mx-auto p-4 pt-6">
      {/* Mobile Header with Burger Icon (Sticky) */}
      {isMobile && (
        <div className="flex items-center mb-4 sticky top-0 z-30 bg-white" style={{ minHeight: 48 }}>
          <button className="mr-2" onClick={() => setMenuOpen(true)}>
            <Menu size={28} />
          </button>
          <h1 className="text-xl font-bold text-[#004236]">{savedHomesLabel as string}</h1>
        </div>
      )}
      {/* Mobile Menu Components */}
      {isMobile && (
        <>
          {isAgent && <MobileAgentMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
          {isBuyer && <MobileBuyerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
          {!isAgent && !isBuyer && (
            <MobileMenu
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              isLoggedIn={!!authData?.user}
              userType={authData?.user?.user_type}
            />
          )}
        </>
      )}
      {/* Header and Info Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
        <div>
          <div className="text-xs md:text-sm text-gray-700">
            <span className="font-bold">{totalCount}</span> {typeof savedHomesLabel === 'string' ? savedHomesLabel.toLowerCase() : ''}
            <br />
            <span className="text-gray-400">{homes.length ? '' : 'No saved homes found.'}</span>
          </div>
        </div>
        {/* REMOVE the h1 heading here */}
        {/* <h1 className="text-2xl md:text-3xl font-bold text-[#004236] mb-1">{savedHomesLabel as string}</h1> */}
        <div className="flex items-center md:justify-end mt-2 md:mt-0">
          <span className="text-xs md:text-sm font-semibold text-gray-700 mr-1">{sortLabel as string}:</span>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              id="sort-select"
              value={sortOption}
              onChange={e => {
                setHomes([]); setPage(1); setHasMore(true); setSortOption(e.target.value as 'all' | 'high' | 'low');
              }}
              sx={{
                fontSize: { xs: 12, md: 14 },
                fontWeight: 600,
                color: '#16634a',
                background: 'white',
                borderRadius: 1,
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007E67' },
                '.MuiSvgIcon-root': { color: '#007E67' },
              }}
            >
              <MenuItem value="all">Showing all</MenuItem>
              <MenuItem value="high">Price high to low</MenuItem>
              <MenuItem value="low">Price low to high</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
      {/* Cards Grid */}
      {isMobile ? (
        <div className="w-full">
          {sortedHomes.map((home, idx) => (
            <MobileCard
              key={home.property_id || idx}
              home={{ ...home, isSaved: home.isSaved ?? true }}
              refProp={sortedHomes.length === idx + 1 && hasMore ? lastHomeRef : undefined}
              idx={idx}
            />
          ))}
          {/* Show skeletons on initial load or on scroll */}
          {loading && page === 1 && <SavedHomeListSkeletonMobile />}
          {loading && page > 1 && <div className="mt-4"><SavedHomeListSkeletonMobile /></div>}
          {!hasMore && homes.length === 0 && !loading && <div className="text-center py-4 text-gray-400">No saved homes.</div>}
        </div>
      ) : (
        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-1 gap-y-6" style={{ paddingBottom: 30 }}>
            {sortedHomes.map((home, idx) => (
              <DesktopCard
                key={home.property_id || idx}
                home={{ ...home, isSaved: home.isSaved ?? true }}
                refProp={sortedHomes.length === idx + 1 && hasMore ? lastHomeRef : undefined}
                idx={idx}
              />
            ))}
            {/* Show skeletons as continuation in the same row */}
            {loading && page > 1 && (() => {
              const cols = 4;
              const remainder = homes.length % cols;
              const skeletonsToShow = remainder === 0 ? cols : cols - remainder;
              return Array.from({ length: skeletonsToShow }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="bg-white rounded-[10px] shadow-md relative flex flex-col border border-gray-200 animate-pulse"
                  style={{ width: 303, height: 315, minWidth: 303, maxWidth: 303 }}
                >
                  <div className="relative">
                    <div className="w-full h-[160px] bg-gray-200 rounded-t-[10px] rounded-b-none" />
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <div className="bg-white rounded-full p-1 shadow border border-gray-200 w-8 h-8 flex items-center justify-center">
                        <div className="w-6 h-6 bg-gray-300 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 px-3 pt-2 pb-2">
                    <div className="h-[40px] w-3/4 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded mb-2" />
                    <div className="h-6 w-1/2 bg-gray-200 rounded mt-auto" />
                  </div>
                </div>
              ));
            })()}
          </div>
          {/* Show skeletons on initial load or on scroll */}
          {loading && page === 1 && <SavedHomeListSkeleton />}
          {!hasMore && homes.length === 0 && !loading && <div className="col-span-4 text-center py-4 text-gray-400">No saved homes.</div>}
        </div>
      )}
      {/* Minimal Custom Unsave Modal */}
      {confirmUnsave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200 animate-fadein">
          <div className="bg-white rounded-2xl p-8 z-10 max-w-sm w-full mx-auto shadow-2xl relative" style={{ animation: 'scalein 0.25s cubic-bezier(.4,2,.6,1)' }}>
            <div className="text-lg font-bold mb-2">Are you sure you want to unsave the property?</div>
            <div className="mb-4 text-gray-600">This property will be removed from your saved homes.</div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-5 py-2 rounded-2xl font-semibold text-green-700 bg-white hover:bg-green-50 transition"
                onClick={() => setConfirmUnsave(null)}
              >
                No
              </button>
              <button
                className="px-5 py-2 rounded-2xl font-semibold text-white transition shadow"
                style={{
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                  boxShadow: '5px 5px 5px 0px #FFF49233 inset, -5px -5px 10px 0px #FFB86726 inset, 10px 10px 10px 0px #0C656E1A',
                }}
                onClick={async () => {
                  if (confirmUnsave) {
                    setConfirmUnsave(null); // Close immediately
                    await doToggleSave(confirmUnsave.propertyId, confirmUnsave.idx, false);
                  }
                }}
              >
                Yes
              </button>
            </div>
          </div>
          <style>{`
            @keyframes scalein {
              0% { transform: scale(0.85); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-fadein { animation: fadein 0.2s; }
            @keyframes fadein {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
      {/* <ServiceSection /> */}
      
      {/* Footer Navigation */}
      {isMobile && <BuyerFooterNav />}
    </div>
  );
};

export default SavedHomes;