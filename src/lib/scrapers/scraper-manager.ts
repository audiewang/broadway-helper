import { TelechargeScraper } from './telecharge-scraper';
import { StubHubScraper } from './stubhub-scraper';
import { BaseScraper, PriceData } from './base-scraper';

export interface PriceComparison {
  showName: string;
  date: string;
  section: string;
  row: string;
  telechargePrice?: number;
  stubhubPrice?: number;
  priceDifference?: number;
  percentageMarkup?: number;
  recommendation: string;
}

export class ScraperManager {
  private scrapers: BaseScraper[] = [];

  constructor() {
    this.scrapers = [
      new TelechargeScraper(),
      new StubHubScraper()
    ];
  }

  async initialize() {
    await Promise.all(this.scrapers.map(scraper => scraper.initialize()));
  }

  async cleanup() {
    await Promise.all(this.scrapers.map(scraper => scraper.cleanup()));
  }

  async fetchAllPrices(showName: string, date: string): Promise<PriceData[]> {
    const allPrices: PriceData[] = [];
    
    for (const scraper of this.scrapers) {
      try {
        console.log(`Fetching prices from ${scraper.source}...`);
        const prices = await scraper.fetchPrices(showName, date);
        allPrices.push(...prices);
        console.log(`Found ${prices.length} prices from ${scraper.source}`);
      } catch (error) {
        console.error(`Error fetching from ${scraper.source}:`, error);
      }
    }
    
    return allPrices;
  }

  async comparePrices(showName: string, date: string): Promise<PriceComparison[]> {
    const allPrices = await this.fetchAllPrices(showName, date);
    
    // Group prices by section and row
    const priceMap = new Map<string, { telecharge?: number; stubhub?: number }>();
    
    for (const price of allPrices) {
      const key = `${price.section}-${price.row}`.toLowerCase();
      const existing = priceMap.get(key) || {};
      
      if (price.source === 'Telecharge') {
        existing.telecharge = price.totalPrice;
      } else if (price.source === 'StubHub') {
        existing.stubhub = price.totalPrice;
      }
      
      priceMap.set(key, existing);
    }
    
    // Create comparisons
    const comparisons: PriceComparison[] = [];
    
    for (const [key, prices] of priceMap.entries()) {
      const [section, row] = key.split('-');
      
      let recommendation = 'Check availability';
      let priceDifference = 0;
      let percentageMarkup = 0;
      
      if (prices.telecharge && prices.stubhub) {
        priceDifference = prices.stubhub - prices.telecharge;
        percentageMarkup = ((priceDifference / prices.telecharge) * 100);
        
        if (percentageMarkup > 50) {
          recommendation = 'Buy from Telecharge - StubHub has high markup';
        } else if (percentageMarkup > 20) {
          recommendation = 'Telecharge recommended - moderate StubHub markup';
        } else if (percentageMarkup < 0) {
          recommendation = 'StubHub might be cheaper - verify authenticity';
        } else {
          recommendation = 'Similar prices - choose based on availability';
        }
      } else if (prices.telecharge && !prices.stubhub) {
        recommendation = 'Only available on Telecharge';
      } else if (!prices.telecharge && prices.stubhub) {
        recommendation = 'Only on StubHub - might be sold out officially';
      }
      
      comparisons.push({
        showName,
        date,
        section: section.charAt(0).toUpperCase() + section.slice(1),
        row: row.toUpperCase(),
        telechargePrice: prices.telecharge,
        stubhubPrice: prices.stubhub,
        priceDifference,
        percentageMarkup,
        recommendation
      });
    }
    
    // Sort by section and row
    comparisons.sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.row.localeCompare(b.row);
    });
    
    return comparisons;
  }

  async findAnomalies(showName: string, date: string): Promise<PriceComparison[]> {
    const comparisons = await this.comparePrices(showName, date);
    
    // Find anomalies: prices that seem unusually high or low
    return comparisons.filter(comp => {
      // High markup anomaly
      if (comp.percentageMarkup && comp.percentageMarkup > 100) return true;
      
      // Negative markup (StubHub cheaper than Telecharge)
      if (comp.percentageMarkup && comp.percentageMarkup < -10) return true;
      
      // Row pricing anomaly (would need more sophisticated logic)
      // For now, just flag if row B is more expensive than row S
      if (comp.row === 'B' && comp.stubhubPrice) {
        const rowS = comparisons.find(c => c.row === 'S' && c.section === comp.section);
        if (rowS && rowS.stubhubPrice && comp.stubhubPrice > rowS.stubhubPrice * 1.5) {
          return true;
        }
      }
      
      return false;
    });
  }
}