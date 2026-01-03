import React from 'react';
import PropertyMediaPage from './addProperty/mobile/PropertyMediaPage';

interface Props {
  property: any;
  refreshProperty?: () => void;
}

const AgentPropertyDetailsMedia: React.FC<Props> = ({ property, refreshProperty }) => {
  return <PropertyMediaPage hideDetailsAboveAccordion={true} hideHeader={true} hideFooter={true} isAgentPropertyDetails={true} refreshProperty={refreshProperty} />;
};

export default AgentPropertyDetailsMedia; 