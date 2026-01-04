import React from 'react';

const helpItems: Array<{
	id: string;
	icon?: React.ReactNode;
	title: string;
	description?: string;
	ctaLabel: string;
	onClick?: () => void;
}> = [
	{
		id: 'sell',
		title: 'Want to sell a property in Vistaview',
		ctaLabel: 'Become a builder'
	},
	{
		id: 'lease',
		title: 'Want to lease your property for commercial',
		ctaLabel: 'Lease for commercial'
	},
	{
		id: 'agent',
		title: 'Want to be successful real estate agent',
		ctaLabel: 'Become an Agent'
	},
	{
		id: 'rent',
		title: 'Want to rent your property for monthly',
		ctaLabel: 'Rent your property'
	},
	{
		id: 'buy',
		title: 'Want to buy a new home in Vistaview',
		ctaLabel: 'Buy Home'
	}
];

const HelpHowWeHelp = () => {
	return (
		<section
			className="w-full"
			style={{
				backgroundImage:
					"radial-gradient(45.7% 45.7% at 50% 50%, rgba(0, 66, 54, 0.64) 0%, rgba(0, 55, 45, 0.76) 33.17%, rgba(0, 39, 32, 0.8) 100%), url('/assets/images/v3.2/help-back.png')",
				backgroundSize: 'cover',
				backgroundPosition: 'center'
			}}
		>
			<div className="max-w-[1440px] mx-auto px-3 sm:px-5 md:px-8 py-8 md:py-10 lg:py-12">
				<h2 className="text-white text-center text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.02em]">
					See how Vistaview can help
				</h2>

				<div className="mt-6 md:mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-5 md:gap-6">
					{helpItems.map((item) => (
						<div
							key={item.id}
							className="rounded-2xl border-2 border-white bg-white/5 backdrop-blur-[2px] p-5 md:p-6 flex flex-col justify-between min-h-[150px]"
						>
							<div>
								{/* Icon placeholder (kept for spacing parity with design) */}
								<div className="h-10 w-10 rounded-md border-2 border-white text-white/80 flex items-center justify-center mb-3">
									<span className="text-sm">🏠</span>
								</div>
								<p className="text-white/90 text-base md:text-lg leading-snug">
									{item.title}
								</p>
							</div>
							<div className="mt-4">
								<button
									type="button"
									className="w-full rounded-lg bg-white text-teal-900 text-sm md:text-base font-semibold py-2.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 whitespace-nowrap"
								>
									{item.ctaLabel}
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HelpHowWeHelp; 