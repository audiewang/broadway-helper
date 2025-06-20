import { NextResponse } from 'next/server';

export async function GET() {
  const results = {
    todaytix: null as any,
    broadwaycom: null as any,
    seatgeek: null as any,
    errors: [] as string[]
  };

  // Test 1: TodayTix (they have a more accessible structure)
  try {
    console.log('Testing TodayTix...');
    const todayTixResponse = await fetch('https://www.todaytix.com/new-york-ny/shows', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (todayTixResponse.ok) {
      const html = await todayTixResponse.text();
      
      // Look for JSON data in the page
      const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          results.todaytix = {
            foundData: true,
            showCount: Object.keys(data.shows || {}).length,
            sampleShows: Object.values(data.shows || {}).slice(0, 3)
          };
        } catch (e) {
          results.todaytix = { foundData: false, reason: 'Could not parse JSON' };
        }
      } else {
        results.todaytix = { foundData: false, reason: 'No initial state found' };
      }
    }
  } catch (error) {
    results.errors.push(`TodayTix error: ${error.message}`);
  }

  // Test 2: Broadway.com
  try {
    console.log('Testing Broadway.com...');
    const broadwayResponse = await fetch('https://www.broadway.com/shows', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    results.broadwaycom = {
      status: broadwayResponse.status,
      contentType: broadwayResponse.headers.get('content-type')
    };
    
    if (broadwayResponse.ok) {
      const text = await broadwayResponse.text();
      results.broadwaycom.hasShowData = text.includes('Hamilton') || text.includes('Lion King');
      results.broadwaycom.length = text.length;
    }
  } catch (error) {
    results.errors.push(`Broadway.com error: ${error.message}`);
  }

  // Test 3: SeatGeek Public Data
  try {
    console.log('Testing SeatGeek...');
    // SeatGeek has some public endpoints
    const seatgeekResponse = await fetch('https://seatgeek.com/broadway-tickets', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    results.seatgeek = {
      status: seatgeekResponse.status,
      accessible: seatgeekResponse.ok
    };
  } catch (error) {
    results.errors.push(`SeatGeek error: ${error.message}`);
  }

  // Recommendations based on findings
  const recommendations = [];
  
  if (results.todaytix?.foundData) {
    recommendations.push('TodayTix has accessible data - use their structure');
  }
  
  recommendations.push(
    'Consider using a headless browser service like Browserless.io',
    'Implement a caching layer to reduce scraping frequency',
    'Use the official ticket sites for deep links rather than scraping',
    'Focus on aggregating publicly available show information first'
  );

  // Let's also check what our current shows would look like with real links
  const showsWithRealLinks = [
    {
      name: 'Maybe Happy Ending',
      officialLinks: {
        telecharge: 'https://www.telecharge.com/broadway/maybe-happy-ending/overview',
        todaytix: 'https://www.todaytix.com/new-york-ny/shows/maybe-happy-ending',
        broadway: 'https://www.broadway.com/shows/maybe-happy-ending-new-york'
      },
      resaleLinks: {
        stubhub: 'https://www.stubhub.com/maybe-happy-ending-new-york-tickets',
        seatgeek: 'https://seatgeek.com/maybe-happy-ending-tickets',
        vividseats: 'https://www.vividseats.com/maybe-happy-ending-tickets'
      }
    },
    {
      name: 'Hamilton',
      officialLinks: {
        telecharge: 'https://www.telecharge.com/broadway/hamilton/overview',
        ticketmaster: 'https://www.ticketmaster.com/hamilton-new-york-tickets',
        broadway: 'https://www.broadway.com/shows/hamilton-new-york'
      },
      resaleLinks: {
        stubhub: 'https://www.stubhub.com/hamilton-new-york-tickets',
        seatgeek: 'https://seatgeek.com/hamilton-tickets'
      }
    }
  ];

  return NextResponse.json({
    success: true,
    results,
    recommendations,
    showsWithRealLinks,
    betterApproach: {
      step1: 'Use static show data with real ticket links',
      step2: 'Add "Compare Prices" that opens multiple tabs',
      step3: 'Implement price tracking with user submissions',
      step4: 'Partner with ticket sites for affiliate access',
      step5: 'Use official APIs when available (SeatGeek, Ticketmaster)'
    }
  });
}