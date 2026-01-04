import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Download, MapPin, Tag } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import V3CartProgress from '../components/V3CartProgress';
import MortgageCalculatorModal from '../components/MortgageCalculatorModal';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { showGlobalToast } from '../../utils/toast';
// Product images
import maven1 from '../../assets/images/The Maven Chair_1.PNG';
import maven2 from '../../assets/images/The Maven Chair_2.PNG';
import sofa1 from '../../assets/images/The Serpentine Modular Sofa_1.PNG';
import sofa2 from '../../assets/images/The Serpentine Modular Sofa_2.PNG';
import apex1 from '../../assets/images/The Apex Geometric Panel.PNG';
import apex2 from '../../assets/images/The Apex Geometric Panel_2.PNG';

// Cart items aligned with Shopping cart SKUs
const cartItems = [
  { id: 1, productId: 'CH_MAVEN_GRY_1', name: 'The Maven Accent Chair 1', price: 399.00, mrp: 449.00, vendor: 'VistaView', warranty: '1 yr warranty', extendedWarranty: { years: 2, price: 25 }, image: maven1 },
  { id: 2, productId: 'CH_MAVEN_GRY_2', name: 'The Maven Accent Chair 2', price: 399.00, mrp: 449.00, vendor: 'VistaView', warranty: '1 yr warranty', extendedWarranty: { years: 2, price: 25 }, image: maven2 },
  { id: 3, productId: 'SOFA_SERP_BLU_1', name: 'The Serpentine Modular Sofa (5pc) 1', price: 4199.00, mrp: 4599.00, vendor: 'VistaView', warranty: '1 yr warranty', extendedWarranty: { years: 2, price: 100 }, image: sofa1 },
  { id: 4, productId: 'SOFA_SERP_BLU_2', name: 'The Serpentine Modular Sofa (5pc) 2', price: 4199.00, mrp: 4599.00, vendor: 'VistaView', warranty: '1 yr warranty', extendedWarranty: { years: 2, price: 100 }, image: sofa2 },
  { id: 5, productId: 'DECO_APEX_GOLD_1', name: 'The Apex Geometric Panel 1', price: 549.00, mrp: 599.00, vendor: 'VistaView', warranty: '1 yr warranty', extendedWarranty: { years: 2, price: 35 }, image: apex1 },
  { id: 6, productId: 'DECO_APEX_GOLD_2', name: 'The Apex Geometric Panel 2', price: 549.00, mrp: 599.00, vendor: 'VistaView', warranty: '1 yr warranty', extendedWarranty: { years: 2, price: 35 }, image: apex2 }
];

