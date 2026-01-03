import userIcon from '../assets/images/mobile/user-icon.svg';
import searchIcon from '../assets/images/mobile/search-icon.svg';
import helpIcon from '../assets/images/mobile/help-icon.svg';
import homeIcon from '../assets/images/mobile/home-icon.svg';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from 'i18next';
import { useAuth, useAuthData } from '../contexts/AuthContext';

// Helper function to get login state safely
const getLoginState = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('loggedIn') === 'true';
  }
  return false;
};

const getMenuItems = (isLoggedIn: boolean) => [
  { label: 'Home', icon: homeIcon, key: 'navigation.home', path: '/', active: true },
  { label: 'Explore', icon: searchIcon, key: 'navigation.explore', path: '/' ,active: false},
  { label: 'Saves', icon: homeIcon, key: 'navigation.saves', path: '/saved', active: false },
  { label: 'Help', icon: helpIcon, key: 'navigation.help', path: '#', active: false },
  { label:  isLoggedIn ? (t('navigation.myAccount') || 'Account') : t('navigation.login'), icon: userIcon, key: 'navigation.login', path: '/login', active: false },
];

// Add buyer-specific menu items
const getBuyerMenuItems = (isLoggedIn: boolean) => [
  { label: 'Home', icon: homeIcon, key: 'navigation.home', path: '/', active: true },
  { label: 'Explore', icon: searchIcon, key: 'navigation.explore', path: '/', active: false },
  { label: 'Saves', icon: homeIcon, key: 'navigation.saves', path: '/saved', active: false },
  { label: 'Orders', icon: helpIcon, key: 'navigation.orders', path: '/orders', active: false },
  { label: 'Subscriptions', icon: helpIcon, key: 'navigation.subscriptions', path: '/plan/my-subscriptions', active: false },
  { label: 'Help', icon: helpIcon, key: 'navigation.help', path: '#', active: false },
  { label: isLoggedIn ? (t('navigation.myAccount') || 'Account') : t('navigation.login'), icon: userIcon, key: 'navigation.login', path: isLoggedIn ? '/account-settings' : '/login', active: false },
];

const getAgentMenuItems = (isLoggedIn: boolean) => [
  { label: 'Listings', icon: homeIcon, key: 'navigation.home', path: '/agent/properties/listings', active: true },
  { label: 'Reports', icon: searchIcon, key: 'navigation.explore', path: '/' ,active: false},
  { label: 'AR/VR', icon: homeIcon, key: 'navigation.saves', path: '/agent/homes3d', active: false },
  { label: 'Help', icon: helpIcon, key: 'navigation.help', path: '#', active: false },
  { label:  isLoggedIn ? (t('navigation.myAccount') || 'Profile') : t('navigation.login'), icon: userIcon, key: 'navigation.login', path: '/login', active: false },
];

interface MobileOverlayMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileOverlayMenu = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  
  const menuItems = getMenuItems(isLoggedIn );
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-20 flex flex-col items-center pt-6">
      <nav
        className="flex flex-row md:flex-row justify-between items-center px-4 py-2 gap-x-2 bg-white rounded-xl shadow w-full max-w-lg mx-auto mt-4"
        style={{ minWidth: 320 }}
      >
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.label}
            className={`flex flex-col items-center flex-1 ${item.active ? 'text-[#007E67]' : 'text-gray-400'}`}
            style={{ minWidth: 0 }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 mb-1"
              style={{ boxShadow: item.active ? '0 2px 8px rgba(0,126,103,0.10)' : 'none' }}
            >
              <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xs font-medium text-center truncate w-full">{t(item.key)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export const MobileBottonMenu = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth(); // Move useAuth inside component
  const user = useAuthData();

  const isAgent = user?.user?.user_type === 'agent';
  const isBuyer = user?.user?.user_type === 'buyer';
  


  const menuItems = isAgent ? getAgentMenuItems(isLoggedIn) : getMenuItems(isLoggedIn);


  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t flex justify-around items-center h-16 shadow-md pointer-events-auto">
      {menuItems.map((item) => (
        <Link
          to={item.path}
          key={item.label}
          className={`flex flex-col items-center ${item.active ? 'text-[#007E67]' : 'text-gray-400'}`}
          style={{ width: '56px' }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ boxShadow: item.active ? '0 2px 8px rgba(0,126,103,0.10)' : 'none' }}
          >
            <img src={item.icon} alt={item.label} className="w-8 h-6" />
          </div>
          <span className="text-[11px] mt-1 font-medium">{t(item.key)}</span>
        </Link>
      ))}
    </nav>
  );
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  userType?: string;
}

export const MobileMenu = ({ isOpen, onClose, isLoggedIn, userType }: MobileMenuProps) => {
  const { t } = useTranslation();
  let menuItems;
  if (isLoggedIn && userType === 'agent') {
    menuItems = getAgentMenuItems(true);
  } else if (isLoggedIn && userType === 'buyer') {
    menuItems = getBuyerMenuItems(true);
  } else {
    menuItems = getMenuItems(!!isLoggedIn);
  }

  return (
    <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`}
        onClick={onClose}
    >
        <div 
            className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 p-5 flex flex-col items-center gap-y-6 w-48 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onClose} className="self-end text-gray-500 hover:text-gray-800">
                <X size={28} />
            </button>
            {menuItems.map((item) => (
                <Link
                    to={item.path}
                    key={item.label}
                    onClick={onClose}
                    className="flex flex-col items-center w-full text-gray-700 hover:text-green-700 cursor-pointer"
                >
                    <img src={item.icon} alt={item.label} className="w-8 h-6" />
                    <span className="text-sm font-medium mt-1">{t(item.key)}</span>
                </Link>
            ))}
        </div>
    </div>
  );
};



