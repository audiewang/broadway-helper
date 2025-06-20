import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface PriceData {
  source: string;
  showName: string;
  performanceDate: string;
  performanceTime: string;
  section: string;
  row: string;
  seatNumbers?: string;
  price: number;
  fees?: number;
  totalPrice: number;
  availability: 'available' | 'limited' | 'sold_out';
  url: string;
  scrapedAt: Date;
}

export interface ShowData {
  name: string;
  theater: string;
  description?: string;
  runtime?: string;
  intermission?: boolean;
  imageUrl?: string;
}

export abstract class BaseScraper {
  abstract source: string;
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected lastRequestTime: number = 0;
  protected minRequestInterval: number = 1000; // 1 second between requests

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
  }

  async cleanup() {
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  protected async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  protected async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  protected async createPage(): Promise<Page> {
    if (!this.context) throw new Error('Browser not initialized');
    await this.respectRateLimit();
    return this.context.newPage();
  }

  protected parsePrice(priceText: string): number {
    // Remove currency symbols and convert to number
    const cleaned = priceText.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  protected parseSeatInfo(seatText: string): { section: string; row: string; seats?: string } {
    // Generic seat parsing logic - override in specific scrapers
    const parts = seatText.split(/[\s,]+/);
    return {
      section: parts[0] || 'Unknown',
      row: parts[1] || 'Unknown',
      seats: parts.slice(2).join(', ')
    };
  }

  abstract fetchShowData(showName: string): Promise<ShowData | null>;
  abstract fetchPrices(showName: string, date: string): Promise<PriceData[]>;
}