import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { showGlobalToast } from '../../utils/toast';
import { ToastContext } from '../../App';
import { X } from 'lucide-react';
import BottomModal from '../../components/BottomModal';

interface EmailUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onEmailUpdate: (newEmail: string) => void;
  currentEmail: string;
  variant?: 'desktop' | 'mobile';
}

const EmailUpdateModal: React.FC<EmailUpdateModalProps> = ({
  open,
  onClose,
  onEmailUpdate,
  currentEmail,
  variant = 'desktop'
}) => {
  const { t } = useTranslation();
  const { showToast } = useContext(ToastContext);
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const showToastMessage = (message: string, duration?: number) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
    } else {
      showGlobalToast(message, duration);
    }
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email.trim()) {
      showToastMessage('Email is required');
      return;
    }

    if (email === currentEmail) {
      showToastMessage('Please enter a different email address');
      return;
    }

    // Check email availability first
    const emailExists = await checkEmailAvailability(email);
    if (emailExists) {
      setEmailError('Email ID already taken');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/common/otp/send/', { email });
      if (response.data.status_code === 200) {
        showToastMessage(response.data.message);
        onEmailUpdate(email);
        onClose();
      } else {
        showToastMessage(response.data.message);
      }
    } catch (error: any) {
      showToastMessage(error?.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Clear email error when user types
    if (emailError) {
      setEmailError('');
    }
  };

  const handleEmailBlur = async () => {
    if (email && email !== currentEmail) {
      const emailExists = await checkEmailAvailability(email);
      if (emailExists) {
        setEmailError('Email ID already taken');
      } else {
        setEmailError('');
      }
    }
  };

  if (!open) return null;

  // Mobile version using BottomModal
  if (variant === 'mobile') {
    return (
      <BottomModal
        open={open}
        title="Update Email Address"
        onCancel={onClose}
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Sending OTP...' : 'Send OTP'}
        disabled={loading || !!emailError}
      >
        <div className="p-4">
          <div className="mb-6">
            <label className="block font-semibold mb-2">New Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              className={`w-full border rounded-lg px-4 py-3 text-lg ${emailError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter new email address"
              required
            />
            {emailError && (
              <div className="text-red-500 text-sm mt-2">{emailError}</div>
            )}
          </div>
        </div>
      </BottomModal>
    );
  }

  // Desktop version
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto relative animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center">Update Email Address</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block font-semibold mb-2">New Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              className={`w-full border rounded-lg px-4 py-3 text-lg ${emailError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter new email address"
              required
            />
            {emailError && (
              <div className="text-red-500 text-sm mt-2">{emailError}</div>
            )}
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg gradient-btn-equal text-white font-semibold"
              disabled={loading || !!emailError}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailUpdateModal; 