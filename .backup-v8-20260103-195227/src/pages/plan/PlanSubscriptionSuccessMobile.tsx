import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import successPlan from '../../assets/images/mobile/success-plan.svg';

export default function PlanSubscriptionSuccessMobile({ t, onBack, onContinue, selectedPlan }: any) {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col justify-center items-center px-4">
      {/* Success Icon */}
      <div className="flex flex-col items-center mb-6">
        <img src={successPlan} alt="success" className="w-[200px] h-[200px] mb-6" />
      </div>
      
      {/* Title */}
      <div className="text-center mb-4">
        <span
          className="block text-3xl font-bold"
          style={{
            background: "linear-gradient(90deg, #BFA14A 0%, #17695C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
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
        className="w-full max-w-md rounded-lg py-3 text-base font-semibold shadow-md bg-gradient-to-b from-[#17695C] to-[#007E67] text-white"
      >
        {"Continue"}
      </button>
    </div>
  );
}