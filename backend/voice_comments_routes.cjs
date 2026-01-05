// Voice Comments & Processing Routes
// Add these to your server.cjs

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE COMMENTS TABLE
// ═══════════════════════════════════════════════════════════════════════════════
/*
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

CREATE INDEX idx_voice_comments_user ON voice_comments(user_id);
*/

// Process voice comment - extract useful info
app.post('/api/process-voice-comment', async (req, res) => {
    try {
        const { text, userType, userId, companyName, category } = req.body;
        
        // Simple extraction logic (can be enhanced with LLM)
        const extracted = {
            products: [],
            prices: [],
            features: [],
            keywords: []
        };
        
        // Extract prices (e.g., "$50", "50 dollars", "fifty bucks")
        const priceMatches = text.match(/\$?\d+(?:\.\d{2})?(?:\s*(?:dollars|bucks))?/gi);
        if (priceMatches) {
            extracted.prices = priceMatches.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
        }
        
        // Extract potential product names (capitalized words or phrases)
        const productPatterns = [
            /(?:we (?:sell|offer|have)|our) ([^.]+)/gi,
            /([A-Z][a-z]+ (?:[A-Z][a-z]+ )*(?:flooring|tiles|cabinets|fixtures|appliances|materials))/gi
        ];
        
        for (const pattern of productPatterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) extracted.products.push({ name: match[1].trim() });
            }
        }
        
        // Extract features/keywords
        const featureWords = ['premium', 'luxury', 'affordable', 'durable', 'waterproof', 'eco-friendly', 'sustainable'];
        for (const word of featureWords) {
            if (text.toLowerCase().includes(word)) {
                extracted.features.push(word);
            }
        }
        
        // Save to database
        await pool.query(
            `INSERT INTO voice_comments (user_id, user_type, company_name, text, category, extracted_info, processed)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [userId, userType, companyName, text, category, JSON.stringify(extracted)]
        );
        
        res.json({ success: true, extracted });
    } catch (err) {
        console.error('Process voice comment error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Save all voice comments at once
app.post('/api/save-voice-comments', async (req, res) => {
    try {
        const { userId, userType, companyName, comments } = req.body;
        
        for (const comment of comments) {
            await pool.query(
                `INSERT INTO voice_comments (user_id, user_type, company_name, text, category, extracted_info, processed, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT DO NOTHING`,
                [userId, userType, companyName, comment.text, comment.category, 
                 JSON.stringify(comment.extractedInfo || {}), comment.processed, comment.timestamp]
            );
        }
        
        res.json({ success: true, saved: comments.length });
    } catch (err) {
        console.error('Save voice comments error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get voice comments for a user
app.get('/api/voice-comments/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM voice_comments WHERE user_id = $1 ORDER BY created_at DESC',
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

console.log('✅ Voice comments routes loaded');
