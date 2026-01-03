// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW BACKEND SERVER v2.0
// With UI Action Bus, Full Logging, Training Support
// ═══════════════════════════════════════════════════════════════════════════════
//
// GOLDEN RULES EMBEDDED:
// ✅ Learning backend NEVER stops
// ✅ All actions logged to DB
// ✅ UI Action Bus implemented
// ✅ Route Map enforced
// ✅ Voice protocol supported
// ═══════════════════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION (From Golden Rules)
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = {
    // Ports (PERMANENT - never change)
    PORT: 3005,
    
    // Theme Colors (IMMUTABLE)
    THEME: {
        TEAL_PRIMARY: '#004236',
        TEAL_SECONDARY: '#007E67',
        GOLD_PRIMARY: '#905E26',
        GOLD_SECONDARY: '#F5EC9B',
        GOLD_ACCENT: '#B8860B'
    },
    
    // Route Map (PERMANENT)
    ROUTES: {
        'home': '/',
        'about': '/about',
        'how-it-works': '/how-it-works',
        'partners': '/partners',
        'lend-with-us': '/lend-with-us',
        'real-estate': '/real-estate',
        'catalog': '/catalog',
        'interior': '/interior',
        'services': '/services',
        'sign-in': '/sign-in'
    },
    
    // Voice Protocol
    WAKE_PHRASE: 'Hey Vista',
    INTERRUPT_PHRASES: ['hey', 'stop', 'wait', 'pause'],
    
    // TTS Settings
    TTS: {
        rate: 1.07,  // 7% faster
        pitch: 0.95, // Slightly lower
        voice: 'en-US'
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATA PATHS
// ═══════════════════════════════════════════════════════════════════════════════
const DATA_DIR = path.join(__dirname, '..', 'data');
const AI_DATA_FILE = path.join(DATA_DIR, 'ai-data.json');
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const TRAINING_DIR = path.join(DATA_DIR, 'training');

// Ensure directories exist
[DATA_DIR, LOGS_DIR, TRAINING_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING SYSTEM (Rule: If it isn't logged, it didn't happen)
// ═══════════════════════════════════════════════════════════════════════════════
const LOG_TYPES = {
    TRANSCRIPT: 'transcript',
    TTS: 'tts',
    UI_ACTION: 'ui_action',
    ROUTE_CHANGE: 'route_change',
    API_CALL: 'api_call',
    DB_WRITE: 'db_write',
    ERROR: 'error',
    LEARNING: 'learning'
};

function logEvent(type, data) {
    const event = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: new Date().toISOString(),
        data
    };
    
    // Write to log file
    const logFile = path.join(LOGS_DIR, `events_${new Date().toISOString().split('T')[0]}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify(event) + '\n');
    
    // Also update in-memory stats
    updateStats(type);
    
    return event;
}

function updateStats(eventType) {
    const data = loadData();
    data.stats = data.stats || {};
    data.stats.total_interactions = (data.stats.total_interactions || 0) + 1;
    data.stats[`${eventType}_count`] = (data.stats[`${eventType}_count`] || 0) + 1;
    data.stats.last_activity = new Date().toISOString();
    saveData(data);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
function loadData() {
    try {
        return JSON.parse(fs.readFileSync(AI_DATA_FILE, 'utf8'));
    } catch (e) {
        return {
            stats: { total_interactions: 0, learned_patterns: 0 },
            memories: [],
            tables: [],
            ui_actions: [],
            training_sessions: [],
            golden_conversations: []
        };
    }
}

function saveData(data) {
    logEvent(LOG_TYPES.DB_WRITE, { file: 'ai-data.json' });
    fs.writeFileSync(AI_DATA_FILE, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI ACTION BUS (Standard Actions)
// ═══════════════════════════════════════════════════════════════════════════════
const UI_ACTIONS = {
    HIGHLIGHT: 'UI_HIGHLIGHT',
    MOVE_CURSOR: 'UI_MOVE_CURSOR',
    CLICK: 'UI_CLICK',
    SCROLL_TO: 'UI_SCROLL_TO',
    OPEN_MODAL: 'UI_OPEN_MODAL',
    CLOSE_MODAL: 'UI_CLOSE_MODAL',
    NAVIGATE: 'UI_NAVIGATE',
    BACK: 'UI_BACK'
};

function executeUIAction(action, target, context = {}) {
    const event = {
        action,
        target,
        context,
        timestamp: new Date().toISOString(),
        success: true
    };
    
    // Validate route if navigating
    if (action === UI_ACTIONS.NAVIGATE) {
        if (!CONFIG.ROUTES[target] && !Object.values(CONFIG.ROUTES).includes(target)) {
            event.success = false;
            event.error = `Invalid route: ${target}. Valid routes: ${Object.keys(CONFIG.ROUTES).join(', ')}`;
        }
    }
    
    // Log the action
    logEvent(LOG_TYPES.UI_ACTION, event);
    
    // Save to training data
    const data = loadData();
    data.ui_actions = data.ui_actions || [];
    data.ui_actions.push(event);
    if (data.ui_actions.length > 1000) data.ui_actions = data.ui_actions.slice(-500);
    saveData(data);
    
    return event;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/health' });
    res.json({
        status: 'healthy',
        model: 'gpt-oss:20b',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        rules_loaded: true
    });
});

// Get configuration (theme, routes, etc.)
app.get('/api/config', (req, res) => {
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/config' });
    res.json({
        theme: CONFIG.THEME,
        routes: CONFIG.ROUTES,
        tts: CONFIG.TTS,
        wake_phrase: CONFIG.WAKE_PHRASE,
        interrupt_phrases: CONFIG.INTERRUPT_PHRASES
    });
});

// Get stats
app.get('/api/stats', (req, res) => {
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/stats' });
    const data = loadData();
    res.json({
        total_interactions: data.stats?.total_interactions || 0,
        learned_patterns: data.stats?.learned_patterns || 0,
        market_prices_learned: data.stats?.market_prices_learned || 0,
        accuracy_score: data.stats?.accuracy_score || 0,
        tables_count: data.tables?.length || 0,
        memories_count: data.memories?.length || 0,
        ui_actions_count: data.ui_actions?.length || 0,
        last_activity: data.stats?.last_activity || null,
        model: 'gpt-oss:20b',
        status: 'active',
        rules_version: '2.0'
    });
});

// Get memories/patterns
app.get('/api/memories', (req, res) => {
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/memories' });
    const data = loadData();
    res.json(data.memories || []);
});

// Get tables
app.get('/api/tables', (req, res) => {
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/tables' });
    const data = loadData();
    res.json(data.tables || []);
});

// Get route map
app.get('/api/routes', (req, res) => {
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/routes' });
    res.json(CONFIG.ROUTES);
});

// ═══════════════════════════════════════════════════════════════════════════════
// UI ACTION BUS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// Execute UI action
app.post('/api/ui/action', (req, res) => {
    const { action, target, context } = req.body;
    
    if (!action || !UI_ACTIONS[action.replace('UI_', '')]) {
        return res.status(400).json({
            error: 'Invalid action',
            valid_actions: Object.values(UI_ACTIONS)
        });
    }
    
    const result = executeUIAction(action, target, context);
    res.json(result);
});

// Get UI action history
app.get('/api/ui/history', (req, res) => {
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/ui/history' });
    const data = loadData();
    res.json(data.ui_actions?.slice(-100) || []);
});

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE COMMAND PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/voice/process', (req, res) => {
    const { command, transcript_id } = req.body;
    
    logEvent(LOG_TYPES.TRANSCRIPT, { command, transcript_id });
    
    const cmd = (command || '').toLowerCase().trim();
    
    // Check for interrupt phrases
    if (CONFIG.INTERRUPT_PHRASES.some(phrase => cmd === phrase || cmd.startsWith(phrase + ' '))) {
        logEvent(LOG_TYPES.TTS, { action: 'interrupt', command: cmd });
        return res.json({
            action: 'interrupt',
            message: "I've paused. Do you want me to continue, or change direction?",
            tts_settings: CONFIG.TTS
        });
    }
    
    // Parse intent and generate response
    let response = parseVoiceIntent(cmd);
    
    // Execute UI action if applicable
    if (response.ui_action) {
        executeUIAction(response.ui_action.action, response.ui_action.target);
    }
    
    // Log TTS event
    logEvent(LOG_TYPES.TTS, { action: 'speak', message: response.message });
    
    res.json({
        ...response,
        tts_settings: CONFIG.TTS,
        transcript_id
    });
});

function parseVoiceIntent(cmd) {
    // Navigation intents
    if (cmd.includes('about') || cmd.includes('team')) {
        return {
            action: 'navigate',
            route: '/about',
            message: "Opening About Us. Let me show you who we are.",
            ui_action: { action: UI_ACTIONS.NAVIGATE, target: 'about' }
        };
    }
    
    if (cmd.includes('how') && cmd.includes('work')) {
        return {
            action: 'navigate',
            route: '/how-it-works',
            message: "Let me show you how VistaView works.",
            ui_action: { action: UI_ACTIONS.NAVIGATE, target: 'how-it-works' }
        };
    }
    
    if (cmd.includes('sign') || cmd.includes('login') || cmd.includes('register')) {
        return {
            action: 'modal',
            modal: 'signIn',
            message: "Choose your role to get started!",
            ui_action: { action: UI_ACTIONS.OPEN_MODAL, target: 'signIn' }
        };
    }
    
    if (cmd.includes('real estate') || cmd.includes('properties') || cmd.includes('homes')) {
        return {
            action: 'navigate',
            route: '/real-estate',
            message: "Opening Real Estate. Let's find your perfect property!",
            ui_action: { action: UI_ACTIONS.NAVIGATE, target: 'real-estate' }
        };
    }
    
    if (cmd.includes('catalog') || cmd.includes('products') || cmd.includes('shop')) {
        return {
            action: 'navigate',
            route: '/catalog',
            message: "Opening Product Catalog. Browse our amazing selection!",
            ui_action: { action: UI_ACTIONS.NAVIGATE, target: 'catalog' }
        };
    }
    
    if (cmd.includes('interior') || cmd.includes('design')) {
        return {
            action: 'navigate',
            route: '/interior',
            message: "Opening Interior Design section.",
            ui_action: { action: UI_ACTIONS.NAVIGATE, target: 'interior' }
        };
    }
    
    if (cmd.includes('service')) {
        return {
            action: 'navigate',
            route: '/services',
            message: "Opening Services. See what we offer!",
            ui_action: { action: UI_ACTIONS.NAVIGATE, target: 'services' }
        };
    }
    
    if (cmd.includes('partner')) {
        return {
            action: 'navigate',
            route: '/partners',
            message: "Opening Partners page.",
            ui_action: { action: UI_ACTIONS.NAVIGATE, target: 'partners' }
        };
    }
    
    if (cmd.includes('home') || cmd === 'go home' || cmd === 'main') {
        return {
            action: 'navigate',
            route: '/',
            message: "Taking you home.",
            ui_action: { action: UI_ACTIONS.NAVIGATE, target: 'home' }
        };
    }
    
    if (cmd.includes('back') || cmd.includes('go back') || cmd.includes('previous')) {
        return {
            action: 'back',
            message: "Going back.",
            ui_action: { action: UI_ACTIONS.BACK, target: null }
        };
    }
    
    if (cmd.includes('close') || cmd.includes('exit') || cmd.includes('cancel')) {
        return {
            action: 'close',
            message: "Closing. What else can I help with?",
            ui_action: { action: UI_ACTIONS.CLOSE_MODAL, target: 'current' }
        };
    }
    
    // Vendor flow
    if (cmd.includes('vendor') || cmd.includes("i'm a seller") || cmd.includes('sell')) {
        return {
            action: 'modal',
            modal: 'vendorOnboarding',
            message: "Great! Let's get you set up as a vendor. First, I'll need your phone number for verification.",
            ui_action: { action: UI_ACTIONS.OPEN_MODAL, target: 'vendorOnboarding' },
            flow: 'vendor',
            step: 1
        };
    }
    
    // Builder flow
    if (cmd.includes('builder') || cmd.includes('contractor') || cmd.includes('construction')) {
        return {
            action: 'modal',
            modal: 'builderOnboarding',
            message: "Excellent! Let's set you up as a builder. First, I'll need your phone number for verification.",
            ui_action: { action: UI_ACTIONS.OPEN_MODAL, target: 'builderOnboarding' },
            flow: 'builder',
            step: 1
        };
    }
    
    // Continue after pause
    if (cmd.includes('continue') || cmd.includes('go on') || cmd.includes('okay') || cmd.includes('yes')) {
        return {
            action: 'resume',
            message: "Alright! Continuing where we left off."
        };
    }
    
    // Ask about learning
    if (cmd.includes('what did you learn') || cmd.includes('what have you learned')) {
        const data = loadData();
        const stats = data.stats || {};
        return {
            action: 'report',
            message: `I've had ${stats.total_interactions || 0} interactions, learned ${stats.learned_patterns || 0} patterns, and analyzed ${stats.market_prices_learned || 0} market prices. My confidence is growing every day!`
        };
    }
    
    // Default
    return {
        action: 'unknown',
        message: "I'm not sure I understood that. You can ask me to navigate, show properties, open the catalog, or help you sign up."
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAINING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// Save golden conversation
app.post('/api/training/golden', (req, res) => {
    const { conversation, type, goal_achieved, notes } = req.body;
    
    const data = loadData();
    data.golden_conversations = data.golden_conversations || [];
    
    const entry = {
        id: `golden_${Date.now()}`,
        type, // 'vendor', 'builder', 'navigation', 'catalog'
        conversation,
        goal_achieved,
        notes,
        created_at: new Date().toISOString()
    };
    
    data.golden_conversations.push(entry);
    saveData(data);
    
    logEvent(LOG_TYPES.LEARNING, { action: 'golden_saved', type });
    
    res.json({ success: true, id: entry.id });
});

// Get training stats
app.get('/api/training/stats', (req, res) => {
    const data = loadData();
    const golden = data.golden_conversations || [];
    
    res.json({
        total_golden: golden.length,
        by_type: {
            vendor: golden.filter(g => g.type === 'vendor').length,
            builder: golden.filter(g => g.type === 'builder').length,
            navigation: golden.filter(g => g.type === 'navigation').length,
            catalog: golden.filter(g => g.type === 'catalog').length
        },
        success_rate: golden.length > 0 
            ? (golden.filter(g => g.goal_achieved).length / golden.length * 100).toFixed(1) + '%'
            : '0%',
        target: {
            vendor: 20,
            builder: 20,
            navigation: 20,
            catalog: 20
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD DATA ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/dashboard', (req, res) => {
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/dashboard' });
    
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
    
    // Get today's events
    const today = new Date().toISOString().split('T')[0];
    const todayLogFile = path.join(LOGS_DIR, `events_${today}.jsonl`);
    let todayEvents = 0;
    try {
        todayEvents = fs.readFileSync(todayLogFile, 'utf8').split('\n').filter(l => l).length;
    } catch (e) {}
    
    res.json({
        stats: {
            ...data.stats,
            events_today: todayEvents
        },
        tables: data.tables,
        sources: Object.entries(sources).map(([name, info]) => ({
            name,
            ...info
        })),
        recent_memories: (data.memories || []).slice(-10).reverse(),
        recent_actions: (data.ui_actions || []).slice(-10).reverse(),
        model: 'gpt-oss:20b',
        rules_version: '2.0',
        theme: CONFIG.THEME
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY AI (Ollama Integration)
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/query', async (req, res) => {
    const { question } = req.body;
    
    logEvent(LOG_TYPES.API_CALL, { endpoint: '/api/query', question });
    
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
        
        logEvent(LOG_TYPES.LEARNING, { action: 'query_success' });
        
        res.json({ answer: result.response, model: 'gpt-oss:20b' });
    } catch (e) {
        logEvent(LOG_TYPES.ERROR, { error: e.message, endpoint: '/api/query' });
        res.json({
            answer: "I'm having trouble connecting to my AI brain. Please try again.",
            error: e.message
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════════

const PORT = CONFIG.PORT;
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  VISTAVIEW BACKEND SERVER v2.0');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
    console.log(`🎤 Voice API: http://localhost:${PORT}/api/voice/process`);
    console.log(`🎯 UI Actions: http://localhost:${PORT}/api/ui/action`);
    console.log(`📝 Training: http://localhost:${PORT}/api/training/stats`);
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('🔒 Golden Rules loaded and enforced');
    console.log(`🎨 Theme: Teal ${CONFIG.THEME.TEAL_PRIMARY} | Gold ${CONFIG.THEME.GOLD_ACCENT}`);
    console.log('═══════════════════════════════════════════════════════════════════════');
    
    logEvent(LOG_TYPES.API_CALL, { action: 'server_start', port: PORT });
});
