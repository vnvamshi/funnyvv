import React from 'react';
import BuilderProfileInfo from './BuilderProfileInfo';
import SecurityTab from '../../agent/profile/SecurityTab';
import AboutBuilderTab from './AboutBuilderTab';

interface Props {
  builderData: any;
  onProfileUpdated?: () => void;
}

const BuilderProfileMobile: React.FC<Props> = ({ builderData, onProfileUpdated }) => {
  const userData = builderData?.user_detail || {};
  
  // Calculate promote flags for mobile
  const promoteFlags: Record<string, boolean> = {
    logo_url: !!(builderData?.company_details?.logo_url),
    about_me: false,
    service_areas: !!(builderData?.service_locations && builderData.service_locations.length > 0),
    business_registration: !!(builderData?.business_registration?.business_name),
  };
  const completedCount = Object.values(promoteFlags).filter(Boolean).length;
  const promotePercentage = Math.round((completedCount / 4) * 100);

  return (
    <div className="w-full mx-auto py-4 px-2 space-y-4">
      {/* Promote Card */}
      <div className="bg-[#F6F8F7] rounded-xl p-4 w-full max-w-full">
        <div className="font-semibold text-base mb-2">Promote yourself in Vistaview</div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className="bg-[#007E67] h-2 rounded-full transition-all duration-700"
            style={{ width: `${promotePercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-[#007E67] font-medium mb-2">
          Your profile is {promotePercentage}% complete
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl p-4 shadow">
        <BuilderProfileInfo builderData={builderData} onProfileUpdated={onProfileUpdated} />
      </div>

      {/* About Builder Tab */}
      <div className="w-full">
        <AboutBuilderTab builderData={builderData} onProfileUpdated={onProfileUpdated} />
      </div>

      {/* Security Tab */}
      <div className="w-full">
        <SecurityTab userData={userData} />
      </div>
    </div>
  );
};

export default BuilderProfileMobile;
