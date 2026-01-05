// Product Chat Routes
// Talk to individual products

// Chat with a specific product
app.post('/api/product-chat', async (req, res) => {
    try {
        const { productId, product, question } = req.body;
        
        // In production: Call LLM with product context
        // For now: Generate contextual answer
        
        const q = question.toLowerCase();
        let answer = '';
        
        if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
            answer = product.price 
                ? `${product.name} is priced at $${product.price.toFixed(2)}.`
                : `Price information is not available. Please contact the vendor.`;
        }
        else if (q.includes('dimension') || q.includes('size')) {
            answer = product.dimensions
                ? `The dimensions are ${product.dimensions}.`
                : `Dimensions not specified. Please check specifications.`;
        }
        else if (q.includes('sku') || q.includes('part') || q.includes('model')) {
            answer = product.sku
                ? `The SKU is ${product.sku}.`
                : `SKU not available.`;
        }
        else if (q.includes('description') || q.includes('about') || q.includes('tell')) {
            answer = product.description || `${product.name} is a quality product in our catalog.`;
        }
        else if (q.includes('category') || q.includes('type')) {
            answer = product.category
                ? `This is in the ${product.category} category.`
                : `Category not specified.`;
        }
        else if (q.includes('available') || q.includes('stock') || q.includes('inventory')) {
            answer = `${product.name} is available. Contact vendor for stock levels.`;
        }
        else {
            answer = `${product.name}${product.price ? ` at $${product.price.toFixed(2)}` : ''}. I can tell you about price, dimensions, SKU, or give you more details. What would you like to know?`;
        }
        
        res.json({ answer, productId });
        
    } catch (err) {
        console.error('Product chat error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE status = $1 ORDER BY created_at DESC LIMIT 100',
            ['active']
        );
        res.json(result.rows);
    } catch (err) {
        // Return demo data if table doesn't exist
        res.json([
            { id: 1, name: 'Premium Hardwood Flooring', price: 8.99, category: 'Flooring', sku: 'HWF-001' },
            { id: 2, name: 'Ceramic Wall Tiles', price: 4.50, category: 'Tiles', sku: 'CWT-002' },
            { id: 3, name: 'LED Smart Bulbs', price: 29.99, category: 'Lighting', sku: 'LSB-003' },
        ]);
    }
});

console.log('✅ Product chat routes loaded');
