import { useState } from 'react';

export function useBottomSelectModal<T extends string>() {
  const [modalType, setModalType] = useState<null | T>(null);
  const openModal = (type: T) => setModalType(type);
  const closeModal = () => setModalType(null);
  return { modalType, openModal, closeModal };
} 