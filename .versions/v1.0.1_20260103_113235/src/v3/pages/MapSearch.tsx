import React from 'react';
import GoogleMapWithMarker from '../../components/GoogleMapWithMarker';
import { useFloatingAskBar } from '../../contexts/FloatingAskBarContext';
import sampleImg from '../../assets/images/sample.png';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useMoreFiltersDrawer } from '../../pages/HomeSearchList/PropertyListing/logic/useMoreFiltersDrawer';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import plusIcon from '../../assets/images/accordion-plus.svg';
import minusIcon from '../../assets/images/accordion-minus.svg';
import morePng from '../../assets/images/v3.2/more-icon.png';
import sortPng from '../../assets/images/v3.2/sort-icon.png';
import propertiesJson from '../data/properties.json';
import { processProperties } from '../utils/imageMapping';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { persistSelectedPropertyId } from '../../utils/propertyNavigation';

// Icons
const IconChevronDown = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M6 9l6 6 6-6" stroke="#0E5B4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);
const IconSearch = ({ size = 16 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
		<path d="M20 20l-3.5-3.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
	</svg>
);
const IconSliders = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4 6h11M4 12h7M4 18h11" stroke="#0E5B4C" strokeWidth="2" strokeLinecap="round" />
		<circle cx="18" cy="6" r="2" stroke="#0E5B4C" strokeWidth="2" />
		<circle cx="14" cy="12" r="2" stroke="#0E5B4C" strokeWidth="2" />
		<circle cx="18" cy="18" r="2" stroke="#0E5B4C" strokeWidth="2" />
	</svg>
);
const IconSort = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M6 18V6m0 0l-2 2m2-2l2 2M18 6v12m0 0l-2-2m2 2l2-2" stroke="#0E5B4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);
const IconMap = ({ color = '#0E5B4C' }: { color?: string }) => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);
const IconList = ({ color = '#0E5B4C' }: { color?: string }) => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

// Map/List ON-OFF switch control
const MapListSwitch: React.FC<{ value?: 'map' | 'list'; onChange?: (v: 'map' | 'list') => void }> = ({ value = 'map', onChange }) => {
	const isMap = value === 'map';
	return (
		<div className="gradient-border-mask overflow-hidden" style={{ padding: 1.5, borderRadius: 9999 }}>
			<button
				type="button"
				onClick={() => onChange?.(isMap ? 'list' : 'map')}
				className="relative bg-white flex items-center justify-center"
				style={{ borderRadius: 9999, height: 34, width: 80, cursor: 'pointer' }}
			>
				{/* Knob */}
				<div
					className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-200"
					style={{ width: 30, height: 30, background: '#004236', left: isMap ? 2 : 'calc(100% - 32px)' }}
				/>
				{/* Icons */}
				<div className="absolute left-1 top-1/2 -translate-y-1/2 w-[26px] h-[26px] flex items-center justify-center">
					<IconMap color={isMap ? 'white' : '#0E5B4C'} />
				</div>
				<div className="absolute right-1 top-1/2 -translate-y-1/2 w-[26px] h-[26px] flex items-center justify-center">
					<IconList color={isMap ? '#0E5B4C' : 'white'} />
				</div>
			</button>
		</div>
	);
};

// Minimal mock data for markers and property cards
const MOCK_MARKERS = [
	{ position: { lat: 40.868, lng: -73.915 }, title: 'Inwood Residence', address: 'Seaman Ave', city: 'New York', state: 'NY', country: 'USA', price: 1120000, image: sampleImg },
	{ position: { lat: 40.857, lng: -73.903 }, title: 'Marble Hill Home', address: 'W 225th St', city: 'Bronx', state: 'NY', country: 'USA', price: 980000, image: sampleImg },
	{ position: { lat: 40.834, lng: -73.944 }, title: 'Harlem Condo', address: 'Lenox Ave', city: 'New York', state: 'NY', country: 'USA', price: 1399000, image: sampleImg },
	{ position: { lat: 40.82, lng: -73.949 }, title: 'Morningside Heights', address: 'Broadway', city: 'New York', state: 'NY', country: 'USA', price: 1650000, image: sampleImg },
	{ position: { lat: 40.803, lng: -73.955 }, title: 'Upper West Side', address: 'Riverside Dr', city: 'New York', state: 'NY', country: 'USA', price: 2050000, image: sampleImg },
	{ position: { lat: 40.785, lng: -73.97 }, title: 'Central Park West', address: 'CPW', city: 'New York', state: 'NY', country: 'USA', price: 3200000, image: sampleImg },
	{ position: { lat: 40.775, lng: -73.95 }, title: 'Upper East Side', address: 'Lexington Ave', city: 'New York', state: 'NY', country: 'USA', price: 2450000, image: sampleImg },
	{ position: { lat: 40.764, lng: -73.982 }, title: 'Midtown West', address: '8th Ave', city: 'New York', state: 'NY', country: 'USA', price: 1850000, image: sampleImg },
	{ position: { lat: 40.758, lng: -73.985 }, title: 'Times Sq Loft', address: 'Broadway', city: 'New York', state: 'NY', country: 'USA', price: 2100000, image: sampleImg },
	{ position: { lat: 40.748817, lng: -73.985428 }, title: 'Midtown Condo', address: '350 5th Ave', city: 'New York', state: 'NY', country: 'USA', price: 1850000, image: sampleImg },
	{ position: { lat: 40.741, lng: -73.99 }, title: 'Chelsea Gallery Flat', address: '10th Ave', city: 'New York', state: 'NY', country: 'USA', price: 1720000, image: sampleImg },
	{ position: { lat: 40.73, lng: -73.98 }, title: 'Gramercy Park', address: 'E 20th St', city: 'New York', state: 'NY', country: 'USA', price: 1490000, image: sampleImg },
	{ position: { lat: 40.73061, lng: -73.935242 }, title: 'East Village Loft', address: 'E 9th St', city: 'New York', state: 'NY', country: 'USA', price: 1399000, image: sampleImg },
	{ position: { lat: 40.72, lng: -74.0 }, title: 'SoHo Studio', address: 'Spring St', city: 'New York', state: 'NY', country: 'USA', price: 1190000, image: sampleImg },
	{ position: { lat: 40.706086, lng: -74.008584 }, title: 'FiDi Penthouse', address: 'Wall St', city: 'New York', state: 'NY', country: 'USA', price: 2650000, image: sampleImg },
	{ position: { lat: 40.702, lng: -74.014 }, title: 'Battery Park', address: 'Battery Pl', city: 'New York', state: 'NY', country: 'USA', price: 2320000, image: sampleImg },
	{ position: { lat: 40.69, lng: -73.98 }, title: 'DUMBO View', address: 'Water St', city: 'Brooklyn', state: 'NY', country: 'USA', price: 1680000, image: sampleImg },
	{ position: { lat: 40.6782, lng: -73.9442 }, title: 'Brooklyn Brownstone', address: 'Bedford Ave', city: 'Brooklyn', state: 'NY', country: 'USA', price: 1890000, image: sampleImg },
	{ position: { lat: 40.71, lng: -73.93 }, title: 'Williamsburg Loft', address: 'Bedford Ave', city: 'Brooklyn', state: 'NY', country: 'USA', price: 1420000, image: sampleImg },
	{ position: { lat: 40.7282, lng: -73.7949 }, title: 'Queens Family Home', address: 'Main St', city: 'Queens', state: 'NY', country: 'USA', price: 890000, image: sampleImg },
	{ position: { lat: 40.75, lng: -73.86 }, title: 'Jackson Heights', address: '37th Ave', city: 'Queens', state: 'NY', country: 'USA', price: 920000, image: sampleImg },
	{ position: { lat: 40.78, lng: -73.78 }, title: 'Bayside Ranch', address: 'Bell Blvd', city: 'Queens', state: 'NY', country: 'USA', price: 970000, image: sampleImg }
];

// Irregular polygon approximating the searched area around NYC
const NYC_POLYGON = {
	path: [
		{ lat: 40.90, lng: -74.26 },
		{ lat: 40.89, lng: -74.18 },
		{ lat: 40.88, lng: -74.12 },
		{ lat: 40.86, lng: -74.06 },
		{ lat: 40.85, lng: -74.01 },
		{ lat: 40.86, lng: -73.97 },
		{ lat: 40.88, lng: -73.94 },
		{ lat: 40.90, lng: -73.92 },
		{ lat: 40.91, lng: -73.90 },
		{ lat: 40.90, lng: -73.86 },
		{ lat: 40.88, lng: -73.83 },
		{ lat: 40.85, lng: -73.80 },
		{ lat: 40.82, lng: -73.78 },
		{ lat: 40.78, lng: -73.76 },
		{ lat: 40.74, lng: -73.75 },
		{ lat: 40.71, lng: -73.76 },
		{ lat: 40.69, lng: -73.79 },
		{ lat: 40.67, lng: -73.83 },
		{ lat: 40.66, lng: -73.88 },
		{ lat: 40.67, lng: -73.94 },
		{ lat: 40.69, lng: -74.00 },
		{ lat: 40.71, lng: -74.05 },
		{ lat: 40.74, lng: -74.13 },
		{ lat: 40.78, lng: -74.21 },
		{ lat: 40.84, lng: -74.25 },
	],
	fillColor: '#007E67',
	fillOpacity: 0.28,
	strokeColor: '#007E67',
	strokeOpacity: 0.9,
	strokeWeight: 1.5,
};

