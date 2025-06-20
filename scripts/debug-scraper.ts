import { chromium } from 'playwright';

async function debugTelecharge() {
  console.log('🔍 Debugging Telecharge Scraper...\n');
  
  const browser = await chromium.launch({
    headless: false, // Set to false to see the browser
    slowMo: 500 // Slow down actions to see what's happening
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1. Navigating to Telecharge...');
    await page.goto('https://www.telecharge.com');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'telecharge-home.png' });
    console.log('   ✓ Screenshot saved: telecharge-home.png');
    
    // Debug: List all input elements
    const inputs = await page.locator('input').all();
    console.log(`\n2. Found ${inputs.length} input elements:`);
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      const id = await inputs[i].getAttribute('id');
      const name = await inputs[i].getAttribute('name');
      console.log(`   Input ${i}: type="${type}", placeholder="${placeholder}", id="${id}", name="${name}"`);
    }
    
    // Try different search selectors
    console.log('\n3. Trying to find search box...');
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="show" i]',
      'input[name*="search" i]',
      'input[id*="search" i]',
      'input[aria-label*="search" i]',
      '.search-input',
      '#search',
      '[data-testid*="search"]'
    ];
    
    let searchBox = null;
    for (const selector of searchSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`   ✓ Found search box with selector: ${selector}`);
          searchBox = element;
          break;
        }
      } catch (e) {
        // Continue trying
      }
    }
    
    if (!searchBox) {
      console.log('   ❌ Could not find search box');
      
      // Let's look for links to shows directly
      console.log('\n4. Looking for show links...');
      const showLinks = await page.locator('a').all();
      const broadwayShows = [];
      
      for (const link of showLinks) {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        if (text && (text.includes('Hamilton') || text.includes('Lion King') || text.includes('Maybe Happy Ending'))) {
          broadwayShows.push({ text, href });
        }
      }
      
      console.log(`   Found ${broadwayShows.length} potential show links:`);
      broadwayShows.forEach(show => console.log(`   - ${show.text}: ${show.href}`));
    }
    
    // Check if we need to handle any popups or modals
    console.log('\n5. Checking for popups/modals...');
    const modals = await page.locator('[role="dialog"], .modal, .popup, [class*="modal"], [class*="popup"]').all();
    console.log(`   Found ${modals.length} potential modals`);
    
    // Try to close any popups
    const closeButtons = await page.locator('button:has-text("Close"), button:has-text("X"), [aria-label="Close"], .close-button').all();
    for (const button of closeButtons) {
      if (await button.isVisible()) {
        await button.click();
        console.log('   ✓ Closed a popup');
      }
    }
    
    // Check the page structure
    console.log('\n6. Page structure analysis:');
    const title = await page.title();
    console.log(`   Page title: ${title}`);
    
    const h1s = await page.locator('h1').all();
    console.log(`   H1 tags (${h1s.length}):`);
    for (const h1 of h1s) {
      const text = await h1.textContent();
      console.log(`   - ${text}`);
    }
    
    // Look for specific show: Maybe Happy Ending
    console.log('\n7. Looking for "Maybe Happy Ending"...');
    const maybeHappyLinks = await page.locator('a:has-text("Maybe Happy Ending")').all();
    console.log(`   Found ${maybeHappyLinks.length} links for "Maybe Happy Ending"`);
    
    if (maybeHappyLinks.length > 0) {
      console.log('   Clicking on first link...');
      await maybeHappyLinks[0].click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'maybe-happy-ending.png' });
      console.log('   ✓ Screenshot saved: maybe-happy-ending.png');
      
      // Look for ticket/price information
      console.log('\n8. Looking for ticket prices...');
      const priceSelectors = [
        '[class*="price"]',
        '[class*="ticket"]',
        'text=/\\$\\d+/',
        '.seat-price',
        '.ticket-price',
        '[data-testid*="price"]'
      ];
      
      for (const selector of priceSelectors) {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`   Found ${elements.length} elements with selector: ${selector}`);
          for (let i = 0; i < Math.min(3, elements.length); i++) {
            const text = await elements[i].textContent();
            console.log(`     - ${text}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    console.log('\nPress Enter to close browser...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    await browser.close();
  }
}

// Alternative: Try to access Telecharge API directly
async function checkTelechargeAPI() {
  console.log('\n🔍 Checking for Telecharge API...\n');
  
  const possibleAPIs = [
    'https://www.telecharge.com/api/shows',
    'https://www.telecharge.com/api/v1/shows',
    'https://api.telecharge.com/shows',
    'https://www.telecharge.com/rest/shows',
    'https://www.telecharge.com/graphql'
  ];
  
  for (const url of possibleAPIs) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
      console.log(`  Status: ${response.status}`);
      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        console.log(`  Content-Type: ${contentType}`);
        if (contentType?.includes('json')) {
          const data = await response.json();
          console.log(`  ✓ Found API! Sample data:`, JSON.stringify(data).substring(0, 200));
        }
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
}

// Run both tests
async function main() {
  await debugTelecharge();
  await checkTelechargeAPI();
}

main().catch(console.error);