import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { MapPin, Mail, Phone } from 'lucide-react';
import api from '../../../utils/api';
import { showGlobalToast } from '../../../utils/toast';
import { fetchCountries } from '../../../utils/api';

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

interface BuilderProfileInfoProps {
  builderData: any;
  onProfileUpdated?: () => void;
}

const BuilderProfileInfo: React.FC<BuilderProfileInfoProps> = ({ builderData, onProfileUpdated }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [adminContact, setAdminContact] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countryList = await fetchCountries();
        setCountries(countryList);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (builderData) {
      // Map builder onboarding data to profile display
      const userDetail = builderData.user_detail || {};
      const businessReg = builderData.business_registration || {};
      const companyDetails = builderData.company_details || {};
      const contactPersons = builderData.contact_persons || [];
      
      // Find admin contact (first contact or one with admin role)
      const admin = contactPersons.find((cp: any) => 
        cp.role_type_detail?.name?.toLowerCase().includes('admin')
      ) || contactPersons[0] || null;
      setAdminContact(admin);

      setProfileData({
        ...userDetail,
        business_name: businessReg.business_name,
        govt_number: businessReg.govt_number,
        logo_url: companyDetails.logo_url,
        address_line1: companyDetails.address_line1,
        address_line2: companyDetails.address_line2,
        city: companyDetails.city_detail?.name,
        state: companyDetails.state_detail?.name,
        country: companyDetails.country_detail?.name,
        country_code: companyDetails.country_detail?.code || companyDetails.country_detail?.alpha2_code,
        postal_code: companyDetails.postal_code,
        company_type: companyDetails.company_type_detail?.name,
        year: companyDetails.year,
        user_id: userDetail.id || builderData.user,
        email: admin?.email_id || userDetail.email,
        phone: admin?.contact_no || userDetail.mobile_number,
      });

      // Set profile photo from logo or user profile photo
      setProfilePhotoUrl(companyDetails.logo_url || userDetail.profile_photo_url || null);
    }
  }, [builderData]);

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
      setProfileData((prev: any) => ({ ...prev, profile_photo_url: uploadedUrl }));
      if (onProfileUpdated) onProfileUpdated();
    } else {
      showGlobalToast('Failed to upload profile photo.');
    }
    
    setUploadingPhoto(false);
    e.target.value = '';
  };

  if (!profileData) {
    return <div>Loading...</div>;
  }

  // Build full address string
  const addressParts = [
    profileData.address_line1,
    profileData.address_line2,
    profileData.city,
    profileData.state,
    profileData.country,
    profileData.postal_code
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ');

  // Get country flag
  const countryData = countries.find(c => 
    c.code === profileData.country_code || 
    c.alpha2_code === profileData.country_code ||
    c.country_code === profileData.country_code?.toLowerCase()
  );
  const flagUrl = countryData?.flag_png || countryData?.flag_svg || 'https://flagcdn.com/w40/in.png';

  // Get project count and units (placeholder for now)
  const projectCount = builderData?.service_locations?.length || 0;
  const unitCount = 0; // This would come from a separate API if available

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-6 w-full max-w-4xl mx-auto shadow-sm">
      {/* Top Section */}
      <div className="flex items-start gap-6">
        {/* Left: Logo */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-[#BFE3D7] flex items-center justify-center relative overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {profilePhotoUrl ? (
              <img 
                src={profilePhotoUrl} 
                alt="Logo" 
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            ) : (
              <span className="text-white text-lg font-semibold">LOGO</span>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* Middle: Company Information */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-2xl font-bold text-gray-900">{profileData.business_name || 'Builder Company'}</div>
          
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>ID: <b>{profileData.govt_number || profileData.user_id || '--'}</b></span>
            <span className="text-gray-300">|</span>
            <span>Admin Name: <b>{adminContact?.name || '--'}</b></span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail size={18} className="text-[#16634a]" />
            <span className="text-[#16634a]">{profileData.email || 'Email not provided'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Phone size={18} className="text-[#16634a]" />
            {flagUrl && (
              <img 
                src={flagUrl} 
                alt="Country flag" 
                className="w-5 h-4 object-cover rounded"
              />
            )}
            <span className="text-[#16634a]">{profileData.phone || 'Phone not provided'}</span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            className="flex items-center gap-2 border border-[#16634a] text-[#16634a] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#16634a] hover:text-white transition-colors"
            onClick={() => {
              navigate('/builder/onboarding');
            }}
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            className="flex items-center gap-2 border border-[#16634a] text-[#16634a] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#16634a] hover:text-white transition-colors"
            onClick={() => {
              navigate('/builder/onboarding');
            }}
          >
            Add GSTIN
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-start gap-8 pt-4 border-t border-gray-200">
        {/* Left: Address */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">Address</span>
          </div>
          <div className="font-bold text-gray-900 mb-1">{profileData.business_name}</div>
          <div className="text-sm text-gray-700">{fullAddress || 'No address provided'}</div>
        </div>

        {/* Middle: Project Listed */}
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold text-gray-900 mb-2">Project Listed</div>
          <div className="text-4xl font-bold text-[#16634a]">{projectCount}</div>
        </div>

        {/* Right: No. of Units */}
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold text-gray-900 mb-2">No. of Units</div>
          <div className="text-4xl font-bold text-[#16634a]">{unitCount || '0'}</div>
        </div>
      </div>
    </div>
  );
};

export default BuilderProfileInfo;

