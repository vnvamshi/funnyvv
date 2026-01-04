import React from 'react';
import GradOverlay from '../../assets/images/v3.2/premium-style-gradient.png';
import VRTourIcon from '../../assets/images/v3.2/vr-tour-icon.png';
import Img1 from '../../assets/images/v3.2/premium/1.png';
import Img2 from '../../assets/images/v3.2/premium/2.png';
import Img3 from '../../assets/images/v3.2/premium/3.png';
import Img4 from '../../assets/images/v3.2/premium/4.png';
import Img5 from '../../assets/images/v3.2/premium/5.png';
import Img6 from '../../assets/images/v3.2/premium/6.png';
import Img7 from '../../assets/images/v3.2/premium/7.png';
import Img8 from '../../assets/images/v3.2/premium/8.png';
import { VR_TOUR_URL } from '../../utils/vrTourUrl';

const PremiumProperties: React.FC = () => {
	const goldTextGradient: React.CSSProperties = {
		backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		color: 'transparent'
	};

	const images = [Img1, Img2, Img3, Img4, Img5, Img6, Img7, Img8];

	return (
		<section className="w-full" style={{ background: 'white' }}>
			<div className="mx-auto max-w-screen-2xl px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 md:py-14">
				<h2 className="text-center text-xl md:text-2xl lg:text-3xl font-semibold mb-8 md:mb-10" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
					<span className="relative inline-block">
						<span aria-hidden className="absolute inset-0 select-none" style={{ WebkitTextStroke: '0.35px rgba(0,66,54,1)', color: 'transparent' }}>
							Premium Properties
						</span>
						<span className="relative select-none" style={goldTextGradient}>
							Premium Properties
						</span>
					</span>
				</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-3 auto-rows-[12rem] sm:auto-rows-[14rem] md:auto-rows-[16rem] lg:auto-rows-[16rem]">
					{images.map((src, idx) => (
						<div key={idx} className={`rounded-2xl h-[100%] ${(idx === 0 || idx === 3) ? 'sm:row-span-2 md:row-span-2 lg:row-span-2' : ''}`}>
							<div className="relative overflow-hidden rounded-2xl h-full">
															{/* property image */}
								<img
									src={src}
									alt={`Premium property ${idx + 1}`}
									className="relative h-full w-full object-cover rounded-2xl z-[1]"
								/>
								{/* gradient should overlay the bottom portion, not cover the button */}
								<div className="absolute inset-0 rounded-2xl z-[2] pointer-events-none" style={{ backgroundImage: `url(${GradOverlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

															{/* VR Tour badge */}
							<div className="absolute left-3 bottom-3 z-[2]">
								<div className="gold-gradient-frame rounded-md" style={{ borderRadius: '8px', padding: '1.5px' }}>
									<div
										className="flex items-center gap-2 px-3 py-2 rounded-md text-white text-xs md:text-sm cursor-pointer hover:opacity-90 transition-opacity"
										style={{
											background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
											boxShadow: '5px 5px 5px 0px #FFF49233 inset, -5px -5px 10px 0px #FFB86726 inset, 10px 10px 10px 0px #0C656E1A'
										}}
										onClick={() => window.open(VR_TOUR_URL, '_blank', 'noopener,noreferrer')}
									>
										<img src={VRTourIcon} alt="VR" className="h-4 w-4 md:h-5 md:w-5 object-contain" />
										<span>VR Tour</span>
									</div>
								</div>
							</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default PremiumProperties; 