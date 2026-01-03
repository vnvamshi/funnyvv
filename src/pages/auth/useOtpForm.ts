import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { otpValidationSchema } from './OtpValidationSchema';
import api from '../../utils/api';
import { useContext } from 'react';
import { ToastContext } from '../../App';
import { showGlobalToast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSignupData } from '../../store/signupSlice';
import { CryptoStorage } from '../../utils/storage';
import Cookies from 'js-cookie';
import { useAuth } from '../../contexts/AuthContext';

export interface OtpFormValues {
  otp: string;
}

export function useOtpForm() {
  const { showToast } = useContext(ToastContext);   
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signupData = JSON.parse(localStorage.getItem('signupData') || '{}');
  let originalSignupEmail = localStorage.getItem('originalSignupEmail');
  if (!originalSignupEmail && signupData.email) {
    // Set only if not already set
    localStorage.setItem('originalSignupEmail', signupData.email);
    originalSignupEmail = signupData.email;
  }
  const dispatch = useDispatch();
 
  const { setIsLoggedIn, setUser } = useAuth();

  const showToastMessage = (message: string, duration?: number) => {
      if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
      } else {
      showGlobalToast(message, duration);
      }
  };
  const form = useForm<OtpFormValues>({
    resolver: yupResolver(otpValidationSchema),
    defaultValues: { otp: '' },
  });

  // Derived navigation after OTP success based on subscription & user type
  const navigateAfterAuth = (userData: any) => {
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

  // API call for OTP verification
  const onSubmitOtp = async (otp: string, email: string) => {
    try {
      const response = await api.post('/common/otp/validate/', { 
        otp,
        email,
        old_email: originalSignupEmail // Always send the original signup email
      });

      const statusOk = response?.data?.status_code === 200 && response?.data?.status;
      const userData = response?.data?.data;

      if (statusOk && userData) {
        showToastMessage(t('auth.otpVerified'), 3000);

        // Persist updated email if user changed it mid-flow
        if (email && signupData?.email && email !== signupData.email) {
          const updatedSignupData = { ...signupData, email };
          localStorage.setItem('signupData', JSON.stringify(updatedSignupData));
        }

        // Store auth payload for downstream usage
        CryptoStorage.add('authentication', userData);
        setUser(userData);
        setIsLoggedIn(true);

        // Cleanup any signup/session artifacts
        localStorage.removeItem('signupData');
        localStorage.removeItem('selectedPlan');
        localStorage.removeItem('originalSignupEmail');

        navigateAfterAuth(userData);
        return { success: true, data: response.data };
      }

      showToastMessage(response?.data?.message || 'Invalid OTP', 3000);
      return { success: false, error: response?.data };
    } catch (error: any) {
      showToastMessage(error?.response?.data?.message || 'Failed to verify OTP', 3000);
      return { success: false, error: error?.response?.data || error?.message };
    }
  };

  return {
    ...form,
    onSubmitOtp,
  };
} 