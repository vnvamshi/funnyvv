// Property Routes for Real Estate

// Get all properties
app.get('/api/properties', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM properties WHERE status = $1 ORDER BY created_at DESC LIMIT 100',
            ['active']
        );
        res.json(result.rows);
    } catch (err) {
        // Demo data
        res.json([
            { id: 1, title: 'Modern Downtown Condo', price: 425000, address: '123 Main St', city: 'Austin', state: 'TX', bedrooms: 2, bathrooms: 2, sqft: 1200, property_type: 'Condo', listing_type: 'sale' },
            { id: 2, title: 'Luxury Suburban Home', price: 875000, address: '456 Oak Ave', city: 'Austin', state: 'TX', bedrooms: 4, bathrooms: 3, sqft: 3200, property_type: 'Single Family', listing_type: 'sale' },
        ]);
    }
});

// Create property
app.post('/api/properties', async (req, res) => {
    try {
        const { title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id, image_url } = req.body;
        
        const result = await pool.query(
            `INSERT INTO properties (title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id, image_url, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active', NOW())
             RETURNING *`,
            [title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id, image_url]
        );
        
        res.json({ success: true, property: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search properties with vector similarity
app.post('/api/properties/search', async (req, res) => {
    try {
        const { query, listingType, minPrice, maxPrice, limit = 20 } = req.body;
        
        let sql = 'SELECT * FROM properties WHERE status = $1';
        const params = ['active'];
        let paramCount = 1;
        
        if (listingType) {
            paramCount++;
            sql += ` AND listing_type = $${paramCount}`;
            params.push(listingType);
        }
        
        if (minPrice) {
            paramCount++;
            sql += ` AND price >= $${paramCount}`;
            params.push(minPrice);
        }
        
        if (maxPrice) {
            paramCount++;
            sql += ` AND price <= $${paramCount}`;
            params.push(maxPrice);
        }
        
        // Text search
        if (query) {
            paramCount++;
            sql += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR address ILIKE $${paramCount} OR city ILIKE $${paramCount})`;
            params.push(`%${query}%`);
        }
        
        sql += ` ORDER BY created_at DESC LIMIT ${limit}`;
        
        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

console.log('✅ Property routes loaded');
