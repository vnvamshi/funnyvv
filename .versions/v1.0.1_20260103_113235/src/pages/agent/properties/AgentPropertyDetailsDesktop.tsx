import React, { useState, useEffect, useCallback } from 'react';
import { PropertyDetails, PropertyTab } from '../../PropertyDetails/types';
import AgentMediaTabs from '../../../components/AgentMediaTabs';
import AgentPropertyDetailsContactInfo from './AgentPropertyDetailsContactInfo';
import AgentPropertyListingDetails from './AgentPropertyListingDetails';
import api from '../../../utils/api';

const TABS: { key: PropertyTab; label: string }[] = [
  { key: 'overview', label: 'Listing details' },
  { key: 'media', label: 'Media' },
  { key: 'contact', label: 'Contact info' },
];

const tabLineGradient = 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)';

interface Props {
  property: PropertyDetails;
  activeTab: PropertyTab;
  setActiveTab: (tab: PropertyTab) => void;
  onToggleSave: (userId: string, is_saved: boolean) => void;
  refreshProperty: () => void;
}

function getDaysAgo(dateString: string | undefined): string {
  if (!dateString) return '--';
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function getStatusBadge(status: string | undefined): React.ReactElement {
  let label = '--';
  let bg = 'bg-gray-200';
  let text = 'text-gray-700';
  if (status === 'published' || status === 'active') {
    label = 'Active';
    bg = 'bg-green-200';
    text = 'text-green-800';
  } else if (status === 'draft' || status === 'inDraft') {
    label = 'Draft';
    bg = 'bg-yellow-100';
    text = 'text-yellow-700';
  } else if (status === 'inactive' || status === 'inActive') {
    label = 'Inactive';
    bg = 'bg-red-100';
    text = 'text-red-600';
  } else if (status) {
    label = status.charAt(0).toUpperCase() + status.slice(1);
  }
  return (
    <span className={`px-4 py-1 rounded-lg font-semibold text-xs ${bg} ${text}`}>{label}</span>
  );
}

const AgentPropertyDetailsDesktop: React.FC<Props> = ({ property, activeTab, setActiveTab, onToggleSave, refreshProperty }) => {
  // Efficient agent info loading
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [agentInfoLoading, setAgentInfoLoading] = useState(false);

  // Fetch agent info only once or when property.agent changes
  const fetchAgentInfo = useCallback(() => {
    setAgentInfoLoading(true);
    api.get('/common/profile-subscription/')
      .then(res => {
        setAgentInfo(res.data?.data?.profile || {});
        setAgentInfoLoading(false);
      })
      .catch(() => setAgentInfoLoading(false));
  }, []);

  useEffect(() => {
    fetchAgentInfo();
    // Only refetch if property.agent changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property.agent]);

  // Handler for manual refresh (after edit)
  const handleRefreshAgentInfo = () => {
    fetchAgentInfo();
  };

  // Only the parent controls the tab bar and which section is shown
  const handleTabClick = (tab: PropertyTab) => {
    setActiveTab(tab);
  };

  // Handle media changes and refresh property data
  const handleMediaChange = () => {
    refreshProperty();
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#F8FAF9] min-h-screen">
      <div className="w-full px-8 mt-8">
        {/* Top details */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-2xl font-bold text-[#222] mb-1">{property.name}</div>
            <div className="text-sm text-gray-500 mb-2">{property.address}, {property.city}, {property.state}, {property.country}</div>
            <div className="flex gap-4 items-center mb-2">
              <span className="font-bold">Property type :</span> <span>{property.property_type?.name}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">Listed on {property.created_at ? new Date(property.created_at).toLocaleDateString() : '--'}</span>
              <span className="text-xs text-gray-400">{getDaysAgo(property.created_at)}</span>
              {getStatusBadge(property.status)}
            </div>
          </div>
        </div>
        {/* Tabs - always visible at the top */}
        <div className="flex border-b overflow-x-auto scrollbar-hide mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex-shrink-0 py-3 px-4 text-center font-semibold relative min-w-[120px] ${
                activeTab === tab.key
                  ? 'text-green-900'
                  : 'text-[#7C7C7C]'
              }`}
              onClick={() => handleTabClick(tab.key)}
            >
              <span className="text-sm">{tab.label}</span>
              {activeTab === tab.key && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                  style={{ background: tabLineGradient }}
                />
              )}
            </button>
          ))}
        </div>
        {/* Main content area - only one section visible at a time */}
        <div className="w-full">
          {activeTab === 'overview' && <AgentPropertyListingDetails property={property} />}
          {activeTab === 'media' && <AgentMediaTabs property={property} editable={true} onMediaChange={handleMediaChange} />}
          {activeTab === 'contact' && (
            <AgentPropertyDetailsContactInfo
              property={property}
              agentInfo={agentInfo}
              agentInfoLoading={agentInfoLoading}
              refreshAgentInfo={handleRefreshAgentInfo}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentPropertyDetailsDesktop; 