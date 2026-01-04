/**
 * VISTAVIEW REAL PDF PARSER
 * Extracts products, prices, specs from vendor catalogs
 */

const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ database: 'vistaview', host: 'localhost', port: 5432 });

// Product extraction patterns
const PATTERNS = {
    price: /\$[\d,]+\.?\d*|\d+\.\d{2}\s*(USD|INR|EUR|GBP)|₹[\d,]+/g,
    sku: /(?:SKU|Item\s*#|Product\s*Code|Part\s*#|Model)\s*:?\s*([A-Z0-9\-]+)/gi,
    dimensions: /(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*(?:[xX×]\s*(\d+(?:\.\d+)?))?\s*(mm|cm|m|in|inches|ft|feet)?/g,
    weight: /(\d+(?:\.\d+)?)\s*(kg|g|lb|lbs|oz|pounds)/gi,
    materials: /\b(wood|oak|maple|pine|walnut|teak|bamboo|metal|steel|aluminum|brass|copper|iron|chrome|stainless|plastic|acrylic|glass|tempered|ceramic|porcelain|marble|granite|quartz|concrete|leather|fabric|cotton|linen|velvet|polyester|vinyl|rubber|silicone)\b/gi,
    colors: /\b(white|black|gray|grey|brown|beige|tan|cream|ivory|red|blue|green|yellow|orange|purple|pink|gold|silver|bronze|copper|navy|teal|coral|turquoise|maroon|burgundy|olive|charcoal)\b/gi,
    categories: /\b(faucet|sink|toilet|shower|bathtub|vanity|cabinet|countertop|flooring|tile|lighting|fixture|door|window|hardware|handle|knob|hinge|appliance|refrigerator|oven|dishwasher|washer|dryer|furniture|sofa|chair|table|desk|bed|mattress|paint|wallpaper|carpet|rug)\b/gi
};

/**
 * Parse a PDF file and extract products
 */
async function parsePDF(filePath, uploadedBy = { type: 'vendor', id: 'unknown' }) {
    console.log(`[PDF] Parsing: ${filePath}`);
    
    // Create job record
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);
    
    const job = await pool.query(`
        INSERT INTO pdf_processing_jobs 
        (original_filename, file_path, file_size_bytes, uploaded_by_type, uploaded_by_id, status, processing_started)
        VALUES ($1, $2, $3, $4, $5, 'processing', NOW())
        RETURNING id
    `, [fileName, filePath, stats.size, uploadedBy.type, uploadedBy.id]);
    const jobId = job.rows[0].id;
    
    try {
        // Read and parse PDF
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        
        console.log(`[PDF] Pages: ${pdfData.numpages}, Characters: ${pdfData.text.length}`);
        
        // Update page count
        await pool.query(`UPDATE pdf_processing_jobs SET page_count = $1 WHERE id = $2`, [pdfData.numpages, jobId]);
        
        // Extract products from text
        const products = extractProducts(pdfData.text, pdfData.numpages);
        
        console.log(`[PDF] Found ${products.length} potential products`);
        
        // Save products to database
        const productIds = [];
        for (const product of products) {
            const result = await pool.query(`
                INSERT INTO extracted_products 
                (source_job_id, source_page, product_name, product_description, product_category, product_sku, price, currency, unit, specifications, materials, colors, needs_review)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
                RETURNING id
            `, [
                jobId,
                product.page,
                product.name,
                product.description,
                product.category,
                product.sku,
                product.price,
                product.currency || 'USD',
                product.unit,
                JSON.stringify(product.specifications),
                product.materials,
                product.colors
            ]);
            productIds.push(result.rows[0].id);
        }
        
        // Update job with results
        await pool.query(`
            UPDATE pdf_processing_jobs SET 
                status = 'completed',
                extracted_text = $1,
                products_created = $2,
                product_ids = $3,
                processing_completed = NOW()
            WHERE id = $4
        `, [pdfData.text.substring(0, 100000), productIds.length, productIds, jobId]);
        
        // Update stats
        await pool.query(`
            UPDATE learning_stats SET 
                pdfs_processed = COALESCE(pdfs_processed, 0) + 1,
                products_extracted = COALESCE(products_extracted, 0) + $1,
                products_cataloged = COALESCE(products_cataloged, 0) + $1,
                updated_at = NOW()
            WHERE stat_date = CURRENT_DATE
        `, [productIds.length]);
        
        return {
            success: true,
            jobId,
            fileName,
            pages: pdfData.numpages,
            productsFound: productIds.length,
            productIds
        };
        
    } catch (error) {
        console.error(`[PDF] Error:`, error.message);
        
        await pool.query(`
            UPDATE pdf_processing_jobs SET status = 'failed', error_message = $1, processing_completed = NOW()
            WHERE id = $2
        `, [error.message, jobId]);
        
        return { success: false, jobId, error: error.message };
    }
}

/**
 * Extract products from PDF text
 */
function extractProducts(text, totalPages) {
    const products = [];
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    let currentProduct = null;
    let currentPage = 1;
    const linesPerPage = Math.ceil(lines.length / totalPages);
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const page = Math.ceil((i + 1) / linesPerPage);
        
        // Skip very short lines or headers
        if (line.length < 5) continue;
        
        // Detect potential product line (has price or SKU)
        const hasPrice = PATTERNS.price.test(line);
        PATTERNS.price.lastIndex = 0; // Reset regex
        const hasSku = PATTERNS.sku.test(line);
        PATTERNS.sku.lastIndex = 0;
        
        if (hasPrice || hasSku) {
            // Extract price
            const priceMatch = line.match(PATTERNS.price);
            let price = null, currency = 'USD';
            if (priceMatch) {
                const priceStr = priceMatch[0];
                if (priceStr.includes('₹')) currency = 'INR';
                else if (priceStr.includes('EUR')) currency = 'EUR';
                else if (priceStr.includes('GBP')) currency = 'GBP';
                price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
            }
            
            // Extract SKU
            PATTERNS.sku.lastIndex = 0;
            const skuMatch = PATTERNS.sku.exec(line);
            const sku = skuMatch ? skuMatch[1] : `VV-${Date.now()}-${products.length}`;
            
            // Extract dimensions
            const dimMatches = [...line.matchAll(PATTERNS.dimensions)];
            const dimensions = dimMatches.map(m => ({
                width: parseFloat(m[1]),
                height: parseFloat(m[2]),
                depth: m[3] ? parseFloat(m[3]) : null,
                unit: m[4] || 'in'
            }));
            
            // Extract materials
            const materials = [...new Set((line.match(PATTERNS.materials) || []).map(m => m.toLowerCase()))];
            
            // Extract colors
            const colors = [...new Set((line.match(PATTERNS.colors) || []).map(c => c.toLowerCase()))];
            
            // Extract category
            const categoryMatch = line.match(PATTERNS.categories);
            const category = categoryMatch ? categoryMatch[0].toLowerCase() : 'general';
            
            // Build product name (first part of line before price/sku)
            let name = line.split(/\$|SKU|Item/i)[0].trim();
            if (name.length < 3) name = `Product ${sku}`;
            if (name.length > 200) name = name.substring(0, 200);
            
            products.push({
                name,
                description: line.substring(0, 500),
                category,
                sku,
                price,
                currency,
                unit: dimensions.length > 0 ? 'each' : null,
                specifications: { dimensions, raw_line: line.substring(0, 200) },
                materials,
                colors,
                page
            });
        }
    }
    
    return products.slice(0, 500); // Limit products per PDF
}

/**
 * Process uploaded file (for multer integration)
 */
async function processUpload(file, uploadedBy) {
    return parsePDF(file.path, uploadedBy);
}

/**
 * Get processing status
 */
async function getJobStatus(jobId) {
    const result = await pool.query(`SELECT * FROM pdf_processing_jobs WHERE id = $1`, [jobId]);
    return result.rows[0] || null;
}

module.exports = {
    parsePDF,
    processUpload,
    getJobStatus,
    extractProducts
};

// CLI execution
if (require.main === module) {
    const filePath = process.argv[2];
    if (!filePath) {
        console.log('Usage: node real-pdf.cjs <path-to-pdf>');
        process.exit(1);
    }
    
    parsePDF(filePath).then(result => {
        console.log('Result:', JSON.stringify(result, null, 2));
        process.exit(0);
    }).catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}
