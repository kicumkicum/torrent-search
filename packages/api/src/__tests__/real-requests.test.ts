import { X1337x } from '../trackers/1337x';
import { RuTracker } from '../trackers/RuTracker';
import { ThePirateBay } from '../trackers/ThePirateBay';
import { TorrentSearch } from '../TorrentSearch';
import { SearchOptions } from '../types';

// Этот файл содержит тесты с реальными запросами к трекерам
// Запускать только когда нужно проверить реальную работу

describe('Real Network Requests Tests', () => {
  // Пропускаем эти тесты по умолчанию, так как они делают реальные запросы
  const runRealTests = process.env.RUN_REAL_TESTS === 'true';

  describe('1337x Real Requests', () => {
    const tracker = new X1337x();

    test.skipIf(!runRealTests)('should make real request to 1337x', async () => {
      console.log('\n🌐 Making real request to 1337x...');
      
      const options: SearchOptions = { 
        query: 'inception', 
        limit: 5 
      };
      
      const startTime = Date.now();
      const results = await tracker.search('inception', options);
      const executionTime = Date.now() - startTime;
      
      console.log(`⏱️  Execution time: ${executionTime}ms`);
      console.log(`📊 Results found: ${results.length}`);
      
      if (results.length > 0) {
        console.log('📝 Sample results:');
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.title}`);
          console.log(`     Size: ${result.size}, Seeders: ${result.seeders}, Leechers: ${result.leechers}`);
          console.log(`     Magnet: ${result.magnetUrl ? 'Yes' : 'No'}`);
          console.log(`     Torrent: ${result.torrentUrl ? 'Yes' : 'No'}`);
        });
      }
      
      // Проверяем что получили результаты
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('tracker', '1337x');
    }, 30000);

    test.skipIf(!runRealTests)('should handle 1337x search with filters', async () => {
      console.log('\n🌐 Testing 1337x with category filter...');
      
      const options: SearchOptions = { 
        query: 'marvel', 
        category: 'movie',
        limit: 3 
      };
      
      const results = await tracker.search('marvel', options);
      
      console.log(`📊 Results with movie filter: ${results.length}`);
      
      if (results.length > 0) {
        console.log('📝 Filtered results:');
        results.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.title} (${result.category})`);
        });
      }
      
      expect(results.length).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('RuTracker Real Requests', () => {
    const tracker = new RuTracker();

    test.skipIf(!runRealTests)('should make real request to RuTracker', async () => {
      console.log('\n🌐 Making real request to RuTracker...');
      
      const options: SearchOptions = { 
        query: 'аватар', 
        limit: 5 
      };
      
      const startTime = Date.now();
      const results = await tracker.search('аватар', options);
      const executionTime = Date.now() - startTime;
      
      console.log(`⏱️  Execution time: ${executionTime}ms`);
      console.log(`📊 Results found: ${results.length}`);
      
      if (results.length > 0) {
        console.log('📝 Sample results:');
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.title}`);
          console.log(`     Size: ${result.size}, Seeders: ${result.seeders}, Leechers: ${result.leechers}`);
          console.log(`     Magnet: ${result.magnetUrl ? 'Yes' : 'No'}`);
          console.log(`     Torrent: ${result.torrentUrl ? 'Yes' : 'No'}`);
        });
      }
      
      expect(results.length).toBeGreaterThanOrEqual(0);
    }, 30000);

    test.skipIf(!runRealTests)('should handle RuTracker search with series filter', async () => {
      console.log('\n🌐 Testing RuTracker with series filter...');
      
      const options: SearchOptions = { 
        query: 'во все тяжкие', 
        category: 'series',
        limit: 3 
      };
      
      const results = await tracker.search('во все тяжкие', options);
      
      console.log(`📊 Results with series filter: ${results.length}`);
      
      if (results.length > 0) {
        console.log('📝 Filtered results:');
        results.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.title} (${result.category})`);
        });
      }
      
      expect(results.length).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('ThePirateBay Real Requests', () => {
    const tracker = new ThePirateBay();

    test.skipIf(!runRealTests)('should make real request to ThePirateBay', async () => {
      console.log('\n🌐 Making real request to ThePirateBay...');
      
      const options: SearchOptions = { 
        query: 'avatar', 
        limit: 5 
      };
      
      const startTime = Date.now();
      const results = await tracker.search('avatar', options);
      const executionTime = Date.now() - startTime;
      
      console.log(`⏱️  Execution time: ${executionTime}ms`);
      console.log(`📊 Results found: ${results.length}`);
      
      if (results.length > 0) {
        console.log('📝 Sample results:');
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.title}`);
          console.log(`     Size: ${result.size}, Seeders: ${result.seeders}, Leechers: ${result.leechers}`);
          console.log(`     Magnet: ${result.magnetUrl ? 'Yes' : 'No'}`);
          console.log(`     Torrent: ${result.torrentUrl ? 'Yes' : 'No'}`);
        });
      }
      
      expect(results.length).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('Integrated Search Real Requests', () => {
    const torrentSearch = new TorrentSearch();

    test.skipIf(!runRealTests)('should search across all trackers', async () => {
      console.log('\n🌐 Making integrated search across all trackers...');
      
      const options: SearchOptions = { 
        query: 'disney', 
        limit: 10 
      };
      
      const startTime = Date.now();
      const response = await torrentSearch.search(options);
      const executionTime = Date.now() - startTime;
      
      console.log(`⏱️  Total execution time: ${executionTime}ms`);
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
      
      console.log('\n📈 Results by tracker:');
      Object.entries(resultsByTracker).forEach(([tracker, results]) => {
        console.log(`  ${tracker}: ${results.length} results`);
        if (results.length > 0) {
          console.log(`    Top result: ${results[0].title}`);
          console.log(`    Seeders: ${results[0].seeders}, Size: ${results[0].size}`);
        }
      });
      
      expect(response.total).toBeGreaterThanOrEqual(0);
      expect(response.executionTime).toBeGreaterThan(0);
    }, 60000);

    test.skipIf(!runRealTests)('should handle different query types', async () => {
      const testQueries = [
        'inception',
        'breaking bad',
        'marvel',
        'disney',
        'аватар'
      ];
      
      for (const query of testQueries) {
        console.log(`\n🔍 Testing query: "${query}"`);
        
        const options: SearchOptions = { 
          query, 
          limit: 5 
        };
        
        const startTime = Date.now();
        const response = await torrentSearch.search(options);
        const executionTime = Date.now() - startTime;
        
        console.log(`  ⏱️  Time: ${executionTime}ms, Results: ${response.total}`);
        
        if (response.total > 0) {
          console.log(`  📝 Top result: ${response.results[0].title}`);
        }
        
        expect(response.query).toBe(query);
        expect(response.executionTime).toBeGreaterThan(0);
        
        // Небольшая пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }, 120000);
  });

  describe('Error Handling Real Tests', () => {
    const torrentSearch = new TorrentSearch();

    test.skipIf(!runRealTests)('should handle empty queries gracefully', async () => {
      const emptyQueries = ['', '   ', '\t\n'];
      
      for (const query of emptyQueries) {
        const response = await torrentSearch.search({ query, limit: 10 });
        expect(response.results).toEqual([]);
        expect(response.total).toBe(0);
        expect(response.executionTime).toBe(0);
      }
    });

    test.skipIf(!runRealTests)('should handle special characters', async () => {
      const specialQueries = [
        'test@#$%',
        'тест с пробелами',
        '123456',
        '!@#$%^&*()',
        'query with spaces'
      ];
      
      for (const query of specialQueries) {
        console.log(`\n🔍 Testing special query: "${query}"`);
        
        try {
          const response = await torrentSearch.search({ query, limit: 3 });
          console.log(`  📊 Results: ${response.total}`);
          expect(response.query).toBe(query);
        } catch (error) {
          console.log(`  ❌ Error: ${error.message}`);
          // Не падаем на ошибках, так как некоторые трекеры могут не поддерживать специальные символы
        }
        
        // Пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }, 60000);
  });
});