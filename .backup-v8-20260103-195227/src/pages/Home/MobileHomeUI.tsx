import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Search, Home, Compass, Heart, User, Mic, HelpCircle, Layers, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import menuIcon from '../../assets/images/menu-icon.svg';
import Minus from '../../assets/images/minus.svg';
import Plus from '../../assets/images/plus.svg';
import LandImg1 from '../../assets/images/land-img-1.svg';
import mobileLogo from '../../assets/images/mobile/mobile-logo.svg';
import home1 from '../../assets/images/mobile/home1.svg';
import home2 from '../../assets/images/mobile/home2.svg';
import viewHome1 from '../../assets/images/mobile/view-home1.svg';
import viewHome2 from '../../assets/images/mobile/view-home2.svg';
import project1 from '../../assets/images/mobile/project1.svg';
import project2 from '../../assets/images/mobile/project2.svg';
import HomeOuterGreen from '../../assets/images/homeoutergreen.svg';

import { Menu, Bell } from 'lucide-react'; // or use react-icons
import Projects from './Projects';
import {MobileBottonMenu, MobileOverlayMenu} from  '../../components/MobileMenu';
import {MobileMenu} from '../../components/MobileMenu';
import MobileUserMenu from '../../components/MobileBuyerMenu';
import { useAuth, useAuthData } from '../../contexts/AuthContext';
import MobileBuyerMenu from '../../components/MobileBuyerMenu';
import MobileAgentMenu from '../../components/MobileAgentMenu';
import BuyerFooterNav from '../../components/BuyerFooterNav';

