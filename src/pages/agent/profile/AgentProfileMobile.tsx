import React, { useEffect, useState } from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import PromoteTab from './PromoteTab';
import AgentTabs from './AgentTabs';
import { useNavigate } from 'react-router-dom';
import menuIcon from '../../../assets/images/menu-icon.svg';
import MobileAgentMenu from '../../../components/MobileAgentMenu';
import { useAuth, useAuthData } from '../../../contexts/AuthContext';
import tickIcon from '../../../assets/images/tick-icon.svg';
import AboutAgentMobileModal from './AboutAgentMobileModal';
import AgentFooterNav from '../../../components/AgentFooterNav';

interface AgentProfileMobileProps {
  user: any;
  onProfileUpdated?: () => void;
}

const formatStatValue = (value?: number | string | null) => {
  const numericValue = typeof value === 'number' ? value : Number(value || 0);
  if (!Number.isFinite(numericValue)) {
    return '00';
  }
  return Math.max(0, numericValue).toString().padStart(2, '0');
};

const ProfileSkeleton = () => (
  <div className="w-full mx-auto py-4 px-2 space-y-4 overflow-x-hidden" style={{ paddingTop: 80, paddingBottom: 72 }}>
    <div className="bg-[#F6F8F7] rounded-xl p-4 w-full max-w-full animate-pulse">
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden" />
      <div className="h-3 w-1/3 bg-gray-200 rounded" />
    </div>
    <div className="bg-white rounded-xl p-4 shadow flex flex-col w-full max-w-full animate-pulse">
      <div className="flex items-center mb-2">
        <div className="w-20 h-20 bg-gray-200 rounded-full mr-4" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
          <div className="h-3 w-2/3 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-3 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
    </div>
    <div className="grid grid-cols-2 gap-2 w-full max-w-full">
      <div className="bg-[#DFFFF8] rounded-xl flex flex-col items-left py-4 pl-2 w-full max-w-full animate-pulse">
        <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
        <div className="h-8 w-1/3 bg-gray-200 rounded" />
      </div>
      <div className="bg-[#DFFFF8] rounded-xl flex flex-col items-left py-4 pl-2 w-full max-w-full animate-pulse">
        <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
        <div className="h-8 w-1/3 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const AgentProfileMobile: React.FC<AgentProfileMobileProps> = ({ user, onProfileUpdated }) => {
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    setUserData(user);
  }, [user]);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="w-full mx-auto fixed top-0 left-0 right-0 z-40">
        <div className="bg-gradient-to-r from-[#17695C] to-[#007E67] px-4 pt-2 pb-4 rounded-t-lg relative">
          <div className="flex items-center mt-2">
            <button onClick={() => setMenuOpen(true)}>
              <img src={menuIcon} alt="Menu" className="w-6 h-6 text-white" />
            </button>
            <span className="text-white font-semibold text-lg ml-5">My Account</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ paddingTop: 80, paddingBottom: 72 }}>
        {userData ? (
          <div className="w-full mx-auto py-4 px-2 space-y-4 overflow-x-hidden">
            {/* Promote Card */}
            <div className="bg-[#F6F8F7] rounded-xl p-4 w-full max-w-full">
              <div className="font-semibold text-base mb-2">Promote yourself in Vistaview</div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="bg-[#007E67] h-2 rounded-full transition-all duration-700"
                  style={{ width: `${userData?.promote_percentage || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-[#007E67] font-medium mb-2">
                Your profile is {userData?.promote_percentage || 0}% complete
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl p-4 shadow flex flex-col w-full max-w-full">
              <div className="flex items-center mb-2">
                <div className="w-20 h-20 flex items-center justify-center text-4xl text-gray-400 mr-4 rounded-full overflow-hidden bg-[#BFE3D7]">
                  {userData?.profile_photo_url ? (
                    <img
                      src={userData.profile_photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-full h-auto max-w-[80px]" viewBox="0 0 167 167" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="83.5" cy="83.5" r="69.5" fill="#007E67" opacity="0.4" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    className="text-primary-color text-sm font-semibold flex text-right gap-1 hover:underline"
                    onClick={() => {
                      navigate('/agent/profile/update', { state: { user: userData } });
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="#17695C" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M16.5 7.5l-9 9M9 7.5h7.5V15" />
                    </svg>
                    Edit
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold">{userData?.username}</div>
                    {userData?.mls_agent_id ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white"
                        style={{
                          background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                        }}>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          }}>
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 3L4.5 8.5L2 6" stroke="#004236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span>Licensed Agent</span>
                      </div>
                    ) : (
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFE3E3] text-[#E03131]">
                        Not Licensed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mb-2 flex flex-wrap gap-2 items-center">
                    <span>
                      Display Name :
                      <span className="font-semibold text-black"> {userData?.username || '--'}</span>
                    </span>
                    <span className="text-gray-400">|</span>
                    {userData?.mls_agent_id ? (
                      <span>
                        License ID :
                        <span className="font-semibold text-black"> {userData.mls_agent_id}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="text-primary-color font-semibold hover:underline"
                        onClick={() => {
                          navigate('/agent/profile/update', { state: { user: userData } });
                        }}
                      >
                        Add License ID
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#007E67] mb-2">
                    <FiMail />
                    <span>{userData?.email || 'Email not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#007E67]">
                    <FiPhone />
                    <span>{userData?.mobile_number || 'Phone not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-xs text-gray-700 w-full justify-center border-t pt-2 mt-2">
              <FiMapPin className="text-primary-color" />
              <div>
                {userData?.address ? (
                  <span className="font-semibold block leading-tight text-primary-color pb-2 break-words whitespace-pre-line w-full">
                    {userData.address}
                  </span>
                ) : (
                  <span className="text-gray-500 block">No office address added yet</span>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col gap-3 w-full max-w-full">
              {[
                { label: 'MLS Synced', value: formatStatValue(userData?.mls_properties_count), accent: 'text-[#DB2C2C]' },
                { label: 'Listed in Vistaview', value: formatStatValue(userData?.vistaview_properties_count), accent: 'text-[#0B7B4A]' },
                { label: 'In drafts', value: formatStatValue(userData?.draft_properties), accent: 'text-[#0B7B4A]' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <div className="text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">{stat.label}</div>
                  <div className={`text-4xl font-bold ${stat.accent}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Tabs Section */}
            {userData && (
              <AgentTabs userData={userData} onEditAboutAgent={() => setShowAboutModal(true)} />
            )}
          </div>
        ) : (
          <ProfileSkeleton />
        )}
      </div>

      {/* Footer and Modals */}
      <AgentFooterNav active="profile" />
      {isLoggedIn && <MobileAgentMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
      <AboutAgentMobileModal
        open={showAboutModal}
        onCancel={() => setShowAboutModal(false)}
        user={userData}
        onUpdated={onProfileUpdated}
      />
    </>
  );
};

export default AgentProfileMobile;
