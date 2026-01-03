import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'phosphor-react';
import CartProgress from './components/CartProgress';
import paypal from '../../assets/images/paypal.svg';
import razor from '../../assets/images/v3.2/razorpay.png';
import upi from '../../assets/images/upi.svg';
import scan from '../../assets/images/scan.svg';
import paymentTick from '../../assets/images/mobile/payment-tick.svg';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { showGlobalToast } from '../../utils/toast';

const paymentMethods = [
  { id: "paypal", label: "Paypal", icon: paypal },
  { id: "razorpay", label: "Razorpay", icon: razor },
  { id: "upi", label: "UPI Pay", icon: upi },
  { id: "scanpay", label: "Scan & Pay", icon: scan },
];

export default function CartCheckout() {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState("paypal");
  
  // Dummy data - replace with real cart data
  const subtotal = 3400.00;

  const handleMakePayment = async () => {
    if (selectedPayment === 'razorpay') {
      try {
        // amount is in paise for Razorpay (e.g., 3400 -> 340000)
        await openRazorpayCheckout({
          amount: Math.round(subtotal * 100),
          currency: 'INR',
          name: 'VistaView Cart',
          description: 'Order payment',
          notes: { source: 'cart' },
          handler: () => {
            navigate('/cart/complete');
          }
        });
      } catch (e: any) {
        showGlobalToast(e?.message || 'Unable to open Razorpay. Check your key/network.');
      }
      return;
    }
    // Fallback for other methods (existing behavior)
    navigate('/cart/complete');
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
            <CartProgress currentStep={2} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Payment Methods */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Payment method</h2>
              <div className="flex flex-col gap-3">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`flex items-center border rounded-lg px-4 py-3 transition ${
                      selectedPayment === pm.id
                        ? "border-[#007E67] bg-[#F8F9FA] shadow"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center mr-3">
                      <img src={pm.icon} alt={pm.label} className="w-6 h-6 object-contain" />
                    </span>
                    <span className={`flex-1 text-left font-medium ${
                      selectedPayment === pm.id ? "text-gray-800" : "text-gray-600"
                    }`}>
                      {pm.label}
                    </span>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center ml-2 ${
                      selectedPayment === pm.id ? "border-[#17695C]" : "border-gray-300"
                    }`}>
                      {selectedPayment === pm.id && (
                        <img src={paymentTick} alt="Selected" className="w-3 h-3" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Order summary</h2>
              <div className="flex justify-between mb-2">
                <span>Discount</span>
                <span className="text-green-500">-$0.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleMakePayment}
                className="w-full text-white py-3 rounded-lg mt-6 font-medium"
                style={{
                  background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                }}
              >
                Make Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 