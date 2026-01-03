import React from 'react';
import AgentProfileInfo from './AgentProfileInfo';
import AboutAgentTab from './AboutAgentTab';
import SecurityTab from './SecurityTab';
import PromoteTab from './PromoteTab';
import { Desktop } from 'phosphor-react';
import ServiceSection from '../../Home/DesktopServiceSectionUI';


interface Props {
  user: any;
  onProfileUpdated?: () => void;
}

const AgentProfileDesktop: React.FC<Props> = ({user, onProfileUpdated}) => {

  return (
    <><div className="flex mx-auto py-8">
      {/* Left: Profile Info */}
      <div className="w-[60%] bg-white rounded-xl pl-10 pr-5">
        <AgentProfileInfo user={user} onProfileUpdated={onProfileUpdated} />
      </div>
      <div className="w-[40%] bg-white rounded-xl pr-10">
        <PromoteTab user={user} />
      </div>
      
    </div>
    <div className="w-full mx-auto">
      <div className="w-full">
        <AboutAgentTab user={user} onProfileUpdated={onProfileUpdated} />
      </div>
      <div className="w-full">
        <SecurityTab userData={user} />
      </div>
    </div>
    {/* <ServiceSection /> */}
    
    </>
  );
};

export default AgentProfileDesktop; 