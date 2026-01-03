import React from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import AgentMyPropertyListingsDesktop from './AgentMyPropertyListingsDesktop';
import AgentMyPropertyListingsMobile from './AgentMyPropertyListingsMobile';

const AgentMyPropertyListings: React.FC = () => {
  const isMobile = useIsMobile();
  return isMobile ? <AgentMyPropertyListingsMobile /> : <AgentMyPropertyListingsDesktop />;
};

export default AgentMyPropertyListings; 