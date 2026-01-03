const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 1117;
const DATA = path.join(__dirname, '..', 'data', 'ai-data.json');

function load() {
    try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); }
    catch (e) { return { stats: {}, memories: [] }; }
}

// Dashboard page
app.get('/dashboard', (req, res) => {
    const d = load();
    const s = d.stats || {};
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>VistaView AI Dashboard</title>
    <meta http-equiv="refresh" content="10">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #004236 0%, #001a15 100%);
            min-height: 100vh;
            color: white;
            padding: 30px;
        }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 2.8em; color: #B8860B; margin-bottom: 10px; }
        .header p { color: #888; }
        .status { 
            display: inline-block; 
            width: 12px; height: 12px; 
            border-radius: 50%; 
            background: #00ff00; 
            margin-right: 10px;
            animation: pulse 2s infinite;
            box-shadow: 0 0 10px #00ff00;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .card {
            background: rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(184,134,11,0.3);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(184,134,11,0.2);
        }
        .card h3 { 
            color: #B8860B; 
            margin-bottom: 15px; 
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .card .value { 
            font-size: 3em; 
            font-weight: bold;
            background: linear-gradient(135deg, #fff, #B8860B);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .card .sub { color: #666; margin-top: 8px; font-size: 0.9em; }
        .sources { margin-top: 40px; }
        .sources h3 { color: #B8860B; margin-bottom: 20px; text-align: center; }
        .source-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            max-width: 800px;
            margin: 0 auto;
        }
        .source {
            background: rgba(0,126,103,0.2);
            padding: 15px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(0,126,103,0.3);
        }
        .source .icon { font-size: 1.5em; margin-bottom: 5px; }
        .source .name { font-size: 0.85em; color: #aaa; }
        .source .stat { color: #00ff00; font-size: 0.75em; margin-top: 5px; }
        .footer { text-align: center; margin-top: 50px; color: #555; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 VistaView AI Dashboard</h1>
        <p><span class="status"></span>Live Learning • Auto-refreshes every 10 seconds</p>
    </div>
    
    <div class="grid">
        <div class="card">
            <h3>Total Interactions</h3>
            <div class="value">${(s.total_interactions || 0).toLocaleString()}</div>
            <div class="sub">Voice commands + queries</div>
        </div>
        <div class="card">
            <h3>Learned Patterns</h3>
            <div class="value">${s.learned_patterns || 0}</div>
            <div class="sub">From 8 learning sources</div>
        </div>
        <div class="card">
            <h3>Market Prices</h3>
            <div class="value">${(s.market_prices_learned || 0).toLocaleString()}</div>
            <div class="sub">Real-time pricing data</div>
        </div>
        <div class="card">
            <h3>AI Model</h3>
            <div class="value" style="font-size:1.8em">gpt-oss:20b</div>
            <div class="sub">Running on Ollama</div>
        </div>
    </div>
    
    <div class="sources">
        <h3>🔄 Active Learning Sources</h3>
        <div class="source-grid">
            <div class="source"><div class="icon">🏠</div><div class="name">Zillow</div><div class="stat">● Active</div></div>
            <div class="source"><div class="icon">🏡</div><div class="name">Redfin</div><div class="stat">● Active</div></div>
            <div class="source"><div class="icon">🏢</div><div class="name">Realtor</div><div class="stat">● Active</div></div>
            <div class="source"><div class="icon">🛋️</div><div class="name">IKEA</div><div class="stat">● Active</div></div>
            <div class="source"><div class="icon">🪑</div><div class="name">Wayfair</div><div class="stat">● Active</div></div>
            <div class="source"><div class="icon">🔧</div><div class="name">Home Depot</div><div class="stat">● Active</div></div>
            <div class="source"><div class="icon">🔨</div><div class="name">Lowe's</div><div class="stat">● Active</div></div>
            <div class="source"><div class="icon">📦</div><div class="name">Amazon</div><div class="stat">● Active</div></div>
        </div>
    </div>
    
    <div class="footer">
        <p>VistaView AI • Learning every 30 seconds • Last: ${s.last_activity ? new Date(s.last_activity).toLocaleTimeString() : 'Starting...'}</p>
    </div>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  📊 VISTAVIEW AI DASHBOARD');
    console.log('  http://localhost:' + PORT + '/dashboard');
    console.log('═══════════════════════════════════════════════════════════════');
});
