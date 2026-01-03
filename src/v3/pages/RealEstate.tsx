import React from 'react';
import { useTranslation } from 'react-i18next';
import RealEstateHero from '../components/RealEstateHero';
import FeaturedPropertiesCarousel from '../components/FeaturedPropertiesCarousel';
import PartnersMarquee from '../components/PartnersMarquee';
import PremiumFeatures from '../components/PremiumFeatures';
import PremiumProperties from '../components/PremiumProperties';
import PopularCitiesCarousel from '../components/PopularCitiesCarousel';
import HelpHowWeHelp from '../components/HelpHowWeHelp';
import AboutVistaView from '../components/AboutVistaView';
import { useFloatingAskBar } from '../../contexts/FloatingAskBarContext';

const V3RealEstate = () => {
	const { t } = useTranslation();
	const { show, hide } = useFloatingAskBar();
	const heroRef = React.useRef<HTMLDivElement | null>(null);

	React.useEffect(() => {
		// Ensure hidden on mount
		hide();
		const target = heroRef.current;
		if (!target) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// When hero is NOT intersecting (scrolled past), show the bar
					if (entry.isIntersecting) {
						// still in view -> keep hidden
						hide();
					} else {
						show();
					}
				});
			},
			{ root: null, threshold: 0 }
		);
		observer.observe(target);
		return () => {
			observer.disconnect();
		};
	}, [show, hide]);

	const headingStyle: React.CSSProperties = {
		backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		color: 'transparent'
	};

	return (
		<div className="w-full">
			<div ref={heroRef}>
				<RealEstateHero />
			</div>
			{/* Featured properties carousel */}
			<FeaturedPropertiesCarousel />
			{/* Partners marquee */}
			<PartnersMarquee />
			{/* Premium features section */}
			<PremiumFeatures />
			{/* Premium properties grid */}
			<PremiumProperties />
			{/* Popular Cities carousel */}
			<PopularCitiesCarousel />
			{/* How we help section */}
			<HelpHowWeHelp />
			{/* About VistaView section */}
			<AboutVistaView />
		</div>
	);
};

export default V3RealEstate; 