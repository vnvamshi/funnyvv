import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/v3.2/main-page-logo.png';
import locationIcon from '../../assets/images/v3.2/location-icon.png';
import cartIcon from '../../assets/images/v3.2/cart-icon.png';
import { useTranslation } from 'react-i18next';
import SignInPopover from '../../components/SignInPopover';
import WebLogin from '../../pages/auth/WebLogin';
import WebMobileLogin from '../../pages/auth/WebMobileLogin';
import WebSignup from '../../pages/auth/WebSignup';
import WebAgentSignup from '../../pages/auth/WebAgentSignup';
import { useAuth } from '../../contexts/AuthContext';
import V3SignupModal from './V3SignupModal';
import V3AgentSignupModal from './V3AgentSignupModal';

const V3LandingHeader = () => {
    const { t, i18n } = useTranslation();
    const { isLoggedIn } = useAuth();
    const countries = React.useMemo(() => (t('header.modal.countries', { returnObjects: true }) as Array<{ country: string; language: string; flag: string }>) || [], [t]);
    const currencies = React.useMemo(() => (t('header.modal.currencies', { returnObjects: true }) as Array<{ name: string; code: string; symbol: string }>) || [], [t]);

    const defaultCountry = countries[0] || { country: 'USA', language: 'English', flag: 'https://flagcdn.com/w40/us.png' };
    const defaultCurrency = currencies[0] || { code: 'USD', symbol: '$', name: 'United States Dollar' };

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'country' | 'currency'>('country');
    const [selected, setSelected] = React.useState<{ country: string; language: string; flag: string }>(defaultCountry);
    const [selectedCurrency, setSelectedCurrency] = React.useState<{ code: string; symbol: string; name: string }>(defaultCurrency);
    const modalRef = React.useRef<HTMLDivElement | null>(null);
    const [authModalView, setAuthModalView] = React.useState<'signup' | 'login' | 'agentSignUp' | 'professionalLogin' | 'professionalSignup' | null>(null);

    // Close on click outside
    React.useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setIsModalOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [isModalOpen]);

    return (
        <header className="w-full fixed top-0 left-0 z-50">
            <div className="bg-transparent">
                <div className="w-full px-6 md:px-8 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/v3" className="cursor-pointer">
                        <img src={logo} alt={t('header.logoAlt')} className="h-13 md:h-16 w-auto" />
                    </Link>

                    {/* Right - Nav + Controls */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Nav - Desktop */}
                        <nav className="flex items-center gap-16">
                            <a href="#about" className="text-gold-gradient font-bold transition">{t('header.navigation.aboutUs')}</a>
                            <a href="#how-it-works" className="text-gold-gradient font-bold transition">{t('header.navigation.howItWorks')}</a>
                            <a href="#partners" className="text-gold-gradient font-bold transition">{t('header.navigation.ourPartners')}</a>
                            <a href="#lend" className="text-gold-gradient font-bold transition">{t('header.navigation.lendWithUs')}</a>
                        </nav>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {/* Language/Country selector opens modal */}
                            <button
                                onClick={() => {
                                    setActiveTab('country');
                                    setIsModalOpen(true);
                                }}
                                className={`relative rounded-xl transition-all duration-300 hover:scale-105 min-w-[240px] w-auto gradient-border-mask`}
                            >
                                <div className={`rounded-xl px-3 py-1 w-full h-10 flex flex-col justify-center`}>
                                    <div className="flex items-center w-full gap-2">
                                        <div className="flex gap-2 flex-1 items-center overflow-hidden">
                                            <img
                                                src={selected.flag}
                                                alt={`${selected.country} flag`}
                                                className="w-8 h-6 object-cover rounded flex-shrink-0"
                                            />
                                            <div className="flex flex-col min-w-0 flex-1 justify-center leading-tight">
                                                <span className={`text-white font-medium truncate text-left whitespace-nowrap`}>
                                                    {selected.country}
                                                </span>
                                                <span className={`text-[10px] mt-0 text-white/80 text-left whitespace-nowrap truncate`}>
                                                    {selected.language} • {selectedCurrency.code}
                                                </span>
                                            </div>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-300 flex-shrink-0`}
                                            fill="none"
                                            stroke={'#FFFFFF'}
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            {/* Cart icon - only show when logged in */}
                            {isLoggedIn && (
                                <Link to="/v3/cart" className="relative hover:opacity-80 transition-opacity ml-1">
                                    <div className="gradient-border-mask rounded-full p-2">
                                        <img src={cartIcon} alt="Cart" className="w-6 h-6" />
                                    </div>
                                    {/* Badge count */}
                                    <span 
                                        className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                                        style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                                    >
                                        3
                                    </span>
                                </Link>
                            )}

                            {/* Sign in (Popover) */}
                            <SignInPopover
                                buttonClassName="gold-gradient-btn ml-1"
                                onSignInClick={() => setAuthModalView('login')}
                                onCreateAccountClick={() => setAuthModalView('signup')}
                                onProfessionalLoginClick={() => setAuthModalView('professionalLogin')}
                            />
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4">
                        <div className="absolute inset-0" style={{ background: 'rgba(0, 66, 54, 0.7)' }} />
                        <div
                            ref={modalRef}
                            className="relative w-[auto] max-w-[92vw] p-8 rounded-3xl gradient-border-mask bg-[rgba(0,66,54,0.7)]"
                        >
                            {/* Close */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-3 right-4 text-white/80 hover:text-white"
                            >
                                ✕
                            </button>

                            {/* Tabs */}
                            <div className="flex items-center gap-6 border-b border-[#F5EC9B]/20 px-2 relative">
                                <button
                                    onClick={() => setActiveTab('country')}
                                    className={`relative pb-2 text-sm ${activeTab === 'country' ? 'text-white' : 'text-white/70'}`}
                                >
                                    {t('header.modal.tabs.countryAndLanguage')}
                                    {activeTab === 'country' && (
                                        <span
                                            className="absolute left-0 right-0 -bottom-[1px] h-[2px]"
                                            style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }}
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('currency')}
                                    className={`relative pb-2 text-sm ${activeTab === 'currency' ? 'text-white' : 'text-white/70'}`}
                                >
                                    {t('header.modal.tabs.currency')}
                                    {activeTab === 'currency' && (
                                        <span
                                            className="absolute left-0 right-0 -bottom-[1px] h-[2px]"
                                            style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }}
                                        />
                                    )}
                                </button>
                            </div>

                            {/* Content */}
                            <div className="mt-4">
                                {activeTab === 'country' ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {countries.map((o) => {
                                            const isActive = o.country === selected.country;
                                            return (
                                                <button
                                                    key={o.country}
                                                    onClick={() => {
                                                        setSelected(o);
                                                        i18n.changeLanguage(o.country === 'India' ? 'hi' : 'en');
                                                    }}
                                                    className={`relative rounded-xl px-2 py-2 text-left transition w-full max-w-[200px] mx-auto ${isActive ? '' : 'gradient-border-mask hover:bg-[#F5EC9B]/10'}`}
                                                    style={isActive ? { background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)', boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A' } : { background: 'linear-gradient(111.83deg, rgba(0, 66, 54, 0.5) 11.73%, rgba(0, 126, 103, 0.5) 96.61%)' }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <img src={o.flag} alt={`${o.country} flag`} className="w-8 h-6 object-cover rounded" />
                                                        <div className="flex flex-col items-start text-left">
                                                            <span className={`${isActive ? 'text-[rgba(0,66,54,1)]' : 'text-gold-gradient'} text-sm font-bold`}>{o.country}</span>
                                                            <span className={`${isActive ? 'text-[rgba(0,66,54,1)]' : 'text-gold-gradient'} text-[10px]`}>{o.language}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {currencies.map((c) => {
                                            const isActive = c.code === selectedCurrency.code;
                                            return (
                                                <button
                                                    key={c.code}
                                                    onClick={() => setSelectedCurrency(c)}
                                                    className={`relative rounded-xl px-2 py-2 text-left transition w-full max-w-[200px] mx-auto ${isActive ? '' : 'gradient-border-mask hover:bg-[#F5EC9B]/10'}`}
                                                    style={isActive ? { background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)', boxShadow: '3px 3px 5px 0px #F5EC9B33 inset, -3px -3px 5px 0px #00000040 inset, 10px 10px 10px 0px #0C656E1A' } : { background: 'linear-gradient(111.83deg, rgba(0, 66, 54, 0.5) 11.73%, rgba(0, 126, 103, 0.5) 96.61%)' }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-start text-left">
                                                            <span className={`${isActive ? 'text-[rgba(0,66,54,1)]' : 'text-gold-gradient'} text-sm font-bold`}>{c.name}</span>
                                                            <span className={`${isActive ? 'text-[rgba(0,66,54,1)]' : 'text-gold-gradient'} text-[10px]`}>{c.code} • {c.symbol}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {authModalView === 'agentSignUp' && (
                    <V3AgentSignupModal
                        isOpen
                        onClose={() => setAuthModalView(null)}
                        onSignInClick={() => setAuthModalView('login')}
                        onSwitchToBuyerSignUp={() => setAuthModalView('signup')}
                    />
                )}
                {authModalView === 'signup' && (
                    <V3SignupModal
                        isOpen
                        onClose={() => setAuthModalView(null)}
                        onSignInClick={() => setAuthModalView('login')}
                    />
                )}
                {authModalView === 'login' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                        <WebMobileLogin
                            onClose={() => setAuthModalView(null)}
                            onSwitchToSignup={() => setAuthModalView('signup')}
                        />
                    </div>
                )}
                {authModalView === 'professionalLogin' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                        <WebMobileLogin
                            variant="professional"
                            onClose={() => setAuthModalView(null)}
                            onSwitchToSignup={() => setAuthModalView('professionalSignup')}
                        />
                    </div>
                )}
                {authModalView === 'professionalSignup' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                        <WebMobileLogin
                            variant="professionalSignup"
                            onClose={() => setAuthModalView(null)}
                            onSwitchToSignup={() => setAuthModalView('professionalLogin')}
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default V3LandingHeader; 