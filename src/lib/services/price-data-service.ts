// Service for managing real Broadway price data

export interface RealPriceData {
  id: string;
  showName: string;
  theater?: string;
  date: string;
  time: string;
  section: string;
  row: string;
  seatNumbers?: string;
  price: number; // Base ticket price
  fees: number; // Service fees
  totalPrice: number; // price + fees
  source: 'telecharge' | 'ticketmaster' | 'stubhub' | 'seatgeek' | 'vivid' | 'other';
  sourceUrl?: string;
  available: boolean;
  verifiedAt: Date;
  verifiedBy?: string; // Who verified this data
  notes?: string;
}

export interface ShowInfo {
  name: string;
  theater: string;
  telechargeId?: string;
  ticketmasterId?: string;
  currentlyRunning: boolean;
  officialWebsite?: string;
}

export interface PriceComparison {
  date: string;
  section: string;
  row: string;
  officialPrice?: number; // From Telecharge/Ticketmaster
  lowestResalePrice?: number;
  highestResalePrice?: number;
  averageMarkup?: number;
  recommendation: string;
  dataPoints: RealPriceData[];
}

class PriceDataService {
  private priceData: RealPriceData[] = [];
  
  // Add new price data
  addPriceData(data: Omit<RealPriceData, 'id' | 'totalPrice'>): RealPriceData {
    const newData: RealPriceData = {
      ...data,
      id: this.generateId(),
      totalPrice: data.price + data.fees,
      verifiedAt: new Date()
    };
    
    this.priceData.push(newData);
    this.saveToLocalStorage();
    return newData;
  }
  
  // Get all price data for a show
  getPricesForShow(showName: string, date?: string): RealPriceData[] {
    let filtered = this.priceData.filter(p => 
      p.showName.toLowerCase() === showName.toLowerCase()
    );
    
    if (date) {
      filtered = filtered.filter(p => p.date === date);
    }
    
    return filtered.sort((a, b) => {
      // Sort by date, then section, then row
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.row.localeCompare(b.row);
    });
  }
  
  // Compare prices across sources
  comparePrices(showName: string, date: string): PriceComparison[] {
    const showPrices = this.getPricesForShow(showName, date);
    const comparisons: Map<string, PriceComparison> = new Map();
    
    // Group by section and row
    showPrices.forEach(price => {
      const key = `${price.section}-${price.row}`;
      
      if (!comparisons.has(key)) {
        comparisons.set(key, {
          date: price.date,
          section: price.section,
          row: price.row,
          recommendation: '',
          dataPoints: []
        });
      }
      
      const comp = comparisons.get(key)!;
      comp.dataPoints.push(price);
      
      // Update official price (from Telecharge or Ticketmaster)
      if (price.source === 'telecharge' || price.source === 'ticketmaster') {
        comp.officialPrice = price.totalPrice;
      } else {
        // Track resale prices
        if (!comp.lowestResalePrice || price.totalPrice < comp.lowestResalePrice) {
          comp.lowestResalePrice = price.totalPrice;
        }
        if (!comp.highestResalePrice || price.totalPrice > comp.highestResalePrice) {
          comp.highestResalePrice = price.totalPrice;
        }
      }
    });
    
    // Calculate markups and recommendations
    comparisons.forEach(comp => {
      if (comp.officialPrice && comp.lowestResalePrice) {
        comp.averageMarkup = ((comp.lowestResalePrice - comp.officialPrice) / comp.officialPrice) * 100;
        
        if (comp.averageMarkup > 50) {
          comp.recommendation = 'High markup - buy from official source';
        } else if (comp.averageMarkup > 25) {
          comp.recommendation = 'Moderate markup - check official source first';
        } else if (comp.averageMarkup < 0) {
          comp.recommendation = 'Resale below face value - verify authenticity';
        } else {
          comp.recommendation = 'Similar pricing - choose based on availability';
        }
      } else if (comp.officialPrice && !comp.lowestResalePrice) {
        comp.recommendation = 'Only available from official source';
      } else if (!comp.officialPrice && comp.lowestResalePrice) {
        comp.recommendation = 'Only available on resale market - may be sold out officially';
      }
    });
    
    return Array.from(comparisons.values());
  }
  
