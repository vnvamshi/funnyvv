import React from 'react';
import VRTourIcon from '../../assets/images/v3.2/vr-tour-big-icon.png';
import MortgageIcon from '../../assets/images/v3.2/mortgate-big-icon.png';
import ForecastIcon from '../../assets/images/v3.2/forcase-big-icon.png';
import AIChatIcon from '../../assets/images/v3.2/ai-chat-big-icon.png';
import View360Icon from '../../assets/images/v3.2/360-view-big-icon.png';
import { VR_TOUR_URL } from '../../utils/vrTourUrl';

const PremiumFeatures: React.FC = () => {
	const goldTextGradient: React.CSSProperties = {
		backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		color: 'transparent'
	};

	const features = [
		{ label: 'VR Tour', icon: VRTourIcon },
		{ label: 'Mortgage Calculator', icon: MortgageIcon },
		{ label: 'Property AI Forecast', icon: ForecastIcon },
		{ label: 'AI chat model', icon: AIChatIcon },
		{ label: '360 View', icon: View360Icon }
	];

	return (
		<section
			className="w-full"
			style={{ background: 'var(--Green, rgba(0, 66, 54, 1))' }}
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
				<h2 className="text-center text-xl md:text-2xl lg:text-3xl font-semibold mb-8 md:mb-10" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
					<span className="relative inline-block">
						<span aria-hidden className="absolute inset-0 select-none" style={{ WebkitTextStroke: '0.35px rgba(0,66,54,1)', color: 'transparent' }}>
							Explore VistaView Premium Features
						</span>
						<span className="relative select-none" style={goldTextGradient}>
							Explore VistaView Premium Features
						</span>
					</span>
				</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
					{features.map((f) => (
						<div key={f.label} className="gold-gradient-frame rounded-2xl">
							<div
								className="group rounded-2xl h-full w-full flex flex-col items-center justify-center gap-3 md:gap-4 p-6 cursor-pointer"
								style={{ background: 'var(--Green, rgba(0, 66, 54, 1))' }}
								onClick={() => {
									if (f.label === 'VR Tour' || f.label === '360 View') {
										window.open(VR_TOUR_URL, '_blank', 'noopener,noreferrer');
									}
								}}
							>
								<img src={f.icon} alt={f.label} className="h-16 w-16 md:h-20 md:w-20 object-contain transform-gpu transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1" />
								<p className="text-sm md:text-base text-center leading-snug transition-transform duration-300 ease-out group-hover:translate-y-0.5" style={goldTextGradient}>{f.label}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default PremiumFeatures; 