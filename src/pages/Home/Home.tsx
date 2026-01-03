import React from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import HomeDesktop from './DesktopHomeUI';
import HomeMobile from './MobileHomeUI';


const Home = () => {
  // Logic section
  const { width, orientation } = useWindowSize();

  // Desktop breakpoint threshold
  const isDesktop = width > 1024;

  return (
    <div>
      {isDesktop ? <HomeDesktop /> : <HomeMobile />}
    </div>
  );
};

export default Home;
