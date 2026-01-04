import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18nV3 from '../i18n';
import V3Header from '../components/V3Header';
import V3Footer from '../components/V3Footer';
import ProductGrid from '../components/ProductGrid';
import type { ApiModel, ApiCategory } from '../types/catalog';
import productBanner from '../../assets/images/v3.2/product-banner.jpg';

const ProductCatalogContent = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [models, setModels] = useState<ApiModel[]>([]);
	const [categories, setCategories] = useState<ApiCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [search, setSearch] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [sort, setSort] = useState<'name-asc' | 'name-desc' | 'number-asc' | 'number-desc'>('name-asc');

	useEffect(() => {
		const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL as string | undefined;
		if (!baseUrl) {
			setError('Products API base URL not configured');
			setLoading(false);
			return;
		}

		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const [modelsRes, categoriesRes] = await Promise.all([
					fetch(`${baseUrl}/models`, { headers: { accept: 'application/json' } }),
					fetch(`${baseUrl}/categories`, { headers: { accept: 'application/json' } }),
				]);

				if (!modelsRes.ok) {
					throw new Error('Failed to load models');
				}
				if (!categoriesRes.ok) {
					throw new Error('Failed to load categories');
				}

				const modelsJson = await modelsRes.json();
				const categoriesJson = await categoriesRes.json();

				setModels(modelsJson.models || []);
				setCategories([{ name: t('common.all'), code: 'all' }, ...(categoriesJson as ApiCategory[])]);
			} catch (e) {
				setError(e instanceof Error ? e.message : 'Unexpected error loading catalogue');
			} finally {
				setLoading(false);
			}
		};

		void fetchData();
	}, [t]);

	const getImageUrl = (model: ApiModel) => {
		const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL as string | undefined;
		if (!baseUrl) return model.thumbnail_url || model.image_file_url || '';

		if (model.image_file_url) {
			return `${baseUrl}${model.image_file_url}`;
		}
		if (model.thumbnail_url && model.thumbnail_url.startsWith('http')) {
			return model.thumbnail_url;
		}
		return model.thumbnail_url || '';
	};

	const filteredModels = useMemo(() => {
		let data = [...models];

		if (search.trim()) {
			const q = search.toLowerCase();
			data = data.filter(
				(m) =>
					m.model_name.toLowerCase().includes(q) ||
					m.model_id.toLowerCase().includes(q) ||
					m.details_category.toLowerCase().includes(q),
			);
		}

		if (selectedCategory !== 'all') {
			const cat = categories.find((c) => c.code === selectedCategory);
			if (cat) {
				data = data.filter(
					(m) =>
						m.details_category.toLowerCase() === cat.name.toLowerCase() ||
						m.model_id.toUpperCase().startsWith(cat.code.toUpperCase()),
				);
			}
		}

		data.sort((a, b) => {
			switch (sort) {
				case 'name-asc':
					return a.model_name.localeCompare(b.model_name);
				case 'name-desc':
					return b.model_name.localeCompare(a.model_name);
				case 'number-asc':
					return (a.model_base_number || 0) - (b.model_base_number || 0);
				case 'number-desc':
					return (b.model_base_number || 0) - (a.model_base_number || 0);
				default:
					return 0;
			}
		});

		return data;
	}, [models, search, selectedCategory, sort, categories]);

	return (
		<div className="min-h-screen bg-white">
			<V3Header />
			
			<div className="relative w-full min-h-screen overflow-hidden">
				{/* Background Image */}
				<div 
					className="absolute inset-0 bg-cover bg-center"
					style={{ 
						backgroundImage: `url(${productBanner})`
					}} 
				/>
				
				{/* Overlay Card */}
				<div 
					className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16"
				>
					<div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
						<div 
							className="bg-[rgba(0,66,54,1)] rounded-2xl p-8 md:p-12 shadow-2xl"
						>
							{/* New Arrival Badge */}
							<div 
								className="text-white text-sm font-medium mb-4 tracking-wide"
							>
								{t('productCatalog.newArrival')}
							</div>
							
							{/* Main Heading */}
							<div 
								className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
								style={{
									background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text',
									color: 'transparent'
								}}
							>
								{t('productCatalog.title')}
							</div>
							
							{/* Description */}
							<p 
								className="text-white text-base md:text-lg mb-8 leading-relaxed"
							>
								{t('productCatalog.description')}
							</p>
							
							{/* Buy Now Button */}
							<button
								className="px-6 py-3 rounded-lg font-medium text-sm uppercase tracking-wide transition-all duration-300 hover:opacity-90"
								style={{
									background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
									color: 'rgba(0, 66, 54, 1)'
								}}
								onClick={() => navigate('/v3/cart')}
							>
								{t('productCatalog.buyNow')}
							</button>
						</div>
					</div>
				</div>
			</div>
			
			{/* Controls + Product Grid Section */}
			<div className="bg-white">
				<div className="max-w-7xl mx-auto px-4 pt-10">
					{/* Our Products heading above filters */}
					<h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
						{t('productGrid.title')}
					</h2>

					<div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between mb-6">
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								{t('productCatalog.searchLabel', 'Search')}
							</label>
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={t('productCatalog.searchPlaceholder', 'Search by name or code')}
								className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
							/>
						</div>

						<div className="flex gap-4 flex-col md:flex-row">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t('productCatalog.categoryLabel', 'Category')}
								</label>
								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
								>
									{categories.map((cat) => (
										<option key={cat.code} value={cat.code}>
											{cat.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t('productCatalog.sortLabel', 'Sort by')}
								</label>
								<select
									value={sort}
									onChange={(e) => setSort(e.target.value as typeof sort)}
									className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
								>
									<option value="name-asc">{t('productCatalog.sortNameAsc', 'Name (A–Z)')}</option>
									<option value="name-desc">{t('productCatalog.sortNameDesc', 'Name (Z–A)')}</option>
									<option value="number-asc">
										{t('productCatalog.sortNumberAsc', 'Base number (Low–High)')}
									</option>
									<option value="number-desc">
										{t('productCatalog.sortNumberDesc', 'Base number (High–Low)')}
									</option>
								</select>
							</div>
						</div>
					</div>

					{loading && (
						<div className="py-16 text-center text-gray-500">{t('common.loading', 'Loading products...')}</div>
					)}

					{!loading && error && (
						<div className="py-16 text-center text-red-600 text-sm">
							{t('common.error', 'Something went wrong')}: {error}
						</div>
					)}
				</div>

				{!loading && !error && (
					<ProductGrid
						products={filteredModels}
						getImageUrl={getImageUrl}
					/>
				)}
			</div>
			
			<V3Footer />
		</div>
	);
};

const ProductCatalog = () => {
	return (
		<I18nextProvider i18n={i18nV3}>
			<ProductCatalogContent />
		</I18nextProvider>
	);
};

export default ProductCatalog;
