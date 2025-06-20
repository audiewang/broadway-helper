import { NextResponse } from 'next/server';

export async function GET() {
  const tests = [];
  
  // Test 1: Broadway League API (if exists)
  try {
    const broadwayTest = await fetch('https://api.broadway.org/shows/current', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    tests.push({
      source: 'Broadway League',
      status: broadwayTest.status,
      accessible: broadwayTest.status === 200,
      notes: 'Official industry source'
    });
  } catch (error) {
    tests.push({
      source: 'Broadway League',
      status: 'error',
      accessible: false,
      error: error.message
    });
  }

  // Test 2: Playbill
  try {
    const playbillTest = await fetch('https://www.playbill.com/productions?q=current', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    tests.push({
      source: 'Playbill',
      status: playbillTest.status,
      accessible: playbillTest.status === 200,
      notes: 'Good for show info, not prices'
    });
  } catch (error) {
    tests.push({
      source: 'Playbill',
      status: 'error',
      accessible: false,
      error: error.message
    });
  }

  // Test 3: TodayTix API
  try {
    const todayTixTest = await fetch('https://www.todaytix.com/api/v2/shows?location=new-york', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    tests.push({
      source: 'TodayTix',
      status: todayTixTest.status,
      accessible: todayTixTest.status === 200,
      notes: 'May have API for rush tickets'
    });
  } catch (error) {
    tests.push({
      source: 'TodayTix',
      status: 'error',
      accessible: false,
      error: error.message
    });
  }

  // Test 4: IBDB
  try {
    const ibdbTest = await fetch('https://www.ibdb.com/api/shows/current', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    tests.push({
      source: 'IBDB',
      status: ibdbTest.status,
      accessible: ibdbTest.status === 200,
      notes: 'Historical data, not real-time prices'
    });
  } catch (error) {
    tests.push({
      source: 'IBDB',
      status: 'error',
      accessible: false,
      error: error.message
    });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    tests,
    summary: {
      accessible: tests.filter(t => t.accessible).length,
      total: tests.length,
      recommendation: 'Most ticket sites require browser automation (Playwright) for data access'
    },
    nextSteps: [
      'Set up Playwright for browser automation',
      'Create respectful scrapers with rate limiting',
      'Focus on Telecharge, StubHub, and Theatr first',
      'Implement caching to minimize requests'
    ]
  });
}