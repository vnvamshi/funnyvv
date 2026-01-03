import React, { useContext, useEffect, useState } from 'react';
import OtpInput from 'react-otp-input';
import { useOtpForm } from './useOtpForm';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { Controller } from 'react-hook-form';
import { useSignupForm } from './useSignupForm';
import api from '../../utils/api';
import { showGlobalToast } from '../../utils/toast';
import { ToastContext } from '../../App';
import ButtonLoader from '../../components/ButtonLoader';
import EmailUpdateModal from './EmailUpdateModal';

interface WebOTPVerifyProps {
    onOtpClose: () => void;
    onSwitchToSignup: () => void;
}

const WebOTPVerify = ({ onOtpClose }: WebOTPVerifyProps) => {
    const [timer, setTimer] = useState(59);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAuth();
    const signupData = JSON.parse(localStorage.getItem('signupData') || '{}');
    const [currentEmail, setCurrentEmail] = useState(signupData?.email);
    const dispatch = useDispatch();
    const { control, handleSubmit, formState: { errors }, onSubmitOtp } = useOtpForm();
    
    const { showToast } = useContext(ToastContext);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    const showToastMessage = (message: string, duration?: number) => {
        if (showToast && typeof showToast === 'function') {
        showToast(message, duration);
        } else {
        showGlobalToast(message, duration);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const onResend = async () => {
        setResendLoading(true); // Immediately disable button
        try {
            const response = await api.post('/common/otp/send/', { email: currentEmail });
            if(response.data.status_code === 200){
                setTimer(59);
                showToastMessage(t('auth.otpSent'), 3000);      
            }else{
                showToastMessage(response.data.message, 3000); 
            }
          } catch (error: any) {
            showToastMessage(error.response?.data?.message, 3000);
          } finally {
            setResendLoading(false); // Re-enable button after API call completes
          }
    };

    const handleEmailUpdate = (newEmail: string) => {
        setCurrentEmail(newEmail);
        // Update signup data with new email
        const updatedSignupData = { ...signupData, email: newEmail };
        localStorage.setItem('signupData', JSON.stringify(updatedSignupData));
        setTimer(59); // Reset timer for new OTP
    };

    const handleOtpSubmit = async (data: any) => {
        setLoading(true);
        try {
            const result = await onSubmitOtp(data.otp, currentEmail);
            if (result.success) {
                onOtpClose();
            }
        } catch (error) {
            console.error('OTP verification error:', error);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-lg px-20 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto" style={{ minWidth: 606 }}>
                
                    <button 
                        onClick={onOtpClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-left mb-2">{t('otp.title_email')}</h2>
                    <p className="text-left text-gray-600 mb-4">
                        {currentEmail} <button onClick={() => setShowEmailModal(true)} className="text-primary-color underline">{t('otp.change_mail')}</button>
                    </p>
                    <hr className="my-4" />
                    <p className="text-left text-sm font-semibold text-gray-500 mb-4 uppercase">{t('otp.enter_otp')}</p>
                    
                    <form onSubmit={handleSubmit(handleOtpSubmit)}>
                        <div className="flex justify-center mb-6">
                            <Controller
                                name="otp"
                                control={control}
                                render={({ field }) => (
                                    <OtpInput
                                        {...field}
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
                                        }}
                                    />
                                )}
                            />
                        </div>
                        {errors.otp && <p className="validation-error-center">{errors.otp.message}</p>}
                        
                        <button type="submit" className="form-submit-button mx-auto block" disabled={loading}>
                            {loading ? "Verifying..." : t('otp.submit_button')}
                        </button>
                    </form>
                    <div className="flex justify-center mb-6 mt-6 text-center">
                        <button onClick={onResend} disabled={timer > 0 || resendLoading} className="text-sm text-primary-color disabled:opacity-50">
                            {resendLoading ? 'Sending...' : `${t('otp.resend')} ${timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : ''}`}
                        </button>
                    </div>
                </div>

            <EmailUpdateModal
                open={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onEmailUpdate={handleEmailUpdate}
                currentEmail={currentEmail}
                variant="desktop"
            />
        </>
    );
};

export default WebOTPVerify; 