const { X1337x } = require('./dist/trackers/1337x');

async function debug1337x() {
  console.log('🔍 Debugging 1337x...\n');

  const tracker = new X1337x();
  
  try {
    console.log('Making request to 1337x...');
    const html = await tracker.makeRequest('/search', { search: 'test', category: '', sort: 'time' });
    
    console.log('HTML length:', html.length);
    console.log('HTML sample (first 2000 chars):');
    console.log(html.substring(0, 2000));
    console.log('\nHTML sample (last 1000 chars):');
    console.log(html.substring(html.length - 1000));
    
    // Try to parse
    const results = tracker.parseSearchResults(html, 'test');
    console.log('\nParsed results:', results.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debug1337x().catch(console.error);