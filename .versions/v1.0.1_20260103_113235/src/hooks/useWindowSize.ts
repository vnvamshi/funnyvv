// hooks/useWindowSize.ts
import { useState, useEffect } from 'react';

const useWindowSize = () => {
  const getOrientation = () => (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight, orientation: getOrientation() });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight, orientation: getOrientation() });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

export default useWindowSize;
