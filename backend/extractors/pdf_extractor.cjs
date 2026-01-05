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
