// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - Notification Banner
// Shows popup when processing completes
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}

interface Props {
  notification: Notification | null;
  onDismiss: () => void;
  onAction?: (action: string) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const NotificationBanner: React.FC<Props> = ({ notification, onDismiss, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  const icons = {
    success: '✅',
    info: '💬',
    warning: '⚠️',
    error: '❌'
  };

  const colors = {
    success: { bg: 'rgba(76,175,80,0.15)', border: '#4CAF50' },
    info: { bg: 'rgba(33,150,243,0.15)', border: '#2196F3' },
    warning: { bg: 'rgba(255,152,0,0.15)', border: '#FF9800' },
    error: { bg: 'rgba(244,67,54,0.15)', border: '#F44336' }
  };

  const c = colors[notification.type] || colors.info;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 99999,
      maxWidth: '400px',
      background: c.bg,
      border: `2px solid ${c.border}`,
      borderRadius: '16px',
      padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
      transition: 'transform 0.3s ease',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '1.5em' }}>{icons[notification.type]}</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fff', margin: '0 0 8px', fontWeight: 500 }}>{notification.message}</p>
          
          {notification.data?.products && (
            <p style={{ color: '#aaa', margin: '0 0 12px', fontSize: '0.85em' }}>
              {notification.data.products} products published
            </p>
          )}
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {notification.data?.action && (
              <button
                onClick={() => onAction?.(notification.data.action)}
                style={{
                  padding: '6px 16px',
                  background: THEME.gold,
                  color: '#000',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  fontWeight: 500
                }}
              >
                {notification.data.actionLabel || 'View'}
              </button>
            )}
            <button
              onClick={() => { setIsVisible(false); setTimeout(onDismiss, 300); }}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                color: '#888',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.85em'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
