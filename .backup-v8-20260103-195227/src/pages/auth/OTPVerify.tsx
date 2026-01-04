import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import WebOTPVerify from './WebOTPVerify';
import MobileOTPVerify from './MobileOTPVerify';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';



const OTPVerify = () => {
    const isMobile = useMediaQuery('(max-width:1024px)');

    return isMobile ? <MobileOTPVerify /> : <WebOTPVerify onOtpClose={() => {}} onSwitchToSignup={() => {}} />;
};

export default OTPVerify; 