const MOCK_PROPERTIES = Array.from({ length: 18 }).map((_, idx) => ({
	id: idx + 1,
	title: idx % 2 === 0 ? 'Cap Cana - Modern Ocean and Golf View Villa boasting 5 Large Bedrooms' : 'Cap Cana - Gorgeous 5BR Villa Close to the Beach',
	location: 'Punta Cana, La Altagracia Dominican Republic',
	beds: idx % 2 === 0 ? 5 : 7,
	baths: idx % 2 === 0 ? 7 : 8,
	sqft: idx % 2 === 0 ? 14850 : 13293,
	price: idx % 2 === 0 ? 6000000 : 5000000,
	image: sampleImg
}));

const GoldPill: React.FC<{ children: React.ReactNode; filled?: boolean; className?: string; dense?: boolean; compact?: boolean; circular?: boolean; circleSize?: number; innerClassName?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ children, filled, className = '', dense = false, compact = false, circular = false, circleSize = 34, innerClassName = '', ...rest }) => {
	const wrapperPadding = compact ? 1 : 1;
	const sizeClass = compact ? 'px-2 py-0.5' : dense ? 'px-3 py-1' : 'px-4 py-2';
	if (circular) {
		return (
			<div
				{...rest}
				className={`gradient-border-mask inline-flex items-center justify-center ${className}`}
				style={{ padding: wrapperPadding, borderRadius: 9999 }}
			>
				<div className={`rounded-full ${filled ? 'bg-[#004236]' : 'bg-white'} flex items-center justify-center ${innerClassName}`} style={{ width: circleSize, height: circleSize }}>
					{children}
				</div>
			</div>
		);
	}
	return (
		<div
			{...rest}
			className={`gradient-border-mask rounded-full inline-flex ${className}`}
			style={{ padding: wrapperPadding, borderRadius: 9999 }}
		>
			<div className={`rounded-full ${filled ? 'bg-[#004236]' : 'bg-white'} ${sizeClass} flex items-center gap-2 ${innerClassName}`}>{children}</div>
		</div>
	);
};

type PropertyTypeOption = {
	id: string;
	name: string;
};

