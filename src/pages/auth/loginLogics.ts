import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLoginSchema, LoginFormValues } from './loginSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { ToastContext } from '../../App';
import Cookies from 'js-cookie'; // Consider installing @types/js-cookie for TypeScript support
import { encryptData } from '../../utils/crypto-helpers';
import { CryptoStorage } from '../../utils/storage';
import { showGlobalToast } from '../../utils/toast';



export function loginLogics() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setIsLoggedIn, setUser } = useAuth();
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const { showToast } = useContext(ToastContext);
  
  // Fallback to global toast if context is not available
  const showToastMessage = (message: string, duration?: number) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
    } else {
      showGlobalToast(message, duration);
    }
  };

  const validateField = async (field: keyof LoginFormValues, value: string) => {
    try {
      await getLoginSchema(t).validateAt(field, { [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof Error && 'path' in err) {
        setErrors(prev => ({ ...prev, [(err as any).path as keyof LoginFormValues]: err.message }));
      }
    }
  };

  const setEmail = (value: string) => {
    setEmailState(value);
    validateField('email', value);
  };

  const setPassword = (value: string) => {
    setPasswordState(value);
    validateField('password', value);
  };

  const handleLogin = async (e?: React.FormEvent, onClose?: () => void, handleSwitchToOtp?: () => void, redirectTo?: string) => {
    
    if (e) e.preventDefault();
    try {
      await getLoginSchema(t).validate({ email, password }, { abortEarly: false });
      setErrors({});
      console.log(email, password, "email, password");
      // Call login API
      const response = await api.post('/common/login/', {
        email,
        password,
      });
      console.log(response, "response");
      if (response.data && response.data.status_code === 200) {
        localStorage.removeItem('signupData');
        localStorage.removeItem('selectedPlan');
        localStorage.removeItem('originalSignupEmail');
        if(response?.data?.data?.is_email_verified === false){
          showToastMessage(response?.data?.message, 3000);
          if (handleSwitchToOtp) handleSwitchToOtp();
          localStorage.setItem('signupData', JSON.stringify({email: email, password: password}));
        } else {
          CryptoStorage.add("authentication", response?.data?.data);
          setUser(response?.data?.data);
            // Store tokens and username securely (localStorage for now)
            if (keepSignedIn) {
              let cookieExpires = import.meta.env.VITE_COOKIES_EXPIRES || 7;
              // Set cookies if "Remember Me" is checked
              Cookies.set('username', encryptData(email), { expires: Number(cookieExpires), SameSite: 'None', secure: true }); // Set expiration in days
              Cookies.set('userKey', encryptData(password), { expires: Number(cookieExpires), SameSite: 'None', secure: true });
          } else {
            Cookies.remove('username');
            Cookies.remove('userKey');
          }
          setIsLoggedIn(true);
          setErrors({});
          showToastMessage(t('auth.loginSuccess'), 3000);
          const userData = response?.data?.data;
          const redirectBasedOnUser = () => {
            if (!userData?.has_active_subscription) {
              navigate('/plan', { replace: true });
              return;
            }
            if (userData?.user_type === 'agent') {
              navigate('/agent/profile', { replace: true });
            } else if (userData?.user_type === 'builder') {
              navigate('/builder/onboarding', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          };

          if (onClose) {
            onClose(); // Modal closes, stay on same page
          } else {
            redirectBasedOnUser();
          }
        }
        
        return true;
      } else {
        setErrors({ general: t('auth.loginFailed') });
        showToastMessage(t('auth.loginFailedasd'), 4000);
        return false;
      }
    } catch (err: any) {
      console.log(err, "err");
      if (err instanceof Error && 'inner' in err) {
        const newErrors: { [key: string]: string } = {};
        // @ts-ignore
        err.inner.forEach((error: any) => {
          if (error.path) {
            newErrors[error.path] = error.message;
          }
        });
        setErrors(newErrors);
      } else if (err?.response && err.response?.data && err.response.data.message) {
        setErrors({ general: err.response.data.message });
        showToastMessage(err.response.data.message, 4000);
      } else {
        setErrors({ general: t('auth.loginFailed') });
        showToastMessage(t('auth.loginFailedasd1'), 4000);
      }
      return false;
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    emailFocused,
    setEmailFocused,
    passwordFocused,
    setPasswordFocused,
    errors,
    setErrors,
    keepSignedIn,
    setKeepSignedIn,
    handleLogin,
  };
} 