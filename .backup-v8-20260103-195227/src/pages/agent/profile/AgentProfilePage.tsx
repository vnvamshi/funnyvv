import React, { useEffect, useState } from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import AgentProfileMobile from './AgentProfileMobile';
import AgentProfileDesktop from './AgentProfileDesktop';
import useIsTab from '../../../hooks/useIsTab';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import { useLocation } from 'react-router-dom';

// Skeleton loader for profile info (matches AgentProfileInfo layout)
const AgentProfileSkeleton: React.FC<{ mobile?: boolean }> = ({ mobile }) => (
  mobile ? (
    <div className="w-full mx-auto py-4 px-2 space-y-4 animate-pulse">
      <div className="bg-[#F6F8F7] rounded-xl p-4 w-full max-w-full">
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
        <div className="h-2 w-1/3 bg-gray-200 rounded mb-2" />
        <div className="h-2 w-1/4 bg-gray-200 rounded mb-2" />
      </div>
      <div className="bg-white rounded-xl p-4 shadow flex flex-col w-full max-w-full">
        <div className="flex items-center mb-2">
          <div className="w-20 h-20 bg-gray-200 rounded-full mr-4" />
          <div className="flex flex-col gap-0.5 flex-1">
            <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          </div>
        </div>
        <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-full">
        <div className="bg-[#DFFFF8] rounded-xl flex flex-col items-left py-4 pl-2 w-full max-w-full">
          <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
        </div>
        <div className="bg-[#DFFFF8] rounded-xl flex flex-col items-left py-4 pl-2 w-full max-w-full">
          <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex mx-auto py-8 animate-pulse">
      <div className="w-[60%] bg-white rounded-xl pl-10 pr-5 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 min-w-[150px]">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-2" />
          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
        </div>
      </div>
      <div className="w-[40%] bg-white rounded-xl pr-10 flex flex-col gap-6">
        <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
      </div>
    </div>
  )
);

const AgentProfilePage: React.FC = () => {
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const {user} = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    getUser();
  }, [])

  useEffect(() => {
    if (location.state && (location.state as any).refresh) {
      getUser();
      // Remove the refresh flag so it doesn't trigger again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const getUser = async () => {
    const response = await api.get('/common/profile-subscription/');
    if(response.data.status_code === 200){
      setUserData(response.data.data?.profile);
    }
  }   

  // Provide a callback to children to refresh user data after update
  const handleProfileUpdated = () => {
    getUser();
  };

  if (!userData) {
    return isMobile ? <AgentProfileSkeleton mobile /> : <AgentProfileSkeleton />;
  }

  return isMobile ? (
    <AgentProfileMobile user={userData} onProfileUpdated={handleProfileUpdated}/>
  ) : (
    <AgentProfileDesktop user={userData} onProfileUpdated={handleProfileUpdated} />
  );
}

export default AgentProfilePage; 