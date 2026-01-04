import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingCart, Star, UserCog, LogOut, X } from 'lucide-react';
import { useAuth, useAuthData } from '../contexts/AuthContext';
import { showGlobalToast } from '../utils/toast';

const iconClass = 'w-6 h-6 text-[#BFA14A]';
const dividerClass = 'border-t border-[#BFA14A] opacity-30 my-2';
import { SavedHomesIcon, OrdersIcon, MySubscriptionsIcon, AccountSettingsIcon, SignOutIcon } from '../assets/icons/ProfileMenuIcons';
import { CryptoStorage } from '../utils/storage';

const DummyIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="28" fill="#E0E0E0" />
    <circle cx="28" cy="22" r="10" fill="#BDBDBD" />
    <ellipse cx="28" cy="41" rx="14" ry="8" fill="#BDBDBD" />
  </svg>
);

interface MobileAgentMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileAgentMenu = ({ isOpen, onClose }: MobileAgentMenuProps) => {
  const { setIsLoggedIn, setUser } = useAuth();
  const { user } = useAuthData();
  const username = user?.user_name || 'User';
  const mobile_number = user?.mobile_number || '';
  const profilePhoto = user?.profile_photo_url || '';
  const handleSignOut = () => {
    setIsLoggedIn(false);
    CryptoStorage.remove('authentication');
    setUser(null);
    localStorage.clear();
    showGlobalToast('Signed out successfully', 3000);
    onClose();
  };
  return (
    <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`}
        onClick={onClose}
    >
      {/* User Info */}
      <div 
            className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 p-5 flex flex-col items-center gap-y-6 w-80 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onClose} className="self-end text-gray-500 hover:text-gray-800">
                <X size={28} />
            </button>
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={username}
            className="w-14 h-14 rounded-full object-cover mr-4 border border-gray-200"
            style={{ width: 56, height: 56 }}
          />
        ) : (
          <DummyIcon size={56} />
        )}
        <div>
          <div className="font-bold text-lg text-gray-900">{username}</div>
          <div className="text-sm text-gray-500">{mobile_number}</div>
        </div>
      {/* Navigation */}
      {/* Buyer Menu */}
      <nav className="flex flex-col gap-1 w-full">
        <Link to="/agent/properties/listings" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <SavedHomesIcon />
          </span>
          <span className="ml-4 font-medium">My Listings</span>
        </Link>
        <div className={dividerClass} />
        <Link to="/agent/homes3d" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M16.6667 12.5L10 6.66667L3.33333 12.5V16.6667H6.66667V13.3333H13.3333V16.6667H16.6667V12.5ZM18.3333 15.8333V11.6667L10 4.16667L1.66667 11.6667V15.8333C1.66667 16.2754 1.84226 16.6993 2.15482 17.0118C2.46738 17.3244 2.89131 17.5 3.33333 17.5H16.6667C17.1087 17.5 17.5326 17.3244 17.8452 17.0118C18.1577 16.6993 18.3333 16.2754 18.3333 15.8333Z" stroke="url(#paint0_linear_3d_homes)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 10.8333H12.5" stroke="url(#paint1_linear_3d_homes)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 8.33333V13.3333" stroke="url(#paint2_linear_3d_homes)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint0_linear_3d_homes" x1="1.66667" y1="10.8333" x2="18.3333" y2="10.8333" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#905E26"/>
                  <stop offset="0.258244" stopColor="#F5EC9B"/>
                  <stop offset="1" stopColor="#905E26"/>
                </linearGradient>
                <linearGradient id="paint1_linear_3d_homes" x1="7.5" y1="10.8333" x2="12.5" y2="10.8333" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#905E26"/>
                  <stop offset="0.258244" stopColor="#F5EC9B"/>
                  <stop offset="1" stopColor="#905E26"/>
                </linearGradient>
                <linearGradient id="paint2_linear_3d_homes" x1="10" y1="10.8333" x2="10" y2="10.8333" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#905E26"/>
                  <stop offset="0.258244" stopColor="#F5EC9B"/>
                  <stop offset="1" stopColor="#905E26"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="ml-4 font-medium">My 3D Homes</span>
        </Link>
        <div className={dividerClass} />
        <Link to="/reports" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <OrdersIcon />
          </span>
          <span className="ml-4 font-medium">Reports</span>
        </Link>
        <div className={dividerClass} />
        <Link to="/my-subscriptions" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <MySubscriptionsIcon />
          </span>
          <span className="ml-4 font-medium">My Subscriptions</span>
        </Link>
        <div className={dividerClass} />
        <Link to="/agent/profile" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <AccountSettingsIcon />
          </span>
          <span className="ml-4 font-medium">My Account settings</span>
        </Link>
        <div className={dividerClass} />
        <button
          onClick={handleSignOut}
          className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg w-full text-left"
        >
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <SignOutIcon />
          </span>
          <span className="ml-4 font-medium">Sign out</span>
        </button>
      </nav>
      </div>
    </div>
  );
};

export default MobileAgentMenu; 