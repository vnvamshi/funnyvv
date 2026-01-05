#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  PART B: 5-STEP PDF EXTRACTION PIPELINE + MINIO + PRODUCT TABLES
#  
#  The 5 Steps:
#  1. UPLOAD - File goes to MinIO storage
#  2. EXTRACT - Parse PDF/Excel for products, prices, images
#  3. PROCESS - Clean data, categorize, generate embeddings
#  4. VECTORIZE - Store in PG Vector for semantic search
#  5. PUBLISH - Insert into product tables, update catalog
#═══════════════════════════════════════════════════════════════════════════════

VV="$HOME/vistaview_WORKING"
BACKEND="$VV/backend"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  📄 PART B: 5-STEP PDF EXTRACTION + MINIO + PRODUCTS"
echo "═══════════════════════════════════════════════════════════════════════════════"

mkdir -p "$BACKEND/extractors"
mkdir -p "$BACKEND/migrations"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 1: MinIO Upload Route
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📦 Creating MinIO upload routes..."

cat > "$BACKEND/minio_routes.cjs" << 'MINIOROUTES'
// MinIO Upload Routes
// Add to server.cjs

const Minio = require('minio');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// MinIO Client Configuration
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = 'vistaview-uploads';

// Ensure bucket exists
async function ensureBucket() {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`✅ MinIO bucket '${BUCKET_NAME}' created`);
        }
    } catch (err) {
        console.error('MinIO bucket error:', err);
    }
}
ensureBucket();

