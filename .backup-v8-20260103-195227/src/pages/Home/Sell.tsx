import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../../assets/images/interior-design.svg';
import sellImage from '../../assets/images/sell.svg';
import ServiceSection from './DesktopServiceSectionUI';
import WebLogin from '../auth/WebLogin';
import WebSignup from '../auth/WebSignup';
import logo from '../../assets/images/web-logo.svg';
import realEstateIcon from '../../assets/images/realestate.svg';
import securityCamIcon from '../../assets/images/security-cam.svg';
import interiorDesignIcon from '../../assets/images/interior-design.svg';
import WebAgentSignup from '../auth/WebAgentSignup';
import { Bell } from 'lucide-react';
import menuIcon from '../../assets/images/menu-icon.svg';
import mobileLogo from '../../assets/images/mobile/mobile-logo.svg';
import { MobileBottonMenu, MobileMenu } from '../../components/MobileMenu';
import { useAuth } from '../../contexts/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';
import useIsTab from '../../hooks/useIsTab';

const Sell: React.FC = () => {
  const [modalView, setModalView] = useState<'signup' | 'login' | 'buyerSignup' |  null>(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  // Responsive check
  const isMobile = useIsMobile()
  const isTab = useIsTab()

  if (isMobile || isTab) {
    return ( <>
        <div className="min-h-screen bg-white text-gray-900 relative pb-20">
      {/* Header */}
      <div className="relative" >
             <div
                  className="absolute inset-0"
                  style={{
                    opacity: 0.3,
                    background: `
                      linear-gradient(176.7deg, rgba(0, 66, 54, 0.9) 4.41%, rgba(26, 142, 194, 0) 113.84%),
                      linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)
                    `,
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                  }}>
              </div>
        <img
          src={sellImage}
          alt="Header"
          className="w-full h-60 object-cover"
        />

        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute top-5 left-4 right-4 flex justify-between items-center">
          <button onClick={() => setMenuOpen(true)}>
            <img src={menuIcon} alt="Menu" className="w-6 h-6 text-white" />
          </button>
           <div className="">
            <img
              src={mobileLogo} // Replace with your logo
              alt="Logo"
              className="h-6 w-auto"
            />
          </div>
          <button>
            <Bell className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="absolute top-20 left-4 right-4">
            <h1 className="text-white text-2xl font-bold text-center mb-2 leading-tight">
              Partner with us as agent to<br />sell your properties
            </h1>
            <p className="text-white text-sm text-center mb-4">
              Vistaview is making it simpler to sell your home and move forward.
            </p>
            <div className="flex justify-center">
              <button
                className="bg-white text-[#007E67] font-semibold px-6 py-2 rounded-md shadow hover:bg-gray-100 transition text-sm"
                onClick={() => { navigate('/login') }}
              >
                Login / Sign up as Agent
              </button>
            </div>
        </div>
        
      </div>
      
          
        </div>
        
        { !isLoggedIn &&  <><MobileBottonMenu /><MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} /></>}
              
        {/* // Services Section
        // <div className="bg-white w-full px-4 py-6">
        //   <h2 className="text-[#007E67] text-center font-semibold text-lg mb-4">Explore more services with Vistaview</h2>
        //   <div className="grid grid-cols-3 gap-3">
        //     <div className="flex flex-col items-center bg-[#FFFBEA] rounded-xl py-4">
        //       <img src={realEstateIcon} alt="Real Estate" className="h-8 mb-2" />
        //       <span className="text-[#BFA053] text-xs font-semibold">Real Estate</span>
        //     </div>
        //     <div className="flex flex-col items-center bg-[#FFFBEA] rounded-xl py-4">
        //       <img src={securityCamIcon} alt="Security Camera" className="h-8 mb-2" />
        //       <span className="text-[#BFA053] text-xs font-semibold">Security Camera</span>
        //     </div>
        //     <div className="flex flex-col items-center bg-[#FFFBEA] rounded-xl py-4">
        //       <img src={interiorDesignIcon} alt="Interior Design" className="h-8 mb-2" />
        //       <span className="text-[#BFA053] text-xs font-semibold">Interior Design</span>
        //     </div>
        //   </div>
        // </div> */}

</>
    );
  }

  // Desktop layout (existing)
  return (
    <>
      <div
        className="relative w-full h-[340px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${sellImage})` }}
      >
        <div className="absolute inset-0 bg-[#00473E] bg-opacity-60" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <h1 className="text-white text-4xl font-bold text-center mb-4">
            Partner with us as agent to<br />sell your properties
          </h1>
          <p className="text-white text-lg text-center mb-6">
            Vistaview is making it simpler to sell your home and move forward.
          </p>
          <button
            className="bg-white text-[#00473E] font-semibold px-6 py-2 rounded-md shadow hover:bg-gray-100 transition"
            onClick={() => { setModalView('login'); }}
          >
            Login / Sign up as Agent
          </button>
        </div>
      </div>
      {/* <ServiceSection /> */}
      {modalView === 'buyerSignup' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <WebSignup onClose={() => setModalView(null)} onSwitchToLogin={() => setModalView('login')} onSwitchToAgentSignUp={ () => setModalView('signup') } />
        </div>
      )}
        {modalView === 'signup' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <WebAgentSignup onClose={() => setModalView(null)} onSwitchToLogin={() => setModalView('login')} onSwitchToBuyerSignUp={ () => setModalView('buyerSignup') } />
        </div>
      )}
      {modalView === 'login' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <WebLogin
            onClose={() => setModalView(null)}
            onSwitchToSignup={() => setModalView('signup')}
          />
        </div>
      )}
    </>
  );
};

export default Sell; 