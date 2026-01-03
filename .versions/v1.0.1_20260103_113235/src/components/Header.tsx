import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/web-logo.svg';
import activeBg from '../assets/images/active-bg.svg';
import activeBgLong from '../assets/images/active-bg-long.svg';
import downArrow from '../assets/images/downarrow.svg';
import cartIcon from '../assets/images/v3.2/cart-icon.png';
import { TRANSLATION_KEYS } from '../utils/translationKeys';
import WebSignup from '../pages/auth/WebSignup';
import { useAuth, useAuthData } from '../contexts/AuthContext';
import WebLayout from '../pages/auth/WebLogin';
import BuyerMenu from './BuyerMenu';
import AgentMenu from './AgentMenu';
// If AgentMenu is needed, import it:
// import AgentMenu from './AgentMenu';
import WebLogin from '../pages/auth/WebLogin';
import { set } from 'react-hook-form';
import WebAgentSignup from '../pages/auth/WebAgentSignup';
import goldMyListing from '../assets/images/gold-mylisting.svg';
import goldMy3d from '../assets/images/gold-my3d.svg';
import SignInPopover from './SignInPopover';

function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSignupOpen, setSignupOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [modalView, setModalView] = useState<'signup' | 'login' | 'agentSignUp' | null>(null);
  const isAgent = useAuthData().user?.user_type === 'agent';
  const isBuilder = useAuthData().user?.user_type === 'builder';
  const isBuyer = useAuthData().user?.user_type === 'buyer';
  const showAgentNav = isAgent || isBuilder; // Show agent navbar for both agents and builders

  // Get username from storage
  const username =
    localStorage.getItem('user_name') ||
    sessionStorage.getItem('user_name') ||
    'User';

  const isActive = (path: string) => {
    if (path === '/sell') {
      return location.pathname === '/sell' || location.pathname.startsWith('/sell/');
    }
    if (path === '/') {
      // Active on home page, property listing pages, and property details pages
      return location.pathname === '/' || 
             location.pathname.startsWith('/property-listing') || 
             location.pathname.startsWith('/property/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Common styles
  const activeStyle = `
    text-white 
    font-medium 
    px-5 py-2 
    rounded-[7px] 
    shadow-[4px_4px_12px_0_rgba(0,0,0,0.15)]
  `;

  const inactiveStyle = `
    text-gray-800 
    hover:no-underline 
    rounded-[12px] 
    px-5 py-2 
    font-medium
  `;

  // Profile dropdown menu items
  

  // Generate link element with background image conditionally
  const navLink = (path: string, translationKey: string) => {
    const label = t(translationKey);
    const active = isActive(path) || translationKey === TRANSLATION_KEYS.navigation.loginSignup;
    const useLongBg = translationKey === TRANSLATION_KEYS.navigation.savedHomes || translationKey === TRANSLATION_KEYS.navigation.loginSignup;

    if (translationKey === TRANSLATION_KEYS.navigation.loginSignup) {
      return (
        <button
          onClick={() =>  setModalView('login')}
          className="settings-gradient-btn height-40"
        >
          <span className="text-white font-medium text-sm">{label}</span>
        </button>
      );
    }

    return (
      <Link
        to={path}
        className={`${active ? `custom-vtour-gradient-btn  font-medium px-5 py-2 rounded-[7px] shadow-[4px_4px_12px_0_rgba(0,0,0,0.15)]` : inactiveStyle} font-medium text-sm ${active ? 'text-white' : (showAgentNav ? 'text-white' : 'text-black')}`}
      >
        {label}
      </Link>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 500);
  };

  return (
    <header className={`shadow-md fixed w-full top-0 z-50 p-4 flex justify-between items-center ${showAgentNav ? 'theme-teal-gradient-bg text-white' : 'bg-white'}`}>
      {/* Left: Logo + Buy/Sell */}
      <div className="flex items-center space-x-10">
        <Link to="/">
          <img src={logo} alt="Vista View" className="h-19 w-auto" />
        </Link>
        <nav className="flex gap-2 items-center">
          {showAgentNav ? (
            <>
              {/* Listings Dropdown */}
              <div className="relative inline-block" ref={dropdownRef} onMouseLeave={handleMouseLeave}>
                <button
                  className="px-4 py-2 font-medium text-white focus:outline-none flex items-center"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  onMouseEnter={handleMouseEnter}
                >
                  Your Listings <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showDropdown && (
                  <div
                    className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-lg z-20 border border-[#E5E7EB]"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <a href="/agent/properties/listings" className="flex items-center gap-2 px-4 py-2 text-gray-900" style={{fontSize: '16px', fontWeight: 500}}>
                      <span className="inline-block flex items-center justify-center" style={{width: 22, height: 22}}>
                        <img src={goldMyListing} alt="My Listings" style={{width: 20, height: 20}} />
                      </span>
                      My listings
                    </a>
                    <a href="/agent/homes3d" className="flex items-center gap-2 px-4 py-2 text-gray-900" style={{fontSize: '16px', fontWeight: 500}}>
                      <span className="inline-block flex items-center justify-center" style={{width: 22, height: 22}}>
                        <img src={goldMy3d} alt="My 3D Homes" style={{width: 18, height: 18}} />
                      </span>
                      My 3D homes
                    </a>
                  </div>
                )}
              </div>
              <button className="px-4 py-2 font-medium text-white focus:outline-none flex items-center">
                  Reports <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
            </>
          ) : <>
           {/* Temporarily hidden: Buy navigation */}
           {/* {navLink('/', TRANSLATION_KEYS.navigation.buy)} */}
           {/* {navLink('/sell', TRANSLATION_KEYS.navigation.sell)} */}
          </>}

        </nav>
      </div>

      {/* Right: Saved Homes + Help + Login/Profile */}
      <nav className="flex space-x-3 items-center">
        {isBuyer ? (
          <>
            {navLink('/saved', TRANSLATION_KEYS.navigation.savedHomes)}
          </>
        ) : null}
        {/* Temporarily hidden: Help navigation */}
        {/* {navLink('/help', TRANSLATION_KEYS.navigation.help)} */}
        {!isLoggedIn ? (
          <SignInPopover
            onSignInClick={() => setModalView('login')}
            onCreateAccountClick={() => setModalView('signup')}
          />
        ) : (
          <>
            {/* Cart icon - only show when logged in */}
            <Link to="/v3/cart" className="relative hover:opacity-80 transition-opacity">
              <div className="gradient-border-mask rounded-full p-2">
                <img src={cartIcon} alt="Cart" className="w-6 h-6" />
              </div>
              {/* Badge count */}
              <span 
                className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
              >
                3
              </span>
            </Link>
            {showAgentNav ? <AgentMenu navLink={navLink} /> : <BuyerMenu navLink={navLink} />}
          </>
        )}
      </nav>
      {modalView === 'agentSignUp' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <WebAgentSignup onClose={() => setModalView(null)} onSwitchToLogin={() => setModalView('login')} onSwitchToBuyerSignUp={ () => setModalView('signup') } />
        </div>
      )}
      {modalView === 'signup' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <WebSignup onClose={() => setModalView(null)} onSwitchToLogin={() => setModalView('login')} onSwitchToAgentSignUp={ () => setModalView('agentSignUp') } />
        </div>
      )}
      {modalView === 'login' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <WebLogin
            onClose={() => setModalView(null)}
            onSwitchToSignup={() => setModalView('signup')}
          />
        </div>
      )}
    </header>
  );
};

export default Header;
