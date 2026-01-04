import React, { useEffect, useState } from 'react';

interface Props {
  notification: { type: 'success' | 'info' | 'error'; title: string; message: string; stats?: { products?: number; images?: number; }; } | null;
  onDismiss: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const THEME = { gold: '#B8860B' };

const NotificationPopup: React.FC<Props> = ({ notification, onDismiss, onAction, actionLabel = 'View' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      // Auto-speak
      const speak = (window as any).vistaviewSpeak;
      if (speak) speak(`${notification.title}. ${notification.message}`);
    }
  }, [notification]);

  if (!notification || !visible) return null;

  const colors = { success: '#4CAF50', info: '#2196F3', error: '#F44336' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
      <div style={{ background: 'linear-gradient(135deg, #004236, #001a15)', border: `3px solid ${colors[notification.type]}`, borderRadius: '20px', padding: '30px 40px', maxWidth: '450px', textAlign: 'center', boxShadow: `0 20px 60px rgba(0,0,0,0.5)` }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: colors[notification.type], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2em' }}>
          {notification.type === 'success' ? '🎉' : notification.type === 'info' ? '💬' : '❌'}
        </div>
        <h2 style={{ color: '#fff', margin: '0 0 12px' }}>{notification.title}</h2>
        <p style={{ color: '#aaa', margin: '0 0 20px' }}>{notification.message}</p>
        {notification.stats && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '24px' }}>
            {notification.stats.products !== undefined && <div><div style={{ color: THEME.gold, fontSize: '1.8em', fontWeight: 700 }}>{notification.stats.products}</div><div style={{ color: '#666', fontSize: '0.8em' }}>Products</div></div>}
            {notification.stats.images !== undefined && <div><div style={{ color: THEME.gold, fontSize: '1.8em', fontWeight: 700 }}>{notification.stats.images}</div><div style={{ color: '#666', fontSize: '0.8em' }}>Images</div></div>}
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {onAction && <button onClick={() => { onAction(); setVisible(false); onDismiss(); }} style={{ padding: '14px 32px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>{actionLabel}</button>}
          <button onClick={() => { setVisible(false); onDismiss(); }} style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.1)', color: '#888', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '25px', cursor: 'pointer' }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
