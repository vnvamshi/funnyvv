import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../../assets/images/v3.2/main-back.png';
import realEstateIcon from '../../assets/images/v3.2/real-estate-icon.png';
import catalogueIcon from '../../assets/images/v3.2/catalogue-icon.png';
import interiorDesignIcon from '../../assets/images/v3.2/interior-design-icon.png';
import servicesIcon from '../../assets/images/v3.2/services-icon.png';
import V3LandingHeader from '../components/V3LandingHeader';
import { animated, useSpring, useTrail } from '@react-spring/web';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18nV3 from '../i18n';
import { useFloatingAskBar } from '../../contexts/FloatingAskBarContext';

const V3LandingContent = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { show } = useFloatingAskBar();

	React.useEffect(() => {
		show();
	}, [show]);

	const labelStyle: React.CSSProperties = {
		backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		color: 'transparent'
	};

	// Background slow zoom and fade-in
	const backgroundSpring = useSpring({
		from: { opacity: 0, scale: 1.06 },
		to: async (next) => {
			await next({ opacity: 1 });
			await next({ scale: 1 });
		},
		config: { tension: 120, friction: 26 },
		delay: 50
	});

	// Overlay fade-in for subtle reveal
	const overlaySpring = useSpring({
		from: { opacity: 0 },
		to: { opacity: 1 },
		config: { tension: 170, friction: 30 },
		delay: 150
	});

	// Headline and subtext entrance
	const headingSpring = useSpring({
		from: { opacity: 0, y: 20 },
		to: { opacity: 1, y: 0 },
		config: { tension: 170, friction: 22 },
		delay: 200
	});
	const subheadingSpring = useSpring({
		from: { opacity: 0, y: 16 },
		to: { opacity: 1, y: 0 },
		config: { tension: 170, friction: 22 },
		delay: 260
	});

	// Items for the grid with trail animation
	const gridMeta = [
		{ icon: realEstateIcon, path: '/v3/real-estate' },
		{ icon: catalogueIcon, path: '/v3/product-catalog' },
		{ icon: interiorDesignIcon, path: null },
		{ icon: servicesIcon, path: null }
	] as const;
	const gridLabels = t('landing.grid.items', { returnObjects: true }) as Array<{ label: string }>;
	const trails = useTrail(gridMeta.length, {
		from: { opacity: 0, y: 16 },
		to: { opacity: 1, y: 0 },
		config: { tension: 180, friction: 20 },
		delay: 350
	});

	const isInsideV3Layout = location.pathname.startsWith('/v3');

	return (
		<div className="relative w-full min-h-screen overflow-hidden">
			<animated.div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, ...backgroundSpring }} />
			<animated.div className="absolute inset-0" style={{ background: 'radial-gradient(45.7% 45.7% at 50% 50%, rgba(0, 66, 54, 0.72) 0%, rgba(0, 55, 45, 0.855) 33.17%, rgba(0, 39, 32, 0.9) 100%)', ...overlaySpring }} />

			{!isInsideV3Layout && <V3LandingHeader />}

			<div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-10 pt-240 md:pt-20 gap-10 min-h-screen">
				<animated.h1
					className="text-center bg-clip-text text-transparent font-italiana"
					style={{
						fontSize: '90px',
						lineHeight: '100%',
						letterSpacing: '0%',
						backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
						...headingSpring,
						transform: headingSpring.y.to((v) => `translateY(${v}px)`)
					}}
				>
					{t('landing.hero.title')}
					</animated.h1>
				<animated.p className="font-doppio-one text-[24px] -mt-8" style={{ color: '#F5EC9B', letterSpacing: '0.05em', ...subheadingSpring, transform: subheadingSpring.y.to((v) => `translateY(${v}px)`) }}>
					{t('landing.hero.subtitle')}
				</animated.p>

				<div className="grid mt-5 grid-cols-2 md:grid-cols-4 gap-2 md:gap-2 w-full max-w-5xl mx-auto">
					{trails.map((styles, index) => {
						const meta = gridMeta[index];
						const label = gridLabels?.[index]?.label || '';
						return (
						<animated.button
								key={index}
								className="group flex flex-col items-center text-center transition"
							onClick={() => { if (meta.path) navigate(meta.path); }}
								style={{ ...styles, transform: styles.y.to((v) => `translateY(${v}px)`) }}
							>
								<div className="relative p-8 rounded-3xl gradient-border-mask bg-[rgba(0,66,54,0.7)]">
									<img src={meta.icon} alt={label} className="h-10 md:h-12 w-auto opacity-90" />
								</div>
								<span className="mt-3 font-doppio-one text-[20px] md:text-[22px]" style={labelStyle}>{label}</span>
							</animated.button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

const V3Landing = () => {
	return (
		<I18nextProvider i18n={i18nV3}>
			<V3LandingContent />
		</I18nextProvider>
	);
};

export default V3Landing; 