import { BaseScraper, PriceData, ShowData } from './base-scraper';
import { Page } from 'playwright';

export class StubHubScraper extends BaseScraper {
  source = 'StubHub';

  async fetchShowData(showName: string): Promise<ShowData | null> {
    // StubHub doesn't have detailed show info, return basic data
    return {
      name: showName,
      theater: 'See on StubHub',
    };
  }

  async fetchPrices(showName: string, date: string): Promise<PriceData[]> {
    const page = await this.createPage();
    const prices: PriceData[] = [];
    
    try {
      // Navigate to StubHub Broadway section
      await page.goto('https://www.stubhub.com/new-york-theatre-tickets/category/174/');
      await page.waitForLoadState('networkidle');
      
      // Search for the show
      const searchBox = await page.locator('input[placeholder*="Search"], input[type="search"]').first();
      if (await searchBox.isVisible()) {
        await searchBox.fill(showName);
        await searchBox.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for results
      }
      
      // Click on the show if found
      const showCard = await page.locator(`[class*="event"]:has-text("${showName}")`).first();
      if (!await showCard.isVisible()) {
        console.log('Show not found on StubHub');
        return prices;
      }
      
      await showCard.click();
      await page.waitForLoadState('networkidle');
      
      // Look for date selection or specific performance
      await this.selectPerformance(page, date);
      await page.waitForTimeout(3000); // Wait for tickets to load
      
      // Extract ticket listings
      const ticketListings = await page.locator('[class*="ticket"], [class*="listing"], .listing-row').all();
      
      for (const listing of ticketListings) {
        try {
          const listingText = await listing.textContent();
          if (!listingText) continue;
          
          // Extract price
          const priceMatch = listingText.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
          if (!priceMatch) continue;
          
          const price = parseFloat(priceMatch[1].replace(',', ''));
          
          // Extract section and row
          const sectionMatch = listingText.match(/(Orchestra|Mezzanine|Balcony|Box)\s*(?:[-–]\s*)?([A-Z]+|\d+)?/i);
          const rowMatch = listingText.match(/Row\s+([A-Z]+|\d+)/i) || 
                          listingText.match(/\bR(?:ow)?\s*([A-Z]+|\d+)/i);
          
          // Extract seat numbers if available
          const seatMatch = listingText.match(/Seat(?:s)?\s+([\d,-]+)/i);
          
          // Check if "each" price is mentioned (for multiple tickets)
          const isEachPrice = listingText.toLowerCase().includes('each');
          
          const priceData: PriceData = {
            source: this.source,
            showName,
            performanceDate: date,
            performanceTime: this.extractTime(listingText) || '8:00 PM',
            section: sectionMatch ? sectionMatch[1] : 'Unknown',
            row: rowMatch ? rowMatch[1] : (sectionMatch && sectionMatch[2] ? sectionMatch[2] : 'Unknown'),
            seatNumbers: seatMatch ? seatMatch[1] : undefined,
            price: price,
            fees: price * 0.25, // StubHub typically charges ~25% in fees
            totalPrice: price * 1.25,
            availability: 'available',
            url: page.url(),
            scrapedAt: new Date()
          };
          
          prices.push(priceData);
        } catch (error) {
          console.error('Error parsing StubHub listing:', error);
        }
      }
      
      // If no prices found, try alternative selectors
      if (prices.length === 0) {
        console.log('Trying alternative StubHub selectors...');
        
        // Look for price elements directly
        const priceElements = await page.locator('[class*="price"]:has-text("$")').all();
        for (const element of priceElements) {
          const priceText = await element.textContent();
          if (priceText && priceText.includes('$')) {
            // Get parent element for more context
            const parent = await element.locator('..').first();
            const parentText = await parent.textContent();
            
            const priceData = this.parseAlternativeFormat(parentText || priceText, showName, date, page.url());
            if (priceData) prices.push(priceData);
          }
        }
      }
      
    } catch (error) {
      console.error('Error fetching prices from StubHub:', error);
    } finally {
      await page.close();
    }
    
    return prices;
  }

  private async selectPerformance(page: Page, date: string) {
    try {
      // Look for date/time selector
      const dateSelectors = await page.locator('[class*="date"], [class*="performance"], [class*="event-date"]').all();
      
      for (const selector of dateSelectors) {
        const text = await selector.textContent();
        if (text && text.includes(date.split('-')[2])) { // Check if day matches
          await selector.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    } catch (error) {
      console.error('Error selecting performance date:', error);
    }
  }

  private extractTime(text: string): string | null {
    const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(PM|AM)/i);
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3].toUpperCase()}`;
    }
    return null;
  }

  private parseAlternativeFormat(text: string, showName: string, date: string, url: string): PriceData | null {
    const priceMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (!priceMatch) return null;
    
    const price = parseFloat(priceMatch[1].replace(',', ''));
    
    // Try to extract any section/row info
    const sectionMatch = text.match(/(Orchestra|Mezzanine|Balcony|Box)/i);
    const rowMatch = text.match(/(?:Row|R)\s*([A-Z]+|\d+)/i);
    
    return {
      source: this.source,
      showName,
      performanceDate: date,
      performanceTime: '8:00 PM',
      section: sectionMatch ? sectionMatch[1] : 'Check listing',
      row: rowMatch ? rowMatch[1] : 'Check listing',
      price: price,
      fees: price * 0.25,
      totalPrice: price * 1.25,
      availability: 'available',
      url,
      scrapedAt: new Date()
    };
  }
}