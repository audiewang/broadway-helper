-- Broadway Helper Database Schema
-- Create tables for the community-driven Broadway ticket search platform

-- Create shows table
CREATE TABLE IF NOT EXISTS shows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    theater VARCHAR(255) NOT NULL,
    fun_fact TEXT,
    newbie_tip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_shows_slug ON shows(slug);

-- Create listings table for ticket availability
CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL, -- e.g., 'TKTS', 'Theatr', etc.
    date DATE NOT NULL,
    time TIME NOT NULL,
    section VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    url TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_listing UNIQUE (show_id, source, date, time, section, price)
);

-- Create indexes for listings
CREATE INDEX IF NOT EXISTS idx_listings_show_id ON listings(show_id);
CREATE INDEX IF NOT EXISTS idx_listings_date ON listings(date);
CREATE INDEX IF NOT EXISTS idx_listings_last_seen ON listings(last_seen);

-- Create community_tips table
CREATE TABLE IF NOT EXISTS community_tips (
    id SERIAL PRIMARY KEY,
    show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    tip_type VARCHAR(50) NOT NULL, -- e.g., 'seating', 'timing', 'general'
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for community tips
CREATE INDEX IF NOT EXISTS idx_community_tips_show_id ON community_tips(show_id);
CREATE INDEX IF NOT EXISTS idx_community_tips_upvotes ON community_tips(upvotes DESC);

-- Create theaters table (for additional theater information)
CREATE TABLE IF NOT EXISTS theaters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create theater_sections table
CREATE TABLE IF NOT EXISTS theater_sections (
    id SERIAL PRIMARY KEY,
    theater_id INTEGER NOT NULL REFERENCES theaters(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    price_range VARCHAR(100),
    tip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_theater_section UNIQUE (theater_id, section_name)
);

-- Create index for theater sections
CREATE INDEX IF NOT EXISTS idx_theater_sections_theater_id ON theater_sections(theater_id);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_tips_updated_at BEFORE UPDATE ON community_tips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();