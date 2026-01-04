import React from 'react';
const THEME = { gold: '#B8860B' };
interface Props { vendorName: string; onUploadCatalog: () => void; speak: (t: string) => void; }
const VendorDashboard: React.FC<Props> = ({ vendorName, onUploadCatalog, speak }) => (
  <div>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <span style={{ fontSize: '3em' }}>📊</span>
      <h3 style={{ color: THEME.gold, marginTop: '12px' }}>Welcome, {vendorName}!</h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
      {[{ icon: '📦', label: 'Products', value: '0' }, { icon: '📋', label: 'Orders', value: '0' }, { icon: '💰', label: 'Revenue', value: '$0' }, { icon: '⭐', label: 'Rating', value: 'New' }].map(s => (
        <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em' }}>{s.icon}</div>
          <div style={{ color: '#fff', fontSize: '1.2em', fontWeight: 600 }}>{s.value}</div>
          <div style={{ color: '#888', fontSize: '0.8em' }}>{s.label}</div>
        </div>
      ))}
    </div>
    <button onClick={onUploadCatalog} style={{ width: '100%', padding: '16px', background: THEME.gold, border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <span style={{ fontSize: '1.3em' }}>📤</span>
      <span style={{ color: '#000', fontWeight: 600 }}>Upload Catalog</span>
    </button>
  </div>
);
export default VendorDashboard;
