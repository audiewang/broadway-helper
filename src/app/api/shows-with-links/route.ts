import { NextResponse } from 'next/server';

// Real Broadway shows with actual ticket links
const BROADWAY_SHOWS = [
  {
    id: 'maybe-happy-ending',
    name: 'Maybe Happy Ending',
    theater: 'Booth Theatre',
    description: 'A futuristic musical about robot love',
    ticketLinks: {
      official: [
        {
          vendor: 'Telecharge',
          url: 'https://www.telecharge.com/broadway/maybe-happy-ending/overview',
          type: 'primary'
        }
      ],
      resale: [
        {
          vendor: 'StubHub',
          url: 'https://www.stubhub.com/maybe-happy-ending-new-york-tickets-11-28-2024/event/156899257/',
          type: 'resale',
          fees: 'Typically 25-30% markup'
        },
        {
          vendor: 'Vivid Seats',
          url: 'https://www.vividseats.com/maybe-happy-ending-tickets--maybe-happy-ending-new-york-at-booth-theatre-11-28-2024/production/5296657',
          type: 'resale',
          fees: 'Service fees apply'
        }
      ],
      discount: [
        {
          vendor: 'TodayTix',
          url: 'https://www.todaytix.com/new-york-ny/shows/maybe-happy-ending',
          type: 'rush',
          notes: 'Rush tickets may be available'
        }
      ]
    },
    priceRanges: {
      orchestra: { min: 89, max: 279 },
      mezzanine: { min: 69, max: 199 }
    }
  },
  {
    id: 'hamilton',
    name: 'Hamilton',
    theater: 'Richard Rodgers Theatre',
    description: 'The revolutionary musical about America\'s founding father',
    ticketLinks: {
      official: [
        {
          vendor: 'Ticketmaster',
          url: 'https://www.ticketmaster.com/hamilton-new-york-new-york/event/030058BEB95F3F0A',
          type: 'primary'
        }
      ],
      resale: [
        {
          vendor: 'StubHub',
          url: 'https://www.stubhub.com/hamilton-new-york-tickets',
          type: 'resale',
          fees: 'Typically 30-50% markup'
        },
        {
          vendor: 'SeatGeek',
          url: 'https://seatgeek.com/hamilton-tickets/broadway/richard-rodgers-theatre',
          type: 'resale',
          fees: 'Deal Score available'
        }
      ],
      discount: [
        {
          vendor: 'Ham4Ham Lottery',
          url: 'https://hamiltonmusical.com/lottery/',
          type: 'lottery',
          notes: '$10 tickets via digital lottery'
        }
      ]
    },
    priceRanges: {
      orchestra: { min: 179, max: 449 },
      mezzanine: { min: 139, max: 299 },
      rearMezzanine: { min: 89, max: 179 }
    }
  },
  {
    id: 'lion-king',
    name: 'The Lion King',
    theater: 'Minskoff Theatre',
    description: 'Disney\'s award-winning musical',
    ticketLinks: {
      official: [
        {
          vendor: 'Ticketmaster',
          url: 'https://www.ticketmaster.com/the-lion-king-new-york-tickets',
          type: 'primary'
        }
      ],
      resale: [
        {
          vendor: 'StubHub',
          url: 'https://www.stubhub.com/the-lion-king-new-york-tickets',
          type: 'resale'
        }
      ],
      discount: [
        {
          vendor: 'Broadway Box',
          url: 'https://www.broadwaybox.com/shows/the-lion-king/',
          type: 'discount',
          notes: 'Discount codes available'
        }
      ]
    },
    priceRanges: {
      orchestra: { min: 125, max: 350 },
      mezzanine: { min: 99, max: 250 }
    }
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showId = searchParams.get('show');
  
  if (showId) {
    const show = BROADWAY_SHOWS.find(s => s.id === showId);
    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }
    
    // Add comparison data
    const comparison = {
      ...show,
      priceComparison: {
        tip: 'Official vendors (Telecharge, Ticketmaster) usually have face value prices',
        warning: 'Resale sites typically add 25-50% in fees',
        recommendation: getPriceRecommendation(show)
      },
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json(comparison);
  }
  
  // Return all shows
  return NextResponse.json({
    shows: BROADWAY_SHOWS,
    tips: {
      official: 'Buy from Telecharge or Ticketmaster for face value prices',
      resale: 'StubHub and SeatGeek prices include significant markups',
      discount: 'Check TodayTix for rush tickets and Broadway Box for discount codes',
      lottery: 'Many shows offer digital lotteries for $10-50 tickets'
    }
  });
}

function getPriceRecommendation(show: any) {
  const recommendations = [];
  
  if (show.ticketLinks.discount.some(d => d.type === 'lottery')) {
    recommendations.push('Try the digital lottery for cheapest tickets');
  }
  
  if (show.priceRanges.orchestra.min < 150) {
    recommendations.push('This show has reasonable face value prices - buy from official vendors');
  } else {
    recommendations.push('High demand show - book early from official vendors to avoid resale markups');
  }
  
  if (show.ticketLinks.discount.length > 0) {
    recommendations.push('Check discount sources for better deals');
  }
  
  return recommendations;
}