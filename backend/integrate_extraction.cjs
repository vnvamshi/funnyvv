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
