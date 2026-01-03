import React, { useEffect, useState, useRef, useCallback } from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import { useNavigate } from 'react-router-dom';
import { fetchAgentVRHomes } from '../../../utils/api';
// import { ARVRPlaceholderIcon } from '../../../assets/icons/MediaMainIcons';
import AgentPropertyListSkeleton from '../../agent/properties/AgentPropertyListSkeleton';
import editIcon from '../../../assets/images/edit-icon.svg';
import AgentFooterNav from '../../../components/AgentFooterNav';
import MobileAgentMenu from '../../../components/MobileAgentMenu';
import { Menu } from 'lucide-react';

// VR Home type based on API response
type VRHome = {
  property_id: string;
  main_photo_url: string;
  property_name: string;
  beds: number;
  baths: number;
  total_sqft: number;
  address: string;
  posted_on_date: string;
  status: string;
};

// Desktop 3D Home Card
const Desktop3DHomeCard = ({ home }: { home: VRHome }) => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 12, padding: 10, marginBottom: 24, background: '#fff', boxShadow: '0 1px 4px #0001' }}>
      <img src={home.main_photo_url} alt={home.property_name} style={{ width: 210, height: 208, borderRadius: 10, objectFit: 'cover', marginRight: 24 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 4 }}>{home.property_name}</div>
        <div style={{ color: '#7C7C7C', fontSize: 15, marginBottom: 4 }}>{home.address}</div>
        <div style={{ color: '#222', fontSize: 16, marginBottom: 4 }}>
          {home.beds}BHK &nbsp;|&nbsp; {home.baths} Bathrooms &nbsp;|&nbsp; {home.total_sqft ? home.total_sqft.toLocaleString() : 'N/A'} Sq. Ft.
        </div>
        <div style={{ color: '#7C7C7C', fontStyle: 'italic', fontSize: 14, marginBottom: 0 }}>Posted on {home.posted_on_date}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, minWidth: 120 }}>
        <span style={{ background: '#A6F4C5', color: '#00916A', fontWeight: 600, fontSize: 16, borderRadius: 8, padding: '4px 18px', marginBottom: 8 }}>Active</span>
        <button onClick={() => navigate(`/agent/homes3d/${home.property_id}/edit`)} style={{ display: 'flex', alignItems: 'center', border: '1px solid #D1D5DB', borderRadius: 8, padding: '8px 18px', background: '#fff', color: '#00916A', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
          <img src={editIcon} alt="Edit" style={{ width: 20, height: 20, marginRight: 6 }} />
          Edit
        </button>
      </div>
    </div>
  );
};

export const DesktopView3D: React.FC<{ homes: VRHome[]; onLoadMore: () => void; hasMore: boolean; loading: boolean }> = ({ homes, onLoadMore, hasMore, loading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop - clientHeight < 200) {
        onLoadMore();
      }
    };
    const ref = containerRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);
    return () => { if (ref) ref.removeEventListener('scroll', handleScroll); };
  }, [onLoadMore, loading, hasMore]);
  return (
    <div ref={containerRef} style={{ minHeight: '70vh', height: '100vh', width: '100vw', overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Desktop Header - removed for desktop, only show on mobile */}
      {isMobile && (
        <div className="w-full bg-[#007E67] text-white py-4 px-8 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-semibold">My 3D Homes</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm opacity-90">Manage your AR/VR properties</span>
            </div>
          </div>
        </div>
      )}
      <div style={{ width: '98%', maxWidth: 1600, paddingTop: '20px' }}>
        {loading && homes.length === 0 ? <AgentPropertyListSkeleton /> : homes.map(home => <Desktop3DHomeCard key={home.property_id} home={home} />)}
        {loading && homes.length > 0 && <div style={{ textAlign: 'center', padding: 24 }}>Loading...</div>}
        {!hasMore && !loading && homes.length === 0 && <div style={{ textAlign: 'center', padding: 24 }}>No 3D homes found.</div>}
      </div>
    </div>
  );
};

// Mobile 3D Home Card (pixel-perfect)
const Mobile3DHomeCard = ({ home }: { home: VRHome }) => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '0 0 24px 0', background: 'transparent' }}>
      <div style={{ fontSize: 14, color: '#7C7C7C', marginBottom: 8, fontStyle: 'italic', fontWeight: 500 }}>Posted on {home.posted_on_date}</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10, position: 'relative' }}>
        {/* Images */}
        <div style={{ display: 'flex', gap: 8 }}>
          <img
            src={home.main_photo_url}
            alt={home.property_name}
            style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover', boxShadow: '0 2px 8px #0001' }}
          />
        </div>
        {/* Active badge */}
        <span style={{ position: 'absolute', right: 0, top: 0, background: '#A6F4C5', color: '#00916A', fontWeight: 600, fontSize: 15, borderRadius: 8, padding: '4px 18px', zIndex: 2 }}>Active</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 17, color: '#222', marginBottom: 2 }}>{home.property_name}</div>
      <div style={{ color: '#7C7C7C', fontSize: 13, marginBottom: 2 }}>{home.address}</div>
      <div style={{ color: '#222', fontSize: 15, marginBottom: 8 }}>
        {home.beds}BHK &nbsp;|&nbsp; {home.baths} Bathrooms &nbsp;|&nbsp; {home.total_sqft ? home.total_sqft.toLocaleString() : 'N/A'} Sq. Ft.
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 0 }}>
        <button onClick={() => navigate(`/agent/homes3d/${home.property_id}/edit`)} style={{ display: 'flex', alignItems: 'center', border: '1px solid #D1D5DB', borderRadius: 8, padding: '7px 18px', background: '#fff', color: '#00916A', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
          <img src={editIcon} alt="Edit" style={{ width: 20, height: 20, marginRight: 6 }} />
          Edit
        </button>
      </div>
    </div>
  );
};

// For mobile skeleton, add a simple block skeleton matching the card design
const Mobile3DHomeSkeleton: React.FC = () => (
  <div style={{ padding: '0 0 24px 0', background: 'transparent' }} className="animate-pulse">
    <div style={{ fontSize: 14, color: '#7C7C7C', marginBottom: 8, fontStyle: 'italic', fontWeight: 500 }}>
      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="bg-gray-200" style={{ width: 120, height: 120, borderRadius: 12 }} />
      </div>
      <span style={{ position: 'absolute', right: 0, top: 0, background: '#A6F4C5', color: '#00916A', fontWeight: 600, fontSize: 15, borderRadius: 8, padding: '4px 18px', zIndex: 2 }}>
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </span>
    </div>
    <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
    <div className="flex justify-end items-center mb-0">
      <div className="h-8 w-24 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

export const MobileView3D: React.FC<{ homes: VRHome[]; onLoadMore: () => void; hasMore: boolean; loading: boolean; isSidebarOpen: boolean; onSidebarToggle: () => void }> = ({ homes, onLoadMore, hasMore, loading, isSidebarOpen, onSidebarToggle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop - clientHeight < 200) {
        onLoadMore();
      }
    };
    const ref = containerRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);
    return () => { if (ref) ref.removeEventListener('scroll', handleScroll); };
  }, [onLoadMore, loading, hasMore]);
  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#007E67] text-white" style={{ height: 56 }}>
        <div className="flex items-center h-full px-4">
          <button 
            onClick={onSidebarToggle}
            className="flex items-center justify-center w-10 h-10 mr-4"
          >
            <Menu size={24} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold">My AR / VR Homes</h1>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <MobileAgentMenu isOpen={isSidebarOpen} onClose={onSidebarToggle} />
      
      <div ref={containerRef} style={{ minHeight: '80vh', height: '100vh', width: '100vw', background: '#fff', padding: '16px 8px', overflowY: 'auto', paddingBottom: 72, paddingTop: 72 }}>
        {loading && homes.length === 0 ? (
          <>
            <Mobile3DHomeSkeleton />
            <Mobile3DHomeSkeleton />
            <Mobile3DHomeSkeleton />
          </>
        ) : (
          homes.map((home, idx) => (
            <React.Fragment key={home.property_id}>
              <Mobile3DHomeCard home={home} />
              {idx !== homes.length - 1 && <div style={{ borderBottom: '1px solid #E5E7EB', margin: '0 0 16px 0' }} />}
            </React.Fragment>
          ))
        )}
        {loading && homes.length > 0 && <div style={{ textAlign: 'center', padding: 24 }}>Loading...</div>}
        {!hasMore && !loading && homes.length === 0 && <div style={{ textAlign: 'center', padding: 24 }}>No 3D homes found.</div>}
      </div>
      <AgentFooterNav active="arvr" />
    </>
  );
};

