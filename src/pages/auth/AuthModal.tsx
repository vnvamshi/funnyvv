import React, { useState } from 'react';
import * as Yup from 'yup';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useMediaQuery from '@mui/material/useMediaQuery';
import WebLayout from './WebLogin';
import MobileLayout from './MobileLogin';
import WebSignup from './WebSignup';
import MobileSignup from './MobileSignup';

const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

type LoginFormValues = Yup.InferType<typeof loginSchema>;

interface AuthModalProps {
    onClose: () => void;
    initialView?: 'login' | 'signup';
}

const AuthModal = ({ onClose, initialView = 'login' }: AuthModalProps) => {
    const isMobile = useMediaQuery('(max-width:1024px)');
    const [view, setView] = useState(initialView);

    const methods = useForm<LoginFormValues>({
        resolver: yupResolver(loginSchema),
    });

    const onLoginSubmit: SubmitHandler<LoginFormValues> = (data) => {
        console.log('Login submitted', data);
        onClose();
    };

    const switchToSignup = () => setView('signup');
    const switchToLogin = () => setView('login');

    if (isMobile) {
        return view === 'login' ? (
            <MobileLayout />
        ) : (
            <MobileSignup />
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                {view === 'login' ? (
                    <FormProvider {...methods}>
                        <WebLayout
                            onClose={onClose}
                            onSwitchToSignup={switchToSignup}
                        />
                    </FormProvider>
                ) : (
                    <WebSignup onClose={onClose} onSwitchToLogin={switchToLogin} onSwitchToAgentSignUp={() => {}} />
                )}
            </div>
        </div>
    );
};

export default AuthModal; 