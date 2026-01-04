import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MySubscriptionDesktop from './MySubscriptionDesktop';
import MySubscriptionMobile from './MySubscriptionMobile';
import useIsMobile from '../../hooks/useIsMobile';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function MySubscriptions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Now uses 1024px breakpoint
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any>(null);

  useEffect(() => {
    getSubscriptions();
  }, []);


  const getSubscriptions = async () => {
    const response = await api.get('/common/profile-subscription/');
    if(response?.data?.status_code === 200){
        if(response?.data?.data?.subscription){
            setSubscriptions(response?.data?.data);
            localStorage.removeItem('selectedPlan'); // Clear selectedPlan after visiting MySubscriptions
        }else{
            navigate('/plan');
        }
    }
  }

  // Handlers
  const handleCancel = () => { navigate(-1); };
  const handleChangePlan = () => { navigate('/plan'); };

  const layoutProps = {
    subscriptions,
    t,
    onCancel: handleCancel,
    onChangePlan: handleChangePlan,
    // TODO: Replace with subscription-specific props/UI
  };

  // TODO: Replace PlanConfirmationDesktop/Mobile with MySubscriptionsDesktop/Mobile when available
  return isMobile
    ? <MySubscriptionMobile {...layoutProps} />
    : <MySubscriptionDesktop  {...layoutProps} />;  
} 