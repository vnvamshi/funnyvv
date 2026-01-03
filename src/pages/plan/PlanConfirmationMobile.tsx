import { FaChevronLeft } from "react-icons/fa";
import { Check } from "phosphor-react";
import tickIcon from '../../assets/images/tick-icon.svg';

export default function PlanConfirmationMobile({
  selectedPlan,
  t,
  onSubmit,
  onCancel,
  onChangePlan,
}: any) {
  // Ensure features is always an array and translated
  const features = selectedPlan.features_details;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Top bar */}
      <div className="flex items-center h-14 px-4 mb-2 mt-2">
        <button onClick={onCancel} className="text-primary-color mr-2">
          <FaChevronLeft size={20} />
        </button>
        <span className="text-primary-color font-semibold text-base">
          {t("plan.checkout") || "Checkout"}
        </span>
      </div>
      {/* Confirmation section */}
      <div className="flex flex-col items-center px-4 mb-6">
        <h2 className="text-4xl font-bold text-center leading-tight mb-2 mt-4 text-primary-color">
          {t("plan.confirmAndSubmit") || "Confirm your plan and submit"}
        </h2>
        <p className="text-center mb-5 text-black font-medium text-sm">
          {t("plan.confirmDesc") ||
            "Keep track on your subscription details and get update on the feature upgrade!"}
        </p>
        <button
          onClick={onSubmit}
          className="form-submit-button"
        >
          {t("plan.confirmSubscription") || "Confirm your subscription"}
        </button>
      </div>
      {/* Plan Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm mx-4">
        <div className="mb-1">
          <span className="font-semibold text-base">
            {selectedPlan.name || t("plan.basic") || "Basic"}
          </span>
        </div>
        <div className="mb-3">
          <span className="text-3xl font-bold">
           {selectedPlan.price > 0 ? selectedPlan.currency + " " + selectedPlan.price : t("plan.free") || "FREE"}
          </span>
        </div>
        <ul className="mb-4 space-y-2 line-height-5">
            {features.map((feature: any) => (
                <li key={feature} className="flex items-center text-black text-sm">
                    <img src={tickIcon} alt="tick" className="mr-2" />
                    {feature}
                </li>
            ))}
        </ul>
        <button
          onClick={onChangePlan}
          className="w-full border border-[#007E67]  rounded-lg py-2 font-medium mt-2 mb-1 transition active:bg-gray-50"
        >
          {t("plan.changePlan") || "Change plan"}
        </button>
      </div>
      {/* Bottom bar */}
      <div className="mt-auto px-4 py-3 flex items-center justify-between bg-white shadow-t">
        <div>
          <h1 className="text-secondary-color font-bold text-lg mb-0 text-center">
            {selectedPlan.currency + " " + selectedPlan.price}
          </h1>
          <div className="text-xs text-black mt-0">
            {t("plan.totalPrice") || "Total price"}
          </div>
        </div>
        <button
          onClick={onSubmit}
          className="settings-gradient-btn"
        >
          {t("plan.confirm") || "Confirm"}
        </button>
      </div>
    </div>
  );
}