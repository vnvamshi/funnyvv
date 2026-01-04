import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PlanConfirmationDesktop from './PlanConfirmationDesktop';
import PlanConfirmationMobile from './PlanConfirmationMobile';
import useIsMobile from '../../hooks/useIsMobile';
import { useState } from 'react';
import { plans } from '../../data/plans';

export default function SubmitPlanMain() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Now uses 1024px breakpoint
  // For demo: select the first plan by default
  const [selectedPlan, setSelectedPlan] = useState(JSON.parse(localStorage.getItem('selectedPlan') || '{}'));



  // Handlers
  const handleSubmit = () => { navigate('/v3/plan/checkout'); };
  const handleCancel = () => { navigate(-1); };
  const handleChangePlan = () => { navigate('/v3/plan'); };

  const layoutProps = {
    selectedPlan,
    t,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onChangePlan: handleChangePlan,
  };

  return isMobile
    ? <PlanConfirmationMobile {...layoutProps} />
    : <PlanConfirmationDesktop {...layoutProps} />;
} 