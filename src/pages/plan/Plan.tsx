import { useEffect, useState } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import api from '../../utils/api';
import MobilePlanUI from './MobilePlanUI';
import WebPlanUI from './WebPlanUI';
import { useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import useIsTab from '../../hooks/useIsTab';
import V3Header from '../../v3/components/V3Header';
import V3Footer from '../../v3/components/V3Footer';
import { I18nextProvider } from 'react-i18next';
import i18nV3 from '../../v3/i18n';

// Skeleton loader for mobile plan page
const PlanSkeletonMobile = () => (
  <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-6">
    <div className="h-10 w-1/2 bg-gray-200 rounded mb-8 animate-pulse mx-auto" />
    <div className="space-y-6 w-full max-w-md">
      {[1,2,3].map(idx => (
        <div key={idx} className="rounded-2xl p-6 shadow-lg mb-4 bg-gray-100 animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="flex-1">
              <div className="h-6 w-1/2 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-1/3 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="h-8 w-1/3 bg-gray-300 rounded mb-4" />
          <div className="h-4 w-2/3 bg-gray-300 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-300 rounded mb-2" />
          <div className="h-10 w-full bg-gray-300 rounded mt-4" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton loader for desktop plan page
const PlanSkeletonDesktop = () => (
  <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-10">
    <div className="h-10 w-1/3 bg-gray-200 rounded mb-8 animate-pulse mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mx-auto">
      {[1,2,3].map(idx => (
        <div key={idx} className="rounded-2xl shadow-xl flex flex-col mb-4 h-full bg-gray-100 animate-pulse p-6">
          <div className="flex flex-col items-center mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full mb-2" />
            <div className="h-6 w-1/2 bg-gray-300 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-300 rounded mb-2" />
          </div>
          <div className="h-8 w-1/3 bg-gray-300 rounded mb-4 mx-auto" />
          <div className="h-4 w-2/3 bg-gray-300 rounded mb-2 mx-auto" />
          <div className="h-4 w-1/2 bg-gray-300 rounded mb-2 mx-auto" />
          <div className="h-10 w-full bg-gray-300 rounded mt-4" />
        </div>
      ))}
    </div>
  </div>
);

const Plan = () => {
    const { width } = useWindowSize();
    const isMobile = useIsMobile();
    const isTablet = useIsTab();
    const [plan, setPlan] = useState<any>(null);
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<any>(null);
    useEffect(() => {
        getPlan();
        getSubscription();
    }, []);

    const getSubscription = async () => {
        const response = await api.get('/common/profile-subscription/');
        if(response.data.status_code === 200){
            setSubscription(response.data.data?.subscription);
        }
    }

    useEffect(() => {
        console.log(plan);
        if(plan){
            const selectedPlan = localStorage.getItem('selectedPlan');
            if (selectedPlan) {
                let parsedSelectedPlan: any;
                try {
                    parsedSelectedPlan = JSON.parse(selectedPlan);
                } catch (e) {
                    parsedSelectedPlan = null;
                }
                if (parsedSelectedPlan && parsedSelectedPlan.plan_id) {
                    plan.annually.forEach((value: any) => {
                        if (value.plan_id === parsedSelectedPlan.plan_id) {
                            localStorage.setItem('selectedPlan', JSON.stringify(value));
                            setSelectedPlan(value);
                        }   
                    });
                    plan.monthly.forEach((value: any) => {
                        if (value.plan_id === parsedSelectedPlan.plan_id) {
                            localStorage.setItem('selectedPlan', JSON.stringify(value));
                            setSelectedPlan(value);
                        }   
                    });
                }
            }
        }
    }, [plan]);

    const getPlan = async () => {
        try {
            const response = await api.post('/common/plans/user/', {user_type: user?.user_type, user_id: user?.id});
            if(response.data.status_code === 200){
                console.log(response.data.status_code);
                setPlan(response.data.data);
                
            }else{
                setPlan([]);
            }
        } catch (error: any) {
            setPlan([]);
        }
    }

    const handleChoosePlan = () => {
        if (selectedPlan !== null) {
            // Save the selected plan object to localStorage
            localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
            navigate('/plan/submit');
        }
    };

    const planUIProps = {
        plan,
        selectedPlan,
        setSelectedPlan,
        onChoosePlan: handleChoosePlan,
        subscription,
    };

    const Content = () => {
      if (plan === null) {
        return (isMobile || isTablet) ? <PlanSkeletonMobile /> : <PlanSkeletonDesktop />;
      }
      return isMobile || isTablet ? <MobilePlanUI {...planUIProps} /> : <WebPlanUI {...planUIProps} />;
    };

    const isAgent = user?.user_type === 'agent';

    return (
      <I18nextProvider i18n={i18nV3}>
        <div className="min-h-screen flex flex-col">
          {!isAgent && <V3Header />}
          <main className={`flex-1 ${!isAgent ? 'pt-16' : ''}`}>
            <Content />
          </main>
          <V3Footer />
        </div>
      </I18nextProvider>
    );
}

export default Plan;