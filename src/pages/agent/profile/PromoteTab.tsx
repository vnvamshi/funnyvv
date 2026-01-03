import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import tickIcon from '../../../assets/images/tick-icon.svg';

interface PromoteTabProps {
  user: any;
}

const checklist = [
  { key: 'profile_photo', label: 'Photo', add: 'Add a photo' },
  { key: 'about_me', label: 'About me', add: 'Add about me' },
  { key: 'service_areas', label: 'Service areas', add: 'Add service areas' },
  { key: 'mls_agent_id', label: 'MLS Agent ID', add: 'Add MLS Agent ID' },
];

const PromoteTab: React.FC<PromoteTabProps> = ({ user }) => {
  const promoteFlags = user?.promote_flags || {};
  const promotePercentage = user?.promote_percentage || 0;

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
                item.label + (item.key === 'about_me' ? ' added' : ' added')
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