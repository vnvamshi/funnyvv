// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - MINIO CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

let Minio;
try { Minio = require('minio'); } catch(e) { console.log('[MinIO] Not installed'); }

const config = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
};

let client = null;

function getClient() {
  if (!Minio) return null;
  if (!client) {
    try {
      client = new Minio.Client(config);
      console.log('[MinIO] Connected to', config.endPoint);
    } catch(e) {
      console.log('[MinIO] Connection failed:', e.message);
      return null;
    }
  }
  return client;
}

async function uploadImage(bucket, name, buffer) {
  const c = getClient();
  if (!c) return null;
  
  try {
    const exists = await c.bucketExists(bucket);
    if (!exists) await c.makeBucket(bucket);
    await c.putObject(bucket, name, buffer);
    return `http://${config.endPoint}:${config.port}/${bucket}/${name}`;
  } catch(e) {
    console.log('[MinIO] Upload failed:', e.message);
    return null;
  }
}

module.exports = { getClient, uploadImage, config };
