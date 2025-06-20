# Broadway Ticket Price Transparency Tool

## Core Value Proposition
Help users find the best tickets by showing ALL available options across official and resale sites, highlighting when resale sites are overcharging for tickets still available on official sites.

## Key Features for MVP

### 1. Show Selection Page
- List of current Tony nominees/winners still running
- Focus on hot shows where pricing varies wildly:
  - Maybe Happy Ending (closes Aug 31 - Darren Criss leaving)
  - Sunset Blvd. 
  - Oh, Mary!
  - Gypsy
  - Death Becomes Her
  - BOOP! The Musical

### 2. Search Parameters
Users must be able to specify:
- Date range (e.g., "before July 31")
- Section preferences (e.g., "Orchestra Center only")
- Max price willing to pay
- Number of tickets needed

### 3. Comprehensive Results Table
Show EVERY available option with:
- Date
- Source (Official vs Resale)
- Section & Row
- Exact seats (when available)
- Original price
- Total price with fees
- Price comparison indicator (e.g., "50% below average")
- Special callouts for anomalies (e.g., "Row B only $200!")

### 4. Key Insights Panel
Highlight:
- Best value tickets
- Price anomalies (like your Row B example)
- When official sites are cheaper than resale
- Dates with unusual availability

## Database Schema
```sql
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    theater VARCHAR(255),
    closing_date DATE,
    special_notes TEXT -- e.g., "Darren Criss until Aug 31"
);

CREATE TABLE ticket_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50), -- 'Telecharge', 'Theatr', 'StubHub', etc.
    is_official BOOLEAN,
    has_rewards BOOLEAN -- e.g., Audience Rewards
);

CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    show_id INTEGER REFERENCES shows(id),
    source_id INTEGER REFERENCES ticket_sources(id),
    performance_date DATE,
    performance_time TIME,
    section VARCHAR(100),
    row VARCHAR(10),
    seats VARCHAR(100), -- "1-2" or "5,7"
    quantity INTEGER,
    face_value DECIMAL(10, 2),
    service_fees DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    is_verified_available BOOLEAN DEFAULT true,
    listing_url TEXT,
    special_offer TEXT, -- e.g., "Audience Rewards eligible"
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_show_date_range ON listings(show_id, performance_date);
CREATE INDEX idx_price_anomalies ON listings(show_id, section, total_price);