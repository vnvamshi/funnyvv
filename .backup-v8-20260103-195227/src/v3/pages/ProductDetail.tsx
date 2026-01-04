import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18nV3 from '../i18n';
import V3Header from '../components/V3Header';
import V3Footer from '../components/V3Footer';
import type { ApiModel } from '../types/catalog';
import { getDisplayName, getDisplayPrice } from '../utils/catalogDisplay';
import view360Icon from '../../assets/images/v3.2/360-view-big-icon.png';

const ProductDetailContent = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation() as { state?: { model?: ApiModel } };
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'supplier' | 'reviews'>('description');
  const [model, setModel] = useState<ApiModel | null>(location.state?.model ?? null);
  const [loading, setLoading] = useState(!location.state?.model);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL as string | undefined;

  useEffect(() => {
    if (model || !baseUrl || !productId) return;

    const fetchModel = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${baseUrl}/models`, {
          headers: { accept: 'application/json' },
        });
        if (!res.ok) {
          throw new Error('Failed to load product details');
        }
        const json = await res.json();
        const found = (json.models as ApiModel[]).find((m) => m.model_id === productId);
        if (!found) {
          setError('Product not found');
        } else {
          setModel(found);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    void fetchModel();
  }, [baseUrl, model, productId]);

  const getImageUrl = (m: ApiModel) => {
    if (!baseUrl) return m.thumbnail_url || m.image_file_url || '';
    if (m.image_file_url) return `${baseUrl}${m.image_file_url}`;
    if (m.thumbnail_url && m.thumbnail_url.startsWith('http')) return m.thumbnail_url;
    return m.thumbnail_url || '';
  };

  if (!baseUrl) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h1>
          <p className="text-gray-600 mb-6">Products API base URL is not configured.</p>
          <button
            onClick={() => navigate('/v3/product-catalog')}
            className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (!model || error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/v3/product-catalog')}
            className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(model);
  const displayPrice = getDisplayPrice(model);

  const handleQuantityChange = (change: number) => {
    const next = quantity + change;
    if (next >= 1) {
      setQuantity(next);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <V3Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-gray-700">Home</a></li>
            <li>/</li>
            <li><a href="/v3/product-catalog" className="hover:text-gray-700">Products</a></li>
            <li>/</li>
            <li className="text-gray-900">{displayName}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Section - Product Images */}
          <div className="sticky top-8 self-start">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Product Image */}
              <div className="flex-1 order-1 lg:order-2 relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(model)}
                    alt={model.model_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 360 View Button */}
                <div className="absolute left-3 bottom-3 z-10">
                  <div
                    className="rounded-md p-[1.5px]"
                    style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }}
                  >
                    <button
                      className="flex items-center gap-2 text-[12px] md:text-[13px] text-white px-3 py-1.5 rounded-[6px] hover:opacity-95 transition"
                      style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                      onClick={() => navigate(`/v3/product-360-view/${productId}`)}
                    >
                      <img src={view360Icon} alt="360 View" className="w-4 h-4" />
                      <span>360 View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Product Information (mostly static, with dynamic bits) */}
          <div className="space-y-6">
            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900">
              {displayName}
            </h1>
            <p className="text-gray-500 text-sm">
              Model ID: {model.model_id}
            </p>
            <p className="text-gray-500 text-sm">
              Category: {model.details_category || 'Furniture'}
            </p>

            {/* Price & rating */}
            <p className="text-2xl font-semibold text-gray-900">{displayPrice}</p>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">12 Customer Review</span>
            </div>

            {/* Static short description with slight dynamic reference */}
            <p className="text-gray-700 leading-relaxed">
              Experience a premium craftsmanship piece designed for modern interiors. This model{' '}
              <span className="font-semibold">{displayName}</span> brings together elegant lines,
              durable materials and practical proportions, ideal for both homes and showrooms.
            </p>

            {/* Size Selection (static options) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Size</label>
              <div className="flex space-x-2">
                {['S', 'M', 'L'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded transition-all ${
                      selectedSize === size
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection (static palette) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
              <div className="flex space-x-2">
                {[
                  { name: 'Natural', value: '#8B4513' },
                  { name: 'Black', value: '#000000' },
                  { name: 'White', value: '#FFFFFF' },
                ].map((color, index) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(index)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === index
                        ? 'border-gray-900 ring-2 ring-gray-300'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Selector (static behaviour) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 h-8 border border-gray-300 rounded text-center"
                  min={1}
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons (static) */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <div
                  className="rounded-md p-[3px]"
                  style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }}
                >
                  <button
                    onClick={() => console.log('Add to cart click', { model, quantity })}
                    className="w-full flex items-center justify-center gap-2 text-white px-6 py-3 rounded hover:opacity-95 transition"
                    style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                  >
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => console.log('Compare click', model)}
                className="flex-1 gradient-border-mask text-gray-900 px-6 py-3 rounded hover:bg-gray-50 transition-colors"
              >
                + Compare
              </button>
            </div>

            {/* Simple static share options */}
            <div className="pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-900 mb-2">Share</label>
              <div className="flex space-x-3">
                <button className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700">
                  <span className="text-xs font-bold">f</span>
                </button>
                <button className="w-8 h-8 bg-blue-800 text-white rounded flex items-center justify-center hover:bg-blue-900">
                  <span className="text-xs font-bold">in</span>
                </button>
                <button className="w-8 h-8 bg-blue-400 text-white rounded flex items-center justify-center hover:bg-blue-500">
                  <span className="text-xs font-bold">t</span>
                </button>
              </div>
            </div>

            {/* Meta block with dynamic data from API */}
            <div className="pt-6 border-t border-gray-200 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Variant:</span> {model.variant}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Base number:</span> {model.model_base_number}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Submitted by:</span> {model.who_submitted}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Textures:</span> {model.texture_count}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="pt-8">
          <div className="border-t border-gray-200 mb-8"></div>
          <div className="flex justify-center space-x-8 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'description'
                  ? 'text-black font-semibold text-lg'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('additional')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'additional'
                  ? 'text-black font-semibold text-lg'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Additional Information
            </button>
            <button
              onClick={() => setActiveTab('supplier')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'supplier'
                  ? 'text-black font-semibold text-lg'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Seller
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'text-black font-semibold text-lg'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Reviews
            </button>
          </div>

          <div className="prose max-w-none">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>
                  This premium dining solution is designed to be the centerpiece of your living or showcase space.
                  With clean lines and a modern silhouette, model <span className="font-semibold">{displayName}</span>{' '}
                  balances everyday usability with a luxurious presence.
                </p>
                <p>
                  Crafted with attention to proportion and detail, it pairs beautifully with a wide range of chairs,
                  lighting and decor styles. Its surface is easy to maintain while still delivering a high-end,
                  gallery-like look for presentations or client demonstrations.
                </p>
              </div>
            )}

            {activeTab === 'additional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-medium">Model ID:</span> {model.model_id}
                    </li>
                    <li>
                      <span className="font-medium">Category:</span> {model.details_category || 'Dining / Furniture'}
                    </li>
                    <li>
                      <span className="font-medium">Variant:</span> {model.variant}
                    </li>
                    <li>
                      <span className="font-medium">Base number:</span> {model.model_base_number}
                    </li>
                    <li>
                      <span className="font-medium">Textures:</span> {model.texture_count}
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Premium crafted surfaces suitable for close-up renders</li>
                    <li>• Proportions tuned for modern interiors and show flats</li>
                    <li>• Compatible with multiple lighting scenarios and camera angles</li>
                    <li>• Ideal for catalog, VR walk-throughs and marketing visuals</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'supplier' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">VistaView Furniture Supplier</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-4 h-4 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">4.8 (156 reviews)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Est. 1995</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Email:</span>{' '}
                          <a href="mailto:support@vistaview.com" className="text-blue-600 hover:underline">
                            support@vistaview.com
                          </a>
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{' '}
                          <a href="tel:+18001234567" className="text-blue-600 hover:underline">
                            +1 (800) 123-4567
                          </a>
                        </p>
                        <p>
                          <span className="font-medium">Address:</span> 123 Vista Avenue, Design District, CA
                        </p>
                        <p>
                          <span className="font-medium">Website:</span>{' '}
                          <a
                            href="https://vistaview.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            vistaview.com
                          </a>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Premium Dining Tables', 'Marble Furniture', 'Custom Design'].map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-top border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">About VistaView Furniture Supplier</h4>
                    <p className="text-sm text-gray-600">
                      VistaView Furniture Supplier has been partnering with leading interior brands since 1995,
                      specializing in premium dining solutions, custom marble pieces and modern luxury collections.
                      They are known for high-quality craftsmanship, reliable delivery and strong after-sales support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg font-medium">5.0 out of 5</span>
                </div>
                <p className="text-gray-600">Based on 12 customer reviews</p>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="font-semibold mb-1">Excellent build quality</p>
                    <p>
                      “The finish and detailing on this table exceeded expectations. Feels solid and looks premium in
                      our dining area.”
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="font-semibold mb-1">Perfect for modern interiors</p>
                    <p>
                      “Design is minimal yet luxurious. Works perfectly with our contemporary decor and lighting.”
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <V3Footer />
    </div>
  );
};

const ProductDetail = () => {
  return (
    <I18nextProvider i18n={i18nV3}>
      <ProductDetailContent />
    </I18nextProvider>
  );
};

export default ProductDetail;
