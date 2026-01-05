// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - PRODUCT CATALOG v1.0
// IKEA/Wayfair Style Product Display
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_urls?: string[];
  sku?: string;
  materials?: string;
  dimensions?: string;
  warranty?: string;
  vendor_name?: string;
}

interface ProductCatalogProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialCategory?: string;
}

const THEME = {
  dark: '#0a1628',
  darker: '#060d18',
  teal: '#00d4aa',
  gold: '#B8860B',
  purple: '#8b5cf6',
  white: '#ffffff',
  gray: '#94a3b8'
};

const API_BASE = 'http://localhost:1117';

// Sample placeholder images (IKEA/Wayfair style)
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', // Sofa
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400', // Chair
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400', // Table
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400', // Living room
  'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400', // Bedroom
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', // Kitchen
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400', // Modern interior
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400', // Lamp
];

const CATEGORIES = ['All', 'Furniture', 'Lighting', 'Rugs', 'Decor', 'Kitchen', 'Outdoor'];

const ProductCatalog: React.FC<ProductCatalogProps> = ({ isOpen = true, onClose, initialCategory }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
    
    // Listen for navigation events
    const handleNavigate = (e: any) => {
      if (e.detail?.products) {
        setProducts(e.detail.products);
        setLoading(false);
      }
    };
    
    window.addEventListener('navigateToCatalog', handleNavigate);
    return () => window.removeEventListener('navigateToCatalog', handleNavigate);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.log('Using demo products');
      // Demo products
      setProducts([
        { id: '1', name: 'Modern Oak Dining Table', description: 'Solid oak with clean lines', price: 899.99, category: 'Furniture', sku: 'TBL-001' },
        { id: '2', name: 'Velvet Accent Chair', description: 'Luxurious velvet upholstery', price: 349.99, category: 'Furniture', sku: 'CHR-001' },
        { id: '3', name: 'Ceramic Table Lamp', description: 'Hand-crafted ceramic base', price: 129.99, category: 'Lighting', sku: 'LMP-001' },
        { id: '4', name: 'Wool Area Rug 8x10', description: 'Hand-woven pure wool', price: 599.99, category: 'Rugs', sku: 'RUG-001' },
        { id: '5', name: 'Minimalist Floor Lamp', description: 'Sleek metal design', price: 189.99, category: 'Lighting', sku: 'LMP-002' },
        { id: '6', name: 'Leather Sofa 3-Seater', description: 'Premium Italian leather', price: 1899.99, category: 'Furniture', sku: 'SOF-001' },
        { id: '7', name: 'Glass Coffee Table', description: 'Tempered glass top', price: 299.99, category: 'Furniture', sku: 'TBL-002' },
        { id: '8', name: 'Decorative Wall Mirror', description: 'Gold-framed round mirror', price: 159.99, category: 'Decor', sku: 'MIR-001' },
        { id: '9', name: 'Outdoor Patio Set', description: '4-piece weather resistant', price: 799.99, category: 'Outdoor', sku: 'OUT-001' },
        { id: '10', name: 'Kitchen Island Cart', description: 'Mobile with storage', price: 449.99, category: 'Kitchen', sku: 'KIT-001' },
        { id: '11', name: 'Pendant Light Cluster', description: '3-light modern cluster', price: 249.99, category: 'Lighting', sku: 'LMP-003' },
        { id: '12', name: 'Jute Natural Rug', description: 'Eco-friendly natural fiber', price: 199.99, category: 'Rugs', sku: 'RUG-002' },
      ]);
    }
    setLoading(false);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  const getProductImage = (product: Product, index: number) => {
    if (product.image_urls && product.image_urls.length > 0) {
      return product.image_urls[0];
    }
    return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9998,
      background: THEME.darker,
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${THEME.dark}, ${THEME.darker})`,
        borderBottom: `1px solid ${THEME.teal}22`,
        padding: '20px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '2em' }}>🛍️</span>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.8em',
                background: `linear-gradient(90deg, ${THEME.teal}, ${THEME.gold})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Product Catalog
              </h1>
              <p style={{ margin: 0, color: THEME.gray, fontSize: '0.9em' }}>
                {filteredProducts.length} products • IKEA/Wayfair Style
              </p>
            </div>
          </div>
          
          {onClose && (
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              cursor: 'pointer',
              color: THEME.white,
              fontSize: '1.3em'
            }}>✕</button>
          )}
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 250 }}>
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${THEME.teal}33`,
                borderRadius: 12,
                color: THEME.white,
                fontSize: '1em'
              }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${THEME.teal}33`,
              borderRadius: 12,
              color: THEME.white,
              fontSize: '1em',
              cursor: 'pointer'
            }}
          >
            <option value="name">Sort: Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'grid' ? THEME.teal : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: viewMode === 'grid' ? THEME.dark : THEME.white,
                cursor: 'pointer'
              }}
            >⊞ Grid</button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'list' ? THEME.teal : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: viewMode === 'list' ? THEME.dark : THEME.white,
                cursor: 'pointer'
              }}
            >☰ List</button>
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 20px',
                background: selectedCategory === cat 
                  ? `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})` 
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selectedCategory === cat ? 'transparent' : THEME.teal + '33'}`,
                borderRadius: 20,
                color: THEME.white,
                cursor: 'pointer',
                fontWeight: selectedCategory === cat ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid/List */}
      <div style={{ padding: '30px 40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3em', marginBottom: 20 }}>⏳</div>
            <p style={{ color: THEME.gray }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3em', marginBottom: 20 }}>📦</div>
            <p style={{ color: THEME.gray }}>No products found</p>
          </div>
        ) : viewMode === 'grid' ? (
          // GRID VIEW - IKEA/Wayfair Style
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24
          }}>
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                style={{
                  background: `linear-gradient(135deg, ${THEME.dark}, ${THEME.darker})`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `1px solid ${THEME.teal}22`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px ${THEME.teal}22`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Product Image */}
                <div style={{
                  height: 220,
                  background: `url(${getProductImage(product, index)}) center/cover`,
                  position: 'relative'
                }}>
                  {/* Category Badge */}
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: THEME.teal,
                    color: THEME.dark,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '0.75em',
                    fontWeight: 600
                  }}>
                    {product.category}
                  </span>
                  
                  {/* Wishlist Button */}
                  <button style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    cursor: 'pointer',
                    fontSize: '1.1em'
                  }}>♡</button>
                </div>

                {/* Product Info */}
                <div style={{ padding: 20 }}>
                  <h3 style={{ 
                    margin: '0 0 8px', 
                    color: THEME.white,
                    fontSize: '1.1em',
                    fontWeight: 600
                  }}>
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p style={{ 
                      margin: '0 0 12px', 
                      color: THEME.gray,
                      fontSize: '0.9em',
                      lineHeight: 1.4
                    }}>
                      {product.description.slice(0, 60)}...
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      color: THEME.gold,
                      fontSize: '1.4em',
                      fontWeight: 700
                    }}>
                      ${product.price.toFixed(2)}
                    </span>
                    
                    <button style={{
                      background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})`,
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      color: THEME.white,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85em'
                    }}>
                      Add to Cart
                    </button>
                  </div>
                  
                  {product.sku && (
                    <p style={{ margin: '12px 0 0', color: '#666', fontSize: '0.8em' }}>
                      SKU: {product.sku}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // LIST VIEW
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                style={{
                  display: 'flex',
                  gap: 20,
                  background: `linear-gradient(135deg, ${THEME.dark}, ${THEME.darker})`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: `1px solid ${THEME.teal}22`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: 180,
                  height: 140,
                  background: `url(${getProductImage(product, index)}) center/cover`,
                  flexShrink: 0
                }} />
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ color: THEME.teal, fontSize: '0.8em' }}>{product.category}</span>
                      <h3 style={{ margin: '4px 0 8px', color: THEME.white }}>{product.name}</h3>
                      <p style={{ margin: 0, color: THEME.gray, fontSize: '0.9em' }}>{product.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, color: THEME.gold, fontSize: '1.5em', fontWeight: 700 }}>
                        ${product.price.toFixed(2)}
                      </p>
                      <button style={{
                        marginTop: 8,
                        background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})`,
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 20px',
                        color: THEME.white,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: `linear-gradient(135deg, ${THEME.dark}, ${THEME.darker})`,
              borderRadius: 20,
              maxWidth: 900,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              border: `1px solid ${THEME.teal}33`,
              display: 'flex'
            }}
          >
            {/* Image */}
            <div style={{
              width: '50%',
              minHeight: 500,
              background: `url(${getProductImage(selectedProduct, 0)}) center/cover`
            }} />
            
            {/* Details */}
            <div style={{ width: '50%', padding: 40 }}>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  color: THEME.white,
                  fontSize: '1.2em'
                }}
              >✕</button>
              
              <span style={{ 
                background: THEME.teal, 
                color: THEME.dark, 
                padding: '4px 16px', 
                borderRadius: 20,
                fontSize: '0.85em',
                fontWeight: 600
              }}>
                {selectedProduct.category}
              </span>
              
              <h2 style={{ color: THEME.white, fontSize: '2em', margin: '16px 0' }}>
                {selectedProduct.name}
              </h2>
              
              <p style={{ color: THEME.gray, lineHeight: 1.6, marginBottom: 20 }}>
                {selectedProduct.description || 'Premium quality product from our curated collection. Designed for modern living with attention to detail and craftsmanship.'}
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 16, 
                marginBottom: 24,
                padding: 20,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 12
              }}>
                {selectedProduct.sku && (
                  <div>
                    <p style={{ color: THEME.gray, margin: 0, fontSize: '0.85em' }}>SKU</p>
                    <p style={{ color: THEME.white, margin: '4px 0 0', fontWeight: 600 }}>{selectedProduct.sku}</p>
                  </div>
                )}
                {selectedProduct.materials && (
                  <div>
                    <p style={{ color: THEME.gray, margin: 0, fontSize: '0.85em' }}>Materials</p>
                    <p style={{ color: THEME.white, margin: '4px 0 0', fontWeight: 600 }}>{selectedProduct.materials}</p>
                  </div>
                )}
                {selectedProduct.dimensions && (
                  <div>
                    <p style={{ color: THEME.gray, margin: 0, fontSize: '0.85em' }}>Dimensions</p>
                    <p style={{ color: THEME.white, margin: '4px 0 0', fontWeight: 600 }}>{selectedProduct.dimensions}</p>
                  </div>
                )}
                {selectedProduct.warranty && (
                  <div>
                    <p style={{ color: THEME.gray, margin: 0, fontSize: '0.85em' }}>Warranty</p>
                    <p style={{ color: THEME.white, margin: '4px 0 0', fontWeight: 600 }}>{selectedProduct.warranty}</p>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <span style={{ color: THEME.gold, fontSize: '2.5em', fontWeight: 700 }}>
                  ${selectedProduct.price.toFixed(2)}
                </span>
                <span style={{ color: '#666', textDecoration: 'line-through', fontSize: '1.2em' }}>
                  ${(selectedProduct.price * 1.2).toFixed(2)}
                </span>
                <span style={{ background: '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: 4, fontSize: '0.85em' }}>
                  20% OFF
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{
                  flex: 1,
                  padding: '16px 32px',
                  background: `linear-gradient(135deg, ${THEME.teal}, ${THEME.purple})`,
                  border: 'none',
                  borderRadius: 12,
                  color: THEME.white,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1.1em'
                }}>
                  🛒 Add to Cart
                </button>
                <button style={{
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: `1px solid ${THEME.teal}44`,
                  borderRadius: 12,
                  color: THEME.white,
                  cursor: 'pointer',
                  fontSize: '1.2em'
                }}>
                  ♡
                </button>
              </div>
              
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,212,170,0.1)', borderRadius: 12, border: `1px solid ${THEME.teal}33` }}>
                <p style={{ margin: 0, color: THEME.teal, fontSize: '0.9em' }}>
                  ✓ Free shipping on orders over $100<br/>
                  ✓ 30-day return policy<br/>
                  ✓ Vectorized for instant search
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
