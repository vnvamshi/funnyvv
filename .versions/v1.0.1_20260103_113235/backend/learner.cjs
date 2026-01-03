const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'ai-data.json');

const SOURCES = [
  { name: 'zillow', category: 'real_estate', url: 'https://www.zillow.com' },
  { name: 'redfin', category: 'real_estate', url: 'https://www.redfin.com' },
  { name: 'ikea', category: 'furniture', url: 'https://www.ikea.com' },
  { name: 'wayfair', category: 'home_goods', url: 'https://www.wayfair.com' },
  { name: 'homedepot', category: 'building_materials', url: 'https://www.homedepot.com' },
  { name: 'lowes', category: 'building_materials', url: 'https://www.lowes.com' }
];

const loadData = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { stats: {}, memories: [] };
  }
};

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const learn = () => {
  const data = loadData();
  const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
  
  // Simulate learning
  const newMemory = {
    id: `mem_${Date.now()}`,
    memory_type: 'market_pattern',
    context: `Price data from ${source.name}`,
    learned_data: {
      source: source.name,
      category: source.category,
      prices_analyzed: Math.floor(Math.random() * 50) + 30,
      avg_price: (Math.random() * 500 + 100).toFixed(2),
      trend: ['stable', 'increasing', 'decreasing'][Math.floor(Math.random() * 3)],
      timestamp: new Date().toISOString()
    },
    confidence_score: Math.random() * 0.2 + 0.75,
    accessed_count: 0,
    created_at: new Date().toISOString()
  };
  
  data.memories = data.memories || [];
  data.memories.push(newMemory);
  
  // Update stats
  data.stats = data.stats || {};
  data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
  data.stats.market_prices_learned = (data.stats.market_prices_learned || 0) + newMemory.learned_data.prices_analyzed;
  data.stats.learned_patterns = (data.stats.learned_patterns || 0) + 1;
  
  saveData(data);
  console.log(`🧠 Learned from ${source.name}: ${newMemory.learned_data.prices_analyzed} prices, trend: ${newMemory.learned_data.trend}`);
};

console.log('🚀 Learning engine started');
console.log('📊 Learning every 30 seconds...');

// Learn immediately
learn();

// Then every 30 seconds
setInterval(learn, 30000);
