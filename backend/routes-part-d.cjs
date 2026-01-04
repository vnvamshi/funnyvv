/**
 * VISTAVIEW PART D ROUTES
 * Real crawling, PDF, email, embeddings
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import real services
let crawler, pdfParser, emailService, embeddings;
try {
    crawler = require('./services/real-crawler.cjs');
    pdfParser = require('./services/real-pdf.cjs');
    emailService = require('./services/real-email.cjs');
    embeddings = require('./services/real-embeddings.cjs');
} catch (e) {
    console.log('[ROUTES-D] Some services not available:', e.message);
}

// File upload config
const upload = multer({
    dest: path.join(__dirname, 'uploads'),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files allowed'));
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CRAWLER ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Crawl a single URL
router.post('/crawler/crawl', async (req, res) => {
    const { url, maxDepth = 2 } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    
    try {
        const result = await crawler.crawlUrl(url, { maxDepth });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Queue URL for crawling
router.post('/crawler/queue', async (req, res) => {
    const { url, priority = 5, maxDepth = 2 } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    
    try {
        const result = await crawler.queueUrl(url, { priority, maxDepth });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Process crawl queue
router.post('/crawler/process', async (req, res) => {
    const { limit = 10 } = req.body;
    try {
        const results = await crawler.processCrawlQueue(limit);
        res.json({ success: true, processed: results.length, results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Crawl voice UI sites
router.post('/crawler/voice-sites', async (req, res) => {
    try {
        const result = await crawler.crawlVoiceUISites();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PDF ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Upload and process PDF
router.post('/pdf/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const uploadedBy = {
        type: req.body.uploaded_by_type || 'vendor',
        id: req.body.uploaded_by_id || 'unknown'
    };
    
    try {
        const result = await pdfParser.parsePDF(req.file.path, uploadedBy);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Process PDF by path
router.post('/pdf/process-path', async (req, res) => {
    const { file_path, uploaded_by_type, uploaded_by_id } = req.body;
    if (!file_path) return res.status(400).json({ error: 'file_path required' });
    
    try {
        const result = await pdfParser.parsePDF(file_path, { type: uploaded_by_type, id: uploaded_by_id });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get job status
router.get('/pdf/job/:id', async (req, res) => {
    try {
        const job = await pdfParser.getJobStatus(parseInt(req.params.id));
        res.json(job || { error: 'Job not found' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Send email immediately
router.post('/email/send', async (req, res) => {
    const { to, subject, html, text } = req.body;
    if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });
    
    try {
        const result = await emailService.sendEmail(to, subject, html || text, text);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Queue email
router.post('/email/queue', async (req, res) => {
    const { to, subject, html, text, priority } = req.body;
    if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });
    
    try {
        const result = await emailService.queueEmail(to, subject, html || text, text, { priority });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Send template email
router.post('/email/template', async (req, res) => {
    const { to, template, variables } = req.body;
    if (!to || !template) return res.status(400).json({ error: 'to and template required' });
    
    try {
        const result = await emailService.sendTemplateEmail(to, template, variables || {});
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Process email queue
router.post('/email/process', async (req, res) => {
    const { limit = 10 } = req.body;
    try {
        const result = await emailService.processQueue(limit);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Generate embedding
router.post('/embeddings/generate', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    
    try {
        const embedding = await embeddings.generateEmbedding(text);
        res.json({ success: true, dimensions: embedding?.length, embedding: embedding?.slice(0, 10) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Queue for embedding
router.post('/embeddings/queue', async (req, res) => {
    const { table, id, content, column = 'embedding' } = req.body;
    if (!table || !id || !content) return res.status(400).json({ error: 'table, id, content required' });
    
    try {
        const result = await embeddings.queueForEmbedding(table, id, content, column);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Process embedding queue
router.post('/embeddings/process', async (req, res) => {
    const { limit = 50 } = req.body;
    try {
        const result = await embeddings.processEmbeddingQueue(limit);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Semantic search
router.post('/search/semantic', async (req, res) => {
    const { query, table, limit = 10 } = req.body;
    if (!query || !table) return res.status(400).json({ error: 'query and table required' });
    
    try {
        const results = await embeddings.semanticSearch(query, table, { limit });
        res.json({ success: true, count: results.length, results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Find similar patterns
router.post('/search/patterns', async (req, res) => {
    const { text, limit = 5 } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    
    try {
        const results = await embeddings.findSimilarPatterns(text, limit);
        res.json({ success: true, count: results.length, results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Find similar products
router.post('/search/products', async (req, res) => {
    const { text, limit = 5 } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    
    try {
        const results = await embeddings.findSimilarProducts(text, limit);
        res.json({ success: true, count: results.length, results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
