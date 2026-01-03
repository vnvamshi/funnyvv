import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getAgentSignupValidationSchema } from './AgentSignupvalidationSchema';
import api from '../../utils/api';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showGlobalToast } from '../../utils/toast';
import { ToastContext } from '../../App';

export interface AgentSignupFormValues {
  name: string;
  businessType: string;
  mlsAgentId: string;
  email: string;
  mobile: string | null | undefined;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export function useAgentSignupForm() {
  const { t } = useTranslation();
  const form = useForm<AgentSignupFormValues>({
    resolver: yupResolver(getAgentSignupValidationSchema(t)) as any,
  });

  const { showToast } = useContext(ToastContext);

  const showToastMessage = (message: string, duration?: number) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
    } else {
      showGlobalToast(message, duration);
    }
  };

  // Email validation state
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [focused, setFocused] = useState({
    name: false,
    businessType: false,
    mlsAgentId: false,
    email: false,
    mobile: false,
    password: false,
    confirmPassword: false,
  });

  const setFieldFocused = (field: keyof typeof focused, value: boolean) => {
    setFocused((prev) => ({ ...prev, [field]: value }));
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

  const sendOtp = async (data: any) => {
    try {
      const response = await api.post('/common/otp/send/', { email: data.email, name: data.name });
      if(response.data.status_code === 200){
        showToastMessage(t('auth.otpSent'), 3000);
      }else{
        showToastMessage(response.data.message, 3000);
      }
    } catch (error: any) {
      showToastMessage(error.response?.data?.message, 4000);
    }
  };

  const onSubmit = async (
    data: AgentSignupFormValues,
    onSuccess: (data: AgentSignupFormValues) => void,
    onError?: (error: any) => void
  ) => {
    try {
      // Check email availability before signup
      const emailExists = await checkEmailAvailability(data.email);
      if (emailExists) {
        setEmailError('Email ID already taken');
        setIsEmailValid(false);
        if (onError) onError('Email ID already taken');
        return { success: false, error: 'Email ID already taken' };
      }

      const response = await api.post('/common/agent/signup/', {
        name: data.name,
        business_type: data.businessType,
        mls_agent_id: data.mlsAgentId,
        email: data.email,
        password: data.password,
        mobile: data.mobile,
        confirm_password: data.confirmPassword,
      });
      if (response.data.status_code === 200) {
        showToastMessage(t('auth.signupSuccess'), 3000);
        localStorage.setItem('signupData', JSON.stringify({email: data.email, password: data.password}));
        // Store the original signup email if not already set
        if (!localStorage.getItem('originalSignupEmail')) {
          localStorage.setItem('originalSignupEmail', data.email);
        }
        if (onSuccess) onSuccess(data);
        return { success: true, data: response.data };
      } else {
        showToastMessage(response.data.message, 3000);
        if (onError) onError(response.data.message);
        return { success: false, error: response.data.message };
      }
    } catch (error: any) {
      showToastMessage(error.response?.data?.message, 4000);
      if (onError) onError(error.response?.data?.message);
      return { success: false, error: error.response?.data?.message };
    }
  };

  return {
    ...form,
    focused,
    setFieldFocused,
    onSubmit,
    emailError,
    setEmailError,
    isEmailValid,
    setIsEmailValid,
    checkEmailAvailability,
    watch: form.watch,
  };
} 