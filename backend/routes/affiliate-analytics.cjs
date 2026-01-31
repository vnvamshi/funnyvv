// ═══════════════════════════════════════════════════════════════════════════════
// AFFILIATE ANALYTICS API - vistaview.live
// Track clicks, conversions, and revenue across 100+ partners
// © 2026 Vista View Realty Services LLC. All Rights Reserved.
// ═══════════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { pool } = require('../pgConfig.cjs');

// Initialize tables
const initTables = async () => {
  try {
    await pool.query(`
      -- Affiliate Clicks Table
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id SERIAL PRIMARY KEY,
        partner_id VARCHAR(100),
        partner_name VARCHAR(255),
        search_query TEXT,
        category VARCHAR(100),
        region VARCHAR(10),
        referrer TEXT,
        user_agent TEXT,
        ip_address VARCHAR(50),
        session_id VARCHAR(100),
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for analytics queries
      CREATE INDEX IF NOT EXISTS idx_aff_clicks_partner ON affiliate_clicks(partner_id);
      CREATE INDEX IF NOT EXISTS idx_aff_clicks_region ON affiliate_clicks(region);
      CREATE INDEX IF NOT EXISTS idx_aff_clicks_date ON affiliate_clicks(clicked_at);

      -- Daily aggregates table for fast reporting
      CREATE TABLE IF NOT EXISTS affiliate_daily_stats (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        partner_id VARCHAR(100),
        region VARCHAR(10),
        clicks INTEGER DEFAULT 0,
        estimated_revenue DECIMAL(10,2) DEFAULT 0,
        UNIQUE(date, partner_id, region)
      );

      CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON affiliate_daily_stats(date);
    `);
    console.log('[Affiliate Analytics] Tables initialized');
  } catch (err) {
    console.error('[Affiliate Analytics] Table init error:', err);
  }
};

initTables();

