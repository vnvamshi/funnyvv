import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import bgImage from '../../assets/images/v3.2/realestateback.png';
import flatIcon from '../../assets/images/v3.2/flat-apartment.png';
import villaIcon from '../../assets/images/v3.2/villa.png';
import officeIcon from '../../assets/images/v3.2/office.png';
import landIcon from '../../assets/images/v3.2/land.png';
import retailIcon from '../../assets/images/v3.2/retail.png';
import aiModeIcon from '../../assets/images/v3.2/ai-mode.png';
import micIcon from '../../assets/images/v3.2/mic-icon.png';
import sendIcon from '../../assets/images/v3.2/sent-icon.png';
import { getSelectedCountries, GeocodingFeature, searchAddressSuggestions } from '../../utils/api';
import { useAIMode } from '../../contexts/AIModeContext';
import { useChatbot } from '../../contexts/ChatbotContext';

const iconMap: Record<string, string> = {
	flat: flatIcon,
	villa: villaIcon,
	land: landIcon,
	office: officeIcon,
	retail: retailIcon
};

type CategoryItem = { key: string; label: string; icon: string };

type CountryItem = {
	country: string;
	flag_svg?: string;
	flag_png?: string;
	country_code?: string;
};

const DEFAULT_COUNTRY = 'USA';
const DEFAULT_FLAG = 'https://flagcdn.com/w40/us.png';

