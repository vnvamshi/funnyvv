// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR STORE PAGE
// Individual vendor's store with their products
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import VoiceTeleprompter from '../shared/VoiceTeleprompter';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
}

interface Vendor {
  id: string;
  companyName: string;
  profile?: string;
  beautifiedProfile?: string;
  phone?: string;
}

interface Props {
  vendor: Vendor;
  onBack: () => void;
  onClose: () => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B', teal: '#004236' };

const VendorStorePage: React.FC<Props> = ({ vendor, onBack, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch vendor's products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:1117/api/vendors/${vendor.id}/products`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch vendor products:', e);
        setProducts([]);
      }
      setLoading(false);
    };
    
    fetchProducts();
    
    // Welcome message
    const speak = (window as any).vistaviewSpeak;
    if (speak) {
      speak(`Welcome to ${vendor.companyName}. They have ${products.length || 'several'} products available.`);
    }
  }, [vendor]);

  const handleVoiceCommand = useCallback((cmd: string) => {
    if (cmd.includes('back')) {
      onBack();
    }
  }, [onBack]);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`,
        padding: '30px 20px',
        position: 'relative'
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: '20px', left: '20px',
          background: 'rgba(255,255,255,0.1)', border: `1px solid ${THEME.gold}`,
          color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer'
        }}>
          ← Back
        </button>
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer'
        }}>✕</button>
        
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${THEME.gold}, #D4A84B)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '2em'
          }}>
            🏪
          </div>
          <h1 style={{ color: '#fff', margin: '0 0 8px' }}>{vendor.companyName}</h1>
          <p style={{ color: THEME.goldLight, margin: 0 }}>
            {products.length} products available
          </p>
        </div>
      </div>

      {/* Vendor Profile */}
      {vendor.beautifiedProfile && (
        <div style={{
          background: '#fff',
          padding: '20px',
          margin: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ color: THEME.gold, margin: '0 0 12px' }}>About Us</h3>
          <pre style={{
            margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit',
            color: '#555', lineHeight: 1.6
          }}>
            {vendor.beautifiedProfile}
          </pre>
        </div>
      )}

      {/* Products */}
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Our Products</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span style={{ fontSize: '2em' }}>⏳</span>
            <p style={{ color: '#888' }}>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px' }}>
            <span style={{ fontSize: '3em' }}>📦</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No products yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  height: '160px',
                  background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '3em', opacity: 0.5 }}>📦</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1em', color: '#333' }}>{product.name}</h3>
                  <p style={{ color: '#888', margin: '0 0 8px', fontSize: '0.85em' }}>
                    {product.description?.slice(0, 60) || 'Quality product'}...
                  </p>
                  <span style={{ color: THEME.gold, fontWeight: 700, fontSize: '1.2em' }}>
                    ${product.price?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Teleprompter */}
      <VoiceTeleprompter
        context="catalog"
        onCommand={handleVoiceCommand}
        initialMessage={`You're viewing ${vendor.companyName}'s store. Say 'back' to return to all vendors.`}
      />
    </div>
  );
};

export default VendorStorePage;
