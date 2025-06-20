# Real Broadway Data Integration Plan

## Overview
Replace mock data with real-time Broadway show information from multiple sources.

## Data Sources

### 1. Official Ticket Sites (Primary Sources)
- **Telecharge.com** - Official Broadway ticketing
- **Ticketmaster** - Another official source
- **Broadway.com** - Show information and tickets

### 2. Resale Markets
- **StubHub** - Major resale platform
- **Vivid Seats** - Resale marketplace
- **SeatGeek** - Resale with price predictions
- **Theatr** - Zero-fee resale platform

### 3. Discount/Rush Tickets
- **TodayTix** - Last-minute and rush tickets
- **BroadwayBox** - Discount codes and offers

### 4. Show Information
- **Playbill** - Cast, creative team, news
- **Broadway League** - Official industry data
- **IBDB (Internet Broadway Database)** - Historical data

## Implementation Strategy

### Phase 1: Data Collection Infrastructure
1. **Web Scraping Setup**
   - Use Playwright for JavaScript-heavy sites
   - Implement rate limiting and respectful crawling
   - Handle anti-bot measures

2. **API Integration**
   - Check for official APIs (most don't have public ones)
   - Use browser automation where needed
   - Implement caching to reduce requests

3. **Database Schema Updates**
   ```sql
   -- Real-time pricing data
   CREATE TABLE price_observations (
     id SERIAL PRIMARY KEY,
     show_id INTEGER REFERENCES shows(id),
     source VARCHAR(50),
     performance_date DATE,
     performance_time TIME,
     section VARCHAR(100),
     row VARCHAR(10),
     seat_numbers VARCHAR(50),
     price DECIMAL(10,2),
     fees DECIMAL(10,2),
     total_price DECIMAL(10,2),
     available_count INTEGER,
     observation_time TIMESTAMP DEFAULT NOW(),
     url TEXT
   );

   -- Price alerts for anomalies
   CREATE TABLE price_alerts (
     id SERIAL PRIMARY KEY,
     show_id INTEGER REFERENCES shows(id),
     alert_type VARCHAR(50), -- 'unusual_low', 'high_demand', etc
     details JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### Phase 2: Data Collection Scripts

1. **Show Scraper** (`scripts/scrapers/shows.ts`)
   - Fetch current running shows
   - Get basic show information
   - Update weekly

2. **Price Scraper** (`scripts/scrapers/prices.ts`)
   - Run every 4-6 hours
   - Collect prices from all sources
   - Store historical data

3. **Availability Checker** (`scripts/scrapers/availability.ts`)
   - Real-time seat availability
   - Track sellout patterns

### Phase 3: Data Processing

1. **Price Comparison Engine**
   - Compare prices across sources
   - Calculate markup percentages
   - Identify best deals

2. **Anomaly Detection**
   - Flag unusual pricing (too low/high)
   - Detect potential scams
   - Alert on great deals

3. **Recommendation System**
   - Best value seats
   - Similar shows
   - Price drop alerts

## Technical Implementation

### 1. Scraping Service Architecture
```typescript
// services/scraping/base-scraper.ts
abstract class BaseScraper {
  abstract source: string;
  abstract async fetchShowData(showName: string): Promise<ShowData>;
  abstract async fetchPrices(showId: string, date: string): Promise<PriceData[]>;
  
  protected async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    // Implement retry logic
  }
  
  protected async respectRateLimit(): Promise<void> {
    // Rate limiting implementation
  }
}
```

### 2. Caching Strategy
- Cache show information for 24 hours
- Cache prices for 1-2 hours
- Real-time availability checks

### 3. Background Jobs
- Use node-cron for scheduled scraping
- Queue system for processing
- Error handling and monitoring

## API Endpoints

### Public Endpoints
- `GET /api/shows` - List all shows with latest prices
- `GET /api/shows/:id/prices` - Price comparison for a show
- `GET /api/shows/:id/availability` - Real-time availability
- `GET /api/alerts` - Price drop alerts

### Admin Endpoints
- `POST /api/admin/scrape` - Trigger manual scrape
- `GET /api/admin/stats` - Scraping statistics
- `GET /api/admin/errors` - Error logs

## Legal Considerations

1. **Terms of Service**
   - Review each site's ToS
   - Implement respectful scraping
   - Consider reaching out for partnerships

2. **Rate Limiting**
   - Maximum 1 request per second per site
   - Randomize delays
   - Respect robots.txt

3. **Data Usage**
   - Display source attribution
   - Don't store personal data
   - Link back to original sites

## Development Roadmap

### Week 1
- [ ] Set up Playwright for scraping
- [ ] Create base scraper class
- [ ] Implement Telecharge scraper
- [ ] Set up database tables

### Week 2
- [ ] Add StubHub scraper
- [ ] Add TodayTix scraper
- [ ] Implement price comparison logic
- [ ] Create basic API endpoints

### Week 3
- [ ] Add more ticket sources
- [ ] Implement caching layer
- [ ] Set up background jobs
- [ ] Add error handling

### Week 4
- [ ] Build anomaly detection
- [ ] Create admin dashboard
- [ ] Add monitoring/alerts
- [ ] Performance optimization

## Testing Strategy

1. **Unit Tests**
   - Scraper parsing logic
   - Price comparison algorithms
   - Data validation

2. **Integration Tests**
   - API endpoint responses
   - Database operations
   - Cache behavior

3. **E2E Tests**
   - Full scraping flow
   - User journey
   - Error scenarios

## Monitoring

1. **Scraping Health**
   - Success/failure rates
   - Response times
   - Data quality metrics

2. **Application Metrics**
   - API response times
   - Cache hit rates
   - Error rates

3. **Business Metrics**
   - Popular shows
   - Price trends
   - User engagement