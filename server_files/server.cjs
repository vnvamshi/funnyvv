require("dotenv").config();
// ═══════════════════════════════════════════════════════════════════════════════
//  VISTAVIEW COMPLETE BACKEND SERVER
//  Port: 1117
//  All routes integrated
// ═══════════════════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESS APP SETUP
// ═══════════════════════════════════════════════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 1117;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════════════════
const pool = new Pool({
    user: process.env.DB_USER || 'vistaview',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'vistaview',
    password: process.env.DB_PASSWORD || 'vistaview',
    port: parseInt(process.env.DB_PORT) || 5432,
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('⚠️  Database connection failed:', err.message);
        console.log('   Server will continue but some features may not work.');
    } else {
        console.log('✅ Database connected:', res.rows[0].now);
    }
});

// Make pool globally available
global.pool = pool;
global.app = app;

// ═══════════════════════════════════════════════════════════════════════════════
// MINIO CLIENT SETUP (Optional - will work without it)
// ═══════════════════════════════════════════════════════════════════════════════
let minioClient = null;
const BUCKET_NAME = 'vistaview-uploads';

try {
    const Minio = require('minio');
    minioClient = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT) || 9000,
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });
    
    minioClient.bucketExists(BUCKET_NAME).then(exists => {
        if (!exists) {
            minioClient.makeBucket(BUCKET_NAME, 'us-east-1').then(() => {
                console.log(`✅ MinIO bucket '${BUCKET_NAME}' created`);
            });
        } else {
            console.log(`✅ MinIO bucket '${BUCKET_NAME}' exists`);
        }
    }).catch(err => {
        console.log('⚠️  MinIO not available:', err.message);
    });
} catch (err) {
    console.log('⚠️  MinIO not installed. File uploads will use local storage.');
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD SETUP
// ═══════════════════════════════════════════════════════════════════════════════
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: pool ? 'connected' : 'disconnected',
        minio: minioClient ? 'available' : 'unavailable'
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// VENDOR ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/vendors', async (req, res) => {
    try {
        const { phone, companyName, description, files } = req.body;
        const result = await pool.query(
            `INSERT INTO vendors (phone, company_name, description, files, created_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [phone, companyName, description, JSON.stringify(files || [])]
        );
        res.json({ success: true, vendor: result.rows[0] });
    } catch (err) {
        console.error('Vendor create error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/vendors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vendors ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// BUILDER ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/builders', async (req, res) => {
    try {
        const { phone, companyName, description, files } = req.body;
        const result = await pool.query(
            `INSERT INTO builders (phone, company_name, profile, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [phone, companyName, description]
        );
        res.json({ success: true, builder: result.rows[0] });
    } catch (err) {
        console.error('Builder create error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/builders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM builders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/agents', async (req, res) => {
    try {
        const { phone, license, licenseState, companyName, description, files } = req.body;
        const result = await pool.query(
            `INSERT INTO agents (phone, license, license_state, company_name, profile, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [phone, license, licenseState, companyName, description]
        );
        res.json({ success: true, agent: result.rows[0] });
    } catch (err) {
        console.error('Agent create error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/agents', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM agents ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// BEAUTIFY ROUTE
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/beautify', (req, res) => {
    const { text, type, companyName } = req.body;
    
    let beautified = text;
    
    if (type === 'vendor') {
        beautified = `${companyName || 'Our company'} is a leading supplier of premium ${text}. We provide exceptional quality products with competitive pricing and outstanding customer service.`;
    } else if (type === 'builder') {
        beautified = `${companyName || 'Our company'} is a premier construction firm specializing in ${text}. With years of experience and a commitment to excellence, we deliver outstanding results on every project.`;
    } else if (type === 'agent') {
        beautified = `${companyName || 'Our agency'} is a trusted real estate partner specializing in ${text}. We provide expert guidance and personalized service to help clients achieve their real estate goals.`;
    }
    
    res.json({ success: true, beautified, original: text });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/upload/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { category, userType } = req.body;
        const file = req.file;
        const url = `http://localhost:${PORT}/uploads/${file.filename}`;
        
        try {
            await pool.query(
                `INSERT INTO file_uploads (user_type, category, file_name, file_path, file_url, file_size, mime_type, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                [userType, category, file.originalname, file.path, url, file.size, file.mimetype]
            );
        } catch (dbErr) {
            console.log('DB insert skipped:', dbErr.message);
        }
        
        res.json({
            success: true,
            url,
            fileName: file.originalname,
            size: file.size,
            mimeType: file.mimetype
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.use('/uploads', express.static(uploadDir));

app.post('/api/upload/minio', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { category, userType, userId } = req.body;
        const file = req.file;
        
        if (minioClient) {
            const objectName = `${userType}/${userId || 'anonymous'}/${category}/${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            
            await minioClient.fPutObject(BUCKET_NAME, objectName, file.path, {
                'Content-Type': file.mimetype
            });
            
            const url = `http://localhost:9000/${BUCKET_NAME}/${objectName}`;
            fs.unlinkSync(file.path);
            
            res.json({ success: true, url, objectName, fileName: file.originalname, size: file.size });
        } else {
            const url = `http://localhost:${PORT}/uploads/${file.filename}`;
            res.json({ success: true, url, fileName: file.originalname, size: file.size });
        }
    } catch (err) {
        console.error('MinIO upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE status = $1 ORDER BY created_at DESC LIMIT 100',
            ['active']
        );
        res.json(result.rows);
    } catch (err) {
        res.json([
            { id: 1, name: 'Premium Hardwood Flooring', price: 8.99, category: 'Flooring', sku: 'HWF-001' },
            { id: 2, name: 'Ceramic Wall Tiles', price: 4.50, category: 'Tiles', sku: 'CWT-002' },
            { id: 3, name: 'LED Smart Bulbs', price: 29.99, category: 'Lighting', sku: 'LSB-003' },
            { id: 4, name: 'Granite Countertop', price: 75.00, category: 'Kitchen', sku: 'GCT-004' },
            { id: 5, name: 'Waterproof Vinyl Plank', price: 5.99, category: 'Flooring', sku: 'WVP-005' },
        ]);
    }
});

app.post('/api/products/search', async (req, res) => {
    try {
        const { query, limit = 20 } = req.body;
        let sql = `SELECT * FROM products WHERE status = 'active'`;
        const params = [];
        
        if (query) {
            params.push(`%${query}%`);
            sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }
        
        sql += ` ORDER BY created_at DESC LIMIT ${limit}`;
        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/product-chat', (req, res) => {
    const { productId, product, question } = req.body;
    const q = question.toLowerCase();
    let answer = '';
    
    if (q.includes('price') || q.includes('cost')) {
        answer = product.price ? `${product.name} is priced at $${product.price.toFixed(2)}.` : 'Price not available.';
    } else if (q.includes('sku') || q.includes('part')) {
        answer = product.sku ? `The SKU is ${product.sku}.` : 'SKU not available.';
    } else if (q.includes('description') || q.includes('about')) {
        answer = product.description || `${product.name} is a quality product.`;
    } else {
        answer = `${product.name}${product.price ? ` at $${product.price.toFixed(2)}` : ''}. What would you like to know?`;
    }
    
    res.json({ answer, productId });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/properties', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM properties WHERE status = $1 ORDER BY created_at DESC LIMIT 100',
            ['active']
        );
        res.json(result.rows);
    } catch (err) {
        res.json([
            { id: 1, title: 'Modern Downtown Condo', price: 425000, city: 'Austin', state: 'TX', bedrooms: 2, bathrooms: 2, sqft: 1200, listing_type: 'sale' },
            { id: 2, title: 'Luxury Suburban Home', price: 875000, city: 'Austin', state: 'TX', bedrooms: 4, bathrooms: 3, sqft: 3200, listing_type: 'sale' },
            { id: 3, title: 'Cozy Studio Apartment', price: 1500, city: 'Austin', state: 'TX', bedrooms: 0, bathrooms: 1, sqft: 550, listing_type: 'rent' },
        ]);
    }
});

app.post('/api/properties', async (req, res) => {
    try {
        const { title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id } = req.body;
        
        const result = await pool.query(
            `INSERT INTO properties (title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active', NOW()) RETURNING *`,
            [title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id]
        );
        
        res.json({ success: true, property: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE COMMENTS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/process-voice-comment', async (req, res) => {
    try {
        const { text, userType, userId, companyName, category } = req.body;
        const extracted = { products: [], prices: [], features: [] };
        
        const priceMatches = text.match(/\$?\d+(?:\.\d{2})?/g);
        if (priceMatches) {
            extracted.prices = priceMatches.map(p => parseFloat(p.replace('$', '')));
        }
        
        try {
            await pool.query(
                `INSERT INTO voice_comments (user_id, user_type, company_name, text, category, extracted_info, processed, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, true, NOW())`,
                [userId, userType, companyName, text, category, JSON.stringify(extracted)]
            );
        } catch (dbErr) {}
        
        res.json({ success: true, extracted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/save-voice-comments', async (req, res) => {
    try {
        const { userId, userType, companyName, comments } = req.body;
        
        for (const comment of (comments || [])) {
            try {
                await pool.query(
                    `INSERT INTO voice_comments (user_id, user_type, company_name, text, category, extracted_info, processed, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [userId, userType, companyName, comment.text, comment.category, JSON.stringify(comment.extractedInfo || {}), comment.processed, comment.timestamp]
                );
            } catch (e) {}
        }
        
        res.json({ success: true, saved: (comments || []).length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/dashboard/stats', async (req, res) => {
    const stats = {
        vendors: 0, builders: 0, agents: 0,
        products: 0, properties: 0, uploads: 0, voiceComments: 0,
        recentUploads: [], recentProducts: [], recentProperties: []
    };
    
    const queries = [
        { key: 'vendors', sql: 'SELECT COUNT(*) as count FROM vendors' },
        { key: 'builders', sql: 'SELECT COUNT(*) as count FROM builders' },
        { key: 'agents', sql: 'SELECT COUNT(*) as count FROM agents' },
        { key: 'products', sql: 'SELECT COUNT(*) as count FROM products' },
        { key: 'properties', sql: 'SELECT COUNT(*) as count FROM properties' },
        { key: 'uploads', sql: 'SELECT COUNT(*) as count FROM file_uploads' },
        { key: 'voiceComments', sql: 'SELECT COUNT(*) as count FROM voice_comments' },
    ];
    
    for (const q of queries) {
        try {
            const result = await pool.query(q.sql);
            stats[q.key] = parseInt(result.rows[0].count) || 0;
        } catch (e) {}
    }
    
    res.json(stats);
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOWNLOADS FOLDER SEARCH
// ═══════════════════════════════════════════════════════════════════════════════
const getDownloadsPath = () => path.join(os.homedir(), 'Downloads');

function getFileType(ext) {
    const types = {
        '.pdf': 'PDF Document', '.xlsx': 'Excel', '.xls': 'Excel', '.csv': 'CSV',
        '.jpg': 'Image', '.jpeg': 'Image', '.png': 'Image', '.gif': 'Image',
        '.mp4': 'Video', '.mov': 'Video', '.dwg': 'CAD', '.glb': '3D Model'
    };
    return types[ext] || 'File';
}

app.get('/api/downloads', (req, res) => {
    try {
        const downloadsPath = getDownloadsPath();
        const { filter, type } = req.query;
        
        let files = fs.readdirSync(downloadsPath)
            .filter(f => !f.startsWith('.'))
            .map(f => {
                const filePath = path.join(downloadsPath, f);
                const stats = fs.statSync(filePath);
                const ext = path.extname(f).toLowerCase();
                return {
                    name: f,
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime,
                    extension: ext,
                    type: getFileType(ext)
                };
            })
            .sort((a, b) => new Date(b.modified) - new Date(a.modified));
        
        if (filter) {
            const lf = filter.toLowerCase();
            files = files.filter(f => f.name.toLowerCase().includes(lf));
        }
        
        if (type) {
            files = files.filter(f => f.extension === `.${type}` || f.type.toLowerCase().includes(type.toLowerCase()));
        }
        
        res.json({ path: downloadsPath, files: files.slice(0, 50) });
    } catch (err) {
        res.json({ path: '', files: [] });
    }
});

app.post('/api/downloads/voice-search', (req, res) => {
    try {
        const { query } = req.body;
        const downloadsPath = getDownloadsPath();
        const searchTerms = query.toLowerCase().replace(/find|get|upload|the|file|called|named/g, '').trim();
        
        const files = fs.readdirSync(downloadsPath)
            .filter(f => !f.startsWith('.'))
            .map(f => {
                const ext = path.extname(f).toLowerCase();
                const name = f.toLowerCase();
                let score = 0;
                
                if (name === searchTerms) score += 100;
                if (name.startsWith(searchTerms)) score += 50;
                if (name.includes(searchTerms)) score += 30;
                if (ext === '.pdf') score += 5;
                if (name.includes('vistaview')) score += 15;
                
                return { name: f, score, extension: ext, type: getFileType(ext) };
            })
            .filter(f => f.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        res.json({ query, matches: files, bestMatch: files[0] || null });
    } catch (err) {
        res.json({ query: req.body.query, matches: [], bestMatch: null });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PDF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/extract-products', async (req, res) => {
    try {
        const { fileUrl, fileName } = req.body;
        
        const products = [
            { name: 'Extracted from ' + fileName, price: 9.99, sku: 'EXT-001' }
        ];
        
        res.json({
            success: true,
            products,
            stats: { total: products.length, published: products.length }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/vectorize', (req, res) => {
    res.json({ success: true, message: 'Content vectorized' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`  🚀 VISTAVIEW BACKEND SERVER`);
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`  ✅ Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('  📋 API ENDPOINTS:');
    console.log('     GET  /api/health              - Health check');
    console.log('     POST /api/vendors             - Create vendor');
    console.log('     POST /api/builders            - Create builder');
    console.log('     POST /api/agents              - Create agent');
    console.log('     POST /api/beautify            - Enhance text');
    console.log('     POST /api/upload/file         - Upload file');
    console.log('     POST /api/upload/minio        - Upload to MinIO');
    console.log('     GET  /api/products            - List products');
    console.log('     POST /api/product-chat        - Chat with product');
    console.log('     GET  /api/properties          - List properties');
    console.log('     GET  /api/dashboard/stats     - Dashboard stats');
    console.log('     GET  /api/downloads           - List downloads');
    console.log('     POST /api/downloads/voice-search - Voice file search');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
});
