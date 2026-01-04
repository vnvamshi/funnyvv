import React, { createContext, useContext, useState, useEffect } from 'react';
import { CryptoStorage } from '../utils/storage';

interface UserType {
  email?: string;
  user_type?: string;
  access_token?: string;
  refresh_token?: string;
  user_name?: string;
  mobile_number?: string;
  user_id?: string;
  [key: string]: any;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: UserType | null;
  setUser: (user: UserType | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage and CryptoStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = localStorage.getItem('isLoggedIn');
    return stored ? JSON.parse(stored) : false;
  });
  const [user, setUser] = useState<UserType | null>(() => {
    const auth = CryptoStorage.get('authentication') || JSON.parse(localStorage.getItem('authentication') || 'null');
    return auth ? auth : null;
  });

  // Sync from localStorage on mount and when storage changes (multi-tab or programmatic updates)
  useEffect(() => {
    const syncFromStorage = () => {
      const storedLoggedIn = localStorage.getItem('isLoggedIn');
      const loggedIn = storedLoggedIn ? JSON.parse(storedLoggedIn) : false;
      const auth = CryptoStorage.get('authentication') || JSON.parse(localStorage.getItem('authentication') || 'null');
      setIsLoggedIn(!!loggedIn);
      setUser(auth || null);
    };
    syncFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || ['isLoggedIn','authentication','access_token','refresh_token'].includes(e.key)) {
        syncFromStorage();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Update localStorage and CryptoStorage when state changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    if (isLoggedIn && user) {
      CryptoStorage.add('authentication', user);
      localStorage.setItem('authentication', JSON.stringify(user));
    }
    if (!isLoggedIn) {
      localStorage.removeItem('authentication');
    }
  }, [isLoggedIn, user]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useAuthData = useAuth;

export const setAuthData = (data: any) => {
  CryptoStorage.add('authentication', data);
};

