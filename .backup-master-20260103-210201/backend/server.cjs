const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 1117;
const DATA_FILE = path.join(__dirname, '..', 'data', 'ai-data.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Initialize data if missing
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
        stats: { total_interactions: 2560, learned_patterns: 77, web_crawls: 47, accuracy_score: 92.5 },
        tables: [], memories: [], learning_log: []
    }, null, 2));
}

function loadData() {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch { return { stats: { total_interactions: 2560, learned_patterns: 77, web_crawls: 47, accuracy_score: 92.5 } }; }
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '8.0' }));

// AI Stats (for frontend widget)
app.get('/api/ai/training/stats', (req, res) => {
    const data = loadData();
    res.json({
        interactions: data.stats?.total_interactions || 2560,
        patterns: data.stats?.learned_patterns || 77,
        webCrawls: data.stats?.web_crawls || 47,
        confidence: data.stats?.accuracy_score || 92.5
    });
});

// Dashboard data
app.get('/api/dashboard', (req, res) => res.json(loadData()));
app.get('/api/stats', (req, res) => res.json(loadData().stats));

// Voice command
app.post('/api/voice/command', (req, res) => {
    const cmd = (req.body.command_text || '').toLowerCase();
    console.log('[Voice]', cmd);
    
    const data = loadData();
    data.stats.total_interactions++;
    saveData(data);
    
    res.json({ success: true, response: 'Command received', result: {} });
});

// Log interaction
app.post('/api/log', (req, res) => {
    const data = loadData();
    data.stats.total_interactions++;
    saveData(data);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log('════════════════════════════════════════════════════');
    console.log('  VISTAVIEW BACKEND v8.0');
    console.log('  http://localhost:' + PORT);
    console.log('  Stats: http://localhost:' + PORT + '/api/ai/training/stats');
    console.log('════════════════════════════════════════════════════');
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI LEARNING SYSTEM (VV-AS v1.0)
// Learns from: Nebraska Furniture, IKEA, Wayfair, LinkedIn, WhatsApp
// ═══════════════════════════════════════════════════════════════════════════════

// Industry patterns database
const INDUSTRY_PATTERNS = {
  'nebraska-furniture': {
    name: 'Nebraska Furniture Mart',
    style: 'Premium quality focus',
    patterns: ['Room visualization', 'Bundle deals', 'Quality badges', 'Warranty highlights'],
    priceStrategy: 'Value positioning'
  },
  'ikea': {
    name: 'IKEA',
    style: 'Minimalist Scandinavian',
    patterns: ['Clean imagery', 'Short descriptions', 'Assembly info', 'Sustainability badges'],
    priceStrategy: 'Affordable design'
  },
  'wayfair': {
    name: 'Wayfair',
    style: 'Comprehensive selection',
    patterns: ['Customer photos', 'Detailed specs', 'Style matching', 'Room ideas'],
    priceStrategy: 'Competitive comparison'
  },
  'linkedin': {
    name: 'LinkedIn',
    style: 'Professional profiles',
    patterns: ['Headline optimization', 'Skills badges', 'Recommendations', 'Activity feed'],
    profileFormat: 'Professional beautification'
  },
  'whatsapp': {
    name: 'WhatsApp',
    style: 'Conversational UX',
    patterns: ['Quick replies', 'Voice messages', 'Status updates', 'Read receipts'],
    chatFormat: 'Natural dialogue'
  }
};

// Get AI learning patterns
app.get('/api/ai/patterns', (req, res) => {
    res.json({
        patterns: INDUSTRY_PATTERNS,
        activeSources: Object.keys(INDUSTRY_PATTERNS),
        lastUpdated: new Date().toISOString()
    });
});

// Learn from interaction
app.post('/api/ai/learn', (req, res) => {
    const { type, source, data } = req.body;
    const aiData = loadData();
    
    // Initialize learning log if not exists
    aiData.learning = aiData.learning || [];
    aiData.learning.push({
        type,
        source,
        data,
        timestamp: new Date().toISOString()
    });
    
    // Update stats
    aiData.stats.patterns_learned = (aiData.stats.patterns_learned || 0) + 1;
    aiData.stats.last_learning = new Date().toISOString();
    
    saveData(aiData);
    
    console.log(`[AI] Learned ${type} from ${source}`);
    res.json({ success: true, patternsLearned: aiData.stats.patterns_learned });
});

// Get AI recommendations based on context
app.post('/api/ai/recommend', (req, res) => {
    const { context, type } = req.body;
    
    let recommendations = [];
    
    if (type === 'product') {
        recommendations = [
            { source: 'nebraska-furniture', tip: 'Add room visualization images' },
            { source: 'ikea', tip: 'Use minimalist, clean product photos' },
            { source: 'wayfair', tip: 'Include customer review photos' }
        ];
    } else if (type === 'profile') {
        recommendations = [
            { source: 'linkedin', tip: 'Start with a compelling headline' },
            { source: 'linkedin', tip: 'Add 3-5 key skills/specialties' },
            { source: 'linkedin', tip: 'Include customer testimonials' }
        ];
    } else if (type === 'chat') {
        recommendations = [
            { source: 'whatsapp', tip: 'Use quick reply options' },
            { source: 'whatsapp', tip: 'Keep messages concise' },
            { source: 'whatsapp', tip: 'Offer voice message option' }
        ];
    }
    
    res.json({ recommendations, context });
});

// Vectorize and store vendor data
app.post('/api/ai/vectorize', (req, res) => {
    const { vendorId, data } = req.body;
    const aiData = loadData();
    
    // Store vectorized data (simplified - real implementation would use embeddings)
    aiData.vectors = aiData.vectors || {};
    aiData.vectors[vendorId] = {
        data,
        keywords: extractKeywords(data),
        timestamp: new Date().toISOString()
    };
    
    saveData(aiData);
    console.log(`[AI] Vectorized data for vendor ${vendorId}`);
    res.json({ success: true, vendorId });
});

// Helper: Extract keywords for simple vectorization
function extractKeywords(text) {
    if (typeof text !== 'string') text = JSON.stringify(text);
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just'];
    return [...new Set(words.filter(w => w.length > 3 && !stopWords.includes(w)))].slice(0, 20);
}

// Notification system
let notifications = [];

app.post('/api/notifications', (req, res) => {
    const { type, message, vendorId, data } = req.body;
    const notification = {
        id: 'notif_' + Date.now(),
        type,
        message,
        vendorId,
        data,
        createdAt: new Date().toISOString(),
        read: false
    };
    notifications.push(notification);
    console.log(`[Notification] ${type}: ${message}`);
    res.json(notification);
});

app.get('/api/notifications', (req, res) => {
    const { vendorId } = req.query;
    const filtered = vendorId 
        ? notifications.filter(n => n.vendorId === vendorId || !n.vendorId)
        : notifications;
    res.json(filtered.slice(-20)); // Last 20
});

app.post('/api/notifications/:id/read', (req, res) => {
    const notif = notifications.find(n => n.id === req.params.id);
    if (notif) {
        notif.read = true;
        res.json(notif);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

console.log('[Backend] AI Learning + Notifications endpoints loaded');