const HomeMobile = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const isAgent = useAuthData().user?.user_type === 'agent';
  const isBuyer = useAuthData().user?.user_type === 'buyer';
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const projects = [
    {
      image: project1,
      title: t('home.projects.pacificHeights.title'),
      subtitle: t('home.projects.pacificHeights.subtitle'),
      tag: "Residential",
      buttonLabel: "View",
    },
    {
      image: project2,
      title: t('home.projects.dairyFarm.title'),
      subtitle: t('home.projects.dairyFarm.subtitle'),
      tag: "Commercial",
      buttonLabel: "View",
    },
    {
      image: project1,
      title: t('home.projects.pacificHeights.title'),
      subtitle: t('home.projects.pacificHeights.subtitle'),
      tag: "Residential",
      buttonLabel: "View",
    },
    // Add more cards as needed...
  ];

  return (
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
          src={LandImg1}
         
          alt="Header"
          className="w-full h-48 object-cover"
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
          <div className="flex items-center bg-white px-6 py-4 shadow-md">
            <Search className="text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('home.hero.searchPlaceholder')}
              className="flex-1 mx-2 text-sm bg-transparent focus:outline-none form-input"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchValue.trim()) {
                  navigate(`/property-listing?search=${encodeURIComponent(searchValue.trim())}`);
                }
              }}
            />
            <Mic className="text-gray-500 w-4 h-4 ml-2" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6" style = {{ paddingTop: "0.5rem"}}>
      {/* Section Title */}
      <h2 className="text-lg font-semibold mb-4 text-primary-color">
        {t('home.hero.subtitle')}
      </h2>

      {/* Always Vertical Cards */}
      <div className="flex flex-col-2 gap-2">
        {/* Sell Home Card */}
        <div className="bg-[#D0F2EB] rounded-xl p-4 flex flex-col justify-between shadow">
          <div className="flex items-start space-x-3">
            <div className="text-green-700">
              {/* Icon */}
              <img src={home1}  width = "45px" height="45px"/>
            </div>
            <p className="text-sm font-semibold text-primary-color" style = {{ fontSize : "12px"}}>
              {t('home.services.sellHome')}
            </p>
          </div>
          <div className="flex justify-center">
            <button className="mt-4 bg-white px-3 py-1 text-sm rounded-full inline-flex items-center justify-center space-x-1 font-semibold" style = {{ color : " #004236"}}>
              <span>{t('home.services.sellHomeButton')}</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Find Home Card */}
        <div className="bg-[#FBF8E5] rounded-xl p-4 flex flex-col justify-between shadow ">
          <div className="flex items-start space-x-3">
            <div className="text-green-700">
              {/* Icon */}
              <img src={HomeOuterGreen}  width = "45px" height="45px"/>
            </div>
            <p className="text-sm font-semibold text-primary-color" style = {{ fontSize : "10px"}}>
              {t('home.services.findHome')}
            </p>
          </div>
          <div className="flex justify-center">
            <button className="mt-4 bg-white px-3 py-1 text-sm rounded-full inline-flex items-center justify-center space-x-1 font-semibold" style = {{ color : " #004236"}}>
              <span>{t('home.services.findHomeButton')}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Featured Listings */}
      <div className="overflow-x-auto scroll-smooth whitespace-nowrap p-4 space-x-4 flex"  style = {{ paddingTop: "0rem"}}>
        <div
      className="relative min-w-[250px] h-72 rounded-lg overflow-hidden shadow-lg flex-shrink-0"
      style={{
        backgroundImage: `url(${viewHome1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width : "242px",
        height : "167px"
      }}
    >
      {/* Overlay */}
        <div
          className="absolute inset-0 rounded-[10px]"
          style={{
            background: 'linear-gradient(179.55deg, #004236 0.76%, #1A8EC21A 0.10%)',
            opacity: 0.8,
          }}
        />
      {/* Content */}
  
      {/* Text content on top */}
      <div className="absolute top-0 left-0 p-4 text-white z-10">
        <h3 className="text-sm font-semibold leading-tight w-[90%] break-words whitespace-normal line-clamp-2" style = {{ fontSize: "20px"}}>Lorem ipsum dolor sit amet</h3>
      </div>

      {/* Button stays at bottom */}
      <div className="absolute bottom-0 left-0 p-4 z-10">
                 <button
          className="w-[80px] h-[25px] text-white text-xs rounded-[7px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
        >  {t('property.details.view')}
        </button>
      </div>
    </div>
     <div
      className="relative min-w-[242px] h-[167px] rounded-[10px] overflow-hidden shadow-lg flex-shrink-0"
      style={{
        backgroundImage: `url(${viewHome2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width : "242px",
        height : "167px"
      }}
    >
      {/* Overlay */}
    <div
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{
          background: `linear-gradient(179.55deg, rgba(0, 66, 54, 0.8) 0.76%, rgba(216, 224, 228, 0.1) 99.62%)`,
          borderRadius: "10px",
        }}
      />

      {/* Content */}
      {/* Text content on top */}
      <div className="absolute top-0 left-0 p-4 text-white z-10">
        <h3 className="text-sm font-semibold leading-tight w-[90%] break-words whitespace-normal line-clamp-2" style = {{ fontSize: "20px"}}>Ut enim ad minim veniam</h3>
      </div>

      {/* Button stays at bottom */}
      <div className="absolute bottom-0 left-0 p-4 z-10">
            <button
          className="w-[80px] h-[25px] text-white text-xs rounded-[7px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
        >  {t('property.details.view')}
        </button>
      </div>
      
    </div>
    <div
      className="relative min-w-[242px] h-[167px] rounded-[10px] overflow-hidden shadow-lg flex-shrink-0"
      style={{
        backgroundImage: `url(${viewHome2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width : "242px",
        height : "167px"
      }}
    >
      {/* Overlay */}
    <div
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{
          background: `linear-gradient(179.55deg, rgba(0, 66, 54, 0.8) 0.76%, rgba(216, 224, 228, 0.1) 99.62%)`,
          borderRadius: "10px",
        }}
      />

      {/* Content */}
      {/* Text content on top */}
      <div className="absolute top-0 left-0 p-4 text-white z-10">
        <h3 className="text-sm font-semibold leading-tight w-[90%] break-words whitespace-normal line-clamp-2" style = {{ fontSize: "20px"}}>Ut enim ad minim veniam</h3>
      </div>

      {/* Button stays at bottom */}
      <div className="absolute bottom-0 left-0 p-4 z-10">
            <button
          className="w-[80px] h-[25px] text-white text-xs rounded-[7px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
        >  {t('property.details.view')}
        </button>
      </div>
      
    </div>
  </div>

      {/* Highlight Section */}
      <div className="px-4">
        <div className="text-white p-4 rounded-xl div-highlighter">
          <h2 className="text-sm font-bold">{t('home.highlight.title')}</h2>
          <p className="text-xs mt-1">
            {t('home.highlight.text')}
          </p>
        </div>
      </div>

      {/* New Projects */}
      <div className="px-2 mt-2">
         <div className="flex justify-between items-center" style = {{ paddingLeft : "1rem"}}>
          <h3 className="font-semibold text-base">{t('home.spotlight.title')}</h3>
          <button className="text-sm text-gray-500">{t('home.spotlight.viewAll')}</button>
        </div>
              <div className="relative group w-full h-full">

               
              {/* Horizontal scrollable cards */}
              <div className="flex gap-4 overflow-x-auto p-4">
                {projects.map((card, index) => (
                  <Projects key={index} {...card} />
                ))}
              </div>

              {/* Shared vertical menu overlay */}
              { isLoggedIn &&  isAgent && <MobileAgentMenu  isOpen={menuOpen} onClose={() => setMenuOpen(false)} /> }
              { isLoggedIn && isBuyer && <MobileBuyerMenu  isOpen={menuOpen} onClose={() => setMenuOpen(false)} /> }
              
              { !isLoggedIn &&  <><MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} /></>}

            </div>        
      </div>
      
      {/* Footer Navigation */}
      <BuyerFooterNav />
    </div>
  );
};

export default HomeMobile;

