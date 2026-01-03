import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // Also scroll all elements with .scrollable or [data-scrollable]
    document.querySelectorAll('.scrollable, [data-scrollable]').forEach(el => {
      if ('scrollTop' in el) (el as HTMLElement).scrollTop = 0;
    });
    console.log('ScrollToTop triggered', pathname);
  }, [pathname]);
  return null;
};

export default ScrollToTop; 