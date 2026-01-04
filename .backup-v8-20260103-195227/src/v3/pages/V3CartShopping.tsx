import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, X, Check, Tag, Info, Shield, ShieldCheck } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import V3CartProgress from '../components/V3CartProgress';
// Product images
import maven1 from '../../assets/images/The Maven Chair_1.PNG';
import maven2 from '../../assets/images/The Maven Chair_2.PNG';
import sofa1 from '../../assets/images/The Serpentine Modular Sofa_1.PNG';
import sofa2 from '../../assets/images/The Serpentine Modular Sofa_2.PNG';
import apex1 from '../../assets/images/The Apex Geometric Panel.PNG';
import apex2 from '../../assets/images/The Apex Geometric Panel_2.PNG';

// Cart items sourced from provided SKUs and images
const cartItems = [
  {
    id: 1,
    productId: 'CH_MAVEN_GRY_1',
    name: 'The Maven Accent Chair 1',
    description: '',
    price: 399.00,
    mrp: 449.00,
    vendor: 'VistaView',
    warranty: '1 yr warranty',
    extendedWarranty: { years: 2, price: 25 },
    image: maven1
  },
  {
    id: 2,
    productId: 'CH_MAVEN_GRY_2',
    name: 'The Maven Accent Chair 2',
    description: '',
    price: 399.00,
    mrp: 449.00,
    vendor: 'VistaView',
    warranty: '1 yr warranty',
    extendedWarranty: { years: 2, price: 25 },
    image: maven2
  },
  {
    id: 3,
    productId: 'SOFA_SERP_BLU_1',
    name: 'The Serpentine Modular Sofa (5pc) 1',
    description: '',
    price: 4199.00,
    mrp: 4599.00,
    vendor: 'VistaView',
    warranty: '1 yr warranty',
    extendedWarranty: { years: 2, price: 100 },
    image: sofa1
  },
  {
    id: 4,
    productId: 'SOFA_SERP_BLU_2',
    name: 'The Serpentine Modular Sofa (5pc) 2',
    description: '',
    price: 4199.00,
    mrp: 4599.00,
    vendor: 'VistaView',
    warranty: '1 yr warranty',
    extendedWarranty: { years: 2, price: 100 },
    image: sofa2
  },
  {
    id: 5,
    productId: 'DECO_APEX_GOLD_1',
    name: 'The Apex Geometric Panel 1',
    description: '',
    price: 549.00,
    mrp: 599.00,
    vendor: 'VistaView',
    warranty: '1 yr warranty',
    extendedWarranty: { years: 2, price: 35 },
    image: apex1
  },
  {
    id: 6,
    productId: 'DECO_APEX_GOLD_2',
    name: 'The Apex Geometric Panel 2',
    description: '',
    price: 549.00,
    mrp: 599.00,
    vendor: 'VistaView',
    warranty: '1 yr warranty',
    extendedWarranty: { years: 2, price: 35 },
    image: apex2
  }
];

