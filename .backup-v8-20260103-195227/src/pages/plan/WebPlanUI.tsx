import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SkipForward } from 'lucide-react';
import highlightTick from '../../assets/images/highlight-tick.svg';
import tickIcon from '../../assets/images/tick-icon.svg';
import standardPlan from '../../assets/images/mobile/stardand-plan.svg';
import premiumPlan from '../../assets/images/mobile/premium-plan.svg';
import basicPlan from '../../assets/images/mobile/basic-plan.svg';
import successPlan from '../../assets/images/mobile/success-plan.svg';
import ServiceSection from '../Home/DesktopServiceSectionUI';
import WhatWeOfferSection from '../Home/WhatWeOfferSection';
        
interface PlanFeature {
  reports?: boolean;
  support?: string;
  listings?: string;
  discounts?: boolean;
  consultation?: string;
}

interface PlanType {
  name: string;
  price: number;
  currency: string;
  duration_days: number;
  description: string;
  features: PlanFeature;
}

interface PlanData {
  annually: PlanType[];
  monthly: PlanType[];
}

interface WebPlanUIProps {
  plan: PlanData;
  selectedPlan: any | null;
  setSelectedPlan: (plan: any) => void;
  onChoosePlan: () => void;
  subscription: any | null;
}

const WebPlanUI = ({ plan, selectedPlan, setSelectedPlan, onChoosePlan, subscription }: WebPlanUIProps) => {
    const { t } = useTranslation();
    const [billingCycle, setBillingCycle] = useState<'annually' | 'monthly'>('annually');
    const [planList, setPlanList] = useState<any>([]);

    useEffect(() => {
        const key = billingCycle === 'annually' ? 'annually' : 'monthly';
        if (plan && plan[key]) {
            setPlanList(plan[key]);
        }
    }, [plan, billingCycle]);

    return (
        <div className="min-h-screen bg-white font-sans">
            <main className="container mx-auto mb-10 mt-5 text-center relative w-full">
                {/* Skip link at top right */}
                {!subscription && <button
                    onClick={() => window.location.href = "/"}
                    className="absolute top-0 right-0 flex items-center bg-[#F3F6F7] hover:bg-[#e5e8ea] text-black font-medium text-base px-5 py-2 rounded-xl shadow-none border-none transition-colors"
                    style={{ zIndex: 10 }}
                >
                    <SkipForward size={24} className="mr-2" />
                    {t('plan.skip')}
                </button>}

                {/* Centered title and subtitle */}
                <div className="flex flex-col items-center mb-2 ">
                {!subscription && <>
                <img
                    src={successPlan}
                    alt="Plan Header"
                    className="w-[200px] h-auto"
                    style={{ marginTop: '20px', marginBottom: '5x' }}
                  />
                  <h1
                    className="text-2xl font-bold text-center"
                    style={{
                      background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {t('plan.title')}
                  </h1> </>}
                  <p className=" text-center mt-1 mb-2" style={{fontSize: '12px'}}>
                    {t('plan.subtitle')}  
                  </p>
                  <h2 className="text-0.5xl font-bold mb-2 text-center text-primary-color">{subscription ? t('plan.update_subscription') : t('plan.heading')}</h2>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="relative flex items-center bg-white p-1">
                        <button
                            onClick={() => setBillingCycle('annually')}
                            className={`px-6 py-2 text-sm font-medium transition-colors ${billingCycle === 'annually' ? 'bg-[#F5EC9B33] text-primary-color' : 'text-gray-600'}`}
                        >
                            {t('plan.annual')}
                        </button>
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-[#F5EC9B33] text-primary-color' : 'text-gray-600'}`}
                        >
                            {t('plan.monthly')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {planList.map((plan : any, index : any) => {
                        const isSelected = selectedPlan && plan.plan_id && selectedPlan.plan_id === plan.plan_id;
                        const isSubscribed = subscription && subscription.plan_id && subscription.plan_id === plan.plan_id;
                        let planImage = basicPlan;
                        if (index === 1) planImage = standardPlan;
                        if (index === 3) planImage = premiumPlan;
                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    if(!isSubscribed){
                                        setSelectedPlan(plan);
                                    }
                                }}
                                className={`rounded-2xl shadow-xl flex flex-col cursor-pointer transition-all mb-4 h-full justify-between
                                    ${isSelected ? 'bg-gradient-to-b from-[#004236] to-[#007E67] text-white scale-105' : isSubscribed ? 'bg-[#FBF8E5] text-black opacity-60' : 'bg-[#FDFBEB] text-black'}
                                `}
                                style={{ minHeight: 380, borderColor: isSelected ? 'transparent' : 'transparent' }}
                            >
                                <div className="flex flex-col items-center p-4">
                                    <img src={planImage} alt={plan.name} className="w-10 h-10 mb-2" />
                                    <h3 className={`text-2xl font-bold mt-2 ${isSelected ? 'text-white' : 'text-primary-color'}`} style={{fontSize: '18px'}}>{plan.name}</h3>
                                    <p className="mb-2 text-xs text-gray-500">
                                        {Array.isArray(plan.features) 
                                            ? plan.features.length 
                                            : typeof plan.features === 'object' && plan.features !== null 
                                                ? Object.entries(plan.features).length 
                                                : 1} features
                                    </p>
                                    <hr className={`w-full my-2 ${isSelected ? 'border-[#F5EC9B]' : 'border-[#F5EC9B]'}`} />
                                    <p className="text-3xl font-bold mb-2" style={isSelected ? {
                                        background: 'linear-gradient(90deg, #BFA14A 0%, #F5EC9B 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                    } : { color: '#007E67' }}>
                                        {plan.currency} {plan.price} 
                                    </p>
                                    <p className={`mb-2 mt-2 text-xs ${isSelected ? 'text-white' : 'text-black'}`}>{plan.duration_text}</p>
                                    <hr className={`w-full my-1 ${isSelected ? 'border-[#F5EC9B]' : 'border-[#F5EC9B]'}`} />

                                    <ul className="space-y-2 text-left w-full mb-0 mt-2">
                                        {Array.isArray(plan.features_details) ? (
                                            plan.features_details.map((value: any, idx: number) => (
                                                <li key={idx} className="flex items-center">
                                                    {isSelected ? (
                                                        <img src={highlightTick} alt="tick" className="mr-2" />
                                                    ) : (
                                                        <img src={tickIcon} alt="tick" className="mr-2" />
                                                    )}
                                                    <span className="capitalize">{value}</span>
                                                </li>
                                            ))
                                        ) : typeof plan.features === 'object' && plan.features !== null ? (
                                            Object.entries(plan.features).map(([key, value]: [string, any], idx: number) => (
                                                <li key={idx} className="flex items-center">
                                                    {isSelected ? (
                                                        <img src={highlightTick} alt="tick" className="mr-2" />
                                                    ) : (
                                                        <img src={tickIcon} alt="tick" className="mr-2" />
                                                    )}
                                                    <span className="capitalize">{key}: {value}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="flex items-center">
                                                {isSelected ? (
                                                    <img src={highlightTick} alt="tick" className="mr-2" />
                                                ) : (
                                                    <img src={tickIcon} alt="tick" className="mr-2" />
                                                )}
                                                <span className="capitalize">{plan.features}</span>
                                            </li>
                                        )}
                                    </ul>
                                    <div className="space-y-2 text-left w-full mb-0 mt-4">
                                    <button
                                        className={`w-full py-3 rounded-lg font-bold transition-all
                                            ${isSelected
                                                ? 'bg-white text-[#BFA14A] border-2'
                                                : 'form-submit-button'}
                                        `}
                                        disabled={!isSelected}
                                        onClick={e => { e.stopPropagation(); onChoosePlan(); }}
                                    >
                                        {t('plan.choose_button')}
                                    </button>
                                </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
            <WhatWeOfferSection />
            {/* <ServiceSection /> */}
        </div>
    );
};

export default WebPlanUI; 