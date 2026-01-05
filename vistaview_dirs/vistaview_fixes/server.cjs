// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW BACKEND v4.0 - COMPLETE SERVER
// Port: 1117 (as configured)
// Features: AI Learning, Voice Processing, Vendor/Builder Onboarding, Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const PORT = 1117;  // FIXED: Must be 1117
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'ai-data.json');
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const USER_ROLES_FILE = path.join(DATA_DIR, 'user-roles.json');
const TEAM_FILE = path.join(DATA_DIR, 'team-members.json');
const VECTORS_FILE = path.join(DATA_DIR, 'landing-page-vectors.json');
const DASHBOARD_CONFIG_FILE = path.join(DATA_DIR, 'dashboard-config.json');

// Ensure directories exist
[LOGS_DIR, DATA_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATA MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

function loadJSON(filePath, defaultValue = {}) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error(`Error loading ${filePath}:`, e.message);
    }
    return defaultValue;
}

function saveJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error(`Error saving ${filePath}:`, e.message);
        return false;
    }
}

function loadData() {
    return loadJSON(DATA_FILE, {
        vendors: [],
        builders: [],
        products: [],
        memories: [],
        sessions: [],
        commands: [],
        pages: [],
        stats: {
            total_interactions: 0,
            learned_patterns: 0,
            accuracy_score: 92.5,
            voice_commands: 0,
            market_prices_learned: 0,
            vendors_onboarded: 0,
            builders_onboarded: 0,
            started_at: new Date().toISOString()
        },
        tables: [],
        team_knowledge: {},
        about_us_knowledge: {},
        how_it_works_knowledge: {}
    });
}

function saveData(data) {
    return saveJSON(DATA_FILE, data);
}

