// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW ADMIN DASHBOARD
// Real-time analytics, revenue tracking, conversion optimization
// Goal: Track path to $30K/month
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';

interface DashboardStats {
  totalClicks: number;
  uniqueVisitors: number;
  partnersClicked: number;
  estimatedRevenue: number;
  conversionRate: number;
  topSearches: { query: string; count: number }[];
  topPartners: { name: string; clicks: number }[];
  regionBreakdown: { region: string; clicks: number }[];
  dailyTrend: { date: string; clicks: number; revenue: number }[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'searches' | 'leads'>('overview');

  // Monthly goal
  const MONTHLY_GOAL = 30000;

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // In production, this would call the real API
      // const response = await fetch(`/api/analytics/stats?days=${timeRange}`);
      // const data = await response.json();

      // Simulated data for demo
      const mockStats: DashboardStats = {
        totalClicks: 12847,
        uniqueVisitors: 8234,
        partnersClicked: 47,
        estimatedRevenue: 4521.33,
        conversionRate: 2.4,
        topSearches: [
          { query: 'mid century sofa', count: 342 },
          { query: 'queen bed frame', count: 287 },
          { query: 'dining table set', count: 234 },
          { query: 'office chair ergonomic', count: 198 },
          { query: 'sectional couch', count: 176 },
          { query: 'coffee table modern', count: 154 },
          { query: 'tv stand', count: 143 },
          { query: 'outdoor furniture', count: 132 }
        ],
        topPartners: [
          { name: 'Amazon', clicks: 3421 },
          { name: 'Wayfair', clicks: 2187 },
          { name: 'IKEA', clicks: 1876 },
          { name: 'Target', clicks: 1234 },
          { name: 'Walmart', clicks: 987 },
          { name: 'Overstock', clicks: 654 },
          { name: 'West Elm', clicks: 543 },
          { name: 'Flipkart', clicks: 432 }
        ],
        regionBreakdown: [
          { region: 'US', clicks: 6543 },
          { region: 'IN', clicks: 2341 },
          { region: 'UK', clicks: 1876 },
          { region: 'DE', clicks: 987 },
          { region: 'AU', clicks: 543 },
          { region: 'Other', clicks: 557 }
        ],
        dailyTrend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          clicks: Math.floor(300 + Math.random() * 400),
          revenue: Math.floor(100 + Math.random() * 200)
        }))
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressToGoal = stats ? (stats.estimatedRevenue / MONTHLY_GOAL) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">VistaView Dashboard</h1>
            <p className="text-gray-400 text-sm">Track your path to $30K/month</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={fetchStats}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Goal Progress */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-teal-100">Monthly Goal Progress</h2>
              <p className="text-3xl font-bold">${stats.estimatedRevenue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-100">Target</p>
              <p className="text-2xl font-bold">${MONTHLY_GOAL.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-4 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressToGoal, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-teal-100 mt-2">
            {progressToGoal.toFixed(1)}% of goal • ${(MONTHLY_GOAL - stats.estimatedRevenue).toLocaleString()} to go
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-3xl">👆</span>
              <span className="text-green-400 text-sm">+12.5%</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalClicks.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Clicks</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-3xl">👥</span>
              <span className="text-green-400 text-sm">+8.2%</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.uniqueVisitors.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Unique Visitors</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🏪</span>
              <span className="text-green-400 text-sm">+5</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.partnersClicked}</p>
            <p className="text-gray-400 text-sm">Partners Clicked</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-3xl">📈</span>
              <span className="text-green-400 text-sm">+0.3%</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.conversionRate}%</p>
            <p className="text-gray-400 text-sm">Conversion Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
          {['overview', 'partners', 'searches', 'leads'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Trend Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Daily Performance</h3>
            <div className="h-48 flex items-end gap-1">
              {stats.dailyTrend.slice(-14).map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-teal-500 rounded-t transition-all hover:bg-teal-400"
                    style={{ height: `${(day.clicks / 700) * 100}%` }}
                    title={`${day.date}: ${day.clicks} clicks`}
                  ></div>
                  <span className="text-xs text-gray-500 rotate-45 origin-left">{day.date.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Partners */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Top Partners</h3>
            <div className="space-y-3">
              {stats.topPartners.slice(0, 6).map((partner, idx) => (
                <div key={partner.name} className="flex items-center gap-3">
                  <span className="w-6 text-center text-gray-500">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{partner.name}</span>
                      <span className="text-teal-400">{partner.clicks.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${(partner.clicks / stats.topPartners[0].clicks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Searches */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Trending Searches</h3>
            <div className="space-y-2">
              {stats.topSearches.slice(0, 8).map((search, idx) => (
                <div key={search.query} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${idx < 3 ? '🔥' : '🔍'}`}>{idx < 3 ? '🔥' : '🔍'}</span>
                    <span className="capitalize">{search.query}</span>
                  </div>
                  <span className="text-gray-400">{search.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Region Breakdown */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Traffic by Region</h3>
            <div className="space-y-3">
              {stats.regionBreakdown.map((region) => {
                const flags: Record<string, string> = {
                  'US': '🇺🇸', 'IN': '🇮🇳', 'UK': '🇬🇧', 'DE': '🇩🇪', 'AU': '🇦🇺', 'Other': '🌍'
                };
                const percentage = (region.clicks / stats.totalClicks) * 100;
                return (
                  <div key={region.region} className="flex items-center gap-3">
                    <span className="text-2xl">{flags[region.region] || '🌍'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span>{region.region}</span>
                        <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-teal-400 w-16 text-right">{region.clicks.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown (Estimated)</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-700/50 rounded-xl">
              <p className="text-3xl font-bold text-teal-400">${(stats.estimatedRevenue * 0.65).toFixed(2)}</p>
              <p className="text-gray-400 mt-1">Affiliate Commissions</p>
              <p className="text-xs text-gray-500 mt-1">Based on 2% conversion rate</p>
            </div>
            <div className="text-center p-4 bg-gray-700/50 rounded-xl">
              <p className="text-3xl font-bold text-emerald-400">${(stats.estimatedRevenue * 0.30).toFixed(2)}</p>
              <p className="text-gray-400 mt-1">Lead Generation</p>
              <p className="text-xs text-gray-500 mt-1">Skyven Tower leads</p>
            </div>
            <div className="text-center p-4 bg-gray-700/50 rounded-xl">
              <p className="text-3xl font-bold text-cyan-400">${(stats.estimatedRevenue * 0.05).toFixed(2)}</p>
              <p className="text-gray-400 mt-1">Premium Features</p>
              <p className="text-xs text-gray-500 mt-1">Price alerts, saved searches</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
