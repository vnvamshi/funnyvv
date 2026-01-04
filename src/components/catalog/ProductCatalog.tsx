// v3/pages/ProductCatalog.tsx - FIXED to fetch from API
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:1117';

interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendor_name?: string;
  image_url?: string;
  thumbnail_url?: string;
  in_stock: boolean;
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      const url = `${API_URL}/api/products${params.toString() ? '?' + params.toString() : ''}`;
      console.log('[ProductCatalog] Fetching:', url);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      console.log('[ProductCatalog] Received:', data.length, 'items');
      setProducts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('[ProductCatalog] Error:', e);
      setError(e.message || 'Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const filtered = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.name || '').toLowerCase().includes(q) || 
           (p.description || '').toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <section style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2em', marginBottom: '30px', color: '#1a1a1a' }}>
        Our Products
      </h2>
      
      {/* Filters */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or code"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1em' }}
          />
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1em', background: '#fff' }}
          >
            <option value="">All Categories</option>
            <option value="furniture">Furniture</option>
            <option value="lighting">Lighting</option>
            <option value="kitchen">Kitchen</option>
            <option value="outdoor">Outdoor</option>
            <option value="general">General</option>
          </select>
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Sort by</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1em', background: '#fff' }}
          >
            <option value="name">Name (A-Z)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>⏳</div>
          <p style={{ color: '#888', fontSize: '1.1em' }}>Loading products...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff8f8', borderRadius: '16px', border: '1px solid #ffdddd' }}>
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>⚠️</div>
          <p style={{ color: '#cc0000', marginBottom: '10px', fontWeight: 500 }}>Could not load products</p>
          <p style={{ color: '#888', fontSize: '0.9em', marginBottom: '20px' }}>{error}</p>
          <button onClick={fetchProducts} style={{ padding: '12px 30px', background: '#B8860B', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4em', marginBottom: '15px' }}>📦</div>
          <p style={{ color: '#888', fontSize: '1.1em' }}>
            {products.length === 0 ? 'No products yet. Upload a catalog to add products.' : 'No matches found.'}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && sorted.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {sorted.map(product => (
            <div
              key={product.product_id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
            >
              <div style={{
                height: '200px',
                background: product.thumbnail_url || product.image_url 
                  ? `url(${product.thumbnail_url || product.image_url}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!product.thumbnail_url && !product.image_url && <span style={{ fontSize: '4em', opacity: 0.3 }}>📦</span>}
                {product.category && (
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75em', textTransform: 'capitalize' }}>
                    {product.category}
                  </span>
                )}
              </div>
              <div style={{ padding: '20px' }}>
                {product.vendor_name && (
                  <span style={{ display: 'inline-block', background: '#f5f5f5', color: '#666', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75em', marginBottom: '10px' }}>
                    {product.vendor_name}
                  </span>
                )}
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1em', fontWeight: 600, color: '#1a1a1a' }}>
                  {product.name || 'Product'}
                </h3>
                <p style={{ margin: '0 0 15px', fontSize: '0.9em', color: '#888', height: '40px', overflow: 'hidden', lineHeight: 1.4 }}>
                  {(product.description || 'Quality product').slice(0, 80)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#B8860B', fontWeight: 700, fontSize: '1.3em' }}>
                    ${(product.price || 0).toFixed(2)}
                  </span>
                  <span style={{
                    background: product.in_stock !== false ? '#e8f5e9' : '#ffebee',
                    color: product.in_stock !== false ? '#2e7d32' : '#c62828',
                    padding: '5px 12px',
                    borderRadius: '15px',
                    fontSize: '0.8em',
                    fontWeight: 500
                  }}>
                    {product.in_stock !== false ? '✓ In Stock' : 'Out'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductCatalog;
