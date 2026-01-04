import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import cartIcon from '../../assets/images/v3.2/cart-icon.png';
import view360Icon from '../../assets/images/v3.2/360-view-big-icon.png';
import type { ApiModel } from '../types/catalog';
import { getDisplayName, getDisplayPrice } from '../utils/catalogDisplay';

interface ProductGridProps {
  products: ApiModel[];
  getImageUrl: (product: ApiModel) => string;
}

const ProductCard: React.FC<{ product: ApiModel; index: number; getImageUrl: (product: ApiModel) => string }> = ({
  product,
  index,
  getImageUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const displayName = getDisplayName(product);
  const displayPrice = getDisplayPrice(product);

  const handleCardClick = () => {
    navigate(`/v3/product-detail/${product.model_id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartProduct = {
      id: product.model_id,
      name: displayName,
      price: Number(displayPrice.replace(/[^0-9]/g, '')) || 0,
      image: getImageUrl(product),
      vendor: 'VistaView',
      category: product.details_category || 'Furniture',
    };
    addToCart(cartProduct);
    navigate('/v3/cart');
  };

  const handle360View = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    navigate(`/v3/product-360-view/${product.model_id}`);
  };

  return (
    <div
      className="shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
      style={{ 
        background: 'rgba(244, 245, 247, 1)',
        animationDelay: `${index * 100}ms`,
        minHeight: '400px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={getImageUrl(product)}
          alt={product.model_name}
          className="w-full h-72 object-cover"
        />

        {/* Hover Overlay with Cart + 360 buttons like earlier design */}
        {isHovered && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300"
          >
            <div className="text-center">
              {/* Add to Cart Button */}
              <div className="mb-3 flex justify-center">
                <div
                  className="rounded-md p-[3px] inline-block"
                  style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }}
                >
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 text-[12px] md:text-[13px] text-white px-3 py-1.5 rounded-[6px] hover:opacity-95 transition whitespace-nowrap"
                    style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                  >
                    <img src={cartIcon} alt="Cart" className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>

              {/* 360 View Button */}
              <div className="mb-3 flex justify-center">
                <div
                  className="rounded-md p-[1.5px] inline-block"
                  style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }}
                >
                  <button
                    onClick={handle360View}
                    className="flex items-center gap-2 text-[12px] md:text-[13px] text-white px-3 py-1.5 rounded-[6px] hover:opacity-95 transition whitespace-nowrap"
                    style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                  >
                    <img src={view360Icon} alt="360 View" className="w-4 h-4" />
                    <span>360 View</span>
                  </button>
                </div>
              </div>

              {/* Category info only */}
              <div className="flex flex-col items-center space-y-1 text-white text-sm">
                <span className="font-semibold">{product.details_category}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1">{displayName}</h3>
        <p className="text-gray-600 text-sm mb-1">{product.model_id}</p>
        <p className="text-gray-900 font-semibold text-sm">{displayPrice}</p>
      </div>
    </div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, getImageUrl }) => {
  const { t } = useTranslation();

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.model_id} product={product} index={index} getImageUrl={getImageUrl} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
