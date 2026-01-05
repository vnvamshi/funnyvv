-- Products and Extraction Tables
-- Run: psql -U vistaview -d vistaview -f create_products_tables.sql

-- File uploads tracking
CREATE TABLE IF NOT EXISTS file_uploads (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    user_type VARCHAR(50),
    category VARCHAR(100),
    file_name VARCHAR(500),
    minio_path TEXT,
    minio_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(200),
    processed BOOLEAN DEFAULT false,
    extracted_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Products table with embeddings
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(100),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    sku VARCHAR(100),
    category VARCHAR(200),
    dimensions VARCHAR(200),
    image_url TEXT,
    thumbnail_url TEXT,
    raw_data JSONB DEFAULT '{}',
    embedding TEXT, -- JSON array (use vector type if pgvector installed)
    source_file VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Document vectors for semantic search
CREATE TABLE IF NOT EXISTS document_vectors (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    user_type VARCHAR(50),
    file_name VARCHAR(500),
    category VARCHAR(100),
    content_preview TEXT,
    embedding TEXT, -- JSON array
    created_at TIMESTAMP DEFAULT NOW()
);

-- Voice comments (from Part A)
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_vectors_user ON document_vectors(user_id);

-- Full text search on products
CREATE INDEX IF NOT EXISTS idx_products_name_fts ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_desc_fts ON products USING gin(to_tsvector('english', description));

SELECT 'Products tables created successfully!' as status;
