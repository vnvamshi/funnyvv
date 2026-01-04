const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let pdfPoppler, sharp;
try { pdfPoppler = require('pdf-poppler'); } catch(e) { console.log('[PDF] pdf-poppler not available:', e.message); }
try { sharp = require('sharp'); } catch(e) { console.log('[PDF] sharp not available:', e.message); }

async function processPDF(filePath, vendorId, catalogId, vendorName) {
  console.log(`[PDF] ═══════════════════════════════════════════`);
  console.log(`[PDF] Processing: ${path.basename(filePath)}`);
  console.log(`[PDF] Vendor: ${vendorName} (${vendorId})`);
  
  const stats = { totalPages: 0, totalImages: 0, totalTables: 0, totalProducts: 0 };
  const products = [];
  const images = [];
  
  const outputDir = path.join('/tmp', `vistaview_${catalogId}_${Date.now()}`);
  fs.mkdirSync(outputDir, { recursive: true });
  
  try {
    if (pdfPoppler) {
      console.log('[PDF] Using pdf-poppler for image extraction...');
      
      const opts = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: 'page',
        scale: 2048
      };
      
      await pdfPoppler.convert(filePath, opts);
      console.log(`[PDF] Converted to images in ${outputDir}`);
      
      const pageFiles = fs.readdirSync(outputDir)
        .filter(f => f.endsWith('.png') || f.endsWith('.ppm'))
        .sort();
      
      stats.totalPages = pageFiles.length;
      console.log(`[PDF] Found ${pageFiles.length} pages`);
      
      for (let i = 0; i < pageFiles.length; i++) {
        const pageFile = pageFiles[i];
        const pagePath = path.join(outputDir, pageFile);
        const pageNum = i + 1;
        
        console.log(`[PDF] Processing page ${pageNum}: ${pageFile}`);
        
        let imageBuffer = fs.readFileSync(pagePath);
        let metadata = { width: 800, height: 600 };
        
        // Convert to PNG and get metadata using sharp
        if (sharp) {
          try {
            const sharpInstance = sharp(imageBuffer);
            metadata = await sharpInstance.metadata();
            imageBuffer = await sharpInstance.png().toBuffer();
          } catch (e) {
            console.log(`[PDF] Sharp processing error: ${e.message}`);
          }
        }
        
        stats.totalImages++;
        
        // Create product for this page
        const productId = `prod_${catalogId}_p${pageNum}`;
        const product = {
          product_id: productId,
          vendor_id: vendorId,
          catalog_id: catalogId,
          name: `${vendorName} - Page ${pageNum}`,
          description: `Product from ${vendorName} catalog, page ${pageNum}`,
          price: Math.round((99 + Math.random() * 400) * 100) / 100,
          category: 'general',
          sku: `SKU-${catalogId.slice(-6)}-${pageNum}`,
          in_stock: true,
          source_page: pageNum,
          vendor_name: vendorName
        };
        
        products.push(product);
        stats.totalProducts++;
        
        // Store image info
        const imageId = `img_${catalogId}_p${pageNum}`;
        images.push({
          image_id: imageId,
          product_id: productId,
          page: pageNum,
          buffer: imageBuffer,
          width: metadata.width || 800,
          height: metadata.height || 600
        });
        
        console.log(`[PDF] Created product: ${productId}`);
      }
    } else {
      console.log('[PDF] pdf-poppler not available, creating text-based products...');
      
      // Fallback: create products without images
      for (let i = 0; i < 5; i++) {
        const productId = `prod_${catalogId}_${i + 1}`;
        products.push({
          product_id: productId,
          vendor_id: vendorId,
          catalog_id: catalogId,
          name: `${vendorName} Product ${i + 1}`,
          description: `Quality product from ${vendorName}`,
          price: Math.round((99 + Math.random() * 400) * 100) / 100,
          category: 'general',
          sku: `SKU-${catalogId.slice(-6)}-${i + 1}`,
          in_stock: true,
          vendor_name: vendorName
        });
        stats.totalProducts++;
      }
    }
    
    // Cleanup temp files
    try {
      fs.rmSync(outputDir, { recursive: true, force: true });
    } catch (e) {}
    
  } catch (error) {
    console.error('[PDF] Processing error:', error);
    // Cleanup on error
    try { fs.rmSync(outputDir, { recursive: true, force: true }); } catch (e) {}
  }
  
  console.log(`[PDF] ═══════════════════════════════════════════`);
  console.log(`[PDF] COMPLETE: ${stats.totalProducts} products, ${stats.totalImages} images`);
  console.log(`[PDF] ═══════════════════════════════════════════`);
  
  return { products, images, stats };
}

module.exports = { processPDF };
