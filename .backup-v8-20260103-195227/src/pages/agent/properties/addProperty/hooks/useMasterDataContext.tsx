import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../../../../../utils/api';

// Define the shape of master data
export interface MasterData {
  appliancetype?: any[];
  indoorfeature?: any[];
  outdooramenity?: any[];
  viewtype?: any[];
  communitytype?: any[];
  roomtype?: any[];
  basementtype?: any[];
  floorcovering?: any[];
  architecturalstyle?: any[];
  exteriortype?: any[];
  rooftype?: any[];
  parkingtype?: any[];
  [key: string]: any;
}

interface MasterDataContextType {
  masterData: MasterData;
  loading: boolean;
  fetchMasterData: (tables: string[]) => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [masterData, setMasterData] = useState<MasterData>({});
  const [loading, setLoading] = useState(false);
  const [fetchedTables, setFetchedTables] = useState<Set<string>>(new Set());

  // Fetch master data for given tables if not already fetched
  const fetchMasterData = async (tables: string[]) => {
    const tablesToFetch = tables.filter(t => !fetchedTables.has(t));
    if (tablesToFetch.length === 0) return;
    setLoading(true);
    try {
      const response = await api.post('/common/master/list/', { tables: tablesToFetch });
      if (response.data) {
        setMasterData(prev => ({ ...prev, ...response.data }));
        setFetchedTables(prev => new Set([...Array.from(prev), ...tablesToFetch]));
      }
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterDataContext.Provider value={{ masterData, loading, fetchMasterData }}>
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
}; 