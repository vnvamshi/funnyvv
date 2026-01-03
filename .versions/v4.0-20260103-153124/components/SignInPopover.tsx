// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - SIGN IN POPOVER v3.0
// FIXED: Only shows dropdown AFTER authentication
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SignInPopoverProps {
  buttonClassName?: string;
  onSignInClick?: () => void;
  onCreateAccountClick?: () => void;
  onProfessionalLoginClick?: () => void;
}

const SignInPopover: React.FC<SignInPopoverProps> = ({
  buttonClassName = '',
  onSignInClick,
  onCreateAccountClick,
  onProfessionalLoginClick
}) => {
  const { isLoggedIn, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get role-specific menu items
  const getRoleMenuItems = () => {
    const role = user?.role || 'customer';
    const baseItems = [
      { icon: '🏢', label: "Professional's Portal", path: '/portal' },
      { icon: '📦', label: 'My Orders', path: '/orders' },
      { icon: '⭐', label: 'My Subscriptions', path: '/subscriptions' },
      { icon: '⚙️', label: 'My Account Settings', path: '/settings' }
    ];

    // Role-specific second item
    const roleSpecificItem = {
      customer: { icon: '🏠', label: 'My Saved Homes', path: '/saved-homes' },
      home_buyer: { icon: '🏠', label: 'My Saved Homes', path: '/saved-homes' },
      investor: { icon: '📊', label: 'My Portfolio', path: '/portfolio' },
      agent: { icon: '👥', label: 'My Clients', path: '/clients' },
      builder: { icon: '🏗️', label: 'My Projects', path: '/projects' },
      vendor: { icon: '📦', label: 'My Products', path: '/my-products' }
    };

    const specific = roleSpecificItem[role as keyof typeof roleSpecificItem] || roleSpecificItem.customer;
    return [baseItems[0], specific, ...baseItems.slice(1)];
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE A: NOT LOGGED IN - Only show Sign In button, NO dropdown
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <button
        onClick={onSignInClick}
        className={buttonClassName || "gold-gradient-btn"}
        style={{ cursor: 'pointer' }}
      >
        Sign in
      </button>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE B: LOGGED IN - Show user menu with role-specific items
  // ═══════════════════════════════════════════════════════════════════════════
  const menuItems = getRoleMenuItems();

  return (
    <div ref={popoverRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || "gold-gradient-btn"}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.name?.charAt(0) || '👤'}
        </span>
        <span>{user?.name || 'Account'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          minWidth: '250px',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          {/* User Info Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid #eee', background: 'linear-gradient(135deg, #004236, #007E67)' }}>
            <div style={{ color: '#fff', fontWeight: 600 }}>{user?.name || 'User'}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85em' }}>{user?.role || 'Customer'}</div>
          </div>

          {/* Menu Items */}
          {menuItems.map((item, idx) => (
            <a
              key={idx}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: '#333',
                textDecoration: 'none',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.2em' }}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}

          {/* Logout */}
          <button
            onClick={() => { logout(); setIsOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#ff4444',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SignInPopover;
