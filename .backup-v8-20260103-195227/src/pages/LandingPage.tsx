import React from 'react';
import { useNavigate } from 'react-router-dom';
import homeImage from '../assets/images/v3/home.jpg';
import logoHome from '../assets/images/v3/logo-home.png';
import { useFloatingAskBar } from '../contexts/FloatingAskBarContext';
import SignInPopover from '../components/SignInPopover';
import WebLogin from './auth/WebLogin';
import WebSignup from './auth/WebSignup';
import WebAgentSignup from './auth/WebAgentSignup';

const LandingPage = () => {
    const navigate = useNavigate();
    const { show } = useFloatingAskBar();
    const [modalView, setModalView] = React.useState<'signup' | 'login' | 'agentSignUp' | null>(null);

    React.useEffect(() => {
        show();
    }, [show]);

    const handleEnterClick = () => {
        navigate('/services');
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${homeImage})`,
                }}
            />

            {/* Top-right Sign in popover trigger */}
            <div className="absolute top-6 right-6 z-[60]">
                <SignInPopover
                    onSignInClick={() => setModalView('login')}
                    onCreateAccountClick={() => setModalView('signup')}
                />
            </div>

            {/* Dark Teal-Green Overlay with Gradient */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(0, 66, 54, 0.8) 0%, rgba(0, 66, 54, 0.6) 50%, rgba(0, 66, 54, 0.4) 100%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
                {/* Logo */}
                <div className="mb-8 animate-fadeInUp">
                    <img 
                        src={logoHome} 
                        alt="Vista View Realty Services" 
                        className="h-20 w-auto mx-auto"
                    />
                </div>

                {/* Main Heading */}
                <h2 
                    className="text-center animate-fadeInUp delay-200"
                    style={{ 
                        fontFamily: 'Italiana',
                        fontWeight: 500,
                        fontStyle: 'normal',
                        fontSize: '88px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        background: 'linear-gradient(91.15deg, #905E26 -21.69%, #F5EC9B 46.73%, #905E26 129.71%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                        display: 'inline-block',
                        marginBottom: '20px',
                        textShadow: '0 0 5px rgba(245, 236, 155, 0.5), 0 0 30px rgba(144, 94, 38, 0.3)',
                    }}
                >
                    The Amazon of Real Estate
                </h2>

                {/* Subtitle */}
                <p 
                    className="text-center mb-12 uppercase animate-fadeInUp delay-400"
                    style={{
                        fontFamily: 'Doppio One, sans-serif',
                        fontWeight: 600,
                        fontStyle: 'normal',
                        fontSize: '24px',
                        lineHeight: '100%',
                        letterSpacing: '20%',
                        color: '#F5EC9B',
                        background: 'linear-gradient(91.15deg, #905E26 -21.69%, #F5EC9B 46.73%, #905E26 129.71%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 5px rgba(245, 236, 155, 0.5), 0 0 30px rgba(144, 94, 38, 0.3)',
                    }}
                >
                    EXPLORE NEW WORLD IN REAL ESTATE
                </p>

                {/* Enter Button */}
                <div className="relative animate-fadeInUp delay-600">
                    {/* Top right horizontal line */}
                    <div 
                    className="absolute -top-4 right-0"
                    style={{
                        width: '50px',
                        height: '1px',
                        background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                        animation: 'moveRightToLeft 2s infinite'
                    }}
                    />

                    {/* Top right vertical line */}
                    <div 
                    className="absolute top-0 -right-4"
                    style={{
                        width: '1px',
                        height: '30px',
                        background: 'linear-gradient(180deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                        animation: 'moveTopToBottom 2s infinite'
                    }}
                    />

                    {/* Bottom left horizontal line */}
                    <div 
                    className="absolute -bottom-4 left-0"
                    style={{
                        width: '50px',
                        height: '1px',
                        background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                        animation: 'moveLeftToRight 2s infinite'
                    }}
                    />

                    {/* Bottom left vertical line */}
                    <div 
                    className="absolute bottom-0 -left-4"
                    style={{
                        width: '1px',
                        height: '30px',
                        background: 'linear-gradient(180deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
                        animation: 'moveBottomToTop 2s infinite'
                    }}
                    />

                    <button
                        onClick={handleEnterClick}
                        className="relative px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 z-10"
                        style={{
                            backgroundColor: '#fcfaeb',
                            boxShadow: '5px 5px 5px 0px #905E2633 inset, -5px -5px 5px 0px #EFEAC5 inset',
                            border: 'none',
                            // color: 'transparent',
                            // backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                            // WebkitBackgroundClip: 'text',
                            // WebkitTextFillColor: 'transparent',
                            // backgroundClip: 'text'
                        }}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#905E26] via-[#F5EC9B] to-[#905E26]">
                        ENTER ≫
                        </span>
                    </button>
                </div>
            </div>

            {modalView === 'agentSignUp' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <WebAgentSignup onClose={() => setModalView(null)} onSwitchToLogin={() => setModalView('login')} onSwitchToBuyerSignUp={ () => setModalView('signup') } />
                </div>
            )}
            {modalView === 'signup' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <WebSignup onClose={() => setModalView(null)} onSwitchToLogin={() => setModalView('login')} onSwitchToAgentSignUp={ () => setModalView('agentSignUp') } />
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
        </div>
    );
};

export default LandingPage; 