function logEvent(type, eventData) {
    const logFile = path.join(LOGS_DIR, `${new Date().toISOString().split('T')[0]}.log`);
    const entry = {
        timestamp: new Date().toISOString(),
        type,
        ...eventData
    };
    try {
        fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    } catch (e) {
        console.error('Log error:', e.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKET DATA SOURCES (for simulation)
// ═══════════════════════════════════════════════════════════════════════════════
const MARKET_SOURCES = [
    { name: 'zillow', category: 'real_estate', url: 'https://www.zillow.com' },
    { name: 'realtor', category: 'real_estate', url: 'https://www.realtor.com' },
    { name: 'redfin', category: 'real_estate', url: 'https://www.redfin.com' },
    { name: 'wayfair', category: 'home_goods', url: 'https://www.wayfair.com' },
    { name: 'ikea', category: 'furniture', url: 'https://www.ikea.com' },
    { name: 'homedepot', category: 'building_materials', url: 'https://www.homedepot.com' },
    { name: 'lowes', category: 'building_materials', url: 'https://www.lowes.com' },
    { name: 'amazon', category: 'general', url: 'https://www.amazon.com' }
];

const PATTERNS = [
    'user_preference', 'search_intent', 'price_sensitivity', 'location_preference',
    'property_type_affinity', 'budget_range', 'competitor_pricing', 'seasonal_demand',
    'market_trends', 'price_elasticity', 'inventory_correlation', 'demand_forecasting'
];

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH & STATUS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
    const data = loadData();
    res.json({
        status: 'healthy',
        version: 'v4.0',
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        features: [
            'AI Learning Engine',
            'Voice Command Processing',
            'Vendor Onboarding Pipeline',
            'Builder Onboarding Pipeline',
            'Market Data Crawling',
            'Pattern Recognition',
            'Teleprompter AI',
            'Dashboard Analytics'
        ],
        stats: {
            memories: data.memories?.length || 0,
            tables: data.tables?.length || 0,
            interactions: data.stats?.total_interactions || 0
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/stats', (req, res) => {
    const data = loadData();
    const stats = data.stats || {};
    
    // Calculate derived stats
    const memories = data.memories || [];
    const patterns = memories.filter(m => m.memory_type === 'pattern');
    const marketData = memories.filter(m => m.memory_type === 'market_pattern');
    
    // Calculate source distribution
    const sourceCount = {};
    marketData.forEach(m => {
        const src = m.learned_data?.source || 'unknown';
        sourceCount[src] = (sourceCount[src] || 0) + 1;
    });
    
    res.json({
        total_interactions: stats.total_interactions || 0,
        learned_patterns: patterns.length,
        market_prices_learned: stats.market_prices_learned || marketData.length * 50,
        accuracy_score: parseFloat(stats.accuracy_score) || 92.5,
        voice_commands: stats.voice_commands || 0,
        vendors_onboarded: stats.vendors_onboarded || 0,
        builders_onboarded: stats.builders_onboarded || 0,
        products_created: stats.products_created || 0,
        memories_count: memories.length,
        tables_count: data.tables?.length || 0,
        web_crawls: Object.values(sourceCount).reduce((a, b) => a + b, 0),
        sources: sourceCount,
        model: 'vistaview-ai:v4',
        status: 'active',
        started_at: stats.started_at,
        last_learning: stats.last_learning,
        version: 'v4.0'
    });
});

app.get('/api/ai/training/stats', (req, res) => {
    const data = loadData();
    const stats = data.stats || {};
    const memories = data.memories || [];
    
    res.json({
        totals: {
            total_interactions: stats.total_interactions || 0,
            learned_patterns: stats.learned_patterns || memories.filter(m => m.memory_type === 'pattern').length,
            accuracy_score: parseFloat(stats.accuracy_score) || 92.5,
            web_crawls: memories.filter(m => m.memory_type === 'market_pattern').length,
            voice_commands: stats.voice_commands || 0,
            memories_count: memories.length,
            market_prices_learned: stats.market_prices_learned || 0
        },
        patternsCount: memories.filter(m => m.memory_type === 'pattern').length,
        tablesCount: data.tables?.length || 0,
        features: stats.features || [],
        lastUpdated: stats.last_learning || new Date().toISOString()
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/dashboard', (req, res) => {
    const data = loadData();
    const memories = data.memories || [];
    const stats = data.stats || {};
    
    // Calculate source distribution
    const sources = {};
    memories.forEach(m => {
        if (m.learned_data?.source) {
            const src = m.learned_data.source;
            sources[src] = (sources[src] || 0) + 1;
        }
    });
    
    // Category distribution
    const categories = {};
    memories.forEach(m => {
        if (m.learned_data?.category) {
            const cat = m.learned_data.category;
            categories[cat] = (categories[cat] || 0) + 1;
        }
    });
    
    // Recent activity
    const recentMemories = memories
        .filter(m => m.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);
    
    res.json({
        stats: {
            ...stats,
            memories_count: memories.length,
            patterns_count: memories.filter(m => m.memory_type === 'pattern').length,
            market_data_count: memories.filter(m => m.memory_type === 'market_pattern').length
        },
        tables: data.tables || [],
        memories: recentMemories,
        sources: Object.entries(sources).map(([name, count]) => ({ name, count })),
        categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
        team: data.team_knowledge || {},
        about_us: data.about_us_knowledge || {},
        how_it_works: data.how_it_works_knowledge || {},
        model: 'vistaview-ai:v4',
        version: 'v4.0'
    });
});

app.get('/api/dashboard/full', (req, res) => {
    const data = loadData();
    const userRoles = loadJSON(USER_ROLES_FILE, { roles: [] });
    const team = loadJSON(TEAM_FILE, {});
    const vectors = loadJSON(VECTORS_FILE, {});
    const dashboardConfig = loadJSON(DASHBOARD_CONFIG_FILE, {});
    
    res.json({
        ai_data: data,
        user_roles: userRoles,
        team_members: team,
        landing_vectors: vectors,
        dashboard_config: dashboardConfig,
        server: {
            version: 'v4.0',
            port: PORT,
            uptime: process.uptime()
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORIES & LEARNING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/memories', (req, res) => {
    const data = loadData();
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;
    
    let memories = data.memories || [];
    
    if (type) {
        memories = memories.filter(m => m.memory_type === type);
    }
    
    memories = memories
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, limit);
    
    res.json(memories);
});

app.post('/api/memories', (req, res) => {
    const data = loadData();
    const memory = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...req.body,
        created_at: new Date().toISOString(),
        accessed_count: 0
    };
    
    data.memories = data.memories || [];
    data.memories.push(memory);
    data.stats.last_learning = new Date().toISOString();
    
    saveData(data);
    logEvent('MEMORY_CREATED', { id: memory.id, type: memory.memory_type });
    
    res.json({ success: true, memory });
});

app.get('/api/tables', (req, res) => {
    const data = loadData();
    res.json(data.tables || []);
});

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE COMMAND PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/voice/process', (req, res) => {
    const { command } = req.body;
    const cmd = (command || '').toLowerCase().trim();
    const data = loadData();
    const vectors = loadJSON(VECTORS_FILE, {});
    
    // Log the interaction
    data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
    data.stats.voice_commands = (data.stats.voice_commands || 0) + 1;
    data.stats.last_activity = new Date().toISOString();
    
    let response = {
        action: 'unknown',
        message: "I didn't quite catch that. Try saying 'About us', 'How it works', or 'Sign me up'.",
        confidence: 0.5
    };
    
    // Check navigation triggers from vectors
    const navigation = vectors.navigation || [];
    for (const nav of navigation) {
        if (nav.triggers?.some(t => cmd.includes(t))) {
            response = {
                action: 'navigate',
                target: nav.id,
                message: `Opening ${nav.text}...`,
                confidence: 0.95
            };
            break;
        }
    }
    
    // Check hero buttons
    const heroButtons = vectors.hero_buttons || [];
    for (const btn of heroButtons) {
        if (btn.triggers?.some(t => cmd.includes(t))) {
            response = {
                action: 'navigate',
                target: btn.id,
                route: `/${btn.id}`,
                message: `Let me show you ${btn.text}...`,
                confidence: 0.92
            };
            break;
        }
    }
    
    // Check voice commands
    const voiceCommands = vectors.voice_commands || {};
    if (voiceCommands.pause?.some(p => cmd.includes(p))) {
        response = {
            action: 'pause',
            message: vectors.mr_v_responses?.paused || "I'm paused. Say 'continue' when ready.",
            confidence: 1.0
        };
    } else if (voiceCommands.resume?.some(r => cmd.includes(r))) {
        response = {
            action: 'resume',
            message: vectors.mr_v_responses?.resume || "Alright, continuing!",
            confidence: 1.0
        };
    } else if (voiceCommands.close?.some(c => cmd.includes(c))) {
        response = {
            action: 'close',
            message: vectors.mr_v_responses?.close || "Closing. What else can I help with?",
            confidence: 1.0
        };
    } else if (voiceCommands.home?.some(h => cmd.includes(h))) {
        response = {
            action: 'navigate',
            route: '/',
            message: "Taking you home!",
            confidence: 1.0
        };
    }
    
    saveData(data);
    logEvent('VOICE_COMMAND', { command: cmd, response: response.action });
    
    res.json(response);
});

app.post('/api/voice/command', (req, res) => {
    // Alias for /api/voice/process
    const { command_text } = req.body;
    req.body.command = command_text;
    return app._router.handle({ ...req, url: '/api/voice/process', method: 'POST' }, res, () => {});
});

// ═══════════════════════════════════════════════════════════════════════════════
// VENDOR ONBOARDING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/vendor/register', (req, res) => {
    const data = loadData();
    const { phone, businessName, businessDescription, shippingRegions } = req.body;
    
    const vendor = {
        id: `vendor_${Date.now()}`,
        phone,
        businessName,
        businessDescription,
        shippingRegions: shippingRegions || ['Nationwide'],
        status: 'pending_verification',
        created_at: new Date().toISOString(),
        products: [],
        catalogs: []
    };
    
    data.vendors = data.vendors || [];
    data.vendors.push(vendor);
    data.stats.vendors_onboarded = (data.stats.vendors_onboarded || 0) + 1;
    
    saveData(data);
    logEvent('VENDOR_REGISTERED', { id: vendor.id, businessName });
    
    res.json({ success: true, vendor, message: 'Vendor registered successfully!' });
});

app.post('/api/vendor/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    
    // Demo: accept 123456 as valid OTP
    if (otp === '123456') {
        const data = loadData();
        const vendor = data.vendors?.find(v => v.phone === phone);
        if (vendor) {
            vendor.status = 'verified';
            vendor.verified_at = new Date().toISOString();
            saveData(data);
        }
        
        res.json({ success: true, verified: true, message: 'Phone verified successfully!' });
    } else {
        res.json({ success: false, verified: false, message: 'Invalid OTP. Try 123456 for demo.' });
    }
});

app.post('/api/vendor/catalog/upload', (req, res) => {
    const { vendorId, fileName, fileType, productsCount } = req.body;
    const data = loadData();
    
    const catalog = {
        id: `catalog_${Date.now()}`,
        vendorId,
        fileName,
        fileType,
        productsCount: productsCount || 0,
        status: 'processing',
        uploaded_at: new Date().toISOString(),
        pipeline_steps: []
    };
    
    // Simulate pipeline processing
    const pipelineSteps = ['parse', 'images', 'upscale', 'tables', 'vectors', 'publish'];
    
    res.json({
        success: true,
        catalog,
        pipeline: pipelineSteps,
        message: 'Catalog upload initiated. Processing...'
    });
});

app.get('/api/vendors', (req, res) => {
    const data = loadData();
    res.json(data.vendors || []);
});

// ═══════════════════════════════════════════════════════════════════════════════
// BUILDER ONBOARDING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/builder/register', (req, res) => {
    const data = loadData();
    const { phone, companyName, licenseNumber, serviceAreas } = req.body;
    
    const builder = {
        id: `builder_${Date.now()}`,
        phone,
        companyName,
        licenseNumber,
        serviceAreas: serviceAreas || [],
        status: 'pending_verification',
        created_at: new Date().toISOString(),
        projects: []
    };
    
    data.builders = data.builders || [];
    data.builders.push(builder);
    data.stats.builders_onboarded = (data.stats.builders_onboarded || 0) + 1;
    
    saveData(data);
    logEvent('BUILDER_REGISTERED', { id: builder.id, companyName });
    
    res.json({ success: true, builder, message: 'Builder registered successfully!' });
});

