import React from 'react';
import { PropertyDetails } from '../../PropertyDetails/types';
import { MailIcon, MobileIcon, LocationIcon } from '../../../assets/icons/ContactInfoIcons';

interface Props {
  property: PropertyDetails;
  agentInfo?: any;
}

const AgentPropertyDetailsContactInfo: React.FC<Props> = ({ property, agentInfo }) => {
  const agent = agentInfo || (property.agent && typeof property.agent.id === 'object' ? property.agent.id : property.agent);
  const email = agent?.email || '';
  const phone = agent?.mobile_number || '';
  const mlsAgentId = (agent && 'mls_agent_id' in agent) ? agent.mls_agent_id : 'N/A';
  const displayName = agent?.username || agent?.name || 'N/A';
  const company = agent?.company || agent?.agency_name || '';
  const companyAddress = agent?.address || '';
  const address = property.address || '';
  const city = property.city || '';
  const state = property.state || '';
  const country = property.country || '';

  return (
    <div className="w-full px-0 py-0">
      {/* Promote Card */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="font-semibold text-base mb-2">Property listing strength</div>
        <div className="w-full bg-[#EAF4F2] rounded-full h-3 mb-2 overflow-hidden">
          <div
            className="bg-[#007E67] h-3 rounded-full transition-all duration-700"
            style={{ width: `${property.listing_strength_percentage ?? 0}%` }}
          />
        </div>
        <div className="text-xs text-[#007E67] font-medium">
          Your profile is <span className="font-bold">{property.listing_strength_percentage ?? 0}%</span> complete
        </div>
      </div>
      {/* Agent Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 flex flex-col mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[#E5E7EB] flex items-center justify-center text-4xl text-[#7A8A99]">
            {agent?.profile_photo_url ? (
              <img src={agent.profile_photo_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#B0B0B0"/><rect x="4" y="16" width="16" height="6" rx="3" fill="#B0B0B0"/></svg>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold leading-tight mb-1">{displayName}</div>
            <div className="text-sm text-[#222] mb-2">Display Name : <span className="font-medium">{displayName}</span></div>
            {mlsAgentId && (
              <div className="text-sm text-[#222] mb-2">MLS Agent ID : <span className="font-bold">{mlsAgentId}</span></div>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-[#007E67] text-base font-medium hover:underline mb-1">
                <MailIcon />
                <span>{email}</span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-2 text-[#007E67] text-base font-medium hover:underline mb-1">
                <MobileIcon />
                <span>{phone}</span>
              </a>
            )}
          </div>
        </div>
        {(companyAddress) && (
          <div className="flex items-start gap-2 border-t pt-3 mt-2">
            <LocationIcon />
            <div>
              <div className="text-base font-bold text-[#007E67] mb-1">{company}</div>
              <div className="text-sm text-[#222]">{companyAddress}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPropertyDetailsContactInfo; 