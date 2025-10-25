const { TorrentSearch } = require('./dist/TorrentSearch');
const { ThePirateBay } = require('./dist/trackers/ThePirateBay');
const { RuTracker } = require('./dist/trackers/RuTracker');
const { X1337x } = require('./dist/trackers/1337x');

async function testTrackers() {
  console.log('🔍 Testing individual trackers...\n');

  // Test ThePirateBay
  console.log('1. Testing ThePirateBay...');
  try {
    const tpb = new ThePirateBay();
    const tpbResults = await tpb.search('test', { query: 'test', limit: 3 });
    console.log(`   ✅ ThePirateBay: ${tpbResults.length} results`);
    if (tpbResults.length > 0) {
      console.log(`   📝 Sample: ${tpbResults[0].title}`);
    }
  } catch (error) {
    console.log(`   ❌ ThePirateBay failed: ${error.message}`);
  }

  // Test RuTracker
  console.log('\n2. Testing RuTracker...');
  try {
    const rutracker = new RuTracker();
    const rutrackerResults = await rutracker.search('тест', { query: 'тест', limit: 3 });
    console.log(`   ✅ RuTracker: ${rutrackerResults.length} results`);
    if (rutrackerResults.length > 0) {
      console.log(`   📝 Sample: ${rutrackerResults[0].title}`);
    }
  } catch (error) {
    console.log(`   ❌ RuTracker failed: ${error.message}`);
  }

  // Test 1337x
  console.log('\n3. Testing 1337x...');
  try {
    const x1337x = new X1337x();
    const x1337xResults = await x1337x.search('test', { query: 'test', limit: 3 });
    console.log(`   ✅ 1337x: ${x1337xResults.length} results`);
    if (x1337xResults.length > 0) {
      console.log(`   📝 Sample: ${x1337xResults[0].title}`);
    }
  } catch (error) {
    console.log(`   ❌ 1337x failed: ${error.message}`);
  }

  // Test integrated search
  console.log('\n4. Testing integrated search...');
  try {
    const torrentSearch = new TorrentSearch();
    const integratedResults = await torrentSearch.search({ query: 'test', limit: 10 });
    console.log(`   ✅ Integrated search: ${integratedResults.total} results`);
    
    // Group by tracker
    const byTracker = integratedResults.results.reduce((acc, result) => {
      acc[result.tracker] = (acc[result.tracker] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   📊 Results by tracker:', byTracker);
  } catch (error) {
    console.log(`   ❌ Integrated search failed: ${error.message}`);
  }
}

testTrackers().catch(console.error);