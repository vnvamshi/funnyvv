// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW PRODUCT CATALOG - REAL API DATA (NO FAKE)
// Fetches products from backend /api/products
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:1117';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_urls?: string[];
  sku?: string;
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  // REAL API FETCH - NO FAKE DATA
  useEffect(() => {
    console.log('[ProductCatalog] Fetching from', `${API_BASE}/api/products`);
    
    fetch(`${API_BASE}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('[ProductCatalog] Loaded', data.length, 'products');
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[ProductCatalog] Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category || 'General').filter(Boolean))];

  // Filter products
  const filtered = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '50vh', color: '#00d4aa' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: 20 }}>⏳</div>
          <p>Loading products from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '50vh', color: '#f59e0b' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: 20 }}>⚠️</div>
          <p>Error loading products: {error}</p>
          <p style={{ fontSize: '0.85em', color: '#888' }}>Is backend running on :1117?</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '50vh', color: '#888' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: 20 }}>📦</div>
          <p>No products yet</p>
          <p style={{ fontSize: '0.85em' }}>Upload a catalog to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, flexWrap: 'wrap', gap: 16
      }}>
        <h1 style={{ 
          color: '#00d4aa', margin: 0,
          background: 'linear-gradient(90deg, #00d4aa, #8b5cf6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Product Catalog ({products.length})
        </h1>
        
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '8px 16px',
                background: filter === cat ? '#00d4aa' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 20,
                color: filter === cat ? '#000' : '#fff',
                cursor: 'pointer',
                fontSize: '0.85em'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 20
      }}>
        {filtered.map(product => (
          <div key={product.id} style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(0,212,170,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            {/* Image */}
            <div style={{ 
              height: 180, 
              background: '#0a0a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {product.image_urls?.[0] ? (
                <img 
                  src={product.image_urls[0].startsWith('/') ? `${API_BASE}${product.image_urls[0]}` : product.image_urls[0]}
                  alt={product.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/300/200`;
                  }}
                />
              ) : (
                <span style={{ fontSize: '3em' }}>📦</span>
              )}
            </div>
            
            {/* Details */}
            <div style={{ padding: 16 }}>
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', 
                alignItems: 'flex-start', marginBottom: 8 
              }}>
                <h3 style={{ 
                  color: '#fff', margin: 0, fontSize: '1em',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                }}>
                  {product.name}
                </h3>
                <span style={{ 
                  color: '#B8860B', fontWeight: 700, fontSize: '1.1em',
                  whiteSpace: 'nowrap', marginLeft: 8
                }}>
                  ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                </span>
              </div>
              
              {product.description && (
                <p style={{ 
                  color: '#888', fontSize: '0.85em', margin: '8px 0',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                }}>
                  {product.description}
                </p>
              )}
              
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', 
                alignItems: 'center', marginTop: 12 
              }}>
                <span style={{
                  background: 'rgba(0,212,170,0.15)',
                  color: '#00d4aa',
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontSize: '0.75em'
                }}>
                  {product.category || 'General'}
                </span>
                {product.sku && (
                  <span style={{ color: '#666', fontSize: '0.75em' }}>
                    SKU: {product.sku}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;
