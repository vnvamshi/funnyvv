import React, { useState, useCallback } from 'react';
import { showGlobalToast } from '../utils/toast';
import ShareModal from './ShareModal';
import mobileShareIcon from '../assets/images/mobile/pd-gold-share.svg';

interface MobileShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MobileShareButton: React.FC<MobileShareButtonProps> = ({
  url,
  title = 'Check out this property on Vistaview',
  text,
  className = '',
  style,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = text || title;

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        showGlobalToast('Link shared!', 3000);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showGlobalToast('Link copied to clipboard!', 3000);
      }
    } catch (error: any) {
      showGlobalToast('Share failed', 3000);
    } finally {
      setIsSharing(false);
    }
  }, [title, shareText, shareUrl]);

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      style={style}
      className={`flex items-center justify-center gap-2 border-2 border-[#005C4B] text-[#005C4B] font-bold rounded-full py-4 bg-white shadow-sm text-lg transition-all duration-200 hover:bg-[#F8FAF9] w-full ${className} ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isSharing ? (
        <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60 20" />
        </svg>
      ) : (
        <img src={mobileShareIcon} alt="Share" className="w-6 h-6" />
      )}
      <span>Share</span>
    </button>
  );
};

export default MobileShareButton; 