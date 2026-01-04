import React from 'react';
import FeaturedPropertiesHeading from './FeaturedPropertiesHeading';

const partnerLogos: string[] = Array.from({ length: 8 }, (_, index) =>
	new URL(`../../assets/images/v3.2/partners/${index + 1}.png`, import.meta.url).href
);

const PartnersMarquee: React.FC = () => {
	return (
		<section className="w-full">
			<div className="max-w-[1720px] mx-auto px-10 md:px-20 py-10 md:py-14">
				<div className="flex justify-center">
					<FeaturedPropertiesHeading text="Our Beloved Partners" className="text-2xl md:text-4xl font-semibold" />
				</div>
				<div className="mt-8 md:mt-10 vv-partners-marquee overflow-hidden">
					<div className="vv-marquee-track flex items-center gap-16 md:gap-24">
						{[...partnerLogos, ...partnerLogos].map((src, idx) => (
							<img
								key={idx}
								src={src}
								alt="Partner logo"
								className="h-8 md:h-10 lg:h-12 object-contain opacity-90 select-none"
								draggable={false}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default PartnersMarquee; 