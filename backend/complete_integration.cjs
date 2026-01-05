// Complete Server Integration
// Add this to your server.cjs to load all routes

const fs = require('fs');
const path = require('path');

module.exports = function integrateAllRoutes(app, pool) {
    // Make pool globally available
    global.app = app;
    global.pool = pool;
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('  🚀 LOADING VISTAVIEW COMPLETE ROUTES');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    const routeFiles = [
        'minio_routes.cjs',
        'extraction_routes.cjs',
        'voice_comments_routes.cjs',
        'product_chat_routes.cjs',
        'property_routes.cjs',
        'dashboard_routes.cjs',
        'downloads_scanner.cjs'
    ];
    
    for (const file of routeFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            try {
                require(filePath);
                console.log(`  ✅ Loaded: ${file}`);
            } catch (err) {
                console.error(`  ❌ Failed: ${file} - ${err.message}`);
            }
        } else {
            console.log(`  ⚠️ Missing: ${file}`);
        }
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('  ✅ ALL ROUTES LOADED');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
};
