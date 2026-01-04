// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - POSTGRESQL CONFIGURATION
// Database for vendors, products, vectors
// ═══════════════════════════════════════════════════════════════════════════════

let Pool;
try { Pool = require('pg').Pool; } catch (e) { console.log('[PostgreSQL] pg package not installed'); }

const PG_CONFIG = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'vistaview',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

let pool = null;

function getPool() {
    if (!Pool) {
        console.log('[PostgreSQL] pg package not available');
        return null;
    }
    
    if (!pool) {
        try {
            pool = new Pool(PG_CONFIG);
            pool.on('error', (err) => console.error('[PostgreSQL] Pool error:', err.message));
            console.log('[PostgreSQL] Pool initialized:', PG_CONFIG.host);
        } catch (error) {
            console.error('[PostgreSQL] Failed to initialize:', error.message);
            return null;
        }
    }
    return pool;
}

async function initTables() {
    const p = getPool();
    if (!p) return false;
    
    try {
        // Create vendors table
        await p.query(`
            CREATE TABLE IF NOT EXISTS vendors (
                id VARCHAR(50) PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                profile TEXT,
                beautified_profile TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        `);
        
        // Create products table
        await p.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                vendor_id VARCHAR(50) REFERENCES vendors(id),
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10,2),
                description TEXT,
                category VARCHAR(100),
                sku VARCHAR(100) UNIQUE,
                image_url TEXT,
                in_stock BOOLEAN DEFAULT true,
                ai_enhanced BOOLEAN DEFAULT false,
                tags TEXT[],
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        `);
        
        // Create vectors table for AI search
        await p.query(`
            CREATE TABLE IF NOT EXISTS product_vectors (
                id SERIAL PRIMARY KEY,
                product_sku VARCHAR(100) REFERENCES products(sku),
                keywords TEXT[],
                embedding VECTOR(384),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        console.log('[PostgreSQL] Tables initialized');
        return true;
    } catch (error) {
        console.error('[PostgreSQL] Table init error:', error.message);
        return false;
    }
}

async function query(text, params) {
    const p = getPool();
    if (!p) return null;
    
    try {
        const result = await p.query(text, params);
        return result;
    } catch (error) {
        console.error('[PostgreSQL] Query error:', error.message);
        return null;
    }
}

module.exports = { getPool, initTables, query, PG_CONFIG };
