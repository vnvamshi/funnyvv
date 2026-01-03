import React, { useState, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { TranslationKeys } from '../types/i18n';
import useIsMobile from '../hooks/useIsMobile';
import { showGlobalToast } from '../utils/toast';
import ShareModal from './ShareModal';

// Import share icons
import desktopShareIcon from '../assets/images/gold-share.svg';
import mobileShareIcon from '../assets/images/mobile/pd-gold-share.svg';
import greenShareIcon from '../assets/images/green-share.svg';

interface ShareButtonProps {
  /**
   * The URL to share. If not provided, will use current window location
   */
  url?: string;
  /**
   * The title of the content being shared
   */
  title?: string;
  /**
   * Additional text description for the shared content
   */
  text?: string;
  /**
   * Custom CSS classes for styling
   */
  className?: string;
  /**
   * Custom inline styles
   */
  style?: React.CSSProperties;
  /**
   * Whether to show the button text (default: true)
   */
  showText?: boolean;
  /**
   * Custom button text (default: uses translation)
   */
  buttonText?: string;
  /**
   * Size variant for the button
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Variant style for the button
   */
  variant?: 'outline' | 'filled' | 'icon-only' | 'original' | 'minimal' | 'green' | 'edit-style';
  /**
   * Callback function called when share is successful
   */
  onShareSuccess?: () => void;
  /**
   * Callback function called when share fails
   */
  onShareError?: (error: string) => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title = 'Check out this property on Vistaview',
  text,
  className = '',
  style,
  showText = true,
  buttonText,
  size = 'medium',
  variant = 'outline',
  onShareSuccess,
  onShareError,
}) => {
  const { t } = useTranslations();
  const isMobile = useIsMobile();
  const [isSharing, setIsSharing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Get the share URL - use provided URL or current location
  const shareUrl = url || window.location.href;
  
  // Get the share text - use provided text or default title
  const shareText = text || title;

  // Get appropriate icon based on device
  const shareIcon = isMobile ? mobileShareIcon : desktopShareIcon;

  // Size classes
  const sizeClasses = {
    small: {
      button: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    medium: {
      button: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    },
    large: {
      button: 'px-6 py-3 text-lg',
      icon: 'w-6 h-6',
      text: 'text-lg'
    }
  };

  // Variant classes
  const variantClasses = {
    outline: 'border border-[#D1D5DB] text-[#00916A] bg-white hover:bg-[#F0FDF4] transition-all',
    filled: 'bg-[#00916A] text-white hover:bg-[#007E67] transition-all',
    'icon-only': 'border border-[#D1D5DB] text-[#00916A] bg-white hover:bg-[#F0FDF4] transition-all p-2',
    original: 'flex items-center gap-1 border px-4 py-2 rounded-lg text-green-900 border-green-200',
    minimal: 'flex items-center gap-2 bg-transparent p-0 m-0 border-0 shadow-none text-black font-normal',
    green: 'flex items-center gap-1 border px-4 py-2 rounded-lg text-green-900 border-green-200 font-normal',
    'edit-style': 'flex items-center gap-2 border-[2px] border-[#004236] px-2 py-2 rounded-lg text-black bg-white hover:bg-[#F0FDF4] transition-all text-[15px] font-normal w-[90px] justify-center',
  };

  const handleShare = useCallback(async () => {
    // For desktop users, show the share modal
    if (!isMobile) {
      setShowModal(true);
      return;
    }

    setIsSharing(true);
    
    try {
      // Check if native sharing is available (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        showGlobalToast(t('common.shareSuccess' as TranslationKeys), 3000);
        onShareSuccess?.();
      } else {
        // Fallback for mobile devices without native sharing
        await navigator.clipboard.writeText(shareUrl);
        showGlobalToast(t('common.linkCopied' as TranslationKeys), 3000);
        onShareSuccess?.();
      }
    } catch (error: any) {
      console.error('Share failed:', error);
      
      // If clipboard fails, try alternative method
      if (error.name === 'NotAllowedError' || error.name === 'TypeError') {
        try {
          // Fallback: create temporary input element
          const tempInput = document.createElement('input');
          tempInput.value = shareUrl;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          
          showGlobalToast(t('common.linkCopied' as TranslationKeys), 3000);
          onShareSuccess?.();
        } catch (fallbackError) {
          console.error('Fallback copy failed:', fallbackError);
          showGlobalToast(t('common.shareError' as TranslationKeys), 3000);
          onShareError?.(t('common.shareError' as TranslationKeys));
        }
      } else {
        showGlobalToast(t('common.shareError' as TranslationKeys), 3000);
        onShareError?.(t('common.shareError' as TranslationKeys));
      }
    } finally {
      setIsSharing(false);
    }
  }, [url, title, text, isMobile, shareUrl, shareText, t, onShareSuccess, onShareError]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  // Get button text
  const getButtonText = () => {
    if (buttonText) return buttonText;
    if (!showText) return '';
    if (variant === 'original' || variant === 'minimal') return 'Share';
    if (variant === 'green') return 'Share';
    return t('property.details.share' as TranslationKeys);
  };

  // Icon only variant
  if (variant === 'icon-only') {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={isSharing}
          style={style}
          className={`
            ${variantClasses[variant]}
            ${sizeClasses[size].icon}
            rounded-lg flex items-center justify-center
            ${className}
            ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={t('property.details.share' as TranslationKeys)}
          aria-label={t('property.details.share' as TranslationKeys)}
        >
          {isSharing ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60 20" />
            </svg>
          ) : (
            <img src={shareIcon} alt="Share" className="w-full h-full" />
          )}
        </button>
        
        {/* Share Modal for desktop */}
        <ShareModal
          isOpen={showModal}
          onClose={handleModalClose}
          url={shareUrl}
          title={title}
          text={text}
        />
      </>
    );
  }

  // Original variant (matches AgentPropertyListingDetails design)
  if (variant === 'original') {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={isSharing}
          style={style}
          className={`
            ${variantClasses[variant]}
            ${className}
            ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isSharing ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60 20" />
            </svg>
          ) : (
            <img src={shareIcon} alt="Share" className="w-4 h-4" />
          )}
          <span>{isSharing ? t('common.sharing' as TranslationKeys) : getButtonText()}</span>
        </button>
        
        {/* Share Modal for desktop */}
        <ShareModal
          isOpen={showModal}
          onClose={handleModalClose}
          url={shareUrl}
          title={title}
          text={text}
        />
      </>
    );
  }

  // Minimal variant (matches provided image)
  if (variant === 'minimal') {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={isSharing}
          style={{ background: 'transparent', border: 0, padding: 0, margin: 0, ...style }}
          className={
            variantClasses[variant] +
            ' focus:outline-none' +
            (className ? ' ' + className : '') +
            (isSharing ? ' opacity-50 cursor-not-allowed' : '')
          }
          title={t('property.details.share' as TranslationKeys)}
          aria-label={t('property.details.share' as TranslationKeys)}
        >
          {isSharing ? (
            <svg className="animate-spin" width={24} height={24} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60 20" />
            </svg>
          ) : (
            <img src={desktopShareIcon} alt="Share" style={{ width: 24, height: 24, display: 'inline-block', verticalAlign: 'middle' }} />
          )}
          <span style={{ color: '#222', fontWeight: 400, fontSize: 18, marginLeft: 8, verticalAlign: 'middle', fontFamily: 'inherit' }}>{getButtonText()}</span>
        </button>
        <ShareModal
          isOpen={showModal}
          onClose={handleModalClose}
          url={shareUrl}
          title={title}
          text={text}
        />
      </>
    );
  }

  // Green variant (matches edit button style)
  if (variant === 'green') {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={isSharing}
          style={style}
          className={
            variantClasses[variant] +
            (className ? ' ' + className : '') +
            (isSharing ? ' opacity-50 cursor-not-allowed' : '')
          }
          title={t('property.details.share' as TranslationKeys)}
          aria-label={t('property.details.share' as TranslationKeys)}
        >
          {isSharing ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60 20" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
              <defs>
                <linearGradient id="shareGreen0" x1="23.9805" y1="11.083" x2="33.2305" y2="11.083" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#004236" />
                  <stop offset="1" stopColor="#007E67" />
                </linearGradient>
                <linearGradient id="shareGreen1" x1="5.48047" y1="19.791" x2="14.7305" y2="19.791" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#004236" />
                  <stop offset="1" stopColor="#007E67" />
                </linearGradient>
                <linearGradient id="shareGreen2" x1="23.9805" y1="28.499" x2="33.2305" y2="28.499" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#004236" />
                  <stop offset="1" stopColor="#007E67" />
                </linearGradient>
                <linearGradient id="shareGreen3" x1="14.3115" y1="19.7903" x2="24.3323" y2="19.7903" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#004236" />
                  <stop offset="1" stopColor="#007E67" />
                </linearGradient>
              </defs>
              <path d="M33.2305 11.083C33.2305 13.7064 31.1599 15.833 28.6055 15.833C26.0511 15.833 23.9805 13.7064 23.9805 11.083C23.9805 8.45966 26.0511 6.33301 28.6055 6.33301C31.1599 6.33301 33.2305 8.45966 33.2305 11.083Z" stroke="url(#shareGreen0)" strokeWidth="1.99861" />
              <path d="M14.7305 19.791C14.7305 22.4144 12.6598 24.541 10.1055 24.541C7.55116 24.541 5.48047 22.4144 5.48047 19.791C5.48047 17.1676 7.55116 15.041 10.1055 15.041C12.6598 15.041 14.7305 17.1676 14.7305 19.791Z" stroke="url(#shareGreen1)" strokeWidth="1.99861" />
              <path d="M33.2305 28.499C33.2305 31.1224 31.1599 33.249 28.6055 33.249C26.0511 33.249 23.9805 31.1224 23.9805 28.499C23.9805 25.8756 26.0511 23.749 28.6055 23.749C31.1599 23.749 33.2305 25.8756 33.2305 28.499Z" stroke="url(#shareGreen2)" strokeWidth="1.99861" />
              <path d="M14.3115 17.8107L24.3323 13.0615M14.3115 21.7699L24.3323 26.5191" stroke="url(#shareGreen3)" strokeWidth="1.99861" />
            </svg>
          )}
          <span className="ml-1" style={{ color: '#00916A', fontWeight: 400, fontSize: 16 }}>{getButtonText()}</span>
        </button>
        <ShareModal
          isOpen={showModal}
          onClose={handleModalClose}
          url={shareUrl}
          title={title}
          text={text}
        />
      </>
    );
  }

  // Edit-style variant (exactly matches edit button design)
  if (variant === 'edit-style') {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={isSharing}
          style={style}
          className={
            variantClasses[variant] +
            (className ? ' ' + className : '') +
            (isSharing ? ' opacity-50 cursor-not-allowed' : '')
          }
          title={t('property.details.share' as TranslationKeys)}
          aria-label={t('property.details.share' as TranslationKeys)}
        >
          {isSharing ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60 20" />
            </svg>
          ) : (
            <img src={greenShareIcon} alt="Share" className="w-5 h-5" />
          )}
          <span>Share</span>
        </button>
        <ShareModal
          isOpen={showModal}
          onClose={handleModalClose}
          url={shareUrl}
          title={title}
          text={text}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isSharing}
        style={style}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size].button}
          rounded-lg flex items-center gap-2 font-semibold justify-center
          ${className}
          ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isSharing ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60 20" />
          </svg>
        ) : (
          <img src={shareIcon} alt="Share" className={sizeClasses[size].icon} />
        )}
        {getButtonText() && (
          <span className={sizeClasses[size].text}>
            {isSharing ? t('common.sharing' as TranslationKeys) : getButtonText()}
          </span>
        )}
      </button>
      
      {/* Share Modal for desktop */}
      <ShareModal
        isOpen={showModal}
        onClose={handleModalClose}
        url={shareUrl}
        title={title}
        text={text}
      />
    </>
  );
};

export default ShareButton; 