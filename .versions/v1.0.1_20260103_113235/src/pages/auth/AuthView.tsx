import React, { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import WebLayout from './WebLogin';
import MobileLayout from './MobileLogin';
import WebSignup from './WebSignup';
import MobileSignup from './MobileSignup';

const AuthView = () => {
    const isMobile = useMediaQuery('(max-width:1024px)');
    const [view, setView] = useState('login');
    const navigate = useNavigate();

    const handleClose = () => {
        setView('login');
        navigate('/');
    };

    const switchToSignup = () => setView('signup');

    if (view === 'signup') {
        return isMobile 
            ? <MobileSignup /> 
            : (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <WebSignup onClose={handleClose} onSwitchToLogin={() => {}} onSwitchToAgentSignUp={() => {}} />
                </div>
            );
    }

    return isMobile ? <MobileLayout /> : <WebLayout onClose={handleClose} onSwitchToSignup={switchToSignup} />;
};

export default AuthView; 