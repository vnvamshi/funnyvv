import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'phosphor-react';
import CartProgress from './components/CartProgress';

// Dummy data for cart items - replace with real data
const cartItems = [
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

export default function CartShopping() {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    cartItems.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
  );

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (quantities[item.id] || 1)), 0);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative mb-2">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center text-gray-600 hover:text-gray-800 bg-[#EFF3F4] px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2">Cart</h1>
            <div className="w-[70px]"></div>
          </div>
          <div className="flex justify-center">
            <CartProgress currentStep={1} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg shadow p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-4">Product</th>
                    <th className="text-center pb-4">Quantity</th>
                    <th className="text-right pb-4">Price</th>
                    <th className="text-right pb-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-4">
                        <div className="flex items-center">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          <div className="ml-4">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-sm text-red-500 mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="w-8 h-8 border rounded-l flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-12 h-8 border-t border-b flex items-center justify-center">
                            {quantities[item.id] || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="w-8 h-8 border rounded-r flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        ${(item.price * (quantities[item.id] || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Cart summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>$ {subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/cart/checkout')}
                className="w-full text-white py-3 rounded-lg mt-6 font-medium"
                style={{
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 