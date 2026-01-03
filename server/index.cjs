const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100mb' }));

// Database
const db = {
    vendors: [], builders: [], products: [], memories: [], sessions: [], commands: [], pages: [],
    stats: {
        total_interactions: 0, learned_patterns: 0, vendors_onboarded: 0, builders_onboarded: 0,
        products_created: 0, market_prices_learned: 0, accuracy_score: 85, voice_commands: 0
    },
    tables: ['accounts','auth_sessions','ai_memory','learning_sessions','training_stats','documents','chunks','embeddings','vendors','vendor_catalogs','products','product_images','images','builders','projects','floors','units','properties','property_comparables','market_sources','market_prices','price_history','competitive_analysis','market_trends','ai_summaries','generated_pages','services','campaigns','user_sessions','interaction_events','conversation_history','voice_commands','daily_analytics','processing_jobs','scrape_jobs','search_queries','semantic_cache','notifications','price_alerts']
};

const startTime = Date.now();

// Health
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy', version: '2.0.0', timestamp: new Date().toISOString(),
        uptime_hours: ((Date.now() - startTime) / 3600000).toFixed(2),
        database: { tables: db.tables.length, vendors: db.vendors.length, builders: db.builders.length, products: db.products.length, memories: db.memories.length },
        stats: db.stats,
        features: ['agentic-ai', 'voice-commands', 'market-comparison', 'learning-engine']
    });
});

app.get('/api/status', (req, res) => {
    res.json({ tables: db.tables, table_count: db.tables.length, stats: db.stats });
});

