import React, { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import WebLayout from './WebLogin';
import MobileLayout from './MobileLogin';
import { getLoginSchema, LoginFormValues } from './loginSchema';

const Login = () => {
    const isMobile = useMediaQuery('(max-width:1024px)');
   
    return isMobile ? <MobileLayout  /> : <WebLayout onClose={() => {}} />;
};

export default Login; 