const TopFilterArea: React.FC<{
    viewedCount: number;
    totalCount: number;
    viewMode: 'map' | 'list';
    onChangeViewMode: (v: 'map' | 'list') => void;
    onApplyPropertyTypes?: (types: Set<string>) => void;
    onApplyPrice?: (min: number | null, max: number | null) => void;
    onApplyBedsBaths?: (beds: { min: number | null; max: number | null }, baths: { min: number | null; max: number | null }) => void;
    onApplySaleType?: (saleType: string) => void;
    onApplySort?: (sort: string) => void;
    searchLocation?: string;
	maxHoa: string;
	setMaxHoa: (value: string) => void;
	listingTypes: string[];
	setListingTypes: React.Dispatch<React.SetStateAction<string[]>>;
	propertyStatus: string[];
	setPropertyStatus: React.Dispatch<React.SetStateAction<string[]>>;
	parkingSlots: [number, number];
	setParkingSlots: React.Dispatch<React.SetStateAction<[number, number]>>;
	totalSqft: [number, number];
	setTotalSqft: React.Dispatch<React.SetStateAction<[number, number]>>;
	lotSqft: [number, number];
	setLotSqft: React.Dispatch<React.SetStateAction<[number, number]>>;
	selectedAppliances: string[];
	setSelectedAppliances: React.Dispatch<React.SetStateAction<string[]>>;
	selectedIndoor: string[];
	setSelectedIndoor: React.Dispatch<React.SetStateAction<string[]>>;
	selectedOutdoor: string[];
	setSelectedOutdoor: React.Dispatch<React.SetStateAction<string[]>>;
	selectedCommunity: string[];
	setSelectedCommunity: React.Dispatch<React.SetStateAction<string[]>>;
	selectedLifestyles: string[];
	setSelectedLifestyles: React.Dispatch<React.SetStateAction<string[]>>;
	propertyTypeOptions: PropertyTypeOption[];
}> = ({
	viewedCount,
	totalCount,
	viewMode,
	onChangeViewMode,
	onApplyPropertyTypes,
	onApplyPrice,
	onApplyBedsBaths,
	onApplySaleType,
	onApplySort,
	searchLocation,
	maxHoa,
	setMaxHoa,
	listingTypes,
	setListingTypes,
	propertyStatus,
	setPropertyStatus,
	parkingSlots,
	setParkingSlots,
	totalSqft,
	setTotalSqft,
	lotSqft,
	setLotSqft,
	selectedAppliances,
	setSelectedAppliances,
	selectedIndoor,
	setSelectedIndoor,
	selectedOutdoor,
	setSelectedOutdoor,
	selectedCommunity,
	setSelectedCommunity,
	selectedLifestyles,
	setSelectedLifestyles,
	propertyTypeOptions,
}) => {
	// Property type popover state
	const [isPropTypeOpen, setPropTypeOpen] = React.useState<boolean>(false);
	const [search, setSearch] = React.useState<string>('');
	const [selectedTypes, setSelectedTypes] = React.useState<Set<string>>(new Set());
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const filteredTypes = React.useMemo(
		() => propertyTypeOptions.filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase())),
		[propertyTypeOptions, search]
	);

	// Price range popover state
	const [isPriceOpen, setPriceOpen] = React.useState<boolean>(false);
	const PRICE_MIN = 100;
	const PRICE_MAX = 10000000;
	const STEP = 50000;
	const [priceMin, setPriceMin] = React.useState<number>(PRICE_MIN);
	const [priceMax, setPriceMax] = React.useState<number>(PRICE_MAX);
	const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
	const toPercent = (val: number) => ((val - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
	const formatPrice = (val: number) => `$${val.toLocaleString()}`;
	const priceSummary = React.useMemo(() => {
		if (priceMin === PRICE_MIN && priceMax === PRICE_MAX) return 'Any';
		if (priceMin === PRICE_MIN) return `Up to ${formatPrice(priceMax)}`;
		if (priceMax === PRICE_MAX) return `${formatPrice(priceMin)}+`;
		return `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`;
	}, [priceMin, priceMax, PRICE_MIN, PRICE_MAX]);

	// Beds & baths popover state
	const [isBedsBathOpen, setBedsBathOpen] = React.useState<boolean>(false);
	const COUNT_MIN = 0;
	const COUNT_MAX = 5;
	const COUNT_STEP = 1;
	const [bedsMin, setBedsMin] = React.useState<number | null>(null);
	const [bedsMax, setBedsMax] = React.useState<number | null>(null);
	const [bathsMin, setBathsMin] = React.useState<number | null>(null);
	const [bathsMax, setBathsMax] = React.useState<number | null>(null);
	const countSummary = (min: number | null, max: number | null) => {
		if (min == null && max == null) return 'Any';
		if (min == null) return `Up to ${max!}+`;
		if (max == null) return `${min}+`;
		return `${min}+ - ${max}+`;
	};

	// For Sale popover state
	const [isSaleOpen, setSaleOpen] = React.useState<boolean>(false);
	const [saleType, setSaleType] = React.useState<string>('For Sale');

	// Sort popover state
	const [isSortOpen, setSortOpen] = React.useState<boolean>(false);
	const [sortOption, setSortOption] = React.useState<string>('Recommended');
	const sortRef = React.useRef<HTMLDivElement | null>(null);
	const sortOptions = React.useMemo(() => [
		'Recommended',
		'Price: Low to High',
		'Price: High to Low',
		'Newest',
		'Beds: High to Low',
		'Baths: High to Low'
	], []);

	React.useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (!containerRef.current && !sortRef.current) return;
			const target = e.target as Node;
			const clickedInsideFilters = !!containerRef.current && containerRef.current.contains(target);
			const clickedInsideSort = !!sortRef.current && sortRef.current.contains(target);
			if ((isPropTypeOpen || isPriceOpen || isBedsBathOpen || isSaleOpen) && !clickedInsideFilters) {
				setPropTypeOpen(false);
				setPriceOpen(false);
				setBedsBathOpen(false);
				setSaleOpen(false);
			}
			if (isSortOpen && !clickedInsideSort) setSortOpen(false);
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, [isPropTypeOpen, isPriceOpen, isBedsBathOpen, isSaleOpen, isSortOpen]);

	const toggleType = (type: string) => {
		setSelectedTypes((prev) => {
			const next = new Set(prev);
			if (next.has(type)) next.delete(type); else next.add(type);
			return next;
		});
	};


	return (
		<div className="mx-auto max-w-[1500px] px-3 md:px-6 py-1.5 flex items-center justify-between gap-3">
			{/* Left: main mega pill */}
			<div className="flex-1 min-w-0" ref={containerRef}>
				<div className="gradient-border-mask rounded-full" style={{ padding: 1.5, borderRadius: 9999 }}>
					<div className="rounded-full bg-white px-2.5 flex items-center gap-3.5" style={{ borderRadius: 9999, height: 34 }}>
						{/* location */}
						<div className="flex items-center gap-3 min-w-0">
							<img src="https://flagcdn.com/w40/us.png" alt="USA" className="w-8 h-6 rounded object-cover" />
							<span className="whitespace-nowrap text-[#0E5B4C]">{searchLocation || 'New York, USA'}</span>
						</div>
						<div className="w-px h-6 bg-gray-200" />

						{/* Pills with chevrons */}
						<div className="flex items-center gap-3.5 overflow-visible">
							<div className="relative inline-flex">
								<button className="flex items-center gap-2 text-[#0E5B4C] whitespace-nowrap" onClick={() => { setSaleOpen((o)=>!o); setPropTypeOpen(false); setPriceOpen(false); setBedsBathOpen(false); setSortOpen(false); }}>{saleType}<IconChevronDown /></button>
								{isSaleOpen && (
									<div className="absolute top-[calc(100%+8px)] left-0 z-50">
										<div className="w-[200px] rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
											<div className="px-3 pt-3 pb-2 text-[16px] font-semibold text-gray-900 text-left">Listing Type</div>
											<div className="px-3 py-2 space-y-3">
												{['For Sale','For Rent','For Lease'].map((opt)=> (
													<label key={opt} className="flex items-center gap-3 cursor-pointer select-none w-full text-left">
														<span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 overflow-hidden">
															<input type="radio" name="saletype" checked={saleType===opt} onChange={() => setSaleType(opt)} className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
															<span className="absolute inset-0 opacity-0 peer-checked:opacity-100 rounded-full pointer-events-none" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }} />
															<svg viewBox="0 0 24 24" className="relative z-10 w-2.5 h-2.5 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /></svg>
														</span>
														<span className="text-sm text-gray-800 text-left">{opt}</span>
													</label>
												))}
											</div>
											<div className="px-3 py-2 border-t border-gray-200 flex items-center justify-end gap-3">
												<button className="text-[#0E5B4C] text-[13px]" onClick={() => { setSaleType('For Sale'); onApplySaleType?.('For Sale'); }}>Clear</button>
												<button className="text-[#0E5B4C] text-[13px] border border-[#0E5B4C] rounded-[12px] px-3 py-1" onClick={() => { onApplySaleType?.(saleType); setSaleOpen(false); }}>Apply</button>
											</div>
										</div>
									</div>
								)}
							</div>
							<div className="w-px h-6 bg-gray-200" />

							{/* Property type with anchored popover */}
							<div className="relative inline-flex">
								<button onClick={() => { setPropTypeOpen((o) => !o); setPriceOpen(false); setBedsBathOpen(false); }} className="flex items-center gap-2 text-[#0E5B4C] whitespace-nowrap">Property type<IconChevronDown /></button>
								{isPropTypeOpen && (
									<div className="absolute top-[calc(100%+8px)] left-0 z-50">
																					<div className="w-[200px] rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
												<div className="px-3 pt-3 pb-2 text-[16px] font-semibold text-gray-900 text-left">Property Type</div>
											<div className="px-3 pb-2">
												<div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5">
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2"/><path d="M20 20l-3.5-3.5" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/></svg>
													<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search type.." className="flex-1 outline-none text-sm" />
												</div>
											</div>
											<div className="max-h-[200px] overflow-auto px-3 py-1 space-y-3">
											{filteredTypes.map((typeOption) => {
												const checked = selectedTypes.has(typeOption.id);
													return (
													<label key={typeOption.id} className="flex items-center gap-3 cursor-pointer select-none w-full text-left">
														<span className="relative inline-flex items-center justify-center w-5 h-5 rounded-md border border-gray-300 overflow-hidden">
															<input type="checkbox" checked={checked} onChange={() => toggleType(typeOption.id)} className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
															<span className="absolute inset-0 opacity-0 peer-checked:opacity-100 rounded-md pointer-events-none" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }} />
															<svg viewBox="0 0 24 24" className="relative z-10 w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4L19 7" /></svg>
														</span>
																													<span className="text-sm text-gray-800 text-left">{typeOption.name}</span>
													</label>
												);
											})}
											</div>
											<div className="px-3 py-2 border-t border-gray-200 flex items-center justify-end gap-3">
												<button className="text-[#0E5B4C] text-[13px]" onClick={() => { setSelectedTypes(new Set()); setSearch(''); onApplyPropertyTypes?.(new Set()); }}>Clear</button>
												<button className="text-[#0E5B4C] text-[13px] border border-[#0E5B4C] rounded-[12px] px-3 py-1" onClick={() => { onApplyPropertyTypes?.(selectedTypes); setPropTypeOpen(false); }}>Apply</button>
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="w-px h-6 bg-gray-200" />

							{/* Price range with slider popover */}
							<div className="relative inline-flex">
								<button onClick={() => { setPriceOpen((o) => !o); setPropTypeOpen(false); setBedsBathOpen(false); }} className="flex items-center gap-2 text-[#0E5B4C] whitespace-nowrap">Price Range<IconChevronDown /></button>
								{isPriceOpen && (
									<div className="absolute top-[calc(100%+8px)] left-0 z-50">
										<div className="w-[300px] rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
											<div className="px-4 pt-3 pb-2">
												<div className="text-[16px] font-semibold text-gray-900 text-left">Price</div>
												<div className="text-sm text-gray-600 mt-0.5 text-left">{priceSummary}</div>
											</div>
											<div className="px-4 pb-3">
												<div className="relative h-10 pt-3 price-range">
													{/* Rail */}
													<div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gray-300" />
													{/* Range fill */}
													{(() => {
														const minVal = priceMin;
														const maxVal = priceMax;
														const left = toPercent(minVal);
														const right = 100 - toPercent(maxVal);
														return <div className="absolute top-1/2 -translate-y-1/2 h-[2px]" style={{ left: `${left}%`, right: `${right}%`, background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }} />;
													})()}
													{/* Thumbs (use two overlapped ranges) */}
													<input
														type="range"
														min={PRICE_MIN}
														max={PRICE_MAX}
														step={STEP}
														value={priceMin}
														onChange={(e) => {
															const val = clamp(Number(e.target.value), PRICE_MIN, priceMax - STEP);
															setPriceMin(val);
														}}
														className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto"
														style={{ WebkitAppearance: 'none' as any, appearance: 'none', zIndex: 3 }}
													/>
													<input
														type="range"
														min={PRICE_MIN}
														max={PRICE_MAX}
														step={STEP}
														value={priceMax}
														onChange={(e) => {
															const val = clamp(Number(e.target.value), priceMin + STEP, PRICE_MAX);
															setPriceMax(val);
														}}
														className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto"
														style={{ WebkitAppearance: 'none' as any, appearance: 'none', zIndex: 2 }}
													/>
												</div>
												<div className="flex items-center justify-between text-[12px] text-gray-700">
													<span>{priceMin === PRICE_MIN ? 'No Min' : formatPrice(priceMin)}</span>
													<span>{priceMax === PRICE_MAX ? 'No Max' : formatPrice(priceMax)}</span>
												</div>
											</div>
											<div className="px-4 py-2 border-t border-gray-200 flex items-center justify-end gap-3">
												<button className="text-[#0E5B4C] text-[13px]" onClick={() => { setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX); onApplyPrice?.(PRICE_MIN, PRICE_MAX); }}>Clear</button>
												<button className="text-[#0E5B4C] text-[13px] border border-[#0E5B4C] rounded-[12px] px-3 py-1" onClick={() => { onApplyPrice?.(priceMin, priceMax); setPriceOpen(false); }}>Apply</button>
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="w-px h-6 bg-gray-200" />

							{/* Beds & Bath popover */}
							<div className="relative inline-flex">
								<button className="flex items-center gap-2 text-[#0E5B4C] whitespace-nowrap" onClick={() => { setBedsBathOpen((o)=>!o); setPropTypeOpen(false); setPriceOpen(false); }}>Beds & Bath<IconChevronDown /></button>
								{isBedsBathOpen && (
									<div className="absolute top-[calc(100%+8px)] left-0 z-50">
										<div className="w-[360px] rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
											<div className="px-4 pt-3 pb-2">
												<div className="text-[16px] font-semibold text-gray-900 text-left">Bedrooms</div>
												<div className="text-sm text-gray-600 mt-0.5 text-left">{countSummary(bedsMin, bedsMax)}</div>
											</div>
											<div className="px-4 pb-3">
												<div className="relative h-10 pt-3 price-range">
													<div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gray-300" />
													{(() => {
														const minVal = bedsMin ?? COUNT_MIN;
														const maxVal = bedsMax ?? COUNT_MAX;
														const left = ((minVal-COUNT_MIN)/(COUNT_MAX-COUNT_MIN))*100;
														const right = 100 - ((maxVal-COUNT_MIN)/(COUNT_MAX-COUNT_MIN))*100;
														return <div className="absolute top-1/2 -translate-y-1/2 h-[2px]" style={{ left: `${left}%`, right: `${right}%`, background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }} />;
													})()}
													<input type="range" min={COUNT_MIN} max={COUNT_MAX} step={COUNT_STEP} value={bedsMin ?? COUNT_MIN} onChange={(e)=>{
														const val = clamp(Number(e.target.value), COUNT_MIN, (bedsMax ?? COUNT_MAX) - COUNT_STEP);
														setBedsMin(val === COUNT_MIN ? null : val);
													}} className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto" style={{ WebkitAppearance: 'none' as any, appearance: 'none', zIndex: 3 }} />
													<input type="range" min={COUNT_MIN} max={COUNT_MAX} step={COUNT_STEP} value={bedsMax ?? COUNT_MAX} onChange={(e)=>{
														const val = clamp(Number(e.target.value), (bedsMin ?? COUNT_MIN)+COUNT_STEP, COUNT_MAX);
														setBedsMax(val === COUNT_MAX ? null : val);
													}} className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto" style={{ WebkitAppearance: 'none' as any, appearance: 'none', zIndex: 2 }} />
												</div>
												<div className="flex items-center justify-between text-[12px] text-gray-700"><span>0+</span><span>5+</span></div>
											</div>
											<div className="border-t border-gray-200" />
											<div className="px-4 pt-3 pb-2">
												<div className="text-[16px] font-semibold text-gray-900 text-left">Bathrooms</div>
												<div className="text-sm text-gray-600 mt-0.5 text-left">{countSummary(bathsMin, bathsMax)}</div>
											</div>
											<div className="px-4 pb-3">
												<div className="relative h-10 pt-3 price-range">
													<div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gray-300" />
													{(() => {
														const minVal = bathsMin ?? COUNT_MIN;
														const maxVal = bathsMax ?? COUNT_MAX;
														const left = ((minVal-COUNT_MIN)/(COUNT_MAX-COUNT_MIN))*100;
														const right = 100 - ((maxVal-COUNT_MIN)/(COUNT_MAX-COUNT_MIN))*100;
														return <div className="absolute top-1/2 -translate-y-1/2 h-[2px]" style={{ left: `${left}%`, right: `${right}%`, background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }} />;
													})()}
													<input type="range" min={COUNT_MIN} max={COUNT_MAX} step={COUNT_STEP} value={bathsMin ?? COUNT_MIN} onChange={(e)=>{
														const val = clamp(Number(e.target.value), COUNT_MIN, (bathsMax ?? COUNT_MAX) - COUNT_STEP);
														setBathsMin(val === COUNT_MIN ? null : val);
													}} className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto" style={{ WebkitAppearance: 'none' as any, appearance: 'none', zIndex: 3 }} />
													<input type="range" min={COUNT_MIN} max={COUNT_MAX} step={COUNT_STEP} value={bathsMax ?? COUNT_MAX} onChange={(e)=>{
														const val = clamp(Number(e.target.value), (bathsMin ?? COUNT_MIN)+COUNT_STEP, COUNT_MAX);
														setBathsMax(val === COUNT_MAX ? null : val);
													}} className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto" style={{ WebkitAppearance: 'none' as any, appearance: 'none', zIndex: 2 }} />
												</div>
												<div className="flex items-center justify-between text-[12px] text-gray-700"><span>0+</span><span>5+</span></div>
											</div>
											<div className="px-4 py-2 border-t border-gray-200 flex items-center justify-end gap-3">
												<button className="text-[#0E5B4C] text-[13px]" onClick={() => { setBedsMin(null); setBedsMax(null); setBathsMin(null); setBathsMax(null); onApplyBedsBaths?.({min:null,max:null},{min:null,max:null}); }}>Clear</button>
												<button className="text-[#0E5B4C] text-[13px] border border-[#0E5B4C] rounded-[12px] px-3 py-1" onClick={() => { onApplyBedsBaths?.({min:bedsMin,max:bedsMax},{min:bathsMin,max:bathsMax}); setBedsBathOpen(false); }}>Apply</button>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="ml-auto">
							<button type="button" className="w-7 h-7 rounded-full bg-[#004236] flex items-center justify-center"><IconSearch size={16} /></button>
						</div>
					</div>
				</div>
			</div>

					{/* Right: actions */}
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<MoreFiltersTrigger 
						maxHoa={maxHoa}
						setMaxHoa={setMaxHoa}
						listingTypes={listingTypes}
						setListingTypes={setListingTypes}
						propertyStatus={propertyStatus}
						setPropertyStatus={setPropertyStatus}
						parkingSlots={parkingSlots}
						setParkingSlots={setParkingSlots}
						totalSqft={totalSqft}
						setTotalSqft={setTotalSqft}
						lotSqft={lotSqft}
						setLotSqft={setLotSqft}
						selectedAppliances={selectedAppliances}
						setSelectedAppliances={setSelectedAppliances}
						selectedIndoor={selectedIndoor}
						setSelectedIndoor={setSelectedIndoor}
						selectedOutdoor={selectedOutdoor}
						setSelectedOutdoor={setSelectedOutdoor}
						selectedCommunity={selectedCommunity}
						setSelectedCommunity={setSelectedCommunity}
						selectedLifestyles={selectedLifestyles}
						setSelectedLifestyles={setSelectedLifestyles}
					/>
					<div className="relative inline-flex" ref={sortRef}>
						<GoldPill compact innerClassName="text-[12px] h-[34px] px-3" onClick={() => { setSortOpen((o)=>!o); setPropTypeOpen(false); setPriceOpen(false); setBedsBathOpen(false); }}>
							<span className="pl-2"><img src={sortPng} alt="Sort" className="w-4 h-4" /></span>
							<span className="text-[#0E5B4C] pr-2">Sort</span>
						</GoldPill>
						{isSortOpen && (
							<div className="absolute top-[calc(100%+8px)] right-0 z-50">
								<div className="w-[220px] rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
									<div className="px-3 pt-3 pb-2 text-[16px] font-semibold text-gray-900 text-left">Sort</div>
									<div className="px-3 py-2 space-y-3">
										{sortOptions.map((opt) => (
											<label key={opt} className="flex items-center gap-3 cursor-pointer select-none w-full text-left">
												<span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 overflow-hidden">
													<input type="radio" name="sort" checked={sortOption===opt} onChange={() => setSortOption(opt)} className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
													<span className="absolute inset-0 opacity-0 peer-checked:opacity-100 rounded-full pointer-events-none" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }} />
													<svg viewBox="0 0 24 24" className="relative z-10 w-2.5 h-2.5 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /></svg>
												</span>
												<span className="text-sm text-gray-800 text-left">{opt}</span>
											</label>
										))}
									</div>
									<div className="px-3 py-2 border-t border-gray-200 flex items-center justify-end gap-3">
										<button className="text-[#0E5B4C] text-[13px]" onClick={() => { setSortOption('Recommended'); onApplySort?.('Recommended'); }}>Clear</button>
										<button className="text-[#0E5B4C] text-[13px] border border-[#0E5B4C] rounded-[12px] px-3 py-1" onClick={() => { onApplySort?.(sortOption); setSortOpen(false); }}>Apply</button>
									</div>
								</div>
							</div>
						)}
					</div>
					<MapListSwitch value={viewMode} onChange={onChangeViewMode} />
				</div>
				<div className="hidden md:block">
					<div className="text-sm text-black font-semibold">Viewing {viewedCount} of {totalCount} Homes for Sale{searchLocation ? ` in ${searchLocation}` : ''}</div>
					<div className="text-xs text-gray-500">Showing listings marketed by all brokers in the searched area.</div>
				</div>
			</div>

			{/* Right-side More Filters Drawer reused from listing page */}
			
		</div>
	);
};

