import React, { useState, useEffect, useCallback } from 'react';
import VoiceTeleprompter from '../shared/VoiceTeleprompter';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  vendor: string;
  vendorId: string;
  description?: string;
}

interface Vendor {
  id: string;
  companyName: string;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B', teal: '#004236' };

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🛒' },
  { id: 'furniture', name: 'Furniture', icon: '🛋️' },
  { id: 'lighting', name: 'Lighting', icon: '💡' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'flooring', name: 'Flooring', icon: '🏠' },
  { id: 'bath', name: 'Bath', icon: '🚿' }
];

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

const ProductCatalogPage: React.FC<Props> = ({ isOpen = true, onClose }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vRes, pRes] = await Promise.all([
          fetch('http://localhost:1117/api/vendors'),
          fetch('http://localhost:1117/api/products')
        ]);
        const vData = await vRes.json();
        const pData = await pRes.json();
        
        setVendors(Array.isArray(vData) ? vData : []);
        setProducts(Array.isArray(pData) ? pData : []);
        setFilteredProducts(Array.isArray(pData) ? pData : []);
        
        // Welcome message
        setTimeout(() => {
          const speak = (window as any).vistaviewSpeak;
          if (speak) {
            speak(`Welcome to Product Catalog! ${pData.length || 0} products from ${vData.length || 0} vendors available.`);
          }
        }, 1000);
      } catch (e) {
        console.error('Fetch error:', e);
        setProducts([]);
        setFilteredProducts([]);
      }
      setLoading(false);
    };
    
    if (isOpen) fetchData();
  }, [isOpen]);

  // Filter products
  useEffect(() => {
    let filtered = [...products];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === selectedCategory);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.vendor?.toLowerCase().includes(q)
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  // Voice commands
  const handleVoiceCommand = useCallback((cmd: string) => {
    console.log('[Catalog] Voice command:', cmd);
    
    if (cmd.includes('search')) {
      const q = cmd.replace(/search|for|find/gi, '').trim();
      setSearchQuery(q);
      const speak = (window as any).vistaviewSpeak;
      if (speak) speak(`Searching for ${q}`);
    }
    
    // Category commands
    if (cmd.includes('furniture')) { setSelectedCategory('furniture'); }
    if (cmd.includes('lighting')) { setSelectedCategory('lighting'); }
    if (cmd.includes('kitchen')) { setSelectedCategory('kitchen'); }
    if (cmd.includes('flooring')) { setSelectedCategory('flooring'); }
    if (cmd.includes('bath')) { setSelectedCategory('bath'); }
    if (cmd.includes('all') || cmd.includes('show all')) { setSelectedCategory('all'); }
    
    if (cmd.includes('close') || cmd.includes('exit')) {
      onClose?.();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#f5f5f5',
      zIndex: 9998,
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`,
        padding: '30px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2em'
            }}
          >✕</button>
        )}
        <h1 style={{ color: '#fff', margin: '0 0 8px', fontSize: '2em' }}>🛒 Product Catalog</h1>
        <p style={{ color: THEME.goldLight, margin: 0 }}>
          {products.length} products from {vendors.length} vendors
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search products..."
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '1em'
          }}
        />
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              const speak = (window as any).vistaviewSpeak;
              if (speak && cat.id !== 'all') speak(`Showing ${cat.name}`);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              background: selectedCategory === cat.id ? THEME.gold : '#e0e0e0',
              color: selectedCategory === cat.id ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: selectedCategory === cat.id ? 600 : 400
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <span style={{ fontSize: '3em' }}>⏳</span>
            <p style={{ color: '#888', marginTop: '16px' }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <span style={{ fontSize: '4em' }}>📭</span>
            <p style={{ color: '#888', marginTop: '16px' }}>No products found</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              style={{
                marginTop: '12px',
                padding: '10px 24px',
                background: THEME.gold,
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >Clear Filters</button>
          </div>
        ) : (
          <>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px'
            }}>
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  <div style={{
                    height: '160px',
                    background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '3em', opacity: 0.5 }}>📦</span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      background: '#f0f0f0',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75em',
                      color: '#666',
                      marginBottom: '8px'
                    }}>{product.vendor}</span>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1em', color: '#333' }}>{product.name}</h3>
                    <p style={{ margin: '0 0 12px', fontSize: '0.85em', color: '#888' }}>
                      {product.description?.slice(0, 60) || 'Quality product'}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: THEME.gold, fontWeight: 700, fontSize: '1.2em' }}>
                        ${product.price?.toFixed(2) || '0.00'}
                      </span>
                      <button style={{
                        background: THEME.gold,
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.85em'
                      }}>View</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Voice Teleprompter */}
      <VoiceTeleprompter
        context="catalog"
        onCommand={handleVoiceCommand}
        initialMessage="Search by voice or browse categories. Say 'show furniture' or 'search tables'."
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <div style={{
              height: '200px',
              background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '5em', opacity: 0.5 }}>📦</span>
            </div>
            <div style={{ padding: '24px' }}>
              <span style={{
                display: 'inline-block',
                background: THEME.gold,
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.8em',
                marginBottom: '12px'
              }}>{selectedProduct.vendor}</span>
              <h2 style={{ margin: '0 0 12px' }}>{selectedProduct.name}</h2>
              <p style={{ color: THEME.gold, fontSize: '1.8em', fontWeight: 700, margin: '0 0 16px' }}>
                ${selectedProduct.price?.toFixed(2)}
              </p>
              <p style={{ color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
                {selectedProduct.description || 'Premium quality product from our trusted vendor network.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <span style={{ background: '#e8f5e9', color: '#4CAF50', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8em' }}>✓ In Stock</span>
                <span style={{ background: '#fff3e0', color: '#FF9800', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8em' }}>🚚 Free Shipping</span>
              </div>
              <button style={{
                width: '100%',
                padding: '14px',
                background: THEME.gold,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: 600
              }}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogPage;
