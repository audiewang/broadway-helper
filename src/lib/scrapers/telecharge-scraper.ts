import { BaseScraper, PriceData, ShowData } from './base-scraper';
import { Page } from 'playwright';

export class TelechargeScraper extends BaseScraper {
  source = 'Telecharge';

  async fetchShowData(showName: string): Promise<ShowData | null> {
    const page = await this.createPage();
    
    try {
      // Search for the show
      await page.goto('https://www.telecharge.com');
      await page.waitForLoadState('networkidle');
      
      // Use the search box
      await page.fill('input[placeholder*="search"]', showName);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      // Click on the first matching show
      const showLink = await page.locator(`a:has-text("${showName}")`).first();
      if (!await showLink.isVisible()) {
        console.log('Show not found on Telecharge');
        return null;
      }
      
      await showLink.click();
      await page.waitForLoadState('networkidle');
      
      // Extract show data
      const showData: ShowData = {
        name: await page.locator('h1').first().textContent() || showName,
        theater: await page.locator('text=/Theatre|Theater/i').first().textContent() || 'Unknown',
        description: await page.locator('.show-description').first().textContent() || undefined,
        runtime: await page.locator('text=/Runtime|Duration/i').first().textContent() || undefined,
        imageUrl: await page.locator('.show-image img').first().getAttribute('src') || undefined
      };
      
      return showData;
    } catch (error) {
      console.error('Error fetching show data from Telecharge:', error);
      return null;
    } finally {
      await page.close();
    }
  }

  async fetchPrices(showName: string, date: string): Promise<PriceData[]> {
    const page = await this.createPage();
    const prices: PriceData[] = [];
    
    try {
      // Navigate to show page
      await page.goto('https://www.telecharge.com');
      await page.waitForLoadState('networkidle');
      
      // Search for show
      await page.fill('input[placeholder*="search"]', showName);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      // Click on the show
      const showLink = await page.locator(`a:has-text("${showName}")`).first();
      if (!await showLink.isVisible()) {
        console.log('Show not found on Telecharge');
        return prices;
      }
      
      await showLink.click();
      await page.waitForLoadState('networkidle');
      
      // Click "Buy Tickets" or similar button
      const buyButton = await page.locator('button:has-text("Buy"), a:has-text("Buy")').first();
      if (await buyButton.isVisible()) {
        await buyButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      // Select date
      await this.selectDate(page, date);
      await page.waitForTimeout(2000); // Wait for prices to load
      
      // Extract price data
      const priceElements = await page.locator('.seat-selection, .price-option, [class*="seat"], [class*="price"]').all();
      
      for (const element of priceElements) {
        try {
          const text = await element.textContent();
          if (!text) continue;
          
          // Parse price information
          const priceMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
          if (!priceMatch) continue;
          
          const price = parseFloat(priceMatch[1]);
          
          // Try to extract section/row info
          const sectionMatch = text.match(/(Orchestra|Mezzanine|Balcony|Box)/i);
          const rowMatch = text.match(/Row\s+([A-Z]+|\d+)/i);
          
          const priceData: PriceData = {
            source: this.source,
            showName,
            performanceDate: date,
            performanceTime: '8:00 PM', // Default - would need to extract actual time
            section: sectionMatch ? sectionMatch[1] : 'Unknown',
            row: rowMatch ? rowMatch[1] : 'Unknown',
            price: price,
            totalPrice: price, // Telecharge usually shows final price
            availability: 'available',
            url: page.url(),
            scrapedAt: new Date()
          };
          
          prices.push(priceData);
        } catch (error) {
          console.error('Error parsing price element:', error);
        }
      }
      
      // If no prices found with generic approach, try specific selectors
      if (prices.length === 0) {
        console.log('Trying alternative price extraction method...');
        // Alternative approach - look for price tables or lists
        const priceTables = await page.locator('table:has-text("Price"), .price-grid, .seating-chart').all();
        for (const table of priceTables) {
          const rows = await table.locator('tr, .price-row').all();
          for (const row of rows) {
            const rowText = await row.textContent();
            if (rowText && rowText.includes('$')) {
              // Parse row data
              const priceData = this.parseRowData(rowText, showName, date, page.url());
              if (priceData) prices.push(priceData);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error fetching prices from Telecharge:', error);
    } finally {
      await page.close();
    }
    
    return prices;
  }

  private async selectDate(page: Page, date: string) {
    // Try different date selection methods
    try {
      // Method 1: Date picker
      const datePicker = await page.locator('input[type="date"], input[placeholder*="date"]').first();
      if (await datePicker.isVisible()) {
        await datePicker.fill(date);
        return;
      }
      
      // Method 2: Calendar widget
      const calendar = await page.locator('.calendar, [class*="calendar"]').first();
      if (await calendar.isVisible()) {
        // Parse date and click on the day
        const dateObj = new Date(date);
        const day = dateObj.getDate();
        await page.locator(`text="${day}"`).first().click();
        return;
      }
      
      // Method 3: Dropdown
      const dateDropdown = await page.locator('select:has-text("date")').first();
      if (await dateDropdown.isVisible()) {
        await dateDropdown.selectOption({ label: date });
        return;
      }
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  }

  private parseRowData(text: string, showName: string, date: string, url: string): PriceData | null {
    const priceMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
    if (!priceMatch) return null;
    
    const sectionMatch = text.match(/(Orchestra|Mezzanine|Balcony|Box)/i);
    const rowMatch = text.match(/Row\s+([A-Z]+|\d+)/i);
    
    return {
      source: this.source,
      showName,
      performanceDate: date,
      performanceTime: '8:00 PM',
      section: sectionMatch ? sectionMatch[1] : 'Unknown',
      row: rowMatch ? rowMatch[1] : 'Unknown',
      price: parseFloat(priceMatch[1]),
      totalPrice: parseFloat(priceMatch[1]),
      availability: text.toLowerCase().includes('sold out') ? 'sold_out' : 'available',
      url,
      scrapedAt: new Date()
    };
  }
}