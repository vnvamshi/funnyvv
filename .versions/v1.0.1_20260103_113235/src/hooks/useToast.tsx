import React, { useState, useCallback } from 'react';
import Toast from '../components/Toast';

export function useToast() {
  const [toast, setToast] = useState<{ message: string; duration?: number } | null>(null);

  const showToast = useCallback((message: string, duration?: number) => {
    setToast({ message, duration });
  }, []);

  const handleClose = useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast ? (
    <Toast message={toast.message} onClose={handleClose} duration={toast.duration} />
  ) : null;

  return { showToast, ToastComponent };
} 