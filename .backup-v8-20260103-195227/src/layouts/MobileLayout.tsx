import React, { useState } from 'react';
import AppRoutes from '../routes';
import MobileNav from '../components/MobileNav';
import { Menu, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';

const MobileLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="">
      {/* Header */}
      {/* <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md h-14 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold">Vista View</h1>
        <Bell className="text-gray-800" />
      </header>

      {/* Sidebar */}
      {/* <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-xl font-bold">
            ×
          </button>
        </div>
        <ul className="p-4 space-y-2">
          <li>
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className={`block p-2 rounded ${
                isActive('/') ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/explore"
              onClick={() => setSidebarOpen(false)}
              className={`block p-2 rounded ${
                isActive('/explore') ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100'
              }`}
            >
              Explore
            </Link>
          </li>
          <li>
            <Link
              to="/saved"
              onClick={() => setSidebarOpen(false)}
              className={`block p-2 rounded ${
                isActive('/saved') ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100'
              }`}
            >
              Saved Homes
            </Link>
          </li>
          <li>
            <Link
              to="/account"
              onClick={() => setSidebarOpen(false)}
              className={`block p-2 rounded ${
                isActive('/account') ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100'
              }`}
            >
              Account
            </Link>
          </li>
        </ul>
      </div> */}

      {/* Backdrop */}
      {/* {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )} */}

      {/* Page Content */}
      <div className="">
        <ScrollToTop />
        <AppRoutes />
      </div> 

      {/* Bottom Navigation */}
      {/* <MobileNav /> */}
    </div>
  );
};

export default MobileLayout;
