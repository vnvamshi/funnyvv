import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa6';
import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import WebOTPVerify from './WebOTPVerify';
import { useAgentSignupForm } from './useAgentSignupForm';
import { useDispatch } from 'react-redux';
import { setSignupData } from '../../store/signupSlice';
import ButtonLoader from '../../components/ButtonLoader';
import { Select, MenuItem } from '@mui/material';

interface WebAgentSignupProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
    onSwitchToBuyerSignUp: () => void;
}

const WebAgentSignup = ({ onClose, onSwitchToLogin, onSwitchToBuyerSignUp }: WebAgentSignupProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
      focused,
      setFieldFocused,
      onSubmit,
      emailError,
      setEmailError,
      checkEmailAvailability
    } = useAgentSignupForm();

    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);      

    // Watch email field value to clear errors when it changes
    const emailValue = watch('email');
    const [prevEmailValue, setPrevEmailValue] = useState('');
    
    useEffect(() => {
        // Only clear error if the user is actively typing (value changed)
        if (emailError && emailValue && emailValue !== prevEmailValue) {
            setEmailError('');
        }
        setPrevEmailValue(emailValue);
    }, [emailValue, emailError, prevEmailValue]);
    
    const handleFormSubmit = async (data: any) => {
      setLoading(true);
      const result = await onSubmit(data, () => setShowOtp(true));
      if (!result.success) {
        // Form submission failed, don't show OTP
        setLoading(false);
        return;
      }
      setLoading(false);
    };

    return (
        <>
        {/* Signup Modal */}
        {!showOtp && (
          <div className="bg-white rounded-lg shadow-lg px-20 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
               style={{ minWidth: 606, boxSizing: 'border-box' }}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
                <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2">{t('signup.account_title')}</h2>
            <p className="text-gray-600 mb-4">{t('signup.save_favorite')}</p>
            <p className="text-sm text-gray-600 mb-4">
                {t('signup.already_account')} <button onClick={onSwitchToLogin} className="text-primary-color hover:underline">{t('auth.signIn')}</button>
            </p>
            <p className="text-sm text-gray-600 mb-4">
                Are you buyer ? <button onClick={onSwitchToBuyerSignUp} className="text-primary-color hover:underline">Sign Up as Buyer</button>
            </p>
            <div className="mb-6">
                <hr className="w-full border-gray-300" />
                <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('signup.with_email')}</p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="mb-4">
                    <div className={`gradient-border-bg${focused.name ? ' focused' : ''}${errors.name ? ' error' : ''}`}> 
                        <input
                            {...register('name')}
                            id="name"
                            type="text"
                            placeholder={t('signup.name_placeholder')}
                            className={`input-inside-bg w-[380px] h-[44px]${errors.name ? ' error' : ''}`}
                            style={{ height: 44, padding: '0 12px', fontSize: 15, borderRadius: 8 }}
                            onFocus={() => setFieldFocused('name', true)}
                            onBlur={() => setFieldFocused('name', false)}
                        />
                    </div>
                    {errors.name && <p className="validation-error">{errors.name.message}</p>}
                </div>
                {/* Business Type Select */}
                <div className="mb-4">
                    <div className={`gradient-border-bg${focused.businessType ? ' focused' : ''}${errors.businessType ? ' error' : ''}`}> 
                        <select
                            {...register('businessType')}
                            id="businessType"
                            className={`input-inside-bg w-[380px]${errors.businessType ? ' error' : ''}`}
                            defaultValue=""
                            onFocus={() => setFieldFocused('businessType', true)}
                            onBlur={() => setFieldFocused('businessType', false)}
                        >
                            <option value="" disabled>Select business type</option>
                            <option value="buy">Buy</option>
                            <option value="rent">Rent</option>
                        </select>
                    </div>
                    {errors.businessType && <p className="validation-error">{errors.businessType.message}</p>}
                </div>
                <div className="mb-4">
                    <div className={`gradient-border-bg${focused.email ? ' focused' : ''}${errors.email || emailError ? ' error' : ''}`}> 
                        <input
                            {...register('email')}
                            id="email"
                            type="email"
                            placeholder={t('signup.email_placeholder')}
                            className={`input-inside-bg w-[380px]${errors.email || emailError ? ' error' : ''}`}
                            onFocus={() => setFieldFocused('email', true)}
                            onBlur={async (e) => {
                                setFieldFocused('email', false);
                                // Check email availability when user leaves the field
                                if (e.target.value) {
                                    const emailExists = await checkEmailAvailability(e.target.value);
                                    if (emailExists) {
                                        setEmailError('Email ID already taken');
                                    } else {
                                        setEmailError('');
                                    }
                                }
                            }}
                        />
                    </div>
                    {errors.email && <p className="validation-error">{errors.email.message}</p>}
                    {emailError && <p className="validation-error">{emailError}</p>}
                </div>
                <div className="mb-4">
                    <div className={`gradient-border-bg${focused.mobile ? ' focused' : ''}${errors.mobile ? ' error' : ''}`}> 
                        <input
                            {...register('mobile')}
                            id="mobile"
                            type="text"
                            placeholder={t('signup.mobile_placeholder')}
                            className={`input-inside-bg w-[380px]${errors.mobile ? ' error' : ''}`}
                            onFocus={() => setFieldFocused('mobile', true)}
                            onBlur={() => setFieldFocused('mobile', false)}
                        />
                    </div>
                    {errors.mobile && <p className="validation-error">{errors.mobile.message}</p>}
                </div>
                {/* MLS Agent ID */}
                <div className="mb-4">
                    <div className={`gradient-border-bg${focused.mlsAgentId ? ' focused' : ''}${errors.mlsAgentId ? ' error' : ''}`}> 
                        <input
                            {...register('mlsAgentId')}
                            id="mlsAgentId"
                            type="text"
                            placeholder="MLS Agent ID"
                            className={`input-inside-bg w-[380px]${errors.mlsAgentId ? ' error' : ''}`}
                            onFocus={() => setFieldFocused('mlsAgentId', true)}
                            onBlur={() => setFieldFocused('mlsAgentId', false)}
                        />
                    </div>
                    {errors.mlsAgentId && <p className="validation-error">{errors.mlsAgentId.message}</p>}
                </div>
                <div className="mb-4">
                    <div className={`gradient-border-bg${focused.password ? ' focused' : ''}${errors.password ? ' error' : ''}`}> 
                        <input
                            {...register('password')}
                            id="password"
                            type="password"
                            placeholder={t('signup.password_placeholder')}
                            className={`input-inside-bg w-[380px]${errors.password ? ' error' : ''}`}
                            onFocus={() => setFieldFocused('password', true)}
                            onBlur={() => setFieldFocused('password', false)}
                        />
                    </div>
                    {errors.password && <p className="validation-error">{errors.password.message}</p>}
                </div>
                <div className="mb-6">
                    <div className={`gradient-border-bg${focused.confirmPassword ? ' focused' : ''}${errors.confirmPassword ? ' error' : ''}`}> 
                        <input
                            {...register('confirmPassword')}
                            id="confirmPassword"
                            type="password"
                            placeholder={t('signup.confirm_password_placeholder')}
                            className={`input-inside-bg w-[380px]${errors.confirmPassword ? ' error' : ''}`}
                            onFocus={() => setFieldFocused('confirmPassword', true)}
                            onBlur={() => setFieldFocused('confirmPassword', false)}
                        />
                    </div>
                    {errors.confirmPassword && <p className="validation-error">{errors.confirmPassword.message}</p>}
                </div>
                <div className="flex items-center mb-6">
                    <input {...register('terms')} id="terms" type="checkbox" className="h-4 w-4 text-primary-color focus:ring-teal-500 border-gray-300 rounded" />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                        {t('signup.terms_agreement')} <a href="#" className="text-primary-color hover:underline">{t('signup.terms_of_use')}</a> {t('signup.and')} <a href="#" className="text-primary-color hover:underline">{t('signup.privacy_policy')}</a>
                    </label>
                </div>
                {errors.terms && <p className="validation-error">{errors.terms.message}</p>}
                <button type="submit" className="form-submit-button w-[380px]" disabled={loading}>
                    {loading ? 'Creating...' : t('signup.create_account_button')}
                </button>
            </form>
          </div>
        )}
        {/* OTP Modal */}
        {showOtp && (
            <WebOTPVerify
              onOtpClose={() => {setShowOtp(false); onClose()}}
              onSwitchToSignup={() => {}}
            />
        )}
        </>
    );
};

export default WebAgentSignup;   