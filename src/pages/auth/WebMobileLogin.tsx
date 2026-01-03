import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { showGlobalToast } from '../../utils/toast';
import { Check } from 'lucide-react';
import useIsMobile from '../../hooks/useIsMobile';

interface WebMobileLoginProps {
    onClose: () => void;
    onSwitchToSignup?: () => void;
    variant?: 'default' | 'professional' | 'professionalSignup';
}

interface ProfessionalUserType {
    id: string;
    user_type_name: string;
    user_type: string;
}

interface UserTypesCache {
    data: ProfessionalUserType[];
    fetchedAt: number;
}

interface Country {
    country: string;
    country_code: string;
    code: string;
    phone_code: string;
    flag_svg: string;
    flag_png: string;
}

interface CountriesCache {
    data: Country[];
    fetchedAt: number;
}

const USER_TYPES_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
let userTypesCache: UserTypesCache | null = null;
const COUNTRIES_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
let countriesCache: CountriesCache | null = null;

const FALLBACK_PROFESSIONAL_TYPES: ProfessionalUserType[] = [
    { id: 'fallback-agent', user_type_name: 'An Agent', user_type: 'agent' },
    { id: 'fallback-brokerage', user_type_name: 'Brokerage Office', user_type: 'brokerage_office' },
    { id: 'fallback-other', user_type_name: 'Other Professionals', user_type: 'other_professionals' },
    { id: 'fallback-vendor', user_type_name: 'Product Vendor', user_type: 'product_vendor' },
    { id: 'fallback-builder', user_type_name: 'Real Estate Builder / Developer', user_type: 'builder' },
];

const getProfessionalUserTypes = async (): Promise<ProfessionalUserType[]> => {
    const now = Date.now();
    if (userTypesCache && now - userTypesCache.fetchedAt < USER_TYPES_TTL_MS) {
        return userTypesCache.data;
    }

    try {
        const response = await api.get('/common/user-types/');
        const apiData = response.data?.data as ProfessionalUserType[] | undefined;
        const cleaned = Array.isArray(apiData) ? apiData : [];
        // If API returns empty array, return empty (don't use fallback)
        // Only cache and return if we have data
        if (cleaned.length) {
            userTypesCache = { data: cleaned, fetchedAt: now };
            return cleaned;
        } else {
            // API returned empty array - return empty and cache it
            userTypesCache = { data: [], fetchedAt: now };
            return [];
        }
    } catch (error: any) {
        // On API error, return empty array instead of fallback
        console.error('Failed to fetch professional user types', error);
        userTypesCache = { data: [], fetchedAt: now };
        return [];
    }
};

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

const getCountries = async (): Promise<Country[]> => {
    const now = Date.now();
    if (countriesCache && now - countriesCache.fetchedAt < COUNTRIES_TTL_MS) {
        return countriesCache.data;
    }

    try {
        const response = await api.get('/common/countries/');
        const apiData = response.data?.results as Country[] | undefined;
        const cleaned = Array.isArray(apiData) ? apiData : [];
        if (cleaned.length) {
            countriesCache = { data: cleaned, fetchedAt: now };
            return cleaned;
        }
    } catch (error: any) {
        console.error('Failed to fetch countries', error);
    }

    countriesCache = { data: FALLBACK_COUNTRIES, fetchedAt: now };
    return FALLBACK_COUNTRIES;
};

