import React from 'react';
import { useTranslation } from 'react-i18next';

const V3Footer: React.FC = () => {
	const { t } = useTranslation();
	const [email, setEmail] = React.useState('');

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
	}

	return (
		<footer className="w-full mt-auto">
			<div className="text-white" style={{ background: 'var(--Green, rgba(0, 66, 54, 1))' }}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
					{/* Top grid: Brand/Address, Links, Help, Newsletter */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-12">
						{/* Brand + Address */}
						<div>
							<div className="text-2xl font-semibold tracking-tight">{t('footer.brandName')}</div>
							<p className="mt-6 text-white/80 text-sm max-w-xs leading-relaxed">
								{t('footer.address.line1')}
								<br />
								{t('footer.address.line2')}
							</p>
						</div>

						{/* Links */}
						<div>
							<div className="text-white/60 text-sm font-semibold tracking-wide">{t('footer.columns.links')}</div>
							<ul className="mt-8 space-y-6 text-[15px]">
								<li><a href="/" className="hover:opacity-90 transition-opacity">{t('footer.linksMap.home')}</a></li>
								<li><a href="/v3/real-estate" className="hover:opacity-90 transition-opacity">{t('footer.linksMap.catalog')}</a></li>
								<li><a href="/about" className="hover:opacity-90 transition-opacity">{t('footer.linksMap.about')}</a></li>
								<li><a href="/contact" className="hover:opacity-90 transition-opacity">{t('footer.linksMap.contact')}</a></li>
							</ul>
						</div>

						{/* Help */}
						<div>
							<div className="text-white/60 text-sm font-semibold tracking-wide">{t('footer.columns.help')}</div>
							<ul className="mt-8 space-y-6 text-[15px]">
								<li><a href="/payments" className="hover:opacity-90 transition-opacity">{t('footer.linksMap.paymentOptions')}</a></li>
								<li><a href="/returns" className="hover:opacity-90 transition-opacity">{t('footer.linksMap.returns')}</a></li>
								<li><a href="/privacy" className="hover:opacity-90 transition-opacity">{t('footer.linksMap.privacyPolicies')}</a></li>
							</ul>
						</div>

						{/* Newsletter */}
						<div>
							<div className="text-white/60 text-sm font-semibold tracking-wide">{t('footer.columns.newsletter')}</div>
							<form onSubmit={handleSubmit} className="mt-8">
								<div className="flex items-center gap-8">
									<div className="flex-1 max-w-md">
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder={t('footer.newsletter.placeholder') as string}
											className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white/70 focus:outline-none placeholder:text-white/70 text-white py-2"
											required
										/>
									</div>
									<button type="submit" className="text-sm uppercase tracking-wide text-white/80 hover:text-white transition-colors">
										{t('footer.newsletter.button')}
									</button>
									<div className="h-px w-28" style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }} />
								</div>
							</form>
						</div>
					</div>

					{/* Bottom divider and copyright */}
					<div className="mt-16 border-t border-white/30" />
					<div className="mt-6 text-sm text-white/80">{t('footer.yearCopyright', { year: new Date().getFullYear() })}</div>
				</div>
			</div>
		</footer>
	);
};

export default V3Footer; 