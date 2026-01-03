import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Star, PaperPlaneTilt, ArrowRight, ArrowLeft } from 'phosphor-react';
import standardPlan from '../../assets/images/mobile/stardand-plan.svg';
import premiumPlan from '../../assets/images/mobile/premium-plan.svg';
import basicPlan from '../../assets/images/mobile/basic-plan.svg';
import start from '../../assets/images/mobile/start.svg';
import line from '../../assets/images/mobile/line.svg';
import planSuccess from '../../assets/images/mobile/plan-success.svg';
import planHeader from '../../assets/images/plan-header.svg';
import highlightTick from '../../assets/images/highlight-tick.svg';
import tickIcon from '../../assets/images/tick-icon.svg';
import successPlan from '../../assets/images/mobile/success-plan.svg';
import { Link } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import realEstateIcon from '../../assets/images/realestate.svg';
import securityCamIcon from '../../assets/images/security-cam.svg';
import interiorDesignIcon from '../../assets/images/interior-design.svg';
import home1 from '../../assets/images/mobile/home1.svg';
import HomeOuterGreen from '../../assets/images/homeoutergreen.svg';

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

interface MobilePlanUIProps {
  plan: PlanData;
  selectedPlan: any | null;
  setSelectedPlan: (plan: any) => void;
  onChoosePlan: () => void;
  subscription: any | null;
}

