import React, { useState } from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import { useNavigate } from 'react-router-dom';

interface AboutBuilderTabProps {
  builderData: any;
  onProfileUpdated?: () => void;
}

const AboutBuilderTab: React.FC<AboutBuilderTabProps> = ({ builderData, onProfileUpdated }) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Handler to close modal and refresh data
  const handleModalClose = () => {
    setShowAboutModal(false);
    if (onProfileUpdated) onProfileUpdated();
  };

  // Navigate to onboarding to update information
  const handleUpdateClick = () => {
    navigate('/builder/onboarding');
  };

  // Extract data from builder onboarding
  const companyDetails = builderData?.company_details || {};
  const businessReg = builderData?.business_registration || {};
  const serviceLocations = builderData?.service_locations || [];
  const contactPersons = builderData?.contact_persons || [];

  // Build service areas from service locations
  const serviceAreas = serviceLocations.map((sl: any) => {
    if (sl.state_detail) {
      return sl.state_detail.name;
    } else if (sl.city_detail) {
      return `${sl.city_detail.name}, ${sl.state_detail?.name || ''}`;
    }
    return '';
  }).filter(Boolean);

  return (
    <div className="w-full mx-auto pl-10 pr-10">
      <div className="bg-white p-2 rounded-xl w-full border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-base text-[#00473E]">Get to know about builder</div>
          <button
            className="flex items-center gap-1 border border-primary text-primary px-3 py-1 rounded-md text-xs font-medium transition hover:bg-[#17695C]/90 hover:text-white"
            onClick={handleUpdateClick}
          >
            <span className="w-4 h-4 inline-block align-middle">
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7.22222V11.8889C16 13.6071 14.5076 15 12.6667 15H4.33333C2.49238 15 1 13.6071 1 11.8889V4.11111C1 2.39289 2.49238 1 4.33333 1H9.33333" stroke="url(#paint0_linear_758_3097)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13.4356 1.39599C13.7173 1.14244 14.0994 1 14.4977 1C14.8962 1 15.2783 1.14244 15.56 1.39599C15.8417 1.64954 16 1.99342 16 2.35199C16 2.71056 15.8417 3.05445 15.56 3.30799L8.83258 9.36265L6 10L6.70815 7.45067L13.4356 1.39599Z" stroke="url(#paint1_linear_758_3097)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3L14 5" stroke="url(#paint2_linear_758_3097)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="paint0_linear_758_3097" x1="2.53285" y1="3.17241" x2="17.5908" y2="9.63623" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#004236"/>
                    <stop offset="1" stopColor="#007E67"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_758_3097" x1="7.0219" y1="2.39655" x2="16.944" y2="6.81351" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#004236"/>
                    <stop offset="1" stopColor="#007E67"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear_758_3097" x1="12.2044" y1="3.31034" x2="14.2532" y2="4.13119" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#004236"/>
                    <stop offset="1" stopColor="#007E67"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            Update
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Type */}
          <div className="bg-[#D0F2EB] rounded-lg p-4 flex flex-col min-h-[90px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">Company Type</div>
            </div>
            <div className="font-semibold text-base">
              {companyDetails?.company_type_detail?.name ? (
                <span className="bg-[#85C6BA] text-primary-color font-bold rounded-md px-3 py-2 text-medium inline-block">
                  {companyDetails.company_type_detail.name}
                </span>
              ) : (
                <span className="text-gray-400">No company type listed</span>
              )}
            </div>
          </div>
          {/* Year Established */}
          <div className="bg-[#D0F2EB] rounded-lg p-4 flex flex-col min-h-[90px]">
            <div className="flex items-center mb-2">
              <div className="text-sm">Year Established</div>
            </div>
            <div className="font-semibold text-base">
              {companyDetails?.year ? (
                <>Established in {companyDetails.year} ({new Date().getFullYear() - companyDetails.year} years of experience)</>
              ) : (
                <span className="text-gray-400">No year listed</span>
              )}
            </div>
          </div>
          {/* Service Areas */}
          <div className="bg-[#D0F2EB] rounded-lg p-4 flex flex-col min-h-[90px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">Service Areas</div>
            </div>
            <div className="font-semibold text-base">
              {serviceAreas.length > 0 ? (
                serviceAreas.join(', ')
              ) : (
                <span className="text-gray-400">No service areas listed</span>
              )}
            </div>
          </div>
          {/* Authorized Contacts */}
          <div className="bg-[#D0F2EB] rounded-lg p-4 flex flex-col min-h-[90px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">Authorized Contacts</div>
            </div>
            <div className="font-semibold text-base">
              {contactPersons.length > 0 ? (
                <>{contactPersons.length} contact{contactPersons.length > 1 ? 's' : ''} registered</>
              ) : (
                <span className="text-gray-400">No contacts listed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutBuilderTab;

