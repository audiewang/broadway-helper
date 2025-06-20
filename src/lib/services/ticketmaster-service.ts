// Ticketmaster Discovery API Integration
// Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  dates: {
    start: {
      localDate: string;
      localTime: string;
    };
  };
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  _embedded?: {
    venues: Array<{
      name: string;
      city: { name: string };
    }>;
  };
}

export class TicketmasterService {
  private baseUrl = 'https://app.ticketmaster.com/discovery/v2';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TICKETMASTER_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Ticketmaster API key not configured');
    }
  }

  // Search for Broadway shows
  async searchBroadwayShows(keyword?: string): Promise<TicketmasterEvent[]> {
    try {
      const params: any = {
        apikey: this.apiKey,
        city: 'New York',
        classificationName: 'Theater',
        size: '50',
        sort: 'date,asc'
      };

      if (keyword) {
        params.keyword = keyword;
      }

      const response = await fetch(
        `${this.baseUrl}/events?` + new URLSearchParams(params)
      );

      if (!response.ok) {
        throw new Error(`Ticketmaster API error: ${response.status}`);
      }

      const data = await response.json();
      return data._embedded?.events || [];
    } catch (error) {
      console.error('Error fetching Ticketmaster shows:', error);
      return [];
    }
  }

  // Get specific event details
  async getEventDetails(eventId: string): Promise<TicketmasterEvent | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}?apikey=${this.apiKey}`
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching event details:', error);
      return null;
    }
  }

  // Get price ranges for a show
  async getShowPrices(showName: string, date?: string) {
    const events = await this.searchBroadwayShows(showName);
    
    if (events.length === 0) return null;

    // Filter by date if provided
    let targetEvent = events[0];
    if (date) {
      const targetDate = new Date(date).toISOString().split('T')[0];
      const matchingEvent = events.find(e => 
        e.dates.start.localDate === targetDate
      );
      if (matchingEvent) targetEvent = matchingEvent;
    }

    const venue = targetEvent._embedded?.venues?.[0];
    
    return {
      showName: targetEvent.name,
      date: targetEvent.dates.start.localDate,
      time: targetEvent.dates.start.localTime,
      venue: venue?.name || 'Unknown',
      priceRanges: targetEvent.priceRanges?.map(range => ({
        type: range.type,
        min: range.min,
        max: range.max,
        currency: range.currency
      })) || [],
      ticketmasterUrl: targetEvent.url,
      eventId: targetEvent.id
    };
  }

  // Get all performances for a show in a date range
  async getShowSchedule(showName: string, startDate?: string, endDate?: string) {
    const params: any = {
      apikey: this.apiKey,
      keyword: showName,
      city: 'New York',
      classificationName: 'Theater',
      size: '100',
      sort: 'date,asc'
    };

    if (startDate) {
      params.startDateTime = new Date(startDate).toISOString().replace('.000', '');
    }
    if (endDate) {
      params.endDateTime = new Date(endDate).toISOString().replace('.000', '');
    }

    const response = await fetch(
      `${this.baseUrl}/events?` + new URLSearchParams(params)
    );

    const data = await response.json();
    const events = data._embedded?.events || [];

    return events.map((event: TicketmasterEvent) => ({
      id: event.id,
      name: event.name,
      date: event.dates.start.localDate,
      time: event.dates.start.localTime,
      venue: event._embedded?.venues?.[0]?.name,
      priceRange: event.priceRanges?.[0] ? 
        `$${event.priceRanges[0].min} - $${event.priceRanges[0].max}` : 
        'Price not available',
      url: event.url
    }));
  }

  // Get attractions (shows) currently on Broadway
  async getBroadwayAttractions() {
    try {
      const response = await fetch(
        `${this.baseUrl}/attractions?` + new URLSearchParams({
          apikey: this.apiKey,
          city: 'New York',
          classificationName: 'Theater',
          size: '50'
        })
      );

      const data = await response.json();
      return data._embedded?.attractions || [];
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return [];
    }
  }

  // Check availability for a specific date/show
  async checkAvailability(showName: string, date: string) {
    const events = await this.searchBroadwayShows(showName);
    const targetDate = new Date(date).toISOString().split('T')[0];
    
    const availableShows = events.filter(e => 
      e.dates.start.localDate === targetDate
    );

    return {
      date: targetDate,
      showName,
      available: availableShows.length > 0,
      performances: availableShows.map(e => ({
        time: e.dates.start.localTime,
        venue: e._embedded?.venues?.[0]?.name,
        priceRange: e.priceRanges?.[0] ? 
          `$${e.priceRanges[0].min} - $${e.priceRanges[0].max}` : 
          'Check website',
        ticketmasterUrl: e.url
      }))
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const ticketmasterService = new TicketmasterService();