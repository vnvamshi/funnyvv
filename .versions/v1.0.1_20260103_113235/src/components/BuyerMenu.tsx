import React, { useEffect, useRef, useState } from 'react';
import { TRANSLATION_KEYS } from '../utils/translationKeys';
import { useAuth, useAuthData } from '../contexts/AuthContext';
import { SavedHomesIcon, OrdersIcon, MySubscriptionsIcon, AccountSettingsIcon, SignOutIcon } from '../assets/icons/ProfileMenuIcons';
import { useNavigate } from 'react-router-dom';
import { CryptoStorage } from '../utils/storage';
import { showGlobalToast } from '../utils/toast';

interface BuyerMenuProps {
  navLink: (path: string, translationKey: string) => React.ReactNode;
}

const BuyerMenu: React.FC<BuyerMenuProps> = ({ navLink }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setUser, setIsLoggedIn } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const profileMenuItems = [
    {
      label: 'My saved homes',
      icon: <SavedHomesIcon />,
      to: '/saved',
    },
    {
      label: 'My Orders',
      icon: <OrdersIcon />,
      to: '/myorders',
    },
    {
      label: 'My Subscriptions',
      icon: <MySubscriptionsIcon />,
      to: '/my-subscriptions',
    },
    {
      label: 'My Account settings',
      icon: <AccountSettingsIcon />,
      to: '/account-settings',
    },
    {
      label: 'Sign out',
      icon: <SignOutIcon />,
      to: '/',
      onClick: () => {
          setIsLoggedIn(false);
          setUser(null);
          CryptoStorage.remove('authentication');
          localStorage.clear();
          showGlobalToast('Signed out successfully', 3000);
      },
    }
  ];
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
  
  return (
    <>
      <div
            className="relative"
            ref={dropdownRef}
          >
            {/* Profile Button (screenshot style) */}
            <div
              className="inline-flex rounded-[12px] p-[2px] cursor-pointer select-none"
              style={{ 
                background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
              }}
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <div
                className="flex items-center gap-3 px-4 h-[44px] rounded-[10px] bg-white"
                style={{ 
                  fontWeight: 600, 
                  fontSize: '18px', 
                  boxShadow: 'none',
                }}
              >
                <span style={{
                  background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}>{useAuthData().user?.user_name}!</span>
                {/* Dropdown arrow */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10" stroke="url(#gold-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#905E26" />
                      <stop offset="50%" stopColor="#F5EC9B" />
                      <stop offset="100%" stopColor="#905E26" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            {/* Dropdown (screenshot style) */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 py-4 z-50 animate-fade-in">
                {profileMenuItems.map((item, idx) => (
                  <div key={item.label}>
                    <button
                      className="flex items-center w-full px-6 py-3 font-medium text-base hover:bg-gray-50 transition"
                      style={{ border: 'none', background: 'none', outline: 'none', cursor: 'pointer', color: 'inherit' }}
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        if (item.to && item.to !== '#') navigate(item.to);
                        setShowDropdown(false);
                      }}
                    >
                      <span className="mr-4 flex-shrink-0 text-[#BFA053]">{item.icon}</span>
                      <span className="text-black">{item.label}</span>
                    </button>
                    {idx < profileMenuItems.length - 1 && <hr className="mx-6 border-t border-[#BFA053] opacity-40" />}
                  </div>
                ))}
              </div>
            )}
          </div>
    </>
  );
};

export default BuyerMenu; 