import React, { useEffect } from 'react';

interface ToastProps {
  message: any;
  onClose: () => void;
  duration?: number; // in ms
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Normalize message to a user-friendly string
  const displayMessage =
    typeof message === 'string'
      ? message
      : Array.isArray(message)
      ? message.join(', ')
      : typeof message === 'object' && message !== null
      ? (() => {
          try {
            // Common API error shape: { field: ['err', ...], field2: 'err' }
            const values = Object.values(message).flatMap((v: any) =>
              Array.isArray(v) ? v : [v]
            );
            const asStrings = values
              .filter((v) => v !== undefined && v !== null)
              .map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
            return asStrings.join(' ') || 'Something went wrong';
          } catch {
            return 'Something went wrong';
          }
        })()
      : String(message);

  return (
    <div
      className="fixed right-6 bottom-6 z-[9999] px-5 py-3 rounded-xl shadow-lg flex items-center min-w-[240px] max-w-[360px] pointer-events-auto"
      style={{
        background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
        color: '#fff',
      }}
    >
      <span
        className="font-bold text-sm leading-snug flex-1 break-words"
        style={{
          background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {displayMessage}
      </span>
      <button
        onClick={onClose}
        aria-label="Close"
        className="ml-3 p-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
          border: 'none',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 6L14 14M14 6L6 14" stroke="#004236" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default Toast; 