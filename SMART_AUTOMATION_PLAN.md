# Smart Automation Plan for Broadway Price Data

## Available Solutions

### 1. Browser Automation Services
These services handle anti-bot protection for us:

#### Browserless.io
- Headless Chrome as a service
- Handles Cloudflare, reCAPTCHA
- REST API: `https://chrome.browserless.io/content`
- Pricing: $50/month for 6,000 minutes

#### ScrapingBee
- Manages proxies and browsers
- JavaScript rendering
- API: `https://app.scrapingbee.com/api/v1/`
- Pricing: $49/month for 50k credits

#### Bright Data (formerly Luminati)
- Residential proxies + browser API
- Never gets blocked
- Most expensive but most reliable

### 2. API Solutions

#### SeatGeek Platform API
```javascript
// Real API available!
const response = await fetch('https://api.seatgeek.com/2/events', {
  headers: { 'Authorization': `Basic ${SEATGEEK_API_KEY}` },
  params: {
    'performers.slug': 'hamilton-broadway',
    'venue.city': 'new-york',
    'datetime_utc.gte': '2024-01-20'
  }
});
```

#### Ticketmaster Discovery API
```javascript
// Free tier available
const response = await fetch('https://app.ticketmaster.com/discovery/v2/events', {
  params: {
    apikey: TICKETMASTER_API_KEY,
    keyword: 'Hamilton',
    city: 'New York',
    classificationName: 'Broadway'
  }
});
```

### 3. MCP (Model Context Protocol) Tools

We could use MCP tools for:
- Web scraping with built-in proxy rotation
- Scheduled data collection
- API orchestration

### 4. GPT-4 with Function Calling

```javascript
// Use GPT-4 to extract structured data from HTML
const extractPrices = {
  name: "extract_ticket_prices",
  description: "Extract ticket prices from HTML",
  parameters: {
    type: "object",
    properties: {
      html: { type: "string" },
      showName: { type: "string" }
    }
  }
};

// GPT-4 can parse complex HTML and return structured data
```

## Recommended Architecture

### Phase 1: API-First Approach
1. **SeatGeek API** (Free tier)
   - Real-time prices
   - Includes fees
   - Historical data

2. **Ticketmaster API** (Free)
   - Official prices
   - Availability
   - Direct purchase links

### Phase 2: Smart Scraping
```javascript
// Use Browserless for sites without APIs
async function scrapeTelecharge(showName, date) {
  const response = await fetch('https://chrome.browserless.io/content', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BROWSERLESS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: `https://www.telecharge.com/broadway/${showName}`,
      waitFor: 5000,
      evaluate: `
        // Extract prices using browser context
        const prices = [];
        document.querySelectorAll('.price-element').forEach(el => {
          prices.push({
            section: el.querySelector('.section')?.textContent,
            price: parseFloat(el.querySelector('.price')?.textContent.replace('$', ''))
          });
        });
        prices;
      `
    })
  });
  
  return response.json();
}
```

### Phase 3: Intelligent Caching
- Cache prices for 1 hour
- Real-time checks for high-demand shows
- Historical tracking for pattern analysis

## Implementation Plan

### Step 1: Set up APIs (Today)
```bash
# Environment variables
SEATGEEK_CLIENT_ID=xxx
SEATGEEK_CLIENT_SECRET=xxx
TICKETMASTER_API_KEY=xxx
BROWSERLESS_API_KEY=xxx
```

### Step 2: Create API Service
```typescript
class TicketAPIService {
  async getSeatGeekPrices(show: string, date: string) {
    // Fetch from SeatGeek API
  }
  
  async getTicketmasterPrices(show: string, date: string) {
    // Fetch from Ticketmaster API
  }
  
  async getTelechargeprices(show: string, date: string) {
    // Use Browserless to scrape
  }
  
  async getAllPrices(show: string, date: string) {
    // Aggregate from all sources
    const [seatgeek, ticketmaster, telecharge] = await Promise.all([
      this.getSeatGeekPrices(show, date),
      this.getTicketmasterPrices(show, date),
      this.getTelechargeprices(show, date)
    ]);
    
    return this.mergePrices(seatgeek, ticketmaster, telecharge);
  }
}
```

### Step 3: Background Jobs
```typescript
// Run every hour
cron.schedule('0 * * * *', async () => {
  const shows = await getActiveShows();
  for (const show of shows) {
    await updatePrices(show);
  }
});
```

## Cost Analysis

### Option 1: APIs Only (Recommended)
- SeatGeek: FREE (with limits)
- Ticketmaster: FREE (500 calls/day)
- Total: $0/month

### Option 2: APIs + Smart Scraping
- APIs: FREE
- Browserless: $50/month
- Total: $50/month

### Option 3: Full Automation
- APIs: FREE
- Bright Data: $500/month
- GPT-4 API: $50/month
- Total: $550/month

## Why This Works

1. **SeatGeek has most Broadway data** already aggregated
2. **Ticketmaster has official prices** for many venues
3. **Browserless handles the hard sites** (Telecharge)
4. **No manual work required**
5. **Updates automatically**

## Next Steps

1. Sign up for SeatGeek API (immediate)
2. Get Ticketmaster API key (immediate)
3. Implement API integration (1 day)
4. Add Browserless for remaining sites (1 day)
5. Deploy with hourly updates (1 day)