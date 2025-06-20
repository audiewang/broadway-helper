import { Show, TicketSource, Listing } from '@/types';

export const shows: Show[] = [
  {
    id: '1',
    name: 'Maybe Happy Ending',
    slug: 'maybe-happy-ending',
    theater: 'Booth Theatre',
    closingDate: '2025-08-31',
    specialNotes: 'Darren Criss leaving Aug 31',
    officialSite: 'telecharge',
    sections: {
      'Orchestra Center': { rows: 'A-S', typicalPrice: '$279-$379' },
      'Orchestra Left': { rows: 'A-S', typicalPrice: '$179-$279' },
      'Orchestra Right': { rows: 'A-S', typicalPrice: '$179-$279' },
      'Mezzanine': { rows: 'A-F', typicalPrice: '$149-$229' },
    },
  },
  {
    id: '2',
    name: 'Sunset Blvd.',
    slug: 'sunset-blvd',
    theater: 'St. James Theatre',
    officialSite: 'telecharge',
    sections: {
      'Orchestra Center': { rows: 'A-V', typicalPrice: '$299-$499' },
      'Orchestra Left': { rows: 'A-V', typicalPrice: '$199-$399' },
      'Orchestra Right': { rows: 'A-V', typicalPrice: '$199-$399' },
      'Mezzanine': { rows: 'A-F', typicalPrice: '$179-$299' },
    },
  },
  {
    id: '3',
    name: 'Oh, Mary!',
    slug: 'oh-mary',
    theater: 'Broadway Theatre',
    officialSite: 'telecharge',
    sections: {
      'Orchestra': { rows: 'A-Z', typicalPrice: '$89-$189' },
      'Mezzanine': { rows: 'A-E', typicalPrice: '$69-$149' },
    },
  },
];

export const sources: TicketSource[] = [
  {
    name: 'Telecharge',
    type: 'official',
    hasRewards: true,
    baseUrl: 'https://www.telecharge.com',
  },
  {
    name: 'Theatr',
    type: 'resale',
    hasRewards: false,
    typicalMarkup: '0%',
    baseUrl: 'https://www.theatr.com',
  },
  {
    name: 'StubHub',
    type: 'resale',
    hasRewards: false,
    typicalMarkup: '25-50%',
    baseUrl: 'https://www.stubhub.com',
  },
  {
    name: 'TickPick',
    type: 'resale',
    hasRewards: false,
    typicalMarkup: '0% (no fees)',
    baseUrl: 'https://www.tickpick.com',
  },
];

// Generate mock listings with realistic scenarios
export function generateMockListings(): Listing[] {
  const listings: Listing[] = [];
  const dates = ['2025-07-14', '2025-07-15', '2025-07-16', '2025-07-17', '2025-07-18', '2025-07-19', '2025-07-20'];
  
  // Maybe Happy Ending listings
  dates.forEach((date, dateIndex) => {
    // Orchestra Center listings
    ['D', 'E', 'F', 'G', 'H'].forEach((row, rowIndex) => {
      // Official site listing
      listings.push({
        id: `mhe-${date}-oc-${row}-official`,
        showId: '1',
        sourceId: '1',
        source: sources[0],
        performanceDate: date,
        performanceTime: '20:00',
        section: 'Orchestra Center',
        row,
        seats: `${101 + rowIndex * 2}-${102 + rowIndex * 2}`,
        quantity: 2,
        faceValue: 379,
        serviceFees: 45,
        totalPrice: 424,
        isVerifiedAvailable: true,
        listingUrl: '#',
        lastChecked: new Date().toISOString(),
      });
      
      // Resale listings (StubHub overpricing)
      listings.push({
        id: `mhe-${date}-oc-${row}-stubhub`,
        showId: '1',
        sourceId: '3',
        source: sources[2],
        performanceDate: date,
        performanceTime: '20:00',
        section: 'Orchestra Center',
        row,
        seats: `${105 + rowIndex * 2}-${106 + rowIndex * 2}`,
        quantity: 2,
        faceValue: 379,
        serviceFees: 95,
        totalPrice: 569,
        isVerifiedAvailable: true,
        listingUrl: '#',
        lastChecked: new Date().toISOString(),
      });
    });
    
    // Special case: Row B only on 7/16 at low price
    if (date === '2025-07-16') {
      listings.push({
        id: `mhe-${date}-oc-B-official-special`,
        showId: '1',
        sourceId: '1',
        source: sources[0],
        performanceDate: date,
        performanceTime: '20:00',
        section: 'Orchestra Center',
        row: 'B',
        seats: '105-106',
        quantity: 2,
        faceValue: 179,
        serviceFees: 25,
        totalPrice: 204,
        isVerifiedAvailable: true,
        listingUrl: '#',
        specialOffer: 'Limited Time Offer',
        lastChecked: new Date().toISOString(),
      });
      
      // Other rows still expensive on 7/16
      ['A', 'C'].forEach(row => {
        listings.push({
          id: `mhe-${date}-oc-${row}-official`,
          showId: '1',
          sourceId: '1',
          source: sources[0],
          performanceDate: date,
          performanceTime: '20:00',
          section: 'Orchestra Center',
          row,
          seats: '107-108',
          quantity: 2,
          faceValue: 479,
          serviceFees: 55,
          totalPrice: 534,
          isVerifiedAvailable: true,
          listingUrl: '#',
          lastChecked: new Date().toISOString(),
        });
      });
    }
  });
  
  return listings;
}