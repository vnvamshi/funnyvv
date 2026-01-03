import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import MobileUI from './MobileUI';
import DesktopUI from './DesktopUI';

const PropertyListing: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  return isMobile ? <MobileUI /> : <DesktopUI />;
};

export default PropertyListing; 