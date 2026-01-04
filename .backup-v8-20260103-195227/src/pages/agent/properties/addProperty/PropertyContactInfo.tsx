import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MailIcon, MobileIcon, LocationIcon, EditIcon, ShareIcon } from '../../../../assets/icons/ContactInfoIcons';
import AgentProfileModal from '../../profile/AgentProfileModal';
import EditIconSvg from '../../../../assets/images/edit-icon.svg';

interface PropertyContactInfoProps {
  initialValues: any;
  userData: any;
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
}

const PropertyContactInfo = ({ initialValues, userData, onBack, onSaveDraft, onNext }: PropertyContactInfoProps) => {
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { id } = useParams<{ id: string }>();

  return (
    <div className="w-full px-8 py-8">
      <div className="text-2xl font-semibold mb-1 mt-2">Update your contact details</div>
      <div className="text-base text-[#222] mb-0">{initialValues?.address}, {initialValues?.city_detail?.name}, {initialValues?.state_detail?.name}, {initialValues?.country_detail?.name}, {initialValues?.postalCode}</div>
      <div className="text-base text-[#222] mb-4">Property type : <span className="font-bold">{initialValues?.propertyType?.name}</span></div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mt-8 mb-8 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-[#E5E7EB] flex items-center justify-center text-6xl text-[#7A8A99] overflow-hidden">
              {userData?.profile_photo_url ? (
                <img 
                  src={userData.profile_photo_url} 
                  alt={`${userData?.username || 'Agent'} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#B0B0B0"/><rect x="4" y="16" width="16" height="6" rx="3" fill="#B0B0B0"/></svg>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight mb-1">{userData?.username || 'N/A'}</div>
              <div className="text-sm text-[#222] mb-2">Display Name : <span className="font-medium">{userData?.username || 'N/A'}</span> | MLS Agent ID : <span className="font-bold">{userData?.mls_agent_id || 'N/A'}</span></div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[#007E67] text-sm">
                  <MailIcon />
                  <span>{userData?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#007E67] text-sm">
                  <MobileIcon />
                  <span>{userData?.mobile_number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#007E67] text-sm">
                  <LocationIcon />
                  <span>{userData?.office || 'Office'}</span>
                </div>
                <div className="text-xs text-[#444]">
                  {userData?.address ? (
                    userData.address.split('\n').map((line: string, index: number) => (
                      <div key={index} className={index === 0 ? 'font-bold' : ''}>
                        {line}
                      </div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 md:mt-0 md:ml-8">
            <button
              className="flex items-center gap-2 px-5 py-2 border border-[#007E67] rounded-lg text-[#007E67] font-semibold bg-white hover:bg-[#F3F3F3] w-32 justify-center"
              onClick={() => setShowProfileModal(true)}
            >
              <img src={EditIconSvg} alt="Edit" className="w-5 h-5" />
              Edit
            </button>
            <button className="flex items-center gap-2 px-5 py-2 border border-[#007E67] rounded-lg text-[#007E67] font-semibold bg-white hover:bg-[#F3F3F3] w-32 justify-center">
              <ShareIcon />
              Share
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8 mb-8">
        {!id && (
          <button
            onClick={async () => {
              setLoading(true);
              await onSaveDraft();
              setLoading(false);
            }}
            className="px-6 py-2 border border-[#007E67] rounded text-[#007E67] font-semibold bg-white hover:bg-[#F3F3F3]"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save as draft'}
          </button>
        )}
        <button onClick={onNext} className="px-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] shadow hover:opacity-90">Next</button>
      </div>
      {/* Agent Profile Modal */}
      <AgentProfileModal
        open={showProfileModal}
        userData={userData}
        onCancel={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default PropertyContactInfo; 