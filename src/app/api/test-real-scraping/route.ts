import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function GET() {
  const results = {
    telecharge: null as any,
    stubhub: null as any,
    errors: [] as string[],
    screenshots: [] as string[]
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    // Test 1: Telecharge
    console.log('Testing Telecharge...');
    const telechargePage = await context.newPage();
    
    try {
      await telechargePage.goto('https://www.telecharge.com', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Get page info
      results.telecharge = {
        url: telechargePage.url(),
        title: await telechargePage.title(),
        foundSearchBox: false,
        shows: [],
        selectors: {}
      };

      // Check various selectors
      const selectors = {
        searchInputs: await telechargePage.locator('input[type="search"], input[type="text"]').count(),
        showLinks: await telechargePage.locator('a[href*="/shows/"], a[href*="/production/"]').count(),
        buttons: await telechargePage.locator('button').count(),
        prices: await telechargePage.locator('text=/\\$\\d+/').count()
      };
      
      results.telecharge.selectors = selectors;

      // Try to find shows
      const showElements = await telechargePage.locator('a').all();
      const shows = [];
      
      for (const element of showElements.slice(0, 50)) { // Check first 50 links
        const text = await element.textContent();
        const href = await element.getAttribute('href');
        
        if (text && href && (
          text.match(/Hamilton|Lion King|Chicago|Wicked|Maybe Happy Ending/i) ||
          href.includes('/shows/') || 
          href.includes('/production/')
        )) {
          shows.push({ text: text.trim(), href });
        }
      }
      
      results.telecharge.shows = shows.slice(0, 10); // First 10 shows

      // Check if page requires interaction
      const hasOverlay = await telechargePage.locator('.modal, .overlay, [role="dialog"]').count();
      results.telecharge.hasOverlay = hasOverlay > 0;

    } catch (error) {
      results.errors.push(`Telecharge error: ${error.message}`);
    } finally {
      await telechargePage.close();
    }

    // Test 2: StubHub
    console.log('Testing StubHub...');
    const stubhubPage = await context.newPage();
    
    try {
      await stubhubPage.goto('https://www.stubhub.com/new-york-broadway-tickets/category/174/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      results.stubhub = {
        url: stubhubPage.url(),
        title: await stubhubPage.title(),
        foundEvents: false,
        events: []
      };

      // Look for event listings
      const eventSelectors = [
        '[data-testid*="event"]',
        '.event-card',
        '[class*="EventCard"]',
        'a[href*="/event/"]'
      ];

      for (const selector of eventSelectors) {
        const count = await stubhubPage.locator(selector).count();
        if (count > 0) {
          results.stubhub.foundEvents = true;
          
          const events = await stubhubPage.locator(selector).all();
          for (const event of events.slice(0, 5)) {
            const text = await event.textContent();
            results.stubhub.events.push(text?.trim().substring(0, 100));
          }
          break;
        }
      }

    } catch (error) {
      results.errors.push(`StubHub error: ${error.message}`);
    } finally {
      await stubhubPage.close();
    }

  } catch (error) {
    results.errors.push(`Browser error: ${error.message}`);
  } finally {
    await browser.close();
  }

  return NextResponse.json({
    success: results.errors.length === 0,
    results,
    recommendations: [
      'Telecharge may require navigating through their site structure differently',
      'StubHub API might be available through their partner program',
      'Consider using Broadway.com or TodayTix APIs which might be more accessible',
      'Implement cookie handling and session management for better scraping'
    ]
  });
}