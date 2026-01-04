const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 1117;
const DATA_FILE = path.join(__dirname, '..', 'data', 'ai-data.json');

function loadData() {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch (e) { return { stats: { total_interactions: 2560, learned_patterns: 77, accuracy_score: 92.5 }, memories: [], tables: [] }; }
}

function saveData(data) {
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); } catch (e) {}
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '5.0' }));

app.get('/api/ai/training/stats', (req, res) => {
    const data = loadData();
    res.json({
        interactions: data.stats?.total_interactions || 2560,
        patterns: data.stats?.learned_patterns || 77,
        webCrawls: 47,
        confidence: data.stats?.accuracy_score || 92.5
    });
});

app.get('/api/stats', (req, res) => res.json(loadData().stats));
app.get('/api/dashboard', (req, res) => res.json(loadData()));
app.get('/api/memories', (req, res) => res.json(loadData().memories || []));
app.get('/api/tables', (req, res) => res.json(loadData().tables || []));

app.post('/api/voice/command', (req, res) => {
    const cmd = (req.body.command_text || '').toLowerCase();
    console.log('[Voice]', cmd);
    let response = '', navigate = null;
    if (cmd.includes('about')) { response = 'Opening About Us.'; navigate = '/about'; }
    else if (cmd.includes('sign in')) { response = 'Opening sign in.'; navigate = '/signin'; }
    else if (cmd.includes('vendor')) { response = 'Opening vendor setup.'; navigate = '/vendor'; }
    else if (cmd.includes('hey') || cmd.includes('hello')) { response = 'Hello! I am Mr. V.'; }
    else { response = 'I heard: ' + cmd; }
    res.json({ success: true, response, result: { navigate } });
});

app.post('/api/voice/process', (req, res) => res.json({ action: 'listen' }));
app.post('/api/log', (req, res) => res.json({ success: true }));

app.listen(PORT, () => console.log('Backend v5.0 running on http://localhost:' + PORT));
