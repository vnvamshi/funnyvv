import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Mail, Lock } from 'lucide-react';
import { LoginFormValues } from './loginSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { AxiosError } from 'axios';
import { ToastContext } from '../../App';
import { showGlobalToast } from '../../utils/toast';
import { loginLogics } from './loginLogics';
import ButtonLoader from '../../components/ButtonLoader';
import BottomModal from '../../components/BottomModal';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg>
);
const AppleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19.3,12.21a4.2,4.2,0,0,0-1.25-2.91A4,4,0,0,0,14.65,8.2a4.32,4.32,0,0,0-3.41,1.46,4.3,4.3,0,0,0-3.32-1.46,4.2,4.2,0,0,0-3.4,2.94C2.36,15.54,4.71,22,8,22a3.32,3.32,0,0,0,2.62-1.24A3.47,3.47,0,0,0,13.25,22,5.2,5.2,0,0,0,16.5,18,4.72,4.72,0,0,0,19.3,12.21Zm-7.79-5.32a3.78,3.78,0,0,1,2.83,1.35,3.48,3.48,0,0,1,1.09,2.44,3.79,3.79,0,0,1-2.91,1.3,3.52,3.52,0,0,1-1.07-2.45A3.66,3.66,0,0,1,11.51,6.89Z"/></svg>
);
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M22,12C22,6.48,17.52,2,12,2S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-2c-0.5,0-1,0.5-1,1v2h3v3h-3v6.95C18.05,21.45,22,17.2,22,12Z"/></svg>
);


const MobileLayout = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { 
      email, setEmail, 
      password, setPassword, 
      emailFocused, setEmailFocused, 
      passwordFocused, setPasswordFocused, 
      errors, setErrors, 
      keepSignedIn, setKeepSignedIn, 
      handleLogin 
    } = loginLogics();
    const { showToast } = useContext(ToastContext);
    const [loading, setLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      setLoading(true);
      try {
        // Don't pass onClose parameter to let the loginLogics handle redirection
        await handleLogin(e, undefined, undefined);
      } finally {
        setLoading(false);
      }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
            <div className="flex-shrink-0">
                <button onClick={() => navigate(-1)} className="text-gray-600 mb-4">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold mb-2">{t('auth.loginTitle')}</h1>
                <p className="text-gray-600 mb-4">{t('auth.loginSubtitle')}</p>
                <p className="text-sm text-gray-500 mb-6">
                    {t('auth.dontHaveAccount')} <Link to="/signup" className="font-semibold text-primary-color hover:underline">{t('auth.signUp')}</Link>
                </p>
               
            </div>
            <div className="flex-grow">
                <div className="mb-6">
                    <hr className="w-full border-gray-300" />
                    <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('auth.signInWithEmail')}</p>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <div className={`gradient-border-bg${emailFocused ? ' focused' : ''}${errors.email ? ' error' : ''}`}>
                            <input
                                type="email"
                                placeholder={t('auth.emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`input-inside-bg${errors.email ? ' error' : ''}`}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                            />
                        </div>
                        {errors.email && <p className="validation-error">{errors.email}</p>}
                    </div>
                    <div className="mb-6">
                        <div className={`gradient-border-bg${passwordFocused ? ' focused' : ''}${errors.password ? ' error' : ''}`}>
                            <input
                                type="password"
                                placeholder={t('auth.passwordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`input-inside-bg${errors.password ? ' error' : ''}`}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                        </div>
                        {errors.password && <p className="validation-error">{errors.password}</p>}
                        <div className="text-right mt-2">
                          <button type="button" className="text-primary-color text-sm hover:underline bg-transparent border-none p-0 m-0 cursor-pointer" onClick={() => setShowForgotModal(true)}>
                            {t('auth.forgotPassword')}
                          </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <label className="flex items-center text-sm text-gray-600">
                            <input type="checkbox" className="h-4 w-4 text-primary-color border-gray-300 rounded focus:ring-green-500" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} />
                            <span className="ml-2">{t('auth.keepMeSignedIn')}</span>
                        </label>
                        {/* {errors.general && <p className="validation-error mt-2">{errors.general}</p>} */}
                    </div>
                    <button type="submit" className="form-submit-button" disabled={loading}>
                        {loading ? "Signing in..." : t('auth.signIn')}
                    </button>
                </form>
                {/* Forgot Password Modal */}
                <BottomModal open={showForgotModal} onCancel={() => setShowForgotModal(false)} title="Forgot Password">
                  <div className="mb-4">
                    <label htmlFor="forgot-email-mobile" className="block text-sm font-medium text-gray-700 mb-2">Enter your email address</label>
                    <input
                      id="forgot-email-mobile"
                      type="email"
                      value={forgotEmail}
                      onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Email address"
                    />
                    {forgotError && <div className="text-xs text-red-500 mt-1">{forgotError}</div>}
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full py-3 rounded-lg text-white font-semibold text-base shadow gradient-btn-equal"
                      style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                      disabled={forgotLoading}
                      onClick={async () => {
                        if (!forgotEmail) { setForgotError('Email is required'); return; }
                        if (!/^\S+@\S+\.\S+$/.test(forgotEmail)) { setForgotError('Invalid email address'); return; }
                        setForgotError('');
                        setForgotLoading(true);
                        try {
                          const res = await api.post('/common/forgot-password/', { email: forgotEmail });
                          setShowForgotModal(false);
                          const msg = res?.data?.message || 'If this email exists, you will receive a password reset link.';
                          showGlobalToast(msg, 4000);
                        } catch (err: any) {
                          setForgotError(err?.response?.data?.message || 'Failed to send reset link. Please try again.');
                        } finally {
                          setForgotLoading(false);
                        }
                      }}
                    >
                      {forgotLoading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </BottomModal>
            </div>
        </div>
    );
};

export default MobileLayout; 