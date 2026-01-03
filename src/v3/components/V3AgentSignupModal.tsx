import React from 'react';
import { X, Check } from 'lucide-react';
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { showGlobalToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSignInClick?: () => void;
  onSwitchToBuyerSignUp?: () => void;
  onCreateAccount?: (data: { countryCode: string; mobile: string; mlsAgentId: string; accept: boolean }) => void;
};

const V3AgentSignupModal: React.FC<Props> = ({ isOpen, onClose, onSignInClick, onSwitchToBuyerSignUp, onCreateAccount }) => {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = React.useState('+1');
  const [mobile, setMobile] = React.useState('');
  const [mlsAgentId, setMlsAgentId] = React.useState('');
  const [accept, setAccept] = React.useState(false);
  const [errors, setErrors] = React.useState<{ mobile?: string; mlsAgentId?: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [mlsVerified, setMlsVerified] = React.useState(false);
  const [verifyLoading, setVerifyLoading] = React.useState(false);
  const [showOtpModal, setShowOtpModal] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpTimer, setOtpTimer] = React.useState(0);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [signupData, setSignupData] = React.useState<{ countryCode: string; mobile: string; mlsAgentId: string; userId?: string } | null>(null);
  const [showChangeMobileModal, setShowChangeMobileModal] = React.useState(false);
  const [editCountryCode, setEditCountryCode] = React.useState('+1');
  const [editMobile, setEditMobile] = React.useState('');
  const [editMobileError, setEditMobileError] = React.useState('');
  const [changeMobileLoading, setChangeMobileLoading] = React.useState(false);
  const { user, setUser, setIsLoggedIn } = useAuth();

  // OTP Timer countdown
  React.useEffect(() => {
    if (showOtpModal && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showOtpModal, otpTimer]);

  // Reset MLS verification and errors when License ID changes
  React.useEffect(() => {
    setMlsVerified(false);
    if (errors.mlsAgentId) {
      setErrors({ ...errors, mlsAgentId: undefined });
    }
  }, [mlsAgentId]);

  const handleVerifyMls = async () => {
    if (!mlsAgentId.trim()) {
      return;
    }

    setVerifyLoading(true);
    // Clear previous errors
    setErrors({ ...errors, mlsAgentId: undefined });
    
    try {
      const response = await api.post('/common/mls/verify/', {
        mls_agent_id: mlsAgentId.trim(),
      });

      if (response.data?.status_code === 200) {
        setMlsVerified(true);
        setErrors({ ...errors, mlsAgentId: undefined });
      } else if (response.data?.status_code === 400) {
        const errorMessage = response.data?.message || 'Invalid License ID';
        setErrors({ ...errors, mlsAgentId: errorMessage });
        setMlsVerified(false);
      } else {
        const errorMessage = response.data?.message || 'License ID verification failed';
        setErrors({ ...errors, mlsAgentId: errorMessage });
        setMlsVerified(false);
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid License ID';
        setErrors({ ...errors, mlsAgentId: errorMessage });
        setMlsVerified(false);
      } else {
        const errorMessage = error.response?.data?.message || 'License ID verification failed';
        setErrors({ ...errors, mlsAgentId: errorMessage });
        setMlsVerified(false);
      }
      console.error('MLS verification error:', error);
    } finally {
      setVerifyLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const newErrors: { mobile?: string } = {};
    
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }
    
    setErrors(newErrors);
    
    // Only proceed if there are no errors
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      try {
        // Call agent signup API first
        const signupResp = await api.post('/common/agent/signup/', {
          user_type: 'agent',
          country_code: countryCode,
          mobile_number: mobile,
          mls_agent_id: mlsAgentId.trim() || undefined,
        });

        if (signupResp.data?.status_code === 200) {
          // Try to extract user id from response payload
          const respData = signupResp.data?.data || signupResp.data;
          const createdUserId = respData?.user_id || respData?.id || undefined;
          // Store signup data for OTP verification flow
          setSignupData({
            countryCode,
            mobile,
            mlsAgentId: mlsAgentId.trim(),
            userId: createdUserId,
          });
          setShowOtpModal(true);
          setOtpTimer(59);
          showGlobalToast('Please enter the OTP sent to your mobile number', 3000);
        } else {
          showGlobalToast(signupResp.data?.message || 'Signup failed', 3000);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Signup failed';
        showGlobalToast(errorMessage, 4000);
        console.error('Agent signup error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (!signupData) return;
    
    setResendLoading(true);
    try {
      const response = await api.post('/common/otp/send/', { 
        user_type: 'agent',
        country_code: signupData.countryCode,
        mobile_number: signupData.mobile
      });
      
      if (response.data.status_code === 200) {
        setOtpTimer(59);
        showGlobalToast('OTP resent successfully', 3000);
      } else {
        showGlobalToast(response.data.message || 'Failed to resend OTP', 3000);
      }
    } catch (error: any) {
      showGlobalToast(error.response?.data?.message || 'Failed to resend OTP', 3000);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      showGlobalToast('Please enter a valid 6-digit OTP', 3000);
      return;
    }
    
    if (!signupData) {
      showGlobalToast('Signup data not found', 3000);
      return;
    }
    
    setOtpLoading(true);
    
    try {
      // Verify OTP
      const verifyResponse = await api.post('/common/otp/validate/', {
        user_type: 'agent',
        otp: otp,
        country_code: signupData.countryCode,
        mobile_number: signupData.mobile,
        agent_registration: true
      });
      
      if (verifyResponse.data.status_code === 200) {
        // Persist auth data so headers can show the username
        const authData = verifyResponse.data?.data;
        // Note: agent_registration is only sent in agent signup flow OTP validation
        // Check for agent_registration in both top level and data object
        const agentRegistration = verifyResponse.data?.agent_registration ?? authData?.agent_registration;
        
        if (authData) {
          try {
            // Include agent_registration in auth data if present (only in agent signup flow)
            const userData = agentRegistration !== undefined 
              ? { ...authData, agent_registration: agentRegistration }
              : authData;
            
            setUser(userData);
            setIsLoggedIn(true);
            localStorage.setItem('authentication', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            if (userData.access_token) {
              localStorage.setItem('access_token', userData.access_token);
            }
            if (userData.refresh_token) {
              localStorage.setItem('refresh_token', userData.refresh_token);
            }
            if (agentRegistration !== undefined) {
              localStorage.setItem('agent_registration', JSON.stringify(agentRegistration));
            }
            // Mirror v3 login flow: persist subscription flag for downstream checks
            localStorage.setItem('has_active_subscription', JSON.stringify(!!userData.has_active_subscription));
          } catch {}
        }
        showGlobalToast('Account verified successfully!', 3000);
        // Call the onCreateAccount callback if provided
        onCreateAccount?.({ 
          countryCode, 
          mobile, 
          mlsAgentId: signupData.mlsAgentId, 
          accept 
        });
        // Reset form
        setMobile('');
        setMlsAgentId('');
        setAccept(false);
        setErrors({});
        setOtp('');
        setShowOtpModal(false);
        setSignupData(null);
        // Close modal after successful OTP verification
        onClose();

        // Redirect similar to v3 login flow based on subscription and user type
        if (authData) {
          const userDataForNav = authData;
          if (!userDataForNav?.has_active_subscription) {
            navigate('/v3/plan', { replace: true });
          } else if (userDataForNav?.user_type === 'agent') {
            navigate('/agent/profile', { replace: true });
          } else if (userDataForNav?.user_type === 'builder') {
            navigate('/builder/onboarding', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      } else {
        showGlobalToast(verifyResponse.data.message || 'Invalid OTP', 3000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      showGlobalToast(errorMessage, 4000);
      console.error('OTP verification error:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Modal
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={showOtpModal ? undefined : onClose}>
      <div
        className="relative w-full max-w-[520px] mx-4 bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!showOtpModal && (
          <button
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            onClick={onClose}
            type="button"
          >
            <X size={22} />
          </button>
        )}

        {!showOtpModal && (
        <div className="px-6 md:px-8 pt-6 pb-5">
          <h2 className="text-[24px] md:text-[26px] font-bold text-emerald-900">Sign up as Agent</h2>
          <p className="mt-2 text-sm text-gray-600">
            Save your favourite properties and explore more on the properties
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Already have an account ?{' '}
            <button type="button" onClick={onSignInClick} className="text-emerald-800 underline">
              Sign in
            </button>
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Are you a buyer ?{' '}
            <button type="button" onClick={onSwitchToBuyerSignUp} className="text-emerald-800 underline">
              Sign up as Buyer
            </button>
          </p>

          <form className="mt-5" onSubmit={handleSubmit}>
            <p className="text-[12px] font-semibold tracking-wider text-gray-600 mb-2">SIGN UP WITH MOBILE NUMBER</p>

            {/* Country code + Mobile */}
            <div className="mb-3">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 h-10">
                  <span className="inline-flex w-6 h-4 bg-[url('https://flagcdn.com/w40/us.png')] bg-center bg-cover rounded" aria-hidden />
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent outline-none text-sm"
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+61">+61</option>
                  </select>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) => {
                    // Only allow numeric characters
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setMobile(numericValue);
                    if (errors.mobile) {
                      setErrors({ ...errors, mobile: undefined });
                    }
                  }}
                  placeholder="Mobile Number"
                  className={`flex-1 h-10 rounded-lg border ${
                    errors.mobile ? 'border-red-500' : 'border-gray-300'
                  } focus:border-emerald-700 focus:ring-0 px-3 outline-none text-sm placeholder:text-sm`}
                />
              </div>
              {errors.mobile && (
                <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>
              )}
            </div>

            {/* License ID */}
            <div className="mb-4 relative">
              <input
                value={mlsAgentId}
                onChange={(e) => {
                  setMlsAgentId(e.target.value);
                  if (errors.mlsAgentId) {
                    setErrors({ ...errors, mlsAgentId: undefined });
                  }
                }}
                placeholder="License ID (Optional)"
                className={`w-full h-10 rounded-lg border ${
                  errors.mlsAgentId ? 'border-red-500' : 'border-gray-300'
                } focus:border-emerald-700 focus:ring-0 outline-none text-sm placeholder:text-sm ${
                  mlsAgentId.trim() ? 'pr-20' : 'px-3'
                }`}
                style={{ paddingLeft: '12px' }}
              />
              {mlsAgentId.trim() && (
                <>
                  {mlsVerified ? (
                    <button
                      type="button"
                      disabled
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)' }}
                    >
                      <Check size={12} strokeWidth={2} style={{ stroke: 'rgba(0, 66, 54, 1)' }} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyMls}
                      disabled={verifyLoading}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 rounded-md text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                    >
                      {verifyLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                </>
              )}
              {errors.mlsAgentId && (
                <p className="mt-1 text-xs text-red-500">{errors.mlsAgentId}</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 text-sm text-gray-700 mb-4">
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
                className="mt-0.5 h-4 w-4 border-gray-300 rounded"
              />
              <span>
                By creating an account you agree to our{' '}
                <a className="text-emerald-800 underline" href="#">Terms of use</a> and{' '}
                <a className="text-emerald-800 underline" href="#">Privacy Policy</a>
              </span>
            </label>

            {/* Create account */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
        )}
      </div>
      {showOtpModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50" onClick={() => setShowOtpModal(false)}>
          <div
            className="relative w-full max-w-[520px] mx-4 bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setShowOtpModal(false);
                setOtp('');
                setSignupData(null);
                // reset any otp-related local state
              }}
              type="button"
            >
              <X size={22} />
            </button>
            <div className="px-6 md:px-8 pt-6 pb-5">
              <h2 className="text-[24px] md:text-[26px] font-bold text-emerald-900">Verify OTP</h2>
              <div className="mt-2 text-sm text-gray-600 flex items-center justify-between">
                <span>Enter the OTP sent to {signupData ? `${signupData.countryCode}${signupData.mobile}` : ''}</span>
                <button
                  type="button"
                  className="text-emerald-800 underline ml-3"
                  onClick={() => {
                    if (signupData) {
                      setEditCountryCode(signupData.countryCode);
                      setEditMobile(signupData.mobile);
                      setEditMobileError('');
                      setShowChangeMobileModal(true);
                    }
                  }}
                >
                  Change mobile
                </button>
              </div>
              <form className="mt-5" onSubmit={handleOtpSubmit}>
                <div className="flex justify-center mb-6">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span className="mx-1"></span>}
                    renderInput={(props) => <input {...props} />}
                    containerStyle="justify-center"
                    inputStyle={{
                      width: '3rem',
                      height: '3rem',
                      fontSize: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #D1D5DB',
                      textAlign: 'center',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full h-11 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                >
                  {otpLoading ? 'Verifying...' : 'Submit'}
                </button>
              </form>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || resendLoading}
                  className="text-sm text-emerald-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
                {otpTimer > 0 && (
                  <span className="text-xs text-gray-500">
                    Resend in 00:{otpTimer.toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Mobile Number Modal */}
      {showChangeMobileModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50" onClick={() => setShowChangeMobileModal(false)}>
          <div
            className="relative w-full max-w-[520px] mx-4 bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setShowChangeMobileModal(false);
                setEditMobileError('');
              }}
              type="button"
            >
              <X size={22} />
            </button>

            <div className="px-6 md:px-8 pt-6 pb-5">
              <h2 className="text-[24px] md:text-[26px] font-bold text-emerald-900">Change Mobile Number</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your new mobile number
              </p>

              <form className="mt-5" onSubmit={async (e) => {
                e.preventDefault();
                
                if (!editMobile.trim()) {
                  setEditMobileError('Mobile number is required');
                  return;
                }

                setChangeMobileLoading(true);
                try {
                  const effectiveUserId = signupData?.userId || user?.user_id;
                  if (!effectiveUserId) {
                    showGlobalToast('User not found. Please login again.', 3000);
                    setChangeMobileLoading(false);
                    return;
                  }
                  // Call mobile update API first
                  const updateResp = await api.post('/common/user/mobile/update/', {
                    user_id: effectiveUserId,
                    country_code: editCountryCode,
                    mobile_number: editMobile,
                  });
                  if (updateResp.data?.status_code !== 200) {
                    showGlobalToast(updateResp.data?.message || 'Failed to update mobile number', 3000);
                    setChangeMobileLoading(false);
                    return;
                  }
                  // Update local signup data to reflect new number
                  if (signupData) {
                    setSignupData({
                      ...signupData,
                      countryCode: editCountryCode,
                      mobile: editMobile,
                    });
                  }
                  // Close modal; no OTP send required per requirement
                  setShowChangeMobileModal(false);
                  setEditMobileError('');
                  showGlobalToast('Mobile number updated', 3000);
                } catch (error: any) {
                  const errorMessage = error.response?.data?.message || 'Failed to send OTP';
                  showGlobalToast(errorMessage, 4000);
                  console.error('Change mobile error:', error);
                } finally {
                  setChangeMobileLoading(false);
                }
              }}>
                {/* Country code + Mobile */}
                <div className="mb-3">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 h-10">
                      <span className="inline-flex w-6 h-4 bg-[url('https://flagcdn.com/w40/us.png')] bg-center bg-cover rounded" aria-hidden />
                      <select
                        value={editCountryCode}
                        onChange={(e) => setEditCountryCode(e.target.value)}
                        className="bg-transparent outline-none text-sm"
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+91">+91</option>
                        <option value="+61">+61</option>
                      </select>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={editMobile}
                      onChange={(e) => {
                        // Only allow numeric characters
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setEditMobile(numericValue);
                        if (editMobileError) {
                          setEditMobileError('');
                        }
                      }}
                      placeholder="Mobile Number"
                      className={`flex-1 h-10 rounded-lg border ${
                        editMobileError ? 'border-red-500' : 'border-gray-300'
                      } focus:border-emerald-700 focus:ring-0 px-3 outline-none text-sm placeholder:text-sm`}
                    />
                  </div>
                  {editMobileError && (
                    <p className="mt-1 text-xs text-red-500">{editMobileError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={changeMobileLoading}
                  className="w-full h-11 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                >
                  {changeMobileLoading ? 'Sending OTP...' : 'Update & Send OTP'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default V3AgentSignupModal;