// Trigger + Drawer component reused styling
const MoreFiltersTrigger: React.FC<{
	maxHoa: string;
	setMaxHoa: (value: string) => void;
	listingTypes: string[];
	setListingTypes: (value: string[] | ((prev: string[]) => string[])) => void;
	propertyStatus: string[];
	setPropertyStatus: (value: string[] | ((prev: string[]) => string[])) => void;
	parkingSlots: [number, number];
	setParkingSlots: (value: [number, number] | ((prev: [number, number]) => [number, number])) => void;
	totalSqft: [number, number];
	setTotalSqft: (value: [number, number] | ((prev: [number, number]) => [number, number])) => void;
	lotSqft: [number, number];
	setLotSqft: (value: [number, number] | ((prev: [number, number]) => [number, number])) => void;
	selectedAppliances: string[];
	setSelectedAppliances: (value: string[] | ((prev: string[]) => string[])) => void;
	selectedIndoor: string[];
	setSelectedIndoor: (value: string[] | ((prev: string[]) => string[])) => void;
	selectedOutdoor: string[];
	setSelectedOutdoor: (value: string[] | ((prev: string[]) => string[])) => void;
	selectedCommunity: string[];
	setSelectedCommunity: (value: string[] | ((prev: string[]) => string[])) => void;
	selectedLifestyles: string[];
	setSelectedLifestyles: (value: string[] | ((prev: string[]) => string[])) => void;
}> = ({
	maxHoa, setMaxHoa,
	listingTypes, setListingTypes,
	propertyStatus, setPropertyStatus,
	parkingSlots, setParkingSlots,
	totalSqft, setTotalSqft,
	lotSqft, setLotSqft,
	selectedAppliances, setSelectedAppliances,
	selectedIndoor, setSelectedIndoor,
	selectedOutdoor, setSelectedOutdoor,
	selectedCommunity, setSelectedCommunity,
	selectedLifestyles, setSelectedLifestyles,
}) => {
	const { moreDrawerOpen, handleMoreOpen, handleMoreClose } = useMoreFiltersDrawer();
	// Local UI state
	const [expandedAccordion, setExpandedAccordion] = React.useState<string | false>(false);
	const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => setExpandedAccordion(isExpanded ? panel : false);
	const amenities = React.useMemo(() => ({
		appliancetype: ['Dishwasher', 'Washer', 'Dryer', 'Microwave', 'Oven', 'Refrigerator', 'Wine Cooler', 'Water Purifier'],
		indoorfeature: ['Fireplace', 'Walk-in Closet', 'Home Theater', 'Sauna', 'Gym', 'Study Room', 'Smart Home'],
		outdooramenity: ['Pool', 'Jacuzzi', 'Garden', 'Deck', 'BBQ Area', 'Tennis Court', 'Private Beach'],
		communitytype: ['Gated Community', 'Playground', 'Clubhouse', 'Golf Course', 'Marina', 'Dog Park'],
		viewtype: ['City View', 'Ocean View', 'Golf View', 'Mountain View', 'Lake View', 'Park View']
	}), []);
	const [showMoreAmenities, setShowMoreAmenities] = React.useState<Record<string, boolean>>({});

	const resetAll = () => {
		setMaxHoa('No HOA');
		setListingTypes([]);
		setPropertyStatus([]);
		setParkingSlots([0,5]);
		setTotalSqft([0,10000]);
		setLotSqft([0,50000]);
		setSelectedAppliances([]);
		setSelectedIndoor([]);
		setSelectedOutdoor([]);
		setSelectedCommunity([]);
		setSelectedLifestyles([]);
		setShowMoreAmenities({});
	};
	return (
		<>
			<GoldPill compact innerClassName="text-[12px] h-[34px] px-3" onClick={handleMoreOpen} role="button" aria-label="More filters">
				<span className="pl-2"><img src={morePng} alt="More" className="w-4 h-4" /></span>
				<span className="text-[#0E5B4C] pr-2">More</span>
			</GoldPill>
			<Drawer
				anchor="right"
				open={moreDrawerOpen}
				onClose={handleMoreClose}
				PaperProps={{
					sx: { width: 480, borderRadius: '12px 0 0 12px', p: 2, background: '#fff', boxShadow: 6 }
				}}
			>
				<div style={{ padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
						<div style={{ fontWeight: 700, fontSize: 18 }}>MORE FILTERS</div>
						<IconButton onClick={handleMoreClose} size="small" sx={{ ml: 2 }}>
							<CloseIcon fontSize="medium" />
						</IconButton>
					</div>
					<Accordion expanded={expandedAccordion === 'hoa'} onChange={handleAccordionChange('hoa')} sx={{ boxShadow: 'none', borderBottom: '1px solid #eee', px: 0 }}>
						<AccordionSummary expandIcon={<img src={expandedAccordion === 'hoa' ? minusIcon : plusIcon} alt="toggle" style={{ width: 24, height: 24 }} />} sx={{ minHeight: 48, px: 1 }}>
							<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<span style={{ fontWeight: 600 }}>Max HOA</span>
								<span style={{ fontSize: 14, color: '#222', fontWeight: 500, marginRight: 16 }}>{expandedAccordion !== 'hoa' && maxHoa}</span>
							</div>
						</AccordionSummary>
						<AccordionDetails sx={{ pt: 1, px: 1 }}>
							<div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
								<select style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, fontWeight: 500 }} value={maxHoa} onChange={(e)=>setMaxHoa(e.target.value)}>
									<option>Any</option>
									<option>No HOA</option>
									<option>Up to $100</option>
									<option>Up to $200</option>
									<option>Up to $300</option>
								</select>
							</div>
						</AccordionDetails>
					</Accordion>
					<Accordion expanded={expandedAccordion === 'listingType'} onChange={handleAccordionChange('listingType')} sx={{ boxShadow: 'none', borderBottom: '1px solid #eee', px: 0 }}>
						<AccordionSummary expandIcon={<img src={expandedAccordion === 'listingType' ? minusIcon : plusIcon} alt="toggle" style={{ width: 24, height: 24 }} />} sx={{ minHeight: 48, px: 1 }}>
							<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<span style={{ fontWeight: 600 }}>Listing Type</span>
								<span style={{ display: 'flex', alignItems: 'center', gap: 28, marginRight: 16 }}>
									{expandedAccordion !== 'listingType' && (<span style={{ fontSize: 14, color: '#222', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{listingTypes.length > 0 ? `${listingTypes.length} chosen` : 'Any'}</span>)}
								</span>
							</div>
						</AccordionSummary>
						<AccordionDetails sx={{ pt: 1, px: 1 }}>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
								{['For Sale','For Rent','New Construction','Mortgage','Foreclosure'].map((label) => {
									const value = label;
									return (
										<label key={value} style={{ fontWeight: 500, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
											<input type="checkbox" style={{ marginRight: 8, accentColor: '#007E67' }} checked={listingTypes.includes(value)} onChange={() => setListingTypes(listingTypes.includes(value) ? listingTypes.filter(v=>v!==value) : [...listingTypes, value])} />
											{label}
										</label>
									);
								})}
							</div>
						</AccordionDetails>
					</Accordion>
					{['Property Status', 'Parking slots', 'Square feet', 'Other Amenities', 'Lifestyles'].map((label) => (
						<Accordion key={label} expanded={expandedAccordion === label} onChange={handleAccordionChange(label)} sx={{ boxShadow: 'none', borderBottom: '1px solid #eee', px: 0 }}>
							<AccordionSummary expandIcon={<img src={expandedAccordion === label ? minusIcon : plusIcon} alt="toggle" style={{ width: 24, height: 24 }} />} sx={{ minHeight: 48, px: 1 }}>
								<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<span style={{ fontWeight: 600 }}>{label}</span>
									<span style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
										{expandedAccordion !== label && (
											<span style={{ fontSize: 14, color: '#222', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
												{label === 'Property Status' && (propertyStatus.length > 0 ? `${propertyStatus.length} chosen` : 'Any')}
												{label === 'Parking slots' && (() => { const [min,max]=parkingSlots; if (min===0&&max===5) return 'Any'; const minL=min===0?'No Min':min; const maxL=max===5?'No Max':max; return `${minL} - ${maxL}`; })()}
												{label === 'Square feet' && (() => { const [tmin,tmax]=totalSqft; const [lmin,lmax]=lotSqft; const tText=tmin===0&&tmax===10000?'Any':`${tmin===0?'No Min':tmin} - ${tmax===10000?'No Max':tmax}`; const lText=lmin===0&&lmax===50000?'Any':`${lmin===0?'No Min':lmin} - ${lmax===50000?'No Max':lmax}`; return `${tText} / ${lText}`; })()}
												{label === 'Other Amenities' && ((selectedAppliances.length + selectedIndoor.length + selectedOutdoor.length + selectedCommunity.length) > 0 ? `${selectedAppliances.length + selectedIndoor.length + selectedOutdoor.length + selectedCommunity.length} chosen` : 'Any')}
												{label === 'Lifestyles' && (selectedLifestyles.length > 0 ? `${selectedLifestyles.length} chosen` : 'Any')}
												{label !== 'Property Status' && label !== 'Parking slots' && label !== 'Square feet' && label !== 'Other Amenities' && label !== 'Lifestyles' && 'Any'}
											</span>
										)}
									</span>
								</div>
							</AccordionSummary>
							<AccordionDetails sx={{ pt: 1, px: 1 }}>
								{label === 'Property Status' && (
									<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
										{['Active','Pending','Sold'].map((status)=>{
											const value=status; return (
												<label key={value} style={{ fontWeight: 500, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
													<input type="checkbox" style={{ marginRight: 8, accentColor: '#007E67' }} checked={propertyStatus.includes(value)} onChange={() => setPropertyStatus(propertyStatus.includes(value) ? propertyStatus.filter(v=>v!==value) : [...propertyStatus, value])} />
													{status}
												</label>
											);
										})}
									</div>
								)}
								{label === 'Parking slots' && (
									<div style={{ width: '100%' }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
											<span style={{ fontWeight: 500 }}>Parking slots</span>
											<span style={{ color: '#222', fontWeight: 500 }}>{(() => { const [min,max]=parkingSlots; if (min===0&&max===5) return 'Any'; const minL=min===0?'No Min':min; const maxL=max===5?'No Max':max; return `${minL} - ${maxL}`; })()}</span>
										</div>
										<Slider value={parkingSlots} onChange={(_e, newValue)=>{ if (Array.isArray(newValue)) setParkingSlots(newValue as [number,number]); }} min={0} max={5} step={1} sx={{ mb:1, height:8, '& .MuiSlider-track':{ background:'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', border:'none', height:4, borderRadius:2 }, '& .MuiSlider-rail':{ background:'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', opacity:0.3, height:4, borderRadius:2 }, '& .MuiSlider-thumb':{ width:24, height:24, backgroundColor:'#007E67', border:'3px solid #fff', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' } }} />
										<div style={{ display:'flex', justifyContent:'space-between', marginBottom: 16 }}><span style={{ color:'#222' }}>0</span><span style={{ color:'#222' }}>5+</span></div>
									</div>
								)}
								{label === 'Square feet' && (
									<div style={{ width:'100%' }}>
										<div style={{ marginBottom: 24 }}>
											<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
												<span style={{ fontWeight: 500 }}>Total sqft</span>
												<span style={{ color:'#222', fontWeight:500 }}>{(() => { const [min,max]=totalSqft; if (min===0&&max===10000) return 'Any'; const minL=min===0?'No Min':min; const maxL=max===10000?'No Max':max; return `${minL} - ${maxL}`; })()}</span>
											</div>
											<Slider value={totalSqft} onChange={(_e,newValue)=>{ if(Array.isArray(newValue)) setTotalSqft(newValue as [number,number]); }} min={0} max={10000} step={100} sx={{ mb:1, height:8, '& .MuiSlider-track':{ background:'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', border:'none', height:4, borderRadius:2 }, '& .MuiSlider-rail':{ background:'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', opacity:0.3, height:4, borderRadius:2 }, '& .MuiSlider-thumb':{ width:24, height:24, backgroundColor:'#007E67', border:'3px solid #fff', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' } }} />
											<div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ color:'#222' }}>0</span><span style={{ color:'#222' }}>10000+</span></div>
										</div>
										<div>
											<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
												<span style={{ fontWeight: 500 }}>Lot sqft</span>
												<span style={{ color:'#222', fontWeight:500 }}>{(() => { const [min,max]=lotSqft; if (min===0&&max===50000) return 'Any'; const minL=min===0?'No Min':min; const maxL=max===50000?'No Max':max; return `${minL} - ${maxL}`; })()}</span>
											</div>
											<Slider value={lotSqft} onChange={(_e,newValue)=>{ if(Array.isArray(newValue)) setLotSqft(newValue as [number,number]); }} min={0} max={50000} step={500} sx={{ mb:1, height:8, '& .MuiSlider-track':{ background:'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', border:'none', height:4, borderRadius:2 }, '& .MuiSlider-rail':{ background:'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)', opacity:0.3, height:4, borderRadius:2 }, '& .MuiSlider-thumb':{ width:24, height:24, backgroundColor:'#007E67', border:'3px solid #fff', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' } }} />
											<div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}><span style={{ color:'#222' }}>0</span><span style={{ color:'#222' }}>50000+</span></div>
										</div>
									</div>
								)}
								{label === 'Other Amenities' && (
									<div style={{ display:'flex', flexDirection:'column', gap:16 }}>
										{[
											{ key:'appliancetype', label:'Appliances', data: amenities.appliancetype, selected: selectedAppliances, setSelected: setSelectedAppliances },
											{ key:'indoorfeature', label:'Indoor Features', data: amenities.indoorfeature, selected: selectedIndoor, setSelected: setSelectedIndoor },
											{ key:'outdooramenity', label:'Outdoor Amenities', data: amenities.outdooramenity, selected: selectedOutdoor, setSelected: setSelectedOutdoor },
											{ key:'communitytype', label:'Community', data: amenities.communitytype, selected: selectedCommunity, setSelected: setSelectedCommunity },
										].map(group => (
											<div key={group.key} style={{ marginBottom: 8 }}>
												<div style={{ fontWeight: 600, marginBottom: 4 }}>{group.label}</div>
												<div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'6px 24px', alignItems:'start' }}>
													{(showMoreAmenities[group.key] ? group.data : group.data.slice(0,7)).map((item:any)=> (
														<label key={item} style={{ fontWeight:500, display:'flex', alignItems:'center', cursor:'pointer' }}>
															<input type="checkbox" style={{ marginRight: 8, accentColor:'#007E67' }} checked={group.selected.includes(item)} onChange={()=>{ if(group.selected.includes(item)){ group.setSelected(group.selected.filter((v:string)=>v!==item)); } else { group.setSelected([...group.selected, item]); } }} />
															{item}
														</label>
													))}
												</div>
												{group.data.length > 7 && (
													<button type="button" style={{ color:'#007E67', background:'none', border:'none', fontWeight:600, fontSize:15, marginTop:2, cursor:'pointer', textAlign:'left' }} onClick={() => setShowMoreAmenities(s=>({ ...s, [group.key]: !s[group.key] }))}>
														{showMoreAmenities[group.key] ? 'Show less' : 'Show more'}
													</button>
												)}
											</div>
										))}
									</div>
								)}
								{label === 'Lifestyles' && (
									<div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'6px 24px', alignItems:'start' }}>
										{amenities.viewtype.map((item:any)=> (
											<label key={item} style={{ fontWeight:500, display:'flex', alignItems:'center', cursor:'pointer' }}>
												<input type="checkbox" style={{ marginRight: 8, accentColor:'#007E67' }} checked={selectedLifestyles.includes(item)} onChange={()=>{ if(selectedLifestyles.includes(item)){ setSelectedLifestyles(selectedLifestyles.filter((v:string)=>v!==item)); } else { setSelectedLifestyles([...selectedLifestyles, item]); } }} />
												{item}
											</label>
										))}
									</div>
								)}
							</AccordionDetails>
						</Accordion>
					))}
					<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 24, gap: 16 }}>
						<Button onClick={resetAll} sx={{ color: '#007E67', textTransform: 'none' }}>Reset all</Button>
						<Button variant="outlined" sx={{ color: '#007E67', borderColor: '#007E67', textTransform: 'none', minWidth: 80 }} onClick={handleMoreClose}>Apply</Button>
					</div>
				</div>
			</Drawer>
		</>
	);
};

const LeftFilterPanel: React.FC<{ builders: { name: string; count: number }[]; selected: Set<string>; onToggle: (name: string) => void }> = ({ builders, selected, onToggle }) => {
	return (
		<div className="absolute left-4 top-24 md:top-28 z-20 w-[240px]">
			<div className="bg-white/95 rounded-[20px] shadow-xl border border-gray-100 overflow-hidden">
				<div className="px-4 py-3 font-semibold text-gray-800 border-b border-gray-100">Builders</div>
				<div className="px-4 py-2">
					<input className="w-full text-sm px-3 py-2 rounded-[12px] border border-gray-200 outline-none" placeholder="Search..." />
				</div>
				<ul className="max-h-[56vh] overflow-auto">
					{builders.map((b, i) => (
						<li key={i} className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-full bg-gray-200" />
								<div className="flex flex-col items-start text-left">
									<span className="text-sm text-[#0E5B4C] font-medium text-left">{b.name}</span>
									<span className="text-xs text-gray-500 text-left">{b.count} properties</span>
								</div>
							</div>
							<label className="relative inline-flex items-center cursor-pointer select-none">
								<span className="relative inline-flex items-center justify-center w-5 h-5 rounded-md border border-gray-300 overflow-hidden">
									<input type="checkbox" checked={selected.has(b.name)} onChange={()=>onToggle(b.name)} className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
									<span className="absolute inset-0 opacity-0 peer-checked:opacity-100 rounded-md pointer-events-none" style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }} />
									<svg viewBox="0 0 24 24" className="relative z-10 w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
										<path d="M5 12l4 4L19 7" />
									</svg>
								</span>
							</label>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

import { useNavigate } from 'react-router-dom';

const PropertyCard: React.FC<{ property: typeof MOCK_PROPERTIES[number]; selected?: boolean; dimmed?: boolean; onClick?: () => void }> = ({ property, selected = false, dimmed = false, onClick }) => {
    const navigate = useNavigate();
	return (
        <div className={`gradient-border-mask mx-auto ${dimmed ? 'opacity-60' : 'opacity-100'} transition-all duration-300 cursor-pointer hover:scale-[1.02]`} data-prop-id={property.id} style={{ padding: selected ? 2.5 : 1.5, borderRadius: 12 }} onClick={onClick}>
			<div className={`rounded-[12px] overflow-hidden mx-auto w-full ${selected ? '' : ''}`} style={{ background: selected ? 'rgba(255, 253, 241, 1)' : '#ffffff', boxShadow: selected ? '0 4px 16px rgba(0,0,0,0.1)' : undefined, minWidth: '280px', maxWidth: '280px' }}>
				<div className="relative aspect-[16/11] w-full overflow-hidden">
					<ImageWithFallback src={property.image} alt={property.title} />
					<button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-emerald-700" onClick={(e) => { e.stopPropagation(); }}>♡</button>
				</div>
				<div className="p-2 text-left">
					<h3 className={`font-semibold text-[13px] leading-tight line-clamp-2 text-left ${selected ? 'text-[#0E5B4C]' : 'text-emerald-900'}`}>{property.title}</h3>
					<p className="text-[10px] text-gray-500 mt-0.5 text-left">{property.location}</p>
					<div className="flex items-center gap-1.5 text-[10px] text-gray-600 mt-1 justify-start">
						<span>{property.beds}BHK</span>
						<span>•</span>
						<span>{property.baths} Bathrooms</span>
						<span>•</span>
						<span>{property.sqft.toLocaleString()} Sq. Ft.</span>
					</div>
					<div className={`mt-1 text-[15px] font-extrabold text-left ${selected ? 'text-[#0E5B4C]' : 'text-emerald-900'}`}>${property.price.toLocaleString()}</div>
				</div>
			</div>
		</div>
	);
};

const ImageWithFallback: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
	const [errored, setErrored] = React.useState<boolean>(false);
	if (!src || errored) {
		return <div className="w-full h-full bg-gray-200" role="img" aria-label={alt} />;
	}
	return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setErrored(true)} />;
};

const MapSearchPage: React.FC = () => {
	const { show } = useFloatingAskBar();
	const location = useLocation();
	const topBarRef = React.useRef<HTMLDivElement | null>(null);
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const [containerHeight, setContainerHeight] = React.useState<number>(window.innerHeight);
	const [viewMode, setViewMode] = React.useState<'map' | 'list'>('map');
	const [stickyTop, setStickyTop] = React.useState<number>(64);
	
	// API state
	const [allProperties, setAllProperties] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [loadingMore, setLoadingMore] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);
	const [searchQuery, setSearchQuery] = React.useState<string>('');
	const [totalCount, setTotalCount] = React.useState<number>(0);
	const [hasMore, setHasMore] = React.useState<boolean>(false);
	const [nextUrl, setNextUrl] = React.useState<string | null>(null);
	const [currentPage, setCurrentPage] = React.useState<number>(1);
	
	// Property type master data
	const [propertyTypeOptions, setPropertyTypeOptions] = React.useState<PropertyTypeOption[]>([]);

	// Filters coming from UI controls
	const [saleType, setSaleType] = React.useState<string>('For Sale');
	const [priceMin, setPriceMin] = React.useState<number>(100);
	const [priceMax, setPriceMax] = React.useState<number>(10000000);
	const [bedsMin, setBedsMin] = React.useState<number>(0);
	const [bedsMax, setBedsMax] = React.useState<number>(5);
	const [bathsMin, setBathsMin] = React.useState<number>(0);
	const [bathsMax, setBathsMax] = React.useState<number>(5);
	const [selectedTypes, setSelectedTypes] = React.useState<Set<string>>(new Set());
	const [sortOption, setSortOption] = React.useState<string>('Recommended');
	
	// More filters state (moved from MoreFiltersTrigger)
	const [maxHoa, setMaxHoa] = React.useState<string>('No HOA');
	const [listingTypes, setListingTypes] = React.useState<string[]>([]);
	const [propertyStatus, setPropertyStatus] = React.useState<string[]>([]);
	const [parkingSlots, setParkingSlots] = React.useState<[number, number]>([0, 5]);
	const [totalSqft, setTotalSqft] = React.useState<[number, number]>([0, 10000]);
	const [lotSqft, setLotSqft] = React.useState<[number, number]>([0, 50000]);
	const [selectedAppliances, setSelectedAppliances] = React.useState<string[]>([]);
	const [selectedIndoor, setSelectedIndoor] = React.useState<string[]>([]);
	const [selectedOutdoor, setSelectedOutdoor] = React.useState<string[]>([]);
	const [selectedCommunity, setSelectedCommunity] = React.useState<string[]>([]);
	const [selectedLifestyles, setSelectedLifestyles] = React.useState<string[]>([]);
	
// Helper to parse HOA value
	const parseHoaValue = React.useCallback((hoa: string) => {
		if (!hoa || hoa === 'No HOA' || hoa === 'Any') return undefined;
		const match = hoa.match(/\$?(\d+)/);
		return match ? parseInt(match[1], 10) : undefined;
	}, []);

// Fetch property type master list
React.useEffect(() => {
	const fetchPropertyTypes = async () => {
		try {
			const response = await api.post('/common/master/list/', { tables: ['propertytype'] });
			const list = response.data?.propertytype || [];
			const formatted = list.map((item: any) => ({
				id: String(item.id ?? item.uuid ?? item.value ?? item.name),
				name: item.value || item.name || item.label || 'Unknown',
			}));
			setPropertyTypeOptions(formatted);
		} catch (error) {
			console.error('Error fetching property types:', error);
		}
	};
	fetchPropertyTypes();
}, []);

	// Builder selection state and pre-builder snapshot for counts
	const [selectedBuilders, setSelectedBuilders] = React.useState<Set<string>>(new Set());
	const preBuilderRef = React.useRef<any[]>(allProperties);
	const builderList = React.useMemo(() => {
		const counts = preBuilderRef.current.reduce((m: Map<string, number>, p: any) => {
			const builder = p.builder || 'Unknown';
			return m.set(builder, (m.get(builder) || 0) + 1);
		}, new Map<string, number>());
		return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
	}, [preBuilderRef.current, saleType, selectedTypes, priceMin, priceMax, bedsMin, bedsMax, bathsMin, bathsMax]);
	const toggleBuilder = (name: string) => {
		setSelectedBuilders(prev => {
			const next = new Set(prev);
			if (next.has(name)) next.delete(name); else next.add(name);
			return next;
		});
	};

	// Fetch properties from API
	const fetchProperties = React.useCallback(async (page: number = 1, append: boolean = false, useNextUrl: string | null = null) => {
		if (append) {
			setLoadingMore(true);
		} else {
			setLoading(true);
			setError(null);
		}
		
		try {
			// Get search query from location state
			const state = location.state as { query?: string; location?: any } | null;
			const query = state?.query || '';
			
			if (!query.trim() && !append) {
				// If no query and not appending, use empty search or show message
				setAllProperties([]);
				setTotalCount(0);
				setHasMore(false);
				setNextUrl(null);
				setLoading(false);
				return;
			}
			
			if (!append) {
				setSearchQuery(query);
				setCurrentPage(1);
			}
			
			// Build request body with filters (matching usePropertyListing logic)
			const requestBody: any = { search: query };
			
			// HOA fees
			const hoaFees = parseHoaValue(maxHoa);
			if (hoaFees !== undefined) requestBody.max_hoa_fees = hoaFees;
			
			// Property status
			if (propertyStatus.length > 0) requestBody.property_status = propertyStatus;
			
			// Listing types
			if (listingTypes.length > 0) requestBody.listing_types = listingTypes;
			
			// Parking slots
			const [parkingMin, parkingMax] = parkingSlots;
			if (parkingMin !== 0) requestBody.parking_from = parkingMin;
			if (parkingMax !== 5) requestBody.parking_to = parkingMax;
			
			// Square feet
			const [totalSqftMin, totalSqftMax] = totalSqft;
			if (totalSqftMin !== 0) requestBody.total_sqft_from = totalSqftMin;
			if (totalSqftMax !== 10000) requestBody.total_sqft_to = totalSqftMax;
			
			// Lot square feet
			const [lotSqftMin, lotSqftMax] = lotSqft;
			if (lotSqftMin !== 0) requestBody.lot_sqft_from = lotSqftMin;
			if (lotSqftMax !== 50000) requestBody.lot_sqft_to = lotSqftMax;
			
			// Amenities (using UUIDs - these should be UUIDs from master data)
			if (selectedOutdoor.length > 0) requestBody.outdoor_amenities_uuids = selectedOutdoor;
			if (selectedLifestyles.length > 0) requestBody.viewtype_uuids = selectedLifestyles;
			if (selectedIndoor.length > 0) requestBody.indoor_features_uuids = selectedIndoor;
			if (selectedCommunity.length > 0) requestBody.community_uuids = selectedCommunity;
			if (selectedAppliances.length > 0) requestBody.appliances_uuids = selectedAppliances;
			
			// Price, beds, baths - only send if not default values
			const priceFrom = priceMin !== 100 ? priceMin : null;
			const priceTo = priceMax !== 10000000 ? priceMax : null;
			const bedroomsFrom = bedsMin !== 0 ? bedsMin : null;
			const bedroomsTo = bedsMax !== 5 ? bedsMax : null;
			const bathroomsFrom = bathsMin !== 0 ? bathsMin : null;
			const bathroomsTo = bathsMax !== 5 ? bathsMax : null;
			
			if (priceFrom !== null) requestBody.price_from = priceFrom;
			if (priceTo !== null) requestBody.price_to = priceTo;
			if (bedroomsFrom !== null) requestBody.bedrooms_from = bedroomsFrom;
			if (bedroomsTo !== null) requestBody.bedrooms_to = bedroomsTo;
			if (bathroomsFrom !== null) requestBody.bathrooms_from = bathroomsFrom;
			if (bathroomsTo !== null) requestBody.bathrooms_to = bathroomsTo;
			
			// Property types
			if (selectedTypes.size > 0) {
				requestBody.property_types = Array.from(selectedTypes);
			}
			
			// Sort order
			if (sortOption === 'Price: Low to High') requestBody.sort_by = 'low_to_high';
			if (sortOption === 'Price: High to Low') requestBody.sort_by = 'high_to_low';
			
			// Make API call - use nextUrl if available and appending, otherwise construct URL
			let apiUrl: string;
			if (append && useNextUrl) {
				// Extract relative path from the next URL
				try {
					// Parse the full URL from API response
					const urlObj = new URL(useNextUrl);
					// Get pathname and search (query string)
					const fullPath = urlObj.pathname + urlObj.search;
					
					// Get baseURL from axios config to check if it has a path component
					const baseURL = api.defaults.baseURL || '';
					
					// If baseURL is a full URL with path, we need to remove that path from fullPath
					if (baseURL) {
						try {
							const baseUrlObj = new URL(baseURL);
							const basePath = baseUrlObj.pathname;
							
							// If fullPath starts with basePath, remove it
							if (basePath && fullPath.startsWith(basePath)) {
								apiUrl = fullPath.substring(basePath.length) || fullPath;
							} else {
								apiUrl = fullPath;
							}
						} catch {
							// baseURL is not a full URL, might be just domain or relative
							// Check if baseURL has a path component
							if (baseURL.includes('/') && !baseURL.startsWith('http')) {
								// baseURL might be like '/api/v1'
								const basePath = baseURL.startsWith('/') ? baseURL : '/' + baseURL;
								if (fullPath.startsWith(basePath)) {
									apiUrl = fullPath.substring(basePath.length) || fullPath;
								} else {
									apiUrl = fullPath;
								}
							} else {
								// baseURL is just domain, use full path
								apiUrl = fullPath;
							}
						}
					} else {
						// No baseURL, use full path
						apiUrl = fullPath;
					}
					
					// Ensure it starts with /
					if (!apiUrl.startsWith('/')) {
						apiUrl = '/' + apiUrl;
					}
				} catch (e) {
					// If parsing fails, check if it's already a relative URL
					if (useNextUrl.startsWith('/')) {
						apiUrl = useNextUrl;
					} else {
						// Try to extract just the API path part using regex
						// Match /api/v1/... or similar patterns
						const match = useNextUrl.match(/(\/api\/v1\/[^?]+(?:\?.*)?)/);
						if (match) {
							apiUrl = match[1];
						} else {
							// Fallback: try to find path after domain
							const pathMatch = useNextUrl.match(/https?:\/\/[^\/]+(\/.*)/);
							apiUrl = pathMatch ? pathMatch[1] : useNextUrl;
						}
					}
				}
			} else {
				// Construct URL with page number
				const params = new URLSearchParams({
					page: String(page),
					page_size: '50',
				});
				apiUrl = `/buyer/properties/?${params.toString()}`;
			}
			
			const response = await api.post(apiUrl, requestBody);
			
			// Map API response to property format
			const mappedProperties = (response.data.results || []).map((item: any) => {
				// Parse lat and lng from location object (they come as strings from API)
				const lat = item.location?.lat ? parseFloat(String(item.location.lat)) : null;
				const lng = item.location?.lng ? parseFloat(String(item.location.lng)) : null;
				
				return {
					id: item.property_id,
					title: item.name || item.address || 'Property',
					location: item.address || '',
					price: parseFloat(item.selling_price) || 0,
					beds: item.bedrooms || 0,
					baths: item.bathrooms || 0,
					sqft: parseFloat(item.sqft) || 0,
					image: item.mainphoto_url || sampleImg,
					lat: !isNaN(lat as number) ? lat : null,
					lng: !isNaN(lng as number) ? lng : null,
					builder: 'Unknown', // API doesn't provide builder, can be updated if available
					listingType: saleType,
					propertyType: 'Apartment', // Default, can be updated if API provides
					isSaved: item.is_saved || false,
				};
			});
			
			if (append) {
				// Append new properties to existing ones
				setAllProperties(prev => {
					const existingIds = new Set(prev.map(p => p.id));
					const newItems = mappedProperties.filter((item: any) => !existingIds.has(item.id));
					return [...prev, ...newItems];
				});
			} else {
				// Replace all properties
				setAllProperties(mappedProperties);
				preBuilderRef.current = mappedProperties;
			}
			
			// Update pagination state
			setTotalCount(response.data.count || 0);
			setHasMore(response.data.has_more || false);
			setNextUrl(response.data.next || null);
			if (append) {
				setCurrentPage(prev => prev + 1);
			} else {
				setCurrentPage(1);
			}
		} catch (err: any) {
			console.error('Error fetching properties:', err);
			setError(err?.response?.data?.message || err?.message || 'Failed to fetch properties');
			if (!append) {
				setAllProperties([]);
				setTotalCount(0);
			}
		} finally {
			if (append) {
				setLoadingMore(false);
			} else {
				setLoading(false);
			}
		}
	}, [location.state, saleType, priceMin, priceMax, bedsMin, bedsMax, bathsMin, bathsMax, selectedTypes, sortOption, maxHoa, listingTypes, propertyStatus, parkingSlots, totalSqft, lotSqft, selectedAppliances, selectedIndoor, selectedOutdoor, selectedCommunity, selectedLifestyles, parseHoaValue]);

	// Initial fetch and refetch when filters change
	React.useEffect(() => {
		// Reset pagination state when filters change
		setHasMore(false);
		setNextUrl(null);
		setCurrentPage(1);
		fetchProperties(1, false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state, saleType, priceMin, priceMax, bedsMin, bedsMax, bathsMin, bathsMax, selectedTypes, sortOption, maxHoa, listingTypes, propertyStatus, parkingSlots, totalSqft, lotSqft, selectedAppliances, selectedIndoor, selectedOutdoor, selectedCommunity, selectedLifestyles]);

	// Infinite scroll handler
	React.useEffect(() => {
		const scrollContainer = listContainerRef.current;
		if (!scrollContainer) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
			const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
			
			// Trigger load more when user scrolls to 80% of the list
			if (scrollPercentage > 0.8 && hasMore && !loading && !loadingMore && nextUrl) {
				fetchProperties(currentPage + 1, true, nextUrl);
			}
		};

		scrollContainer.addEventListener('scroll', handleScroll);
		return () => scrollContainer.removeEventListener('scroll', handleScroll);
	}, [hasMore, loading, loadingMore, currentPage, nextUrl, fetchProperties]);

	const filteredAndSorted = React.useMemo(() => {
		let list = [...allProperties];
		// Note: Most filtering is now done on the API side, but we can do additional client-side filtering here
		// builders
		if (selectedBuilders.size > 0) list = list.filter(p => selectedBuilders.has(p.builder));
		// Additional client-side sorting (API already handles sort_by, but we can override)
		if (sortOption === 'Beds: High to Low') list.sort((a,b)=>b.beds-a.beds);
		else if (sortOption === 'Baths: High to Low') list.sort((a,b)=>b.baths-a.baths);
		// Update pre-builder ref for builder counts
		preBuilderRef.current = list;
		return list;
	}, [allProperties, selectedBuilders, sortOption]);

	const mapMarkers = React.useMemo(() => {
		return filteredAndSorted
			.filter(p => p.lat !== null && p.lng !== null && !isNaN(p.lat) && !isNaN(p.lng))
			.map(p => ({
				position: { lat: p.lat as number, lng: p.lng as number },
				title: p.title,
				address: p.location,
				city: '', state: '', country: '',
				price: p.price,
				image: p.image,
				id: p.id,
			}));
	}, [filteredAndSorted]);

    const listContainerRef = React.useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
	const [selectedCardId, setSelectedCardId] = React.useState<number | string | null>(null);
    const onMarkerClick = React.useCallback((m: any) => {
        // highlight the card in the list when a marker is clicked
        setSelectedCardId(m.id);
        const el = document.querySelector(`[data-prop-id="${m.id}"]`) as HTMLElement | null;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

	// Auto-clear selection after 10 seconds
	React.useEffect(() => {
		if (selectedCardId == null) return;
		const t = window.setTimeout(() => setSelectedCardId(null), 10000);
		return () => window.clearTimeout(t);
	}, [selectedCardId]);

	React.useEffect(() => {
		show();
	}, [show]);

	React.useLayoutEffect(() => {
		const compute = () => {
			const headerEl = document.querySelector('header') as HTMLElement | null;
			const headerH = headerEl?.offsetHeight || 64;
			setStickyTop(headerH);
			const viewportHeight = (window.visualViewport?.height || window.innerHeight);
			const top = containerRef.current?.getBoundingClientRect().top || headerH;
			setContainerHeight(Math.max(300, viewportHeight - top));
		};
		compute();
		window.addEventListener('resize', compute);
		window.addEventListener('orientationchange', compute);
		window.visualViewport?.addEventListener('resize', compute);
		return () => {
			window.removeEventListener('resize', compute);
			window.removeEventListener('orientationchange', compute);
			window.visualViewport?.removeEventListener('resize', compute);
		};
	}, []);

	return (
		<div className="w-full">
			{/* Top filter area (exact style) */}
			<div ref={topBarRef} className="sticky z-40 bg-white/95 backdrop-blur border-b border-gray-100" style={{ top: stickyTop }} >
				<TopFilterArea
					viewMode={viewMode}
					onChangeViewMode={setViewMode}
					viewedCount={filteredAndSorted.length}
					totalCount={totalCount}
					searchLocation={searchQuery}
					onApplyPropertyTypes={(types) => setSelectedTypes(new Set(types))}
					onApplyPrice={(min, max) => { setPriceMin(min ?? 100); setPriceMax(max ?? 10000000); }}
					onApplyBedsBaths={(beds, baths) => { setBedsMin(beds.min); setBedsMax(beds.max); setBathsMin(baths.min); setBathsMax(baths.max); }}
					onApplySaleType={setSaleType}
					onApplySort={setSortOption}
					maxHoa={maxHoa}
					setMaxHoa={setMaxHoa}
					listingTypes={listingTypes}
					setListingTypes={setListingTypes}
					propertyStatus={propertyStatus}
					setPropertyStatus={setPropertyStatus}
					parkingSlots={parkingSlots}
					setParkingSlots={setParkingSlots}
					totalSqft={totalSqft}
					setTotalSqft={setTotalSqft}
					lotSqft={lotSqft}
					setLotSqft={setLotSqft}
					selectedAppliances={selectedAppliances}
					setSelectedAppliances={setSelectedAppliances}
					selectedIndoor={selectedIndoor}
					setSelectedIndoor={setSelectedIndoor}
					selectedOutdoor={selectedOutdoor}
					setSelectedOutdoor={setSelectedOutdoor}
					selectedCommunity={selectedCommunity}
					setSelectedCommunity={setSelectedCommunity}
					selectedLifestyles={selectedLifestyles}
					setSelectedLifestyles={setSelectedLifestyles}
					propertyTypeOptions={propertyTypeOptions}
				/>
			</div>

			{/* Main content: map + listings */}
			<div ref={containerRef} className="mx-auto max-w-[1600px] px-3 md:px-6 overflow-hidden" style={{ height: containerHeight }}>
				<div className={`grid h-full gap-4 ${viewMode === 'map' ? 'md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_320px]' : 'grid-cols-1'}`}>
					{/* Map (fills left column) */}
					<div className={`${viewMode === 'list' ? 'hidden md:block md:col-span-1' : ''}`}>
						<div className="gradient-border-mask h-full" style={{ padding: 1.5, borderRadius: 22 }}>
							<div className="relative h-full rounded-[22px] overflow-hidden">
								{loading ? (
									<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
										<div className="text-center">
											<div className="w-8 h-8 border-2 border-gray-300 border-t-[#004236] rounded-full animate-spin mx-auto mb-4"></div>
											<p className="text-gray-600">Loading map...</p>
										</div>
									</div>
								) : error ? (
									<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
										<div className="text-center">
											<p className="text-red-600 mb-2">Error loading map</p>
											<p className="text-gray-600 text-sm">{error}</p>
										</div>
									</div>
								) : (
									<>
										<LeftFilterPanel builders={builderList} selected={selectedBuilders} onToggle={toggleBuilder} />
										<div className="absolute inset-0">
											<GoogleMapWithMarker 
												markers={mapMarkers as any} 
												polygon={mapMarkers.length > 0 ? undefined : NYC_POLYGON as any} 
												mapTypeId="HYBRID" 
												onMarkerClick={onMarkerClick} 
											/>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
					{/* Right list panel */}
					<div className={`${viewMode === 'list' ? 'col-span-1' : ''} h-full overflow-hidden`}>
						<div className="h-full rounded-[22px] bg-white/90 backdrop-blur border border-gray-100 shadow-sm overflow-hidden flex flex-col">
							{loading ? (
								<div className="flex-1 flex items-center justify-center">
									<div className="text-center">
										<div className="w-8 h-8 border-2 border-gray-300 border-t-[#004236] rounded-full animate-spin mx-auto mb-4"></div>
										<p className="text-gray-600">Loading properties...</p>
									</div>
								</div>
							) : error ? (
								<div className="flex-1 flex items-center justify-center">
									<div className="text-center">
										<p className="text-red-600 mb-2">Error loading properties</p>
										<p className="text-gray-600 text-sm">{error}</p>
									</div>
								</div>
							) : filteredAndSorted.length === 0 ? (
								<div className="flex-1 flex items-center justify-center">
									<div className="text-center">
										<p className="text-gray-600">No properties found</p>
										{searchQuery && (
											<p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
										)}
									</div>
								</div>
							) : (
								<>
									<div ref={listContainerRef} className={`flex-1 overflow-y-auto p-2 pt-4 grid gap-2 ${viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
										{filteredAndSorted.map((p) => (
											<PropertyCard
												key={p.id}
												property={p}
												selected={selectedCardId === p.id}
												dimmed={selectedCardId !== null && selectedCardId !== p.id}
												onClick={() => {
													setSelectedCardId(p.id);
													try {
														const propertyId = String(p.id);
														persistSelectedPropertyId(propertyId);
														navigate('/v3/property', { state: { propertyId } });
													} catch {}
												}}
											/>
										))}
									</div>
									{loadingMore && (
										<div className="flex items-center justify-center py-4 border-t border-gray-200">
											<div className="flex items-center gap-3">
												<div className="w-5 h-5 border-2 border-gray-300 border-t-[#004236] rounded-full animate-spin"></div>
												<p className="text-sm text-gray-600">Loading more properties...</p>
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MapSearchPage; 