app.get('/api/builders', (req, res) => {
    const data = loadData();
    res.json(data.builders || []);
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER ROLES ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/roles', (req, res) => {
    const roles = loadJSON(USER_ROLES_FILE, { roles: [] });
    res.json(roles);
});

app.get('/api/roles/:roleId', (req, res) => {
    const roles = loadJSON(USER_ROLES_FILE, { roles: [] });
    const role = roles.roles.find(r => r.id === req.params.roleId);
    
    if (role) {
        res.json(role);
    } else {
        res.status(404).json({ error: 'Role not found' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM & ABOUT ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/team', (req, res) => {
    const team = loadJSON(TEAM_FILE, {});
    res.json(team);
});

app.get('/api/about', (req, res) => {
    const data = loadData();
    const team = loadJSON(TEAM_FILE, {});
    
    res.json({
        ...data.about_us_knowledge,
        team_details: team
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNING ENGINE - Simulated Market Data Crawling
// ═══════════════════════════════════════════════════════════════════════════════

let learningInterval = null;

function startLearning() {
    if (learningInterval) return;
    
    console.log('🧠 Starting AI Learning Engine...');
    
    learningInterval = setInterval(() => {
        const data = loadData();
        const source = MARKET_SOURCES[Math.floor(Math.random() * MARKET_SOURCES.length)];
        
        // Create market memory
        const memory = {
            id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            memory_type: 'market_pattern',
            context: `Price data from ${source.name}`,
            learned_data: {
                source: source.name,
                category: source.category,
                url: source.url,
                prices_analyzed: Math.floor(Math.random() * 50) + 30,
                avg_price: (Math.random() * 400 + 150).toFixed(2),
                trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)],
                timestamp: new Date().toISOString()
            },
            confidence_score: Math.random() * 0.25 + 0.75,
            accessed_count: 0,
            created_at: new Date().toISOString()
        };
        
        data.memories = data.memories || [];
        data.memories.push(memory);
        
        // Update stats
        data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
        data.stats.market_prices_learned = (data.stats.market_prices_learned || 0) + memory.learned_data.prices_analyzed;
        data.stats.last_learning = new Date().toISOString();
        
        // Occasionally add a pattern
        if (Math.random() < 0.1) {
            const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
            data.memories.push({
                id: `pat_${Date.now()}`,
                memory_type: 'pattern',
                context: `Pattern: ${pattern}`,
                learned_data: {
                    name: pattern,
                    confidence: Math.random() * 0.2 + 0.75,
                    applications: Math.floor(Math.random() * 50) + 5
                },
                confidence_score: Math.random() * 0.15 + 0.8,
                created_at: new Date().toISOString()
            });
            data.stats.learned_patterns = (data.stats.learned_patterns || 0) + 1;
        }
        
        // Update accuracy score
        const baseAccuracy = 60;
        const memoryBonus = Math.min(data.memories.length / 100, 30);
        data.stats.accuracy_score = (baseAccuracy + memoryBonus + Math.random() * 5).toFixed(1);
        
        saveData(data);
        
    }, 30000); // Every 30 seconds
}

function stopLearning() {
    if (learningInterval) {
        clearInterval(learningInterval);
        learningInterval = null;
        console.log('🛑 AI Learning Engine stopped');
    }
}

app.post('/api/learning/start', (req, res) => {
    startLearning();
    res.json({ success: true, message: 'Learning engine started' });
});

app.post('/api/learning/stop', (req, res) => {
    stopLearning();
    res.json({ success: true, message: 'Learning engine stopped' });
});

app.get('/api/learning/status', (req, res) => {
    res.json({
        active: learningInterval !== null,
        interval: '30 seconds',
        sources: MARKET_SOURCES.map(s => s.name)
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOG ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/log', (req, res) => {
    const data = loadData();
    data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
    data.stats.last_activity = new Date().toISOString();
    saveData(data);
    
    logEvent('INTERACTION', req.body);
    
    res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SERVE DASHBOARD HTML
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/', (req, res) => {
    res.json({
        name: 'VistaView Backend API',
        version: 'v4.0',
        port: PORT,
        endpoints: [
            'GET /api/health',
            'GET /api/stats',
            'GET /api/dashboard',
            'GET /api/memories',
            'POST /api/voice/process',
            'POST /api/vendor/register',
            'POST /api/builder/register',
            'GET /api/roles',
            'GET /api/team',
            'GET /dashboard'
        ]
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  VISTAVIEW BACKEND v4.0');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(`  ✅ Server running on http://localhost:${PORT}`);
    console.log(`  📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`  🔧 API Docs: http://localhost:${PORT}/`);
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');
    
    // Auto-start learning engine
    startLearning();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    stopLearning();
    process.exit(0);
});

module.exports = app;
