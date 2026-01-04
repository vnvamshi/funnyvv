/**
 * VISTAVIEW BACKEND v33.5
 * With PDF Upload + Form Processing
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 1117;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({ database: 'vistaview', host: 'localhost' });

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function analyzeIntent(text) {
    const lower = text.toLowerCase();
    if (lower.match(/navigate|go to|open|show/)) return 'navigation';
    if (lower.match(/search|find|look|what|who/)) return 'query';
    if (lower.match(/stop|cancel|close/)) return 'control';
    if (lower.match(/create|add|new/)) return 'create';
    if (lower.match(/fill|enter|put|type|write/)) return 'fill';
    if (lower.match(/company|business|name|about/)) return 'form_input';
    if (lower.match(/phone|number|digit/)) return 'phone_input';
    if (lower.match(/upload|file|pdf|catalog/)) return 'upload';
    if (lower.match(/beautify|enhance|improve/)) return 'beautify';
    if (lower.match(/save|submit|next|continue/)) return 'save';
    return 'general';
}

function analyzeSentiment(text) {
    const lower = text.toLowerCase();
    if (lower.match(/great|good|awesome|thanks/)) return 'positive';
    if (lower.match(/bad|wrong|error|hate/)) return 'negative';
    return 'neutral';
}

function extractFormData(text, context) {
    const result = { fields: {} };
    const lower = text.toLowerCase();
    
    // Extract company name patterns
    if (context === 'company_name' || lower.includes('company') || lower.includes('business')) {
        // "my company is X" or "company name is X" or "I am from X and my company is Y"
        let match = text.match(/company\s+(?:is|name\s+is|called)\s+["']?([^"'\.,]+)/i);
        if (match) result.fields.companyName = match[1].trim();
        
        match = text.match(/(?:we are|i am from|this is)\s+["']?([^"'\.,]+)/i);
        if (match && !result.fields.companyName) result.fields.companyName = match[1].trim();
    }
    
    // Extract description/about
    if (context === 'description' || lower.includes('sell') || lower.includes('manufacture') || lower.includes('product')) {
        let match = text.match(/(?:we\s+)?(?:sell|manufacture|make|produce|provide)\s+(.+)/i);
        if (match) result.fields.description = match[1].trim();
        
        // Full text as description if nothing specific matched
        if (!result.fields.description && text.length > 20) {
            result.fields.description = text;
        }
    }
    
    // Extract phone numbers
    if (context === 'phone' || lower.match(/\d/)) {
        // Convert spoken numbers
        const numberWords = {
            'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
            'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
            'oh': '0', 'o': '0'
        };
        
        let phoneText = lower;
        for (const [word, digit] of Object.entries(numberWords)) {
            phoneText = phoneText.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
        }
        
        // Extract digits
        const digits = phoneText.replace(/\D/g, '');
        if (digits.length >= 10) {
            result.fields.phone = digits.slice(0, 10);
        }
    }
    
    return result;
}

function generateResponse(intent, sentiment, context) {
    const responses = {
        form_input: "Got it! I'm filling that in for you now.",
        phone_input: "Entering your phone number...",
        beautify: "Enhancing your content with AI magic!",
        save: "Saving your progress...",
        upload: "Processing your upload...",
        fill: "Filling in the form...",
        navigation: "Taking you there!",
        query: "Searching...",
        control: "Done!",
        general: "Got it, boss!"
    };
    return responses[intent] || responses.general;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/', async (req, res) => {
    let stats = { interactions: 0, patterns: 0, crawls: 0, memory: 0, feed: 0, voice: 0, pdfs: 0 };
    let recentActivity = [];
    let patterns = [];
    
    try {
        stats.interactions = parseInt((await pool.query('SELECT COUNT(*) FROM global_interaction_ledger')).rows[0].count);
        stats.patterns = parseInt((await pool.query('SELECT COUNT(*) FROM learned_patterns')).rows[0].count);
        stats.crawls = parseInt((await pool.query('SELECT COUNT(*) FROM crawled_sources')).rows[0].count);
        stats.memory = parseInt((await pool.query('SELECT COUNT(*) FROM system_memory')).rows[0].count);
        stats.feed = parseInt((await pool.query('SELECT COUNT(*) FROM realtime_feed')).rows[0].count);
        stats.voice = parseInt((await pool.query('SELECT COUNT(*) FROM boss_voice_inputs')).rows[0].count);
        try { stats.pdfs = parseInt((await pool.query('SELECT COUNT(*) FROM document_knowledge')).rows[0].count); } catch {}
        
        recentActivity = (await pool.query('SELECT raw_transcript, intent, sentiment, created_at FROM global_interaction_ledger ORDER BY created_at DESC LIMIT 10')).rows;
        patterns = (await pool.query('SELECT pattern_text, pattern_type, occurrence_count FROM learned_patterns ORDER BY occurrence_count DESC LIMIT 10')).rows;
    } catch(e) { console.error(e); }
    
    const confidence = Math.min(0.5 + (stats.interactions / 100) * 0.4, 0.95);
    
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VistaView AI Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: #e2e8f0; }
        .header { background: rgba(0,0,0,0.3); padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 24px; background: linear-gradient(90deg, #06b6d4, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .status { display: flex; align-items: center; gap: 8px; }
        .status .dot { width: 10px; height: 10px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .container { padding: 30px 40px; max-width: 1400px; margin: 0 auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        .stat-card .icon { font-size: 28px; margin-bottom: 8px; }
        .stat-card .value { font-size: 32px; font-weight: 700; background: linear-gradient(90deg, #06b6d4, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-card .label { color: #94a3b8; font-size: 13px; margin-top: 4px; }
        .section { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .section h2 { font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .activity-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .activity-item:last-child { border-bottom: none; }
        .activity-item .text { flex: 1; font-size: 13px; color: #cbd5e1; }
        .intent { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .intent-navigation { background: #0ea5e9; }
        .intent-query { background: #8b5cf6; }
        .intent-form_input { background: #22c55e; }
        .intent-phone_input { background: #f59e0b; color: #000; }
        .intent-general { background: #64748b; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
        .confidence-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-top: 6px; }
        .confidence-fill { height: 100%; background: linear-gradient(90deg, #06b6d4, #8b5cf6); }
        .refresh-btn { background: linear-gradient(90deg, #06b6d4, #8b5cf6); border: none; padding: 8px 16px; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; }
        .pattern-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .pattern-item .count { background: rgba(6,182,212,0.2); color: #06b6d4; padding: 2px 10px; border-radius: 10px; font-size: 11px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 VistaView AI Dashboard</h1>
        <div class="status"><div class="dot"></div><span>Learning Active</span><button class="refresh-btn" onclick="location.reload()">↻ Refresh</button></div>
    </div>
    <div class="container">
        <div class="stats-grid">
            <div class="stat-card"><div class="icon">🎤</div><div class="value">${stats.voice}</div><div class="label">Voice Commands</div></div>
            <div class="stat-card"><div class="icon">📝</div><div class="value">${stats.interactions}</div><div class="label">Interactions</div></div>
            <div class="stat-card"><div class="icon">🧩</div><div class="value">${stats.patterns}</div><div class="label">Patterns</div></div>
            <div class="stat-card"><div class="icon">🕷️</div><div class="value">${stats.crawls}</div><div class="label">Crawled</div></div>
            <div class="stat-card"><div class="icon">📄</div><div class="value">${stats.pdfs}</div><div class="label">PDFs Parsed</div></div>
            <div class="stat-card"><div class="icon">📊</div><div class="value">${(confidence * 100).toFixed(0)}%</div><div class="label">Confidence</div><div class="confidence-bar"><div class="confidence-fill" style="width:${confidence*100}%"></div></div></div>
        </div>
        <div class="grid-2">
            <div class="section"><h2>📜 Recent Activity</h2>${recentActivity.length === 0 ? '<p style="color:#64748b">No activity yet</p>' : recentActivity.map(a => '<div class="activity-item"><span class="text">"' + (a.raw_transcript?.substring(0,40) || '...') + '"</span><span class="intent intent-' + a.intent + '">' + a.intent + '</span></div>').join('')}</div>
            <div class="section"><h2>🧩 Learned Patterns</h2>${patterns.length === 0 ? '<p style="color:#64748b">No patterns</p>' : patterns.map(p => '<div class="pattern-item"><span>' + (p.pattern_text?.substring(0,35) || '...') + '</span><span class="count">×' + p.occurrence_count + '</span></div>').join('')}</div>
        </div>
    </div>
    <script>setTimeout(() => location.reload(), 30000);</script>
</body>
</html>`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE COMMAND - With Form Field Extraction
// ═══════════════════════════════════════════════════════════════════════════════
const voiceHandler = async (req, res) => {
    const { text, transcript, user_type = 'boss', page_route = '/', context = 'general' } = req.body;
    const inputText = text || transcript;
    if (!inputText) return res.status(400).json({ error: 'No text' });
    
    try {
        const intent = analyzeIntent(inputText);
        const sentiment = analyzeSentiment(inputText);
        const formData = extractFormData(inputText, context);
        
        // Save to ledger
        const result = await pool.query(`
            INSERT INTO global_interaction_ledger (user_type, raw_transcript, intent, sentiment, page_route, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id
        `, [user_type, inputText, intent, sentiment, page_route]);
        
        // Save to voice inputs
        try { await pool.query(`INSERT INTO boss_voice_inputs (raw_transcript, intent, confidence, created_at) VALUES ($1, $2, 0.9, NOW())`, [inputText, intent]); } catch {}
        
        // Learn pattern
        try { await pool.query(`INSERT INTO learned_patterns (pattern_text, pattern_type, occurrence_count, last_seen) VALUES ($1, $2, 1, NOW()) ON CONFLICT (pattern_text) DO UPDATE SET occurrence_count = learned_patterns.occurrence_count + 1, last_seen = NOW()`, [inputText.toLowerCase().substring(0,100), intent]); } catch {}
        
        // Feed
        try { await pool.query(`INSERT INTO realtime_feed (event_type, event_data, source, created_at) VALUES ('voice', $1, $2, NOW())`, [JSON.stringify({text: inputText, intent, formData}), user_type]); } catch {}
        
        console.log(`[Voice] "${inputText.substring(0,40)}..." → ${intent} | Fields: ${JSON.stringify(formData.fields)}`);
        
        res.json({
            success: true,
            ledger_id: result.rows[0].id,
            analysis: { intent, sentiment },
            formData: formData,
            response: { 
                text: generateResponse(intent, sentiment, context), 
                speak: true,
                action: intent === 'form_input' || intent === 'phone_input' ? 'fill_form' : null
            }
        });
    } catch (err) {
        console.error('[Voice] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
app.post('/voice/command', voiceHandler);
app.post('/api/voice/command', voiceHandler);

// ═══════════════════════════════════════════════════════════════════════════════
// FORM PROCESSING - Extract and Fill
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/form/process', async (req, res) => {
    const { text, context, fields } = req.body;
    
    if (!text) return res.status(400).json({ error: 'No text' });
    
    const formData = extractFormData(text, context);
    
    // If specific fields requested, try to fill them
    if (fields && Array.isArray(fields)) {
        for (const field of fields) {
            if (!formData.fields[field]) {
                // Try harder to extract
                if (field === 'companyName') {
                    // Use the most prominent noun phrase
                    const words = text.split(/\s+/);
                    const capitalized = words.filter(w => w[0] === w[0]?.toUpperCase() && w.length > 2);
                    if (capitalized.length > 0) {
                        formData.fields.companyName = capitalized.join(' ');
                    }
                }
                if (field === 'description' && !formData.fields.description) {
                    formData.fields.description = text;
                }
            }
        }
    }
    
    res.json({
        success: true,
        formData,
        fillAnimation: true
    });
});
app.post('/form/process', (req, res) => { req.url = '/api/form/process'; app.handle(req, res); });

// ═══════════════════════════════════════════════════════════════════════════════
// PDF UPLOAD & PARSING
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/upload/pdf', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    console.log(`[PDF] Uploaded: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`);
    
    try {
        // Try Python parser first
        const pythonScript = path.join(__dirname, 'parse_pdf.py');
        
        exec(`python3 "${pythonScript}" "${filePath}"`, { maxBuffer: 10 * 1024 * 1024 }, async (error, stdout, stderr) => {
            let result;
            
            if (error || !stdout) {
                console.log('[PDF] Python parser failed, using basic extraction');
                // Basic fallback - just acknowledge upload
                result = { text: '', method: 'pending', error: 'Parser unavailable' };
            } else {
                try {
                    result = JSON.parse(stdout);
                } catch {
                    result = { text: stdout, method: 'raw' };
                }
            }
            
            // Save to database
            try {
                await pool.query(`
                    INSERT INTO document_knowledge (filename, file_type, raw_text, parsed_data, confidence, created_at)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                `, [req.file.originalname, 'pdf', result.text?.substring(0, 10000), JSON.stringify(result), result.text ? 0.8 : 0.3]);
            } catch (e) {
                console.log('[PDF] DB save error:', e.message);
            }
            
            // Extract products if it's a catalog
            let products = [];
            if (result.text) {
                // Simple product extraction
                const lines = result.text.split('\n').filter(l => l.trim());
                products = lines.slice(0, 20).map((line, i) => ({
                    id: i + 1,
                    name: line.substring(0, 50),
                    raw: line
                }));
            }
            
            console.log(`[PDF] Parsed: ${result.text?.length || 0} chars, ${products.length} potential products`);
            
            res.json({
                success: true,
                filename: req.file.originalname,
                size: req.file.size,
                method: result.method,
                textLength: result.text?.length || 0,
                products: products,
                preview: result.text?.substring(0, 500)
            });
        });
    } catch (err) {
        console.error('[PDF] Error:', err);
        res.status(500).json({ error: err.message });
    }
});
app.post('/upload/pdf', upload.single('file'), (req, res, next) => { req.url = '/api/upload/pdf'; next(); });

// Alias for catalog upload
app.post('/api/upload/catalog', upload.single('file'), (req, res, next) => { req.url = '/api/upload/pdf'; next(); });
app.post('/upload/catalog', upload.single('file'), (req, res, next) => { req.url = '/api/upload/pdf'; next(); });

// ═══════════════════════════════════════════════════════════════════════════════
// BEAUTIFY - AI Enhancement
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/beautify', async (req, res) => {
    const { text, type = 'description' } = req.body;
    
    if (!text) return res.status(400).json({ error: 'No text' });
    
    // Simple beautification (in production, use Ollama/GPT)
    let enhanced = text;
    
    if (type === 'description') {
        // Capitalize sentences, add professional language
        enhanced = text
            .split('. ')
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join('. ');
        
        if (!enhanced.endsWith('.')) enhanced += '.';
        
        // Add professional prefix if short
        if (enhanced.length < 100) {
            enhanced = `We specialize in ${enhanced.toLowerCase()}`;
        }
    }
    
    if (type === 'company_name') {
        // Capitalize each word
        enhanced = text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    
    res.json({
        success: true,
        original: text,
        enhanced: enhanced,
        type
    });
});
app.post('/beautify', (req, res) => { req.url = '/api/beautify'; app.handle(req, res); });

// ═══════════════════════════════════════════════════════════════════════════════
// OTHER ENDPOINTS (same as before)
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/health', (req, res) => res.json({ status: 'ok', version: '33.5' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '33.5' }));

const ledgerHandler = async (req, res) => {
    const { user_type = 'boss', raw_transcript, page_route = '/', context = 'general' } = req.body;
    if (!raw_transcript) return res.status(400).json({ error: 'No transcript' });
    try {
        const intent = analyzeIntent(raw_transcript);
        const sentiment = analyzeSentiment(raw_transcript);
        const formData = extractFormData(raw_transcript, context);
        const result = await pool.query(`INSERT INTO global_interaction_ledger (user_type, raw_transcript, intent, sentiment, page_route, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`, [user_type, raw_transcript, intent, sentiment, page_route]);
        res.json({ success: true, ledger_id: result.rows[0].id, analysis: { intent, sentiment }, formData, tts_response: { text: generateResponse(intent, sentiment, context), tone: 'friendly' } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
app.post('/ledger/log', ledgerHandler);
app.post('/api/ledger/log', ledgerHandler);

const statsHandler = async (req, res) => {
    try {
        const c = {};
        for (const t of ['global_interaction_ledger', 'learned_patterns', 'crawled_sources', 'boss_voice_inputs', 'document_knowledge']) {
            try { c[t] = parseInt((await pool.query(`SELECT COUNT(*) FROM ${t}`)).rows[0].count); } catch { c[t] = 0; }
        }
        res.json({ interactions: c.global_interaction_ledger, patterns: c.learned_patterns, webCrawls: c.crawled_sources, voiceCommands: c.boss_voice_inputs, pdfs: c.document_knowledge, confidence: Math.min(0.5 + (c.global_interaction_ledger/100)*0.4, 0.95), lastUpdated: new Date().toISOString() });
    } catch { res.json({ interactions: 0, patterns: 0, webCrawls: 0, confidence: 0.5 }); }
};
app.get('/ai/training/stats', statsHandler);
app.get('/api/ai/training/stats', statsHandler);

const dashboardHandler = async (req, res) => {
    try {
        const c = {};
        for (const t of ['global_interaction_ledger', 'learned_patterns', 'crawled_sources', 'system_memory', 'realtime_feed', 'boss_voice_inputs']) {
            try { c[t] = parseInt((await pool.query(`SELECT COUNT(*) FROM ${t}`)).rows[0].count); } catch { c[t] = 0; }
        }
        const recent = (await pool.query(`SELECT raw_transcript, intent, created_at FROM global_interaction_ledger ORDER BY created_at DESC LIMIT 5`)).rows;
        res.json({ success: true, counts: c, recentActivity: recent, timestamp: new Date().toISOString() });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
app.get('/dashboard', dashboardHandler);
app.get('/api/dashboard', dashboardHandler);

const feedHandler = async (req, res) => { try { res.json((await pool.query(`SELECT * FROM realtime_feed ORDER BY created_at DESC LIMIT 50`)).rows); } catch { res.json([]); } };
app.get('/feed', feedHandler);
app.get('/api/feed', feedHandler);

const patternsHandler = async (req, res) => { try { res.json((await pool.query(`SELECT * FROM learned_patterns ORDER BY occurrence_count DESC LIMIT 50`)).rows); } catch { res.json([]); } };
app.get('/patterns', patternsHandler);
app.get('/api/patterns', patternsHandler);

const interactionsHandler = async (req, res) => { try { res.json((await pool.query(`SELECT * FROM global_interaction_ledger ORDER BY created_at DESC LIMIT 100`)).rows); } catch { res.json([]); } };
app.get('/interactions', interactionsHandler);
app.get('/api/interactions', interactionsHandler);

const memoryHandler = async (req, res) => { try { res.json((await pool.query(`SELECT * FROM system_memory ORDER BY importance DESC LIMIT 50`)).rows); } catch { res.json([]); } };
app.get('/memory', memoryHandler);
app.get('/api/memory', memoryHandler);

const toolsHandler = async (req, res) => { try { res.json((await pool.query(`SELECT * FROM installed_tools WHERE is_active = true`)).rows); } catch { res.json([]); } };
app.get('/tools', toolsHandler);
app.get('/api/tools', toolsHandler);

// Start
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  🚀 VISTAVIEW BACKEND v33.5 - Port ${PORT}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  NEW: Form field extraction from voice');
    console.log('  NEW: PDF upload & parsing');
    console.log('  NEW: AI beautification');
    console.log('═══════════════════════════════════════════════════════════════');
});
