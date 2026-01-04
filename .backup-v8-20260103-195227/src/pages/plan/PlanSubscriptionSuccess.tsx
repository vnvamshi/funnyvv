import React from "react";
import PlanSubscriptionSuccessDesktop from "./PlanSubscriptionSuccessDesktop";
import PlanSubscriptionSuccessMobile from "./PlanSubscriptionSuccessMobile";
import { useTranslation } from "react-i18next";
import useIsMobile from "../../hooks/useIsMobile";
import { useNavigate } from "react-router-dom";

export default function PlanSubscriptionSuccess({ onBack, onContinue, selectedPlan }: any) {
  const isMobile = useIsMobile(); // Now uses 1024px breakpoint
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Always get selectedPlan from localStorage if not provided
  const plan = selectedPlan || JSON.parse(localStorage.getItem('selectedPlan') || '{}');
  // Provide default handlers if not passed
  // const handleBack = onBack || (() => { navigate('/v3/plan/checkout'); });
  const handleContinue = onContinue || (() => { navigate('/'); });

  if (isMobile) {
    return (
      <PlanSubscriptionSuccessMobile
        t={t}
        // onBack={handleBack} // Removed back button
        onContinue={handleContinue}
        selectedPlan={plan}
      />
    );
  }

  return (
    <PlanSubscriptionSuccessDesktop
      t={t}
      // onBack={handleBack} // Removed back button
      onContinue={handleContinue}
      selectedPlan={plan}
    />
  );
}