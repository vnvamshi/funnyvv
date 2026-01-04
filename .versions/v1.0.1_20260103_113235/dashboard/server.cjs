const express = require('express');
const app = express();

const TEAL = '#004236';
const GOLD = '#B8860B';

app.get('/dashboard', async (req, res) => {
  let stats = { total_interactions: 0, learned_patterns: 0, market_prices_learned: 0 };
  let sources = [];
  let memories = [];
  let tables = [];
  
  try {
    const response = await fetch('http://localhost:1117/api/dashboard');
    const data = await response.json();
    stats = data.stats || stats;
    sources = data.sources || [];
    memories = data.recent_memories || [];
    tables = data.tables || [];
  } catch (e) {
    console.log('Backend not available:', e.message);
  }
  
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>VistaView AI Dashboard</title>
  <meta http-equiv="refresh" content="30">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, sans-serif; 
      background: linear-gradient(135deg, ${TEAL}, #007E67);
      min-height: 100vh;
      color: white;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${GOLD};
    }
    .header h1 { font-size: 28px; }
    .status {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(0,0,0,0.2);
      padding: 10px 20px;
      border-radius: 20px;
    }
    .status-dot {
      width: 12px;
      height: 12px;
      background: #4CAF50;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      border: 1px solid rgba(184,134,11,0.3);
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: ${GOLD};
    }
    .stat-label { font-size: 14px; opacity: 0.8; margin-top: 5px; }
    .section {
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .section h2 {
      color: ${GOLD};
      margin-bottom: 15px;
      font-size: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    th { color: ${GOLD}; font-weight: 600; }
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: rgba(184,134,11,0.3);
    }
    .tables-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
    }
    .table-chip {
      background: rgba(255,255,255,0.1);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 VistaView AI Dashboard</h1>
    <div class="status">
      <div class="status-dot"></div>
      <span>gpt-oss:20b Active</span>
    </div>
  </div>
  
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${stats.total_interactions?.toLocaleString() || 0}</div>
      <div class="stat-label">Total Interactions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.learned_patterns || 0}</div>
      <div class="stat-label">Patterns Learned</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.market_prices_learned?.toLocaleString() || 0}</div>
      <div class="stat-label">Market Prices</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${((stats.accuracy_score || 0) / 3).toFixed(1)}%</div>
      <div class="stat-label">Confidence</div>
    </div>
  </div>
  
  <div class="section">
    <h2>📊 Learning Sources</h2>
    <table>
      <tr>
        <th>Source</th>
        <th>Category</th>
        <th>Memories</th>
      </tr>
      ${sources.map(s => `
        <tr>
          <td>${s.name}</td>
          <td><span class="badge">${s.category}</span></td>
          <td>${s.count}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  
  <div class="section">
    <h2>🗄️ Database Tables (${tables.length})</h2>
    <div class="tables-grid">
      ${tables.map(t => `<div class="table-chip">${t}</div>`).join('')}
    </div>
  </div>
  
  <div class="section">
    <h2>🧠 Recent Memories</h2>
    <table>
      <tr>
        <th>Type</th>
        <th>Context</th>
        <th>Confidence</th>
        <th>Time</th>
      </tr>
      ${memories.slice(0, 5).map(m => `
        <tr>
          <td><span class="badge">${m.memory_type}</span></td>
          <td>${m.context}</td>
          <td>${((m.confidence_score || 0) * 100).toFixed(1)}%</td>
          <td>${new Date(m.created_at).toLocaleTimeString()}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  
  <p style="text-align: center; opacity: 0.6; margin-top: 20px;">
    Auto-refreshes every 30 seconds | Model: gpt-oss:20b | Ollama: localhost:11434
  </p>
</body>
</html>`);
});

app.get('/', (req, res) => res.redirect('/dashboard'));

const PORT = 3006;
app.listen(PORT, () => {
  console.log(`✅ Dashboard running on http://localhost:${PORT}/dashboard`);
});
