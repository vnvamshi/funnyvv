import React, { useState, useEffect } from 'react';
import { PropertyDetails, PropertyTab } from '../../PropertyDetails/types';
import AgentPropertyDetailsMedia from './AgentPropertyDetailsMedia';
import AgentPropertyDetailsContactInfo from './AgentPropertyDetailsContactInfo';
import AgentPropertyListingDetailsMobile from './AgentPropertyListingDetailsMobile';
import MobileShareButton from '../../../components/MobileShareButton';
import ButtonLoader from '../../../components/ButtonLoader';
import editIconWhite from '../../../assets/images/edit-icon-white.svg';
import { useNavigate } from 'react-router-dom';
import { navigateToMobilePropertyEditWithAPI } from '../../../utils/navigation';
import api from '../../../utils/api';

const TABS: { key: PropertyTab; label: string }[] = [
  { key: 'overview', label: 'Listing details' },
  { key: 'media', label: 'Media' },
  { key: 'contact', label: 'Contact info' },
];

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

const AgentPropertyDetailsMobile: React.FC<Props> = ({ property, activeTab, setActiveTab, onToggleSave, refreshProperty }) => {
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setAgentLoading(true);
    api.get('/common/profile-subscription/')
      .then(res => {
        if (isMounted) {
          setAgentInfo(res.data?.data?.profile || {});
          setAgentLoading(false);
        }
      })
      .catch(() => setAgentLoading(false));
    return () => { isMounted = false; };
  }, []);

  const handleTabClick = (tab: PropertyTab) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    navigate('/agent/properties/listings');
  };

  // Function to navigate to mobile property add with prefilled data
  const handleEditProperty = async () => {
    setIsEditLoading(true);
    try {
      // Use the API-based utility function to fetch property data and navigate
      await navigateToMobilePropertyEditWithAPI(navigate, property.property_id, 'details');
    } catch (error) {
      console.error('Error navigating to edit:', error);
    } finally {
      setIsEditLoading(false);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AgentPropertyListingDetailsMobile property={property} />;
      case 'media':
        return <AgentPropertyDetailsMedia property={property} refreshProperty={refreshProperty} />;
      case 'contact':
        return <AgentPropertyDetailsContactInfo property={property} agentInfo={agentInfo} />;
      default:
        return <AgentPropertyListingDetailsMobile property={property} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAF9] flex flex-col relative">
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-2 border-b border-gray-100 bg-white sticky top-0 z-30">
        <button className="mr-2 p-2 -ml-2" aria-label="Back" onClick={handleBack}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-green-900 text-xl font-bold">Listing</span>
      </div>
      {/* Property details (not sticky) */}
      <div className="px-4 pt-4 pb-2 bg-white">
        <div className="text-xl font-bold text-[#222] mb-1">{property.name}</div>
        <div className="text-xs text-gray-500 mb-2">{property.address}, {property.city}, {property.state}, {property.country}</div>
        <div className="flex gap-2 items-center mb-2">
          <span className="font-bold">Property type :</span> <span>{property.property_type?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Listed on {property.created_at ? new Date(property.created_at).toLocaleDateString() : '--'}</span>
            <span className="text-xs text-gray-400">{getDaysAgo(property.created_at)}</span>
          </div>
          <span className="bg-green-200 text-green-800 px-2 py-1 rounded-lg font-semibold ml-2">Active</span>
        </div>
      </div>
      {/* Tab bar (sticky after header) */}
      <div className="bg-white border-b border-gray-100 sticky top-[56px] z-20">
        <div className="flex justify-between px-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex-1 py-3 text-center font-semibold text-base relative transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-[#007E67] font-bold'
                  : 'text-[#222] font-normal'
              }`}
              onClick={() => handleTabClick(tab.key)}
              style={{letterSpacing: 0.1}}
            >
              <span className="block">{tab.label}</span>
              {activeTab === tab.key && (
                <div className="absolute left-0 right-0 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]" />
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {renderContent()}
      </div>
      {/* Sticky Footer with Share and Edit buttons */}
      <div className="fixed bottom-0 left-0 w-full bg-white z-30 flex gap-4 px-4 py-3 border-t border-gray-200">
        <MobileShareButton className="flex-1 rounded-lg" />
        <button
          className="flex-1 flex items-center justify-center gap-2 rounded-lg py-4 font-bold text-white text-lg bg-gradient-to-r from-[#005C4B] to-[#009378] shadow-lg transition-all duration-200 hover:opacity-90"
          style={{ boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10)' }}
          onClick={handleEditProperty}
          disabled={isEditLoading}
        >
          {isEditLoading ? (
            <ButtonLoader text="Loading..." />
          ) : (
            <>
              <img src={editIconWhite} alt="Edit" className="w-6 h-6" />
              <span>Edit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AgentPropertyDetailsMobile; 