const MobilePlanUI = ({ plan, selectedPlan, setSelectedPlan, onChoosePlan, subscription }: MobilePlanUIProps) => {
    const { t } = useTranslation();
    const [billingCycle, setBillingCycle] = useState<'annually' | 'monthly'>('annually');
    const [planList, setPlanList] = useState<PlanType[]>([]);
    const [showFeaturesSheet, setShowFeaturesSheet] = useState(false);
    const [featuresForSheet, setFeaturesForSheet] = useState<string[]>([]);

    useEffect(() => {
        const key = billingCycle === 'annually' ? 'annually' : 'monthly';
        if (plan && plan[key]) {
            setPlanList(plan[key]);
        }
    }, [plan, billingCycle]);

    useEffect(() => {
        const planStr = localStorage.getItem("selectedPlan");
        if (planStr) {
          setSelectedPlan(JSON.parse(planStr));
        }
      }, []);

    return (
        <div className="min-h-screen bg-white font-sans p-6">
            <div className="flex items-center justify-between">
                <Link to="/" className="text-gray-600">
                    <FaChevronLeft size={20} />
                </Link>
            </div>
            <main>
                <div className="flex flex-col items-center">
                  {!subscription && <>
                  <img
                    src={successPlan}
                    alt="Plan Header"
                    className="w-[200px] h-auto"
                    style={{ marginTop: '8px', marginBottom: '-8px' }}
                  />
                  <h3
                    className="text-5xl font-bold text-center"
                    style={{
                        background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}
                  >
                    {t('plan.title')}
                  </h3> </>}
                    <p className=" text-center mt-1 mb-6">
                        {t('plan.subtitle')}
                    </p>
                  
                </div>
                <h2 className="text-3xl font-bold mb-8 text-center text-primary-color">{subscription ? t('plan.update_subscription') : t('plan.heading')}</h2>

                <div className="flex justify-center mb-8">
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

                <div className="space-y-6">
                    {planList.map((plan : any, index : any) => {
                        let planImage = basicPlan;
                        if (index === 1) planImage = standardPlan;
                        if (index === 3) planImage = premiumPlan;
                        const isSelected = selectedPlan && plan.plan_id && selectedPlan.plan_id === plan.plan_id;
                        const isSubscribed = subscription && subscription.plan_id && subscription.plan_id === plan.plan_id;
                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    if(!isSubscribed){
                                        setSelectedPlan(plan);
                                    }   
                                }}
                                className={`rounded-2xl p-6 shadow-lg cursor-pointer transition-all mb-4
                                    ${isSelected ? 'bg-gradient-to-b from-[#004236] to-[#007E67] text-white scale-105' : isSubscribed ? 'bg-[#FBF8E5] text-black opacity-60' : 'bg-[#FDFBEB] text-black'}`}
                                style={{ borderColor: isSelected ? undefined : 'transparent' }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                        <img src={planImage} alt={plan.name + ' plan'} className="w-10 h-10" />
                                        <div>
                                            <h3 className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-primary-color'}`}>{plan.name}</h3>
                                            <p className="mb-2 text-md text-gray-500">{plan.features_details.length} features</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold mb-2" style={isSelected ? {
                                            background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                        } : { color: '#007E67' }}>
                                             {plan.currency} {plan.price}
                                        </p>
                                        <p className="text-sm">{plan.duration_text}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <button
                                        className={`${isSelected ? 'bg-white text-[#BFA14A] border-2' : 'button-plan'} ${isSelected ? '' : 'opacity-50 cursor-not-allowed'} px-6 py-2 rounded-lg font-semibold`}
                                        disabled={!isSelected}
                                        onClick={e => { e.stopPropagation(); onChoosePlan(); }}
                                    >
                                        {t('plan.choose_button')}
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex items-center font-semibold ${isSelected ? 'text-white' : 'text-primary-color'}`}
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setFeaturesForSheet(plan.features_details);
                                            setShowFeaturesSheet(true);
                                        }}
                                    >
                                        {t('plan.view_plan')} <ArrowRight size={20} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
            {/* Bottom Sheet for Features */}
            {showFeaturesSheet && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black bg-opacity-40" onClick={() => setShowFeaturesSheet(false)}>
                    <div className="bg-white rounded-t-2xl p-6 w-full max-h-[60vh] overflow-y-auto shadow-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-primary-color">{t('plan.features') || 'Plan Features'}</h3>
                            <button className="text-2xl text-gray-400" onClick={() => setShowFeaturesSheet(false)}>&times;</button>
                        </div>
                        <ul className="space-y-3">
                            {featuresForSheet.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-black text-base">
                                    <img src={tickIcon} alt="tick" className="mr-2 w-5 h-5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <div className="mt-10">
                <h2 className="text-lg font-semibold mb-4 text-primary-color text-center">What We Offer</h2>
                <div className="flex flex-col gap-3 items-center">
                    <div className="flex flex-row gap-3 w-full justify-center">
                        <div className="flex flex-col items-center bg-[#D0F2EB] rounded-xl py-4 px-6 w-1/2">
                            <img src={home1} alt="Sell Home" className="h-10 mb-2" />
                            <span className="text-[#004236] text-xs font-semibold">Sell Home</span>
                            <button className="mt-2 bg-white px-3 py-1 text-xs rounded-full font-semibold text-[#004236]">Sell Home</button>
                        </div>
                        <div className="flex flex-col items-center bg-[#FBF8E5] rounded-xl py-4 px-6 w-1/2">
                            <img src={HomeOuterGreen} alt="Find Home" className="h-10 mb-2" />
                            <span className="text-[#004236] text-xs font-semibold">Find Home</span>
                            <button className="mt-2 bg-white px-3 py-1 text-xs rounded-full font-semibold text-[#004236]">Find Home</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-10">
                <h2 className="text-lg font-semibold mb-4 text-primary-color text-center">Explore more on Vistaview</h2>
                <div className="flex flex-col gap-3 items-center">
                    <div className="flex flex-row gap-3 w-full justify-center">
                        <div className="flex flex-col items-center bg-[#FFFBEA] rounded-xl py-4 px-6 w-1/3">
                            <img src={realEstateIcon} alt="Real Estate" className="h-10 mb-2" />
                            <span className="text-[#BFA053] text-xs font-semibold">Real Estate</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#FFFBEA] rounded-xl py-4 px-6 w-1/3">
                            <img src={securityCamIcon} alt="Security Camera" className="h-10 mb-2" />
                            <span className="text-[#BFA053] text-xs font-semibold">Security Camera</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#FFFBEA] rounded-xl py-4 px-6 w-1/3">
                            <img src={interiorDesignIcon} alt="Interior Design" className="h-10 mb-2" />
                            <span className="text-[#BFA053] text-xs font-semibold">Interior Design</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobilePlanUI;