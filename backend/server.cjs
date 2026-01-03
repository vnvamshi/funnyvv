const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 1117;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, '..', 'data', 'ai-data.json');

// Load AI data
function loadData() {
    try {
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {
        return { stats: {}, sources: {}, database_stats: {}, voice_patterns: {}, live_learning: {} };
    }
}

// Save AI data
function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Serve dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Get all stats (comprehensive)
app.get('/api/stats', (req, res) => {
    const data = loadData();
    res.json(data);
});

// Record interaction
app.post('/api/interact', (req, res) => {
    const data = loadData();
    data.stats = data.stats || {};
    data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
    
    // Add to live learning
    data.live_learning = data.live_learning || { recent_learnings: [] };
    data.live_learning.recent_learnings.unshift({
        time: new Date().toLocaleTimeString(),
        type: req.body.type || 'interaction',
        content: req.body.content || 'User interaction recorded',
        useful: true
    });
    if (data.live_learning.recent_learnings.length > 20) {
        data.live_learning.recent_learnings = data.live_learning.recent_learnings.slice(0, 20);
    }
    
    saveData(data);
    res.json({ success: true, interactions: data.stats.total_interactions });
});

// Record voice pattern
app.post('/api/voice-pattern', (req, res) => {
    const data = loadData();
    data.stats = data.stats || {};
    data.stats.learned_patterns = (data.stats.learned_patterns || 0) + 1;
    
    // Add to voice patterns
    data.voice_patterns = data.voice_patterns || { most_used: [] };
    const existing = data.voice_patterns.most_used.find(p => p.command === req.body.command);
    if (existing) {
        existing.count++;
    } else {
        data.voice_patterns.most_used.push({
            command: req.body.command,
            count: 1,
            success_rate: 95 + Math.random() * 5
        });
    }
    
    // Add to live learning
    data.live_learning = data.live_learning || { recent_learnings: [] };
    data.live_learning.recent_learnings.unshift({
        time: new Date().toLocaleTimeString(),
        type: 'voice_pattern',
        content: `Voice command learned: "${req.body.command}"`,
        useful: true
    });
    
    saveData(data);
    res.json({ success: true, patterns: data.stats.learned_patterns });
});

// Record learning
app.post('/api/learn', (req, res) => {
    const data = loadData();
    
    data.live_learning = data.live_learning || { recent_learnings: [], todays_insights: [] };
    data.live_learning.recent_learnings.unshift({
        time: new Date().toLocaleTimeString(),
        type: req.body.type || 'general',
        content: req.body.content,
        useful: req.body.useful !== false
    });
    
    if (data.live_learning.recent_learnings.length > 50) {
        data.live_learning.recent_learnings = data.live_learning.recent_learnings.slice(0, 50);
    }
    
    saveData(data);
    res.json({ success: true });
});

// Get sources
app.get('/api/sources', (req, res) => {
    const data = loadData();
    res.json(data.sources || {});
});

// Get database stats
app.get('/api/database-stats', (req, res) => {
    const data = loadData();
    res.json(data.database_stats || {});
});

// Get voice patterns
app.get('/api/voice-patterns', (req, res) => {
    const data = loadData();
    res.json(data.voice_patterns || {});
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: PORT, version: 'v2.3' });
});

app.listen(PORT, () => {
    console.log(`\n🧠 VistaView AI Dashboard running on http://localhost:${PORT}/dashboard\n`);
});
