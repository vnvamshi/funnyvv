// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW.LIVE - AFFILIATE LANDING PAGE
// Compare furniture prices across 100+ retailers worldwide
// © 2026 Vista View Realty Services LLC. All Rights Reserved.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { globalAffiliateRouter } from '../services/GlobalAffiliateRouter';

const AffiliateLanding: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const stats = globalAffiliateRouter.getStats();
  const regions = globalAffiliateRouter.getAvailableRegions();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/compare?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularCategories = [
    { name: 'Sofas', query: 'sofa', emoji: '🛋️', color: 'from-blue-500 to-blue-600' },
    { name: 'Beds', query: 'bed frame', emoji: '🛏️', color: 'from-purple-500 to-purple-600' },
    { name: 'Dining Tables', query: 'dining table', emoji: '🍽️', color: 'from-amber-500 to-amber-600' },
    { name: 'Office Chairs', query: 'office chair', emoji: '💺', color: 'from-green-500 to-green-600' },
    { name: 'Outdoor', query: 'patio furniture', emoji: '🌳', color: 'from-teal-500 to-teal-600' },
    { name: 'Lighting', query: 'floor lamp', emoji: '💡', color: 'from-yellow-500 to-yellow-600' }
  ];

  const featuredRetailers = [
    { name: 'Amazon', logo: '🛒', region: '🇺🇸 🇮🇳 🇬🇧 🇩🇪 🇯🇵' },
    { name: 'Wayfair', logo: '🏠', region: '🇺🇸 🇬🇧 🇩🇪' },
    { name: 'IKEA', logo: '🪑', region: '🌍 Worldwide' },
    { name: 'Flipkart', logo: '🛍️', region: '🇮🇳 India' },
    { name: 'Pepperfry', logo: '🌶️', region: '🇮🇳 India' },
    { name: 'Taobao', logo: '🟠', region: '🇨🇳 China' },
    { name: 'West Elm', logo: '✨', region: '🇺🇸 US' },
    { name: 'John Lewis', logo: '🎩', region: '🇬🇧 UK' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              VistaView
            </span>
            <span className="text-gray-400 font-light">.live</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/compare" className="text-gray-600 hover:text-teal-600 font-medium">
              Compare Prices
            </Link>
            <Link to="/disclosure" className="text-gray-500 hover:text-teal-600 text-sm">
              Disclosure
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Compare Furniture Prices
            <span className="block bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Across the Globe
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Search {stats.activePartners}+ retailers in {Object.keys(stats.regionCounts).length} countries.
            Find the best deals on furniture without visiting every store.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for furniture (e.g., 'mid century sofa')"
                className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 focus:outline-none shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* Region Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-gray-500 text-sm mr-2">Popular regions:</span>
            {regions.slice(0, 6).map((r) => (
              <span
                key={r.code}
                className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200"
              >
                {r.flag} {r.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Shop by Category
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/compare?q=${encodeURIComponent(cat.query)}`)}
                className={`p-6 rounded-2xl bg-gradient-to-br ${cat.color} text-white hover:scale-105 transition-transform`}
              >
                <span className="text-4xl mb-2 block">{cat.emoji}</span>
                <span className="font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="font-semibold text-xl text-gray-900 mb-2">1. Search</h3>
              <p className="text-gray-600">
                Enter what you're looking for - sofas, beds, dining tables, anything.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="font-semibold text-xl text-gray-900 mb-2">2. Compare</h3>
              <p className="text-gray-600">
                See results from {stats.activePartners}+ retailers across {Object.keys(stats.regionCounts).length} countries instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-semibold text-xl text-gray-900 mb-2">3. Save</h3>
              <p className="text-gray-600">
                Click through to buy directly from the retailer at no extra cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Retailers */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {stats.activePartners}+ Trusted Retailers
          </h2>
          <p className="text-center text-gray-600 mb-10">
            We partner with leading furniture retailers worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredRetailers.map((ret) => (
              <div
                key={ret.name}
                className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors"
              >
                <span className="text-4xl mb-2 block">{ret.logo}</span>
                <h4 className="font-semibold text-gray-900">{ret.name}</h4>
                <p className="text-xs text-gray-500">{ret.region}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            And {stats.activePartners - 8}+ more retailers...
          </p>
        </div>
      </section>

      {/* Global Coverage */}
      <section className="py-16 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Global Coverage</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {regions.map((r) => (
              <div
                key={r.code}
                className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm"
              >
                <span className="text-2xl mr-2">{r.flag}</span>
                <span>{r.name}</span>
              </div>
            ))}
          </div>
          <p className="text-teal-100">
            We automatically detect your region and show relevant retailers first.
          </p>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-4xl mb-2 block">🔒</span>
              <h4 className="font-semibold text-gray-900">Secure</h4>
              <p className="text-sm text-gray-600">Shop directly on retailer sites</p>
            </div>
            <div>
              <span className="text-4xl mb-2 block">💯</span>
              <h4 className="font-semibold text-gray-900">Same Prices</h4>
              <p className="text-sm text-gray-600">No markup, same as direct</p>
            </div>
            <div>
              <span className="text-4xl mb-2 block">🌍</span>
              <h4 className="font-semibold text-gray-900">{Object.keys(stats.regionCounts).length} Countries</h4>
              <p className="text-sm text-gray-600">Global coverage</p>
            </div>
            <div>
              <span className="text-4xl mb-2 block">⚡</span>
              <h4 className="font-semibold text-gray-900">Instant</h4>
              <p className="text-sm text-gray-600">Real-time results</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Comparing Now
          </h2>
          <p className="text-gray-600 mb-8">
            Find the perfect furniture at the best price across {stats.activePartners}+ retailers.
          </p>
          <button
            onClick={() => navigate('/compare')}
            className="px-10 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-lg font-bold rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            Compare Prices Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">VistaView.live</h4>
              <p className="text-sm">
                Compare furniture prices across {stats.activePartners}+ retailers worldwide.
                Find the best deals without visiting every store.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-teal-400">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-teal-400">Terms of Service</Link></li>
                <li><Link to="/disclosure" className="hover:text-teal-400">Affiliate Disclosure</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/compare?q=sofa" className="hover:text-teal-400">Sofas</Link></li>
                <li><Link to="/compare?q=bed" className="hover:text-teal-400">Beds</Link></li>
                <li><Link to="/compare?q=dining+table" className="hover:text-teal-400">Dining</Link></li>
                <li><Link to="/compare?q=office+furniture" className="hover:text-teal-400">Office</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <p className="text-sm">
                Vista View Realty Services LLC<br />
                Irving, TX 75063, USA
              </p>
              <p className="text-sm mt-2">
                affiliates@vistaview.live
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">
              © 2026 Vista View Realty Services LLC. All Rights Reserved.
            </p>
            <p className="text-xs mt-2 md:mt-0">
              This site contains affiliate links. We may earn a commission at no extra cost to you.
              <Link to="/disclosure" className="text-teal-400 ml-1">Learn more</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AffiliateLanding;
