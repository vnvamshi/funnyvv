import { FaChevronLeft } from "react-icons/fa";
import { Check } from "phosphor-react";
import tickIcon from '../../assets/images/tick-icon.svg';
import menuIcon from '../../assets/images/menu-icon.svg';

import MobileBuyerMenu from "../../components/MobileBuyerMenu";
import MobileAgentMenu from "../../components/MobileAgentMenu";
import { useState } from "react";
import { useAuth, useAuthData } from "../../contexts/AuthContext";

// Skeleton loader for mobile subscription page
const MySubscriptionSkeletonMobile = () => (
  <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center">
    <div className="w-full max-w-md">
      <div className="h-10 w-1/2 bg-gray-200 rounded mb-8 animate-pulse mx-auto" />
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm mx-4 animate-pulse">
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-1/3 bg-gray-200 rounded mb-4" />
        <div className="space-y-2 mb-4">
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-full bg-gray-200 rounded" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm mx-4 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-6 w-full bg-gray-200 rounded" />
          <div className="h-6 w-2/3 bg-gray-200 rounded" />
          <div className="h-6 w-1/2 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export default function MySubscriptionMobile({
  subscriptions,
  t,  
  onCancel,
  onChangePlan,
}: any) {
  // Ensure features is always an array and translated
  const features = subscriptions?.subscription?.features_details || [];
  const selectedPlan = subscriptions?.subscription;
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { isLoggedIn } = useAuth();
  const isAgent = useAuthData().user?.user_type === 'agent';
  const isBuyer = useAuthData().user?.user_type === 'buyer';

  if (!subscriptions) {
    return <MySubscriptionSkeletonMobile />;
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Mobile Header Bar */}
      <div className="w-full mx-auto">
        <div className="bg-gradient-to-r from-[#17695C] to-[#007E67] px-4 pt-2 pb-4 rounded-t-lg relative">
         
          {/* App Bar */}
          <div className="flex items-center mt-2">
            <button onClick={() => setMenuOpen(true)}>
              <img src={menuIcon} alt="Menu" className="w-6 h-6 text-white" />
            </button>   
            <span className="text-white font-semibold text-lg ml-5">{t("plan.mySubscriptions") || "My Subscriptions"}</span>
          </div>
        </div>
      </div>
     
      {/* Plan Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm mx-4">
        <div className="mb-1">
          <span className="font-semibold text-base">
            {selectedPlan?.name || t("plan.basic") || "Basic"}
          </span>
        </div>
        <div className="mb-3">
          <span className="text-3xl font-bold">
           {selectedPlan?.price > 0 ? selectedPlan?.currency + " " + selectedPlan?.price : t("plan.free") || "FREE"}
          </span>
        </div>
        <ul className="mb-4 space-y-2 line-height-5">
            {features && features.map((feature: any) => (
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
          {t("plan.update_subscription") || "Upgrade your plan"}
        </button>
      </div>

      {/* History Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm mx-4">
        <h4 className="text-lg font-bold mb-4 text-black text-left w-full">
          {t('plan.history') || 'History'}
        </h4>
        <div className="divide-y divide-gray-200 w-full">
          {(subscriptions?.subscription_history || []).map((item: any, idx: number) => (
            <div key={idx} className="py-3">
              <div className="flex flex-wrap items-center text-base mb-1">
                <span className="font-medium text-black">{item?.name}</span>
                <span className="mx-2 text-gray-600">|</span>
                <span className="text-black">{item?.price > 0 ? `${item?.currency} ${item?.price}` : t('plan.free') || 'Free'}</span>
                <span className="mx-2 text-gray-600">|</span>
                <span className="text-black">{item?.price > 0 ? item?.duration_text : t('plan.noBilling') || 'No Billing'}</span>
              </div>
              <div className="flex flex-wrap items-center text-sm mt-1">
                <span className="text-black">{t('plan.purchaseDate') || 'Purchase date'} : {item?.purchase_date}</span>
                <span className="mx-2 text-gray-600">|</span>
                <a href={item?.invoice_url} className="text-[#007E67] font-semibold" target="_blank" rel="noopener noreferrer">
                  {t('plan.downloadInvoice') || 'Download Invoice'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      {isLoggedIn && isAgent && <MobileAgentMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
      {isLoggedIn && isBuyer && <MobileBuyerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}

      
    </div>
  );
}