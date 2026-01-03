import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import virtualTourBtn from '../../assets/images/v-tour-btn.svg';
import pdBed from '../../assets/images/pd-bed.svg';
import pdScale from '../../assets/images/pd-scale.svg';
import pdGym from '../../assets/images/pd-gym.svg';
import pdViewMap from '../../assets/images/pd-view-map.svg';
import pdBathroom from '../../assets/images/pd-bathrooms.svg';

// Placeholder icons (replace with your SVGs if available)
const locationIcon = (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0118 11c0 4.314-6 10-6 10z" stroke="#222" strokeWidth="2" /><circle cx="12" cy="11" r="2.5" stroke="#222" strokeWidth="2" /></svg>
);
const checkIcon = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="18" height="18" rx="4" fill="#007E67" /><path d="M5 9.5l3.5 3.5L13 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export type SimilarListing = {
  property_id: string;
  name: string;
  main_image: string;
  address: string;
  distance_km: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
};

interface Props {
  listings?: SimilarListing[];
}

const SimilarListingsCarousel: React.FC<Props> = ({ listings }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const CARD_WIDTH = 587 + 32; // card width + gap
  const VISIBLE_CARDS = 2; // adjust for responsiveness if needed
  const navigate = useNavigate();

  if (!listings || listings.length === 0) return null;

  const maxIndex = Math.max(0, listings.length - VISIBLE_CARDS);

  const scroll = (dir: 'left' | 'right') => {
    setScrollIndex(idx => {
      if (dir === 'left') return Math.max(0, idx - 1);
      return Math.min(maxIndex, idx + 1);
    });
  };

  return (
    <div className="w-screen bg-[#EAF3F0] py-10 px-8 relative left-1/2 -translate-x-1/2" style={{ position: 'relative' }}>
      <div className="flex items-center mb-2">
        <span className="tracking-[0.2em] text-[#B0B7B1] font-semibold text-[15px] mr-6">PROPERTIES</span>
        <div className="flex-1 border-t border-[#D9E3DF]" />
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[34px] font-semibold text-black leading-tight">Similar Listings</h2>
        <div className="flex gap-4">
          <button
            className="w-12 h-12 rounded-full bg-[#E6ECEA] flex items-center justify-center shadow hover:bg-[#d1e0db] transition"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            disabled={scrollIndex === 0}
            style={{ opacity: scrollIndex === 0 ? 0.5 : 1 }}
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#E6ECEA" /><path d="M14.5 8l-4 4 4 4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button
            className="w-12 h-12 rounded-full bg-[#E6ECEA] flex items-center justify-center shadow hover:bg-[#d1e0db] transition"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            disabled={scrollIndex === maxIndex}
            style={{ opacity: scrollIndex === maxIndex ? 0.5 : 1 }}
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#E6ECEA" /><path d="M9.5 8l4 4-4 4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      <div
        className="flex gap-8 overflow-hidden pb-2 relative"
        style={{ scrollBehavior: 'smooth', width: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            gap: 32,
            transform: `translateX(-${scrollIndex * CARD_WIDTH}px)` ,
            transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
            willChange: 'transform',
          }}
        >
          {listings.map((listing, idx) => (
            <div
              key={listing.property_id}
              className="bg-white rounded-[20px] flex-shrink-0 flex flex-row items-stretch border border-[#E6ECEA]"
              style={{ width: 587, height: 219, boxShadow: '0px 4px 20px 0px #0000000F' }}
            >
              <img
                src={listing.main_image}
                alt={listing.name}
                className="object-cover rounded-l-[20px]"
                style={{ width: 219, height: 219 }}
              />
              <div className="flex flex-col flex-1 p-4 relative" style={{ minWidth: 0, justifyContent: 'center' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-[17px] text-[#222] leading-tight truncate" style={{ maxWidth: 180 }}>{listing.name}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                    className="text-[#222] text-[13px] flex items-center gap-1"
                    style={{ fontWeight: 500 }}
                    target="_blank" rel="noopener noreferrer"
                  >
                    <img src={pdViewMap} alt="View on Map" style={{ width: 16, height: 16 }} />
                    <span className="whitespace-nowrap">View on Map</span>
                  </a>
                </div>
                <div className="text-[#757575] text-[13px] mb-1" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{listing.address}</div>
                <div className="flex items-center gap-2 text-[#222] text-[13px] mb-2">
                  <span className="bg-[#EDF4FF] px-2 py-0.5 flex items-center gap-1 text-[#222] text-[13px] font-medium" style={{ borderRadius: 100 }}>
                    {locationIcon}
                    <span className="truncate">{listing.distance_km.toFixed(2)} km away</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-[#50505014] px-2 py-0.5 flex items-center gap-1 text-[#757575] text-[13px] font-medium" style={{ borderRadius: 100 }}>
                    <img src={pdBed} alt="Bedroom(s)" style={{ width: 18, height: 18 }} />
                    {listing.bedrooms} Bedroom(s)
                  </span>
                  <span className="bg-[#50505014] px-2 py-0.5 flex items-center gap-1 text-[#757575] text-[13px] font-medium" style={{ borderRadius: 100 }}>
                    <img src={pdScale} alt="Sq. Ft." style={{ width: 18, height: 18 }} />
                    {listing.sqft ? listing.sqft.toLocaleString() : 'N/A'} Sq. Ft.
                  </span>
                  <span className="bg-[#50505014] px-2 py-0.5 flex items-center gap-1 text-[#757575] text-[13px] font-medium" style={{ borderRadius: 100 }}>
                    <img src={pdBathroom} alt="Baths" style={{ width: 18, height: 18 }} />
                    {listing.bathrooms} Baths
                  </span>
                </div>
                <div className="flex gap-2 mt-auto justify-start">
                  <button
                    type="button"
                    className="text-white rounded-[8px] py-1.5 text-center shadow transition flex items-center justify-center gap-1 text-[15px]"
                    style={{ minWidth: 0, width: 120, background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                    aria-label="Virtual Tour"
                  >
                    <img src={virtualTourBtn} alt="Virtual Tour" style={{ width: 18, height: 18, marginRight: 6 }} />
                    Virtual Tour
                  </button>
                  <div
                    className="p-[1px] rounded-[8px]"
                    style={{
                      background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                      display: 'inline-block',
                    }}
                  >
                    <button
                      type="button"
                      className="text-[#222] py-1.5 w-[120px] text-[15px] text-center bg-white rounded-[8px] hover:bg-[#f6e27a1a] transition"
                      aria-label="See Property"
                      onClick={() => navigate(`/property/${listing.property_id}`)}
                    >
                      See Property
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SimilarListingsCarousel; 