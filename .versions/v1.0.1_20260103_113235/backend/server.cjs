const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '..', 'data');
const AI_DATA_FILE = path.join(DATA_DIR, 'ai-data.json');

// Load data
const loadData = () => {
  try {
    return JSON.parse(fs.readFileSync(AI_DATA_FILE, 'utf8'));
  } catch (e) {
    return { stats: { total_interactions: 0, learned_patterns: 0 }, memories: [], tables: [] };
  }
};

const saveData = (data) => {
  fs.writeFileSync(AI_DATA_FILE, JSON.stringify(data, null, 2));
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', model: 'gpt-oss:20b', timestamp: new Date().toISOString() });
});

// Get stats
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

// Get memories/patterns
app.get('/api/memories', (req, res) => {
  const data = loadData();
  res.json(data.memories || []);
});

// Get tables
app.get('/api/tables', (req, res) => {
  const data = loadData();
  res.json(data.tables || []);
});

// Get team
app.get('/api/team', (req, res) => {
  try {
    const team = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'team-members.json'), 'utf8'));
    res.json(team);
  } catch (e) {
    res.json({ company: 'VistaView', team: [] });
  }
});

// Get roles
app.get('/api/roles', (req, res) => {
  try {
    const roles = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'user-roles.json'), 'utf8'));
    res.json(roles);
  } catch (e) {
    res.json({ roles: [] });
  }
});

// Process voice command
app.post('/api/voice/process', (req, res) => {
  const { command } = req.body;
  const data = loadData();
  
  // Increment interactions
  data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
  saveData(data);
  
  const cmd = (command || '').toLowerCase();
  
  let response = { action: 'unknown', message: "I didn't understand that." };
  
  if (cmd.includes('about') || cmd.includes('team')) {
    response = { action: 'modal', modal: 'about', message: 'Opening About Us...' };
  } else if (cmd.includes('how') && cmd.includes('work')) {
    response = { action: 'modal', modal: 'howItWorks', message: 'Let me show you how VistaView works!' };
  } else if (cmd.includes('sign') || cmd.includes('login')) {
    response = { action: 'modal', modal: 'signIn', message: 'Choose your role to get started!' };
  } else if (cmd.match(/hey|wait|stop|pause/)) {
    response = { action: 'pause', message: "I'm here when you're ready. Say continue!" };
  } else if (cmd.match(/continue|go on|okay/)) {
    response = { action: 'resume', message: 'Alright! How can I help you?' };
  } else if (cmd.match(/close|exit|back/)) {
    response = { action: 'close', message: 'Going back. What else can I help with?' };
  } else if (cmd.includes('real estate') || cmd.includes('properties')) {
    response = { action: 'navigate', page: 'realestate', message: 'Opening Real Estate!' };
  } else if (cmd.includes('catalog') || cmd.includes('product')) {
    response = { action: 'navigate', page: 'catalog', message: 'Opening Product Catalog!' };
  }
  
  res.json(response);
});

// Query AI (connects to Ollama)
app.post('/api/query', async (req, res) => {
  const { question } = req.body;
  const data = loadData();
  
  // Increment interactions
  data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
  saveData(data);
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-oss:20b',
        prompt: question,
        stream: false
      })
    });
    const result = await response.json();
    res.json({ answer: result.response, model: 'gpt-oss:20b' });
  } catch (e) {
    res.json({ answer: "I'm having trouble connecting to my AI brain. Please try again.", error: e.message });
  }
});

// Dashboard data endpoint
app.get('/api/dashboard', (req, res) => {
  const data = loadData();
  
  // Group memories by source
  const sources = {};
  (data.memories || []).forEach(m => {
    const src = m.learned_data?.source || m.data?.source || 'unknown';
    if (!sources[src]) {
      sources[src] = { count: 0, patterns: 0, category: m.learned_data?.category || 'general' };
    }
    sources[src].count++;
    if (m.memory_type === 'pattern') sources[src].patterns++;
  });
  
  res.json({
    stats: data.stats,
    tables: data.tables,
    sources: Object.entries(sources).map(([name, info]) => ({
      name,
      ...info
    })),
    recent_memories: (data.memories || []).slice(-10).reverse(),
    model: 'gpt-oss:20b'
  });
});

const PORT = 1117;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
});
