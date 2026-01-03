// Simple global toast utility
let globalShowToast: ((message: string, duration?: number) => void) | null = null;

export const setGlobalToast = (showToast: (message: string, duration?: number) => void) => {
  globalShowToast = showToast;
};

export const showGlobalToast = (message: string, duration?: number) => {
  if (globalShowToast) {
    globalShowToast(message, duration);
  } else {
    console.warn('Global toast not initialized');
  }
}; 