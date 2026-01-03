import React, { useEffect, useState } from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import BuilderProfileDesktop from './BuilderProfileDesktop';
import BuilderProfileMobile from './BuilderProfileMobile';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchBuilderOnboarding } from '../../../utils/api';

// Skeleton loader for profile info
const BuilderProfileSkeleton: React.FC<{ mobile?: boolean }> = ({ mobile }) => (
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

const BuilderProfilePage: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [builderData, setBuilderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBuilderData();
  }, [user?.user_id]);

  const getBuilderData = async () => {
    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchBuilderOnboarding(user.user_id);
      if (response.status && response.data) {
        setBuilderData(response.data);
      }
    } catch (error) {
      console.error('Error fetching builder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = () => {
    getBuilderData();
  };

  if (loading) {
    return isMobile ? <BuilderProfileSkeleton mobile /> : <BuilderProfileSkeleton />;
  }

  if (!builderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No builder data found</p>
      </div>
    );
  }

  return isMobile ? (
    <BuilderProfileMobile builderData={builderData} onProfileUpdated={handleProfileUpdated} />
  ) : (
    <BuilderProfileDesktop builderData={builderData} onProfileUpdated={handleProfileUpdated} />
  );
};

export default BuilderProfilePage;

