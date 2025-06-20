import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Listing, PriceAnomaly } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
}

export function detectPriceAnomalies(
  listing: Listing,
  allListings: Listing[]
): PriceAnomaly[] {
  const anomalies: PriceAnomaly[] = [];
  
  // Filter listings for same show, date, and section
  const comparableListings = allListings.filter(
    l => l.showId === listing.showId &&
         l.performanceDate === listing.performanceDate &&
         l.section === listing.section &&
         l.id !== listing.id
  );
  
  if (comparableListings.length === 0) return anomalies;
  
  // Calculate average price for comparable seats
  const avgPrice = comparableListings.reduce((sum, l) => sum + l.totalPrice, 0) / comparableListings.length;
  
  // Check for unusually low price (like Row B at $200 when others are $500+)
  if (listing.totalPrice < avgPrice * 0.5) {
    anomalies.push({
      type: 'unusually_low',
      severity: 'high',
      message: `Row ${listing.row} only ${formatPrice(listing.totalPrice)} (${Math.round((1 - listing.totalPrice / avgPrice) * 100)}% below average)`,
      savingsAmount: avgPrice - listing.totalPrice,
      savingsPercent: Math.round((1 - listing.totalPrice / avgPrice) * 100),
    });
  }
  
  // Check if resale is overcharging for seats available on official site
  const officialListings = comparableListings.filter(l => l.source.type === 'official');
  const officialWithSameRow = officialListings.find(l => l.row === listing.row);
  
  if (listing.source.type === 'resale' && officialWithSameRow && 
      listing.totalPrice > officialWithSameRow.totalPrice * 1.1) {
    anomalies.push({
      type: 'resale_overcharge',
      severity: 'high',
      message: `Available on ${officialWithSameRow.source.name} for ${formatPrice(officialWithSameRow.totalPrice)} (${formatPrice(listing.totalPrice - officialWithSameRow.totalPrice)} less)`,
      savingsAmount: listing.totalPrice - officialWithSameRow.totalPrice,
      savingsPercent: Math.round((listing.totalPrice / officialWithSameRow.totalPrice - 1) * 100),
    });
  }
  
  // Check for rare availability (e.g., only one date has Row B)
  const sameRowOtherDates = allListings.filter(
    l => l.showId === listing.showId &&
         l.row === listing.row &&
         l.performanceDate !== listing.performanceDate
  );
  
  if (sameRowOtherDates.length === 0 && ['A', 'B', 'C'].includes(listing.row)) {
    anomalies.push({
      type: 'rare_availability',
      severity: 'medium',
      message: `Row ${listing.row} only available on this date`,
    });
  }
  
  return anomalies;
}

export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}