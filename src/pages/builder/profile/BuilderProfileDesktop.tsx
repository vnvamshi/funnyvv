import React from 'react';
import BuilderProfileInfo from './BuilderProfileInfo';
import SecurityTab from '../../agent/profile/SecurityTab';
import PromoteTab from './PromoteTab';
import AboutBuilderTab from './AboutBuilderTab';

interface Props {
  builderData: any;
  onProfileUpdated?: () => void;
}

const BuilderProfileDesktop: React.FC<Props> = ({ builderData, onProfileUpdated }) => {
  // Extract user data from builder onboarding data
  const userData = builderData?.user_detail || {};

  return (
    <>
      <div className="flex mx-auto py-8">
        {/* Left: Profile Info */}
        <div className="w-[60%] bg-white rounded-xl pl-10 pr-5">
          <BuilderProfileInfo builderData={builderData} onProfileUpdated={onProfileUpdated} />
        </div>
        <div className="w-[40%] bg-white rounded-xl pr-10">
          <PromoteTab builderData={builderData} />
        </div>
      </div>
      <div className="w-full mx-auto">
        <div className="w-full">
          <AboutBuilderTab builderData={builderData} onProfileUpdated={onProfileUpdated} />
        </div>
        <div className="w-full">
          <SecurityTab userData={userData} />
        </div>
      </div>
    </>
  );
};

export default BuilderProfileDesktop;

