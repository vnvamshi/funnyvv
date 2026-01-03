import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface ChatbotContextValue {
  isOpen: boolean;
  initialMessage: string;
  isVoiceModalOpen: boolean;
  openChatbot: (message?: string) => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
}

const ChatbotContext = createContext<ChatbotContextValue | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  const openChatbot = useCallback((message: string = '') => {
    setInitialMessage(message);
    setIsOpen(true);
  }, []);

  const closeChatbot = useCallback(() => {
    setIsOpen(false);
    setInitialMessage('');
  }, []);

  const toggleChatbot = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openVoiceModal = useCallback(() => {
    setIsVoiceModalOpen(true);
  }, []);

  const closeVoiceModal = useCallback(() => {
    setIsVoiceModalOpen(false);
  }, []);

  const value = useMemo(() => ({
    isOpen,
    initialMessage,
    isVoiceModalOpen,
    openChatbot,
    closeChatbot,
    toggleChatbot,
    openVoiceModal,
    closeVoiceModal
  }), [isOpen, initialMessage, isVoiceModalOpen, openChatbot, closeChatbot, toggleChatbot, openVoiceModal, closeVoiceModal]);

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}
