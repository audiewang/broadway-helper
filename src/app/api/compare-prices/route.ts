import { NextRequest, NextResponse } from 'next/server';
import { ScraperManager } from '@/lib/scrapers/scraper-manager';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const showName = searchParams.get('show') || 'Maybe Happy Ending';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const manager = new ScraperManager();
  
  try {
    console.log(`Starting price comparison for ${showName} on ${date}`);
    await manager.initialize();
    
    // Get all price comparisons
    const comparisons = await manager.comparePrices(showName, date);
    
    // Find anomalies
    const anomalies = await manager.findAnomalies(showName, date);
    
    // Calculate summary statistics
    const summary = {
      showName,
      date,
      totalComparisons: comparisons.length,
      anomaliesFound: anomalies.length,
      averageMarkup: comparisons
        .filter(c => c.percentageMarkup !== undefined)
        .reduce((sum, c) => sum + (c.percentageMarkup || 0), 0) / 
        comparisons.filter(c => c.percentageMarkup !== undefined).length || 0,
      maxMarkup: Math.max(...comparisons.map(c => c.percentageMarkup || 0)),
      sections: {
        orchestra: comparisons.filter(c => c.section.toLowerCase().includes('orchestra')),
        mezzanine: comparisons.filter(c => c.section.toLowerCase().includes('mezzanine')),
        balcony: comparisons.filter(c => c.section.toLowerCase().includes('balcony'))
      }
    };
    
    return NextResponse.json({
      success: true,
      summary,
      comparisons,
      anomalies,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in price comparison:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      showName,
      date
    }, { status: 500 });
    
  } finally {
    await manager.cleanup();
  }
}

// Also support POST for more complex queries
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { shows, dates } = body;
  
  const manager = new ScraperManager();
  const results = [];
  
  try {
    await manager.initialize();
    
    for (const show of shows || ['Maybe Happy Ending']) {
      for (const date of dates || [new Date().toISOString().split('T')[0]]) {
        const comparisons = await manager.comparePrices(show, date);
        results.push({
          show,
          date,
          comparisons
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in batch price comparison:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
    
  } finally {
    await manager.cleanup();
  }
}