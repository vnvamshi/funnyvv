import React from 'react';

type Props = {
	text?: string;
	className?: string;
};

const goldGradient = 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)';

const FeaturedPropertiesHeading: React.FC<Props> = ({ text = 'Featured Properties', className = '' }) => {
	return (
		<div className={`relative inline-block ${className} heading-float-in`} style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
			{/* Stroke layer */}
			<span
				aria-hidden
				className="absolute inset-0 select-none"
				style={{ WebkitTextStroke: '0.35px rgba(0,66,54,1)', color: 'transparent' }}
			>
				{text}
			</span>
			{/* Fill layer with shimmer */}
			<span
				className="relative select-none heading-gold-shimmer"
				style={{ backgroundImage: goldGradient, WebkitBackgroundClip: 'text', color: 'transparent', backgroundClip: 'text' }}
			>
				{text}
			</span>
		</div>
	);
};

export default FeaturedPropertiesHeading; 