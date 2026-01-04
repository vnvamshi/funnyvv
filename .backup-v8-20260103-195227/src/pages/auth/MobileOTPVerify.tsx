import React, { useContext, useEffect, useState } from 'react';
import OtpInput from 'react-otp-input';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useOtpForm } from './useOtpForm';
import { Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import api from '../../utils/api';
import { ToastContext } from '../../App';   
import { showGlobalToast } from '../../utils/toast';
import ButtonLoader from '../../components/ButtonLoader';
import EmailUpdateModal from './EmailUpdateModal';

const MobileOTPVerify = () => {
    const [timer, setTimer] = useState(59);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAuth();
    const signupData = JSON.parse(localStorage.getItem('signupData') || '{}');
    const [currentEmail, setCurrentEmail] = useState(signupData?.email);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { control, handleSubmit, formState: { errors }, onSubmitOtp } = useOtpForm();
    const { showToast } = useContext(ToastContext);
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
                // OTP verification successful, user will be redirected
            }
        } catch (error) {
            console.error('OTP verification error:', error);
        }
        setLoading(false);
    };
   
    return (
        <>
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
                <div className="flex-shrink-0">
                    <Link to="/" className="text-gray-600 mb-4" onClick={() => {localStorage.removeItem('signupData');}}>
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold mt-4 mb-2">{t('otp.title_email')}</h1>
                    <p className="text-gray-600 mb-4">
                        {currentEmail} <button onClick={() => setShowEmailModal(true)} className="text-primary-color underline">{t('otp.change_mail')}</button>
                    </p>
                    <hr className="my-4" />
                </div>

                <div className="flex-grow">
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
                                            margin: '0 0.2rem'
                                        }}
                                    />
                                )}
                            />
                        </div>
                        {errors.otp && <p className="validation-error-center">{errors.otp.message}</p>}
                        
                        <button type="submit" className="form-submit-button mb-8" disabled={loading}>
                            {loading ? "Verifying..." : t('otp.submit_button')} 
                        </button>
                    </form>
                    
                    <div className="flex justify-center mb-6 text-center">
                        <button onClick={onResend} disabled={timer > 0 || resendLoading} className="text-sm text-primary-color disabled:opacity-50">
                            {resendLoading ? 'Sending...' : `${t('otp.resend')} ${timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : ''}`}
                        </button>
                    </div>
                </div>
            </div>

            <EmailUpdateModal
                open={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onEmailUpdate={handleEmailUpdate}
                currentEmail={currentEmail}
                variant="mobile"
            />
        </>
    );
};

export default MobileOTPVerify; 