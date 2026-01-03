import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface AIModeContextValue {
  isAIEnabled: boolean;
  toggleAI: () => void;
  enableAI: () => void;
  disableAI: () => void;
}

const AIModeContext = createContext<AIModeContextValue | undefined>(undefined);

export const AIModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAIEnabled, setIsAIEnabled] = useState<boolean>(true);

  const toggleAI = useCallback(() => {
    setIsAIEnabled(prev => !prev);
  }, []);

  const enableAI = useCallback(() => {
    setIsAIEnabled(true);
  }, []);

  const disableAI = useCallback(() => {
    setIsAIEnabled(false);
  }, []);

  const value = useMemo(() => ({
    isAIEnabled,
    toggleAI,
    enableAI,
    disableAI
  }), [isAIEnabled, toggleAI, enableAI, disableAI]);

  return (
    <AIModeContext.Provider value={value}>
      {children}
    </AIModeContext.Provider>
  );
};

export function useAIMode() {
  const context = useContext(AIModeContext);
  if (!context) {
    throw new Error('useAIMode must be used within an AIModeProvider');
  }
  return context;
}
