import React, { useContext, useEffect } from 'react';
import { CheckCircle, User, Camera, Mail, Bell, Lock, XCircle, Menu } from 'lucide-react';
import realEstateIcon from '../../assets/images/realestate.svg';
import securityCamIcon from '../../assets/images/security-cam.svg';
import interiorDesignIcon from '../../assets/images/interior-design.svg';
import ServiceSection from '../Home/DesktopServiceSectionUI';
import useWindowSize from '../../hooks/useWindowSize';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import { useAuth, useAuthData } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { ToastContext } from '../../App';
import { showGlobalToast } from '../../utils/toast';
import * as Yup from 'yup';
import tickIcon from '../../assets/images/tick-icon.svg';
import { MobileMenu } from '../../components/MobileMenu';
import MobileBuyerMenu from '../../components/MobileBuyerMenu';
import MobileAgentMenu from '../../components/MobileAgentMenu';
import { MobileBottonMenu } from '../../components/MobileMenu';
import BuyerFooterNav from '../../components/BuyerFooterNav';
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';

const AccountSettings: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = width <= 1024;
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
  const { showToast } = useContext(ToastContext);
  const [sidebarOpen, setSidebarOpen] = useState(false); // <-- Only here, at the top!
    
  const showToastMessage = (message: string, duration?: number) => {
      if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
      } else {
      showGlobalToast(message, duration);   
      }
  };


  // Modal state
  const [modal, setModal] = useState<
    | null
    | {
      type: 'name' | 'username' | 'email' | 'mobile' | 'otp' | 'notifications' | 'password' | 'profilePhoto' | 'googleUnlink';
      value?: string;
    }
  >(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFields, setPasswordFields] = useState({ old: '', new: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({ old: '', new: '', confirm: '' });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  
  // Email validation state
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const { user, isLoggedIn, setUser } = useAuth();
  const authData = useAuthData();
  const isAgent = authData?.user?.user_type === 'agent';
  const isBuyer = authData?.user?.user_type === 'buyer';

  const [userData, setUserData] = useState<any>(null);
  
  // Email availability check function
  const checkEmailAvailability = async (email: string) => {
    try {
      const response = await api.post('/common/email/check/', { email });
      if (response.data.status_code === 200) {
        return response.data.data.exists;
      }
      return false;
    } catch (error: any) {
      console.error('Email check error:', error);
      return false;
    }
  };

  // Handlers
  const openModal = (type: 'name' | 'username' | 'email' | 'mobile' | 'otp' | 'notifications' | 'password' | 'profilePhoto' | 'googleUnlink', value?: string) => {
    setModal({ type, value });
    setInputValue(value || '');
    if (type === 'password') {
      setPasswordFields({ old: '', new: '', confirm: '' });
      setPasswordErrors({ old: '', new: '', confirm: '' });
    }
    if (type === 'profilePhoto') {
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
    }
    if (type === 'email') {
      setEmailError('');
      setIsEmailValid(false);
    }
  };
  const closeModal = () => {
    setModal(null);
    setInputValue('');
    setPasswordFields({ old: '', new: '', confirm: '' });
    setPasswordErrors({ old: '', new: '', confirm: '' });
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    setEmailError('');
    setIsEmailValid(false);
  };

  // Yup schema for password change
  const passwordSchema = Yup.object().shape({
    old: Yup.string().required('Old password is required'),
    new: Yup.string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/, 'Password must contain at least one uppercase letter and one special character'),
    confirm: Yup.string().required('Confirm password is required').oneOf([Yup.ref('new')], 'Passwords must match'),
  });

  // Real-time validation for password fields
  const validatePasswordField = async (field: 'old' | 'new' | 'confirm', value: string) => {
    try {
      await passwordSchema.validateAt(field, { [field]: value, new: passwordFields.new, confirm: passwordFields.confirm });
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    } catch (err: any) {
      setPasswordErrors(prev => ({ ...prev, [field]: err.message }));
    }
  };

  // Update profileUpdate to accept a value override for email
  const profileUpdate = async (type: string, valueOverride?: string) => {
    try{
      const type_value = type === 'mobile' ? 'mobile_number' : type;
      const value = valueOverride !== undefined ? valueOverride : inputValue;
      
      const response = await api.put('/common/profile/update/', {
        [type_value]: value,
      });
      if(response.data.status_code === 200){
        showToastMessage(response.data.message);
        
        // Update AuthContext immediately for username changes
        if (type === 'username' && user) {
          const updatedUser = { ...user, user_name: value };
          setUser(updatedUser);
        }
        
        getUser();
        closeModal();
        setLoading(false);
        if (isMobile && isAgent) {
          navigate('/agent/profile', { state: { refresh: true } });
        }
        if (type === 'mobile' && response.data.status_code === 200) {
          setUserData((prev: any) => ({ ...prev, mobile_number: value }));
        }
      }
    }catch(error : any){
      showToastMessage(error.response.data.message);  
      setLoading(false);
    }
  }

  const handleUpdate = async () => {
    setLoading(true);
    if(modal?.type === 'username'){
      if (!inputValue.trim()) {
        showToastMessage('Name is required');
        setLoading(false);
        return;
      }
      profileUpdate(modal?.type);    
    }
    if(modal?.type === 'name'){
      if (!inputValue.trim()) {
        showToastMessage('Name is required');
        setLoading(false);
        return;
      }
      profileUpdate(modal?.type);    
    }
    if(modal?.type === 'email'){
      if (!inputValue.trim()) {
        showToastMessage('Email is required');
        setLoading(false);
        return;
      }
      
      // Check if email is different from current email
      if (inputValue === userData?.email) {
        showToastMessage('Please enter a different email address');
        setLoading(false);
        return;
      }
      
      // Check email availability first
      const emailExists = await checkEmailAvailability(inputValue);
      if (emailExists) {
        setEmailError('Email ID already taken');
        setIsEmailValid(false);
        setLoading(false);
        return;
      }
      
      // Email is available, send OTP
      try {
        const response = await api.post('/common/otp/send/', { email: inputValue });
        if (response.data.status_code === 200) {
          showToastMessage(response.data.message);
          setModal({ type: 'otp', value: inputValue }); // Pass the new email to OTP modal
        } else {
          showToastMessage(response.data.message);
        }
      } catch (error: any) {
        showToastMessage(error?.response?.data?.message || 'Failed to send OTP');
      }
      setLoading(false);
      return;
    }
    if(modal?.type === 'mobile'){
      if (!inputValue.trim()) {
        showToastMessage('Mobile number is required');
        setLoading(false);
        return;
      }
      profileUpdate(modal?.type).then(() => {
        getUser();
        closeModal();
        setLoading(false);
      });
      return;
    }
    if(modal?.type === 'profilePhoto'){
      profileUpdate(modal?.type);    
    }
    if(modal?.type === 'otp'){
      if(!otpValue.trim()){
        showToastMessage('OTP is required');
        setLoading(false);
        return;
      }
      // Validate OTP for the new email, then update email if success
      try {
        const response = await api.post('/common/otp/validate/', {
          otp: otpValue,
          email: modal?.value, // new email
          old_email: userData?.email, // send old email as well
        });
        if (response.data.status_code === 200) {
          showToastMessage(response.data.message);
          // Now update the email
          await profileUpdate('email', modal?.value);
          await getUser();
          closeModal();
        } else {
          showToastMessage(response.data.message);
        }
      } catch (error: any) {
        showToastMessage(error?.response?.data?.message || 'Failed to validate OTP');
      }
      setLoading(false);
      return;
    }
    if(modal?.type === 'password'){
      try {
        await passwordSchema.validate(passwordFields, { abortEarly: false });
        // TODO: Call password update API here
       changePassword();
      } catch (err: any) {
        // Show validation errors for all fields
        if (err.inner && err.inner.length > 0) {
          const newErrors = { old: '', new: '', confirm: '' };
          err.inner.forEach((error: any) => {
            if (error.path) {
              newErrors[error.path as keyof typeof newErrors] = error.message;
            }
          });
          setPasswordErrors(newErrors);
        } else {
          showToastMessage(err.message);
        }
        setLoading(false);
        return;
      }
    }
    if(modal?.type === 'notifications'){
      updateNotifications();
    }
    if(modal?.type === 'profilePhoto'){
      updateProfilePhoto();
    }
  };

  const updateProfilePhoto = async () => {
    try {
      const formData = new FormData();
      formData.append('photo', profilePhoto as unknown as File);
      // Use the new endpoint and common api utility (relative path for dev)
      const response = await api.post('/common/profile/photo/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.status_code === 200) {
        showToastMessage(response.data.message);
        // Update userData with new profile_photo_url if available
        if (response.data.data?.view_file_url) {
          const newProfilePhotoUrl = response.data.data.view_file_url;
          setUserData((prev: any) => ({ ...prev, profile_photo_url: newProfilePhotoUrl }));
          setProfilePhotoPreview(newProfilePhotoUrl);
          
          // Update AuthContext to reflect the new profile photo
          if (user) {
            const updatedUser = { ...user, profile_photo_url: newProfilePhotoUrl };
            setUser(updatedUser);
          }
        }
        closeModal();
        setLoading(false);
      }
    } catch (error: any) {
      showToastMessage(error?.response?.data?.message || 'Failed to upload photo');
      setLoading(false);
    }
  }

  const updateNotifications = async () => {
    try{
      const response = await api.put('/common/profile/update/', {
        notifications: [
          {
            type: "buyer_enquiry",
            enabled: notifications.alert
          },
          {
            type: "newsletter", 
            enabled: notifications.newsletter
          },
          {
            type: "update_password",
            enabled: notifications.updatePassword
          }
        ]
      });
      if(response.data.status_code === 200){
        showToastMessage(response.data.message);
        closeModal();
        setLoading(false);
        // Refresh user data to show latest notification settings
        await getUser();
      }
    }catch(error : any){
      showToastMessage(error.response.data.message);
      setLoading(false);
    }
  }
  const changePassword = async () => {
    try{
      const response = await api.put('/common/change-password/', {
        old_password: passwordFields.old,
        new_password: passwordFields.new,
        confirm_password: passwordFields.confirm,
      });
      if(response.data.status_code === 200){
        showToastMessage(response.data.message);
        setLoading(false);
        closeModal();
      }
    }catch(error : any){
      showToastMessage(error.response.data.message);
      setLoading(false);
    }
  }

  const resendOTP = async () => {
    setResendLoading(true); // Immediately disable button
    try{
    const response = await api.post('/common/otp/send/', {
      email: userData?.email,
    });
    if(response.data.status_code === 200){
      showToastMessage(response.data.message);
      setOtpTimer(59); // Reset timer after successful resend
    }
    }catch(error : any){
      showToastMessage(error.response.data.message); 
    } finally {
      setResendLoading(false); // Re-enable button after API call completes
    }
  }

  const validateOTP = async () => {
    try{  
      const response = await api.post('/common/otp/validate/', {
        otp: otpValue,
        email: userData?.email,
      });
        if(response.data.status_code === 200){
          showToastMessage(response.data.message);
          setLoading(false);
          
        }
    }catch(error : any){
      showToastMessage(error.response.data.message);  
      setLoading(false);
    }
  }

  useEffect(() => {
    getUser();
  }, []); 

  const getUser = async () => {
    const response = await api.get('/common/profile-subscription/');
    if(response.data.status_code === 200){
      const profileData = response.data.data?.profile;
      setUserData(profileData);
      
      // Update AuthContext with latest user data
      if (user && profileData) {
        const updatedUser = {
          ...user,
          user_name: profileData.username || user.user_name,
          profile_photo_url: profileData.profile_photo_url || user.profile_photo_url,
          email: profileData.email || user.email,
          mobile_number: profileData.mobile_number || user.mobile_number,
        };
        setUser(updatedUser);
      }
      
      let notifications = {
        alert: response.data.data?.profile?.notify_buyer_enquiry || false,
        newsletter: response.data.data?.profile?.notify_newsletter || false,
        updatePassword: response.data.data?.profile?.notify_update_password || false,
      }
      setNotifications(notifications);
    }
  }   

  // OTP Modal (for mobile verification)
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(59);
  const [resendLoading, setResendLoading] = useState(false);
  React.useEffect(() => {
    if (modal?.type === 'otp' && otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (modal?.type !== 'otp') setOtpTimer(59);
  }, [modal, otpTimer]);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    alert: true,
    newsletter: false,
    updatePassword: false,
  });

  // Add this effect to trigger loader on initial load and when profile_photo_url changes
  useEffect(() => {
    if (userData?.profile_photo_url) {
      setProfileImageLoading(true);
    }
  }, [userData?.profile_photo_url]);

  // Mobile view
  if (isMobile) {
    // Mobile modal state and handlers (reuse desktop logic)
    const modalVariant = 'mobile';
    return (
      <div className="w-full pt-0 px-0 relative" style={{marginTop: 0, paddingTop: 0}}>
        {/* Mobile Header with Burger Icon on the right */}
        <div className="flex items-center justify-start mb-4 mt-2">
          <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu className="w-7 h-7 text-[#16634a]" /></button>
          <h1 className="text-2xl font-bold text-[#16634a] ml-2">My Account</h1>
        </div>
        {/* Mobile Menu Components */}
        {isLoggedIn && isAgent && (
          <MobileAgentMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        {isLoggedIn && isBuyer && (
          <MobileBuyerMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        {!isLoggedIn && (
          <MobileMenu 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            isLoggedIn={isLoggedIn}
            userType={authData?.user?.user_type}
          />
        )}
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`flex-1 text-base font-semibold pb-2 ${activeTab === 'personal' ? 'text-[#16634a] border-b-2' : 'text-[#222]'} ${activeTab === 'personal' ? 'border-b-[3px] border-transparent bg-clip-text' : ''}`}
            style={activeTab === 'personal' ? { borderImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%) 1' } : {}}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button
            className={`flex-1 text-base font-semibold pb-2 ${activeTab === 'security' ? 'text-[#16634a] border-b-2' : 'text-[#222]'} ${activeTab === 'security' ? 'border-b-[3px] border-transparent bg-clip-text' : ''}`}
            style={activeTab === 'security' ? { borderImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%) 1' } : {}}
            onClick={() => setActiveTab('security')}
          >
            Sign in & Security
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'personal' && (
          <div className="flex flex-col gap-4">
            {/* Name */}
            {/* <div className="bg-[#DDF6F2] rounded-2xl p-4">
              <div className="font-bold text-lg mb-1">{userData?.name}</div>
              <div className="text-base mb-4">Your full name is updated across all Vistaview experiences.</div>
              <button onClick={() => openModal('name', 'Henry Johns')} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent">Edit</button>
            </div> */}
            {/* Username */}
            <div className="bg-[#DDF6F2] rounded-2xl p-4">
              <div className="font-bold text-lg mb-1">{userData?.username}</div>
              <div className="text-base mb-4">Your full name is updated across all Vistaview experiences.</div>
              <button onClick={() => openModal('username', userData?.username)} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent">Edit</button>
            </div>
            {/* Profile Photo */}
            <div className="bg-[#DDF6F2] rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#BFE3D7] flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full">
                  {(profileImageLoading || (loading && modal?.type === 'profilePhoto')) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#BFE3D7] z-10">
                      <svg className="animate-spin h-6 w-6 text-[#16634a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    </div>
                  )}
                  {userData?.profile_photo_url ? (
                    <img
                      src={userData.profile_photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      style={{ display: profileImageLoading ? 'none' : 'block' }}
                      onLoad={() => setProfileImageLoading(false)}
                      onError={() => setProfileImageLoading(false)}
                      onLoadStart={() => setProfileImageLoading(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-[#16634a] w-7 h-7" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">Profile photo</div>
                <div className="text-base mb-4">Personalize your profile pic with your recent photo</div>
                <button onClick={() => openModal('profilePhoto')} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent">Edit</button>
              </div>
            </div>
            {/* Email Notifications */}
            <div className="bg-[#DDF6F2] rounded-2xl p-4">
              <div className="font-bold text-lg mb-1">Email Notifications</div>
              <div className="text-base mb-4">Manage the notifications to receive the recent updates and responses</div>
              <button onClick={() => openModal('notifications')} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent">Manage</button>
            </div>
          </div>
        )}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="bg-[#FCF8E6] rounded-2xl p-4">
              <div className="font-bold text-lg mb-1">{userData?.email}</div>
              <div className="text-base mb-4">The email address associated with your account.</div>
              <div className="flex gap-3 items-center">
                {userData?.is_email_verified ? (
                  <span className="flex items-center gap-1">
                    <img src={tickIcon} alt="Verified" className="w-4 h-4" />
                    <span className="text-[#222] text-xs font-small">Verified</span>
                  </span>
                ) : (
                  <button onClick={() => openModal('email', userData?.email)} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent">Verify</button>
                )}
                <button onClick={() => openModal('email', userData?.email)} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-1.5 text-sm font-medium hover:bg-[#16634a] hover:text-white transition">Edit</button>
              </div>
            </div>
            {/* Mobile */}
            <div className="bg-[#FCF8E6] rounded-2xl p-4">
              <div className="font-bold text-lg mb-1">{userData?.mobile_number}</div>
              <div className="text-base mb-4">Mobile number associated with your account</div>
              <div className="flex gap-3">
                <button onClick={() => openModal('mobile', userData?.mobile_number)} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent">Edit</button>
              </div>
            </div>
            {/* Password */}
            <div className="bg-[#FCF8E6] rounded-2xl p-4">
              <div className="font-bold text-lg mb-1">Password</div>
              <div className="text-base mb-4">Set a unique password to protect your account.</div>
              <button onClick={() => openModal('password')} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent">Change password</button>
            </div>
           
          </div>
        )}

        {/* Mobile Modals */}
        <SettingsModal
          open={!!modal && ['name', 'username', 'email', 'mobile'].includes(modal.type)}
          title={
            modal?.type === 'name'
              ? 'Edit Name'
              : modal?.type === 'username'
                ? 'Edit Username'
                : modal?.type === 'email'
                  ? 'Email Address'
                  : modal?.type === 'mobile'
                    ? 'Mobile No.'
                    : ''
          }
          onCancel={closeModal}
          onSubmit={() => {
            handleUpdate();
          }}
          loading={loading}
          variant={modalVariant}
        >
          {modal?.type === 'name' && (
            <div>
              <label className="block font-semibold mb-2">Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-2"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          )}
          {modal?.type === 'username' && (
            <div>
              <label className="block font-semibold mb-2">Username</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-2"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
          )}
          {modal?.type === 'email' && (
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-2"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Email"
                type="email"
              />
            </div>
          )}
          {modal?.type === 'mobile' && (
            <div>
              <label className="block font-semibold mb-2">Mobile</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-2"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enter your mobile number"
                type="tel"
              />
            </div>
          )}
          {modal?.type === 'profilePhoto' && (
            <div>
              <label className="block font-semibold mb-2">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-2"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setProfilePhoto(file);
                  if (file) {
                    setProfileImageLoading(true);
                    const reader = new FileReader();
                    reader.onload = ev => {
                      setProfilePhotoPreview(ev.target?.result as string);
                      setProfileImageLoading(false);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setProfilePhotoPreview(null);
                    setProfileImageLoading(false);
                  }
                }}
              />
              <button
                type="button"
                className="mt-2 border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent"
                onClick={updateProfilePhoto}
                disabled={loading || !profilePhoto}
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          )}
        </SettingsModal>

        {/* OTP Modal */}
        <SettingsModal
          open={!!modal && modal.type === 'otp'}
          title="OTP Verification"
          onCancel={closeModal}
          onSubmit={handleUpdate}
          submitLabel="Submit"
          loading={loading}
          variant={modalVariant}
        >
          <div className="mb-4 text-center">
            <span className="text-[#16634a] font-semibold">+1 234 *** 3210</span>
            <button className="ml-2 text-[#15803d] underline text-sm">Change mobile no.</button>
          </div>
          <label className="block font-semibold mb-2 text-center">ENTER ONE TIME PASSWORD</label>
          <div className="flex justify-center mb-4">
            <OtpInput
              value={otpValue}
              onChange={setOtpValue}
              numInputs={6}
              renderSeparator={<span className="mx-1"></span>}
              renderInput={(props) => <input {...props} />}
              inputStyle={{
                width: '3rem',
                height: '3rem',
                fontSize: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #D1D5DB',
                margin: '0 0.2rem',
                textAlign: 'center',
                background: '#fff',
              }}
              containerStyle="justify-center"
            />
          </div>
          <div className="flex justify-between items-center">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resendOTP();
              }} 
              className="text-[#15803d] underline text-sm" 
              disabled={otpTimer > 0 || resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend'}
            </button>
            <span className="text-xs text-gray-500">{otpTimer > 0 ? `Resend 00:${otpTimer.toString().padStart(2, '0')}` : ''}</span>
          </div>
        </SettingsModal>

        {/* Change Password Modal */}
        <SettingsModal
          open={!!modal && modal.type === 'password'}
          title="Change password"
          onCancel={closeModal}
          onSubmit={handleUpdate}
          loading={loading}
          variant={modalVariant}
        >
          <div className="flex flex-col gap-6">
            <div>
              <label className="block font-semibold mb-2">Old password</label>
              <input
                className={`w-full border rounded-lg px-4 py-3 text-lg mb-2 ${passwordErrors.old ? 'border-red-500' : 'border-gray-300'}`}
                type="password"
                value={passwordFields.old}
                onChange={e => {
                  setPasswordFields(f => ({ ...f, old: e.target.value }));
                  validatePasswordField('old', e.target.value);
                }}
                onBlur={e => validatePasswordField('old', e.target.value)}
                placeholder="********"
              />
              {passwordErrors.old && (
                <div className="text-red-500 text-sm mb-2">{passwordErrors.old}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">New password</label>
              <input
                className={`w-full border rounded-lg px-4 py-3 text-lg mb-2 ${passwordErrors.new ? 'border-red-500' : 'border-gray-300'}`}
                type="password"
                value={passwordFields.new}
                onChange={e => {
                  setPasswordFields(f => ({ ...f, new: e.target.value }));
                  validatePasswordField('new', e.target.value);
                  // Also validate confirm field when new password changes
                  if (passwordFields.confirm) {
                    validatePasswordField('confirm', passwordFields.confirm);
                  }
                }}
                onBlur={e => validatePasswordField('new', e.target.value)}
                placeholder="********"
              />
              {passwordErrors.new && (
                <div className="text-red-500 text-sm mb-2">{passwordErrors.new}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">Confirm password</label>
              <input
                className={`w-full border rounded-lg px-4 py-3 text-lg mb-2 ${passwordErrors.confirm ? 'border-red-500' : 'border-gray-300'}`}
                type="password"
                value={passwordFields.confirm}
                onChange={e => {
                  setPasswordFields(f => ({ ...f, confirm: e.target.value }));
                  validatePasswordField('confirm', e.target.value);
                }}
                onBlur={e => validatePasswordField('confirm', e.target.value)}
                placeholder="********"
              />
              {passwordErrors.confirm && (
                <div className="text-red-500 text-sm mb-2">{passwordErrors.confirm}</div>
              )}
            </div>
          </div>
        </SettingsModal>

        {/* Notifications Modal */}
        <SettingsModal
          open={!!modal && modal.type === 'notifications'}
          title="Email notifications"
          onCancel={closeModal}
          onSubmit={handleUpdate}
          loading={loading}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Alert New listing</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.alert}
                  onChange={e => setNotifications(n => ({ ...n, alert: e.target.checked }))}
                />
               <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#64E7CF] transition-all">
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 ${notifications.alert ? 'bg-[#007E67]' : 'bg-[#A0A0A0] '} rounded-full shadow transition-transform duration-200 ${notifications.alert ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Newsletter</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.newsletter}
                  onChange={e => setNotifications(n => ({ ...n, newsletter: e.target.checked }))}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#64E7CF] transition-all">
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 ${notifications.newsletter ? 'bg-[#007E67]' : 'bg-[#A0A0A0] '} rounded-full shadow transition-transform duration-200 ${notifications.newsletter ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Update Password</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.updatePassword}
                  onChange={e => setNotifications(n => ({ ...n, updatePassword: e.target.checked }))}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#64E7CF] transition-all">
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 ${notifications.updatePassword ? 'bg-[#007E67]' : 'bg-[#A0A0A0] '} rounded-full shadow transition-transform duration-200 ${notifications.updatePassword ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>
          </div>
        </SettingsModal>

        {/* Google Unlink Modal */}
        <SettingsModal
          open={!!modal && modal.type === 'googleUnlink'}
          title="Unlink Google"
          onCancel={closeModal}
          onSubmit={handleUpdate}
          loading={loading}
        >
          <div className="text-center text-lg font-medium py-8">Are you sure you want to unlink this account ?</div>
        </SettingsModal>

        {/* Profile Photo Modal (Mobile) */}
        <SettingsModal
          open={!!modal && modal.type === 'profilePhoto'}
          title="Edit Profile Photo"
          onCancel={closeModal}
          onSubmit={handleUpdate}
          loading={loading}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-[#BFE3D7] flex items-center justify-center overflow-hidden mb-2">
              <div className="relative w-full h-full">
                {(profileImageLoading || (loading && modal?.type === 'profilePhoto')) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#BFE3D7] z-10">
                    <svg className="animate-spin h-8 w-8 text-[#16634a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  </div>
                )}
                {profilePhotoPreview || userData?.profile_photo_url ? (
                  <img
                    src={profilePhotoPreview || userData.profile_photo_url}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    style={{ display: profileImageLoading ? 'none' : 'block' }}
                    onLoad={() => setProfileImageLoading(false)}
                    onError={() => setProfileImageLoading(false)}
                    onLoadStart={() => setProfileImageLoading(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="text-[#16634a] w-12 h-12" />
                  </div>
                )}
              </div>
            </div>
            <input
              id="profile-photo-input-mobile"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0] || null;
                setProfilePhoto(file);
                if (file) {
                  setProfileImageLoading(true);
                  const reader = new FileReader();
                  reader.onload = ev => {
                    setProfilePhotoPreview(ev.target?.result as string);
                    setProfileImageLoading(false);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setProfilePhotoPreview(null);
                  setProfileImageLoading(false);
                }
              }}
            />
            <label htmlFor="profile-photo-input-mobile" className="border border-[#16634a] text-[#16634a] rounded-lg px-6 py-2 font-medium cursor-pointer hover:bg-[#16634a] hover:text-white transition">
              Browse files
            </label>
          </div>
        </SettingsModal>

        {/* Footer Navigation */}
        <BuyerFooterNav />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Account Settings</h1>

      {/* Personal Info Section */}
      <div className="bg-white border border-[#E6ECE8] rounded-xl p-6 mb-6">
        <div className="font-semibold text-lg mb-4 text-[#222]">Personal Info</div>
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          {/* <div className="bg-[#D0F2EBB2] rounded-lg flex items-center justify-between p-4">
            <div>
              <div className="font-semibold text-[#16634a] text-base">{userData?.name}</div>
              <div className="text-xs text-[#222]">Your full name is updated across all Vistaview experiences.</div>
            </div>
            <button onClick={() => openModal('name', 'Henry Johns')} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-1.5 text-sm font-medium hover:bg-[#16634a] hover:text-white transition">Edit</button>
          </div> */}
          {/* Username */}
          <div className="bg-[#D0F2EBB2] rounded-lg flex items-center justify-between p-4">
            <div>
              <div className="font-semibold text-[#16634a] text-base">{userData?.username}</div>
              <div className="text-xs text-[#222]">Your full name is updated across all Vistaview experiences.</div>
            </div>
            <button onClick={() => openModal('username', userData?.username)} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-1.5 text-sm font-medium hover:bg-[#16634a] hover:text-white transition">Edit</button>
          </div>
          {/* Profile Photo */}
          <div className="bg-[#D0F2EBB2] rounded-lg flex items-center justify-between p-4 col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#BFE3D7] flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full">
                  {(profileImageLoading || (loading && modal?.type === 'profilePhoto')) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#BFE3D7] z-10">
                      <svg className="animate-spin h-6 w-6 text-[#16634a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    </div>
                  )}
                  {userData?.profile_photo_url ? (
                    <img
                      src={userData.profile_photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      style={{ display: profileImageLoading ? 'none' : 'block' }}
                      onLoad={() => setProfileImageLoading(false)}
                      onError={() => setProfileImageLoading(false)}
                      onLoadStart={() => setProfileImageLoading(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-[#16634a] w-7 h-7" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="font-semibold text-[#16634a] text-base">Profile photo</div>
                <div className="text-xs text-[#222]">Personalize your profile pic with your recent photo</div>
              </div>
            </div>
            <button onClick={() => openModal('profilePhoto')} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-1.5 text-sm font-medium hover:bg-[#16634a] hover:text-white transition">Edit</button>
          </div>
          {/* Email Notifications */}
          <div className="bg-[#D0F2EBB2] rounded-lg flex items-center justify-between p-4 col-span-1">
            <div>
              <div className="font-semibold text-[#16634a] text-base">Email Notifications</div>
              <div className="text-xs text-[#222]">Manage the notifications to receive the recent updates and responses</div>
            </div>
            <button onClick={() => openModal('notifications')} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-1.5 text-sm font-medium hover:bg-[#16634a] hover:text-white transition">Manage</button>
          </div>
        </div>
      </div>

      {/* Sign in & Security Section */}
      <div className="bg-white border border-[#E6ECE8] rounded-xl p-6 mb-6">
        <div className="font-semibold text-lg mb-4 text-[#222]">Sign in & Security</div>
        <div className="grid grid-cols-2 gap-4">
          {/* Email */}
          <div className="bg-[#FBF8E5] rounded-lg flex items-center justify-between p-4 col-span-1">
            <div>
              <div className="font-semibold text-[#222] text-base flex items-center gap-2">
                {userData?.email}
              </div>
              <div className="text-xs text-[#222]">The email address associated with your account.</div>
            </div>
            <div className="flex gap-2 items-center">
              {userData?.is_email_verified && (
                <span className="flex flex-col items-center mr-2">
                  <img src={tickIcon} alt="Verified" className="w-4 h-4 mb-1" />
                  <span className="text-[#222] text-[12px] font-small">Verified</span>
                </span>
              )}
              <button onClick={() => openModal('email', userData?.email)} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-1.5 text-sm font-medium hover:bg-[#16634a] hover:text-white transition">Edit</button>
              {!userData?.is_email_verified && (
                <button onClick={() => openModal('email', userData?.email)} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-2 text-base font-medium bg-transparent">Verify</button>
              )}
            </div>
          </div>
          {/* Mobile */}
          <div className="bg-[#FBF8E5] rounded-lg flex items-center justify-between p-4 col-span-1">
            <div>
              <div className="font-semibold text-[#222] text-base">{userData?.mobile_number}</div>
              <div className="text-xs text-[#222]">Mobile number associated with your account</div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => openModal('mobile', userData?.mobile_number)} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-1.5 text-sm font-medium hover:bg-[#16634a] hover:text-white transition">Edit</button>
            </div>
          </div>
          {/* Password */}
          <div className="bg-[#FBF8E5] rounded-lg flex items-center justify-between p-4 col-span-1">
            <div>
              <div className="font-semibold text-[#222] text-base">Password</div>
              <div className="text-xs text-[#222]">Set a unique password to protect your account.</div>
            </div>
            <button onClick={() => openModal('password')} className="border border-[#16634a] text-[#16634a] rounded-lg px-5 py-1.5 text-sm font-medium bg-[#F8FAE6] hover:bg-[#16634a] hover:text-white transition">Change password</button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-10">
        <button className="border border-[#E53935] text-[#E53935] rounded-lg px-6 py-2 font-medium bg-white hover:bg-[#E53935] hover:text-white transition">Deactivate account</button>
        <button className="border border-[#16634a] text-[#16634a] rounded-lg px-6 py-2 font-medium bg-white hover:bg-[#16634a] hover:text-white transition">Go to Privacy policy</button>
      </div>

      {/* Explore More Services Section */}
      {/* <ServiceSection /> */}

      {/* Modals */}
      <SettingsModal
        open={!!modal && ['name', 'username', 'email', 'mobile'].includes(modal.type)}
        title={
          modal?.type === 'name'
            ? 'Edit Name'
            : modal?.type === 'username'
              ? 'Edit Username'
              : modal?.type === 'email'
                ? 'Email address'
                : modal?.type === 'mobile'
                  ? 'Mobile no'
                  : ''
        }
        onCancel={closeModal}
        onSubmit={() => {
         
            handleUpdate();

        }}
        loading={loading}
        disabled={modal?.type === 'email' && (!inputValue.trim() || inputValue === userData?.email || !!emailError)}
      >
        {modal?.type === 'name' && (
          <div>
            <label className="block font-semibold mb-2">Name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-2"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
        )}
        {modal?.type === 'username' && (
          <div>
            <label className="block font-semibold mb-2">Name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-2"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
        )}
        {modal?.type === 'email' && (
          <div>
            <label className="block font-semibold mb-2">Email</label>
            <input
              className={`w-full border rounded-lg px-4 py-3 text-lg mb-2 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                setEmailError(''); // Clear error when user types
                setIsEmailValid(false);
              }}
              placeholder="Email"
              type="email"
            />
            {emailError && (
              <div className="text-red-500 text-sm mb-2">{emailError}</div>
            )}
          </div>
        )}
        {modal?.type === 'mobile' && (
          <div>
            <label className="block font-semibold mb-2">Mobile number</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-2"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Enter your mobile number"
              type="tel"
            />
          </div>
        )}
      </SettingsModal>

      {/* OTP Modal */}
      <SettingsModal
        open={!!modal && modal.type === 'otp'}
        title="OTP has been sent to your email."
        onCancel={closeModal}
        onSubmit={handleUpdate}
        submitLabel="Submit"
        loading={loading}
      >
        <div className="mb-4 text-center">
          <span className="text-[#16634a] font-semibold">{modal?.value}</span>
          <button
            onClick={() => openModal('email', modal?.value)}
            className="ml-2 text-[#15803d] underline text-sm"
            type="button"
          >
            Change email
          </button>
        </div>
        <label className="block font-semibold mb-2 text-center">ENTER ONE TIME PASSWORD</label>
        <div className="flex justify-center mb-4">
          <OtpInput
            value={otpValue}
            onChange={setOtpValue}
            numInputs={6}
            renderSeparator={<span className="mx-1"></span>}
            renderInput={(props) => <input {...props} />}
            inputStyle={{
              width: '3rem',
              height: '3rem',
              fontSize: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #D1D5DB',
              margin: '0 0.2rem',
              textAlign: 'center',
              background: '#fff',
            }}
            containerStyle="justify-center"
          />
        </div>
        <div className="flex justify-between items-center">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resendOTP();
            }} 
            className="text-[#15803d] underline text-sm" 
            disabled={otpTimer > 0}
          >
            Resend
          </button>
          <span className="text-xs text-gray-500">{otpTimer > 0 ? `Resend 00:${otpTimer.toString().padStart(2, '0')}` : ''}</span>
        </div>
      </SettingsModal>

      {/* Notifications Modal */}
      <SettingsModal
        open={!!modal && modal.type === 'notifications'}
        title="Email notifications"
        onCancel={closeModal}
        onSubmit={handleUpdate}
        loading={loading}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">Alert New listingdsds</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.alert}
                onChange={e => setNotifications(n => ({ ...n, alert: e.target.checked }))}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#64E7CF] transition-all">
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 ${notifications.alert ? 'bg-[#007E67]' : 'bg-[#A0A0A0] '} rounded-full shadow transition-transform duration-200 ${notifications.alert ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">Newsletter</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.newsletter}
                onChange={e => setNotifications(n => ({ ...n, newsletter: e.target.checked }))}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#64E7CF] transition-all">
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 ${notifications.newsletter ? 'bg-[#007E67]' : 'bg-[#A0A0A0] '} rounded-full shadow transition-transform duration-200 ${notifications.newsletter ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">Update Password</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.updatePassword}
                onChange={e => setNotifications(n => ({ ...n, updatePassword: e.target.checked }))}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#64E7CF] transition-all">
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 ${notifications.updatePassword ? 'bg-[#007E67]' : 'bg-[#A0A0A0] '} rounded-full shadow transition-transform duration-200 ${notifications.updatePassword ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </label>
          </div>
        </div>
      </SettingsModal>

      {/* Change Password Modal */}
      <SettingsModal
        open={!!modal && modal.type === 'password'}
        title="Change Password"
        onCancel={closeModal}
        onSubmit={handleUpdate}
        loading={loading}
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="block font-semibold mb-2">Old password</label>
            <input
              className={`w-full border rounded-lg px-4 py-3 text-lg mb-2 ${passwordErrors.old ? 'border-red-500' : 'border-gray-300'}`}
              type="password"
              value={passwordFields.old}
              onChange={e => {
                setPasswordFields(prev => ({ ...prev, old: e.target.value }));
                setPasswordErrors(prev => ({ ...prev, old: '' }));
              }}
              placeholder="Enter old password"
            />
            {passwordErrors.old && (
              <div className="text-red-500 text-sm mb-2">{passwordErrors.old}</div>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2">New password</label>
            <input
              className={`w-full border rounded-lg px-4 py-3 text-lg mb-2 ${passwordErrors.new ? 'border-red-500' : 'border-gray-300'}`}
              type="password"
              value={passwordFields.new}
              onChange={e => {
                setPasswordFields(prev => ({ ...prev, new: e.target.value }));
                setPasswordErrors(prev => ({ ...prev, new: '' }));
              }}
              placeholder="Enter new password"
            />
            {passwordErrors.new && (
              <div className="text-red-500 text-sm mb-2">{passwordErrors.new}</div>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2">Confirm new password</label>
            <input
              className={`w-full border rounded-lg px-4 py-3 text-lg mb-2 ${passwordErrors.confirm ? 'border-red-500' : 'border-gray-300'}`}
              type="password"
              value={passwordFields.confirm}
              onChange={e => {
                setPasswordFields(prev => ({ ...prev, confirm: e.target.value }));
                setPasswordErrors(prev => ({ ...prev, confirm: '' }));
              }}
              placeholder="Confirm new password"
            />
            {passwordErrors.confirm && (
              <div className="text-red-500 text-sm mb-2">{passwordErrors.confirm}</div>
            )}
          </div>
        </div>
      </SettingsModal>

      {/* Google Unlink Modal */}
      <SettingsModal
        open={!!modal && modal.type === 'googleUnlink'}
        title="Unlink Google Account"
        onCancel={closeModal}
        onSubmit={handleUpdate}
        loading={loading}
      >
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Are you sure you want to unlink your Google account? You will need to set up a password to continue using your account.
          </p>
        </div>
      </SettingsModal>
    </div>
  );
};

export default AccountSettings;