import React from 'react';

interface Props {
  onUploadCatalog: () => void;
  speak: (text: string) => void;
}

const VendorDashboard: React.FC<Props> = ({ onUploadCatalog, speak }) => {
  const items = [
    { icon: '📦', title: 'My Products', desc: 'View & manage products', action: () => speak("Opening My Products...") },
    { icon: '📤', title: 'Upload Catalog', desc: 'Add products from PDF', action: onUploadCatalog },
    { icon: '🎯', title: 'Promotions', desc: 'Create deals & offers', action: () => speak("Opening Promotions...") },
    { icon: '🏪', title: 'Storefront', desc: 'Customize your store', action: () => speak("Opening Storefront Settings...") }
  ];

  return (
    <div>
      <h3 style={{ color: '#B8860B', textAlign: 'center', marginBottom: '24px' }}>🎉 Welcome to Your Vendor Dashboard!</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {items.map((item, i) => (
          <button key={i} onClick={item.action} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(184,134,11,0.4)', borderRadius: '16px', padding: '24px', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: '2.5em' }}>{item.icon}</span>
            <h4 style={{ color: '#fff', margin: '12px 0 8px' }}>{item.title}</h4>
            <p style={{ color: '#888', fontSize: '0.9em', margin: 0 }}>{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboard;