// ═══════════════════════════════════════════════════════════════════════════════
// TRACK CLICK
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/affiliate-click', async (req, res) => {
  try {
    const {
      partnerId,
      partnerName,
      searchQuery,
      category,
      region,
      referrer
    } = req.body;

    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const sessionId = req.cookies?.sessionId || `sess_${Date.now()}`;

    // Insert click
    await pool.query(`
      INSERT INTO affiliate_clicks (
        partner_id, partner_name, search_query, category,
        region, referrer, user_agent, ip_address, session_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      partnerId || 'unknown',
      partnerName || partnerId,
      searchQuery,
      category,
      region || 'US',
      referrer,
      userAgent,
      ipAddress,
      sessionId
    ]);

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    await pool.query(`
      INSERT INTO affiliate_daily_stats (date, partner_id, region, clicks)
      VALUES ($1, $2, $3, 1)
      ON CONFLICT (date, partner_id, region)
      DO UPDATE SET clicks = affiliate_daily_stats.clicks + 1
    `, [today, partnerId || 'unknown', region || 'US']);

    console.log(`[Affiliate] Click tracked: ${partnerId} - ${searchQuery}`);

    res.json({ success: true });
  } catch (err) {
    console.error('[Affiliate] Click tracking error:', err);
    res.status(500).json({ success: false, error: 'Failed to track click' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET STATS (Admin)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Total clicks
    const totals = await pool.query(`
      SELECT
        COUNT(*) as total_clicks,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT partner_id) as partners_clicked
      FROM affiliate_clicks
      WHERE clicked_at > NOW() - INTERVAL '${parseInt(days)} days'
    `);

    // Clicks by partner
    const byPartner = await pool.query(`
      SELECT
        partner_id,
        partner_name,
        COUNT(*) as clicks
      FROM affiliate_clicks
      WHERE clicked_at > NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY partner_id, partner_name
      ORDER BY clicks DESC
      LIMIT 20
    `);

    // Clicks by region
    const byRegion = await pool.query(`
      SELECT
        region,
        COUNT(*) as clicks
      FROM affiliate_clicks
      WHERE clicked_at > NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY region
      ORDER BY clicks DESC
    `);

    // Daily trend
    const dailyTrend = await pool.query(`
      SELECT
        DATE(clicked_at) as date,
        COUNT(*) as clicks
      FROM affiliate_clicks
      WHERE clicked_at > NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE(clicked_at)
      ORDER BY date DESC
    `);

    // Top searches
    const topSearches = await pool.query(`
      SELECT
        search_query,
        COUNT(*) as searches
      FROM affiliate_clicks
      WHERE clicked_at > NOW() - INTERVAL '${parseInt(days)} days'
        AND search_query IS NOT NULL
      GROUP BY search_query
      ORDER BY searches DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      stats: {
        totals: totals.rows[0],
        byPartner: byPartner.rows,
        byRegion: byRegion.rows,
        dailyTrend: dailyTrend.rows,
        topSearches: topSearches.rows
      }
    });
  } catch (err) {
    console.error('[Affiliate] Stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET REVENUE ESTIMATE
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/revenue-estimate', async (req, res) => {
  try {
    // Commission rates by partner type
    const commissionRates = {
      'amazon': 0.04,
      'wayfair': 0.07,
      'ikea': 0.03,
      'flipkart': 0.06,
      'pepperfry': 0.08,
      'default': 0.05
    };

    // Average order values by category
    const avgOrderValue = {
      'furniture': 400,
      'sofa': 800,
      'bedroom': 600,
      'dining': 500,
      'outdoor': 350,
      'default': 300
    };

    // Assume 2% click-to-purchase conversion rate (industry average)
    const conversionRate = 0.02;

    const clicksResult = await pool.query(`
      SELECT
        partner_id,
        category,
        COUNT(*) as clicks
      FROM affiliate_clicks
      WHERE clicked_at > NOW() - INTERVAL '30 days'
      GROUP BY partner_id, category
    `);

    let totalEstimatedRevenue = 0;
    const breakdown = [];

    for (const row of clicksResult.rows) {
      const partnerKey = row.partner_id?.split('-')[0]?.toLowerCase() || 'default';
      const commission = commissionRates[partnerKey] || commissionRates.default;
      const orderValue = avgOrderValue[row.category] || avgOrderValue.default;

      const estimatedPurchases = row.clicks * conversionRate;
      const estimatedCommission = estimatedPurchases * orderValue * commission;

      totalEstimatedRevenue += estimatedCommission;
      breakdown.push({
        partner: row.partner_id,
        category: row.category,
        clicks: row.clicks,
        estimatedPurchases: Math.round(estimatedPurchases * 10) / 10,
        estimatedRevenue: Math.round(estimatedCommission * 100) / 100
      });
    }

    res.json({
      success: true,
      revenue: {
        total30Days: Math.round(totalEstimatedRevenue * 100) / 100,
        breakdown: breakdown.sort((a, b) => b.estimatedRevenue - a.estimatedRevenue),
        assumptions: {
          conversionRate: '2%',
          note: 'Estimates based on industry average conversion rates'
        }
      }
    });
  } catch (err) {
    console.error('[Affiliate] Revenue estimate error:', err);
    res.status(500).json({ success: false, error: 'Failed to calculate revenue' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT CLICKS (CSV)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/export', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await pool.query(`
      SELECT
        partner_id,
        partner_name,
        search_query,
        category,
        region,
        clicked_at
      FROM affiliate_clicks
      WHERE clicked_at > NOW() - INTERVAL '${parseInt(days)} days'
      ORDER BY clicked_at DESC
    `);

    const csv = [
      'Partner ID,Partner Name,Search Query,Category,Region,Clicked At',
      ...result.rows.map(row => [
        row.partner_id,
        row.partner_name,
        `"${(row.search_query || '').replace(/"/g, '""')}"`,
        row.category,
        row.region,
        row.clicked_at
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=vistaview_affiliate_clicks_${days}d.csv`);
    res.send(csv);
  } catch (err) {
    console.error('[Affiliate] Export error:', err);
    res.status(500).json({ success: false, error: 'Failed to export' });
  }
});

module.exports = router;
