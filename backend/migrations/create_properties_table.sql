-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    address VARCHAR(500),
    city VARCHAR(200),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    sqft INT,
    lot_size DECIMAL(10,2),
    year_built INT,
    property_type VARCHAR(100),
    listing_type VARCHAR(50) DEFAULT 'sale', -- sale, rent, project
    agent_id VARCHAR(100),
    builder_id VARCHAR(100),
    image_url TEXT,
    images JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    embedding TEXT,
    status VARCHAR(50) DEFAULT 'active',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_listing ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_builder ON properties(builder_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);

SELECT 'Properties table created!' as status;
