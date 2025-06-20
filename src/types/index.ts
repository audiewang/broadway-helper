export interface Show {
  id: string;
  name: string;
  slug: string;
  theater: string;
  closingDate?: string;
  specialNotes?: string;
  officialSite: string;
  sections: {
    [key: string]: {
      rows: string;
      typicalPrice: string;
    };
  };
}

export interface TicketSource {
  name: string;
  type: 'official' | 'resale';
  hasRewards: boolean;
  typicalMarkup?: string;
  baseUrl: string;
}

export interface Listing {
  id: string;
  showId: string;
  sourceId: string;
  source: TicketSource;
  performanceDate: string;
  performanceTime: string;
  section: string;
  row: string;
  seats?: string;
  quantity: number;
  faceValue?: number;
  serviceFees: number;
  totalPrice: number;
  isVerifiedAvailable: boolean;
  listingUrl: string;
  specialOffer?: string;
  lastChecked: string;
}

export interface PriceAnomaly {
  type: 'unusually_low' | 'resale_overcharge' | 'rare_availability';
  severity: 'high' | 'medium' | 'low';
  message: string;
  savingsAmount?: number;
  savingsPercent?: number;
}

export interface SearchFilters {
  showId: string;
  dateFrom: string;
  dateTo: string;
  sections: string[];
  maxPrice?: number;
  minTickets?: number;
}

export interface CalendarDay {
  date: string;
  lowestPrice: number;
  availableCount: number;
  hasAnomalies: boolean;
  isWeekend: boolean;
}