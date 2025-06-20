// SeatGeek API Integration
// Docs: https://platform.seatgeek.com/

interface SeatGeekEvent {
  id: number;
  title: string;
  datetime_utc: string;
  venue: {
    name: string;
    city: string;
  };
  performers: Array<{
    name: string;
    slug: string;
  }>;
  stats: {
    lowest_price: number | null;
    average_price: number | null;
    highest_price: number | null;
    listing_count: number;
  };
  url: string;
}

interface SeatGeekListing {
  section: string;
  row: string;
  seat_numbers: string;
  quantity: number;
  price: number; // Includes fees!
  deal_score: number; // 0-100, higher is better deal
}

export class SeatGeekService {
  private baseUrl = 'https://api.seatgeek.com/2';
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.SEATGEEK_CLIENT_ID || '';
    this.clientSecret = process.env.SEATGEEK_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('SeatGeek API credentials not configured');
    }
  }

  // Get Broadway shows currently running
  async getBroadwayShows(): Promise<SeatGeekEvent[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/events?` + new URLSearchParams({
          'client_id': this.clientId,
          'client_secret': this.clientSecret,
          'venue.city': 'new york',
          'taxonomies.name': 'theater',
          'q': 'broadway',
          'per_page': '50',
          'sort': 'score.desc'
        })
      );

      if (!response.ok) {
        throw new Error(`SeatGeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error fetching Broadway shows:', error);
      return [];
    }
  }

  // Get specific show by name
  async getShow(showName: string): Promise<SeatGeekEvent | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/events?` + new URLSearchParams({
          'client_id': this.clientId,
          'client_secret': this.clientSecret,
          'q': showName,
          'venue.city': 'new york',
          'taxonomies.name': 'theater',
          'per_page': '10'
        })
      );

      const data = await response.json();
      const events = data.events || [];
      
      // Find best match
      const exactMatch = events.find((e: SeatGeekEvent) => 
        e.title.toLowerCase().includes(showName.toLowerCase())
      );
      
      return exactMatch || events[0] || null;
    } catch (error) {
      console.error('Error fetching show:', error);
      return null;
    }
  }

  // Get ticket listings for a specific event
  async getTicketListings(eventId: number): Promise<SeatGeekListing[]> {
    try {
      // Note: This endpoint requires partner access
      // For now, we'll use the event stats
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}?` + new URLSearchParams({
          'client_id': this.clientId,
          'client_secret': this.clientSecret,
        })
      );

      const data = await response.json();
      
      // SeatGeek doesn't provide detailed listings in basic API
      // But we can use the stats to show price ranges
      if (data.stats) {
        return [{
          section: 'Various Sections',
          row: 'Multiple',
          seat_numbers: 'Various',
          quantity: data.stats.listing_count || 0,
          price: data.stats.average_price || 0,
          deal_score: 0
        }];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  // Get price statistics for a show on a specific date
  async getPriceStats(showName: string, date: string) {
    const show = await this.getShow(showName);
    if (!show) return null;

    // Find performances on the specified date
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    const response = await fetch(
      `${this.baseUrl}/events?` + new URLSearchParams({
        'client_id': this.clientId,
        'client_secret': this.clientSecret,
        'performers.slug': show.performers[0]?.slug || '',
        'datetime_utc.gte': `${dateStr}T00:00:00`,
        'datetime_utc.lte': `${dateStr}T23:59:59`,
        'per_page': '10'
      })
    );

    const data = await response.json();
    const events = data.events || [];
    
    if (events.length === 0) return null;

    const event = events[0];
    return {
      showName: event.title,
      date: dateStr,
      venue: event.venue.name,
      priceRange: {
        low: event.stats.lowest_price,
        average: event.stats.average_price,
        high: event.stats.highest_price
      },
      listingCount: event.stats.listing_count,
      url: event.url,
      eventId: event.id
    };
  }

  // Search for all performances of a show
  async getShowPerformances(showName: string, startDate?: string, endDate?: string) {
    const show = await this.getShow(showName);
    if (!show) return [];

    const params: any = {
      'client_id': this.clientId,
      'client_secret': this.clientSecret,
      'performers.slug': show.performers[0]?.slug || '',
      'per_page': '50'
    };

    if (startDate) {
      params['datetime_utc.gte'] = new Date(startDate).toISOString();
    }
    if (endDate) {
      params['datetime_utc.lte'] = new Date(endDate).toISOString();
    }

    const response = await fetch(
      `${this.baseUrl}/events?` + new URLSearchParams(params)
    );

    const data = await response.json();
    return data.events || [];
  }

  // Get recommendations based on deal score
  async getBestDeals() {
    const shows = await this.getBroadwayShows();
    
    // Filter shows with good deal scores
    const dealsWithPrices = shows
      .filter(show => show.stats.lowest_price !== null)
      .map(show => ({
        title: show.title,
        venue: show.venue.name,
        lowestPrice: show.stats.lowest_price,
        averagePrice: show.stats.average_price,
        url: show.url,
        datetime: show.datetime_utc
      }))
      .sort((a, b) => (a.lowestPrice || 999) - (b.lowestPrice || 999));

    return dealsWithPrices.slice(0, 10); // Top 10 deals
  }

  // Check if API is properly configured
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

// Export singleton instance
export const seatGeekService = new SeatGeekService();