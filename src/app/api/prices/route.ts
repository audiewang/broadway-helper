import { NextRequest, NextResponse } from 'next/server';
import { priceAggregator } from '@/lib/services/price-aggregator';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const show = searchParams.get('show');
  const date = searchParams.get('date');
  const action = searchParams.get('action');

  // Check service status
  if (action === 'status') {
    const status = priceAggregator.getServiceStatus();
    return NextResponse.json(status);
  }

  // Validate params
  if (!show || !date) {
    return NextResponse.json(
      { error: 'Missing required parameters: show and date' },
      { status: 400 }
    );
  }

  try {
    // Get all prices
    const priceData = await priceAggregator.getAllPrices(show, date);
    
    // Add comparisons
    const comparisons = priceAggregator.comparePrices(priceData);
    
    return NextResponse.json({
      success: true,
      data: priceData,
      comparisons,
      serviceStatus: priceAggregator.getServiceStatus()
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch prices',
        details: error instanceof Error ? error.message : 'Unknown error',
        serviceStatus: priceAggregator.getServiceStatus()
      },
      { status: 500 }
    );
  }
}

// Find best deals across multiple dates
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { show, dates } = body;

  if (!show || !dates || !Array.isArray(dates)) {
    return NextResponse.json(
      { error: 'Missing required parameters: show and dates array' },
      { status: 400 }
    );
  }

  try {
    const bestDeals = await priceAggregator.findBestDeals(show, dates);
    
    return NextResponse.json({
      success: true,
      show,
      deals: bestDeals,
      datesChecked: dates.length
    });
  } catch (error) {
    console.error('Error finding best deals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to find best deals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}