export default function V3CartShopping() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    cartItems.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
  );
  const [extendedWarranties, setExtendedWarranties] = useState<{ [key: number]: boolean }>({});
  const [couponCode, setCouponCode] = useState('');
  const [isPriceLocked, setIsPriceLocked] = useState(false);
  const [warrantyModalOpen, setWarrantyModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<{ [key: number]: { years: number; price: number } }>({});
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedWarrantyPlan, setSelectedWarrantyPlan] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (quantities[item.id] || 1)), 0);
  const warrantyTotal = Object.values(selectedWarranty).reduce((sum, warranty) => sum + warranty.price, 0);
  const discount = 0; // Will be calculated based on coupon
  const total = subtotal + warrantyTotal - discount;

  const handleQuantityChange = (itemId: number, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change)
    }));
  };

  const handleRemoveItem = (itemId: number) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });
  };

  const handleExtendedWarrantyChange = (itemId: number) => {
    setExtendedWarranties(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleWarrantySelection = (itemId: number, years: number, price: number) => {
    setSelectedWarranty(prev => ({
      ...prev,
      [itemId]: { years, price: price * modalQuantity }
    }));
    setSelectedWarrantyPlan(years);
    setWarrantyModalOpen(false);
  };

  const handleWarrantyPlanSelect = (years: number, price: number) => {
    setSelectedWarrantyPlan(years);
  };

  const handleModalQuantityChange = (change: number) => {
    setModalQuantity(prev => Math.max(1, prev + change));
  };

  const calculateSavings = (item: any) => {
    return Math.round(((item.mrp - item.price) / item.mrp) * 100);
  };

  const greenGradientTextStyle: React.CSSProperties = {
    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative mb-2">
            <button
              onClick={() => navigate('/v3')}
              className="flex items-center text-gray-600 hover:text-gray-800 bg-[#EFF3F4] px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2" style={greenGradientTextStyle}>
              {t('cart.title', 'Shopping Cart')}
            </h1>
            <div className="w-[70px]"></div>
          </div>
          
          {/* Lock Price and Progress Section */}
          <div className="flex items-center justify-between mb-2">
            {/* Lock Price Toggle */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPriceLocked(!isPriceLocked)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isPriceLocked 
                    ? 'border border-green-200' 
                    : 'border border-red-200'
                }`}
                style={isPriceLocked ? {
                  backgroundColor: 'rgba(0, 126, 103, 0.1)'
                } : {
                  backgroundColor: 'rgba(227, 29, 28, 0.1)'
                }}
              >
                <div 
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isPriceLocked 
                      ? 'border-green-600' 
                      : 'border-red-500'
                  }`}
                  style={isPriceLocked ? {
                    backgroundColor: 'rgba(0, 66, 54, 1)'
                  } : {
                    backgroundColor: 'rgba(227, 29, 28, 1)'
                  }}
                >
                  {isPriceLocked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span 
                  className="font-medium"
                  style={isPriceLocked ? {
                    color: 'rgba(0, 66, 54, 1)'
                  } : {
                    color: 'rgba(227, 29, 28, 1)'
                  }}
                >
                  {isPriceLocked ? 'Price Locked' : 'Lock the Price'}
                </span>
                <Info 
                  className="w-4 h-4"
                  style={isPriceLocked ? {
                    color: 'rgba(0, 66, 54, 1)'
                  } : {
                    color: 'rgba(227, 29, 28, 1)'
                  }}
                />
              </button>
            </div>

            {/* Original Progress Component - Centered */}
            <div className="flex justify-center">
              <V3CartProgress currentStep={1} />
            </div>

            {/* Empty space for balance */}
            <div className="w-[200px]"></div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Section with Gradient Border */}
          <div className="lg:col-span-2">
            <div className="gradient-border-mask bg-white p-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b pb-3">
                    <th className="text-left pb-3 text-sm font-semibold text-gray-800 w-[35%]">Product</th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-800 w-[25%] pl-0">Vendor</th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-800 w-[15%]">Quantity</th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-800 w-[12%]">Price</th>
                    <th className="text-right pb-3 text-sm font-semibold text-gray-800 w-[13%]">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const quantity = quantities[item.id] || 1;
                    const itemTotal = item.price * quantity;
                    const savings = calculateSavings(item);
                    
                    return (
                      <tr key={item.id} className="border-b py-4">
                        {/* Product Column */}
                        <td className="py-3 text-left">
                          <div className="flex items-start space-x-2">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 text-left">
                              <h3 className="text-sm font-semibold text-gray-900 text-left">{item.name}</h3>
                              <p className="text-xs text-gray-500 mt-1 text-left">{item.description}</p>
                              <div className="flex space-x-3 mt-1 text-left">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-500 text-xs hover:text-red-700 flex items-center"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Remove
                                </button>
                                {item.id !== 3 && (
                                  <button className="text-green-600 text-xs hover:text-green-700 underline">
                                    Save for Later
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vendor Column */}
                        <td className="py-3 pl-0 text-left">
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900 text-left">{item.vendor}</p>
                            <button className="text-blue-600 text-xs hover:text-blue-800 mt-1 underline text-left">
                              See more details
                            </button>
                            <div className="mt-1 text-left">
                              <span 
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: 'rgba(255, 224, 194, 1)',
                                  color: 'rgba(255, 96, 4, 1)'
                                }}
                              >
                                <img 
                                  src="/assets/images/v3.2/warranty-icon.png" 
                                  alt="Warranty" 
                                  className="w-3 h-3 mr-1"
                                />
                                {item.warranty}
                              </span>
                            </div>
                            <div className="mt-1 text-left">
                              <button 
                                onClick={() => { setWarrantyModalOpen(true); setSelectedProduct(item); }}
                                className="text-[10px] text-left underline hover:no-underline" 
                                style={{ color: 'rgba(85, 96, 249, 1)' }}
                              >
                                Add {item.extendedWarranty.years} yr extended warranty at ${item.extendedWarranty.price}
                              </button>
                              {selectedWarranty[item.id] && (
                                <div className="mt-1 text-[10px] text-green-600">
                                  ✓ {selectedWarranty[item.id].years} year warranty added (+${selectedWarranty[item.id].price})
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Quantity Column */}
                        <td className="py-3 text-left">
                          <div className="flex items-center">
                            <div className="flex items-center border border-gray-300 rounded bg-white">
                              <button
                                onClick={() => handleQuantityChange(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l"
                              >
                                <Minus className="w-3 h-3 text-black" />
                              </button>
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantities(prev => ({ ...prev, [item.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                                className="w-12 text-center px-2 py-2 text-xs border-0 focus:outline-none"
                                min="1"
                              />
                              <button
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r"
                              >
                                <Plus className="w-3 h-3 text-black" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-1 text-[10px] flex items-center whitespace-nowrap underline" style={{ color: 'rgba(56, 203, 137, 1)' }}>
                            <img 
                              src="/assets/images/v3.2/insurance-icon.png" 
                              alt="Insurance" 
                              className="w-3 h-3 mr-1"
                            />
                            Insurance starts from $100/yr
                          </div>
                        </td>

                        {/* Price Column */}
                        <td className="py-3 text-left">
                          <p className="text-sm font-semibold text-gray-900">${item.price.toLocaleString()}.00</p>
                        </td>

                        {/* Subtotal Column */}
                        <td className="py-3 text-right">
                          <p className="text-sm font-semibold text-gray-900 text-right">${itemTotal.toLocaleString()}.00</p>
                          <p className="text-xs text-gray-500 line-through mt-1 text-right">
                            MRP $ {item.mrp.toLocaleString()}
                          </p>
                          <p className="text-xs mt-1 text-right" style={{ color: 'rgba(227, 29, 28, 1)' }}>
                            Save {savings}%
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

           {/* Cart Summary - Right Section with Gradient Border */}
           <div className="lg:col-span-1">
             <div className="sticky top-24">
               <div className="gradient-border-mask bg-white p-6 w-80 ml-0">
               <h3 className="text-xl font-bold text-gray-900 mb-6 text-left">Cart summary</h3>
               
               {/* Coupon Section */}
               <div className="mb-4">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center">
                     <Tag className="w-4 h-4 text-gray-500 mr-2" />
                     <span className="text-sm text-gray-700">Coupon</span>
                   </div>
                   <input
                     type="text"
                     placeholder="Enter coupon"
                     value={couponCode}
                     onChange={(e) => setCouponCode(e.target.value)}
                     className="border border-green-300 rounded px-3 py-1 text-sm w-32"
                   />
                 </div>
               </div>

               {/* Discount Section */}
               <div className="mb-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <Tag className="w-4 h-4 text-gray-500 mr-2" />
                     <span className="text-sm text-gray-700">Discount</span>
                   </div>
                   <span className="text-sm text-green-600">-${discount.toFixed(2)}</span>
                 </div>
               </div>

               {/* Subtotal Section */}
               <div className="mb-4">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-700">Subtotal</span>
                   <span className="text-sm font-bold text-gray-900">${subtotal.toLocaleString()}.00</span>
                 </div>
               </div>

               {/* Warranty Section */}
               {warrantyTotal > 0 && (
                 <div className="mb-4">
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-700">
                       Extended Warranty ({Object.values(selectedWarranty)[0]?.years} year{Object.values(selectedWarranty)[0]?.years > 1 ? 's' : ''})
                     </span>
                     <span className="text-sm font-bold text-gray-900">+${warrantyTotal.toLocaleString()}.00</span>
                   </div>
                 </div>
               )}

               {/* Total Section */}
               <div className="mb-6">
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-bold text-gray-900">Total</span>
                   <span className="text-sm font-bold text-gray-900">${total.toLocaleString()}.00</span>
                 </div>
               </div>

               {/* Checkout Button */}
               <button
                 onClick={() => navigate('/v3/cart/checkout')}
                 disabled={!isPriceLocked}
                 className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 ${
                   isPriceLocked 
                     ? 'text-white hover:scale-105' 
                     : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                 }`}
                 style={isPriceLocked ? {
                   background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                 } : {}}
               >
                 Checkout
               </button>

               {/* Note */}
               <p className={`text-xs mt-4 text-left ${
                 isPriceLocked ? 'text-green-600' : 'text-red-600'
               }`}>
                 {isPriceLocked 
                   ? 'Price locked! You can now proceed to checkout.' 
                   : 'Note: Lock the price and product to checkout'
                 }
               </p>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Warranty Modal */}
      {warrantyModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: 'linear-gradient(111.83deg, rgba(0, 66, 54, 0.7) 11.73%, rgba(0, 126, 103, 0.7) 96.61%)'
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{
                background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
              }}
            >
              <div className="flex items-center space-x-3">
                <img 
                  src="/assets/images/v3.2/vv-warranty.png" 
                  alt="Warranty Icon" 
                  className="w-8 h-8"
                />
                <h2 
                  className="text-xl font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  VistaView Warranty
                </h2>
              </div>
              <button
                onClick={() => setWarrantyModalOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center space-x-3 mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <img 
                  src={selectedProduct?.image || maven1} 
                  alt="Product" 
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedProduct?.name || 'Product'}</h3>
                  <p className="text-sm text-gray-600">{selectedProduct?.productId || ''}</p>
                </div>
                
                {/* Quantity Selector and Warranty */}
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center border border-gray-300 rounded bg-white">
                    <button 
                      onClick={() => handleModalQuantityChange(-1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l"
                    >
                      <Minus className="w-3 h-3 text-black" />
                    </button>
                    <input
                      type="number"
                      value={modalQuantity}
                      onChange={(e) => setModalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center px-2 py-2 text-xs border-0 focus:outline-none"
                      min="1"
                    />
                    <button 
                      onClick={() => handleModalQuantityChange(1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r"
                    >
                      <Plus className="w-3 h-3 text-black" />
                    </button>
                  </div>
                  
                  {/* Extended Warranty */}
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-blue-600 text-xs hover:text-blue-800 underline"
                      onClick={() => setWarrantyModalOpen(true)}
                    >
                      2 yr extended warranty
                    </button>
                    <span className="text-xs text-gray-500">${25 * modalQuantity}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${(((selectedProduct?.price || 0) * modalQuantity) + (25 * modalQuantity)).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${25 * modalQuantity} + ${((selectedProduct?.price || 0) * modalQuantity).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Warranty Service Intro */}
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/assets/images/v3.2/vv-warranty.png" 
                  alt="VistaView Warranty" 
                  className="w-12 h-12"
                />
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: 'rgba(0, 66, 54, 1)' }}
                  >
                    VistaView Extended warranty service
                  </h3>
                  <p className="text-xs text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 
                  className="text-xl font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  VistaView offers the extended warranty for protecting your product
                </h2>
              </div>

              {/* Warranty Selection Layout */}
              <div className="flex lg:flex-row gap-2 mb-6">
                {/* Left Section - Warranty Covers */}
                {/* <div className="lg:w-1/2"> */}
                  <div className="bg-white p-6 rounded-lg">
                    <h3 
                      className="text-lg font-semibold mb-6"
                      style={{ color: 'rgba(0, 66, 54, 1)' }}
                    >
                      Warranty covers!
                    </h3>
                    <div className="space-y-4">
                      {[
                        "Lorem ipsum dolor sit",
                        "Consectetur adipiscing",
                        "Ut enim ad minim veniam",
                        "Quis nostrud exercitation"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                            }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  {/* </div> */}
                </div>

                {/* Right Section - Warranty Plans */}
                {/* <div className="lg:w-1/2"> */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { years: 1, price: 15, serviceCharge: 2, total: 17, recommended: false, savings: 0 },
                      { years: 2, price: 25, serviceCharge: 2, total: 27, recommended: true, savings: 5 },
                      { years: 3, price: 38, serviceCharge: 2, total: 40, recommended: false, savings: 7 }
                    ].map((option, index) => {
                      const isSelected = selectedWarrantyPlan === option.years;
                      const isRecommended = option.recommended;
                      
                      return (
                        <div
                          key={index}
                          className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all shadow-lg ${
                            isSelected
                              ? 'border-yellow-500'
                              : isRecommended
                              ? 'border-yellow-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            background: isSelected 
                              ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                              : 'rgba(253, 251, 235, 1)',
                            borderBottom: isSelected ? '5px solid' : undefined,
                            borderImageSource: isSelected ? 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)' : undefined,
                            borderImageSlice: isSelected ? 1 : undefined
                          }}
                          onClick={() => handleWarrantyPlanSelect(option.years, option.total)}
                        >
                          {isRecommended && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded font-semibold">
                              Recommended
                            </div>
                          )}
                          <div className="text-center">
                            <div className="mb-2">
                              <h4 
                                className="font-bold text-base mb-1"
                                style={{
                                  background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text',
                                  color: 'transparent'
                                }}
                              >
                                + {option.years} year
                              </h4>
                              <p 
                                className="text-xs font-medium"
                                style={{
                                  color: isSelected ? 'white' : 'rgba(0, 66, 54, 1)'
                                }}
                              >
                                Extended warranty
                              </p>
                            </div>
                            <div className="space-y-2">
                              <button 
                                className="px-3 py-1.5 rounded-lg text-xs font-bold w-full"
                                style={isSelected ? {
                                  background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                                  color: 'rgba(0, 66, 54, 1)'
                                } : {
                                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                                  color: 'white'
                                }}
                              >
                                ${option.price}
                              </button>
                              <div 
                                className="text-xs font-medium"
                                style={{
                                  color: isSelected ? 'white' : 'rgba(0, 66, 54, 1)'
                                }}
                              >
                                +${option.serviceCharge} for Service charge
                              </div>
                              {option.savings > 0 && (
                                <div 
                                  className="text-xs font-semibold"
                                  style={{
                                    color: isSelected ? 'rgba(0, 255, 115, 1)' : 'rgba(227, 29, 28, 1)'
                                  }}
                                >
                                  Save ${option.savings}!
                                </div>
                              )}
                              <div 
                                className="text-sm font-bold"
                                style={{
                                  color: isSelected ? 'white' : 'rgba(0, 66, 54, 1)'
                                }}
                              >
                                Total : $ {option.total}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                {/* </div> */}
              </div>

              {/* Terms and Add to Cart */}
              <div className="border-t pt-6">
                <div className="flex items-start space-x-2 mb-6">
                  <input type="checkbox" className="mt-1" />
                  <p className="text-sm text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
                <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (selectedWarrantyPlan !== null) {
                          const warrantyOption = [
                            { years: 1, price: 15, serviceCharge: 2, total: 17, recommended: false, savings: 0 },
                            { years: 2, price: 25, serviceCharge: 2, total: 27, recommended: true, savings: 5 },
                            { years: 3, price: 38, serviceCharge: 2, total: 40, recommended: false, savings: 7 }
                          ].find(option => option.years === selectedWarrantyPlan);
                          
                          if (warrantyOption) {
                            setSelectedWarranty({
                              ...selectedWarranty,
                              [1]: { years: warrantyOption.years, price: warrantyOption.total }
                            });
                          }
                          setWarrantyModalOpen(false);
                        }
                      }}
                      disabled={selectedWarrantyPlan === null}
                      className={`px-8 py-3 font-semibold rounded-lg transition-all ${
                        selectedWarrantyPlan !== null 
                          ? 'text-white hover:scale-105' 
                          : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      }`}
                      style={selectedWarrantyPlan !== null ? {
                        background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                      } : {}}
                    >
                      Add to cart
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
