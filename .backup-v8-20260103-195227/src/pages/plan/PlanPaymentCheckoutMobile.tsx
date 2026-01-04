import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import paymentTick from '../../assets/images/mobile/payment-tick.svg';
import tickIcon from '../../assets/images/tick-icon.svg';
import scan from '../../assets/images/scan.svg';
import upi from '../../assets/images/upi.svg';
import razor from '../../assets/images/razor.svg';
import paypal from '../../assets/images/paypal.svg';
import discount from '../../assets/images/discount.svg';
import basicPlan from '../../assets/images/mobile/basic-plan.svg';
import standardPlan from '../../assets/images/mobile/stardand-plan.svg';
import premiumPlan from '../../assets/images/mobile/premium-plan.svg';
import { useNavigate } from "react-router-dom";

// Payment methods data
const paymentMethods = [
  { id: "paypal", label: "PayPal", icon: paypal },
  { id: "razorpay", label: "Razor Pay", icon: razor },
  { id: "upi", label: "UPI Pay", icon: upi },
  { id: "scanpay", label: "Scan & Pay", icon: scan },
];

export default function PlanPaymentCheckoutMobile({ t = (s: string) => s, onConfirm, onBack, plan, loading }: any) {
  const [selectedPayment, setSelectedPayment] = useState("paypal");
  const navigate = useNavigate();
  
  // Get plan icon based on plan name
  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('basic')) return basicPlan;
    if (name.includes('standard')) return standardPlan;
    if (name.includes('premium')) return premiumPlan;
    return standardPlan; // default
  };
  
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24">
      {/* Top bar */}
      <div className="flex items-center px-4 py-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 font-medium text-base px-2 py-1 rounded hover:bg-gray-100 transition"
        >
          <FaChevronLeft size={20} className="mr-2" />
        </button>
        <span className="text-[#17695C] font-semibold text-lg ml-2">{t("plan.checkout") || "Checkout"}</span>
      </div>

      {/* Payment Methods */}
      <div className="px-4 pt-4">
        <div className="font-semibold mb-3 text-base text-gray-800">{t("plan.paymentMethods") || "Payment Methods"}</div>
        <div className="flex flex-col gap-3">
          {paymentMethods.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setSelectedPayment(pm.id)}
              className={`flex items-center border rounded-lg px-4 py-3 transition ${
                selectedPayment === pm.id
                  ? "border-[#17695C] bg-white shadow-sm"
                  : "border-gray-300 bg-white"
              }`}
            >
              <span className="w-6 h-6 flex items-center justify-center mr-3">
                <img src={pm.icon} alt={pm.label} className="w-6 h-6 object-contain" />
              </span>
              <span className={`flex-1 text-left font-medium ${selectedPayment === pm.id ? "text-gray-800" : "text-gray-600"}`}>
                {pm.label}
              </span>
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center ml-2 ${
                  selectedPayment === pm.id ? "border-[#17695C]" : "border-gray-300"
                }`}
              >
                {selectedPayment === pm.id && (
                  <img src={paymentTick} alt="tick" className="w-3 h-3" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Plan Card */}
      {plan && (
        <div className="px-4 mt-4">
          <div className="rounded-2xl p-6 shadow-lg bg-[#FDFBEB] border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <img src={getPlanIcon(plan.name)} alt={plan.name + ' plan'} className="w-10 h-10" />
                <div>
                  <h3 className="text-xl font-bold text-[#17695C]">{plan.name}</h3>
                  <p className="mb-2 text-md text-gray-500">{plan?.features_details?.length || 8} features</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold mb-2" style={{ color: '#007E67' }}>
                  {plan?.currency} {plan?.price}
                </p>
                <p className="text-sm text-gray-600">{plan?.duration_text || "Billed Annually"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="px-4 mt-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="font-bold mb-4 text-base text-gray-800">{t("plan.orderSummary") || "Order summary"}</div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 flex items-center gap-2">
              <img src={discount} alt="discount" className="w-4 h-4" />
              {t("plan.discount") || "Discount"}
            </span>
            <span className="text-[#1CA085] font-medium">-$0.00</span>
          </div>
          <hr className="my-2" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">{t("plan.subtotal") || "Subtotal"}</span>
            <span className="font-medium">{plan?.currency + " " + plan?.price + ".00"}</span>
          </div>
          <hr className="my-2" />
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">{t("plan.total") || "Total"}</span>
            <span className="font-semibold">{plan?.currency + " " + plan?.price + ".00"}</span>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <span className="text-[#17695C] font-bold text-lg">{plan?.currency + " " + plan?.price}</span>
          <div className="text-xs text-gray-500">{t("plan.totalPrice") || "Total price"}</div>
        </div>
        <button
          className="bg-[#17695C] hover:bg-[#1CA085] text-white font-semibold rounded-lg px-8 py-3 shadow active:scale-95 transition"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (<>Processing...</>) : (t("plan.makePayment") || "Make Payment")}
        </button>
      </div>
    </div>
  );
}