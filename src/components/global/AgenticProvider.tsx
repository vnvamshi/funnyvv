// AgenticProvider.tsx - Wraps app to provide global agentic bar
import React, { useEffect } from 'react';
import GlobalAgenticBar from './GlobalAgenticBar';
import { initWalkAndClick } from '../../agentic';

interface Props {
  children: React.ReactNode;
}

const AgenticProvider: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    // Initialize walk and click on mount
    initWalkAndClick();
    console.log('[AgenticProvider] Initialized');
  }, []);

  return (
    <>
      {children}
      <GlobalAgenticBar />
    </>
  );
};

export default AgenticProvider;
