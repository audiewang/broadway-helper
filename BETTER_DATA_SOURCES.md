# Better Broadway Data Sources

## The Issue
Web scraping Telecharge and StubHub is challenging because:
1. They use JavaScript-heavy frontends
2. Anti-bot protection (Cloudflare, reCAPTCHA)
3. Dynamic content loading
4. Session/cookie requirements

## Alternative Approaches

### 1. Official APIs & Partners

#### SeatGeek API
- **URL**: https://platform.seatgeek.com/
- **Pros**: Official API, real-time pricing, includes fees
- **Cons**: Requires approval, API key needed
- **Best for**: Comprehensive pricing data

#### Ticketmaster/Live Nation API
- **URL**: https://developer.ticketmaster.com/
- **Pros**: Huge inventory, official prices
- **Cons**: Complex authentication
- **Best for**: Official pricing baseline

#### Broadway.com Data Feed
- **Contact**: partnerships@broadway.com
- **Pros**: Broadway-focused, show information
- **Cons**: May require partnership agreement

### 2. More Scrapeable Sites

#### TodayTix
- **URL**: https://www.todaytix.com/
- **Why Better**: Cleaner HTML, mobile API available
- **Endpoint**: `https://www.todaytix.com/api/v2/shows`

#### BroadwayBox
- **URL**: https://www.broadwaybox.com/
- **Why Better**: Discount codes, simpler structure
- **Approach**: Parse discount pages

#### Playbill
- **URL**: https://www.playbill.com/
- **Why Better**: Show information, cast details
- **Approach**: Static content, easier to scrape

### 3. Hybrid Approach

Instead of scraping live prices, we could:

1. **Static Data + Dynamic Links**
   - Store show information statically
   - Generate affiliate links to ticket sites
   - Let users see live prices on destination

2. **Manual Price Tracking**
   - Weekly manual price checks
   - Store in database
   - Show trends over time

3. **User-Submitted Prices**
   - Crowdsource pricing data
   - Users submit what they paid
   - Build historical database

## Recommended Implementation

### Phase 1: Quick Win
```typescript
// Use TodayTix API (more accessible)
const response = await fetch('https://www.todaytix.com/api/v2/shows?location=new-york');
const shows = await response.json();
```

### Phase 2: Official APIs
1. Apply for SeatGeek API access
2. Get Ticketmaster developer account
3. Implement proper API clients

### Phase 3: Smart Scraping
- Use residential proxies
- Implement proper rate limiting
- Handle sessions/cookies correctly
- Use Puppeteer with stealth plugin

## Example: TodayTix Integration

```typescript
class TodayTixClient {
  async getShows() {
    const response = await fetch('https://www.todaytix.com/api/v2/shows', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0...'
      }
    });
    return response.json();
  }
  
  async getPricing(showId: string, date: string) {
    // TodayTix uses GraphQL for pricing
    const query = `
      query ShowPricing($showId: ID!, $date: String!) {
        show(id: $showId) {
          performances(date: $date) {
            pricing {
              section
              price
              fees
            }
          }
        }
      }
    `;
    // Make GraphQL request
  }
}
```

## Broadway Data Ecosystem

### Official Sources
1. **Broadway League** - Industry association
2. **Telecharge** - Shubert ticketing
3. **Ticketmaster** - Nederlander/other venues

### Resale Markets
1. **StubHub** - Largest resale
2. **Vivid Seats** - Major reseller
3. **SeatGeek** - Price predictions

### Discount/Rush
1. **TodayTix** - Mobile-first rush
2. **BroadwayBox** - Discount codes
3. **TKTS** - Same-day discounts

### Information
1. **Playbill** - Official programs
2. **Broadway.com** - News & tickets
3. **IBDB** - Historical database

## Next Steps

1. **Test TodayTix API** - Most accessible
2. **Apply for SeatGeek** - Best data quality
3. **Build price tracker** - Store historical data
4. **Create alerts** - Notify on price drops
5. **Add reviews** - From multiple sources