export default function V3CartCheckout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPayment, setSelectedPayment] = useState("paypal");
  const [selectedLoan, setSelectedLoan] = useState("vistaview");
  const [isMortgageModalOpen, setIsMortgageModalOpen] = useState(false);
  
  // State variables - same as shopping cart
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    cartItems.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
  );
  const [couponCode, setCouponCode] = useState('');
  const [selectedWarranty, setSelectedWarranty] = useState<{ [key: number]: { years: number; price: number } }>({});
  
  // Calculations - same as shopping cart
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (quantities[item.id] || 1)), 0);
  const warrantyTotal = Object.values(selectedWarranty).reduce((sum, warranty) => sum + warranty.price, 0);
  const discount = 0.00; // You can add discount logic here
  const total = subtotal + warrantyTotal - discount;

  const greenGradientTextStyle: React.CSSProperties = {
    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent'
  };

  const goldGradientStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent'
  };

  const paymentMethods = [
    { id: "paypal", label: "Paypal", icon: "P" },
    { id: "razorpay", label: "Razorpay", icon: "R" },
    { id: "stripe", label: "Stripe", icon: "S" },
    { id: "apple", label: "Apple Pay", icon: "A" },
    { id: "upi", label: "UPI Pay", icon: "U" },
  ];

  const banks = [
    "J.P.Morgan", "BANK OF AMERICA", "cíti", "WELLS FARGO", 
    "usbank", "Goldman Sachs", "J.P.Morgan", "BANK OF AMERICA", "cíti"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative mb-2">
            <button
              onClick={() => navigate('/v3/cart')}
              className="flex items-center text-gray-600 hover:text-gray-800 bg-[#EFF3F4] px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2" style={greenGradientTextStyle}>
              Confirm Details
            </h1>
            <div className="w-[70px]"></div>
          </div>
          <div className="flex justify-center">
            <V3CartProgress currentStep={2} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Confirm Details - Single Card */}
          <div className="lg:col-span-2">
            <div className="gradient-border-mask bg-white rounded-2xl shadow-sm p-6">
              
              {/* Property Information */}
              <div className="mb-8">
                <h2 
                  className="text-lg font-medium mb-4 text-left"
                  style={{ color: 'rgba(0, 66, 54, 1)' }}
                >
                  Confirm Details
              </h2>
              
                {/* Three Column Layout */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Column 1 - Map Thumbnail, Name and Address in Single Line */}
                  <div className="flex items-center space-x-4">
                    {/* Map Thumbnail */}
                    <div className="w-32 h-20 rounded-lg overflow-hidden relative">
                      <img 
                        src="/assets/images/v3.2/map-address.png" 
                        alt="Property Location Map" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <MapPin className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                    
                    {/* Name and Address */}
                    <div className="text-left">
                      <h3 
                        className="font-bold mb-1"
                        style={{ color: 'rgba(0, 66, 54, 1)' }}
                      >
                        Henry Moore,
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: 'rgba(0, 66, 54, 1)' }}
                      >
                        821, Moore St, Brentwood, Tennese
                      </p>
                    </div>
                  </div>
                  
                  {/* Column 2 - Plot Number and Square Footage */}
                  <div className="flex flex-col justify-center">
                    <p 
                      className="font-bold mb-1"
                      style={{ color: 'rgba(0, 66, 54, 1)' }}
                    >
                      Plot no. 821
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgba(0, 66, 54, 1)' }}
                    >
                      3200 Sq. Ft.
                    </p>
                  </div>
                  
                  {/* Column 3 - Action Buttons in Single Row */}
                  <div className="flex flex-row justify-center items-center space-x-3">
                    <button 
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                      style={{ 
                        borderColor: 'rgba(0, 66, 54, 1)',
                        color: 'rgba(0, 66, 54, 1)'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center space-x-2"
                      style={{
                        background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                      }}
                    >
                      <Download className="w-4 h-4" />
                      <span>See Model</span>
                    </button>
                  </div>
                </div>
                </div>

              {/* Vista View Loan */}
              <div className="mb-8">
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'rgba(208, 242, 235, 0.7)' }}
                >
                   <div className="grid grid-cols-12 gap-6">
                     {/* Column 1 - Icon and Loan Name */}
                     <div className="col-span-4 flex items-center space-x-3">
                       <div className="w-8 h-8 rounded flex items-center justify-center">
                         <img 
                           src="/assets/images/v3.2/vtour.png" 
                           alt="Vista View Icon" 
                           className="w-full h-full object-contain"
                  />
                </div>
                       <div className="text-left">
                         <h3 
                           className="font-bold text-black"
                         >
                           Vista View Loan
                         </h3>
                         <p 
                           className="text-xs text-black"
                         >
                           Maximum 12% Interest
                         </p>
                       </div>
                     </div>
                     
                     {/* Column 2 - Loan Details */}
                     <div className="col-span-5 flex flex-col justify-center">
                       <p 
                         className="text-sm mb-1"
                         style={{ color: 'rgba(0, 66, 54, 1)' }}
                       >
                         Monthly payment: $ 3,300 | Total Value $6,50,000 for 5 Years
                       </p>
                       <p 
                         className="text-sm text-red-600 font-semibold"
                       >
                         Save upto $ 10,000
                       </p>
                 </div>
                     
                     {/* Column 3 - Action Buttons */}
                     <div className="col-span-3 flex flex-col justify-center space-y-2">
                       <button 
                         onClick={() => setIsMortgageModalOpen(true)}
                         className="px-2 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                         style={{ 
                           borderColor: 'rgba(0, 66, 54, 1)',
                           color: 'rgba(0, 66, 54, 1)',
                           backgroundColor: 'transparent'
                         }}
                       >
                         Mortgage Calculator
                       </button>
                       <button 
                         className="px-2 py-2 rounded-lg text-xs font-medium"
                         style={{
                           background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                           color: 'rgba(0, 66, 54, 1)'
                         }}
                       >
                         Apply Now
                       </button>
                 </div>
              </div>
            </div>

            {/* Bank Comparison Section */}
            <div className="mt-8 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Wells Fargo */}
                    <div className="p-4 rounded-lg h-32" style={{ backgroundColor: 'rgba(255, 249, 199, 1)' }}>
                      <div className="flex h-full">
                        <div className="flex flex-col items-center justify-center mr-4">
                          <div className="w-16 h-16 flex items-center justify-center">
                            <img 
                              src="/assets/images/v3.2/b1.png" 
                              alt="Wells Fargo" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-3 flex flex-col justify-center">
                          <div className="border-b border-gray-300 pb-2">
                            <p className="text-xs text-gray-700 text-left">
                              <span className="font-bold">$3,500 x 5yr</span> | Total Value $6,90,000 | Interest $90,000 (15%)
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 text-left">
                              <span className="font-bold">$2,900 x 10yr</span> | Total Value $7,20,000 | Interest $1,20,000 (20%)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bank of America */}
                    <div className="p-4 rounded-lg h-32" style={{ backgroundColor: 'rgba(93, 217, 255, 0.2)' }}>
                      <div className="flex h-full">
                        <div className="flex flex-col items-center justify-center mr-4">
                          <div className="w-16 h-16 flex items-center justify-center">
                            <img 
                              src="/assets/images/v3.2/b2.png" 
                              alt="Bank of America" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-3 flex flex-col justify-center">
                          <div className="border-b border-gray-300 pb-2">
                            <p className="text-xs text-gray-700 text-left">
                              <span className="font-bold">$3,500 x 5yr</span> | Total Value $6,90,000 | Interest $90,000 (15%)
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 text-left">
                              <span className="font-bold">$2,900 x 10yr</span> | Total Value $7,20,000 | Interest $1,20,000 (20%)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <button className="text-sm text-green-600 hover:text-green-800 underline">
                      View more
                    </button>
                  </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-left text-black">
                Payment Method
              </h2>
              
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                      selectedPayment === method.id
                        ? 'bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      border: '1px solid rgba(0, 66, 54, 1)'
                    }}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {method.id === 'paypal' && (
                            <img 
                              src="/assets/images/v3.2/paypal.png" 
                              alt="PayPal" 
                              className="w-full h-full object-contain"
                            />
                          )}
                          {method.id === 'stripe' && (
                            <img 
                              src="/assets/images/v3.2/stripe.png" 
                              alt="Stripe" 
                              className="w-full h-full object-contain"
                            />
                          )}
                          {method.id === 'razorpay' && (
                            <img 
                              src="/assets/images/v3.2/razorpay.png" 
                              alt="Razorpay" 
                              className="w-full h-full object-contain"
                            />
                          )}
                          {method.id === 'apple' && (
                            <img 
                              src="/assets/images/v3.2/apay.png" 
                              alt="Apple Pay" 
                              className="w-full h-full object-contain"
                            />
                          )}
                          {method.id === 'upi' && (
                            <img 
                              src="/assets/images/v3.2/upi.png" 
                              alt="UPI Pay" 
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{method.label}</span>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

              {/* VistaView Bank Payment Gateways */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-left text-black">
                  Vistaview Bank Payment Gateway's
                </h2>
                
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((bankNumber, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      style={{
                        border: '1px solid rgba(0, 66, 54, 1)'
                      }}
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img 
                          src={`/assets/images/v3.2/b${bankNumber}.png`}
                          alt={`Bank ${bankNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-left">
                  <button className="text-sm text-green-600 hover:text-green-800 underline">
                    View more
                  </button>
                </div>
              </div>
            </div>
          </div>
              
          {/* Right Column - Cart Summary - Same as Shopping Cart */}
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
                  onClick={async () => {
                    if (selectedPayment === 'razorpay') {
                      try {
                        await openRazorpayCheckout({
                          amount: Math.round(total * 100),
                          currency: 'INR',
                          name: 'VistaView Cart',
                          description: 'Order payment',
                          notes: { source: 'v3-cart' },
                          handler: () => navigate('/v3/cart/complete')
                        });
                      } catch (e: any) {
                        showGlobalToast(e?.message || 'Unable to open Razorpay. Check your key/network.');
                      }
                      return;
                    }
                    navigate('/v3/cart/complete');
                  }}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 text-white hover:scale-105"
                  style={{
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mortgage Calculator Modal */}
      <MortgageCalculatorModal
        isOpen={isMortgageModalOpen}
        onClose={() => setIsMortgageModalOpen(false)}
        propertyPrice={600000}
      />
    </div>
  );
}