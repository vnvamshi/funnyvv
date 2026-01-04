const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 1117;
const DATA_FILE = path.join(__dirname, '..', 'data', 'ai-data.json');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function loadData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        return { stats: { total_interactions: 0 }, memories: [], tables: [] };
    }
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', version: '2.1', timestamp: new Date().toISOString() });
});

// Stats
app.get('/api/stats', (req, res) => {
    const data = loadData();
    res.json({
        total_interactions: data.stats?.total_interactions || 0,
        learned_patterns: data.stats?.learned_patterns || 0,
        market_prices_learned: data.stats?.market_prices_learned || 0,
        accuracy_score: data.stats?.accuracy_score || 0,
        tables_count: data.tables?.length || 0,
        memories_count: data.memories?.length || 0,
        model: 'gpt-oss:20b',
        status: 'active'
    });
});

// Dashboard data
app.get('/api/dashboard', (req, res) => {
    const data = loadData();
    const sources = {};
    (data.memories || []).forEach(m => {
        const src = m.learned_data?.source || 'unknown';
        sources[src] = (sources[src] || 0) + 1;
    });
    
    res.json({
        stats: data.stats,
        tables: data.tables,
        memories: data.memories?.slice(-20) || [],
        sources: Object.entries(sources).map(([name, count]) => ({ name, count })),
        model: 'gpt-oss:20b'
    });
});

// Memories
app.get('/api/memories', (req, res) => {
    const data = loadData();
    res.json(data.memories || []);
});

// Tables
app.get('/api/tables', (req, res) => {
    const data = loadData();
    res.json(data.tables || []);
});

// Voice
app.post('/api/voice/process', (req, res) => {
    const { command } = req.body;
    const cmd = (command || '').toLowerCase();
    
    let response = { action: 'unknown', message: "I'm listening..." };
    
    if (cmd.includes('about')) {
        response = { action: 'navigate', route: '/about', message: 'Opening About Us' };
    } else if (cmd.includes('catalog') || cmd.includes('products')) {
        response = { action: 'navigate', route: '/catalog', message: 'Opening Catalog' };
    } else if (cmd.includes('home')) {
        response = { action: 'navigate', route: '/', message: 'Going home' };
    }
    
    const data = loadData();
    data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
    saveData(data);
    
    res.json(response);
});

// Log
app.post('/api/log', (req, res) => {
    const data = loadData();
    data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
    saveData(data);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  VISTAVIEW BACKEND v2.1 (FIXED)');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(`✅ Running on http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════════════════════════════════════');
});
