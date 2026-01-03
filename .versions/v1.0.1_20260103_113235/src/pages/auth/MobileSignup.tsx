import React, { useState, useEffect } from 'react';
import { useSignupForm } from './useSignupForm';
import WebOTPVerify from './WebOTPVerify';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook, FaChevronLeft } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import ButtonLoader from '../../components/ButtonLoader';

const MobileSignup: React.FC = () => {
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
    } = useSignupForm();
    const [showOtp, setShowOtp] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
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
        const result = await onSubmit(data, () => navigate('/otp-verify'));
        if (!result.success) {
            // Form submission failed, don't navigate to OTP
            setLoading(false);
            return;
        }
        setLoading(false);
    };

    return (
        <>
            <div className="min-h-screen bg-white flex flex-col p-4">
                <div className="flex items-center mb-8">
                    <Link to="/" className="text-gray-600">
                        <FaChevronLeft size={20} />
                    </Link>
                </div>
                
                <div className="w-full">
                    <h2 className="text-2xl font-bold mb-2">{t('signup.account_title')}</h2>
                    <p className="text-gray-600 mb-4">{t('signup.save_favorite')}</p>
                    <p className="text-sm text-gray-600 mb-8">
                        {t('signup.already_account')} <button onClick={() => navigate('/login')} className="text-primary-color font-semibold hover:underline">{t('auth.signIn')}</button>
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                    {t('signup.agent_prompt')}  <Link to="/agent-signup" className="font-semibold text-primary-color hover:underline">{t('signup.agent_signup')}</Link>
                    
                    </p>

                    <div className="mb-6">
                        <hr className="w-full border-gray-300" />
                        <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('signup.with_email')}</p>
                    </div>
                        

                    {!showOtp ? (
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
                            <div className="mb-4">
                                <div className={`gradient-border-bg${focused.name ? ' focused' : ''}${errors.name ? ' error' : ''}`}> 
                                    <input
                                        {...register('name')}
                                        id="name"
                                        type="text"
                                        placeholder={t('signup.name_placeholder')}
                                        className={`input-inside-bg w-full${errors.name ? ' error' : ''}`}
                                        onFocus={() => setFieldFocused('name', true)}
                                        onBlur={() => setFieldFocused('name', false)}
                                    />
                                </div>
                                {errors.name && <p className="validation-error">{errors.name.message}</p>}
                            </div>
                            <div className="mb-4">
                                <div className={`gradient-border-bg${focused.email ? ' focused' : ''}${errors.email || emailError ? ' error' : ''}`}> 
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        placeholder={t('signup.email_placeholder')}
                                        className={`input-inside-bg w-full${errors.email || emailError ? ' error' : ''}`}
                                        onFocus={() => setFieldFocused('email', true)}
                                        onBlur={async (e) => {
                                            setFieldFocused('email', false);
                                            // Check email availability when user leaves the field
                                            if (e.target.value) {
                                                console.log('Checking email availability for:', e.target.value);
                                                const emailExists = await checkEmailAvailability(e.target.value);
                                                console.log('Email exists:', emailExists);
                                                if (emailExists) {
                                                    setEmailError('Email ID already taken');
                                                    console.log('Setting email error');
                                                } else {
                                                    setEmailError('');
                                                    console.log('Clearing email error');
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
                                        className={`input-inside-bg w-full${errors.mobile ? ' error' : ''}`}
                                        onFocus={() => setFieldFocused('mobile', true)}
                                        onBlur={() => setFieldFocused('mobile', false)}
                                    />
                                </div>
                                {errors.mobile && <p className="validation-error">{errors.mobile.message}</p>}
                            </div>
                            <div className="mb-4">
                                <div className={`gradient-border-bg${focused.password ? ' focused' : ''}${errors.password ? ' error' : ''}`}> 
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type="password"
                                        placeholder={t('signup.password_placeholder')}
                                        className={`input-inside-bg w-full${errors.password ? ' error' : ''}`}
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
                                        className={`input-inside-bg w-full${errors.confirmPassword ? ' error' : ''}`}
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
                            <button type="submit" className="form-submit-button w-full" disabled={loading}>
                                {loading ? "Creating..." : t('signup.create_account_button')}
                            </button>
                        </form>
                    ) : (
                        <WebOTPVerify onOtpClose={() => setShowOtp(false)} onSwitchToSignup={() => {}} />
                    )}
                </div>
            </div>
        </>
    );
};

export default MobileSignup; 