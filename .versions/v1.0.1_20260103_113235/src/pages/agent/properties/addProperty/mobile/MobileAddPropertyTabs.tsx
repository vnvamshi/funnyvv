import React from 'react';
import { useNavigate } from 'react-router-dom';

const steps = [
  { label: 'Location', path: '/agent/properties/add/location' },
  { label: 'Property Info', path: '/agent/properties/add/info' },
  { label: 'Media', path: '/agent/properties/add/media' },
  { label: 'Amenities', path: '/agent/properties/add/amenities' },
  { label: 'Contact Info', path: '/agent/properties/add/contact-info' },
  { label: 'Review', path: '/agent/properties/add/review' },
];

interface MobileAddPropertyTabsProps {
  currentStep: number;
}

const MobileAddPropertyTabs: React.FC<MobileAddPropertyTabsProps> = ({ currentStep }) => {
  const navigate = useNavigate();
  
  // Calculate which tabs to show (3 tabs centered around current step)
  const getVisibleTabs = () => {
    const totalSteps = steps.length;
    let startIndex = Math.max(0, currentStep - 1);
    let endIndex = Math.min(totalSteps - 1, currentStep + 1);
    
    // Adjust if we're at the edges
    if (currentStep === 0) {
      endIndex = Math.min(2, totalSteps - 1);
    } else if (currentStep === totalSteps - 1) {
      startIndex = Math.max(0, totalSteps - 3);
    }
    
    return steps.slice(startIndex, endIndex + 1).map((step, index) => ({
      ...step,
      originalIndex: startIndex + index
    }));
  };
  
  const visibleTabs = getVisibleTabs();
  
  return (
    <div className="flex border-b overflow-x-auto scrollbar-hide">
      {visibleTabs.map((step, idx) => {
        const originalIndex = step.originalIndex;
        const isActive = currentStep === originalIndex;
        const isCompleted = originalIndex < currentStep;
        const isClickable = originalIndex <= currentStep;
        
        return (
          <button
            key={step.label}
            className={`flex-shrink-0 py-3 px-4 text-center font-semibold relative min-w-[120px] ${
              isActive 
                ? 'text-green-900' 
                : isCompleted 
                  ? 'text-green-700' 
                  : 'text-[#7C7C7C]'
            }`}
            onClick={() => isClickable && navigate(step.path)}
            disabled={!isClickable}
          >
            <div className="flex items-center justify-center gap-2">
              {isCompleted && (
                <svg width="20" height="20" viewBox="0 0 25 25" fill="none" className="flex-shrink-0">
                  <g filter="url(#filter0_d_98_9668)">
                    <circle cx="12.3032" cy="8.30322" r="8.30322" fill="url(#paint0_linear_98_9668)"/>
                  </g>
                  <path d="M9.15332 8.58937L11.4439 10.8799L16.025 6.29883" stroke="#FCFCFD" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <filter id="filter0_d_98_9668" x="0" y="0" width="24.6064" height="24.6064" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                      <feOffset dy="4"/>
                      <feGaussianBlur stdDeviation="2"/>
                      <feComposite in2="hardAlpha" operator="out"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_98_9668"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_98_9668" result="shape"/>
                    </filter>
                    <linearGradient id="paint0_linear_98_9668" x1="5.69701" y1="2.57686" x2="22.7088" y2="9.39254" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#004236"/>
                      <stop offset="1" stopColor="#007E67"/>
                    </linearGradient>
                  </defs>
                </svg>
              )}
              <span className="text-sm">{step.label}</span>
            </div>
            {isActive && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)'
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MobileAddPropertyTabs; 