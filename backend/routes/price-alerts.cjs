// ═══════════════════════════════════════════════════════════════════════════════
// PRICE ALERTS API - vistaview.live
// Capture emails, send alerts, build mailing list = $$$
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { pool } = require('../pgConfig.cjs');

// Initialize tables
const initTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        product_search TEXT NOT NULL,
        target_price DECIMAL(10,2),
        product_category VARCHAR(100),
        region VARCHAR(10) DEFAULT 'US',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_checked TIMESTAMP,
        alerts_sent INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_alerts_email ON price_alerts(email);
      CREATE INDEX IF NOT EXISTS idx_alerts_status ON price_alerts(status);

      -- Email list for marketing
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        source VARCHAR(50) DEFAULT 'price_alert',
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
      );
    `);
    console.log('[Price Alerts] Tables initialized');
  } catch (err) {
    console.error('[Price Alerts] Table init error:', err);
  }
};

initTables();

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE PRICE ALERT
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/', async (req, res) => {
  try {
    const { email, productSearch, targetPrice, productCategory, region } = req.body;

    if (!email || !productSearch) {
      return res.status(400).json({ success: false, error: 'Email and product search required' });
    }

    // Create alert
    const alertResult = await pool.query(`
      INSERT INTO price_alerts (email, product_search, target_price, product_category, region)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [email, productSearch, targetPrice || null, productCategory || 'furniture', region || 'US']);

    // Add to email list (upsert)
    await pool.query(`
      INSERT INTO email_subscribers (email, source)
      VALUES ($1, 'price_alert')
      ON CONFLICT (email) DO UPDATE SET status = 'active'
    `, [email]);

    console.log(`[Price Alert] Created: ${email} watching "${productSearch}"`);

    res.json({
      success: true,
      alertId: alertResult.rows[0].id,
      message: 'Price alert created successfully'
    });
  } catch (err) {
    console.error('[Price Alert] Create error:', err);
    res.status(500).json({ success: false, error: 'Failed to create alert' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET USER'S ALERTS
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const result = await pool.query(`
      SELECT id, product_search, target_price, product_category, status, created_at, alerts_sent
      FROM price_alerts
      WHERE email = $1
      ORDER BY created_at DESC
    `, [email]);

    res.json({ success: true, alerts: result.rows });
  } catch (err) {
    console.error('[Price Alert] Get user alerts error:', err);
    res.status(500).json({ success: false, error: 'Failed to get alerts' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE ALERT
// ═══════════════════════════════════════════════════════════════════════════════
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`UPDATE price_alerts SET status = 'deleted' WHERE id = $1`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error('[Price Alert] Delete error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN: GET ALL ALERTS (for dashboard)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/admin/all', async (req, res) => {
  try {
    const alerts = await pool.query(`
      SELECT * FROM price_alerts
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 100
    `);

    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_alerts,
        COUNT(DISTINCT email) as unique_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as new_today,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week
      FROM price_alerts
      WHERE status = 'active'
    `);

    const emailStats = await pool.query(`
      SELECT COUNT(*) as total_subscribers
      FROM email_subscribers
      WHERE status = 'active'
    `);

    res.json({
      success: true,
      alerts: alerts.rows,
      stats: {
        ...stats.rows[0],
        total_subscribers: emailStats.rows[0].total_subscribers
      }
    });
  } catch (err) {
    console.error('[Price Alert] Admin get all error:', err);
    res.status(500).json({ success: false, error: 'Failed to get alerts' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT EMAIL LIST (for marketing)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/admin/export-emails', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT email, source, subscribed_at
      FROM email_subscribers
      WHERE status = 'active'
      ORDER BY subscribed_at DESC
    `);

    const csv = [
      'Email,Source,Subscribed At',
      ...result.rows.map(r => `${r.email},${r.source},${r.subscribed_at}`)
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vistaview_email_list.csv');
    res.send(csv);
  } catch (err) {
    console.error('[Price Alert] Export error:', err);
    res.status(500).json({ success: false, error: 'Failed to export' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// UNSUBSCRIBE
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    await pool.query(`
      UPDATE email_subscribers
      SET status = 'unsubscribed', unsubscribed_at = NOW()
      WHERE email = $1
    `, [email]);

    await pool.query(`
      UPDATE price_alerts
      SET status = 'unsubscribed'
      WHERE email = $1
    `, [email]);

    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (err) {
    console.error('[Price Alert] Unsubscribe error:', err);
    res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
  }
});

module.exports = router;
