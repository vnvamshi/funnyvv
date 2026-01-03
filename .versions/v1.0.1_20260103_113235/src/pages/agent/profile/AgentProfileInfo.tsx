import React, { useEffect, useState, useRef } from 'react';
import AgentProfileModal from './AgentProfileModal';
import api from '../../../utils/api';
import { showGlobalToast } from '../../../utils/toast';

// Utility function to upload a file to the API
const uploadProfilePhotoToAPI = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('photo', file);
  try {
    const response = await api.post('/common/profile/photo/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.status_code === 200) {
      return response.data?.data?.view_file_url;
    }
  } catch (error) {
    // do nothing, fall through to return null
  }
  return null;
};

interface AgentProfileInfoProps {
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

const AgentProfileInfo: React.FC<AgentProfileInfoProps> = ({user, onProfileUpdated}) => {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserData(user);
    setProfilePhotoUrl(user?.profile_photo_url || null);
  }, [user])

  useEffect(() => {
    setImageLoading(!!profilePhotoUrl);
  }, [profilePhotoUrl]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showGlobalToast('File is too large. Max size is 5MB.');
      return;
    }

    setUploadingPhoto(true);
    const uploadedUrl = await uploadProfilePhotoToAPI(file);
    
    if (uploadedUrl) {
      setProfilePhotoUrl(uploadedUrl);
      showGlobalToast('Profile photo uploaded successfully!');
      setUserData((prev: any) => ({ ...prev, profile_photo_url: uploadedUrl }));
      if (onProfileUpdated) onProfileUpdated();
      // Refresh the page to show updated agent info
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } else {
      showGlobalToast('Failed to upload profile photo.');
    }
    
    setUploadingPhoto(false);
    e.target.value = '';
  };

  const handleEditClick = () => {
    setOpen(true);
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-6 w-full max-w-4xl mx-auto shadow-sm">
      {/* Top right: Edit button */}
      <div className="absolute top-4 right-4">
        <button className="flex items-center gap-2 border border-primary px-3 py-1 rounded-md text-sm font-medium transition hover:bg-[#17695C]/90 hover:text-white" onClick={handleEditClick}>
          <span className="w-4 h-4 inline-block align-middle">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7.22222V11.8889C16 13.6071 14.5076 15 12.6667 15H4.33333C2.49238 15 1 13.6071 1 11.8889V4.11111C1 2.39289 2.49238 1 4.33333 1H9.33333" stroke="url(#paint0_linear_758_3097)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13.4356 1.39599C13.7173 1.14244 14.0994 1 14.4977 1C14.8962 1 15.2783 1.14244 15.56 1.39599C15.8417 1.64954 16 1.99342 16 2.35199C16 2.71056 15.8417 3.05445 15.56 3.30799L8.83258 9.36265L6 10L6.70815 7.45067L13.4356 1.39599Z" stroke="url(#paint1_linear_758_3097)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3L14 5" stroke="url(#paint2_linear_758_3097)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint0_linear_758_3097" x1="2.53285" y1="3.17241" x2="17.5908" y2="9.63623" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#004236"/>
                  <stop offset="1" stopColor="#007E67"/>
                </linearGradient>
                <linearGradient id="paint1_linear_758_3097" x1="7.0219" y1="2.39655" x2="16.944" y2="6.81351" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#004236"/>
                  <stop offset="1" stopColor="#007E67"/>
                </linearGradient>
                <linearGradient id="paint2_linear_758_3097" x1="12.2044" y1="3.31034" x2="14.2532" y2="4.13119" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#004236"/>
                  <stop offset="1" stopColor="#007E67"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          Edit
        </button>
      </div>
      {/* Main Info Row */}
      <div className="flex flex-col md:flex-row gap-3 items-start">
        {/* Left: Avatar, Office, Address */}
        <div className="flex flex-col items-center gap-3 min-w-[150px]">
          <div className="w-32 h-32 flex items-center justify-center text-4xl text-gray-400 relative">
            {profilePhotoUrl ? (
              <div className="w-full h-full relative">
                <img 
                  src={profilePhotoUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  style={{ display: imageLoading ? 'none' : 'block' }}
                />
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#BFE3D7] z-10 rounded-full">
                    <svg className="animate-spin h-6 w-6 text-[#16634a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  </div>
                )}
              </div>
            ) : (
              <svg width="167" height="167" viewBox="0 0 167 167" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.4" d="M83.5003 153.153C121.93 153.153 153.084 122 153.084 83.5696C153.084 45.1398 121.93 13.9863 83.5003 13.9863C45.0705 13.9863 13.917 45.1398 13.917 83.5696C13.917 122 45.0705 153.153 83.5003 153.153Z" fill="#007E67"/>
                <path d="M83.5 48.2881C69.0962 48.2881 57.4062 59.9781 57.4062 74.3816C57.4062 88.507 68.47 99.9882 83.1521 100.406C83.3608 100.406 83.6392 100.406 83.7783 100.406C83.9175 100.406 84.1262 100.406 84.2654 100.406C84.335 100.406 84.4046 100.406 84.4046 100.406C98.4604 99.9186 109.524 88.507 109.594 74.3816C109.594 59.9781 97.9037 48.2881 83.5 48.2881Z" fill="#007E67"/>
                <path d="M130.682 134.713C118.296 146.125 101.735 153.153 83.5046 153.153C65.2738 153.153 48.713 146.125 36.3271 134.713C37.9971 128.381 42.5201 122.606 49.1305 118.152C68.1267 105.488 99.0217 105.488 117.879 118.152C124.559 122.606 129.012 128.381 130.682 134.713Z" fill="#007E67"/>
              </svg>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
          </div>
          <button 
            type="button" 
            className="text-primary-color text-sm font-semibold flex items-center gap-1 hover:underline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
          >
            <svg width="18" height="18" fill="none" stroke="#17695C" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.5 7.5l-9 9M9 7.5h7.5V15"/></svg>
            {uploadingPhoto ? 'Uploading...' : 'Upload photo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>
        
        {/* Right: Name, Display Name, License ID, Email, Phone */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-gray-900">{userData && userData?.username}</div>
            {userData?.mls_agent_id ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="#004236" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Licensed Agent</span>
              </div>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE3E3] text-[#E03131]">
                Not Licensed
              </span>
            )}
          </div>
          <div className="flex items-center text-xs text-black flex-wrap gap-2">
            <span>Display Name : <b>{userData?.username || '--'}</b></span>
            <span className="hidden sm:inline mx-1">|</span>
            {userData?.mls_agent_id ? (
              <span>License ID : <b>{userData?.mls_agent_id}</b></span>
            ) : (
              <button
                type="button"
                className="text-primary-color font-semibold hover:underline"
                onClick={() => setOpen(true)}
              >
                Add License ID
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.16699 8.54199L12.5003 14.6878L20.8337 8.54199" stroke="url(#paint0_linear_444_5241)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19.7917 6.771H5.20833C4.05774 6.771 3.125 7.70374 3.125 8.85433V19.271C3.125 20.4216 4.05774 21.3543 5.20833 21.3543H19.7917C20.9423 21.3543 21.875 20.4216 21.875 19.271V8.85433C21.875 7.70374 20.9423 6.771 19.7917 6.771Z" stroke="url(#paint1_linear_444_5241)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
              <linearGradient id="paint0_linear_444_5241" x1="4.16699" y1="11.6149" x2="20.8337" y2="11.6149" gradientUnits="userSpaceOnUse">
              <stop stop-color="#905E26"/>
              <stop offset="0.258244" stop-color="#F5EC9B"/>
              <stop offset="1" stop-color="#905E26"/>
              </linearGradient>
              <linearGradient id="paint1_linear_444_5241" x1="3.125" y1="14.0627" x2="21.875" y2="14.0627" gradientUnits="userSpaceOnUse">
              <stop stop-color="#905E26"/>
              <stop offset="0.258244" stop-color="#F5EC9B"/>
              <stop offset="1" stop-color="#905E26"/>
              </linearGradient>
              </defs>
            </svg>

            <span className="text-primary-color">{userData?.email || 'Email not provided'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.8762 14.0041L17.3354 13.5475L16.2691 12.4752L15.81 12.9318L16.8762 14.0041ZM18.8775 13.3563L20.8035 14.4034L21.5258 13.0748L19.5997 12.0278L18.8775 13.3563ZM21.1743 16.4844L19.7422 17.9084L20.8084 18.9807L22.2406 17.5567L21.1743 16.4844ZM18.8695 18.3669C17.4078 18.5031 13.6261 18.3817 9.53156 14.3104L8.4653 15.3828C12.9335 19.8256 17.1861 20.0425 19.0099 19.8725L18.8695 18.3669ZM9.53156 14.3104C5.62865 10.4296 4.98214 7.16563 4.90165 5.74959L3.39188 5.83539C3.49316 7.61762 4.29369 11.2349 8.4653 15.3828L9.53156 14.3104ZM10.9181 8.07978L11.2072 7.79226L10.141 6.71993L9.85186 7.00743L10.9181 8.07978ZM11.4374 4.12745L10.1662 2.42933L8.95559 3.33559L10.2268 5.03372L11.4374 4.12745ZM5.89059 2.05972L4.30821 3.63312L5.37446 4.70547L6.95685 3.13206L5.89059 2.05972ZM10.385 7.5436C9.85186 7.00743 9.85113 7.00815 9.85041 7.00887C9.85016 7.00912 9.84944 7.00985 9.84894 7.01035C9.84796 7.01134 9.84695 7.01235 9.84593 7.01339C9.84388 7.01548 9.84177 7.01764 9.83959 7.0199C9.83522 7.02443 9.83061 7.02933 9.82575 7.03461C9.81602 7.04517 9.80534 7.05724 9.79391 7.07089C9.77105 7.09816 9.74515 7.13174 9.71793 7.17191C9.66336 7.25245 9.6039 7.35894 9.55345 7.49286C9.45048 7.76612 9.39529 8.12634 9.46449 8.57239C9.59982 9.44472 10.2006 10.597 11.7395 12.1272L12.8057 11.0548C11.3656 9.62282 11.0225 8.75138 10.9588 8.34056C10.9285 8.14505 10.9599 8.04883 10.9686 8.02604C10.9738 8.01195 10.9764 8.01051 10.9699 8.02013C10.9667 8.02484 10.9613 8.03221 10.953 8.04214C10.9488 8.04711 10.9439 8.05274 10.9381 8.05901C10.9352 8.06214 10.9322 8.06544 10.9288 8.0689C10.9272 8.07063 10.9254 8.0724 10.9236 8.07421C10.9227 8.07512 10.9218 8.07604 10.9209 8.07696C10.9205 8.07743 10.9198 8.07813 10.9195 8.07836C10.9188 8.07907 10.9181 8.07978 10.385 7.5436ZM11.7395 12.1272C13.279 13.6578 14.4366 14.2535 15.3104 14.3876C15.7569 14.4561 16.1169 14.4014 16.39 14.2997C16.5239 14.2498 16.6305 14.191 16.7112 14.137C16.7515 14.11 16.7852 14.0843 16.8125 14.0616C16.8262 14.0503 16.8383 14.0397 16.8489 14.03C16.8542 14.0252 16.8592 14.0207 16.8637 14.0163C16.866 14.0141 16.8681 14.012 16.8703 14.01C16.8713 14.009 16.8723 14.008 16.8733 14.0069C16.8738 14.0064 16.8746 14.0057 16.8748 14.0055C16.8755 14.0048 16.8762 14.0041 16.3431 13.4679C15.81 12.9318 15.8107 12.9311 15.8114 12.9304C15.8116 12.9302 15.8123 12.9294 15.8128 12.9289C15.8137 12.928 15.8146 12.9271 15.8155 12.9262C15.8175 12.9245 15.8192 12.9228 15.8209 12.9211C15.8244 12.9177 15.8277 12.9147 15.8309 12.9118C15.8371 12.9062 15.8428 12.9012 15.8478 12.8972C15.8577 12.8889 15.865 12.8837 15.8696 12.8805C15.879 12.8743 15.877 12.8771 15.8621 12.8827C15.8374 12.8918 15.7385 12.9234 15.5397 12.8928C15.1231 12.829 14.2455 12.4863 12.8057 11.0548L11.7395 12.1272ZM10.1662 2.42933C9.13854 1.05665 7.11784 0.839443 5.89059 2.05972L6.95685 3.13206C7.49286 2.59909 8.44483 2.65334 8.95559 3.33559L10.1662 2.42933ZM4.90165 5.74959C4.88182 5.40066 5.04186 5.03618 5.37446 4.70547L4.30821 3.63312C3.76651 4.17174 3.34065 4.9342 3.39188 5.83539L4.90165 5.74959ZM19.7422 17.9084C19.4651 18.1839 19.1681 18.339 18.8695 18.3669L19.0099 19.8725C19.7504 19.8035 20.3572 19.4294 20.8084 18.9807L19.7422 17.9084ZM11.2072 7.79226C12.1997 6.80537 12.2735 5.24436 11.4374 4.12745L10.2268 5.03372C10.6336 5.57709 10.5731 6.29029 10.141 6.71993L11.2072 7.79226ZM20.8035 14.4034C21.628 14.8516 21.7564 15.9055 21.1743 16.4844L22.2406 17.5567C23.5918 16.2132 23.1751 13.9714 21.5258 13.0748L20.8035 14.4034ZM17.3354 13.5475C17.7226 13.1626 18.3457 13.0673 18.8775 13.3563L19.5997 12.0278C18.5073 11.4339 17.1515 11.5979 16.2691 12.4752L17.3354 13.5475Z" fill="url(#paint0_linear_444_5248)"/>
              <defs>
              <linearGradient id="paint0_linear_444_5248" x1="3.3877" y1="10.5853" x2="23.0479" y2="10.5853" gradientUnits="userSpaceOnUse">
              <stop stop-color="#905E26"/>
              <stop offset="0.258244" stop-color="#F5EC9B"/>
              <stop offset="1" stop-color="#905E26"/>
              </linearGradient>
              </defs>
            </svg>


            <span className="text-primary-color">{userData?.mobile_number || 'Phone not provided'}</span>
          </div>
        </div>
      </div>
      {/* Bottom: Address and Stats */}
      <div className="flex flex-col lg:flex-row items-start justify-between w-full mt-6 gap-6">
        {/* Office Info */}
        <div className="flex items-start gap-3 w-full lg:max-w-sm">
          <span className="mt-1 text-[#BFA053]">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 0.75C13.0206 0.75 15.875 3.60443 15.875 7.125C15.875 8.50653 15.4233 9.77598 14.666 10.8203L14.6367 10.8594L14.6133 10.9023C14.5961 10.9341 14.5844 10.9645 14.5742 10.9893L9.86426 18.0557C9.78318 18.1772 9.646 18.25 9.5 18.25C9.354 18.25 9.21682 18.1772 9.13574 18.0557L4.42578 10.9912C4.41554 10.9662 4.40436 10.9349 4.38672 10.9023L4.36328 10.8594L4.33398 10.8203L4.19629 10.6221C3.52249 9.61698 3.125 8.42038 3.125 7.125C3.125 3.60443 5.97943 0.75 9.5 0.75ZM4.45703 11.0703C4.4587 11.0751 4.45945 11.0786 4.45898 11.0771C4.45854 11.0757 4.45802 11.0754 4.45703 11.0723L4.4541 11.0625C4.45524 11.0656 4.45632 11.0682 4.45703 11.0703ZM9.5 4C7.77419 4 6.375 5.39919 6.375 7.125C6.375 8.85081 7.77419 10.25 9.5 10.25C11.2258 10.25 12.625 8.85081 12.625 7.125C12.625 5.39919 11.2258 4 9.5 4Z" stroke="url(#paint0_linear_444_5271)" strokeWidth="1.5"/>
              <defs>
                <linearGradient id="paint0_linear_444_5271" x1="2.375" y1="9.5" x2="16.625" y2="9.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#905E26"/>
                  <stop offset="0.258244" stopColor="#F5EC9B"/>
                  <stop offset="1" stopColor="#905E26"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <div className="text-primary-color flex-1 min-w-0">
            <div className="text-xs text-gray-500 font-medium">Office</div>
            {userData?.address ? (
              <div className="font-semibold text-base leading-relaxed break-words whitespace-pre-line">
                {userData.address}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No office address added yet</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {[
            { label: 'MLS Synced', value: formatStatValue(userData?.mls_properties_count), accent: 'text-[#DB2C2C]' },
            { label: 'Listed in Vistaview', value: formatStatValue(userData?.vistaview_properties_count), accent: 'text-[#00473E]' },
            { label: 'In drafts', value: formatStatValue(userData?.draft_properties), accent: 'text-[#00473E]' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-start gap-1 py-2"
            >
              <div className="text-sm font-semibold text-gray-700 whitespace-nowrap">{stat.label}</div>
              <div className={`text-4xl font-bold ${stat.accent}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
      { open && (
        <AgentProfileModal 
          open={open} 
          userData={{...userData, profile_photo_url: profilePhotoUrl}} 
          onCancel={() => {setOpen(false); if (onProfileUpdated) onProfileUpdated();}} 
        />     
      )}  
    </div>
  );
};

export default AgentProfileInfo; 