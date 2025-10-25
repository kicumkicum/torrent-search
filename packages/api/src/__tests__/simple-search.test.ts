import { TorrentSearch } from '../TorrentSearch';
import { SearchOptions } from '../types';

describe('Simple Search Tests', () => {
  const torrentSearch = new TorrentSearch();

  test('should handle empty query', async () => {
    const response = await torrentSearch.search({ query: '', limit: 10 });
    expect(response.results).toEqual([]);
    expect(response.total).toBe(0);
    expect(response.executionTime).toBe(0);
  });

  test('should handle whitespace query', async () => {
    const response = await torrentSearch.search({ query: '   ', limit: 10 });
    expect(response.results).toEqual([]);
    expect(response.total).toBe(0);
    expect(response.executionTime).toBe(0);
  });

  test('should return valid response structure', async () => {
    const response = await torrentSearch.search({ query: 'test', limit: 5 });
    
    expect(response).toHaveProperty('results');
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('query');
    expect(response).toHaveProperty('executionTime');
    
    expect(Array.isArray(response.results)).toBe(true);
    expect(typeof response.total).toBe('number');
    expect(typeof response.query).toBe('string');
    expect(typeof response.executionTime).toBe('number');
    
    expect(response.query).toBe('test');
    expect(response.executionTime).toBeGreaterThanOrEqual(0);
  });

  test('should have available trackers', () => {
    const trackers = torrentSearch.getAvailableTrackers();
    expect(Array.isArray(trackers)).toBe(true);
    expect(trackers.length).toBeGreaterThan(0);
    expect(trackers).toContain('ThePirateBay');
    // 1337x and RuTracker are currently disabled due to Cloudflare protection
  });

  test('should enable/disable trackers', () => {
    const initialTrackers = torrentSearch.getAvailableTrackers();
    expect(initialTrackers).toContain('ThePirateBay');
    
    torrentSearch.disableTracker('ThePirateBay');
    const afterDisable = torrentSearch.getAvailableTrackers();
    expect(afterDisable).not.toContain('ThePirateBay');
    
    torrentSearch.enableTracker('ThePirateBay');
    const afterEnable = torrentSearch.getAvailableTrackers();
    expect(afterEnable).toContain('ThePirateBay');
  });
});