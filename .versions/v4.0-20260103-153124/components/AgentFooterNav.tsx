import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListingsIcon from '../assets/images/a-f-listings.svg';
import ReportsIcon from '../assets/images/a-f-reports.svg';
import ARVRIcon from '../assets/images/a-f-arvr.svg';
import { useAuthData } from '../contexts/AuthContext';
import HelpInactive from '../assets/images/b-f-help-iactive.svg';
import LoginInactive from '../assets/images/b-f-login.svg';
import ListingInactive from '../assets/images/listing-inactive.svg';
import ARVRActive from '../assets/images/arvr-active.svg';

// Inline SVG for active Help icon with gradient (copied from BuyerFooterNav)
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

const gradient = 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)';
const inactiveColor = '#9E9E9E';

export default function AgentFooterNav({ active }: { active: string }) {
  const navigate = useNavigate();
  const user = useAuthData().user;
  const username = user?.user_name || 'Profile';
  const profilePhoto = user?.profile_photo_url || '';

  const navItems = [
    {
      key: 'listings',
      label: 'Listings',
      activeIcon: ListingsIcon,
      inactiveIcon: ListingInactive,
      route: '/agent/properties/listings',
    },
    { key: 'reports', label: 'Reports', icon: ReportsIcon, route: '/reports' },
    {
      key: 'arvr',
      label: 'AR/VR',
      activeIcon: ARVRActive,
      inactiveIcon: ARVRIcon,
      route: '/agent/homes3d',
    },
    {
      key: 'help',
      label: 'Help',
      icon: (isActive: boolean) => isActive ? <HelpActive /> : <img src={HelpInactive} alt="Help" style={{ width: 28, height: 28, objectFit: 'contain' }} />,
      route: '/help',
    },
    // Profile replaced with username and photo below
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between items-center h-16 z-50">
      {navItems.map(item => {
        const isActive = active === item.key;
        if (item.key === 'help') {
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center flex-1 py-2 focus:outline-none bg-white"
              style={{ background: 'white' }}
            >
              {item.icon(isActive)}
              <span
                className="text-xs mt-1"
                style={isActive ? {
                  fontWeight: 700,
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                } : {
                  color: inactiveColor,
                  fontWeight: 400,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        }
        if (item.key === 'listings' || item.key === 'arvr') {
          const IconComp = isActive ? item.activeIcon : item.inactiveIcon;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center flex-1 py-2 focus:outline-none bg-white"
              style={{ background: 'white' }}
            >
              <img
                src={IconComp}
                alt={item.label}
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
              <span
                className="text-xs mt-1"
                style={isActive ? {
                  fontWeight: 700,
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                } : {
                  color: inactiveColor,
                  fontWeight: 400,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        }
        // Default icon logic for other tabs
        const isStringIcon = typeof item.icon === 'string';
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.route)}
            className="flex flex-col items-center flex-1 py-2 focus:outline-none bg-white"
            style={{ background: 'white' }}
          >
            {isStringIcon ? (
              <img
                src={item.icon as string}
                alt={item.label}
                style={isActive ? {
                  width: 28,
                  height: 28,
                  filter: 'none',
                  WebkitMaskImage: `url(${item.icon})`,
                  maskImage: `url(${item.icon})`,
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  objectFit: 'contain',
                } : {
                  width: 28,
                  height: 28,
                  objectFit: 'contain',
                  opacity: 1,
                  color: inactiveColor,
                  filter: 'brightness(0) saturate(100%) invert(62%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.8) contrast(0.8)',
                }}
              />
            ) : (
              <span style={{ opacity: 1 }}>{(item.icon as any)}</span>
            )}
            <span
              className="text-xs mt-1"
              style={isActive ? {
                fontWeight: 700,
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              } : {
                color: inactiveColor,
                fontWeight: 400,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
      {/* Profile/Username tab */}
      <button
        key="profile"
        onClick={() => navigate('/agent/profile')}
        className="flex flex-col items-center flex-1 py-2 focus:outline-none bg-white"
        style={{ background: 'white' }}
      >
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={username}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              objectFit: 'cover',
              border: active === 'profile' ? '2px solid #007E67' : `2px solid ${inactiveColor}`,
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
          style={active === 'profile' ? {
            fontWeight: 700,
            background: gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          } : {
            color: inactiveColor,
            fontWeight: 400,
          }}
        >
          {username}
        </span>
      </button>
    </nav>
  );
} 