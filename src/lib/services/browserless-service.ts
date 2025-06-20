// Browserless.io Service for scraping protected sites
// Docs: https://docs.browserless.io/

interface BrowserlessOptions {
  url: string;
  waitFor?: number | string;
  evaluate?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };
}

export class BrowserlessService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.BROWSERLESS_API_URL || 'https://chrome.browserless.io';
    this.apiKey = process.env.BROWSERLESS_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Browserless API key not configured');
    }
  }

  // Scrape Telecharge for show prices
  async scrapeTelecharge(showSlug: string, date: string) {
    const evaluate = `
      async () => {
        // Wait for price elements to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const prices = [];
        
        // Try multiple selectors
        const priceSelectors = [
          '.price-box',
          '.ticket-price',
          '[class*="price"]',
          '[data-price]',
          '.seat-price'
        ];
        
        for (const selector of priceSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach(el => {
              const text = el.textContent || '';
              const priceMatch = text.match(/\\$([0-9,]+(?:\\.[0-9]{2})?)/);
              if (priceMatch) {
                // Try to find section/row info nearby
                const parent = el.closest('[class*="seat"], [class*="ticket"], .listing');
                let section = 'Unknown';
                let row = 'Unknown';
                
                if (parent) {
                  const fullText = parent.textContent || '';
                  const sectionMatch = fullText.match(/(Orchestra|Mezzanine|Balcony|Box)/i);
                  const rowMatch = fullText.match(/Row\\s+([A-Z]+|[0-9]+)/i);
                  
                  if (sectionMatch) section = sectionMatch[1];
                  if (rowMatch) row = rowMatch[1];
                }
                
                prices.push({
                  price: parseFloat(priceMatch[1].replace(',', '')),
                  section,
                  row,
                  source: 'telecharge'
                });
              }
            });
            break; // Found prices, stop looking
          }
        }
        
        return {
          url: window.location.href,
          title: document.title,
          prices,
          timestamp: new Date().toISOString()
        };
      }
    `;

    try {
      const response = await fetch(`${this.apiUrl}/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: `https://www.telecharge.com/broadway/${showSlug}/buy/dates/${date}`,
          waitFor: 5000,
          evaluate
        })
      });

      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error scraping Telecharge:', error);
      return null;
    }
  }

  // Scrape StubHub with authentication handling
  async scrapeStubHub(showName: string, date: string) {
    const evaluate = `
      async () => {
        // StubHub loads prices dynamically
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const listings = [];
        
        // StubHub selectors
        const listingElements = document.querySelectorAll(
          '[data-testid*="listing"], .listing-row, [class*="EventTicket"]'
        );
        
        listingElements.forEach(el => {
          const priceEl = el.querySelector('[class*="price"], [data-testid*="price"]');
          const sectionEl = el.querySelector('[class*="section"], [data-testid*="section"]');
          const rowEl = el.querySelector('[class*="row"], [data-testid*="row"]');
          
          if (priceEl) {
            const priceText = priceEl.textContent || '';
            const priceMatch = priceText.match(/\\$([0-9,]+)/);
            
            if (priceMatch) {
              listings.push({
                price: parseFloat(priceMatch[1].replace(',', '')),
                section: sectionEl?.textContent?.trim() || 'Unknown',
                row: rowEl?.textContent?.replace('Row', '').trim() || 'Unknown',
                source: 'stubhub',
                includesFees: true // StubHub shows all-in pricing
              });
            }
          }
        });
        
        return {
          url: window.location.href,
          listingsFound: listings.length,
          listings: listings.slice(0, 50), // Limit to 50 listings
          timestamp: new Date().toISOString()
        };
      }
    `;

    try {
      const searchUrl = `https://www.stubhub.com/secure/search?q=${encodeURIComponent(showName + ' broadway ' + date)}`;
      
      const response = await fetch(`${this.apiUrl}/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: searchUrl,
          waitFor: 7000,
          evaluate,
          viewport: { width: 1920, height: 1080 }
        })
      });

      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error scraping StubHub:', error);
      return null;
    }
  }

  // Generic scraping function for other sites
  async scrapePage(url: string, evaluate: string, waitFor = 5000) {
    try {
      const response = await fetch(`${this.apiUrl}/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          waitFor,
          evaluate,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
      });

      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error scraping page:', error);
      return null;
    }
  }

  // Take screenshot for debugging
  async screenshot(url: string, path?: string) {
    try {
      const response = await fetch(`${this.apiUrl}/screenshot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          fullPage: false,
          type: 'png'
        })
      });

      if (!response.ok) {
        throw new Error(`Screenshot error: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      return buffer;
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Check remaining API credits
  async checkCredits() {
    try {
      const response = await fetch(`${this.apiUrl}/pressure`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error checking credits:', error);
      return null;
    }
  }
}

export const browserlessService = new BrowserlessService();