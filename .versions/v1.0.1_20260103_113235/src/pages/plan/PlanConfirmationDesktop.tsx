import { ArrowLeft } from "lucide-react";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import tickIcon from '../../assets/images/tick-icon.svg';
import { useTranslation } from "react-i18next";
import ServiceSection from "../Home/DesktopServiceSectionUI";
export default function PlanConfirmationDesktop({ selectedPlan, t, onSubmit, onCancel, onChangePlan } : any) {
  // Ensure features is always an array and translated
  const navigate = useNavigate();
  const features = selectedPlan.features_details;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans" >
      {/* Top bar */}
      <div className="flex items-center px-4 md:px-8 py-4 md:py-6" style={{ paddingBottom : '0px' }}>
        <button
         onClick={() => navigate("/plan")}
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
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Plan Card */}
          <div className="w-full md:w-1/3 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white flex flex-col justify-between mb-4 md:mb-0">
            <div>
              <h2 className="font-bold text-base md:text-lg mb-2">
                {selectedPlan.name || t("plan.basic") || "Basic"}
              </h2>
              <div className="text-2xl md:text-3xl font-bold mb-2">
               { selectedPlan.price > 0 ? selectedPlan.currency + " " + selectedPlan.price : t("plan.free") || "FREE"}
              </div>
              <ul className="mb-4 space-y-2">
                {features.map((feature: any) => (
                  <li  className="flex items-center text-black text-sm">
                  <img src={tickIcon} alt="tick" className="mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={onChangePlan}
              className="border border-[#007E67] rounded-lg py-2 font-medium transition active:bg-gray-50 w-full mt-2"
            >
              {t('plan.changePlan') || "Change plan"}
            </button>
          </div>
          {/* Confirmation */}
          <div className="flex-1 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white flex flex-col justify-center items-center">
            <h4 className="text-xl md:text-2xl font-bold mb-2 text-[#17695C] text-center">
              {t('plan.confirmAndSubmit') || "Confirm your plan and submit"}
            </h4>
            <span  className="mb-6 text-center text-black font-medium font-bold" style={{ fontSize : '12px' }}>
              {t('plan.confirmDesc') ||
                "Keep track on your subscription details and get update on the feature upgrade!"}
            </span>
            <div className="flex flex-col md:flex-row gap-4 justify-center w-full">
              <button
                onClick={onSubmit}
                className="form-submit-button "
              >
                {t('plan.confirmSubscription') || "Confirm your subscription"}
              </button>
              <button
                onClick={onCancel}
                className="border border-[#007E67]  rounded-lg py-3 px-8 font-medium transition md:w-1/2 bg-white"
              >
                {t('plan.cancel') || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <ServiceSection /> */}
    </div>
  );
}