// Price Aggregator - Combines data from all sources
import { seatGeekService } from './seatgeek-service';
import { ticketmasterService } from './ticketmaster-service';
import { browserlessService } from './browserless-service';

export interface AggregatedPrice {
  source: 'seatgeek' | 'ticketmaster' | 'telecharge' | 'stubhub';
  section: string;
  row?: string;
  price: number; // Total including fees
  fees?: number;
  available: boolean;
  url?: string;
  lastUpdated: Date;
}

export interface ShowPriceData {
  showName: string;
  date: string;
  venue?: string;
  prices: AggregatedPrice[];
  summary: {
    lowestPrice: number | null;
    averagePrice: number | null;
    highestPrice: number | null;
    officialPriceRange?: { min: number; max: number };
    resalePriceRange?: { min: number; max: number };
  };
}

export class PriceAggregator {
  // Get all prices for a show on a specific date
  async getAllPrices(showName: string, date: string): Promise<ShowPriceData> {
    console.log(`Fetching prices for ${showName} on ${date}...`);

    // Fetch from all sources in parallel
    const [seatgeekData, ticketmasterData, telechargeData, stubhubData] = await Promise.all([
      this.fetchSeatGeekPrices(showName, date),
      this.fetchTicketmasterPrices(showName, date),
      this.fetchTelechargePrice(showName, date),
      this.fetchStubHubPrices(showName, date)
    ]);

    // Combine all prices
    const allPrices: AggregatedPrice[] = [
      ...seatgeekData,
      ...ticketmasterData,
      ...telechargeData,
      ...stubhubData
    ];

    // Calculate summary statistics
    const summary = this.calculateSummary(allPrices);

    return {
      showName,
      date,
      prices: allPrices,
      summary
    };
  }

  // Fetch from SeatGeek
  private async fetchSeatGeekPrices(showName: string, date: string): Promise<AggregatedPrice[]> {
    if (!seatGeekService.isConfigured()) {
      console.log('SeatGeek not configured, skipping...');
      return [];
    }

    try {
      const stats = await seatGeekService.getPriceStats(showName, date);
      if (!stats) return [];

      const prices: AggregatedPrice[] = [];

      if (stats.priceRange.low) {
        prices.push({
          source: 'seatgeek',
          section: 'Various (Lowest)',
          price: stats.priceRange.low,
          available: true,
          url: stats.url,
          lastUpdated: new Date()
        });
      }

      if (stats.priceRange.average) {
        prices.push({
          source: 'seatgeek',
          section: 'Various (Average)',
          price: stats.priceRange.average,
          available: true,
          url: stats.url,
          lastUpdated: new Date()
        });
      }

      if (stats.priceRange.high) {
        prices.push({
          source: 'seatgeek',
          section: 'Various (Premium)',
          price: stats.priceRange.high,
          available: true,
          url: stats.url,
          lastUpdated: new Date()
        });
      }

      return prices;
    } catch (error) {
      console.error('Error fetching SeatGeek prices:', error);
      return [];
    }
  }

