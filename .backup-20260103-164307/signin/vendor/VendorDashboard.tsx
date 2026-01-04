// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR DASHBOARD v2.0
// Post-profile screen with catalog upload CTA
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';

interface VendorDashboardProps {
  onUploadCatalog: () => void;
  speak: (text: string) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const DASHBOARD_ITEMS = [
  { 
    id: 'upload', 
    icon: '📤', 
    title: 'Upload Catalog', 
    desc: 'PDF, Excel, or CSV → Live in 5 mins',
    primary: true,
    action: 'upload'
  },
  { 
    id: 'products', 
    icon: '📦', 
    title: 'My Products', 
    desc: 'View and manage your listings',
    action: 'products'
  },
  { 
    id: 'promotions', 
    icon: '🎯', 
    title: 'Promotions', 
    desc: 'Create deals and special offers',
    action: 'promotions'
  },
  { 
    id: 'storefront', 
    icon: '🏪', 
    title: 'My Storefront', 
    desc: 'Customize your vendor page',
    action: 'storefront'
  },
  { 
    id: 'orders', 
    icon: '📋', 
    title: 'Orders', 
    desc: 'Track and fulfill orders',
    action: 'orders'
  },
  { 
    id: 'analytics', 
    icon: '📊', 
    title: 'Analytics', 
    desc: 'Performance & insights',
    action: 'analytics'
  }
];

const VendorDashboard: React.FC<VendorDashboardProps> = ({ onUploadCatalog, speak }) => {
  const handleAction = (action: string) => {
    if (action === 'upload') {
      onUploadCatalog();
    } else {
      speak(`${action} feature coming soon. For now, let's upload your catalog to get your products live!`);
    }
  };

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '3em' }}>🎉</span>
        <h3 style={{ color: THEME.gold, marginTop: '12px', marginBottom: '8px' }}>
          Welcome to Your Vendor Dashboard!
        </h3>
        <p style={{ color: '#888', fontSize: '0.95em' }}>
          Upload your catalog to go live in under 5 minutes
        </p>
      </div>

      {/* Dashboard Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        {DASHBOARD_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleAction(item.action)}
            style={{ 
              background: item.primary 
                ? `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldLight})` 
                : 'rgba(255,255,255,0.05)', 
              border: `1px solid ${item.primary ? THEME.gold : 'rgba(184,134,11,0.3)'}`, 
              borderRadius: '16px', 
              padding: '24px 20px', 
              cursor: 'pointer', 
              textAlign: 'left',
              transition: 'all 0.2s',
              transform: item.primary ? 'scale(1.02)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.borderColor = THEME.gold;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = item.primary ? 'scale(1.02)' : 'scale(1)';
              e.currentTarget.style.borderColor = item.primary ? THEME.gold : 'rgba(184,134,11,0.3)';
            }}
          >
            <span style={{ fontSize: '2.2em' }}>{item.icon}</span>
            <h4 style={{ 
              color: item.primary ? '#000' : '#fff', 
              margin: '12px 0 6px',
              fontWeight: 600
            }}>
              {item.title}
            </h4>
            <p style={{ 
              color: item.primary ? '#333' : '#888', 
              fontSize: '0.85em', 
              margin: 0,
              lineHeight: 1.4
            }}>
              {item.desc}
            </p>
            {item.primary && (
              <div style={{
                marginTop: '12px',
                background: 'rgba(0,0,0,0.2)',
                padding: '6px 12px',
                borderRadius: '12px',
                display: 'inline-block',
                fontSize: '0.8em',
                fontWeight: 500
              }}>
                ⚡ Start here
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Voice Hint */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '24px',
        padding: '12px',
        background: 'rgba(184,134,11,0.1)',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#888', fontSize: '0.85em', margin: 0 }}>
          💡 Say <span style={{ color: THEME.goldLight }}>"upload catalog"</span> or 
          <span style={{ color: THEME.goldLight }}> "go live"</span> to start
        </p>
      </div>
    </div>
  );
};

export default VendorDashboard;
