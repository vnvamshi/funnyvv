// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - Vendor Catalog Button
// Button for main page to open the Product Catalog with voice
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';

interface Props {
  onClick: () => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorCatalogButton: React.FC<Props> = ({ onClick }) => {
  const [vendorCount, setVendorCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [vRes, pRes] = await Promise.all([
          fetch('http://localhost:1117/api/vendors'),
          fetch('http://localhost:1117/api/products')
        ]);
        const vendors = await vRes.json();
        const products = await pRes.json();
        setVendorCount(vendors?.length || 0);
        setProductCount(products?.length || 0);
      } catch (e) {
        console.log('Could not fetch catalog counts');
      }
    };
    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered 
          ? `linear-gradient(135deg, ${THEME.gold}, #D4A84B)` 
          : 'rgba(184,134,11,0.15)',
        border: `2px solid ${THEME.gold}`,
        borderRadius: '16px',
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 24px rgba(184,134,11,0.3)` : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: isHovered ? 'rgba(0,0,0,0.2)' : `linear-gradient(135deg, ${THEME.gold}, #D4A84B)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          🛒
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            color: isHovered ? '#000' : '#fff', 
            margin: '0 0 4px', 
            fontSize: '1.1em' 
          }}>
            Product Catalog
          </h3>
          <p style={{ 
            color: isHovered ? 'rgba(0,0,0,0.7)' : '#888', 
            margin: 0, 
            fontSize: '0.85em' 
          }}>
            {vendorCount} vendors • {productCount} products
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ 
            color: isHovered ? '#000' : THEME.gold, 
            fontSize: '1.2em' 
          }}>
            →
          </span>
          <span style={{ 
            color: isHovered ? 'rgba(0,0,0,0.6)' : '#666', 
            fontSize: '0.7em' 
          }}>
            🎤 Voice
          </span>
        </div>
      </div>
      
      {/* AI Learning Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '12px',
        padding: '6px 10px',
        background: isHovered ? 'rgba(0,0,0,0.15)' : 'rgba(184,134,11,0.2)',
        borderRadius: '20px',
        width: 'fit-content'
      }}>
        <span style={{ fontSize: '0.9em' }}>🧠</span>
        <span style={{ 
          color: isHovered ? 'rgba(0,0,0,0.8)' : THEME.goldLight, 
          fontSize: '0.75em' 
        }}>
          AI-Powered • Nebraska • IKEA • Wayfair Patterns
        </span>
      </div>
    </div>
  );
};

export default VendorCatalogButton;
