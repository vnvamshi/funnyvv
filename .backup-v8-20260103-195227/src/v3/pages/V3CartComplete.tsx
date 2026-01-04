import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Download, Share } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import V3CartProgress from '../components/V3CartProgress';
import successImg from '../../assets/images/v3.2/success-img.png';
import starIcon from '../../assets/images/v3.2/star.png';
import myOrdersIcon from '../../assets/images/v3.2/myorder.png';
import maven1 from '../../assets/images/The Maven Chair_1.PNG';
import maven2 from '../../assets/images/The Maven Chair_2.PNG';
import sofa1 from '../../assets/images/The Serpentine Modular Sofa_1.PNG';
import sofa2 from '../../assets/images/The Serpentine Modular Sofa_2.PNG';
import apex1 from '../../assets/images/The Apex Geometric Panel.PNG';
import apex2 from '../../assets/images/The Apex Geometric Panel_2.PNG';

// Order summary uses the same SKUs and images as cart
const orderItems = [
  { id: 1, productId: 'CH_MAVEN_GRY_1', name: 'The Maven Accent Chair 1', price: 399.00, quantity: 1, image: maven1 },
  { id: 2, productId: 'CH_MAVEN_GRY_2', name: 'The Maven Accent Chair 2', price: 399.00, quantity: 1, image: maven2 },
  { id: 3, productId: 'SOFA_SERP_BLU_1', name: 'The Serpentine Modular Sofa (5pc) 1', price: 4199.00, quantity: 1, image: sofa1 },
  { id: 4, productId: 'SOFA_SERP_BLU_2', name: 'The Serpentine Modular Sofa (5pc) 2', price: 4199.00, quantity: 1, image: sofa2 },
  { id: 5, productId: 'DECO_APEX_GOLD_1', name: 'The Apex Geometric Panel 1', price: 549.00, quantity: 1, image: apex1 },
  { id: 6, productId: 'DECO_APEX_GOLD_2', name: 'The Apex Geometric Panel 2', price: 549.00, quantity: 1, image: apex2 }
];

const orderNumber = '5468923455';
const orderDate = new Date().toLocaleDateString();
const totalAmount = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

export default function V3CartComplete() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const greenGradientTextStyle: React.CSSProperties = {
    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent'
  };

  const goldGradientTextStyle: React.CSSProperties = {
    backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
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
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2" style={greenGradientTextStyle}>
              {t('cart.orderComplete', 'Order Complete')}
            </h1>
            <div className="w-[70px]"></div>
          </div>
          <div className="flex justify-center">
            <V3CartProgress currentStep={3} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Order Complete Card */}
        <div 
          className="bg-white rounded-2xl p-8"
          style={{
            boxShadow: '0px 32px 48px -48px rgba(18, 18, 18, 0.1)'
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Order Confirmation */}
            <div className="flex flex-col items-center justify-center text-center">
              {/* Order Number */}
              <div className="mb-8">
                <p className="text-lg font-medium text-black">
                  Order no. : {orderNumber}
                </p>
              </div>
              
              {/* Success Image */}
              <div className="mb-6">
                <img 
                  src={successImg} 
                  alt="Order Success" 
                  className="w-64 h-64 object-contain"
                />
              </div>
              
              {/* Success Message */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2" style={goldGradientTextStyle}>
                  Your order placed
                </h2>
                <h3 className="text-3xl font-bold" style={goldGradientTextStyle}>
                  Successfully
                </h3>
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <div className="space-y-0">
                {orderItems.map((item, index) => (
                  <div key={item.id} className="relative">
                    <div className="flex items-center space-x-4 py-4">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-black mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                        <p className="text-lg font-bold text-black">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {/* Separator Line */}
                    {index < orderItems.length - 1 && (
                      <div className="absolute left-0 right-0 h-px bg-gray-200 bottom-0"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Delivery Information */}
              <div className="flex items-center space-x-2 py-4">
                <img src={starIcon} alt="Star" className="w-5 h-5" />
                <p className="text-sm text-teal-600">
                  Delivery will be done within the estimated time (it may vary based on location)
                </p>
              </div>
              
              {/* My Orders Button */}
              <div className="pt-4">
                <button
                  onClick={() => navigate('/v3/orders')}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                  }}
                >
                  <img src={myOrdersIcon} alt="My Orders" className="w-5 h-5" />
                  <span>My orders</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
