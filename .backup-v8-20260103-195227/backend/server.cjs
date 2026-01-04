// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW BACKEND v7.0 - Complete API with Dashboard
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

// Initialize data
function initData() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    if (!fs.existsSync(DATA_FILE)) {
        const data = {
            stats: {
                total_interactions: 2560,
                learned_patterns: 77,
                web_crawls: 47,
                accuracy_score: 92.5,
                last_updated: new Date().toISOString()
            },
            tables: [
                { id: 1, name: 'products', rows: 1250, source: 'catalog', lastSync: '2026-01-03' },
                { id: 2, name: 'vendors', rows: 89, source: 'registration', lastSync: '2026-01-03' },
                { id: 3, name: 'properties', rows: 456, source: 'mls_feed', lastSync: '2026-01-03' },
                { id: 4, name: 'users', rows: 2341, source: 'auth', lastSync: '2026-01-03' }
            ],
            crawled_sites: [
                { url: 'https://zillow.com', pages: 150, status: 'active' },
                { url: 'https://realtor.com', pages: 120, status: 'active' },
                { url: 'https://homedepot.com', pages: 89, status: 'active' }
            ],
            memories: [],
            learning_log: []
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', version: '7.0', port: PORT });
});

// AI Training Stats (for widget on localhost:5180)
app.get('/api/ai/training/stats', (req, res) => {
    const data = loadData();
    res.json({
        interactions: data.stats.total_interactions,
        patterns: data.stats.learned_patterns,
        webCrawls: data.stats.web_crawls,
        confidence: data.stats.accuracy_score
    });
});

app.get('/api/stats', (req, res) => res.json(loadData().stats));
app.get('/api/dashboard', (req, res) => res.json(loadData()));
app.get('/api/tables', (req, res) => res.json(loadData().tables || []));
app.get('/api/crawled-sites', (req, res) => res.json(loadData().crawled_sites || []));
app.get('/api/memories', (req, res) => res.json(loadData().memories || []));
app.get('/api/learning-log', (req, res) => res.json(loadData().learning_log || []));

// Voice command
app.post('/api/voice/command', (req, res) => {
    const { command_text } = req.body;
    const cmd = (command_text || '').toLowerCase();
    const data = loadData();
    
    console.log('[Voice]', cmd);
    
    let response = { success: true, response: '', action: null, data: null };
    
    if (cmd.includes('show') && cmd.includes('table')) {
        response.response = `You have ${data.tables.length} tables: ${data.tables.map(t => t.name).join(', ')}`;
        response.action = 'show_tables';
    } else if (cmd.includes('stats') || cmd.includes('status')) {
        response.response = `AI has ${data.stats.total_interactions} interactions, ${data.stats.learned_patterns} patterns, ${data.stats.web_crawls} crawls. ${data.stats.accuracy_score}% accuracy.`;
        response.action = 'show_stats';
    } else {
        response.response = `I heard: "${command_text}". Try: show tables, show stats`;
    }
    
    data.stats.total_interactions++;
    saveData(data);
    
    res.json(response);
});

app.post('/api/log', (req, res) => {
    const data = loadData();
    data.stats.total_interactions++;
    saveData(data);
    res.json({ success: true });
});

// Serve dashboard
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/', (req, res) => res.redirect('/dashboard'));

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  VISTAVIEW AI BACKEND v7.0');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  Server: http://localhost:' + PORT);
    console.log('  Dashboard: http://localhost:' + PORT + '/dashboard');
    console.log('  Stats API: http://localhost:' + PORT + '/api/ai/training/stats');
    console.log('═══════════════════════════════════════════════════════════════════════');
});
