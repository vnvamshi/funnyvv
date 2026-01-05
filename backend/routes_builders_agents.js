/**
 * Backend routes for Builders and Agents
 * Add these to your server.cjs
 */

// Builder routes
app.post('/api/builders', async (req, res) => {
    const { phone, profile, companyName } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO builders (phone, profile, company_name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [phone, profile, companyName]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        // Table might not exist, create it
        await pool.query(`
            CREATE TABLE IF NOT EXISTS builders (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                phone VARCHAR(20),
                profile TEXT,
                company_name VARCHAR(255),
                license_number VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        // Retry insert
        const result = await pool.query(
            'INSERT INTO builders (phone, profile, company_name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [phone, profile, companyName]
        );
        res.json({ success: true, id: result.rows[0].id });
    }
});

// Agent routes
app.post('/api/agents', async (req, res) => {
    const { phone, profile, companyName, licenseNumber, licenseState } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO agents (phone, profile, company_name, license_number, license_state, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
            [phone, profile, companyName, licenseNumber, licenseState]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        // Table might not exist, create it
        await pool.query(`
            CREATE TABLE IF NOT EXISTS agents (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                phone VARCHAR(20),
                profile TEXT,
                company_name VARCHAR(255),
                license_number VARCHAR(100),
                license_state VARCHAR(10),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        // Retry insert
        const result = await pool.query(
            'INSERT INTO agents (phone, profile, company_name, license_number, license_state, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
            [phone, profile, companyName, licenseNumber, licenseState]
        );
        res.json({ success: true, id: result.rows[0].id });
    }
});

// Universal file upload
app.post('/api/upload/file', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    const fileType = req.body.fileType || req.file.originalname.split('.').pop();
    
    res.json({
        success: true,
        filename: req.file.originalname,
        size: req.file.size,
        type: fileType,
        path: req.file.path
    });
});

// Spreadsheet upload (CSV, Excel)
app.post('/api/upload/spreadsheet', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    // Basic response - can be enhanced with xlsx parsing
    res.json({
        success: true,
        filename: req.file.originalname,
        size: req.file.size,
        products: [] // Would parse spreadsheet here
    });
});

// Image upload
app.post('/api/upload/image', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    res.json({
        success: true,
        filename: req.file.originalname,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
    });
});

// Document upload (Word, etc)
app.post('/api/upload/document', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    res.json({
        success: true,
        filename: req.file.originalname,
        size: req.file.size
    });
});
