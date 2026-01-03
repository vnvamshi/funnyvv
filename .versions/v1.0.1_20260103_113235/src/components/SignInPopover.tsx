import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebookF } from 'react-icons/fa6';
import savedHomesIcon from '../assets/images/v3.2/saved-homes-menuicon.png';
import myOrderIcon from '../assets/images/v3.2/myorder-menuicon.png';
import subscriptionIcon from '../assets/images/v3.2/subscription-menuicon.png';
import accountIcon from '../assets/images/v3.2/account-menuicon.png';
import { useAuth } from '../contexts/AuthContext';
import { CryptoStorage } from '../utils/storage';
import { AccountSettingsIcon, MySubscriptionsIcon, SignOutIcon } from '../assets/icons/ProfileMenuIcons';
import { showGlobalToast } from '../utils/toast';
import WebLogin from '../pages/auth/WebLogin';

interface SignInPopoverProps {
  buttonLabel?: string;
  buttonClassName?: string;
  align?: 'left' | 'right';
  onSignInClick?: () => void;
  onCreateAccountClick?: () => void;
  onProfessionalLoginClick?: () => void;
}

const SignInPopover: React.FC<SignInPopoverProps> = ({
  buttonLabel = 'Sign in',
  buttonClassName = 'gold-gradient-btn',
  align = 'right',
  onSignInClick,
  onCreateAccountClick,
  onProfessionalLoginClick,
}) => {
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const { isLoggedIn, user, setIsLoggedIn, setUser } = useAuth();

  // Safely derive display name from auth context or localStorage without crashing on invalid JSON
  let localStorageDisplayName = '';
  if (typeof window !== 'undefined') {
    const rawAuth = localStorage.getItem('authentication');
    if (rawAuth) {
      try {
        const parsed = JSON.parse(rawAuth);
        localStorageDisplayName = parsed?.user_name || parsed?.email || '';
      } catch {
        // Ignore invalid JSON (e.g., encrypted or legacy format)
        localStorageDisplayName = '';
      }
    }
  }

  const displayName =
    user?.user_name ||
    user?.email ||
    localStorageDisplayName ||
    'User';
  const isAgent = user?.user_type === 'agent';

  React.useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const handlePrimarySignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSignInClick) onSignInClick();
    setOpen(false);
  };

  const handleCreateAccount = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCreateAccountClick) onCreateAccountClick();
    setOpen(false);
  };

  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Clear authentication data
    setIsLoggedIn(false);
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authentication');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Clear CryptoStorage
    CryptoStorage.remove('authentication');
    localStorage.clear();
    showGlobalToast('Signed out successfully', 3000);
    setOpen(false);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleTriggerClick}
        className={buttonClassName}
      >
        <span className="font-medium text-sm" style={{ color: 'rgba(0, 66, 54, 1)' }}>{isLoggedIn ? `Hi, ${displayName?.split('@')[0]}` : buttonLabel}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className={`absolute mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-4 z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={(e) => { e.stopPropagation(); }}
        >
          {!isLoggedIn ? (
            <>
              <div className="mb-2">
                <button type="button" onClick={handlePrimarySignIn} className="settings-gradient-btn full-width height-40">
                  Sign in
                </button>
              </div>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-[12px] text-gray-500 whitespace-nowrap">OR SIGN IN WITH</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <div className="flex items-center justify-center gap-4 mb-2">
                <button type="button" aria-label="Sign in with Google" className="w-10 h-10 rounded-full border border-gray-200 inline-flex items-center justify-center hover:bg-gray-50">
                  <FcGoogle size={20} />
                </button>
                <button type="button" aria-label="Sign in with Apple" className="w-10 h-10 rounded-full border border-gray-200 inline-flex items-center justify-center hover:bg-gray-50">
                  <FaApple size={18} />
                </button>
                <button type="button" aria-label="Sign in with Facebook" className="w-10 h-10 rounded-full border border-gray-200 inline-flex items-center justify-center hover:bg-gray-50">
                  <FaFacebookF size={16} className="text-[#1877F2]" />
                </button>
              </div>
            </>
          ) : null}

          <div className="text-center mb-2">
            {!isLoggedIn ? (
              <button type="button" onClick={handleCreateAccount} className="text-teal-700 font-medium underline underline-offset-2">
                Create an account
              </button>
            ) : (
              <span className="text-gray-600 text-sm">Welcome back!</span>
            )}
          </div>

          <div className="h-px bg-gray-200" />

          <div className="py-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onProfessionalLoginClick) {
                  onProfessionalLoginClick();
                  setOpen(false);
                } else {
                  handlePrimarySignIn(e);
                }
              }}
              className="flex items-center gap-3 px-1 py-3 text-gray-800 w-full text-left hover:bg-gray-50"
            >
              <svg className="w-5 h-5 text-[#BFA053]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Professional's Portal</span>
            </button>
            <div className="h-px bg-gray-200" />
            {isLoggedIn && isAgent ? (
              // Agent menu items
              <>
                <button
                  type="button"
                  onClick={() => handleMenuItemClick('/agent/profile')}
                  className="flex items-center gap-3 px-1 py-3 text-gray-800 w-full text-left hover:bg-gray-50"
                >
                  <span className="text-[#BFA053]"><AccountSettingsIcon /></span>
                  <span>My Account settings</span>
                </button>
                <div className="h-px bg-gray-200" />
                <button
                  type="button"
                  onClick={() => handleMenuItemClick('/my-subscriptions')}
                  className="flex items-center gap-3 px-1 py-3 text-gray-800 w-full text-left hover:bg-gray-50"
                >
                  <span className="text-[#BFA053]"><MySubscriptionsIcon /></span>
                  <span>My Subscriptions</span>
                </button>
                <div className="h-px bg-gray-200" />
                <button 
                  type="button"
                  onClick={handleLogout} 
                  className="flex items-center gap-3 px-1 py-3 text-red-600 hover:text-red-700 w-full text-left hover:bg-gray-50"
                >
                  <span className="text-[#BFA053]"><SignOutIcon /></span>
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              // Buyer menu items
              <>
                <a href="/saved" className="flex items-center gap-3 px-1 py-3 text-gray-800">
                  <img src={savedHomesIcon} alt="Saved homes" className="w-5 h-5" />
                  <span>My saved homes</span>
                </a>
                <div className="h-px bg-gray-200" />
                <a href="/myorders" className="flex items-center gap-3 px-1 py-3 text-gray-800">
                  <img src={myOrderIcon} alt="My Orders" className="w-5 h-5" />
                  <span>My Orders</span>
                </a>
                <div className="h-px bg-gray-200" />
                <a href="/my-subscriptions" className="flex items-center gap-3 px-1 py-3 text-gray-800">
                  <img src={subscriptionIcon} alt="My Subscriptions" className="w-5 h-5" />
                  <span>My Subscriptions</span>
                </a>
                <div className="h-px bg-gray-200" />
                <a href="/account-settings" className="flex items-center gap-3 px-1 py-3 text-gray-800">
                  <img src={accountIcon} alt="My Account settings" className="w-5 h-5" />
                  <span>My Account settings</span>
                </a>
                {isLoggedIn && (
                  <>
                    <div className="h-px bg-gray-200" />
                    <button 
                      type="button"
                      onClick={handleLogout} 
                      className="flex items-center gap-3 px-1 py-3 text-red-600 hover:text-red-700 w-full text-left"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInPopover;