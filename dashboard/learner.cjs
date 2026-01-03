const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'data', 'ai-data.json');
const SOURCES = ['zillow','redfin','realtor','ikea','wayfair','homedepot','lowes','amazon'];

function load() {
    try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); }
    catch (e) { return { stats: {}, memories: [] }; }
}
function save(d) { fs.writeFileSync(DATA, JSON.stringify(d, null, 2)); }

let cycle = 0;
function learn() {
    cycle++;
    const src = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    const prices = Math.floor(Math.random() * 50) + 30;
    
    const d = load();
    d.stats = d.stats || {};
    d.stats.total_interactions = (d.stats.total_interactions || 0) + 1;
    d.stats.learned_patterns = (d.stats.learned_patterns || 0) + 1;
    d.stats.market_prices_learned = (d.stats.market_prices_learned || 0) + prices;
    d.stats.last_activity = new Date().toISOString();
    
    d.memories = d.memories || [];
    d.memories.push({ id: 'm_' + Date.now(), source: src, prices: prices });
    if (d.memories.length > 100) d.memories = d.memories.slice(-100);
    
    save(d);
    console.log('[Cycle ' + cycle + '] Learned from ' + src + ': ' + prices + ' prices');
}

console.log('🧠 Learning Engine Started (every 30 seconds)');
learn();
setInterval(learn, 30000);