  // Fetch from Ticketmaster
  private async fetchTicketmasterPrices(showName: string, date: string): Promise<AggregatedPrice[]> {
    if (!ticketmasterService.isConfigured()) {
      console.log('Ticketmaster not configured, skipping...');
      return [];
    }

    try {
      const data = await ticketmasterService.getShowPrices(showName, date);
      if (!data || !data.priceRanges) return [];

      return data.priceRanges.map(range => ({
        source: 'ticketmaster' as const,
        section: range.type || 'Standard',
        price: range.max, // Use max as conservative estimate
        available: true,
        url: data.ticketmasterUrl,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching Ticketmaster prices:', error);
      return [];
    }
  }

  // Fetch from Telecharge via Browserless
  private async fetchTelechargePrice(showName: string, date: string): Promise<AggregatedPrice[]> {
    if (!browserlessService.isConfigured()) {
      console.log('Browserless not configured, skipping Telecharge...');
      return [];
    }

    try {
      const showSlug = showName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const data = await browserlessService.scrapeTelecharge(showSlug, date);
      
      if (!data || !data.prices) return [];

      return data.prices.map((p: any) => ({
        source: 'telecharge' as const,
        section: p.section,
        row: p.row,
        price: p.price,
        available: true,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching Telecharge prices:', error);
      return [];
    }
  }

  // Fetch from StubHub via Browserless
  private async fetchStubHubPrices(showName: string, date: string): Promise<AggregatedPrice[]> {
    if (!browserlessService.isConfigured()) {
      console.log('Browserless not configured, skipping StubHub...');
      return [];
    }

    try {
      const data = await browserlessService.scrapeStubHub(showName, date);
      
      if (!data || !data.listings) return [];

      return data.listings.map((listing: any) => ({
        source: 'stubhub' as const,
        section: listing.section,
        row: listing.row,
        price: listing.price,
        available: true,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching StubHub prices:', error);
      return [];
    }
  }

  // Calculate summary statistics
  private calculateSummary(prices: AggregatedPrice[]) {
    if (prices.length === 0) {
      return {
        lowestPrice: null,
        averagePrice: null,
        highestPrice: null
      };
    }

    const validPrices = prices.filter(p => p.price > 0).map(p => p.price);
    
    const officialPrices = prices
      .filter(p => p.source === 'telecharge' || p.source === 'ticketmaster')
      .map(p => p.price)
      .filter(p => p > 0);

    const resalePrices = prices
      .filter(p => p.source === 'seatgeek' || p.source === 'stubhub')
      .map(p => p.price)
      .filter(p => p > 0);

    return {
      lowestPrice: Math.min(...validPrices),
      averagePrice: validPrices.reduce((a, b) => a + b, 0) / validPrices.length,
      highestPrice: Math.max(...validPrices),
      officialPriceRange: officialPrices.length > 0 ? {
        min: Math.min(...officialPrices),
        max: Math.max(...officialPrices)
      } : undefined,
      resalePriceRange: resalePrices.length > 0 ? {
        min: Math.min(...resalePrices),
        max: Math.max(...resalePrices)
      } : undefined
    };
  }

  // Compare prices between sources
  comparePrices(priceData: ShowPriceData) {
    const comparisons: any[] = [];
    
    // Group by section
    const sections = new Map<string, AggregatedPrice[]>();
    
    priceData.prices.forEach(price => {
      const key = price.section;
      if (!sections.has(key)) {
        sections.set(key, []);
      }
      sections.get(key)!.push(price);
    });

    // Compare each section
    sections.forEach((sectionPrices, section) => {
      const official = sectionPrices.find(p => 
        p.source === 'telecharge' || p.source === 'ticketmaster'
      );
      const resale = sectionPrices.filter(p => 
        p.source === 'stubhub' || p.source === 'seatgeek'
      );

      if (official && resale.length > 0) {
        const avgResale = resale.reduce((sum, p) => sum + p.price, 0) / resale.length;
        const markup = ((avgResale - official.price) / official.price) * 100;

        comparisons.push({
          section,
          officialPrice: official.price,
          averageResalePrice: avgResale,
          markup: markup.toFixed(1) + '%',
          recommendation: markup > 30 ? 'Buy from official source' : 'Prices are competitive'
        });
      }
    });

    return comparisons;
  }

  // Get best deals across all sources
  async findBestDeals(showName: string, dates: string[]) {
    const allDeals: any[] = [];

    for (const date of dates) {
      const priceData = await this.getAllPrices(showName, date);
      
      if (priceData.summary.lowestPrice) {
        const lowestPriceItem = priceData.prices.find(p => 
          p.price === priceData.summary.lowestPrice
        );

        if (lowestPriceItem) {
          allDeals.push({
            date,
            source: lowestPriceItem.source,
            section: lowestPriceItem.section,
            price: lowestPriceItem.price,
            percentBelowAverage: priceData.summary.averagePrice ? 
              ((priceData.summary.averagePrice - lowestPriceItem.price) / priceData.summary.averagePrice * 100).toFixed(1) : 
              null
          });
        }
      }
    }

    return allDeals.sort((a, b) => a.price - b.price);
  }

  // Check which services are configured
  getServiceStatus() {
    return {
      seatgeek: seatGeekService.isConfigured(),
      ticketmaster: ticketmasterService.isConfigured(),
      browserless: browserlessService.isConfigured(),
      recommendation: this.getRecommendation()
    };
  }

  private getRecommendation() {
    const status = {
      seatgeek: seatGeekService.isConfigured(),
      ticketmaster: ticketmasterService.isConfigured(),
      browserless: browserlessService.isConfigured()
    };

    if (!status.seatgeek && !status.ticketmaster && !status.browserless) {
      return 'No services configured. Add API keys to .env.local file.';
    }

    if (status.seatgeek || status.ticketmaster) {
      return 'API services configured. You can fetch real prices!';
    }

    return 'Only scraping configured. Consider adding SeatGeek or Ticketmaster APIs for better data.';
  }
}

export const priceAggregator = new PriceAggregator();