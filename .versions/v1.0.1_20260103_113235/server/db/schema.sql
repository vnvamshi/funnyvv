-- ============================================================================
-- VISTAVIEW COMPLETE DATABASE SCHEMA
-- 50+ tables for full agentic AI platform
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ACCOUNTS & AUTH
-- ============================================================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('vendor', 'builder', 'agent', 'investor', 'buyer')),
    legal_name VARCHAR(255) NOT NULL,
    country VARCHAR(50) DEFAULT 'US',
    tax_id VARCHAR(50), -- EIN for US
    gstin VARCHAR(50), -- For India
    email VARCHAR(255),
    phone VARCHAR(20),
    stripe_account_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id),
    phone VARCHAR(20),
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- AI MEMORY & LEARNING
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_type VARCHAR(50) NOT NULL,
    user_id UUID,
    context TEXT NOT NULL,
    learned_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    embedding vector(1536),
    accessed_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_type VARCHAR(50) NOT NULL,
    source_url TEXT,
    data_collected JSONB,
    insights_generated JSONB,
    patterns_detected JSONB,
    items_processed INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running'
);

CREATE TABLE IF NOT EXISTS training_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_date DATE DEFAULT CURRENT_DATE UNIQUE,
    total_interactions INTEGER DEFAULT 0,
    successful_responses INTEGER DEFAULT 0,
    learned_patterns INTEGER DEFAULT 0,
    accuracy_score DECIMAL(5,2),
    response_time_avg_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS & RAG
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id),
    url TEXT,
    sha256 VARCHAR(64),
    title VARCHAR(500),
    doc_type VARCHAR(50),
    license VARCHAR(100),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id),
    ord INTEGER,
    text TEXT NOT NULL,
    section_path TEXT,
    tokens INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id UUID REFERENCES chunks(id),
    model VARCHAR(50),
    dim INTEGER DEFAULT 1536,
    vector vector(1536),
    index_version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- VENDORS & PRODUCTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id),
    company_name VARCHAR(255) NOT NULL,
    ein VARCHAR(20),
    contact_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    category VARCHAR(100),
    w9_document_url TEXT,
    stripe_onboarding_complete BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending',
    onboarded_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS vendor_catalogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id),
    catalog_name VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(50),
    minio_bucket VARCHAR(100),
    minio_object_key TEXT,
    status VARCHAR(20) DEFAULT 'uploaded',
    uploaded_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    item_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id),
    catalog_id UUID REFERENCES vendor_catalogs(id),
    sku VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    body TEXT,
    price DECIMAL(12,2),
    compare_at_price DECIMAL(12,2),
    cost DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    brand VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags JSONB,
    options JSONB,
    variants JSONB,
    warranty_json JSONB,
    shipping_json JSONB,
    dimensions JSONB,
    weight DECIMAL(10,2),
    ai_description TEXT,
    ai_tags JSONB,
    embedding vector(1536),
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    image_id UUID,
    url_raw TEXT,
    url_upscaled TEXT,
    url_thumbnail TEXT,
    role VARCHAR(20) DEFAULT 'gallery',
    ord INTEGER DEFAULT 0,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- IMAGES & MEDIA
-- ============================================================================
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID,
    path_raw TEXT,
    path_upscaled TEXT,
    path_thumbnail TEXT,
    minio_bucket VARCHAR(100),
    width INTEGER,
    height INTEGER,
    format VARCHAR(20),
    size_bytes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- BUILDERS & PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS builders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id),
    company_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(50),
    ein VARCHAR(20),
    gstin VARCHAR(50),
    contact_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    specialties JSONB,
    service_areas JSONB,
    rating DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    builder_id UUID REFERENCES builders(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'US',
    project_type VARCHAR(50),
    total_floors INTEGER,
    total_units INTEGER,
    amenities JSONB,
    meta_json JSONB,
    status VARCHAR(20) DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    floor_number INTEGER NOT NULL,
    name VARCHAR(100),
    glb_key TEXT,
    floor_plan_url TEXT,
    unit_count INTEGER,
    meta_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    floor_id UUID REFERENCES floors(id),
    unit_no VARCHAR(20),
    unit_type VARCHAR(50),
    beds INTEGER,
    baths DECIMAL(3,1),
    sqft INTEGER,
    price DECIMAL(15,2),
    price_per_sqft DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'available',
    features JSONB,
    media_json JSONB,
    glb_key TEXT,
    virtual_tour_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- REAL ESTATE & PROPERTIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mls_number VARCHAR(50),
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    price DECIMAL(15,2),
    bedrooms INTEGER,
    bathrooms DECIMAL(4,2),
    sqft INTEGER,
    lot_size DECIMAL(10,2),
    year_built INTEGER,
    property_type VARCHAR(50),
    listing_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    ai_summary TEXT,
    features JSONB,
    images JSONB,
    virtual_tour_url TEXT,
    glb_key TEXT,
    embedding vector(1536),
    agent_id UUID,
    listed_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_comparables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    comparable_address TEXT,
    comparable_price DECIMAL(15,2),
    sale_date DATE,
    similarity_score DECIMAL(3,2),
    price_per_sqft DECIMAL(10,2),
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- MARKET COMPARISON & PRICING
-- ============================================================================
CREATE TABLE IF NOT EXISTS market_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100) NOT NULL,
    source_url TEXT,
    category VARCHAR(100),
    scrape_frequency VARCHAR(20) DEFAULT 'daily',
    last_scraped TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    config JSONB
);

CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES market_sources(id),
    product_name VARCHAR(500),
    product_sku VARCHAR(100),
    category VARCHAR(100),
    current_price DECIMAL(12,2),
    original_price DECIMAL(12,2),
    discount_percent DECIMAL(5,2),
    availability VARCHAR(50),
    rating DECIMAL(3,2),
    review_count INTEGER,
    url TEXT,
    image_url TEXT,
    scraped_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_price_id UUID REFERENCES market_prices(id),
    price DECIMAL(12,2),
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitive_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    competitor_source VARCHAR(100),
    competitor_name VARCHAR(500),
    competitor_price DECIMAL(12,2),
    our_price DECIMAL(12,2),
    price_difference DECIMAL(12,2),
    price_position VARCHAR(20),
    recommendation TEXT,
    analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100),
    location VARCHAR(100),
    trend_date DATE,
    median_price DECIMAL(15,2),
    avg_price DECIMAL(15,2),
    inventory_count INTEGER,
    days_on_market_avg INTEGER,
    price_change_yoy DECIMAL(5,2),
    forecast JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- AI SUMMARIES & GENERATED CONTENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    summary_type VARCHAR(50),
    summary_text TEXT NOT NULL,
    key_points JSONB,
    sentiment VARCHAR(20),
    confidence DECIMAL(3,2),
    embedding vector(1536),
    model_version VARCHAR(50),
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255),
    page_type VARCHAR(50),
    spec_json JSONB,
    content JSONB,
    status VARCHAR(20) DEFAULT 'draft',
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- ============================================================================
-- SERVICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    description TEXT,
    spec_json JSONB,
    pricing JSONB,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CAMPAIGNS & PROMOTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id),
    name VARCHAR(255),
    campaign_type VARCHAR(50),
    discount_percent DECIMAL(5,2),
    discount_amount DECIMAL(12,2),
    promo_code VARCHAR(50),
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    target_audience JSONB,
    assets_json JSONB,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INTERACTIONS & ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_token VARCHAR(255),
    device_info JSONB,
    location JSONB,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    page_views INTEGER DEFAULT 0,
    interactions INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS interaction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES user_sessions(id),
    event_type VARCHAR(50) NOT NULL,
    page_url TEXT,
    element_id VARCHAR(100),
    payload_json JSONB,
    latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID,
    user_id UUID,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    intent VARCHAR(100),
    entities JSONB,
    sentiment VARCHAR(20),
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID,
    command_text TEXT NOT NULL,
    intent VARCHAR(100),
    confidence DECIMAL(3,2),
    action_taken VARCHAR(100),
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analytics_date DATE DEFAULT CURRENT_DATE UNIQUE,
    total_users INTEGER DEFAULT 0,
    active_sessions INTEGER DEFAULT 0,
    ai_queries INTEGER DEFAULT 0,
    voice_commands INTEGER DEFAULT 0,
    catalog_uploads INTEGER DEFAULT 0,
    products_created INTEGER DEFAULT 0,
    vendors_onboarded INTEGER DEFAULT 0,
    builders_onboarded INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    avg_session_duration_sec INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PROCESSING JOBS & QUEUES
-- ============================================================================
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    input_data JSONB,
    output_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scrape_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES market_sources(id),
    job_type VARCHAR(50),
    target_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    items_found INTEGER DEFAULT 0,
    items_saved INTEGER DEFAULT 0,
    errors JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SEARCH & VECTOR INDEXES
-- ============================================================================
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    query_text TEXT NOT NULL,
    query_embedding vector(1536),
    search_type VARCHAR(50),
    results_count INTEGER,
    top_result_id UUID,
    top_result_score DECIMAL(5,4),
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS semantic_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash VARCHAR(64) NOT NULL,
    query_embedding vector(1536),
    cached_response JSONB,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- ============================================================================
-- NOTIFICATIONS & ALERTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    notification_type VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    item_type VARCHAR(50),
    item_id UUID,
    target_price DECIMAL(12,2),
    alert_type VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_memory_type ON ai_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_ai_memory_embedding ON ai_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_properties_embedding ON properties USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_market_prices_source ON market_prices(source_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_status ON learning_sessions(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);

-- ============================================================================
-- SEED DATA
-- ============================================================================
INSERT INTO market_sources (source_name, source_url, category, scrape_frequency) VALUES
    ('zillow', 'https://www.zillow.com', 'real_estate', 'daily'),
    ('redfin', 'https://www.redfin.com', 'real_estate', 'daily'),
    ('realtor', 'https://www.realtor.com', 'real_estate', 'daily'),
    ('ikea', 'https://www.ikea.com', 'furniture', 'weekly'),
    ('wayfair', 'https://www.wayfair.com', 'home_goods', 'daily'),
    ('homedepot', 'https://www.homedepot.com', 'building_materials', 'daily'),
    ('lowes', 'https://www.lowes.com', 'building_materials', 'daily'),
    ('amazon', 'https://www.amazon.com', 'general', 'hourly')
ON CONFLICT DO NOTHING;

INSERT INTO services (slug, title, summary, enabled) VALUES
    ('logistics', 'Logistics & Delivery', 'Delivery, installation, and returns', true),
    ('3d-staging', '3D Staging', '2D to 3D conversion, GLB, Unreal walkthroughs', true),
    ('warranty', 'Warranty Programs', 'Extended warranty and protection plans', true),
    ('financing', 'Financing Options', 'BNPL, escrow, and payment plans', true),
    ('vendor-onboarding', 'Vendor Onboarding', 'Fast vendor registration and catalog upload', true),
    ('builder-onboarding', 'Builder Onboarding', 'Builder registration and project setup', true)
ON CONFLICT DO NOTHING;

INSERT INTO training_stats (stat_date, total_interactions, learned_patterns, accuracy_score)
VALUES (CURRENT_DATE, 0, 0, 85.00)
ON CONFLICT DO NOTHING;
