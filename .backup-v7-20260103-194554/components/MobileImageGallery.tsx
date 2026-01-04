import React, { useState } from 'react';
import playBtn from './assets/images/play-btn.svg';

interface Image {
  url: string;
  caption?: string;
}

interface AgentInfo {
  name: string;
  phone?: string;
  avatarUrl?: string;
}

interface MobileImageGalleryProps {
  images: Image[];
  open: boolean;
  initialIndex?: number;
  onClose: () => void;
  agent: AgentInfo;
  onVirtualTour?: () => void;
}

const isVideo = (url: string) => /\.mp4$|\.webm$|\.ogg$/i.test(url);

const MobileImageGallery: React.FC<MobileImageGalleryProps> = ({
  images,
  open,
  initialIndex = 0,
  onClose,
  agent,
  onVirtualTour,
}) => {
  const [current, setCurrent] = useState(initialIndex);
  const [showVideo, setShowVideo] = useState(false);

  if (!open) return null;

  const goPrev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const goNext = () => setCurrent((c) => (c + 1) % images.length);

  const currImg = images[current];
  const isCurrVideo = currImg && isVideo(currImg.url);
  const hasThumb = currImg && currImg.caption;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onClose} className="text-white text-2xl font-bold p-1" aria-label="Back">
          &#8592;
        </button>
        <span className="text-white text-base font-medium">
          {images.length > 0 ? `${current + 1} of ${images.length}` : ''}
        </span>
        <div className="w-8" /> {/* Spacer for symmetry */}
      </div>
      {/* Image or Video */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl p-2"
          onClick={goPrev}
          aria-label="Previous image"
        >
          &#8592;
        </button>
        {currImg && isCurrVideo && !showVideo ? (
          hasThumb ? (
            <img
              src={currImg.caption}
              alt={`Video ${current + 1}`}
              className="max-h-[60vh] max-w-full rounded-xl object-contain bg-black"
              style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
              onClick={() => setShowVideo(true)}
            />
          ) : (
            <div
              className="flex items-center justify-center max-h-[60vh] max-w-full rounded-xl bg-gray-300"
              style={{ width: 320, height: 180, boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
              onClick={() => setShowVideo(true)}
            >
              <img src={playBtn} alt="Play" style={{ width: 48, height: 48 }} />
            </div>
          )
        ) : currImg && isCurrVideo && showVideo ? (
          <video
            src={currImg.url}
            controls
            autoPlay
            className="max-h-[60vh] max-w-full rounded-xl bg-black"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
          />
        ) : currImg ? (
          <img
            src={currImg.url}
            alt={`Photo ${current + 1}`}
            className="max-h-[60vh] max-w-full rounded-xl object-contain bg-white"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
          />
        ) : null}
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl p-2"
          onClick={goNext}
          aria-label="Next image"
        >
          &#8594;
        </button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-base opacity-80">
          Swipe left
        </div>
      </div>
      {/* Footer (Agent info and actions) */}
      <div className="sticky bottom-0 z-30 bg-white flex items-center justify-between px-4 py-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {agent.avatarUrl && <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-green-900 text-sm truncate">{agent.name}</span>
            <span className="text-xs text-gray-500 block break-all whitespace-normal">Agent</span>
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="text-xs text-gray-500 block">{agent.phone}</a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agent.phone ? (
            <a
              href={`tel:${agent.phone}`}
              className="p-2"
              style={{
                borderRadius: '10px',
                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A',
              }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          ) : (
            <button
              className="p-2 opacity-50 cursor-not-allowed"
              style={{
                borderRadius: '10px',
                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A',
              }}
              disabled
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          <button
            style={{
              borderRadius: '10px',
              border: '1px solid var(--Primary-Green, #004236)',
              color: 'var(--Primary-Green, #004236)',
              background: '#fff',
              flexShrink: 0
            }}
            className="px-3 py-2 rounded-lg flex items-center gap-1"
            onClick={onVirtualTour}
          >
            <span className="inline-block align-middle">&#127909;</span> {/* Camera emoji as placeholder */}
            Virtual Tour
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileImageGallery; 