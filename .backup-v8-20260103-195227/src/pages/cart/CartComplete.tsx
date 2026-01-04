import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'phosphor-react';
import CartProgress from './components/CartProgress';
import successImg from '../../assets/images/v3/success-img.png';
import vectorIcon from '../../assets/images/v3/Vector.png';
import myOrdersIcon from '../../assets/images/v3/myorders.png';

// Dummy data - replace with real order data
const orderItems = [
  {
    id: 1,
    name: 'Designed Tiles',
    description: 'Pack of 1000 No\'s',
    price: 2500.00,
    image: '/path/to/tiles-image.jpg'
  },
  {
    id: 2,
    name: 'Dining Set -white',
    description: '4 Chairs with white marble table',
    price: 340.00,
    image: '/path/to/dining-image.jpg'
  },
  {
    id: 3,
    name: '3 Seater Sofa - Leather',
    description: 'With two hand pillow',
    price: 560.00,
    image: '/path/to/sofa-image.jpg'
  }
];

export default function CartComplete() {
  const navigate = useNavigate();
  const orderNumber = '5468923455';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative mb-2">
            <button
              onClick={() => navigate('/cart/checkout')}
              className="flex items-center text-gray-600 hover:text-gray-800 bg-[#EFF3F4] px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2">Cart</h1>
            <div className="w-[70px]"></div>
          </div>
          <div className="flex justify-center">
            <CartProgress currentStep={3} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Success Message */}
            <div className="lg:w-1/2 flex flex-col items-center">
              <div className="max-w-md w-full flex flex-col items-center">
                <p className="text-gray-600 mb-6 text-center">Order no. : <span className="text-[#004236]">{orderNumber}</span></p>
                <img src={successImg} alt="Success" className="w-50 h-32 mb-6" />
                <div 
                  className="w-full py-4 px-8 rounded-lg bg-white"
                >
                  <h2 
                    className="text-2xl font-semibold mb-1 text-center"
                    style={{
                      background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Your order placed Successfully
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Side - Order Items */}
            <div className="lg:w-1/2">
              <div className="text-left">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 mb-4 border-b pb-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-6">
                <img src={vectorIcon} alt="" className="w-6 h-6" />
                <p className="text-sm text-[#004236]">
                  Delivery will be done within the estimated time
                  <span className="text-xs block">(It may vary based on location)</span>
                </p>
              </div>

              <button
                onClick={() => navigate('/myorders')}
                className="w-full text-white py-3 rounded-lg mt-6 font-medium flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                }}
              >
                <img src={myOrdersIcon} alt="" className="w-5 h-5" />
                <span>My orders</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 