import { ArrowLeft } from "lucide-react";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import tickIcon from '../../assets/images/tick-icon.svg';
import { useTranslation } from "react-i18next";
import ServiceSection from "../Home/DesktopServiceSectionUI";
import PropertyListSkeleton from '../HomeSearchList/PropertyListing/components/PropertyListSkeleton';

// Skeleton loader for desktop subscription page
const MySubscriptionSkeletonDesktop = () => (
  <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col items-center justify-center">
    <div className="w-full max-w-4xl">
      <div className="h-10 w-1/3 bg-gray-200 rounded mb-8 animate-pulse mx-auto" />
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 md:mb-12">
        <div className="w-full md:w-1/3 border border-gray-200 rounded-xl p-6 shadow bg-white flex flex-col justify-between mb-4 md:mb-0 animate-pulse">
          <div className="h-6 w-2/3 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-1/2 bg-gray-200 rounded mb-4" />
          <div className="space-y-2 mb-4">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
        <div className="flex-1 border border-gray-200 rounded-xl p-6 shadow bg-white flex flex-col animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            <div className="h-6 w-full bg-gray-200 rounded" />
            <div className="h-6 w-2/3 bg-gray-200 rounded" />
            <div className="h-6 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function MySubscriptionDesktop({ subscriptions, t, onCancel, onChangePlan } : any) {
  // Ensure features is always an array and translated
  const navigate = useNavigate();
  const features = subscriptions?.subscription?.features_details || [];
  const selectedPlan = subscriptions?.subscription;

  if (!subscriptions) {
    return <MySubscriptionSkeletonDesktop />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans" >
      {/* Top bar */}
      <div className="flex items-center px-4 md:px-8 py-4 md:py-6" style={{ paddingBottom : '0px' }}>
       
        
        <div className="flex-1 text-center text-xl md:text-2xl font-bold text-black md:-ml-12">
          {t("plan.mySubscriptions") || "My Subscriptions"}
        </div>
      </div>
      {/* Main content */}
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Plan Card */}
          <div className="w-full md:w-1/3 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white flex flex-col justify-between mb-4 md:mb-0">
            <div>
              <h2 className="font-bold text-base md:text-lg mb-2">
                {selectedPlan?.name || t("plan.basic") || "Basic"}
              </h2>
              <div className="text-2xl md:text-3xl font-bold mb-2">
               { selectedPlan?.price > 0 ? selectedPlan?.currency + " " + selectedPlan?.price : t("plan.free") || "FREE"}
              </div>
              <ul className="mb-4 space-y-2">
                {features && features.map((feature: any) => (
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
          {/* History */}
          <div className="flex-1 border border-gray-200 rounded-xl p-4 md:p-6 shadow bg-white flex flex-col">
            <h4 className="text-lg md:text-xl font-bold mb-4 text-black text-left w-full">
              {t('plan.history') || 'History'}
            </h4>
            <div className="divide-y divide-gray-200 w-full">
              {(subscriptions?.subscription_history || []).map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between py-3">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <span className="font-medium text-black text-base md:text-lg">{item?.name}</span>
                    <span className="mx-2 text-gray-600 text-base md:text-lg">|</span>
                    <span className="text-black text-base md:text-lg">{item?.price > 0 ? `${item?.currency} ${item?.price}` : t('plan.free') || 'Free'}</span>
                    <span className="mx-2 text-gray-600 text-base md:text-lg">|</span>
                    <span className="text-black text-base md:text-lg">{item?.price > 0 ? item?.duration_text :"No Billing"}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 md:mt-0">
                    <span className="text-black text-sm md:text-base">Purchase date : {item.purchase_date}</span>
                    <span className="mx-2 text-gray-600">|</span>
                    <a href={item.invoice_url} className="text-[#007E67] font-semibold text-sm md:text-base" target="_blank" rel="noopener noreferrer">
                      {t('plan.downloadInvoice') || 'Download Invoice'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <ServiceSection /> */}
    </div>
  );
}