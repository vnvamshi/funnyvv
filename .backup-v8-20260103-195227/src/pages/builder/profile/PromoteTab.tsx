import React from 'react';
import tickIcon from '../../../assets/images/tick-icon.svg';

interface PromoteTabProps {
  builderData: any;
}

const checklist = [
  { key: 'logo_url', label: 'Logo', add: 'Add a logo' },
  { key: 'about_me', label: 'About me', add: 'Add about me' },
  { key: 'service_areas', label: 'Service areas', add: 'Add service areas' },
  { key: 'business_registration', label: 'Business Registration', add: 'Complete business registration' },
];

const PromoteTab: React.FC<PromoteTabProps> = ({ builderData }) => {
  // Calculate promote flags based on builder data
  const promoteFlags: Record<string, boolean> = {
    logo_url: !!(builderData?.company_details?.logo_url),
    about_me: false, // This would come from a separate API if available
    service_areas: !!(builderData?.service_locations && builderData.service_locations.length > 0),
    business_registration: !!(builderData?.business_registration?.business_name),
  };

  // Calculate percentage
  const completedCount = Object.values(promoteFlags).filter(Boolean).length;
  const promotePercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="bg-white rounded-xl p-10 shadow-sm w-full border border-gray-200 max-w-4xl mx-auto shadow-sm">
      <div className="font-semibold text-lg mb-2">Promote yourself in Vistaview</div>
      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className="bg-[#007E67] h-2 rounded-full transition-all duration-700"
          style={{ width: `${promotePercentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-[#007E67] font-medium mb-4">Your profile is {promotePercentage}% complete</div>
      <ol className="space-y-2 text-sm ">
        {checklist.map((item, idx) => (
          <li className="flex items-center gap-2" key={item.key}>
            {promoteFlags[item.key] ? (
              <img src={tickIcon} alt="tick" className="w-5 h-5" />
            ) : (
              <span className="bg-[#D0F2EBB2] w-5 h-5 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 text-xs">{idx + 1}</span>
            )}
            <span>
              {promoteFlags[item.key] ? (
                item.label + ' added'
              ) : (
                item.add
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default PromoteTab;