// Upgrade plan flag (replace with real logic)
const upgradePlanActive = true; // TODO: Replace with real check

const Agent3DHomes: React.FC = () => {
  const isMobile = useIsMobile();
  const [homes, setHomes] = useState<VRHome[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadHomes = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetchAgentVRHomes(page, 10);
      const newHomes = res.data?.results || [];
      setHomes(prev => {
        const existingIds = new Set(prev.map(h => h.property_id));
        const deduped = [...prev];
        for (const home of newHomes) {
          if (!existingIds.has(home.property_id)) {
            deduped.push(home);
            existingIds.add(home.property_id);
          }
        }
        return deduped;
      });
      setHasMore(res.data?.has_more !== false && !!res.data?.next);
      setPage(prev => prev + 1);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    // Initial load
    if (homes.length === 0) loadHomes();
    // eslint-disable-next-line
  }, []);

  if (!upgradePlanActive) {
    // Old upgrade prompt
    return isMobile ? (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 32, alignSelf: 'flex-start' }}>My AR / VR Homes</div>
        {/* <ARVRPlaceholderIcon /> */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
          <rect x="30" y="40" width="60" height="40" rx="8" fill="#E5E7EB" />
          <path d="M60 40 L90 60 L60 80 L30 60 Z" fill="#F3F4F6" />
        </svg>
        <p style={{ color: '#00806B', fontSize: 20, margin: '32px 0 24px', textAlign: 'center' }}>
          To avail this option you need to upgrade your plan to Premium
        </p>
        <button style={{ width: '100%', background: 'linear-gradient(90deg, #006B5B 0%, #00806B 100%)', color: '#fff', fontWeight: 600, fontSize: 20, borderRadius: 12, padding: '16px 0', boxShadow: '0 6px 16px #00806B22', border: 'none', cursor: 'pointer' }}>
          Upgrade plan
        </button>
      </div>
    ) : (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 32 }}>My 3D Homes</h1>
        {/* <ARVRPlaceholderIcon /> */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
          <rect x="30" y="40" width="60" height="40" rx="8" fill="#E5E7EB" />
          <path d="M60 40 L90 60 L60 80 L30 60 Z" fill="#F3F4F6" />
        </svg>
        <p style={{ color: '#00806B', fontSize: 22, margin: '32px 0 24px', textAlign: 'center' }}>
          To avail this option you need to upgrade your plan to Premium
        </p>
        <button style={{ background: 'linear-gradient(90deg, #006B5B 0%, #00806B 100%)', color: '#fff', fontWeight: 500, fontSize: 18, borderRadius: 8, padding: '10px 32px', boxShadow: '0 4px 8px #00806B22', border: 'none', cursor: 'pointer' }}>
          Upgrade plan
        </button>
      </div>
    );
  }
  // Show 3D homes list
  return isMobile
    ? <MobileView3D 
        homes={homes} 
        onLoadMore={loadHomes} 
        hasMore={hasMore} 
        loading={loading} 
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    : <DesktopView3D homes={homes} onLoadMore={loadHomes} hasMore={hasMore} loading={loading} />;
};

export default Agent3DHomes; 