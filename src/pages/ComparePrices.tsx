// ═══════════════════════════════════════════════════════════════════════════════
// COMPARE PRICES PAGE - vistaview.live
// Search across 100+ retailers worldwide
// © 2026 Vista View Realty Services LLC. All Rights Reserved.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { globalAffiliateRouter, type AffiliateLink } from '../services/GlobalAffiliateRouter';

const ComparePrices: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState(searchParams.get('cat') || '');
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [userRegion, setUserRegion] = useState(globalAffiliateRouter.getUserRegion());
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const regions = globalAffiliateRouter.getAvailableRegions();
  const stats = globalAffiliateRouter.getStats();

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'sofa', label: 'Sofas & Couches' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'dining', label: 'Dining' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'office', label: 'Office' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'decor', label: 'Home Decor' },
    { value: 'storage', label: 'Storage' },
    { value: 'kitchen', label: 'Kitchen' }
  ];

  const doSearch = useCallback((query: string, cat: string) => {
    if (!query.trim()) {
      setLinks([]);
      return;
    }

    setIsLoading(true);

    // Update URL
    const params = new URLSearchParams();
    params.set('q', query);
    if (cat) params.set('cat', cat);
    setSearchParams(params);

    // Get links
    setTimeout(() => {
      const results = globalAffiliateRouter.getComparisonLinks(query, cat || undefined);
      setLinks(results);
      setIsLoading(false);
    }, 300);
  }, [setSearchParams]);

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, category);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(searchQuery, category);
  };

  const handleRegionChange = (region: string) => {
    globalAffiliateRouter.setUserRegion(region);
    setUserRegion(region);
    if (searchQuery) {
      doSearch(searchQuery, category);
    }
  };

  const handleLinkClick = (link: AffiliateLink) => {
    // Find partner ID
    const partnerId = link.partner.toLowerCase().replace(/\s+/g, '-') + '-' + link.region.toLowerCase();
    globalAffiliateRouter.trackClick(partnerId, searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              VistaView
            </span>
            <span className="text-gray-400">.live</span>
          </Link>

          {/* Region Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Region:</span>
            <select
              value={userRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.flag} {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Compare Furniture Prices
          </h1>
          <p className="text-xl text-teal-100 mb-8">
            Search across {stats.activePartners}+ retailers in {Object.keys(stats.regionCounts).length} countries
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for furniture (e.g., 'mid century sofa')"
                  className="w-full px-5 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-teal-300 focus:outline-none text-lg"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-4 rounded-xl text-gray-900 focus:ring-4 focus:ring-teal-300 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-8 py-4 bg-white text-teal-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Compare
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Searching retailers...</p>
          </div>
        ) : links.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Found {links.length} retailers for "{searchQuery}"
              </h2>
              <button
                onClick={() => setShowAllRegions(!showAllRegions)}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {showAllRegions ? 'Show my region only' : 'Show all regions'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 border border-gray-100 group"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{link.logo}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                          {link.partner}
                        </h3>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                          {regions.find(r => r.code === link.region)?.flag} {link.region}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{link.tagline}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-teal-600 font-medium">
                          Up to {(link.commission * 100).toFixed(0)}% commission
                        </span>
                        <span className="text-teal-500 group-hover:translate-x-1 transition-transform">
                          Visit Store →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <span className="text-6xl">🔍</span>
            <h3 className="text-xl font-semibold text-gray-900 mt-4">No results found</h3>
            <p className="text-gray-600 mt-2">Try a different search term or category</p>
          </div>
        ) : (
          /* Popular Searches */
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Searches</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { query: 'Mid Century Sofa', emoji: '🛋️' },
                { query: 'L Shape Sectional', emoji: '📐' },
                { query: 'Queen Bed Frame', emoji: '🛏️' },
                { query: 'Dining Table Set', emoji: '🍽️' },
                { query: 'Office Chair', emoji: '💺' },
                { query: 'TV Stand', emoji: '📺' },
                { query: 'Coffee Table', emoji: '☕' },
                { query: 'Outdoor Patio Set', emoji: '🌳' }
              ].map((item) => (
                <button
                  key={item.query}
                  onClick={() => {
                    setSearchQuery(item.query);
                    doSearch(item.query, category);
                  }}
                  className="p-4 bg-white rounded-xl shadow hover:shadow-md transition-shadow text-left flex items-center gap-3 border border-gray-100"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="font-medium text-gray-800">{item.query}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <span className="text-3xl">🌍</span>
              <h3 className="font-semibold text-gray-900 mt-2">{stats.activePartners}+ Retailers</h3>
              <p className="text-sm text-gray-600">Across {Object.keys(stats.regionCounts).length} countries</p>
            </div>
            <div>
              <span className="text-3xl">💰</span>
              <h3 className="font-semibold text-gray-900 mt-2">No Extra Cost</h3>
              <p className="text-sm text-gray-600">Same prices as shopping direct</p>
            </div>
            <div>
              <span className="text-3xl">🔒</span>
              <h3 className="font-semibold text-gray-900 mt-2">Secure Shopping</h3>
              <p className="text-sm text-gray-600">Shop directly on retailer sites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">VistaView.live</h4>
              <p className="text-sm text-gray-600">
                Compare furniture prices across {stats.activePartners}+ retailers worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-gray-600 hover:text-teal-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-teal-600">Terms of Service</Link></li>
                <li><Link to="/disclosure" className="text-gray-600 hover:text-teal-600">Affiliate Disclosure</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Categories</h4>
              <ul className="space-y-2 text-sm">
                {categories.slice(1, 5).map((c) => (
                  <li key={c.value}>
                    <button
                      onClick={() => {
                        setCategory(c.value);
                        if (searchQuery) doSearch(searchQuery, c.value);
                      }}
                      className="text-gray-600 hover:text-teal-600"
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Regions</h4>
              <div className="flex flex-wrap gap-2">
                {regions.slice(0, 6).map((r) => (
                  <button
                    key={r.code}
                    onClick={() => handleRegionChange(r.code)}
                    className={`px-2 py-1 text-sm rounded ${
                      userRegion === r.code
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r.flag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-500">
              © 2026 Vista View Realty Services LLC. All Rights Reserved.
            </p>
            <p className="text-xs text-gray-400 mt-2 md:mt-0">
              Affiliate links may earn us a commission at no extra cost to you.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComparePrices;
