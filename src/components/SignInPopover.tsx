import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SignInPopoverProps {
  buttonClassName?: string;
  onSignInClick?: () => void;
  onCreateAccountClick?: () => void;
  onProfessionalLoginClick?: () => void;
}

const SignInPopover: React.FC<SignInPopoverProps> = ({ buttonClassName = '', onSignInClick }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // NOT LOGGED IN - Show Sign In button only
  if (!isLoggedIn) {
    return <button onClick={onSignInClick} className={buttonClassName || "gold-gradient-btn"}>Sign in</button>;
  }

  // LOGGED IN - Show menu
  const menus: Record<string, { icon: string; label: string }[]> = {
    vendor: [{ icon: '📦', label: 'My Products' }, { icon: '📤', label: 'Upload Catalog' }, { icon: '📊', label: 'Orders' }, { icon: '⚙️', label: 'Settings' }],
    default: [{ icon: '🏠', label: 'Saved Homes' }, { icon: '📦', label: 'Orders' }, { icon: '⭐', label: 'Subscriptions' }, { icon: '⚙️', label: 'Settings' }]
  };
  const items = menus[user?.role || 'default'] || menus.default;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setShowMenu(!showMenu)} className={buttonClassName || "gold-gradient-btn"} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{user?.name?.charAt(0) || '👤'}</span> {user?.name || 'Account'} ▼
      </button>
      {showMenu && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', minWidth: '200px', overflow: 'hidden', zIndex: 9999 }}>
          <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #004236, #007E67)', color: '#fff' }}>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8em', opacity: 0.8, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          {items.map((item, i) => <a key={i} href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>{item.icon} {item.label}</a>)}
          <button onClick={() => { logout(); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', width: '100%', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>🚪 Sign Out</button>
        </div>
      )}
    </div>
  );
};

export default SignInPopover;
