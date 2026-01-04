import React from 'react';

interface Props { vendorName?: string; onUploadCatalog: () => void; speak: (text: string) => void; }

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorDashboard: React.FC<Props> = ({ vendorName = 'Your Store', onUploadCatalog, speak }) => {
  const stats = [
    { icon: '📦', label: 'Products', value: '0' },
    { icon: '📋', label: 'Orders', value: '0' },
    { icon: '💰', label: 'Revenue', value: '$0' },
    { icon: '⭐', label: 'Rating', value: 'New' }
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📊</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Welcome, {vendorName}!</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '400px', margin: '24px auto' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.gold}30`, borderRadius: '14px', padding: '20px' }}>
            <span style={{ fontSize: '1.8em' }}>{s.icon}</span>
            <p style={{ color: '#fff', fontSize: '1.4em', fontWeight: 600, margin: '8px 0 4px' }}>{s.value}</p>
            <p style={{ color: '#888', margin: 0, fontSize: '0.85em' }}>{s.label}</p>
          </div>
        ))}
      </div>
      <button onClick={() => { onUploadCatalog(); speak("Let's upload your catalog!"); }} style={{ padding: '16px 48px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 600, fontSize: '1.1em' }}>📤 Upload Catalog</button>
    </div>
  );
};

export default VendorDashboard;
