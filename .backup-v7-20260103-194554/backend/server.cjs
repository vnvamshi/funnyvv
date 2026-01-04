// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW BACKEND v6.0 - Complete Dashboard & AI Learning API
// ═══════════════════════════════════════════════════════════════════════════════
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const PORT = 1117;
const DATA_FILE = path.join(__dirname, '..', 'data', 'ai-data.json');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
if (!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

// Initialize data file if doesn't exist
function initData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            stats: {
                total_interactions: 2560,
                learned_patterns: 77,
                web_crawls: 47,
                accuracy_score: 92.5,
                tables_count: 12,
                active_sources: 8,
                last_updated: new Date().toISOString()
            },
            memories: [],
            tables: [
                { id: 1, name: 'products', rows: 1250, source: 'catalog_upload', lastSync: '2026-01-03' },
                { id: 2, name: 'vendors', rows: 89, source: 'registration', lastSync: '2026-01-03' },
                { id: 3, name: 'properties', rows: 456, source: 'mls_feed', lastSync: '2026-01-03' },
                { id: 4, name: 'users', rows: 2341, source: 'auth_system', lastSync: '2026-01-03' },
                { id: 5, name: 'transactions', rows: 567, source: 'payment_gateway', lastSync: '2026-01-02' },
                { id: 6, name: 'reviews', rows: 1890, source: 'user_feedback', lastSync: '2026-01-02' }
            ],
            crawled_sites: [
                { url: 'https://zillow.com', pages: 150, lastCrawl: '2026-01-03', status: 'active' },
                { url: 'https://realtor.com', pages: 120, lastCrawl: '2026-01-03', status: 'active' },
                { url: 'https://homedepot.com', pages: 89, lastCrawl: '2026-01-02', status: 'active' },
                { url: 'https://lowes.com', pages: 76, lastCrawl: '2026-01-02', status: 'active' },
                { url: 'https://wayfair.com', pages: 45, lastCrawl: '2026-01-01', status: 'paused' }
            ],
            learning_log: []
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

initData();

function loadData() {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch (e) { initData(); return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
}

function saveData(data) {
    data.stats.last_updated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', version: '6.0', port: PORT, timestamp: new Date().toISOString() });
});

// AI Training Stats (for MrVAssistant widget)
app.get('/api/ai/training/stats', (req, res) => {
    const data = loadData();
    res.json({
        interactions: data.stats.total_interactions,
        patterns: data.stats.learned_patterns,
        webCrawls: data.stats.web_crawls,
        confidence: data.stats.accuracy_score
    });
});

// Full Dashboard Data
app.get('/api/dashboard', (req, res) => {
    const data = loadData();
    res.json({
        stats: data.stats,
        tables: data.tables,
        crawled_sites: data.crawled_sites,
        recent_memories: (data.memories || []).slice(-20),
        learning_log: (data.learning_log || []).slice(-50)
    });
});

// Stats only
app.get('/api/stats', (req, res) => {
    const data = loadData();
    res.json(data.stats);
});

// Tables list
app.get('/api/tables', (req, res) => {
    const data = loadData();
    res.json(data.tables || []);
});

// Single table data (for voice queries)
app.get('/api/tables/:name', (req, res) => {
    const data = loadData();
    const table = data.tables.find(t => t.name.toLowerCase() === req.params.name.toLowerCase());
    if (!table) return res.status(404).json({ error: 'Table not found' });
    
    // Generate sample data based on table name
    const sampleData = generateSampleData(table.name, 10);
    res.json({ ...table, data: sampleData });
});

// Query tables (voice-enabled)
app.post('/api/query', (req, res) => {
    const { query } = req.body;
    const data = loadData();
    
    // Parse simple queries
    const q = query.toLowerCase();
    let result = { type: 'info', message: 'Query processed', data: null };
    
    if (q.includes('select') && q.includes('from')) {
        const tableMatch = q.match(/from\s+(\w+)/);
        if (tableMatch) {
            const tableName = tableMatch[1];
            const table = data.tables.find(t => t.name.toLowerCase() === tableName);
            if (table) {
                result = { type: 'table', table: table.name, data: generateSampleData(tableName, 5) };
            }
        }
    } else if (q.includes('show tables') || q.includes('list tables')) {
        result = { type: 'tables', data: data.tables.map(t => t.name) };
    } else if (q.includes('count')) {
        const tableMatch = q.match(/(?:from|in)\s+(\w+)/);
        if (tableMatch) {
            const table = data.tables.find(t => t.name.toLowerCase() === tableMatch[1]);
            if (table) result = { type: 'count', table: table.name, count: table.rows };
        }
    }
    
    // Log the query
    data.stats.total_interactions++;
    data.learning_log = data.learning_log || [];
    data.learning_log.push({ type: 'query', query, timestamp: new Date().toISOString() });
    saveData(data);
    
    res.json(result);
});

// Crawled sites
app.get('/api/crawled-sites', (req, res) => {
    const data = loadData();
    res.json(data.crawled_sites || []);
});

// Memories
app.get('/api/memories', (req, res) => {
    const data = loadData();
    res.json(data.memories || []);
});

// Learning log
app.get('/api/learning-log', (req, res) => {
    const data = loadData();
    res.json(data.learning_log || []);
});

// Voice command processing
app.post('/api/voice/command', (req, res) => {
    const { command_text } = req.body;
    const cmd = (command_text || '').toLowerCase();
    const data = loadData();
    
    console.log('[Voice Command]', cmd);
    
    let response = { success: true, response: '', action: null, data: null };
    
    // Table queries
    if (cmd.includes('show') && cmd.includes('table')) {
        const tables = data.tables.map(t => t.name).join(', ');
        response.response = `You have ${data.tables.length} tables: ${tables}`;
        response.action = 'show_tables';
        response.data = data.tables;
    }
    else if (cmd.includes('open') && cmd.includes('table')) {
        const tableMatch = cmd.match(/open\s+(?:table\s+)?(\w+)/);
        if (tableMatch) {
            const table = data.tables.find(t => t.name.toLowerCase().includes(tableMatch[1]));
            if (table) {
                response.response = `Opening ${table.name} table with ${table.rows} rows`;
                response.action = 'open_table';
                response.data = { table: table.name, rows: generateSampleData(table.name, 10) };
            }
        }
    }
    else if (cmd.includes('select') || cmd.includes('query')) {
        response.response = 'Running your query...';
        response.action = 'query';
    }
    else if (cmd.includes('stats') || cmd.includes('status') || cmd.includes('dashboard')) {
        response.response = `AI has processed ${data.stats.total_interactions} interactions, learned ${data.stats.learned_patterns} patterns, and crawled ${data.stats.web_crawls} websites. Accuracy is ${data.stats.accuracy_score}%.`;
        response.action = 'show_stats';
        response.data = data.stats;
    }
    else if (cmd.includes('crawl') || cmd.includes('website')) {
        const sites = data.crawled_sites.map(s => s.url.replace('https://', '')).join(', ');
        response.response = `Currently crawling: ${sites}`;
        response.action = 'show_crawls';
        response.data = data.crawled_sites;
    }
    else {
        response.response = `I heard: "${command_text}". Try: "show tables", "open table products", "show stats"`;
    }
    
    // Update stats
    data.stats.total_interactions++;
    saveData(data);
    
    res.json(response);
});

// Log endpoint
app.post('/api/log', (req, res) => {
    const data = loadData();
    data.stats.total_interactions++;
    saveData(data);
    res.json({ success: true });
});

// Simulate learning (for demo)
app.post('/api/learn', (req, res) => {
    const { source, content } = req.body;
    const data = loadData();
    
    data.stats.total_interactions++;
    data.stats.learned_patterns += Math.floor(Math.random() * 3) + 1;
    
    data.memories = data.memories || [];
    data.memories.push({
        id: Date.now(),
        source: source || 'manual',
        content: content || 'New learning entry',
        timestamp: new Date().toISOString()
    });
    
    saveData(data);
    res.json({ success: true, stats: data.stats });
});

// Helper function to generate sample data
function generateSampleData(tableName, count) {
    const samples = {
        products: () => ({ id: Math.floor(Math.random() * 10000), name: `Product ${Math.random().toString(36).substr(2, 5)}`, price: (Math.random() * 1000).toFixed(2), category: ['Tiles', 'Fixtures', 'Appliances'][Math.floor(Math.random() * 3)] }),
        vendors: () => ({ id: Math.floor(Math.random() * 1000), company: `Vendor ${Math.random().toString(36).substr(2, 5)}`, contact: `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`, status: 'active' }),
        properties: () => ({ id: Math.floor(Math.random() * 10000), address: `${Math.floor(Math.random() * 9999)} Main St`, price: Math.floor(Math.random() * 900000 + 100000), beds: Math.floor(Math.random() * 5 + 1) }),
        users: () => ({ id: Math.floor(Math.random() * 10000), email: `user${Math.floor(Math.random() * 1000)}@example.com`, role: ['customer', 'vendor', 'agent'][Math.floor(Math.random() * 3)], joined: '2026-01-01' }),
        transactions: () => ({ id: Math.floor(Math.random() * 10000), amount: (Math.random() * 10000).toFixed(2), type: ['sale', 'refund', 'fee'][Math.floor(Math.random() * 3)], date: '2026-01-03' }),
        reviews: () => ({ id: Math.floor(Math.random() * 10000), rating: Math.floor(Math.random() * 5 + 1), comment: 'Great product!', product_id: Math.floor(Math.random() * 1000) })
    };
    
    const generator = samples[tableName] || samples.products;
    return Array(count).fill(null).map(generator);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVE DASHBOARD HTML
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// ═══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  VISTAVIEW AI BACKEND v6.0');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(`  🚀 Server: http://localhost:${PORT}`);
    console.log(`  📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`  🔌 API: http://localhost:${PORT}/api/`);
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  Endpoints:');
    console.log('    GET  /api/health          - Health check');
    console.log('    GET  /api/dashboard       - Full dashboard data');
    console.log('    GET  /api/ai/training/stats - AI stats for widget');
    console.log('    GET  /api/tables          - List all tables');
    console.log('    GET  /api/tables/:name    - Get table data');
    console.log('    POST /api/query           - Run SQL-like query');
    console.log('    POST /api/voice/command   - Voice command processing');
    console.log('    GET  /api/crawled-sites   - Crawled websites');
    console.log('    GET  /api/learning-log    - Learning history');
    console.log('═══════════════════════════════════════════════════════════════════════');
});
