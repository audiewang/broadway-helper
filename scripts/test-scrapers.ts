import { ScraperManager } from '../src/lib/scrapers/scraper-manager';

async function testScrapers() {
  console.log('🎭 Testing Broadway Price Scrapers...\n');
  
  const manager = new ScraperManager();
  const showName = 'Maybe Happy Ending';
  const date = new Date().toISOString().split('T')[0];
  
  try {
    console.log(`Show: ${showName}`);
    console.log(`Date: ${date}\n`);
    
    console.log('Initializing scrapers...');
    await manager.initialize();
    
    console.log('Fetching prices from all sources...\n');
    const comparisons = await manager.comparePrices(showName, date);
    
    if (comparisons.length === 0) {
      console.log('❌ No prices found. The scrapers may need updating for current website structures.');
      return;
    }
    
    console.log(`✅ Found ${comparisons.length} price comparisons!\n`);
    
    // Display results in a table format
    console.log('PRICE COMPARISON RESULTS:');
    console.log('='.repeat(80));
    console.log('Section/Row    | Telecharge | StubHub  | Difference | Markup % | Recommendation');
    console.log('-'.repeat(80));
    
    comparisons.forEach(comp => {
      const sectionRow = `${comp.section} ${comp.row}`.padEnd(14);
      const telecharge = comp.telechargePrice ? `$${comp.telechargePrice.toFixed(2)}` : 'N/A';
      const stubhub = comp.stubhubPrice ? `$${comp.stubhubPrice.toFixed(2)}` : 'N/A';
      const diff = comp.priceDifference ? `$${comp.priceDifference.toFixed(2)}` : 'N/A';
      const markup = comp.percentageMarkup ? `${comp.percentageMarkup.toFixed(1)}%` : 'N/A';
      
      console.log(
        `${sectionRow} | ${telecharge.padEnd(10)} | ${stubhub.padEnd(8)} | ${diff.padEnd(10)} | ${markup.padEnd(8)} | ${comp.recommendation}`
      );
    });
    
    console.log('='.repeat(80));
    
    // Check for anomalies
    const anomalies = await manager.findAnomalies(showName, date);
    if (anomalies.length > 0) {
      console.log(`\n⚠️  Found ${anomalies.length} price anomalies:`);
      anomalies.forEach(anomaly => {
        console.log(`   - ${anomaly.section} Row ${anomaly.row}: ${anomaly.percentageMarkup?.toFixed(1)}% markup`);
      });
    } else {
      console.log('\n✅ No significant price anomalies detected.');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    console.log('\nCleaning up...');
    await manager.cleanup();
    console.log('Done!');
  }
}

// Run the test
testScrapers().catch(console.error);