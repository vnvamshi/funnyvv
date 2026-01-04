import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthData } from '../contexts/AuthContext';

import HomeActive from '../assets/images/b-f-home-active.svg';
import HomeInactive from '../assets/images/b-f-home-iactive.svg';
import ExploreActive from '../assets/images/b-f-explore-active.svg';
import ExploreInactive from '../assets/images/b-f-explore-iactive.svg';
import SavesActive from '../assets/images/b-f-save-active.svg';
import SavesInactive from '../assets/images/b-f-save-iactive.svg';
import HelpInactive from '../assets/images/b-f-help-iactive.svg';
import LoginInactive from '../assets/images/b-f-login.svg';

// Inline SVG for active Help icon with gradient
const HelpActive = () => (
  <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="help-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="11.73%" stopColor="#004236" />
        <stop offset="96.61%" stopColor="#007E67" />
      </linearGradient>
    </defs>
    <path d="M14.5 26.5832C21.1735 26.5832 26.5834 21.1733 26.5834 14.4998C26.5834 7.8264 21.1735 2.4165 14.5 2.4165C7.82658 2.4165 2.41669 7.8264 2.41669 14.4998C2.41669 21.1733 7.82658 26.5832 14.5 26.5832Z" stroke="url(#help-gradient)" strokeWidth="2"/>
    <path d="M14.5 19.3332C17.1694 19.3332 19.3334 17.1692 19.3334 14.4998C19.3334 11.8305 17.1694 9.6665 14.5 9.6665C11.8306 9.6665 9.66669 11.8305 9.66669 14.4998C9.66669 17.1692 11.8306 19.3332 14.5 19.3332Z" stroke="url(#help-gradient)" strokeWidth="2"/>
    <path d="M18.125 10.8748L22.9583 6.0415" stroke="url(#help-gradient)" strokeWidth="2"/>
    <path d="M6.04169 22.9583L10.875 18.125" stroke="url(#help-gradient)" strokeWidth="2"/>
    <path d="M10.875 10.8748L6.04169 6.0415" stroke="url(#help-gradient)" strokeWidth="2"/>
    <path d="M22.9583 22.9583L18.125 18.125" stroke="url(#help-gradient)" strokeWidth="2"/>
  </svg>
);

const navItems = [
  {
    key: 'home',
    label: 'Home',
    route: '/',
    activeIcon: HomeActive,
    inactiveIcon: HomeInactive,
  },
  {
    key: 'explore',
    label: 'Explore',
    route: '/property-listing',
    activeIcon: ExploreActive,
    inactiveIcon: ExploreInactive,
  },
  {
    key: 'saves',
    label: 'Saves',
    route: '/saved',
    activeIcon: SavesActive,
    inactiveIcon: SavesInactive,
  },
  {
    key: 'help',
    label: 'Help',
    route: '/help',
    activeIcon: HelpActive,
    inactiveIcon: HelpInactive,
  },
];

export default function BuyerFooterNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const authData = useAuthData();
  const user = authData?.user;
  const fullUsername = user?.user_name || 'Login';
  const username = fullUsername.split(' ')[0]; // Get only the first part of the username
  const profilePhoto = user?.profile_photo_url || '';
  const isLoggedIn = !!user;

  // Determine active tab by pathname
  const getActiveKey = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/property-listing')) return 'explore';
    if (location.pathname.startsWith('/saved')) return 'saves';
    if (location.pathname.startsWith('/help')) return 'help';
    if (location.pathname.startsWith('/account-settings')) return 'profile';
    return '';
  };
  const activeKey = getActiveKey();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between items-center h-16 z-50">
      {navItems.map(item => {
        const isActive = activeKey === item.key;
        const IconComp = isActive ? item.activeIcon : item.inactiveIcon;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.route)}
            className="flex flex-col items-center flex-1 py-2 focus:outline-none bg-white"
            style={{ background: 'white' }}
          >
            {typeof IconComp === 'string' ? (
              <img
                src={IconComp}
                alt={item.label}
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
            ) : (
              <IconComp />
            )}
            <span
              className="text-xs mt-1"
              style={isActive ? {
                fontWeight: 700,
                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              } : {
                color: '#9E9E9E',
                fontWeight: 400,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
      {/* Profile/Login tab */}
      <button
        key="profile"
        onClick={() => navigate(isLoggedIn ? '/account-settings' : '/login')}
        className="flex flex-col items-center flex-1 py-2 focus:outline-none bg-white"
        style={{ background: 'white' }}
      >
        {isLoggedIn && profilePhoto ? (
          <img
            src={profilePhoto}
            alt={username}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              objectFit: 'cover',
              border: activeKey === 'profile' ? '2px solid #007E67' : '2px solid #9E9E9E',
              padding: 1,
            }}
          />
        ) : (
          <img
            src={LoginInactive}
            alt="Login"
            style={{ width: 28, height: 28, objectFit: 'contain' }}
          />
        )}
        <span
          className="text-xs mt-1"
          style={activeKey === 'profile' ? {
            fontWeight: 700,
            background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          } : {
            color: '#9E9E9E',
            fontWeight: 400,
          }}
        >
          {isLoggedIn ? username : 'Login'}
        </span>
      </button>
    </nav>
  );
} 