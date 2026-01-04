import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { LoginFormValues } from './loginSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { AxiosError } from 'axios';
import { ToastContext } from '../../App';
import { showGlobalToast } from '../../utils/toast';
import { loginLogics } from './loginLogics';
import ButtonLoader from '../../components/ButtonLoader';
import WebOTPVerify from './WebOTPVerify';
import Modal from '../../components/BottomModal';

interface WebLayoutProps {
    onSwitchToSignup?: () => void;
    onClose: () => void;
    onLoginSuccess?: () => void;
}

const WebLayout = ({ onClose, onSwitchToSignup, onLoginSuccess }: WebLayoutProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAuth();
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
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

    // Wrap handleLogin to set loading state
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await handleLogin(e, () => {
          onClose();
          if (typeof onLoginSuccess === 'function') onLoginSuccess();
        }, () => setShowOtp(true));
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        {!showOtp ? (
          <div className="bg-white rounded-lg shadow-lg px-20 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto" style={{ minWidth: 606 }}>
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
                <X size={24} />
            </button>
            <h2 className="text-3xl font-bold text-left mb-2">{t('auth.loginTitle')}</h2>
            <p className="text-left text-gray-600 mb-4">{t('auth.loginSubtitle')}</p>
            <p className="text-left text-sm text-gray-500 mb-6">
                {t('auth.newToSite')} {onSwitchToSignup ? (
                    <button onClick={onSwitchToSignup} className="font-semibold text-primary-color hover:underline bg-transparent border-none p-0 m-0 cursor-pointer">
                        {t('auth.signUpForAccount')}
                    </button>
                ) : (
                    <Link to="/signup" className="font-semibold text-primary-color hover:underline">{t('auth.signUpForAccount')}</Link>
                )}
            </p>
            <div className="my-4 mt-8">
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
            {showForgotModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg px-8 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto" style={{ minWidth: 400 }}>
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
                  <div className="mb-4">
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">Enter your email address</label>
                    <input
                      id="forgot-email"
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
                </div>
              </div>
            )}
          </div>
        ) : (
          <WebOTPVerify onOtpClose={() => setShowOtp(false)} onSwitchToSignup={ () => {setShowOtp(false); onClose()}} />
        )}
      </>
    );
};

export default WebLayout; 