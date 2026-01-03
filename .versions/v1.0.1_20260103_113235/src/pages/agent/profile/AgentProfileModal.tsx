import React, { useRef, useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import BottomModal from '../../../components/BottomModal';
import { useAgentProfileForm } from './useAgentProfileForm';
import api from '../../../utils/api';
import { showGlobalToast } from '../../../utils/toast';

interface AgentProfileModalProps {
  open: boolean;
  onCancel: () => void;
  userData: any;
  onSuccess?: () => void;
}

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

const AgentProfileModal: React.FC<AgentProfileModalProps> = ({
  open,
  userData,
  onCancel,
  onSuccess,
}) => {
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(userData?.profile_photo_url || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mlsVerified, setMlsVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [mlsAgentIdError, setMlsAgentIdError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setImageLoading(!!profilePhotoUrl);
  }, [profilePhotoUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    loading,
    onSubmit,
    watch,
  } = useAgentProfileForm({
    name: userData?.username,
    mlsAgentId: userData?.mls_agent_id,
    address: userData?.address,
    profile_photo_url: profilePhotoUrl || '',
  });

  const mlsAgentId = watch('mlsAgentId');

  // Reset MLS verification and errors when License ID changes
  useEffect(() => {
    setMlsVerified(false);
    if (mlsAgentIdError) {
      setMlsAgentIdError(undefined);
    }
  }, [mlsAgentId]);

  const handleVerifyMls = async () => {
    if (!mlsAgentId?.trim()) {
      return;
    }

    setVerifyLoading(true);
    setMlsAgentIdError(undefined);
    
    try {
      const response = await api.post('/common/mls/verify/', {
        mls_agent_id: mlsAgentId.trim(),
      });

      if (response.data?.status_code === 200) {
        setMlsVerified(true);
        setMlsAgentIdError(undefined);
        showGlobalToast('License ID verified successfully', 3000);
      } else if (response.data?.status_code === 400) {
        const errorMessage = response.data?.message || 'Invalid License ID';
        setMlsAgentIdError(errorMessage);
        setMlsVerified(false);
      } else {
        const errorMessage = response.data?.message || 'License ID verification failed';
        setMlsAgentIdError(errorMessage);
        setMlsVerified(false);
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid License ID';
        setMlsAgentIdError(errorMessage);
        setMlsVerified(false);
      } else {
        const errorMessage = error.response?.data?.message || 'License ID verification failed';
        setMlsAgentIdError(errorMessage);
        setMlsVerified(false);
      }
      console.error('MLS verification error:', error);
    } finally {
      setVerifyLoading(false);
    }
  };

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
    } else {
      showGlobalToast('Failed to upload profile photo.');
    }
    
    setUploadingPhoto(false);
    e.target.value = '';
  };

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      profile_photo_url: profilePhotoUrl || '',
    }, () => {
      onCancel();
      if (onSuccess) onSuccess();
    });
  };

  const cancelLabel = 'Cancel';
  const submitLabel = 'Update';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg px-20 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
               style={{ minWidth: 606, boxSizing: 'border-box' }}>
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
        <hr className="border-gray-200 my-6" />
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mr-4 relative">
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
            <div className="flex-1 flex flex-col">
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
          </div>
          
          <div className="mb-4">
            <label className="block font-semibold mb-2">Name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base mb-2"
              {...register('name')}
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block font-semibold mb-2">License ID (Optional)</label>
            <div className="relative">
              <input
                className={`w-full border ${
                  mlsAgentIdError || errors.mlsAgentId ? 'border-red-500' : 'border-gray-300'
                } rounded-lg px-4 py-3 text-base mb-2 ${
                  mlsAgentId?.trim() ? 'pr-24' : ''
                }`}
                {...register('mlsAgentId', {
                  onChange: (e) => {
                    if (mlsAgentIdError) {
                      setMlsAgentIdError(undefined);
                    }
                  }
                })}
                placeholder="Enter your License ID (Optional)"
              />
              {mlsAgentId?.trim() && (
                <>
                  {mlsVerified ? (
                    <button
                      type="button"
                      disabled
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)' }}
                    >
                      <Check size={12} strokeWidth={2} style={{ stroke: 'rgba(0, 66, 54, 1)' }} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyMls}
                      disabled={verifyLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-md text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                    >
                      {verifyLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                </>
              )}
            </div>
            {(mlsAgentIdError || errors.mlsAgentId) && (
              <p className="text-red-500 text-sm mt-1">{mlsAgentIdError || errors.mlsAgentId?.message}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block font-semibold mb-2">Address</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base mb-2 min-h-[120px]"
              {...register('address')}
              placeholder="Enter your address"
              style={{whiteSpace: 'pre-line'}}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>
          
          <div className="flex gap-6 justify-center">
            <button
              type="button"
              className="settings-cancel-btn border border-[#17695C] rounded-lg px-8 py-2 font-semibold text-[#17695C] bg-white hover:bg-[#F3F6F7] transition"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              className="settings-gradient-btn rounded-lg px-8 py-2 font-semibold text-white bg-gradient-to-r from-[#17695C] to-[#007E67] hover:from-[#007E67] hover:to-[#17695C] transition shadow"
              disabled={loading}
            >
              {loading ? 'Updating...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentProfileModal; 