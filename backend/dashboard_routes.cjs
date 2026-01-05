// Dashboard Routes

// Get all dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const stats = {};
        
        // Count vendors
        try {
            const vendors = await pool.query('SELECT COUNT(*) as count FROM vendors');
            stats.vendors = parseInt(vendors.rows[0].count) || 0;
        } catch { stats.vendors = 0; }
        
        // Count builders
        try {
            const builders = await pool.query('SELECT COUNT(*) as count FROM builders');
            stats.builders = parseInt(builders.rows[0].count) || 0;
        } catch { stats.builders = 0; }
        
        // Count agents
        try {
            const agents = await pool.query('SELECT COUNT(*) as count FROM agents');
            stats.agents = parseInt(agents.rows[0].count) || 0;
        } catch { stats.agents = 0; }
        
        // Count products
        try {
            const products = await pool.query('SELECT COUNT(*) as count FROM products');
            stats.products = parseInt(products.rows[0].count) || 0;
        } catch { stats.products = 0; }
        
        // Count properties
        try {
            const properties = await pool.query('SELECT COUNT(*) as count FROM properties');
            stats.properties = parseInt(properties.rows[0].count) || 0;
        } catch { stats.properties = 0; }
        
        // Count uploads
        try {
            const uploads = await pool.query('SELECT COUNT(*) as count FROM file_uploads');
            stats.uploads = parseInt(uploads.rows[0].count) || 0;
        } catch { stats.uploads = 0; }
        
        // Count voice comments
        try {
            const comments = await pool.query('SELECT COUNT(*) as count FROM voice_comments');
            stats.voiceComments = parseInt(comments.rows[0].count) || 0;
        } catch { stats.voiceComments = 0; }
        
        // Recent uploads
        try {
            const recent = await pool.query('SELECT * FROM file_uploads ORDER BY created_at DESC LIMIT 5');
            stats.recentUploads = recent.rows;
        } catch { stats.recentUploads = []; }
        
        // Recent products
        try {
            const recentProducts = await pool.query('SELECT id, name, price, category FROM products ORDER BY created_at DESC LIMIT 5');
            stats.recentProducts = recentProducts.rows;
        } catch { stats.recentProducts = []; }
        
        // Recent properties
        try {
            const recentProps = await pool.query('SELECT id, title, price, listing_type FROM properties ORDER BY created_at DESC LIMIT 5');
            stats.recentProperties = recentProps.rows;
        } catch { stats.recentProperties = []; }
        
        res.json(stats);
        
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.json({
            vendors: 0,
            builders: 0,
            agents: 0,
            products: 0,
            properties: 0,
            uploads: 0,
            voiceComments: 0,
            recentUploads: [],
            recentProducts: [],
            recentProperties: []
        });
    }
});

console.log('✅ Dashboard routes loaded');