const RealEstateHero: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isAIEnabled, toggleAI } = useAIMode();
	const { openChatbot } = useChatbot();

	const tabLabels = React.useMemo(() => (t('realEstateHero.tabs', { returnObjects: true }) as string[]) || [], [t]);
	const categories = React.useMemo(() => {
		const items = (t('realEstateHero.categories', { returnObjects: true }) as Array<{ key: string; label: string }>) || [];
		return items.map((it) => ({ ...it, icon: iconMap[it.key] })) as CategoryItem[];
	}, [t]);

	const [activeTab, setActiveTab] = React.useState<string>('');
	const [activeCategory, setActiveCategory] = React.useState<string>('flat');
	const [query, setQuery] = React.useState<string>('');
	const [selectedLocation, setSelectedLocation] = React.useState<GeocodingFeature | null>(null);
	const [suggestions, setSuggestions] = React.useState<GeocodingFeature[]>([]);
	const [selectedIndex, setSelectedIndex] = React.useState(-1);
	const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);

	// Countries dropdown
	const [countries, setCountries] = React.useState<CountryItem[]>([]);
	const [selectedCountry, setSelectedCountry] = React.useState<string>(DEFAULT_COUNTRY);
	const [selectedFlagUrl, setSelectedFlagUrl] = React.useState<string>(DEFAULT_FLAG);
	const [isCountryOpen, setIsCountryOpen] = React.useState<boolean>(false);
	const countryRef = React.useRef<HTMLDivElement | null>(null);

	React.useEffect(() => {
		if (!activeTab && tabLabels.length > 0) setActiveTab(tabLabels[0]);
	}, [tabLabels, activeTab]);

	React.useEffect(() => {
		const fetchCountries = async () => {
			try {
				const data = await getSelectedCountries();
				if (data && Array.isArray(data.countries)) {
					setCountries(data.countries as CountryItem[]);
					// Try to find USA in the returned list to get its official flag
					const usa = (data.countries as CountryItem[]).find((c) => c.country === DEFAULT_COUNTRY);
					if (usa && (usa.flag_png || usa.flag_svg)) {
						setSelectedFlagUrl((usa.flag_png || usa.flag_svg) as string);
					}
				}
			} catch (e) {
				// silent fail; keep defaults
			}
		};
		fetchCountries();
	}, []);

	React.useEffect(() => {
		const onClickOutside = (e: MouseEvent) => {
			if (isCountryOpen && countryRef.current && !countryRef.current.contains(e.target as Node)) {
				setIsCountryOpen(false);
			}
		};
		document.addEventListener('mousedown', onClickOutside);
		return () => document.removeEventListener('mousedown', onClickOutside);
	}, [isCountryOpen]);

	// Close suggestions when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Element;
			if (!target.closest('.search-container') && !target.closest('.suggestions-popover')) {
				setSuggestions([]);
				setSelectedIndex(-1);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Debounced search for suggestions
	const debounceRef = React.useRef<number | undefined>(undefined);
	
	React.useEffect(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		
		if (!isAIEnabled && query.trim().length >= 2) {
			debounceRef.current = window.setTimeout(async () => {
				setIsLoadingSuggestions(true);
				try {
					const countryCode = selectedCountry === 'USA' ? 'US' : 'IN';
					const response = await searchAddressSuggestions(query, countryCode, 8);
					setSuggestions(response.features);
					setSelectedIndex(-1);
				} catch (error) {
					console.error('Error fetching suggestions:', error);
					setSuggestions([]);
				} finally {
					setIsLoadingSuggestions(false);
				}
			}, 300);
		} else {
			setSuggestions([]);
		}
		
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [query, isAIEnabled, selectedCountry]);

	const handleLocationSelect = (suggestion: GeocodingFeature) => {
		setSelectedLocation(suggestion);
		setQuery(suggestion.properties.label);
		setSuggestions([]);
		setSelectedIndex(-1);
		console.log('Selected location:', suggestion);
	};

	const handleSearch = () => {
		if (query.trim()) {
			if (isAIEnabled) {
				// Open chatbot with the query
				openChatbot(query);
			} else {
				// Navigate to map search with location data if available
				if (selectedLocation) {
					// Pass location data to the map search
					navigate('/v3/map-search', { 
						state: { 
							location: selectedLocation,
							query: query 
						} 
					});
				} else {
					// Navigate to map search with just the query
					navigate('/v3/map-search', { 
						state: { query: query } 
					});
				}
			}
		}
	};

	const handleInputClick = () => {
		if (isAIEnabled) {
			// Open chatbot immediately when AI mode is enabled
			openChatbot(query);
		}
	};

	return (
		<section className="w-full" style={{ position: 'relative' }}>
			<div
				className="w-full bg-center bg-cover"
				style={{
					backgroundImage: `url(${bgImage})`
				}}
			>
				{/* Gradient overlay */}
				<div
					className="w-full"
					style={{
						background: 'radial-gradient(45.7% 45.7% at 50% 50%, rgba(0, 66, 54, 0.56) 0%, rgba(0, 55, 45, 0.665) 33.17%, rgba(0, 39, 32, 0.7) 100%)'
					}}
				>
											<div className="max-w-7xl mx-auto px-2 md:px-6 py-8 md:py-14 relative">
						<h1 className="animate-hero-fade text-center font-dmserif text-[18px] md:text-[34px] lg:text-[40px] leading-tight whitespace-nowrap -mt-3 md:-mt-5" style={{ backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>
							{t('realEstateHero.title')}
						</h1>

						{/* Glass card */}
						<div className="animate-glass-pop mt-4 md:mt-6 rounded-[20px] md:rounded-[24px] backdrop-blur-[12px] relative p-3 md:p-4 max-w-[900px] md:max-w-[800px] mx-auto" style={{ border: '1px solid rgba(255, 255, 255, 0.22)', background: 'rgba(255, 255, 255, 0.08)', boxShadow: '0 12px 28px rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
							{/* Edge vignette */}
							<span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.18)' }} />
							{/* Light gradient overlay */}
							{/* <span className="pointer-events-none absolute -top-1/4 left-0 right-0 h-1/2" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0) 100%)' }} /> */}
							{/* Tabs */}
							<div className="flex items-center gap-8 md:gap-12 text-white/90 px-4 pt-2">
								{tabLabels.map((label) => (
									<button
										key={label}
										onClick={() => setActiveTab(label)}
										className={`relative pb-2 px-2 md:px-4 text-sm md:text-base ${activeTab === label ? 'font-semibold' : 'opacity-80'}`}
									>
										{label}
										{activeTab === label && (
											<span className="absolute left-0 right-0 -bottom-[2px] h-[3px]" style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }} />
										)}
									</button>
								))}
							</div>

							{/* Categories */}
							<div className="mt-3 md:mt-4 flex items-center justify-center gap-2 md:gap-2.5 px-2 md:px-4">
								{categories.map((c, idx) => {
									const isActive = activeCategory === c.key;
									return (
										<button
											key={c.key}
											onClick={() => setActiveCategory(c.key)}
											className={`animate-category-pop`} style={{ animationDelay: `${100 + idx * 70}ms` }}
										>
											<div className={`flex flex-col items-center justify-center transition rounded-xl md:rounded-2xl min-w-[110px] md:min-w-[130px] px-3 py-3 md:px-4 md:py-4 ${isActive ? 'gradient-border-mask bg-[rgba(0,66,54,0.35)]' : ''}`}>
												<img src={c.icon} alt={c.label} className="w-8 h-8 md:w-10 md:h-10" />
												<span className={`mt-2 text-[12px] md:text-[13px] ${isActive ? 'text-white' : 'text-white/80'}`}>{c.label}</span>
											</div>
										</button>
									);
								})}
							</div>

							{/* Ask input */}
							<div className="mt-4 md:mt-6 px-2 md:px-4">
								<div className="search-container w-full rounded-[14px] bg-white/92 md:bg-white/95" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.18)' }}>
									<div className="px-4 pt-3">
										{isAIEnabled ? (
											<input
												type="text"
												value={query}
												onChange={(e) => setQuery(e.target.value)}
												onClick={handleInputClick}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														handleSearch();
													}
												}}
												placeholder={t('realEstateHero.askPlaceholder')}
												className="w-full bg-transparent outline-none text-[15px] text-gray-800 placeholder-gray-500 py-3 cursor-pointer"
											/>
										) : (
											<input
												type="text"
												value={query}
												onChange={(e) => setQuery(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
															handleLocationSelect(suggestions[selectedIndex]);
														} else {
															handleSearch();
														}
													} else if (e.key === 'ArrowDown') {
														e.preventDefault();
														setSelectedIndex(prev => 
															prev < suggestions.length - 1 ? prev + 1 : prev
														);
													} else if (e.key === 'ArrowUp') {
														e.preventDefault();
														setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
													} else if (e.key === 'Escape') {
														setSuggestions([]);
														setSelectedIndex(-1);
													}
												}}
												placeholder="Search for properties"
												className="w-full bg-transparent outline-none text-[15px] text-gray-800 placeholder-gray-500 py-3 cursor-pointer"
											/>
										)}
									</div>
									
									<div className="px-4 pb-3 mt-1 flex items-center justify-between">
										<div className="flex items-center gap-4">
											{/* Country dropdown */}
											<div ref={countryRef} className="relative">
												<button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setIsCountryOpen(true)} className="pr-3 py-2 flex items-center gap-2 border-r border-black/10">
													<img src={selectedFlagUrl} alt={selectedCountry} className="w-7 h-5 rounded-sm object-cover" />
													<span className="text-gray-700 text-sm">{selectedCountry}</span>
													<svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
												</button>
												{isCountryOpen && (
													<div className="absolute left-0 top-full mt-2 z-50 w-56 max-h-60 overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-black/5" onMouseDown={(e)=>e.preventDefault()}>
														{countries.map((ct) => (
															<button
																key={ct.country}
																onClick={() => {
																	setSelectedCountry(ct.country);
																	setSelectedFlagUrl((ct.flag_png || ct.flag_svg || selectedFlagUrl) as string);
																	setIsCountryOpen(false);
																}}
																className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50" type="button"
															>
																{ct.flag_png || ct.flag_svg ? (
																	<img src={(ct.flag_png || ct.flag_svg) as string} alt={ct.country} className="w-7 h-5 rounded-sm object-cover" />
																) : (
																	<span className="w-5 h-5 rounded-sm bg-gray-200" />
																)}
																<span className="text-sm text-gray-700">{ct.country}</span>
															</button>
														))}
													</div>
												)}
											</div>
											{/* AI mode */}
											<div className="hidden md:flex items-center gap-3">
												<img src={aiModeIcon} alt={t('realEstateHero.aiMode') || 'AI Mode'} className={`transition-transform duration-300 ${isAIEnabled ? 'scale-110' : 'scale-100'} w-6 h-6`} />
												<span className="text-[13px] text-[#004236]">{t('realEstateHero.aiMode')}</span>
												<button
													type="button"
													aria-pressed={isAIEnabled}
													onClick={toggleAI}
													className="relative w-12 h-7 rounded-full gradient-border-mask overflow-hidden transition-all duration-300 ease-out"
													style={{ background: 'transparent' }}
												>
													<span
														className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isAIEnabled ? 'opacity-70' : 'opacity-30'}`}
														style={{ background: 'linear-gradient(111.83deg, rgba(0,66,54,0.35) 11.73%, rgba(0,126,103,0.35) 96.61%)' }}
													/>
													<span
														className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${isAIEnabled ? 'right-1' : 'left-1'} ${isAIEnabled ? 'scale-110' : 'scale-95'}`}
														style={{ width: 20, height: 20, borderRadius: 9999, background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', boxShadow: isAIEnabled ? '0 0 10px rgba(0,126,103,0.45), 0 2px 6px rgba(0,0,0,0.25)' : '0 2px 6px rgba(0,0,0,0.3)' }}
													/>
												</button>
											</div>
										</div>
										<div className="flex items-center gap-1">
											{/* Mic */}
											<button type="button" className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:opacity-80" style={{ background: 'rgba(0, 75, 61, 0.2)' }}>
												<img src={micIcon} alt="mic" className="w-6 h-6" />
											</button>
											{/* Send */}
											<button 
												type="button" 
												onClick={handleSearch}
												className="ml-1 w-12 h-12 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:opacity-80"
											>
												<img src={sendIcon} alt="send" className="w-11 h-11" />
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						
						{/* Suggestions popover - positioned outside glass card */}
						{!isAIEnabled && (suggestions.length > 0 || isLoadingSuggestions) && (
							<div className="suggestions-popover absolute top-full left-1/2 transform -translate-x-1/2 -mt-[130px] z-[100] w-[760px] max-w-[820px] md:max-w-[800px] px-2 md:px-4">
								<div className="rounded-[14px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)' }}>
									{isLoadingSuggestions ? (
										<div className="flex items-center justify-center py-6">
											<div className="w-5 h-5 border-2 border-gray-300 border-t-[#905E26] rounded-full animate-spin"></div>
											<span className="ml-3 text-sm text-gray-600">Searching...</span>
										</div>
									) : (
										<div className="py-2">
											{suggestions.slice(0, 5).map((suggestion, index) => (
												<button
													key={suggestion.properties.id}
													type="button"
													onClick={() => handleLocationSelect(suggestion)}
													className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors ${
														index === selectedIndex ? 'bg-blue-50/80' : ''
													} ${index === 0 ? 'rounded-t-[14px]' : ''} ${index === Math.min(4, suggestions.length - 1) ? 'rounded-b-[14px]' : ''}`}
												>
													{/* Location icon */}
													<svg className="w-4 h-4 text-[#905E26] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
													</svg>
													<div className="flex flex-col min-w-0 flex-1">
														<span className="text-sm font-medium text-gray-900 truncate">
															{suggestion.properties.name}
														</span>
														<span className="text-xs text-gray-500 truncate">
															{suggestion.properties.label}
														</span>
													</div>
												</button>
											))}
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default RealEstateHero; 