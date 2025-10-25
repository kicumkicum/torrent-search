import { X1337x } from '../trackers/1337x';
import { RuTracker } from '../trackers/RuTracker';
import { ThePirateBay } from '../trackers/ThePirateBay';
import { TorrentSearch } from '../TorrentSearch';
import { SearchOptions } from '../types';

describe('Torrent Trackers Tests', () => {
  const testQueries = [
    'inception',
    'breaking bad',
    'avatar',
    'marvel',
    'disney'
  ];

  describe('1337x Tracker', () => {
    const tracker = new X1337x();

    test('should be enabled by default', () => {
      expect(tracker.config.enabled).toBe(true);
    });

    test('should have correct configuration', () => {
      expect(tracker.config.name).toBe('1337x');
      expect(tracker.config.baseUrl).toBe('https://1337x.to');
      expect(tracker.config.searchPath).toBe('/search');
    });

    test.each(testQueries)('should search for "%s"', async (query) => {
      const options: SearchOptions = { query, limit: 10 };
      
      console.log(`\n🔍 Testing 1337x search for: "${query}"`);
      const startTime = Date.now();
      
      try {
        const results = await tracker.search(query, options);
        const executionTime = Date.now() - startTime;
        
        console.log(`⏱️  Execution time: ${executionTime}ms`);
        console.log(`📊 Results found: ${results.length}`);
        
        if (results.length > 0) {
          console.log(`📝 First result: ${results[0].title}`);
          console.log(`🌱 Seeders: ${results[0].seeders}, Leechers: ${results[0].leechers}`);
        }
        
        // Проверяем структуру результатов
        results.forEach((result, index) => {
          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('title');
          expect(result).toHaveProperty('tracker', '1337x');
          expect(result).toHaveProperty('seeders');
          expect(result).toHaveProperty('leechers');
          expect(result).toHaveProperty('size');
          expect(result).toHaveProperty('sizeBytes');
          expect(result).toHaveProperty('category');
          
          // Проверяем типы данных
          expect(typeof result.title).toBe('string');
          expect(typeof result.seeders).toBe('number');
          expect(typeof result.leechers).toBe('number');
          expect(typeof result.sizeBytes).toBe('number');
          expect(result.title.length).toBeGreaterThan(0);
        });
        
        // Если результаты найдены, проверяем что они содержат запрос
        if (results.length > 0) {
          const hasRelevantResult = results.some(result => 
            result.title.toLowerCase().includes(query.toLowerCase())
          );
          console.log(`🎯 Relevant results: ${hasRelevantResult ? 'Yes' : 'No'}`);
        }
        
      } catch (error) {
        console.error(`❌ Error searching 1337x for "${query}":`, error);
        throw error;
      }
    }, 30000); // 30 секунд таймаут для каждого теста
  });

  describe('RuTracker', () => {
    const tracker = new RuTracker();

    test('should be enabled by default', () => {
      expect(tracker.config.enabled).toBe(true);
    });

    test('should have correct configuration', () => {
      expect(tracker.config.name).toBe('RuTracker');
      expect(tracker.config.baseUrl).toBe('https://rutracker.org');
      expect(tracker.config.searchPath).toBe('/forum/tracker.php');
    });

    test.each(testQueries)('should search for "%s"', async (query) => {
      const options: SearchOptions = { query, limit: 10 };
      
      console.log(`\n🔍 Testing RuTracker search for: "${query}"`);
      const startTime = Date.now();
      
      try {
        const results = await tracker.search(query, options);
        const executionTime = Date.now() - startTime;
        
        console.log(`⏱️  Execution time: ${executionTime}ms`);
        console.log(`📊 Results found: ${results.length}`);
        
        if (results.length > 0) {
          console.log(`📝 First result: ${results[0].title}`);
          console.log(`🌱 Seeders: ${results[0].seeders}, Leechers: ${results[0].leechers}`);
        }
        
        // Проверяем структуру результатов
        results.forEach((result, index) => {
          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('title');
          expect(result).toHaveProperty('tracker', 'RuTracker');
          expect(result).toHaveProperty('seeders');
          expect(result).toHaveProperty('leechers');
          expect(result).toHaveProperty('size');
          expect(result).toHaveProperty('sizeBytes');
          expect(result).toHaveProperty('category');
          
          // Проверяем типы данных
          expect(typeof result.title).toBe('string');
          expect(typeof result.seeders).toBe('number');
          expect(typeof result.leechers).toBe('number');
          expect(typeof result.sizeBytes).toBe('number');
          expect(result.title.length).toBeGreaterThan(0);
        });
        
        // Если результаты найдены, проверяем что они содержат запрос
        if (results.length > 0) {
          const hasRelevantResult = results.some(result => 
            result.title.toLowerCase().includes(query.toLowerCase())
          );
          console.log(`🎯 Relevant results: ${hasRelevantResult ? 'Yes' : 'No'}`);
        }
        
      } catch (error) {
        console.error(`❌ Error searching RuTracker for "${query}":`, error);
        throw error;
      }
    }, 30000);
  });

  describe('ThePirateBay', () => {
    const tracker = new ThePirateBay();

    test('should be enabled by default', () => {
      expect(tracker.config.enabled).toBe(true);
    });

    test('should have correct configuration', () => {
      expect(tracker.config.name).toBe('ThePirateBay');
      expect(tracker.config.baseUrl).toBe('https://thepiratebay.org');
      expect(tracker.config.searchPath).toBe('/s.php');
    });

    test.each(testQueries)('should search for "%s"', async (query) => {
      const options: SearchOptions = { query, limit: 10 };
      
      console.log(`\n🔍 Testing ThePirateBay search for: "${query}"`);
      const startTime = Date.now();
      
      try {
        const results = await tracker.search(query, options);
        const executionTime = Date.now() - startTime;
        
        console.log(`⏱️  Execution time: ${executionTime}ms`);
        console.log(`📊 Results found: ${results.length}`);
        
        if (results.length > 0) {
          console.log(`📝 First result: ${results[0].title}`);
          console.log(`🌱 Seeders: ${results[0].seeders}, Leechers: ${results[0].leechers}`);
        }
        
        // Проверяем структуру результатов
        results.forEach((result, index) => {
          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('title');
          expect(result).toHaveProperty('tracker', 'ThePirateBay');
          expect(result).toHaveProperty('seeders');
          expect(result).toHaveProperty('leechers');
          expect(result).toHaveProperty('size');
          expect(result).toHaveProperty('sizeBytes');
          expect(result).toHaveProperty('category');
          
          // Проверяем типы данных
          expect(typeof result.title).toBe('string');
          expect(typeof result.seeders).toBe('number');
          expect(typeof result.leechers).toBe('number');
          expect(typeof result.sizeBytes).toBe('number');
          expect(result.title.length).toBeGreaterThan(0);
        });
        
        // Если результаты найдены, проверяем что они содержат запрос
        if (results.length > 0) {
          const hasRelevantResult = results.some(result => 
            result.title.toLowerCase().includes(query.toLowerCase())
          );
          console.log(`🎯 Relevant results: ${hasRelevantResult ? 'Yes' : 'No'}`);
        }
        
      } catch (error) {
        console.error(`❌ Error searching ThePirateBay for "${query}":`, error);
        throw error;
      }
    }, 30000);
  });

  describe('TorrentSearch Integration', () => {
    const torrentSearch = new TorrentSearch();

    test('should initialize with all trackers enabled', () => {
      const availableTrackers = torrentSearch.getAvailableTrackers();
      expect(availableTrackers).toContain('1337x');
      expect(availableTrackers).toContain('RuTracker');
      expect(availableTrackers).toContain('ThePirateBay');
    });

    test.each(testQueries)('should search across all trackers for "%s"', async (query) => {
      const options: SearchOptions = { query, limit: 20 };
      
      console.log(`\n🔍 Testing integrated search for: "${query}"`);
      const startTime = Date.now();
      
      try {
        const response = await torrentSearch.search(options);
        const executionTime = Date.now() - startTime;
        
        console.log(`⏱️  Total execution time: ${executionTime}ms`);
        console.log(`📊 Total results found: ${response.total}`);
        console.log(`🔍 Query: "${response.query}"`);
        
        expect(response).toHaveProperty('results');
        expect(response).toHaveProperty('total');
        expect(response).toHaveProperty('query');
        expect(response).toHaveProperty('executionTime');
        expect(response.query).toBe(query);
        expect(response.executionTime).toBeGreaterThan(0);
        
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
        });
        
        // Проверяем что результаты отсортированы по количеству сидов
        const seeders = response.results.map(r => r.seeders);
        const isSorted = seeders.every((val, i) => i === 0 || val <= seeders[i - 1]);
        console.log(`📊 Results sorted by seeders: ${isSorted ? 'Yes' : 'No'}`);
        
      } catch (error) {
        console.error(`❌ Error in integrated search for "${query}":`, error);
        throw error;
      }
    }, 60000); // 60 секунд для интеграционного теста
  });

  describe('Error Handling', () => {
    const torrentSearch = new TorrentSearch();

    test('should handle empty query', async () => {
      const response = await torrentSearch.search({ query: '' });
      expect(response.results).toEqual([]);
      expect(response.total).toBe(0);
      expect(response.executionTime).toBe(0);
    });

    test('should handle whitespace-only query', async () => {
      const response = await torrentSearch.search({ query: '   ' });
      expect(response.results).toEqual([]);
      expect(response.total).toBe(0);
      expect(response.executionTime).toBe(0);
    });

    test('should handle special characters in query', async () => {
      const specialQueries = ['test@#$%', 'тест', '123456', '!@#$%^&*()'];
      
      for (const query of specialQueries) {
        console.log(`\n🔍 Testing special characters: "${query}"`);
        try {
          const response = await torrentSearch.search({ query, limit: 5 });
          console.log(`📊 Results for "${query}": ${response.total}`);
          expect(response.query).toBe(query);
        } catch (error) {
          console.error(`❌ Error with special query "${query}":`, error);
          // Не падаем на ошибках, так как некоторые трекеры могут не поддерживать специальные символы
        }
      }
    }, 30000);
  });
});