const WebMobileLogin: React.FC<WebMobileLoginProps> = ({ onClose, onSwitchToSignup, variant = 'default' }) => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { setIsLoggedIn, setUser } = useAuth();
    const [mobile, setMobile] = useState('');
    const [professionalType, setProfessionalType] = useState('');
    const [professionalName, setProfessionalName] = useState('');
    const [agentLicense, setAgentLicense] = useState('');
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showProfessionalDropdown, setShowProfessionalDropdown] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(59);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [signupData, setSignupData] = useState<{ name?: string; countryCode: string; mobile: string; userType?: string; mlsAgentId?: string; userId?: string } | null>(null);

    // License ID verification (reuse existing signup/profile behaviour)
    const [licenseVerified, setLicenseVerified] = useState(false);
    const [licenseVerifyLoading, setLicenseVerifyLoading] = useState(false);
    const [licenseError, setLicenseError] = useState<string | null>(null);
    const [professionalTypes, setProfessionalTypes] = useState<ProfessionalUserType[]>(FALLBACK_PROFESSIONAL_TYPES);
    const [countries, setCountries] = useState<Country[]>(FALLBACK_COUNTRIES);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(FALLBACK_COUNTRIES[0] || null);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const countryTriggerRef = useRef<HTMLDivElement | null>(null);
    const countryDropdownRef = useRef<HTMLDivElement | null>(null);
    const [countryDropdownRect, setCountryDropdownRect] = useState<DOMRect | null>(null);

    const isProfessional = variant === 'professional' || variant === 'professionalSignup';
    const isProfessionalSignup = variant === 'professionalSignup';

    // Timer countdown
    useEffect(() => {
        if (showOtp && timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [showOtp, timer]);

    // Load professional user types with caching
    useEffect(() => {
        if (!isProfessional) return;

        let cancelled = false;
        (async () => {
            const types = await getProfessionalUserTypes();
            if (!cancelled) {
                setProfessionalTypes(types);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isProfessional]);

    // Load countries with caching
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const list = await getCountries();
            if (!cancelled) {
                setCountries(list);
                if (!selectedCountry && list.length) {
                    setSelectedCountry(list[0]);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const getCurrentPhoneCode = () => selectedCountry?.phone_code || '+1';

    // Close country dropdown on outside click (desktop only)
    useEffect(() => {
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

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleResend = async () => {
        if (!mobile && !signupData) return;
        try {
            setLoading(true);
            
            // For professional signup, resend OTP for signup flow
            if (isProfessionalSignup && signupData) {
                const response = await api.post('/common/otp/send/', {
                    user_type: signupData.userType,
                    country_code: signupData.countryCode,
                    mobile_number: signupData.mobile,
                });
                if (response.data?.status_code === 200) {
                    setTimer(59);
                    showGlobalToast('OTP resent successfully', 3000);
                } else {
                    showGlobalToast(response.data?.message || 'Failed to resend OTP', 3000);
                }
            } else {
                // For login flow
                const response = await api.post('/common/otp/send/', {
                    user_type: isProfessional && professionalType ? professionalType : 'buyer',
                    country_code: getCurrentPhoneCode(),
                    mobile_number: mobile,
                    flag: 'login',
                });
                if (response.data?.status_code === 200) {
                    setTimer(59);
                    showGlobalToast('OTP resent successfully', 3000);
                } else {
                    showGlobalToast(response.data?.message || 'Failed to resend OTP', 3000);
                }
            }
        } catch (error: any) {
            showGlobalToast(error?.response?.data?.message || 'Failed to resend OTP', 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // For professional signup, validate and call signup API
        if (isProfessionalSignup) {
            // Validate required fields
            if (!professionalType) {
                showGlobalToast('Please select your professional type', 3000);
                return;
            }
            if (mobile.length < 6) {
                showGlobalToast('Please enter a valid mobile number', 3000);
                return;
            }
            // For non-agent professional types, name is required
            if (professionalType !== 'agent' && !professionalName.trim()) {
                showGlobalToast('Please enter your name', 3000);
                return;
            }
            
            // Terms acceptance required for signup
            if (!acceptTerms) {
                showGlobalToast('Please accept the terms and conditions', 3000);
                return;
            }
            
            setLoading(true);
            try {
                // Use the existing agent signup API (same as V3AgentSignupModal) but include user_type
                const signupPayload: any = {
                    country_code: getCurrentPhoneCode(),
                    mobile_number: mobile.trim(),
                    user_type: professionalType,
                };
                
                // Add name if present (for non-agent types)
                if (professionalName.trim()) {
                    signupPayload.name = professionalName.trim();
                }
                
                // Add mls_agent_id for agent type if provided
                if (professionalType === 'agent' && agentLicense.trim()) {
                    signupPayload.mls_agent_id = agentLicense.trim();
                }
                
                const signupResp = await api.post('/common/agent/signup/', signupPayload);
                
                if (signupResp.data?.status_code === 200) {
                    // Extract user id from response
                    const respData = signupResp.data?.data || signupResp.data;
                    const createdUserId = respData?.user_id || respData?.id || undefined;
                    
                    // Store signup data for OTP verification flow
                    setSignupData({
                        name: professionalType !== 'agent' ? professionalName.trim() : undefined,
                        countryCode: getCurrentPhoneCode(),
                        mobile: mobile.trim(),
                        userType: professionalType,
                        mlsAgentId: professionalType === 'agent' ? agentLicense.trim() : undefined,
                        userId: createdUserId,
                    });
                    setShowOtp(true);
                    setTimer(59);
                    showGlobalToast('Please enter the OTP sent to your mobile number', 3000);
                } else {
                    showGlobalToast(signupResp.data?.message || 'Signup failed', 3000);
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Signup failed';
                showGlobalToast(errorMessage, 4000);
                console.error('Professional signup error:', error);
            } finally {
                setLoading(false);
            }
            return;
        }
        
        // For login flow (default and professional login)
        if (mobile.length < 6) return;
        try {
            setLoading(true);
            const response = await api.post('/common/otp/send/', {
                user_type: isProfessional && professionalType ? professionalType : 'buyer',
                country_code: getCurrentPhoneCode(),
                mobile_number: mobile,
                flag: 'login',
            });
            if (response.data?.status_code === 200) {
                setShowOtp(true);
                setTimer(59);
                showGlobalToast('OTP sent to your mobile number', 3000);
            } else {
                showGlobalToast(response.data?.message || 'Failed to send OTP', 3000);
            }
        } catch (error: any) {
            showGlobalToast(error?.response?.data?.message || 'Failed to send OTP', 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return;
        const handlePostLoginNavigation = (authData: any) => {
            // Builder always goes to onboarding page
            if (authData?.user_type === 'builder') {
                navigate('/builder/onboarding', { replace: true });
                return;
            }
            // Existing flow for other user types
            if (!authData?.has_active_subscription) {
                navigate('/v3/plan', { replace: true });
                return;
            }
            if (authData?.user_type === 'agent') {
                navigate('/agent/profile', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        };
        try {
            setOtpLoading(true);
            
            // For professional signup, use signup data
            if (isProfessionalSignup && signupData) {
                const verifyPayload: any = {
                    user_type: signupData.userType,
                    otp: otpValue,
                    country_code: signupData.countryCode,
                    mobile_number: signupData.mobile,
                };
                
                // Add agent_registration flag for agent signup
                if (signupData.userType === 'agent') {
                    verifyPayload.agent_registration = true;
                }
                
                const verifyResponse = await api.post('/common/otp/validate/', verifyPayload);
                
                if (verifyResponse.data?.status_code === 200) {
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
                            localStorage.setItem('has_active_subscription', JSON.stringify(!!authData.has_active_subscription));
                            // Store agent_registration if present (for agent signup)
                            if (verifyResponse.data?.agent_registration !== undefined) {
                                localStorage.setItem('agent_registration', JSON.stringify(verifyResponse.data.agent_registration));
                            }
                        } catch {
                            // no-op
                        }
                    }
                    showGlobalToast('Account verified successfully!', 3000);
                    onClose();
                    handlePostLoginNavigation(authData);
                } else {
                    showGlobalToast(verifyResponse.data?.message || 'Invalid OTP', 3000);
                }
            } else {
                // For login flow
                const verifyResponse = await api.post('/common/otp/validate/', {
                    user_type: isProfessional && professionalType ? professionalType : 'buyer',
                    otp: otpValue,
                    country_code: getCurrentPhoneCode(),
                    mobile_number: mobile,
                    flag: 'login',
                });
                if (verifyResponse.data?.status_code === 200 && verifyResponse.data?.status) {
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
                            localStorage.setItem('has_active_subscription', JSON.stringify(!!authData.has_active_subscription));
                        } catch {
                            // no-op
                        }
                    }
                    showGlobalToast('Login successful', 3000);
                    onClose();
                    handlePostLoginNavigation(authData);
                } else {
                    showGlobalToast(verifyResponse.data?.message || 'Invalid OTP', 3000);
                }
            }
        } catch (error: any) {
            showGlobalToast(error?.response?.data?.message || 'Failed to verify OTP', 4000);
        } finally {
            setOtpLoading(false);
        }
    };

    // Reset license verification when value changes
    useEffect(() => {
        setLicenseVerified(false);
        if (licenseError) {
            setLicenseError(null);
        }
    }, [agentLicense]);

    const handleVerifyLicense = async () => {
        if (!agentLicense.trim()) return;

        setLicenseVerifyLoading(true);
        setLicenseError(null);
        try {
            const response = await api.post('/common/mls/verify/', {
                mls_agent_id: agentLicense.trim(),
            });

            if (response.data?.status_code === 200) {
                setLicenseVerified(true);
                setLicenseError(null);
                showGlobalToast('License ID verified successfully', 3000);
            } else if (response.data?.status_code === 400) {
                const errorMessage = response.data?.message || 'Invalid License ID';
                setLicenseError(errorMessage);
                setLicenseVerified(false);
            } else {
                const errorMessage = response.data?.message || 'License ID verification failed';
                setLicenseError(errorMessage);
                setLicenseVerified(false);
            }
        } catch (error: any) {
            const status = error?.response?.status;
            const errorMessage =
                status === 400
                    ? error?.response?.data?.message || 'Invalid License ID'
                    : error?.response?.data?.message || 'License ID verification failed';
            setLicenseError(errorMessage);
            setLicenseVerified(false);
        } finally {
            setLicenseVerifyLoading(false);
        }
    };

    if (showOtp) {
        return (
            <div className="bg-white rounded-lg shadow-lg px-8 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto" style={{ minWidth: 480 }}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    aria-label="Close"
                    type="button"
                >
                    <span className="text-2xl">&times;</span>
                </button>

                <h2 className="text-lg font-bold text-left mb-4 whitespace-nowrap">OTP has been sent to your Mobile no.</h2>
                
                <div className="text-left mb-4">
                    <span className="text-[#16634a] font-semibold text-sm">
                        {signupData ? `${signupData.countryCode} ${signupData.mobile.slice(0, 3)} XXXXXXXXXX` : `${getCurrentPhoneCode()} ${mobile.slice(0, 3)} XXXXXXXXXX`}
                    </span>
                    <button 
                        type="button"
                        onClick={() => {
                            setShowOtp(false);
                            setSignupData(null);
                        }}
                        className="ml-2 text-[#15803d] underline text-xs bg-transparent border-none p-0 m-0 cursor-pointer"
                    >
                        Change mobile number
                    </button>
                </div>

                <div className="text-left mb-4">
                    <label className="block font-semibold mb-2 text-left text-sm">ENTER ONE TIME PASSWORD</label>
                </div>

                <form onSubmit={handleOtpSubmit}>
                    <div className="flex justify-start gap-2 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className="w-14 h-14 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16634a] focus:border-transparent"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg text-white font-semibold text-sm shadow mb-4"
                        style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                    >
                        {otpLoading ? 'Verifying...' : 'Submit'}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timer > 0 || loading}
                        className="text-[#15803d] underline text-sm bg-transparent border-none p-0 m-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Resend'}
                    </button>
                    {timer > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                            00:{timer.toString().padStart(2, '0')}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg px-8 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto" style={{ minWidth: 480 }}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                aria-label="Close"
                type="button"
            >
                <span className="text-2xl">&times;</span>
            </button>

            <h2
                className={`text-[24px] md:text-[26px] font-bold text-emerald-900 text-left mb-2 ${
                    isProfessionalSignup ? 'whitespace-nowrap' : ''
                }`}
            >
                {isProfessional
                    ? isProfessionalSignup
                        ? 'Sign up for an Account'
                        : 'Hello, Login as professional'
                    : 'Login'}
            </h2>
            <p className="text-left text-gray-600 mb-2 text-sm">
                {isProfessional
                    ? 'Connect at ease with Vistaview as a seller'
                    : 'Save your favourite properties and explore more on the properties'}
            </p>
            <p className="text-left text-xs text-gray-500 mb-6">
                {isProfessional
                    ? isProfessionalSignup
                        ? 'Already have an account ? '
                        : 'Don’t have an account ? '
                    : 'New to the site? '}
                {onSwitchToSignup ? (
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="font-semibold text-[#16634a] hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
                    >
                        {isProfessional
                            ? isProfessionalSignup
                                ? 'Login as professional'
                                : 'Create a new account'
                            : 'Sign up for an account'}
                    </button>
                ) : null}
            </p>

            <div className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                SIGN IN WITH MOBILE NUMBER
            </div>

            <form onSubmit={handleSubmit}>
                {isProfessional && (
                    <div className="mb-4">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowProfessionalDropdown((open) => !open)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                            >
                                <span className={professionalType ? '' : 'text-gray-400'}>
                                    {professionalType
                                        ? professionalTypes.find((t) => t.user_type === professionalType)?.user_type_name ||
                                          'Select your professional type'
                                        : 'Select your professional type'}
                                </span>
                                <span className="ml-2 text-gray-400 text-xs">▼</span>
                            </button>

                            {showProfessionalDropdown && (
                                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                                    {professionalTypes.length > 0 ? (
                                        professionalTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => {
                                                    setProfessionalType(type.user_type);
                                                    setShowProfessionalDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#f3fdfa]"
                                            >
                                                {type.user_type_name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                            No professional types available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isProfessionalSignup &&
                    professionalType &&
                    professionalType !== 'agent' && (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={professionalName}
                                onChange={(e) => setProfessionalName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                            />
                        </div>
                    )}

                <div className="mb-4">
                    <div className="flex items-stretch gap-2">
                        <div
                            ref={countryTriggerRef}
                            className="relative flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white cursor-pointer select-none"
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
                            pattern="[0-9]*"
                            placeholder="Mobile Number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#16634a]"
                        />
                    </div>
                </div>

                {isProfessionalSignup && professionalType === 'agent' && (
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter your License ID (Optional)"
                                value={agentLicense}
                                onChange={(e) => setAgentLicense(e.target.value)}
                                className={`w-full border rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#16634a] ${
                                    licenseError ? 'border-red-500' : 'border-gray-300'
                                } ${agentLicense.trim() ? 'pr-24' : ''}`}
                            />
                            {agentLicense.trim() && (
                                <>
                                    {licenseVerified ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center"
                                            style={{
                                                background:
                                                    'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                                            }}
                                        >
                                            <Check
                                                size={12}
                                                strokeWidth={2}
                                                style={{ stroke: 'rgba(0, 66, 54, 1)' }}
                                            />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleVerifyLicense}
                                            disabled={licenseVerifyLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-md text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                background:
                                                    'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                                            }}
                                        >
                                            {licenseVerifyLoading ? 'Verifying...' : 'Verify'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        {licenseError && (
                            <p className="mt-1 text-xs text-red-500">{licenseError}</p>
                        )}
                    </div>
                )}

                {isProfessionalSignup ? (
                    <label className="flex items-start gap-2 text-sm text-gray-700 mb-6">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                        />
                        <span>
                            By creating an account you agree to our{' '}
                            <a className="text-emerald-800 underline" href="#">Terms of use</a> and{' '}
                            <a className="text-emerald-800 underline" href="#">Privacy Policy</a>
                        </span>
                    </label>
                ) : (
                    <label className="flex items-center text-sm text-gray-600 mb-6">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-[#16634a] border-gray-300 rounded focus:ring-[#16634a]"
                            checked={keepSignedIn}
                            onChange={(e) => setKeepSignedIn(e.target.checked)}
                        />
                        <span className="ml-2">Keep Me Signed In</span>
                    </label>
                )}

                <button
                    type="submit"
                    className="w-full py-2 rounded-lg text-white font-semibold text-sm shadow"
                    style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                    disabled={loading}
                >
                    {loading ? (isProfessionalSignup ? 'Creating account...' : 'Sending...') : (isProfessionalSignup ? 'Create account' : 'Sign in')}
                </button>
            </form>
        </div>
    );
};

export default WebMobileLogin;


