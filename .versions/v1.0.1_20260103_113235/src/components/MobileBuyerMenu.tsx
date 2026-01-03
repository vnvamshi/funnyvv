import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingCart, Star, UserCog, LogOut, X } from 'lucide-react';
import { useAuth, useAuthData } from '../contexts/AuthContext';
import { showGlobalToast } from '../utils/toast';
import { SavedHomesIcon, OrdersIcon, MySubscriptionsIcon, AccountSettingsIcon, SignOutIcon } from '../assets/icons/ProfileMenuIcons';
import { CryptoStorage } from '../utils/storage';
interface MobileBuyerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const DummyIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="28" fill="#E0E0E0" />
    <circle cx="28" cy="22" r="10" fill="#BDBDBD" />
    <ellipse cx="28" cy="41" rx="14" ry="8" fill="#BDBDBD" />
  </svg>
);

const dividerClass = 'border-t border-[#BFA14A] opacity-30 my-2';

const MobileBuyerMenu = ({ isOpen, onClose }: MobileBuyerMenuProps) => {
  const { setIsLoggedIn, setUser } = useAuth();
  const authData = useAuthData();
  const user = authData?.user;
  // Get username from storage
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
        <Link to="/saved" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <SavedHomesIcon />
          </span>
          <span className="ml-4 font-medium">My saved homes</span>
        </Link>
        <div className={dividerClass} />
        <Link to="/myorders" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <OrdersIcon />
          </span>
          <span className="ml-4 font-medium">My Orders</span>
        </Link>
        <div className={dividerClass} />
        <Link to="/my-subscriptions" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
          <span className="mr-4 flex-shrink-0 text-[#BFA053]">
            <MySubscriptionsIcon />
          </span>
          <span className="ml-4 font-medium">My Subscriptions</span>
        </Link>
        <div className={dividerClass} />
        <Link to="/account-settings" className="flex items-center py-3 px-2 text-gray-900 hover:bg-gray-50 rounded-lg">
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

export default MobileBuyerMenu; 