import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { showGlobalToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';

interface Country {
  country: string;
  country_code: string;
  code: string;
  phone_code: string;
  flag_svg: string;
  flag_png: string;
}

const FALLBACK_COUNTRIES: Country[] = [
  {
    country: 'United States',
    country_code: 'us',
    code: 'USA',
    phone_code: '+1',
    flag_svg: 'https://flagcdn.com/us.svg',
    flag_png: 'https://flagcdn.com/w40/us.png',
  },
  {
    country: 'Canada',
    country_code: 'ca',
    code: 'CAN',
    phone_code: '+1',
    flag_svg: 'https://flagcdn.com/ca.svg',
    flag_png: 'https://flagcdn.com/w40/ca.png',
  },
  {
    country: 'United Kingdom',
    country_code: 'gb',
    code: 'GBR',
    phone_code: '+44',
    flag_svg: 'https://flagcdn.com/gb.svg',
    flag_png: 'https://flagcdn.com/w40/gb.png',
  },
  {
    country: 'Australia',
    country_code: 'au',
    code: 'AUS',
    phone_code: '+61',
    flag_svg: 'https://flagcdn.com/au.svg',
    flag_png: 'https://flagcdn.com/w40/au.png',
  },
  {
    country: 'India',
    country_code: 'in',
    code: 'IND',
    phone_code: '+91',
    flag_svg: 'https://flagcdn.com/in.svg',
    flag_png: 'https://flagcdn.com/w40/in.png',
  },
  {
    country: 'United Arab Emirates',
    country_code: 'ae',
    code: 'ARE',
    phone_code: '+971',
    flag_svg: 'https://flagcdn.com/ae.svg',
    flag_png: 'https://flagcdn.com/w40/ae.png',
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSignInClick?: () => void;
  onCreateAccount?: (data: { name: string; countryCode: string; mobile: string; accept: boolean }) => void;
};

const V3SignupModal: React.FC<Props> = ({ isOpen, onClose, onSignInClick, onCreateAccount }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [name, setName] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [accept, setAccept] = React.useState(false);
  const [errors, setErrors] = React.useState<{ name?: string; mobile?: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [showOtpModal, setShowOtpModal] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpTimer, setOtpTimer] = React.useState(0);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [signupData, setSignupData] = React.useState<{ name: string; countryCode: string; mobile: string; userId?: string } | null>(null);
  const { user, setUser, setIsLoggedIn } = useAuth();

  const [countries, setCountries] = React.useState<Country[]>(FALLBACK_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(FALLBACK_COUNTRIES[0] || null);
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
  const countryTriggerRef = React.useRef<HTMLDivElement | null>(null);
  const countryDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [countryDropdownRect, setCountryDropdownRect] = React.useState<DOMRect | null>(null);

  const getCurrentPhoneCode = () => selectedCountry?.phone_code || '+1';

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get('/common/countries/');
        const apiData = response.data?.results as Country[] | undefined;
        const cleaned = Array.isArray(apiData) ? apiData : [];
        if (!cancelled && cleaned.length) {
          setCountries(cleaned);
          if (!selectedCountry) {
            setSelectedCountry(cleaned[0]);
          }
        }
      } catch (error) {
        // fallback to default list
        console.error('Failed to fetch countries', error);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!showCountryDropdown || isMobile) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        countryTriggerRef.current &&
        !countryTriggerRef.current.contains(target) &&
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(target)
      ) {
        setShowCountryDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown, isMobile]);

  // OTP Timer countdown
  React.useEffect(() => {
    if (showOtpModal && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showOtpModal, otpTimer]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const newErrors: { name?: string; mobile?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }
    
    if (!accept) {
      showGlobalToast('Please accept the terms and conditions', 3000);
      return;
    }
    
    setErrors(newErrors);
    
    // Only proceed if there are no errors
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      try {
        // Call buyer signup API
        const signupResp = await api.post('/common/agent/signup/', {
          user_type: 'buyer',
          country_code: getCurrentPhoneCode(),
          mobile_number: mobile.trim(),
          name: name.trim(),
        });

        if (signupResp.data?.status_code === 200) {
          // Try to extract user id from response payload
          const respData = signupResp.data?.data || signupResp.data;
          const createdUserId = respData?.user_id || respData?.id || undefined;
          // Store signup data for OTP verification flow
          setSignupData({
            name: name.trim(),
            countryCode: getCurrentPhoneCode(),
            mobile: mobile.trim(),
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
        console.error('Buyer signup error:', error);
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
        user_type: 'buyer',
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
      // Verify OTP (without agent_registration for buyer)
      const verifyResponse = await api.post('/common/otp/validate/', {
        user_type: 'buyer',
        otp: otp,
        country_code: signupData.countryCode,
        mobile_number: signupData.mobile,
      });
      
      if (verifyResponse.data.status_code === 200) {
        // Persist auth data
        const authData = verifyResponse.data?.data;
        
        if (authData) {
          try {
            setUser(authData);
            setIsLoggedIn(true);
            localStorage.setItem('authentication', JSON.stringify(authData));
            localStorage.setItem('isLoggedIn', 'true');
            if (authData.access_token) {
              localStorage.setItem('access_token', authData.access_token);
            }
            if (authData.refresh_token) {
              localStorage.setItem('refresh_token', authData.refresh_token);
            }
            // Mirror v3 login flow: persist subscription flag for downstream checks
            localStorage.setItem('has_active_subscription', JSON.stringify(!!authData.has_active_subscription));
          } catch {}
        }
        showGlobalToast('Account verified successfully!', 3000);
        // Call the onCreateAccount callback if provided
        onCreateAccount?.({ 
          name: signupData.name,
          countryCode: signupData.countryCode, 
          mobile: signupData.mobile, 
          accept 
        });
        // Reset form
        setName('');
        setMobile('');
        setAccept(false);
        setErrors({});
        setOtp('');
        setShowOtpModal(false);
        setSignupData(null);
        // Close modal after successful OTP verification
        onClose();

        // Redirect similar to v3 login flow based on subscription and user type
        if (authData) {
          if (!authData?.has_active_subscription) {
            navigate('/v3/plan', { replace: true });
          } else if (authData?.user_type === 'agent') {
            navigate('/agent/profile', { replace: true });
          } else if (authData?.user_type === 'builder') {
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
          <h2
            className="text-[24px] md:text-[26px] font-bold text-emerald-900 text-left mb-2"
          >
            Sign up for an Account
          </h2>
          <p className="text-left text-gray-600 mb-2 text-sm">
            Save your favourite properties and explore more on the properties
          </p>
          <p className="text-left text-xs text-gray-500 mb-6">
            Already have an account ?{' '}
            <button
              type="button"
              onClick={onSignInClick}
              className="font-semibold text-primary-color hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
            >
              Sign in
            </button>
          </p>

          <form className="mt-5" onSubmit={handleSubmit}>
            <p className="text-xs font-bold tracking-wider text-gray-500 mb-2 uppercase">
              SIGN UP WITH MOBILE NUMBER
            </p>

            {/* Name */}
            <div className="mb-3">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                placeholder="Name"
                className={`w-full h-10 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:border-emerald-700 focus:ring-0 px-3 outline-none text-sm placeholder:text-sm`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Country code + Mobile */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div
                  ref={countryTriggerRef}
                  className="relative flex items-center gap-2 border border-gray-300 rounded-lg px-3 h-10 bg-white cursor-pointer select-none"
                  onClick={() => {
                    setShowCountryDropdown((open) => {
                      const next = !open;
                      if (next && !isMobile && countryTriggerRef.current) {
                        setCountryDropdownRect(countryTriggerRef.current.getBoundingClientRect());
                      }
                      return next;
                    });
                  }}
                  role="button"
                  aria-haspopup="listbox"
                  aria-expanded={showCountryDropdown}
                >
                  <img
                    src={selectedCountry?.flag_png || 'https://flagcdn.com/w40/us.png'}
                    alt={selectedCountry?.country || 'country'}
                    className="w-6 h-4 object-cover rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {selectedCountry?.phone_code || '+1'}
                  </span>
                  <span className="ml-1 text-gray-400 text-xs">▼</span>

                  {showCountryDropdown && (
                    isMobile ? (
                      <div className="absolute z-50 left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {countries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCountry(c);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                          >
                            <span className="flex items-center gap-2">
                              <img
                                src={c.flag_png}
                                alt={c.country}
                                className="w-6 h-4 object-cover rounded"
                              />
                              <span>{c.country}</span>
                            </span>
                            <span className="text-xs text-gray-500">{c.phone_code}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      countryDropdownRect &&
                      createPortal(
                        <div
                          ref={countryDropdownRef}
                          className="fixed z-[1200] bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                          style={{
                            top: countryDropdownRect.bottom + 4,
                            left: countryDropdownRect.left,
                            width: Math.max(countryDropdownRect.width, 288),
                          }}
                        >
                          {countries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCountry(c);
                                setShowCountryDropdown(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                            >
                              <span className="flex items-center gap-2">
                                <img
                                  src={c.flag_png}
                                  alt={c.country}
                                  className="w-6 h-4 object-cover rounded"
                                />
                                <span>{c.country}</span>
                              </span>
                              <span className="text-xs text-gray-500">{c.phone_code}</span>
                            </button>
                          ))}
                        </div>,
                        document.body
                      )
                    )
                  )}
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

          {/* Divider */}
          <div className="mt-6">
            <div className="flex items-center gap-3 text-gray-500 text-xs">
              <div className="flex-1 h-px bg-gray-200" />
              <span>OR SIGN UP WITH</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>

          {/* Social auth */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button type="button" className="flex flex-col items-center justify-center gap-2 p-3 hover:opacity-80 transition">
              <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                <FcGoogle className="text-[24px]" />
              </div>
              <span className="text-sm text-gray-900">Google</span>
            </button>
            <button type="button" className="flex flex-col items-center justify-center gap-2 p-3 hover:opacity-80 transition">
              <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                <FaApple className="text-[20px] text-gray-900" />
              </div>
              <span className="text-sm text-gray-900">Apple</span>
            </button>
            <button type="button" className="flex flex-col items-center justify-center gap-2 p-3 hover:opacity-80 transition">
              <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                <FaFacebook className="text-[20px] text-[#1877F2]" />
              </div>
              <span className="text-sm text-gray-900">Facebook</span>
            </button>
          </div>
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
              }}
              type="button"
            >
              <X size={22} />
            </button>
            <div className="px-6 md:px-8 pt-6 pb-5">
              <h2 className="text-[24px] md:text-[26px] font-bold text-emerald-900">Verify OTP</h2>
              <div className="mt-2 text-sm text-gray-600">
                <span>Enter the OTP sent to {signupData ? `${signupData.countryCode}${signupData.mobile}` : ''}</span>
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
    </div>
  );
};

export default V3SignupModal;


