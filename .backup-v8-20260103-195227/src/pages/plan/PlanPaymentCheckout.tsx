import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import { ArrowLeft, Check } from "phosphor-react";
import PlanPaymentCheckoutMobile from "./PlanPaymentCheckoutMobile";
import { useTranslation } from "react-i18next";
import paymentTick from '../../assets/images/mobile/payment-tick.svg';
import tickIcon from '../../assets/images/tick-icon.svg';
import scan from '../../assets/images/scan.svg';
import upi from '../../assets/images/upi.svg';
import razor from '../../assets/images/razor.svg';
import paypal from '../../assets/images/paypal.svg';
import discount from '../../assets/images/discount.svg';
import ServiceSection from "../Home/DesktopServiceSectionUI";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { showGlobalToast } from "../../utils/toast";
import { ToastContext } from "../../App";
import useIsMobile from "../../hooks/useIsMobile";

// Dummy data for payment methods and plan, replace with real data/props as needed
const paymentMethods = [
  { id: "paypal", label: "PayPal", icon: paypal },
  { id: "razorpay", label: "Razor Pay", icon: razor },
  { id: "upi", label: "UPI Pay", icon: upi },
  { id: "scanpay", label: "Scan & Pay", icon: scan },
];

const plan = {
  name: "Standard",
  price: "$200",
  period: "billed annually",
  features: [
    "Lorem ipsum dolor sit",
    "Consectetur adipiscing",
    "Ut enim ad minim veniam",
    "Quis nostrud exercitation",
  ],
  discount: "-$0.00",
  subtotal: "$200.00",
  total: "$200.00",
  featuresCount: 8,
};