  // Find anomalies
  findAnomalies(showName: string): RealPriceData[] {
    const prices = this.getPricesForShow(showName);
    const anomalies: RealPriceData[] = [];
    
    // Group by date and section to find outliers
    const grouped = this.groupByDateAndSection(prices);
    
    grouped.forEach(group => {
      const pricesInGroup = group.prices.map(p => p.totalPrice);
      const avg = pricesInGroup.reduce((a, b) => a + b, 0) / pricesInGroup.length;
      const stdDev = Math.sqrt(
        pricesInGroup.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / pricesInGroup.length
      );
      
      // Flag prices more than 2 standard deviations from mean
      group.prices.forEach(price => {
        if (Math.abs(price.totalPrice - avg) > 2 * stdDev) {
          anomalies.push(price);
        }
      });
    });
    
    return anomalies;
  }
  
  // Import data from JSON
  importData(jsonData: RealPriceData[]) {
    jsonData.forEach(data => {
      // Validate and add each entry
      if (this.validatePriceData(data)) {
        this.priceData.push({
          ...data,
          verifiedAt: new Date(data.verifiedAt)
        });
      }
    });
    this.saveToLocalStorage();
  }
  
  // Export data as JSON
  exportData(): string {
    return JSON.stringify(this.priceData, null, 2);
  }
  
  // Get summary statistics
  getSummaryStats(showName: string) {
    const prices = this.getPricesForShow(showName);
    
    if (prices.length === 0) {
      return null;
    }
    
    const officialPrices = prices.filter(p => 
      p.source === 'telecharge' || p.source === 'ticketmaster'
    ).map(p => p.totalPrice);
    
    const resalePrices = prices.filter(p => 
      p.source !== 'telecharge' && p.source !== 'ticketmaster'
    ).map(p => p.totalPrice);
    
    return {
      totalDataPoints: prices.length,
      dateRange: {
        earliest: prices[0].date,
        latest: prices[prices.length - 1].date
      },
      officialPriceRange: officialPrices.length > 0 ? {
        min: Math.min(...officialPrices),
        max: Math.max(...officialPrices),
        avg: officialPrices.reduce((a, b) => a + b, 0) / officialPrices.length
      } : null,
      resalePriceRange: resalePrices.length > 0 ? {
        min: Math.min(...resalePrices),
        max: Math.max(...resalePrices),
        avg: resalePrices.reduce((a, b) => a + b, 0) / resalePrices.length
      } : null,
      sources: Array.from(new Set(prices.map(p => p.source)))
    };
  }
  
  // Helper methods
  private generateId(): string {
    return `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private validatePriceData(data: any): boolean {
    return (
      data.showName &&
      data.date &&
      data.section &&
      data.row &&
      typeof data.price === 'number' &&
      typeof data.fees === 'number' &&
      data.source
    );
  }
  
  private groupByDateAndSection(prices: RealPriceData[]) {
    const groups: Map<string, { date: string; section: string; prices: RealPriceData[] }> = new Map();
    
    prices.forEach(price => {
      const key = `${price.date}-${price.section}`;
      if (!groups.has(key)) {
        groups.set(key, {
          date: price.date,
          section: price.section,
          prices: []
        });
      }
      groups.get(key)!.prices.push(price);
    });
    
    return Array.from(groups.values());
  }
  
  // Persistence
  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('broadway_price_data', JSON.stringify(this.priceData));
    }
  }
  
  loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('broadway_price_data');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.priceData = data.map((d: any) => ({
            ...d,
            verifiedAt: new Date(d.verifiedAt)
          }));
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    }
  }
}

// Export singleton instance
export const priceDataService = new PriceDataService();