import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around items-center h-16 z-50">
      <Link to="/" className={location.pathname === '/' ? 'text-green-700' : ''}><Home /></Link>
      <Link to="/explore"><Search /></Link>
      <Link to="/saved" className={location.pathname === '/saved' ? 'text-green-700' : ''}><Heart /></Link>
      <Link to={isLoggedIn ? "/account-settings" : "/login"} className={location.pathname === '/account-settings' ? 'text-green-700' : ''}><User /></Link>
    </nav>
  );
};

export default MobileNav;