export default function PlanPaymentCheckout() {
  const [selectedPayment, setSelectedPayment] = useState("paypal");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useContext(ToastContext);
  
  // Fallback to global toast if context is not available
  const showToastMessage = (message: string, duration?: number) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message, duration);
    } else {
      showGlobalToast(message, duration);
    }
  };

  useEffect(() => { 
    const selectedPlan = localStorage.getItem('selectedPlan');
    if (selectedPlan) {
      setSelectedPlan(JSON.parse(selectedPlan));
    }
  }, []);

  
  // Handler for payment confirmation button
  const handleConfirm =  async () => {
    setLoading(true);
    try {
      const response = await api.post('/common/subscribe/user/', {
        user_id: user?.user_id || user?.id, 
        subscription_id: selectedPlan?.plan_id, 
        payment_method: selectedPayment, 
        amount_paid: selectedPlan?.price,
        notes: "Payment for " + selectedPlan?.name + " plan", 
        transaction_id: "1234567890" 
      });
      if(response.data.status_code === 200){
        showToastMessage(response.data.message, 3000);
        navigate("/v3/plan/success");
      }else{
        // handle error
      }
    } catch (error: any) {
      showToastMessage(error.response.data.message, 3000);
    }
    setLoading(false);
  };

  // Handler for back button
  const handleBack = () => {
    navigate("/v3/plan/submit");
  };

  if (isMobile) {
    return (
      <PlanPaymentCheckoutMobile
        t={t}
        onBack={handleBack}
        onConfirm={handleConfirm}
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
        plan={selectedPlan}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col md:block">
      {/* Top bar */}
      <div className="flex items-center px-4 md:px-8 py-4 md:py-6 bg-white md:bg-transparent shadow md:shadow-none">
      <button
         onClick={() => navigate("/v3/plan/submit")}
          className="flex items-center bg-gray-200 font-medium text-base px-3 py-1 rounded hover:bg-gray-100 transition"
        >
         <ArrowLeft size={24} className="mr-2" />
          {t("plan.back") || "Back"}
        </button>
        <div className="flex-1 text-center text-xl md:text-2xl font-bold text-black md:-ml-12">
          {t("plan.confirmTitle") || "Plan confirmation"}
        </div>
      </div>
      {/* Main content */}
      <div className="container mx-auto px-2 md:px-8 pb-8 md:pb-12 flex-1 flex flex-col md:flex-row gap-0 md:gap-6">
        {/* Plan Card */}
        <div className="w-full md:w-1/3 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white flex flex-col justify-between mb-4 md:mb-0 mt-4 md:mt-0">
          <div>
            <h2 className="font-bold text-base md:text-lg mb-2">{selectedPlan?.name}</h2>
            <div className="flex items-end mb-2">
              <span className="text-2xl md:text-3xl font-bold">{selectedPlan?.price > 0 ? selectedPlan?.currency + " " + selectedPlan?.price : t("plan.free") || "FREE"}</span>
              {selectedPlan?.price > 0 && <span className="ml-2 text-xs md:text-base font-bold">/ {selectedPlan?.duration_text}</span>}
            </div>
            <ul className="mb-4 space-y-2">
              {selectedPlan?.features_details.map((feature: any) => (
                <li key={feature} className="flex items-center text-black text-sm">
                  <img src={tickIcon} alt="tick" className="mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="border border-[#007E67]  rounded-lg py-2 font-medium transition active:bg-gray-50 w-full mt-2"
            onClick={() => navigate("/v3/plan")}
          >
            {t('plan.changePlan') || "Change plan"}
          </button>
        </div>
        {/* Payment & Summary */}
        <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-6 mt-0">
          {/* Payment Method */}
          <div className="w-full md:w-1/2 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white mb-4 md:mb-0 md:mr-0 flex flex-col">
            <div className="font-semibold mb-4 text-base md:text-lg">{t("plan.paymentMethod") || "Payment method"}</div>
            <div className="flex flex-col gap-3">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id)}
                  className={`flex items-center border rounded-lg px-4 py-3 transition ${
                    selectedPayment === pm.id
                      ? "border-[#007E67] bg-[#F8F9FA] shadow"
                      : "border-gray-300 bg-white text-gray-500"
                  }`}
                >
                  <span className="w-6 h-6 flex items-center justify-center mr-3">
                    <img src={pm.icon} alt={pm.label} className="w-6 h-6 object-contain" />
                  </span>
                  <span className={`flex-1 text-left font-medium ${selectedPayment === pm.id ? "text-gray-800" : "text-gray-200"}`}>
                    {pm.label}
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ml-2 ${
                      selectedPayment === pm.id ? "border-[#17695C]" : "border-gray-300"
                    }`}
                  >
                    {selectedPayment === pm.id && (
                       <span className=""><img src={paymentTick} width={100} height={100} alt="tick"  className="" /></span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Order Summary */}
          <div className="w-full md:w-1/2 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white flex flex-col justify-between">
            <div className="flex flex-col  h-full">
              <div className="font-semibold mb-4 text-base md:text-lg">{t("plan.orderSummary") || "Order summary"}</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 flex items-center gap-2"><img src={discount} alt="discount" className="w-4 h-4" />{t("plan.discount") || "Discount"}</span>
                <span className="text-[#1CA085] font-medium">0.00</span>
              </div>
              <hr className="my-2" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">{t("plan.subtotal") || "Subtotal"}</span>
                <span className="font-medium">{selectedPlan?.currency + " " + selectedPlan?.price}</span>
              </div>
              <hr className="my-2" />
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">{t("plan.total") || "Total"}</span>
                <span className="font-semibold">{selectedPlan?.currency + " " + selectedPlan?.price}</span>
              </div>
             
            </div>
            <button
              className="form-submit-button"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (<>Processing...</>) : (t("plan.makePayment") || "Make Payment")}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile bottom bar */}
      <div className="fixed md:hidden left-0 right-0 bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <span className="text-[#17695C] font-bold text-lg">{selectedPlan?.currency + " " + selectedPlan?.price}</span>
          <div className="text-xs text-gray-500">{t("plan.totalPrice") || "Total price"}</div>
        </div>
        <button
          className="bg-[#17695C] hover:bg-[#1CA085] text-white font-semibold rounded-md px-8 py-2 shadow active:scale-95 transition ml-2"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (<>Processing...</>) : (t("plan.makePayment") || "Make Payment")}
        </button>
      </div>
      {/* <ServiceSection /> */}
    </div>
  );
}