// Multer for file uploads
const upload = multer({ 
    dest: '/tmp/uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: UPLOAD TO MINIO
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/upload/minio', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { category, userType, userId } = req.body;
        const file = req.file;
        
        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const objectName = `${userType}/${userId || 'anonymous'}/${category}/${timestamp}_${safeName}`;

        // Upload to MinIO
        await minioClient.fPutObject(BUCKET_NAME, objectName, file.path, {
            'Content-Type': file.mimetype,
            'X-Original-Name': file.originalname,
            'X-Category': category,
            'X-User-Type': userType,
            'X-User-Id': userId || 'anonymous'
        });

        // Generate URL
        const url = `http://localhost:9000/${BUCKET_NAME}/${objectName}`;

        // Clean up temp file
        fs.unlinkSync(file.path);

        // Log upload
        await pool.query(
            `INSERT INTO file_uploads (user_id, user_type, category, file_name, minio_path, minio_url, file_size, mime_type, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [userId, userType, category, file.originalname, objectName, url, file.size, file.mimetype]
        );

        console.log(`✅ Uploaded to MinIO: ${objectName}`);

        res.json({
            success: true,
            url,
            objectName,
            fileName: file.originalname,
            size: file.size,
            mimeType: file.mimetype
        });

    } catch (err) {
        console.error('MinIO upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get file from MinIO
app.get('/api/files/:userType/:userId/:category/:fileName', async (req, res) => {
    try {
        const { userType, userId, category, fileName } = req.params;
        const objectName = `${userType}/${userId}/${category}/${fileName}`;
        
        const stream = await minioClient.getObject(BUCKET_NAME, objectName);
        stream.pipe(res);
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

console.log('✅ MinIO routes loaded');
MINIOROUTES

echo "  ✅ minio_routes.cjs"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 2: PDF Extraction Pipeline
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📄 Creating PDF extraction pipeline..."

cat > "$BACKEND/extractors/pdf_extractor.cjs" << 'PDFEXTRACTOR'
// PDF Product Extraction Pipeline
// 5-Step Process:
// 1. UPLOAD (handled by minio_routes)
// 2. EXTRACT - Parse PDF for text, tables, images
// 3. PROCESS - Identify products, prices, descriptions
// 4. VECTORIZE - Generate embeddings
// 5. PUBLISH - Insert into product tables

const pdfParse = require('pdf-parse');
const xlsx = require('xlsx');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2: EXTRACT - Parse PDF/Excel
// ═══════════════════════════════════════════════════════════════════════════════
async function extractFromPDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info
        };
    } catch (err) {
        console.error('PDF parse error:', err);
        return { text: '', numPages: 0, info: {} };
    }
}

async function extractFromExcel(buffer) {
    try {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const results = [];
        
        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            results.push({ sheetName, data });
        }
        
        return results;
    } catch (err) {
        console.error('Excel parse error:', err);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: PROCESS - Identify products from text
// ═══════════════════════════════════════════════════════════════════════════════
function extractProductsFromText(text) {
    const products = [];
    const lines = text.split('\n').filter(l => l.trim());
    
    // Patterns for product detection
    const pricePattern = /\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g;
    const skuPattern = /(?:SKU|Item|Part|Model)[:\s#]*([A-Z0-9-]+)/gi;
    const dimensionPattern = /(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(?:x|×)?\s*(\d+(?:\.\d+)?)?\s*(?:in|inch|"|ft|feet|cm|mm|m)?/gi;
    
    let currentProduct = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length < 3) continue;
        
        // Check if this looks like a product line
        const prices = trimmed.match(pricePattern);
        const skus = trimmed.match(skuPattern);
        const dimensions = trimmed.match(dimensionPattern);
        
        // Heuristic: If line has price, it might be a product
        if (prices && prices.length > 0) {
            const price = parseFloat(prices[0].replace(/[$,]/g, ''));
            
            // Extract product name (text before price)
            const priceIndex = trimmed.indexOf(prices[0]);
            let name = trimmed.substring(0, priceIndex).trim();
            
            // Clean up name
            name = name.replace(/[-–—:,]+$/, '').trim();
            
            if (name.length > 2 && name.length < 200) {
                currentProduct = {
                    name,
                    price,
                    sku: skus ? skus[0].replace(/SKU|Item|Part|Model|[:\s#]/gi, '') : null,
                    dimensions: dimensions ? dimensions[0] : null,
                    description: '',
                    rawLine: trimmed
                };
                products.push(currentProduct);
            }
        }
        // If no price but previous product exists, might be description
        else if (currentProduct && !prices && trimmed.length > 10) {
            currentProduct.description += ' ' + trimmed;
        }
        // Check if this is a header/category
        else if (trimmed.toUpperCase() === trimmed && trimmed.length < 50) {
            // This might be a category header
            currentProduct = null;
        }
    }
    
    // Clean up products
    return products.map(p => ({
        ...p,
        description: p.description.trim().substring(0, 500),
        name: p.name.substring(0, 200)
    })).filter(p => p.name && p.price > 0);
}

function extractProductsFromExcelData(excelData) {
    const products = [];
    
    for (const sheet of excelData) {
        for (const row of sheet.data) {
            // Try to identify columns
            const product = {
                name: null,
                price: null,
                sku: null,
                description: null,
                category: null
            };
            
            for (const [key, value] of Object.entries(row)) {
                const keyLower = key.toLowerCase();
                const strValue = String(value).trim();
                
                if (keyLower.includes('name') || keyLower.includes('product') || keyLower.includes('title') || keyLower.includes('item')) {
                    product.name = strValue;
                }
                else if (keyLower.includes('price') || keyLower.includes('cost') || keyLower.includes('amount')) {
                    product.price = parseFloat(strValue.replace(/[$,]/g, '')) || null;
                }
                else if (keyLower.includes('sku') || keyLower.includes('item') || keyLower.includes('part') || keyLower.includes('model')) {
                    product.sku = strValue;
                }
                else if (keyLower.includes('desc') || keyLower.includes('detail')) {
                    product.description = strValue.substring(0, 500);
                }
                else if (keyLower.includes('category') || keyLower.includes('type')) {
                    product.category = strValue;
                }
            }
            
            // If we couldn't identify columns, try first few columns
            if (!product.name && Object.values(row).length > 0) {
                const values = Object.values(row);
                product.name = String(values[0]).substring(0, 200);
                if (values.length > 1) {
                    const maybePrice = parseFloat(String(values[1]).replace(/[$,]/g, ''));
                    if (!isNaN(maybePrice)) product.price = maybePrice;
                }
            }
            
            if (product.name && product.name.length > 2) {
                products.push(product);
            }
        }
    }
    
    return products;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: VECTORIZE - Generate embeddings (placeholder for pgvector)
// ═══════════════════════════════════════════════════════════════════════════════
async function generateEmbedding(text) {
    // Placeholder: In production, use OpenAI embeddings or local model
    // For now, return a simple hash-based vector
    const hash = text.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    // Generate 384-dimensional pseudo-embedding
    const embedding = [];
    for (let i = 0; i < 384; i++) {
        embedding.push(Math.sin(hash * (i + 1)) * 0.5);
    }
    return embedding;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 5: PUBLISH - Insert into database
// ═══════════════════════════════════════════════════════════════════════════════
async function publishProducts(pool, products, metadata) {
    const published = [];
    
    for (const product of products) {
        try {
            // Generate embedding
            const embedding = await generateEmbedding(`${product.name} ${product.description || ''}`);
            
            const result = await pool.query(
                `INSERT INTO products (
                    vendor_id, name, description, price, sku, category,
                    dimensions, raw_data, embedding, source_file, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                RETURNING id`,
                [
                    metadata.userId,
                    product.name,
                    product.description || '',
                    product.price,
                    product.sku,
                    product.category || metadata.category,
                    product.dimensions,
                    JSON.stringify(product),
                    JSON.stringify(embedding),
                    metadata.fileName
                ]
            );
            
            published.push({ ...product, id: result.rows[0].id });
        } catch (err) {
            console.error('Failed to publish product:', product.name, err.message);
        }
    }
    
    return published;
}

module.exports = {
    extractFromPDF,
    extractFromExcel,
    extractProductsFromText,
    extractProductsFromExcelData,
    generateEmbedding,
    publishProducts
};
PDFEXTRACTOR

echo "  ✅ pdf_extractor.cjs"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Product Extraction API Route
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔌 Creating extraction API routes..."

cat > "$BACKEND/extraction_routes.cjs" << 'EXTRACTIONROUTES'
// Product Extraction Routes
// Add to server.cjs

const {
    extractFromPDF,
    extractFromExcel,
    extractProductsFromText,
    extractProductsFromExcelData,
    generateEmbedding,
    publishProducts
} = require('./extractors/pdf_extractor.cjs');

const axios = require('axios');

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTION ENDPOINT - 5 STEP PROCESS
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/extract-products', async (req, res) => {
    try {
        const { fileUrl, fileName, userType, userId } = req.body;
        
        console.log(`📄 Starting 5-step extraction for: ${fileName}`);
        
        // STEP 1: Already uploaded (file is in MinIO)
        console.log('Step 1/5: File already in MinIO ✓');
        
        // STEP 2: EXTRACT - Download and parse file
        console.log('Step 2/5: Extracting content...');
        
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        let products = [];
        const ext = fileName.toLowerCase().split('.').pop();
        
        if (ext === 'pdf') {
            const pdfData = await extractFromPDF(buffer);
            products = extractProductsFromText(pdfData.text);
            console.log(`  Extracted ${products.length} products from PDF`);
        }
        else if (['xlsx', 'xls', 'csv'].includes(ext)) {
            const excelData = await extractFromExcel(buffer);
            products = extractProductsFromExcelData(excelData);
            console.log(`  Extracted ${products.length} products from Excel/CSV`);
        }
        
        // STEP 3: PROCESS - Clean and categorize
        console.log('Step 3/5: Processing products...');
        
        products = products.map((p, idx) => ({
            ...p,
            id: `temp-${idx}`,
            status: 'extracted',
            confidence: p.price ? 0.9 : 0.6
        }));
        
        // STEP 4: VECTORIZE - Generate embeddings
        console.log('Step 4/5: Generating embeddings...');
        
        for (const product of products) {
            product.embedding = await generateEmbedding(`${product.name} ${product.description || ''}`);
        }
        
        // STEP 5: PUBLISH - Save to database
        console.log('Step 5/5: Publishing to database...');
        
        const published = await publishProducts(pool, products, {
            userId,
            userType,
            fileName,
            category: 'catalog'
        });
        
        console.log(`✅ Extraction complete: ${published.length} products published`);
        
        res.json({
            success: true,
            products: published,
            stats: {
                total: products.length,
                published: published.length,
                withPrices: products.filter(p => p.price).length,
                withSKUs: products.filter(p => p.sku).length
            }
        });
        
    } catch (err) {
        console.error('Extraction error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Vectorize any content
app.post('/api/vectorize', async (req, res) => {
    try {
        const { fileUrl, fileName, category, userType, userId, content } = req.body;
        
        let textContent = content;
        
        // If no content provided, download and extract
        if (!textContent && fileUrl) {
            const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            const ext = fileName.toLowerCase().split('.').pop();
            
            if (ext === 'pdf') {
                const pdfData = await extractFromPDF(buffer);
                textContent = pdfData.text;
            } else {
                textContent = buffer.toString('utf-8').substring(0, 10000);
            }
        }
        
        if (!textContent) {
            return res.json({ success: true, message: 'No content to vectorize' });
        }
        
        // Generate embedding
        const embedding = await generateEmbedding(textContent.substring(0, 5000));
        
        // Store in vector table
        await pool.query(
            `INSERT INTO document_vectors (user_id, user_type, file_name, category, content_preview, embedding, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [userId, userType, fileName, category, textContent.substring(0, 500), JSON.stringify(embedding)]
        );
        
        res.json({ success: true, message: 'Content vectorized' });
        
    } catch (err) {
        console.error('Vectorize error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Search products by semantic query
app.post('/api/products/search', async (req, res) => {
    try {
        const { query, vendorId, limit = 20 } = req.body;
        
        // Generate query embedding
        const queryEmbedding = await generateEmbedding(query);
        
        // Simple cosine similarity search (in production use pgvector)
        let sql = `
            SELECT *, 
                   (embedding::jsonb) as emb
            FROM products
            WHERE vendor_id = $1 OR $1 IS NULL
            ORDER BY created_at DESC
            LIMIT $2
        `;
        
        const result = await pool.query(sql, [vendorId, limit]);
        
        // Calculate similarity scores (simplified)
        const products = result.rows.map(row => {
            let similarity = 0.5; // Default
            try {
                const emb = JSON.parse(row.embedding || '[]');
                if (emb.length > 0) {
                    // Simple dot product
                    similarity = emb.reduce((sum, val, i) => sum + val * (queryEmbedding[i] || 0), 0);
                    similarity = Math.max(0, Math.min(1, (similarity + 1) / 2));
                }
            } catch (e) {}
            
            return { ...row, similarity, embedding: undefined };
        });
        
        // Sort by similarity
        products.sort((a, b) => b.similarity - a.similarity);
        
        res.json(products.slice(0, limit));
        
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: err.message });
    }
});

console.log('✅ Extraction routes loaded');
EXTRACTIONROUTES

echo "  ✅ extraction_routes.cjs"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 4: Database Migrations
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📊 Creating database migrations..."

cat > "$BACKEND/migrations/create_products_tables.sql" << 'PRODUCTSMIGRATION'
-- Products and Extraction Tables
-- Run: psql -U vistaview -d vistaview -f create_products_tables.sql

-- File uploads tracking
CREATE TABLE IF NOT EXISTS file_uploads (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    user_type VARCHAR(50),
    category VARCHAR(100),
    file_name VARCHAR(500),
    minio_path TEXT,
    minio_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(200),
    processed BOOLEAN DEFAULT false,
    extracted_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Products table with embeddings
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(100),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    sku VARCHAR(100),
    category VARCHAR(200),
    dimensions VARCHAR(200),
    image_url TEXT,
    thumbnail_url TEXT,
    raw_data JSONB DEFAULT '{}',
    embedding TEXT, -- JSON array (use vector type if pgvector installed)
    source_file VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Document vectors for semantic search
CREATE TABLE IF NOT EXISTS document_vectors (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    user_type VARCHAR(50),
    file_name VARCHAR(500),
    category VARCHAR(100),
    content_preview TEXT,
    embedding TEXT, -- JSON array
    created_at TIMESTAMP DEFAULT NOW()
);

-- Voice comments (from Part A)
CREATE TABLE IF NOT EXISTS voice_comments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    user_type VARCHAR(50),
    company_name VARCHAR(255),
    text TEXT NOT NULL,
    category VARCHAR(100),
    extracted_info JSONB DEFAULT '{}',
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_vectors_user ON document_vectors(user_id);

-- Full text search on products
CREATE INDEX IF NOT EXISTS idx_products_name_fts ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_desc_fts ON products USING gin(to_tsvector('english', description));

SELECT 'Products tables created successfully!' as status;
PRODUCTSMIGRATION

echo "  ✅ create_products_tables.sql"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 5: Install required npm packages
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📦 Creating package update script..."

cat > "$BACKEND/install_extraction_deps.sh" << 'INSTALLDEPS'
#!/bin/bash
# Install dependencies for PDF extraction

cd "$HOME/vistaview_WORKING/backend"

npm install pdf-parse xlsx minio multer axios --save

echo "✅ Dependencies installed"
INSTALLDEPS

chmod +x "$BACKEND/install_extraction_deps.sh"
echo "  ✅ install_extraction_deps.sh"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 6: Integration script
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔗 Creating integration script..."

cat > "$BACKEND/integrate_extraction.cjs" << 'INTEGRATE'
// Integration file - require this in server.cjs
// Add this line to server.cjs:
// require('./integrate_extraction.cjs')(app, pool);

module.exports = function(app, pool) {
    // Make pool available globally for routes
    global.pool = pool;
    
    // Load all route files
    require('./minio_routes.cjs');
    require('./extraction_routes.cjs');
    require('./voice_comments_routes.cjs');
    
    console.log('✅ All extraction routes integrated');
};
INTEGRATE

echo "  ✅ integrate_extraction.cjs"

#═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  ✅ PART B COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  📄 5-STEP EXTRACTION PIPELINE:"
echo ""
echo "     STEP 1: UPLOAD"
echo "        → POST /api/upload/minio"
echo "        → File stored in MinIO bucket"
echo "        → URL returned for processing"
echo ""
echo "     STEP 2: EXTRACT"
echo "        → POST /api/extract-products"
echo "        → PDF parsed with pdf-parse"
echo "        → Excel parsed with xlsx"
echo "        → Text extracted"
echo ""
echo "     STEP 3: PROCESS"
echo "        → Products identified from text"
echo "        → Prices extracted (\$XX.XX)"
echo "        → SKUs detected"
echo "        → Dimensions parsed"
echo ""
echo "     STEP 4: VECTORIZE"
echo "        → POST /api/vectorize"
echo "        → Embeddings generated"
echo "        → Stored in document_vectors"
echo ""
echo "     STEP 5: PUBLISH"
echo "        → Products inserted into 'products' table"
echo "        → Ready for catalog display"
echo ""
echo "  📦 FILES CREATED:"
echo "     • minio_routes.cjs - MinIO upload handling"
echo "     • pdf_extractor.cjs - Extraction logic"
echo "     • extraction_routes.cjs - API endpoints"
echo "     • create_products_tables.sql - Database schema"
echo ""
echo "  📋 NEXT STEPS:"
echo "     1. cd ~/vistaview_WORKING/backend"
echo "     2. ./install_extraction_deps.sh"
echo "     3. psql -U vistaview -d vistaview -f migrations/create_products_tables.sql"
echo "     4. Add to server.cjs: require('./integrate_extraction.cjs')(app, pool)"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
