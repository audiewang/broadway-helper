// Quick test script to check scraping feasibility
// Run with: node scripts/test-scraping.js

const https = require('https');

async function testEndpoint(name, url, options = {}) {
  return new Promise((resolve) => {
    const defaultOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      ...options
    };

    https.get(url, defaultOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          name,
          url,
          status: res.statusCode,
          accessible: res.statusCode === 200,
          headers: res.headers,
          requiresAuth: res.statusCode === 401 || res.statusCode === 403,
          dataLength: data.length,
          containsPrices: data.includes('price') || data.includes('Price'),
          recommendation: getRecommendation(res.statusCode, data)
        });
      });
    }).on('error', (error) => {
      resolve({
        name,
        url,
        status: 'error',
        accessible: false,
        error: error.message
      });
    });
  });
}

function getRecommendation(status, data) {
  if (status === 200) {
    if (data.includes('cf-browser-verification')) return 'Cloudflare protection - needs Playwright';
    if (data.includes('recaptcha')) return 'Has reCAPTCHA - needs browser automation';
    if (data.length < 10000) return 'Might be API response or blocked';
    return 'Accessible - can scrape with careful rate limiting';
  }
  if (status === 403) return 'Blocked - needs browser automation';
  if (status === 429) return 'Rate limited - implement delays';
  return 'Needs investigation';
}

async function runTests() {
  console.log('Testing Broadway Data Sources...\n');
  
  const endpoints = [
    { name: 'Telecharge', url: 'https://www.telecharge.com' },
    { name: 'StubHub', url: 'https://www.stubhub.com/new-york-theatre-tickets/category/174/' },
    { name: 'Theatr', url: 'https://www.theatr.com' },
    { name: 'TodayTix', url: 'https://www.todaytix.com/new-york-ny/shows' },
    { name: 'Broadway.com', url: 'https://www.broadway.com/shows' },
    { name: 'Playbill', url: 'https://www.playbill.com' },
  ];

  const results = await Promise.all(
    endpoints.map(({ name, url }) => testEndpoint(name, url))
  );

  console.log('=== TEST RESULTS ===\n');
  results.forEach(result => {
    console.log(`${result.name}:`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Accessible: ${result.accessible}`);
    console.log(`  Recommendation: ${result.recommendation}`);
    console.log('');
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Directly accessible: ${results.filter(r => r.accessible && !r.recommendation.includes('needs')).length}`);
  console.log(`Need browser automation: ${results.filter(r => r.recommendation.includes('Playwright') || r.recommendation.includes('browser')).length}`);
  console.log('\nNext steps:');
  console.log('1. Set up Playwright for protected sites');
  console.log('2. Implement rate limiting (1 req/sec)');
  console.log('3. Start with Telecharge for official prices');
  console.log('4. Add StubHub for resale comparison');
}

runTests();