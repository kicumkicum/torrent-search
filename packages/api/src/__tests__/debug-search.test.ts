import { TorrentSearch } from '../TorrentSearch';
import { X1337x } from '../trackers/1337x';
import { RuTracker } from '../trackers/RuTracker';
import { ThePirateBay } from '../trackers/ThePirateBay';

describe('Debug Search Tests', () => {
  // Пропускаем эти тесты по умолчанию, так как они делают реальные запросы
  const runDebugTests = process.env.RUN_DEBUG_TESTS === 'true';

  describe('Individual Tracker Tests', () => {
    (runDebugTests ? test : test.skip)('1337x tracker debug', async () => {
      console.log('\n🔍 Testing 1337x tracker...');
      
      const tracker = new X1337x();
      console.log('Tracker config:', tracker.config);
      
      try {
        const results = await tracker.search('inception', { query: 'inception', limit: 3 });
        console.log('1337x results:', results.length);
        
        if (results.length > 0) {
          console.log('First result:', results[0]);
        } else {
          console.log('No results found');
        }
        
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        console.error('1337x error:', error);
        throw error;
      }
    }, 30000);

    (runDebugTests ? test : test.skip)('RuTracker debug', async () => {
      console.log('\n🔍 Testing RuTracker...');
      
      const tracker = new RuTracker();
      console.log('Tracker config:', tracker.config);
      
      try {
        const results = await tracker.search('аватар', { query: 'аватар', limit: 3 });
        console.log('RuTracker results:', results.length);
        
        if (results.length > 0) {
          console.log('First result:', results[0]);
        } else {
          console.log('No results found');
        }
        
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        console.error('RuTracker error:', error);
        throw error;
      }
    }, 30000);

    (runDebugTests ? test : test.skip)('ThePirateBay debug', async () => {
      console.log('\n🔍 Testing ThePirateBay...');
      
      const tracker = new ThePirateBay();
      console.log('Tracker config:', tracker.config);
      
      try {
        const results = await tracker.search('avatar', { query: 'avatar', limit: 3 });
        console.log('ThePirateBay results:', results.length);
        
        if (results.length > 0) {
          console.log('First result:', results[0]);
        } else {
          console.log('No results found');
        }
        
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        console.error('ThePirateBay error:', error);
        throw error;
      }
    }, 30000);
  });

  describe('Integrated Search Debug', () => {
    const torrentSearch = new TorrentSearch();

    (runDebugTests ? test : test.skip)('integrated search debug', async () => {
      console.log('\n🔍 Testing integrated search...');
      
      const testQueries = ['inception', 'avatar', 'marvel'];
      
      for (const query of testQueries) {
        console.log(`\n🔍 Testing query: "${query}"`);
        
        try {
          const startTime = Date.now();
          const response = await torrentSearch.search({ query, limit: 5 });
          const executionTime = Date.now() - startTime;
          
          console.log(`⏱️  Execution time: ${executionTime}ms`);
          console.log(`📊 Total results: ${response.total}`);
          console.log(`🔍 Query: "${response.query}"`);
          
          // Группируем результаты по трекерам
          const resultsByTracker = response.results.reduce((acc, result) => {
            if (!acc[result.tracker]) {
              acc[result.tracker] = [];
            }
            acc[result.tracker].push(result);
            return acc;
          }, {} as Record<string, any[]>);
          
          console.log('📈 Results by tracker:');
          Object.entries(resultsByTracker).forEach(([tracker, results]) => {
            console.log(`  ${tracker}: ${results.length} results`);
            if (results.length > 0) {
              console.log(`    Top result: ${results[0].title}`);
              console.log(`    Seeders: ${results[0].seeders}, Size: ${results[0].size}`);
            }
          });
          
          expect(response.query).toBe(query);
          expect(response.executionTime).toBeGreaterThan(0);
          
        } catch (error) {
          console.error(`❌ Error with query "${query}":`, error);
          // Не падаем на ошибках, так как трекеры могут быть недоступны
        }
        
        // Пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }, 120000);
  });

  describe('HTML Parsing Debug', () => {
    test('should debug HTML parsing', () => {
      const tracker = new X1337x();
      
      // Простой HTML для тестирования
      const testHtml = `
        <div class="table-list">
          <tbody>
            <tr>
              <td>
                <a href="/torrent/123456/test-movie/">Test Movie</a>
                <a href="magnet:?xt=urn:btih:abc123">Magnet</a>
              </td>
              <td>100</td>
              <td>20</td>
              <td>1.2 GB</td>
            </tr>
          </tbody>
        </div>
      `;
      
      console.log('Test HTML:', testHtml);
      
      const results = (tracker as any).parseSearchResults(testHtml, 'test');
      console.log('Parsed results:', results);
      
      expect(Array.isArray(results)).toBe(true);
    });
  });
});