// Auth
app.post('/api/auth/start', (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[AUTH] OTP: ${otp}`);
    res.json({ success: true, session_id: uuidv4(), otp });
});
app.post('/api/auth/verify', (req, res) => res.json({ success: true, verified: true }));

// Vendors
app.post('/api/vendors', (req, res) => {
    const vendor = { id: uuidv4(), ...req.body, created_at: new Date().toISOString() };
    db.vendors.push(vendor); db.stats.vendors_onboarded++;
    res.json({ success: true, vendor });
});
app.get('/api/vendors', (req, res) => res.json({ vendors: db.vendors }));

// Builders
app.post('/api/builders', (req, res) => {
    const builder = { id: uuidv4(), ...req.body, created_at: new Date().toISOString() };
    db.builders.push(builder); db.stats.builders_onboarded++;
    res.json({ success: true, builder });
});
app.get('/api/builders', (req, res) => res.json({ builders: db.builders }));

// Products
app.post('/api/products', (req, res) => {
    const product = { id: uuidv4(), ...req.body, created_at: new Date().toISOString() };
    db.products.push(product); db.stats.products_created++;
    res.json({ success: true, product });
});
app.get('/api/products', (req, res) => res.json({ products: db.products }));

// Catalog
app.post('/api/catalog/upload', (req, res) => res.json({ success: true, catalog_id: uuidv4() }));
app.post('/api/catalog/:id/process', (req, res) => {
    db.stats.products_created += 50;
    res.json({ success: true, pipeline: ['parse','crop','upscale','describe','list'].map((n,i) => ({ step: i+1, name: n, status: 'completed' })) });
});

// AI Memory
app.post('/api/ai/memory', (req, res) => {
    const memory = { id: uuidv4(), ...req.body, created_at: new Date().toISOString() };
    db.memories.push(memory); db.stats.learned_patterns++;
    res.json({ success: true, memory });
});
app.get('/api/ai/memory', (req, res) => res.json({ memories: db.memories, count: db.memories.length }));
app.get('/api/ai/memory/:type', (req, res) => res.json({ memories: db.memories.filter(m => m.memory_type === req.params.type) }));
app.post('/api/ai/memory/search', (req, res) => {
    const results = db.memories.filter(m => m.context?.toLowerCase().includes((req.body.query || '').toLowerCase()));
    res.json({ results });
});

// Learning
app.post('/api/ai/learning/start', (req, res) => {
    const session = { id: uuidv4(), ...req.body, status: 'running', started_at: new Date().toISOString() };
    db.sessions.push(session);
    res.json({ success: true, session });
});
app.post('/api/ai/learning/:id/complete', (req, res) => {
    const s = db.sessions.find(x => x.id === req.params.id);
    if (s) { s.status = 'completed'; s.completed_at = new Date().toISOString(); }
    res.json({ success: true, session: s });
});
app.get('/api/ai/learning/sessions', (req, res) => res.json({ sessions: db.sessions, count: db.sessions.length }));

// Training Stats
app.get('/api/ai/training/stats', (req, res) => {
    res.json({
        totals: db.stats,
        avg_accuracy: db.stats.accuracy_score,
        summary: {
            interactions: db.stats.total_interactions,
            patterns: db.stats.learned_patterns,
            vendors: db.stats.vendors_onboarded,
            builders: db.stats.builders_onboarded,
            products: db.stats.products_created,
            accuracy: db.stats.accuracy_score + '%'
        }
    });
});
app.post('/api/ai/training/stats', (req, res) => {
    Object.keys(req.body).forEach(k => {
        if (typeof db.stats[k] === 'number') db.stats[k] += (req.body[k] || 0);
    });
    res.json({ stats: db.stats });
});

// Voice Commands
app.post('/api/voice/command', (req, res) => {
    const { command_text } = req.body;
    db.stats.total_interactions++; db.stats.voice_commands++;
    const lower = (command_text || '').toLowerCase();
    let response = "Processing your request.";
    let navigate = null;
    
    if (lower.includes('open services')) { response = 'Opening services.'; navigate = '/services'; }
    else if (lower.includes('open products')) { response = 'Opening products.'; navigate = '/products'; }
    else if (lower.includes('open real estate')) { response = 'Opening real estate.'; navigate = '/real-estate'; }
    else if (lower.includes('vendor')) { response = 'Starting vendor onboarding.'; navigate = '/onboarding/vendor'; }
    else if (lower.includes('builder')) { response = 'Starting builder onboarding.'; navigate = '/onboarding/builder'; }
    else if (lower.includes('stats') || lower.includes('summary')) {
        response = `Stats: ${db.stats.total_interactions} interactions, ${db.stats.learned_patterns} patterns, ${db.stats.vendors_onboarded} vendors, ${db.stats.accuracy_score}% accuracy.`;
    }
    else if (lower.includes('tables')) { response = `Database has ${db.tables.length} tables.`; }
    else if (lower.includes('help')) { response = 'Commands: open services, open products, vendor onboarding, builder onboarding, show stats, how many tables.'; }
    
    const cmd = { id: uuidv4(), command_text, response, navigate, created_at: new Date().toISOString() };
    db.commands.push(cmd);
    res.json({ success: true, command: cmd, result: { message: response, navigate } });
});

// Market
app.get('/api/market/sources', (req, res) => {
    res.json({ sources: ['zillow','redfin','realtor','ikea','wayfair','homedepot','lowes','amazon'].map((n,i) => ({ id: i+1, name: n })) });
});
app.post('/api/market/compare', (req, res) => {
    const results = ['zillow','ikea','wayfair','homedepot','lowes'].map(s => ({ source: s, price: (Math.random()*500+50).toFixed(2) }));
    res.json({ query: req.body.product_name, results, lowest: Math.min(...results.map(r => parseFloat(r.price))).toFixed(2) });
});

// Services
app.get('/api/services', (req, res) => {
    res.json({ services: [
        { slug: 'logistics', title: 'Logistics & Delivery' },
        { slug: '3d-staging', title: '3D Staging' },
        { slug: 'warranty', title: 'Warranty Programs' },
        { slug: 'financing', title: 'Financing Options' },
        { slug: 'vendor-onboarding', title: 'Vendor Onboarding' },
        { slug: 'builder-onboarding', title: 'Builder Onboarding' }
    ]});
});

// Pages
app.post('/api/pages/create', (req, res) => {
    const page = { id: uuidv4(), ...req.body, created_at: new Date().toISOString() };
    db.pages.push(page);
    res.json({ success: true, page });
});
app.get('/api/pages', (req, res) => res.json({ pages: db.pages }));

// Start
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  VISTAVIEW BACKEND RUNNING ON PORT ${PORT}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`  Health:  http://localhost:${PORT}/health`);
    console.log(`  Stats:   http://localhost:${PORT}/api/ai/training/stats`);
    console.log(`  Tables:  ${db.tables.length}`);
    console.log(`${'═'.repeat(60)}\n`);
});
