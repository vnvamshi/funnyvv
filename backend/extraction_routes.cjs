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
