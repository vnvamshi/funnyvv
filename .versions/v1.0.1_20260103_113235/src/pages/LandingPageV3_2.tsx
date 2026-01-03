import React from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/images/v3.2/main-back.png';
import logo from '../assets/images/v3.2/main-page-logo.png';
import realEstateIcon from '../assets/images/v3.2/real-estate-icon.png';
import catalogueIcon from '../assets/images/v3.2/catalogue-icon.png';
import interiorDesignIcon from '../assets/images/v3.2/interior-design-icon.png';
import servicesIcon from '../assets/images/v3.2/services-icon.png';
import { useFloatingAskBar } from '../contexts/FloatingAskBarContext';
import SignInPopover from '../components/SignInPopover';
import WebLogin from './auth/WebLogin';
import WebMobileLogin from './auth/WebMobileLogin';
import WebSignup from './auth/WebSignup';
import WebAgentSignup from './auth/WebAgentSignup';

const LandingPageV3_2 = () => {
	const navigate = useNavigate();
	const { show } = useFloatingAskBar();
	const [modalView, setModalView] = React.useState<'signup' | 'login' | 'agentSignUp' | null>(null);

	React.useEffect(() => {
		show();
	}, [show]);

	return (
		<div className="relative w-full min-h-screen overflow-hidden">
			{/* Background Image */}
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url(${bgImage})` }}
			/>

			{/* Radial Gradient Overlay (above image) */}
			<div
				className="absolute inset-0 z-0 pointer-events-none"
				style={{
					background:
						'radial-gradient(45.7% 45.7% at 50% 50%, rgba(0, 66, 54, 0.72) 0%, rgba(0, 55, 45, 0.855) 33.17%, rgba(0, 39, 32, 0.9) 100%)',
				}}
			/>

			{/* Top-right Sign in popover trigger */}
			<div className="absolute top-6 right-6 z-[60]">
				<SignInPopover
					onSignInClick={() => setModalView('login')}
					onCreateAccountClick={() => setModalView('signup')}
				/>
			</div>

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center justify-between w-full min-h-screen px-4 py-10">
				{/* Top Logo */}
				<div className="w-full flex justify-center mt-4 mb-8">
					<img src={logo} alt="VistaView" className="h-14 md:h-16 w-auto" />
				</div>

				{/* Headline */}
				<div className="text-center mt-6 mb-10">
					<h1
						className="text-3xl md:text-5xl font-semibold bg-clip-text text-transparent"
						style={{
							backgroundImage:
								'linear-gradient(91.15deg, #905E26 -21.69%, #F5EC9B 46.73%, #905E26 129.71%)',
						}}
					>
						The Amazon of Real Estate
					</h1>
					<p className="mt-3 text-base md:text-lg text-[#F5EC9B] tracking-wide">
						Explore new world in real estate
					</p>
				</div>

				{/* Icon Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
					{/* Real Estate */}
					<button
						className="group bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 md:p-6 flex flex-col items-center text-center transition"
						onClick={() => navigate('/services')}
					>
						<img src={realEstateIcon} alt="Real Estate" className="h-14 md:h-16 w-auto mb-3" />
						<span className="text-white text-sm md:text-base">Real Estate</span>
					</button>

					{/* Catalogue */}
				<button
					className="group bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 md:p-6 flex flex-col items-center text-center transition"
				>
						<img src={catalogueIcon} alt="Catalogue" className="h-14 md:h-16 w-auto mb-3" />
						<span className="text-white text-sm md:text-base">Catalogue</span>
					</button>

					{/* Interior Design */}
				<button
					className="group bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 md:p-6 flex flex-col items-center text-center transition"
				>
						<img src={interiorDesignIcon} alt="Interior Design" className="h-14 md:h-16 w-auto mb-3" />
						<span className="text-white text-sm md:text-base">Interior Design</span>
					</button>

					{/* Services */}
				<button
					className="group bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 md:p-6 flex flex-col items-center text-center transition"
				>
						<img src={servicesIcon} alt="Services" className="h-14 md:h-16 w-auto mb-3" />
						<span className="text-white text-sm md:text-base">Services</span>
					</button>
				</div>

				{/* Enter CTA */}
				<div className="mt-10 mb-6">
					<button
						onClick={() => navigate('/services')}
						className="px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
						style={{
							backgroundColor: '#fcfaeb',
							boxShadow: '5px 5px 5px 0px #905E2633 inset, -5px -5px 5px 0px #EFEAC5 inset',
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
                    <WebMobileLogin
                        onClose={() => setModalView(null)}
                        onSwitchToSignup={() => setModalView('signup')}
                    />
                </div>
            )}
		</div>
	);
};

export default LandingPageV3_2; 