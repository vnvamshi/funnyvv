import React, { useState, useContext } from 'react';
import SettingsModal from '../../settings/SettingsModal';
import { ToastContext } from '../../../App';
import { showGlobalToast } from '../../../utils/toast';
import api from '../../../utils/api';
import * as Yup from 'yup';
import tickIcon from '../../../assets/images/tick-icon.svg';
import OtpInput from 'react-otp-input';

interface TabsProps {
  onTabChange?: (tab: 'about' | 'security') => void;
  userData?: any;
  onProfileUpdated?: (updatedData: any) => void;
  onEditAboutAgent?: () => void;
}

const AgentTabs: React.FC<TabsProps> = ({ onTabChange, userData, onProfileUpdated, onEditAboutAgent }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'security'>('about');
  const [modal, setModal] = useState<{
    type: 'email' | 'mobile' | 'password' | 'notifications' | 'otp';
    value?: string;
  } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFields, setPasswordFields] = useState({ old: '', new: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({ old: '', new: '', confirm: '' });
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(59);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Email validation state
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [notifications, setNotifications] = useState({
    alert: userData?.notify_buyer_enquiry || false,
    newsletter: userData?.notify_newsletter || false,
    updatePassword: userData?.notify_update_password || false,
  });

  const { showToast } = useContext(ToastContext);

  const showToastMessage = (message: string, duration?: number) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
    } else {
      showGlobalToast(message, duration);
    }
  };

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

  const handleTabClick = (tab: 'about' | 'security') => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const openModal = (type: 'email' | 'mobile' | 'password' | 'notifications' | 'otp', value?: string) => {
    setModal({ type, value });
    setInputValue(value || '');
    if (type === 'password') {
      setPasswordFields({ old: '', new: '', confirm: '' });
      setPasswordErrors({ old: '', new: '', confirm: '' });
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
    setOtpValue('');
    setOtpTimer(59);
    setEmailError('');
    setIsEmailValid(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    
    if (modal?.type === 'email') {
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
    
    if (modal?.type === 'mobile') {
      if (!inputValue.trim()) {
        showToastMessage('Mobile number is required');
        setLoading(false);
        return;
      }
      profileUpdate(modal?.type);
    }
    
    if (modal?.type === 'otp') {
      if (!otpValue.trim()) {
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
    
    if (modal?.type === 'password') {
      try {
        await passwordSchema.validate(passwordFields, { abortEarly: false });
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
    
    if (modal?.type === 'notifications') {
      updateNotifications();
    }
  };

  const profileUpdate = async (type: string, valueOverride?: string) => {
    try {
      const type_value = type === 'mobile' ? 'mobile_number' : type;
      const value = valueOverride !== undefined ? valueOverride : inputValue;
      
      const response = await api.put('/common/profile/update/', {
        [type_value]: value,
      });
      if (response.data.status_code === 200) {
        showToastMessage(response.data.message);
        // Fetch latest profile and update parent
        const profileResp = await api.get('/common/profile-subscription/');
        if (profileResp.data.status_code === 200 && onProfileUpdated) {
          onProfileUpdated(profileResp.data.data?.profile);
        }
        closeModal();
        setLoading(false);
      }
    } catch (error: any) {
      showToastMessage(error.response.data.message);
      setLoading(false);
    }
  };

  const validateOTP = async () => {
    try {
      const response = await api.post('/common/otp/validate/', {
        otp: otpValue,
        email: userData?.email,
      });
      if (response.data.status_code === 200) {
        showToastMessage(response.data.message);
        // Fetch latest profile and update parent
        const profileResp = await api.get('/common/profile-subscription/');
        if (profileResp.data.status_code === 200 && onProfileUpdated) {
          onProfileUpdated(profileResp.data.data?.profile);
        }
        setLoading(false);
        closeModal();
      }
    } catch (error: any) {
      showToastMessage(error.response.data.message);
      setLoading(false);
    }
  };

  const changePassword = async () => {
    try {
      const response = await api.put('/common/change-password/', {
        old_password: passwordFields.old,
        new_password: passwordFields.new,
        confirm_password: passwordFields.confirm,
      });
      if (response.data.status_code === 200) {
        showToastMessage(response.data.message);
        setLoading(false);
        closeModal();
      }
    } catch (error: any) {
      showToastMessage(error.response.data.message);
      setLoading(false);
    }
  };

  const updateNotifications = async () => {
    try {
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
      if (response.data.status_code === 200) {
        showToastMessage(response.data.message);
        // Fetch latest profile and update parent
        const profileResp = await api.get('/common/profile-subscription/');
        if (profileResp.data.status_code === 200 && onProfileUpdated) {
          onProfileUpdated(profileResp.data.data?.profile);
        }
        closeModal();
        setLoading(false);
      }
    } catch (error: any) {
      showToastMessage(error.response.data.message);
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResendLoading(true); // Immediately disable button
    try {
      const response = await api.post('/common/otp/send/', {
        email: userData?.email,
      });
      if (response.data.status_code === 200) {
        showToastMessage(response.data.message);
        setOtpTimer(59); // Reset timer after successful resend
      }
    } catch (error: any) {
      showToastMessage(error.response.data.message);
    } finally {
      setResendLoading(false); // Re-enable button after API call completes
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    if (modal?.type === 'otp' && otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (modal?.type !== 'otp') setOtpTimer(59);
  }, [modal, otpTimer]);

  return (
    <>
      <div className="flex w-full border-b border-gray-200 mb-4">
        <button
          className={`flex-1 text-center py-3 font-semibold transition relative ${activeTab === 'about' ? 'text-[#007E67]' : 'text-gray-400'}`}
          onClick={() => handleTabClick('about')}
        >
          About Agent
          {activeTab === 'about' && (
            <span className="absolute left-0 bottom-0 w-full h-1" style={{background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)', borderRadius: '2px'}}></span>
          )}
        </button>
        <button
          className={`flex-1 text-center py-3 font-semibold transition relative ${activeTab === 'security' ? 'text-[#007E67]' : 'text-gray-400'}`}
          onClick={() => handleTabClick('security')}
        >
          Sign in & Security
          {activeTab === 'security' && (
            <span className="absolute left-0 bottom-0 w-full h-1" style={{background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)', borderRadius: '2px'}}></span>
          )}
        </button>
      </div>
      {activeTab === 'about' && (
        <div className="space-y-4">
          {/* Specialties */}
          <div className="bg-[#DFFFF8] rounded-xl p-4">
            <div className="font-semibold text-sm mb-2">Specialties</div>
            <div className="flex gap-2 mb-2">
              {userData?.specialties && userData.specialties.length > 0 ? (
                userData.specialties.map((spec: string) => (
                  <span key={spec} className="bg-[#7AC7B5] text-primary px-3 py-1 rounded-md text-xs font-bold">{spec}</span>
                ))
              ) : (
                <span className="text-gray-400">No specialties listed</span>
              )}
            </div>
            <button className="border border-[#007E67] text-[#007E67] px-4 py-1 rounded-md text-xs font-medium" onClick={onEditAboutAgent}>Edit</button>
          </div>
          {/* Languages */}
          <div className="bg-[#DFFFF8] rounded-xl p-4">
            <div className="font-semibold text-sm mb-2">Agent speaks</div>
            <div className="font-bold text-base mb-2">
              {userData?.languages && userData.languages.length > 0 ? userData.languages.join(', ') : <span className="text-gray-400">No languages listed</span>}
            </div>
            <button className="border border-[#007E67] text-[#007E67] px-4 py-1 rounded-md text-xs font-medium" onClick={onEditAboutAgent}>Edit</button>
          </div>
          {/* Experience */}
          <div className="bg-[#DFFFF8] rounded-xl p-4">
            <div className="font-semibold text-sm mb-2">Experience as agent</div>
            <div className="font-bold text-base mb-2">
              {userData?.business_since ? (
                <>Since {userData.business_since}, {new Date().getFullYear() - userData.business_since} yrs experience as a professional agent</>
              ) : (
                <span className="text-gray-400">No experience info</span>
              )}
            </div>
            <button className="border border-[#007E67] text-[#007E67] px-4 py-1 rounded-md text-xs font-medium" onClick={onEditAboutAgent}>Edit</button>
          </div>
          {/* Service Areas */}
          <div className="bg-[#DFFFF8] rounded-xl p-4">
            <div className="font-semibold text-sm mb-2">Service Areas</div>
            <div className="font-bold text-base mb-2">
              {userData?.user_service_areas && userData.user_service_areas.length > 0 ? (
                userData.user_service_areas.map((area: any) => area.name).join(', ')
              ) : (
                <span className="text-gray-400">No service areas listed</span>
              )}
            </div>
            <button className="border border-[#007E67] text-[#007E67] px-4 py-1 rounded-md text-xs font-medium" onClick={onEditAboutAgent}>Edit</button>
          </div>
        </div>
      )}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Email */}
          <div className="bg-[#FCF8E6] rounded-2xl p-4">
            <div className="font-bold text-lg mb-1">{userData?.email}</div>
            <div className="text-base mb-4">The email address associated with your account.</div>
            {userData?.is_email_verified ? (
              <div className="flex gap-3 items-center justify-start">
                <div className="flex flex-col items-center">
                  <span className="flex items-center justify-center w-5 h-5 mb-0.5">
                    <img src={tickIcon} alt="Verified" className="w-4 h-4" />
                  </span>
                  <span className="text-black text-xs font-medium">Verified</span>
                </div>
                <button onClick={() => openModal('email', userData?.email)} className="border border-[#16634a] text-[#16634a] rounded px-3 py-1 text-xs font-medium bg-transparent ml-2">Edit</button>
              </div>
            ) : (
              <div className="flex gap-2 items-center justify-start">
                <button onClick={() => openModal('email', userData?.email)} className="border border-[#16634a] text-[#16634a] rounded px-3 py-1 text-xs font-medium bg-transparent">Verify</button>
                <button onClick={() => openModal('email', userData?.email)} className="border border-[#16634a] text-[#16634a] rounded px-3 py-1 text-xs font-medium hover:bg-[#16634a] hover:text-white transition">Edit</button>
              </div>
            )}
          </div>
          {/* Phone */}
          <div className="bg-[#FBF8E5] rounded-xl p-4">
            <div className="font-bold text-base mb-1">{userData && userData?.mobile_number}</div>
            <div className="text-xs text-gray-600 mb-3">Mobile number associated with your account</div>
            <div className="flex gap-2">
              <button 
                className="border border-[#007E67] text-[#007E67] px-4 py-1 rounded-md text-xs font-medium"
                onClick={() => openModal('mobile', userData?.mobile_number)}
              >
                Edit
              </button>
            </div>
          </div>
          {/* Password */}
          <div className="bg-[#FBF8E5] rounded-xl p-4">
            <div className="font-bold text-base mb-1">Password</div>
            <div className="text-xs text-gray-600 mb-3">Set a unique password to protect your account.</div>
            <button 
              className="border border-[#007E67] text-[#007E67] px-4 py-1 rounded-md text-xs font-medium"
              onClick={() => openModal('password')}
            >
              Change password
            </button>
          </div>
          {/* Email Notifications */}
          <div className="bg-[#FBF8E5] rounded-xl p-4">
            <div className="font-bold text-base mb-1">Email Notifications</div>
            <div className="text-xs text-gray-600 mb-3">Manage the notifications to receive the recent updates and responses</div>
            <button 
              className="border border-[#007E67] text-[#007E67] px-4 py-1 rounded-md text-xs font-medium"
              onClick={() => openModal('notifications')}
            >
              Manage
            </button>
          </div>
        </div>
      )}

      {/* Mobile Modals */}
      <SettingsModal
        open={!!modal && ['email', 'mobile'].includes(modal.type)}
        title={
          modal?.type === 'email'
            ? 'Email Address'
            : modal?.type === 'mobile'
              ? 'Mobile No.'
              : ''
        }
        onCancel={closeModal}
        onSubmit={handleUpdate}
        loading={loading}
        disabled={modal?.type === 'email' && (!inputValue.trim() || inputValue === userData?.email || !!emailError)}
        variant="mobile"
      >
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
      </SettingsModal>

      {/* OTP Modal */}
      {modal?.type === 'otp' && (
        <SettingsModal
          open={!!modal && modal.type === 'otp'}
          title="OTP Verification"
          onCancel={closeModal}
          onSubmit={handleUpdate}
          submitLabel="Submit"
          loading={loading}
          variant="mobile"
        >
          <div className="mb-4 text-center">
            <span className="text-[#16634a] font-semibold">{modal?.value || userData?.email}</span>
            <button onClick={() => openModal('email', modal?.value || userData?.email)} className="ml-2 text-[#15803d] underline text-sm">Change email</button>
          </div>
          <label className="block font-semibold mb-2 text-center">ENTER ONE TIME PASSWORD</label>
          <div className="flex justify-center mb-4">
            <OtpInput
              value={otpValue}
              onChange={setOtpValue}
              numInputs={6}
              renderSeparator={<span className="mx-1"></span>}
              renderInput={props => <input {...props} />}
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
            <button onClick={resendOTP} className="text-[#15803d] underline text-sm" disabled={otpTimer > 0 || resendLoading}>{resendLoading ? 'Sending...' : 'Resend'}</button>
            <span className="text-xs text-gray-500">{otpTimer > 0 ? `Resend 00:${otpTimer.toString().padStart(2, '0')}` : ''}</span>
          </div>
        </SettingsModal>
      )}

      {/* Change Password Modal */}
      <SettingsModal
        open={!!modal && modal.type === 'password'}
        title="Change password"
        onCancel={closeModal}
        onSubmit={handleUpdate}
        loading={loading}
        variant="mobile"
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
        variant="mobile"
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
    </>
  );
};

export default AgentTabs; 