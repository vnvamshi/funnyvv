import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAddPropertyTabs from './MobileAddPropertyTabs';
import BottomModal from '../../../../../components/BottomModal';
import { MobilePropertyWizardProvider, useMobilePropertyWizard } from './MobilePropertyWizardContext';
import { MailIcon, MobileIcon, LocationIcon, EditIcon, ShareIcon } from '../../../../../assets/icons/ContactInfoIcons';

const PropertyContactInfoPageInner: React.FC = () => {
  const { handleContactInfoBack, handleContactInfoSaveDraft: _handleContactInfoSaveDraft, handleContactInfoNext, propertyInfoData, setPropertyInfoData, isSaving } = useMobilePropertyWizard();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  // const { id } = useParams(); // Removed as per edit hint

  // Get user data from context propertyInfoData.agent
  const [userData, setUserData] = useState(() => {
    const agentData = propertyInfoData?.agent;
    return agentData ? {
      username: agentData.username || agentData.first_name + ' ' + agentData.last_name || 'N/A',
      email: agentData.email || 'N/A',
      mobile_number: agentData.mobile_number || agentData.phone || 'N/A',
      office: agentData.office || 'Office',
      company: agentData.company || agentData.agency_name || 'N/A',
      address: agentData.address || agentData.office_address || 'N/A',
      mls_agent_id: agentData.mls_agent_id || agentData.agent_id || 'N/A',
    } : {
      username: 'N/A',
      email: 'N/A',
      mobile_number: 'N/A',
      office: 'Office',
      company: 'N/A',
      address: 'N/A',
      mls_agent_id: 'N/A',
    };
  });

  const handleBack = () => {
    handleContactInfoBack();
  };

  const handleSaveDraft = async () => {
    try {
      // Pass the latest propertyInfoData to the context handler
      // The context handler will handle the async saveProperty call
      await _handleContactInfoSaveDraft(propertyInfoData);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleNext = () => {
    handleContactInfoNext();
  };

  // Update userData when propertyInfoData.agent changes
  useEffect(() => {
    const agentData = propertyInfoData?.agent;
    console.log('PropertyContactInfoPage: propertyInfoData.agent updated:', agentData);
    if (agentData) {
      const newUserData = {
        username: agentData.username || agentData.first_name + ' ' + agentData.last_name || 'N/A',
        email: agentData.email || 'N/A',
        mobile_number: agentData.mobile_number || agentData.phone || 'N/A',
        office: agentData.office || 'Office',
        company: agentData.company || agentData.agency_name || 'N/A',
        address: agentData.address || agentData.office_address || 'N/A',
        mls_agent_id: agentData.mls_agent_id || agentData.agent_id || 'N/A',
      };
      console.log('PropertyContactInfoPage: Setting userData:', newUserData);
      setUserData(newUserData);
    }
  }, [propertyInfoData?.agent]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Spinner overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}
      {/* Mobile Header */}
      <div className="flex items-center px-4 pt-6 pb-2 bg-white shadow-none">
        <button
          className="mr-2 p-2 -ml-2"
          onClick={handleBack}
          aria-label="Back"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-green-900 text-2xl font-bold">{propertyInfoData?.id ? 'Update Property' : 'Add Property'}</span>
      </div>
              <MobileAddPropertyTabs currentStep={4} />
      {/* Main Content */}
      <div className="flex flex-col px-6 pt-6 pb-32">
        <div className="text-3xl font-bold text-[#222] mb-2">Update your contact details</div>
        {/* Address in green, only if present and not N/A */}
        {propertyInfoData?.address && propertyInfoData.address !== 'N/A' && (
          <div className="text-base text-[#007E67] mb-6">
            {propertyInfoData.address}
            {propertyInfoData.city_detail?.name ? `, ${propertyInfoData.city_detail.name}` : ''}
            {propertyInfoData.state_detail?.name ? `, ${propertyInfoData.state_detail.name}` : ''}
            {propertyInfoData.country_detail?.name ? `, ${propertyInfoData.country_detail.name}` : ''}
            {propertyInfoData.postalCode ? `, ${propertyInfoData.postalCode}` : ''}
          </div>
        )}
        <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{propertyInfoData?.propertyType?.name}</span></div>
        <div className="border-b border-[#E5E7EB] mb-8" />
        
        {/* Contact Info Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-8 flex flex-col">
          <div className="flex gap-4 items-center">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-[#4CB08A] flex items-center justify-center">
              {/* Simple user icon SVG */}
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#4CB08A" />
                <circle cx="20" cy="15" r="7" fill="#E5E7EB" />
                <ellipse cx="20" cy="28.5" rx="11" ry="6.5" fill="#E5E7EB" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold text-black truncate">{userData?.username && userData.username !== 'N/A' ? userData.username : ''}</div>
              <div className="text-sm text-[#222] mt-1">
                Display Name : <span className="font-semibold">{userData?.username && userData.username !== 'N/A' ? userData.username : ''}</span>
              </div>
              {userData?.mls_agent_id && userData.mls_agent_id !== 'N/A' && (
                <div className="text-sm text-[#222] mb-2">MLS Agent ID : <span className="font-bold">{userData.mls_agent_id}</span></div>
              )}
              <div className="flex flex-col gap-1 mb-2">
                {userData?.email && userData.email !== 'N/A' && (
                  <div className="flex items-center gap-2 text-[#007E67] text-sm">
                    <MailIcon />
                    <span className="truncate">{userData.email}</span>
                  </div>
                )}
                {userData?.mobile_number && userData.mobile_number !== 'N/A' && (
                  <div className="flex items-center gap-2 text-[#007E67] text-sm">
                    <MobileIcon />
                    <span className="truncate">{userData.mobile_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-[#E5E7EB] my-4" />
          <div className="flex gap-2 items-start">
            <LocationIcon />
            <div>
              <div className="font-semibold text-[#007E67] text-sm mb-1 truncate">{userData?.company && userData.company !== 'N/A' ? userData.company : ''}</div>
              <div className="text-sm text-black whitespace-pre-line">
                {userData?.address && userData.address !== 'N/A'
                  ? (() => {
                      const lines = userData.address.split('\n');
                      return (
                        <>
                          <div className="font-bold">{lines[0]}</div>
                          {lines.slice(1).map((line: string, idx: number) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </>
                      );
                    })()
                  : ''}
              </div>
            </div>
          </div>
        </div>

      {/* Sticky Footer Buttons */}
      <div className="fixed bottom-0 left-0 w-full z-30 bg-white border-t flex gap-4 px-6 py-4">
        <button 
          className="flex-1 py-3 rounded-lg font-bold text-lg border-2 border-green-900 text-green-900 bg-white"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save as draft'}
        </button>
        <button 
          className="gradient-btn-equal flex-1 py-3 rounded-lg font-bold text-lg shadow-lg"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
      </div>

      {/* Agent Profile Modal - Placeholder */}
      {showProfileModal && (
        <BottomModal
          open={showProfileModal}
          title="Edit Profile"
          onCancel={() => setShowProfileModal(false)}
          onSubmit={() => setShowProfileModal(false)}
          submitLabel="Save"
        >
          <p>Profile editing functionality would be implemented here.</p>
        </BottomModal>
      )}
    </div>
  );
};

const PropertyContactInfoPage: React.FC = () => (
  <MobilePropertyWizardProvider>
    <PropertyContactInfoPageInner />
  </MobilePropertyWizardProvider>
);

export default PropertyContactInfoPage;