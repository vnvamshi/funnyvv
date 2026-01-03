import React from "react";
import { ArrowLeft } from "lucide-react";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import tickIcon from '../../assets/images/tick-icon.svg';
import { useTranslation } from "react-i18next";
import successPlan from '../../assets/images/mobile/success-plan.svg';
import ServiceSection from "../Home/DesktopServiceSectionUI";

export default function PlanSubscriptionSuccessDesktop({ t, onBack, onContinue, selectedPlan }: any) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans" >
      {/* Top bar */}
      <div className="flex items-center px-4 md:px-8 py-4 md:py-6" style={{ paddingBottom : '0px' }}>
        <div className="flex-1 text-center text-xl md:text-2xl font-bold text-black w-full">
          {t("plan.confirmTitle") || "Plan confirmation"}
        </div>
      </div>
      {/* Main content */}
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Plan Card */}
          <div className="w-full md:w-1/3 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white flex flex-col justify-between mb-4 md:mb-0">
            <div>
              <h2 className="font-bold text-base md:text-lg mb-2">
                {selectedPlan?.name || t("plan.basic") || "Basic"}
              </h2>
              <div className="text-2xl md:text-3xl font-bold mb-2">
                {selectedPlan?.price > 0 ? selectedPlan?.currency + " " + selectedPlan?.price : t("plan.free") || "FREE"}
              </div>
              <ul className="mb-4 space-y-2">
                {selectedPlan?.features_details && selectedPlan.features_details.map((feature: any, idx: number) => (
                  <li key={idx} className="flex items-center text-black text-sm">
                    <img src={tickIcon} alt="tick" className="mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Confirmation */}
          <div className="flex-1 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white flex flex-col justify-center items-center">
                <div className="relative flex flex-col items-center w-full mb-2">
            
            <img src={successPlan} alt="success" className="" />
          </div>
          {/* Title */}
        <div className="text-center mb-2 mt-2">
          <span
            className="block text-3xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            {"Great, Thanks for the subscription!"}
          </span>
        </div>
        {/* Subtitle */}
        <div className="text-center text-base text-black font-medium mb-8">
          {"Explore your space, your way !"}
        </div>
        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="settings-gradient-btn"
        >
          {"Continue"}
        </button>
          </div>
        </div>
      </div>
      {/* <ServiceSection /> */}
    </div>
    
  );
}