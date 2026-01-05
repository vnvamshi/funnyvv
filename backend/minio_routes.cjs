// MinIO Upload Routes
// Add to server.cjs

const Minio = require('minio');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// MinIO Client Configuration
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = 'vistaview-uploads';

// Ensure bucket exists
async function ensureBucket() {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`✅ MinIO bucket '${BUCKET_NAME}' created`);
        }
    } catch (err) {
        console.error('MinIO bucket error:', err);
    }
}
ensureBucket();

// Multer for file uploads
const upload = multer({ 
    dest: '/tmp/uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: UPLOAD TO MINIO
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/upload/minio', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { category, userType, userId } = req.body;
        const file = req.file;
        
        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const objectName = `${userType}/${userId || 'anonymous'}/${category}/${timestamp}_${safeName}`;

        // Upload to MinIO
        await minioClient.fPutObject(BUCKET_NAME, objectName, file.path, {
            'Content-Type': file.mimetype,
            'X-Original-Name': file.originalname,
            'X-Category': category,
            'X-User-Type': userType,
            'X-User-Id': userId || 'anonymous'
        });

        // Generate URL
        const url = `http://localhost:9000/${BUCKET_NAME}/${objectName}`;

        // Clean up temp file
        fs.unlinkSync(file.path);

        // Log upload
        await pool.query(
            `INSERT INTO file_uploads (user_id, user_type, category, file_name, minio_path, minio_url, file_size, mime_type, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [userId, userType, category, file.originalname, objectName, url, file.size, file.mimetype]
        );

        console.log(`✅ Uploaded to MinIO: ${objectName}`);

        res.json({
            success: true,
            url,
            objectName,
            fileName: file.originalname,
            size: file.size,
            mimeType: file.mimetype
        });

    } catch (err) {
        console.error('MinIO upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get file from MinIO
app.get('/api/files/:userType/:userId/:category/:fileName', async (req, res) => {
    try {
        const { userType, userId, category, fileName } = req.params;
        const objectName = `${userType}/${userId}/${category}/${fileName}`;
        
        const stream = await minioClient.getObject(BUCKET_NAME, objectName);
        stream.pipe(res);
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

console.log('✅ MinIO routes loaded');
