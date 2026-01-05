// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - SIGN IN POPOVER v4.0
// FIXED: Only shows dropdown AFTER authentication
// Role-based menu items, clean state management
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface SignInPopoverProps {
  buttonClassName?: string;
  onSignInClick?: () => void;
  onCreateAccountClick?: () => void;
  onProfessionalLoginClick?: () => void;
}

type UserRole = 'customer' | 'home_buyer' | 'investor' | 'agent' | 'builder' | 'vendor' | 'lender';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  roles?: UserRole[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const THEME = {
  teal: '#004236',
  tealLight: '#007E67',
  gold: '#B8860B',
  goldLight: '#F5EC9B'
};

// Common menu items for all roles
const COMMON_MENU_ITEMS: MenuItem[] = [
  { icon: '⚙️', label: 'My Account Settings', path: '/settings' },
  { icon: '📦', label: 'My Orders', path: '/orders' },
  { icon: '⭐', label: 'My Subscriptions', path: '/subscriptions' }
];

// Role-specific menu items
const ROLE_MENU_ITEMS: Record<UserRole, MenuItem[]> = {
  customer: [
    { icon: '🏠', label: 'My Saved Homes', path: '/saved-homes' },
    { icon: '❤️', label: 'My Favorites', path: '/favorites' }
  ],
  home_buyer: [
    { icon: '🏠', label: 'My Saved Homes', path: '/saved-homes' },
    { icon: '🔍', label: 'My Searches', path: '/searches' },
    { icon: '📋', label: 'Pre-Approval Status', path: '/pre-approval' }
  ],
  investor: [
    { icon: '📊', label: 'My Portfolio', path: '/portfolio' },
    { icon: '📈', label: 'ROI Calculator', path: '/roi' },
    { icon: '🏢', label: 'Investment Properties', path: '/investments' }
  ],
  agent: [
    { icon: '👥', label: 'My Clients', path: '/clients' },
    { icon: '🏠', label: 'My Listings', path: '/my-listings' },
    { icon: '📊', label: 'Performance Dashboard', path: '/agent-dashboard' },
    { icon: '📱', label: 'Lead Management', path: '/leads' }
  ],
  builder: [
    { icon: '🏗️', label: 'My Projects', path: '/projects' },
    { icon: '📁', label: 'Upload Project', path: '/upload-project' },
    { icon: '📊', label: 'Builder Dashboard', path: '/builder-dashboard' },
    { icon: '👷', label: 'Team Management', path: '/team' }
  ],
  vendor: [
    { icon: '📦', label: 'My Products', path: '/my-products' },
    { icon: '📤', label: 'Upload Catalog', path: '/upload-catalog' },
    { icon: '🎯', label: 'Promotions', path: '/promotions' },
    { icon: '🏪', label: 'My Storefront', path: '/storefront' },
    { icon: '📊', label: 'Vendor Dashboard', path: '/vendor-dashboard' }
  ],
  lender: [
    { icon: '💳', label: 'Loan Applications', path: '/applications' },
    { icon: '📊', label: 'Lender Dashboard', path: '/lender-dashboard' },
    { icon: '📋', label: 'Rate Sheets', path: '/rates' }
  ]
};

// Role display names and colors
const ROLE_CONFIG: Record<UserRole, { name: string; color: string; icon: string }> = {
  customer: { name: 'Customer', color: '#4A90D9', icon: '👤' },
  home_buyer: { name: 'Home Buyer', color: '#E74C3C', icon: '🏠' },
  investor: { name: 'Investor', color: '#27AE60', icon: '💰' },
  agent: { name: 'Real Estate Agent', color: '#9B59B6', icon: '🏢' },
  builder: { name: 'Builder', color: '#3498DB', icon: '🏗️' },
  vendor: { name: 'Vendor', color: '#F39C12', icon: '📦' },
  lender: { name: 'Lender', color: '#607D8B', icon: '🏦' }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const SignInPopover: React.FC<SignInPopoverProps> = ({
  buttonClassName = '',
  onSignInClick,
  onCreateAccountClick,
  onProfessionalLoginClick
}) => {
  const { isLoggedIn, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get menu items based on user role
  const getMenuItems = (): MenuItem[] => {
    const role = (user?.role || 'customer') as UserRole;
    const roleItems = ROLE_MENU_ITEMS[role] || ROLE_MENU_ITEMS.customer;
    
    return [
      { icon: '🏢', label: "Professional's Portal", path: '/portal' },
      ...roleItems,
      ...COMMON_MENU_ITEMS
    ];
  };

  // Get role config
  const getRoleConfig = () => {
    const role = (user?.role || 'customer') as UserRole;
    return ROLE_CONFIG[role] || ROLE_CONFIG.customer;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE A: NOT LOGGED IN - Only show Sign In button, NO dropdown
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <button
        onClick={onSignInClick}
        className={buttonClassName || "gold-gradient-btn"}
        style={{
          padding: '10px 24px',
          background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldLight})`,
          color: '#000',
          border: 'none',
          borderRadius: '25px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '0.95em',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(184,134,11,0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(184,134,11,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,134,11,0.3)';
        }}
      >
        Sign in
      </button>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE B: LOGGED IN - Show user button with dropdown menu
  // ═══════════════════════════════════════════════════════════════════════════
  const menuItems = getMenuItems();
  const roleConfig = getRoleConfig();

  return (
    <div ref={popoverRef} style={{ position: 'relative' }}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldLight})`,
          color: '#000',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'all 0.2s ease'
        }}
      >
        {/* User Avatar */}
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9em'
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || roleConfig.icon}
        </span>
        
        {/* User Name */}
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name || 'Account'}
        </span>
        
        {/* Dropdown Arrow */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            minWidth: '280px',
            overflow: 'hidden',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* User Info Header */}
          <div
            style={{
              padding: '16px 20px',
              background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.tealLight})`,
              borderBottom: `3px solid ${roleConfig.color}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: roleConfig.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4em'
                }}
              >
                {roleConfig.icon}
              </span>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.05em' }}>
                  {user?.name || 'User'}
                </div>
                <div
                  style={{
                    color: roleConfig.color,
                    fontSize: '0.85em',
                    fontWeight: 500,
                    marginTop: '2px'
                  }}
                >
                  {roleConfig.name}
                </div>
                {user?.email && (
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8em', marginTop: '2px' }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '8px 0' }}>
            {menuItems.map((item, idx) => (
              <a
                key={idx}
                href={item.path}
                onClick={(e) => {
                  // If you're using React Router, prevent default and use navigate
                  // e.preventDefault();
                  // navigate(item.path);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                  borderBottom: idx === 0 ? '1px solid #f0f0f0' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f8f8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '1.2em', width: '24px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '0.95em' }}>{item.label}</span>
              </a>
            ))}
          </div>

          {/* Logout Button */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 8px',
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.15s ease',
                fontSize: '0.95em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220,38,38,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1.2em' }}>🚪</span>
              <span style={{ fontWeight: 500 }}>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SignInPopover;
