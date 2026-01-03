import React, { useState, useEffect } from 'react';
import groupIcon from '../assets/images/modal-group.svg';
import singleIcon from '../assets/images/modal-single.svg';
import videoIcon from '../assets/images/modal-video button.svg';
import vtourIcon from '../assets/images/modal-vtour.svg';
import floorplanIcon from '../assets/images/modal-floorplan.svg';
import playBtn from '../assets/images/play-btn.svg';
import ModalCloseButton from './ModalCloseButton';

interface Image {
  url: string;
  caption?: string;
}

interface ImageGalleryModalProps {
  images: Image[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
  children?: React.ReactNode;
  onRequestMediaType?: (mediaType: 'photos' | 'videos' | 'floorplans' | 'vtour') => void;
  currentMediaType?: 'photos' | 'videos' | 'floorplans' | 'vtour';
  loading?: boolean;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  open,
  onClose,
  initialIndex = 0,
  children,
  onRequestMediaType,
  currentMediaType = 'photos',
  loading = false,
}) => {
  // Show group view by default
  const [fullscreen, setFullscreen] = useState(false);
  const [current, setCurrent] = useState(initialIndex);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Open/close animation logic
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setCurrent(initialIndex);
      setFullscreen(false); // Always show group view first
    }
  }, [open, initialIndex]);

  // Reset current index if images array changes and current is out of bounds
  useEffect(() => {
    if (current >= images.length) {
      setCurrent(0);
    }
  }, [images.length, current]);

  // Keyboard navigation
  useEffect(() => {
    if (!shouldRender) return;
    const handleKey = (e: KeyboardEvent) => {
      if (!fullscreen) return;
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % images.length);
      if (e.key === 'ArrowLeft') setCurrent(c => (c - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreen, images.length, onClose, shouldRender]);

  if (!shouldRender) return null;

  const currentImage = images[current];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
    >
      {/* Right-side vertical button group */}
      <ModalCloseButton
        onClick={onClose}
        ariaLabel="Close gallery"
        // Keep the close button above loading/error overlays (often rendered at z-50 by callers).
        className="absolute top-6 right-8 z-[60]"
      />

      <div className="absolute top-20 right-8 flex flex-col items-center gap-4 z-20">
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-lg border border-white ${!fullscreen ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}
          onClick={() => setFullscreen(false)}
          aria-label="Grid view"
        >
          <img src={groupIcon} alt="Group" className="w-6 h-6" />
        </button>
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-lg border border-white ${fullscreen ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}
          onClick={() => setFullscreen(true)}
          aria-label="Single view"
        >
          <img src={singleIcon} alt="Single" className="w-6 h-6" />
        </button>
        <button
          className={`w-36 h-12 flex items-center gap-2 rounded-lg border border-white bg-white/10 px-3 ${currentMediaType === 'videos' ? 'ring-2 ring-white' : ''}`}
          style={{ minWidth: 120 }}
          onClick={() => onRequestMediaType && onRequestMediaType('videos')}
        >
          <img src={videoIcon} alt="Video" className="w-6 h-6" />
          <span className="text-white font-medium text-base">Video</span>
        </button>
        <button
          className={`w-36 h-12 flex items-center gap-2 rounded-lg border border-white bg-white/10 px-3 ${currentMediaType === 'vtour' ? 'ring-2 ring-white' : ''}`}
          style={{ minWidth: 120 }}
          onClick={() => onRequestMediaType && onRequestMediaType('vtour')}
        >
          <img src={vtourIcon} alt="V Tour" className="w-6 h-6" />
          <span className="text-white font-medium text-base">V Tour</span>
        </button>
        <button
          className={`w-36 h-12 flex items-center gap-2 rounded-lg border border-white bg-white/10 px-3 ${currentMediaType === 'floorplans' ? 'ring-2 ring-white' : ''}`}
          style={{ minWidth: 120 }}
          onClick={() => onRequestMediaType && onRequestMediaType('floorplans')}
        >
          <img src={floorplanIcon} alt="Floor plan" className="w-6 h-6" />
          <span className="text-white font-medium text-base">Floor plan</span>
        </button>
      </div>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
          <div className="text-white text-lg animate-pulse">Loading...</div>
        </div>
      )}
      {/* If images are empty, show children (spinner/error) or fallback */}
      {images.length === 0 ? (
        children || (
          <div className="flex items-center justify-center w-full h-full text-white text-lg">No images available.</div>
        )
      ) : fullscreen ? (
        <div className="flex flex-col items-center w-full max-w-4xl">
          <div className="relative w-full flex items-center justify-center">
            {/* Prev */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl z-10"
              onClick={() => setCurrent(c => (c - 1 + images.length) % images.length)}
              aria-label="Previous image"
            >
              &#8592;
            </button>
            {/* Media: video or image */}
            {currentImage && currentMediaType === 'videos' ? (
              <video
                src={currentImage.url}
                controls
                className="rounded-2xl object-contain max-h-[70vh] max-w-full bg-black"
                style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
                poster={undefined}
                preload="none"
              />
            ) : currentImage ? (
              <img
                src={currentImage.url}
                alt={`Photo ${current + 1}`}
                className="rounded-2xl object-contain max-h-[70vh] max-w-full bg-white"
                style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
                loading="lazy"
              />
            ) : null}
            {/* Next */}
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl z-10"
              onClick={() => setCurrent(c => (c + 1) % images.length)}
              aria-label="Next image"
            >
              &#8594;
            </button>
          </div>
          {/* Show current index out of total */}
          <div className="mt-4 flex flex-col items-center">
            <span className="text-white/80 text-base">{images.length > 0 ? `${current + 1} / ${images.length}` : ''}</span>
          </div>
        </div>
      ) : (
        // Grid view
        <div className="w-full max-w-5xl grid grid-cols-4 gap-6 p-8 relative">
          {/* Total count on top */}
          <div className="absolute left-0 right-0 top-0 flex justify-center z-10">
            <span className="text-white text-lg font-semibold bg-black/30 rounded-full px-4 py-1 mt-[-32px]">
              {images.length} {(() => {
                switch (currentMediaType) {
                  case 'photos': return images.length === 1 ? 'Photo' : 'Photos';
                  case 'videos': return images.length === 1 ? 'Video' : 'Videos';
                  case 'floorplans': return images.length === 1 ? 'Floor Plan' : 'Floor Plans';
                  case 'vtour': return images.length === 1 ? 'V Tour' : 'V Tours';
                  default: return '';
                }
              })()}
            </span>
          </div>
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
              className="aspect-square bg-white/10 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-white group relative"
              onClick={() => { setCurrent(idx); setFullscreen(true); }}
              aria-label={`View ${currentMediaType === 'videos' ? 'video' : 'image'} ${idx + 1}`}
            >
              {currentMediaType === 'videos' ? (
                <>
                  {img.caption ? (
                    <img
                      src={img.caption}
                      alt={`Video ${idx + 1}`}
                      className="object-cover w-full h-full group-hover:scale-105 transition bg-black"
                      loading="lazy"
                      style={{ minHeight: 0, minWidth: 0 }}
                      onError={e => { (e.target as HTMLImageElement).src = playBtn; }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-300">
                      <img src={playBtn} alt="Play" style={{ width: 48, height: 48 }} />
                    </div>
                  )}
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.45)" />
                      <polygon points="20,16 34,24 20,32" fill="#fff" />
                    </svg>
                  </div>
                  {/* Hidden video for lazy load */}
                  <video src={img.url} style={{ display: 'none' }} preload="none" />
                </>
              ) : (
                <img src={img.url} alt={`Photo ${idx + 1}`} className="object-cover w-full h-full group-hover:scale-105 transition" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryModal; 