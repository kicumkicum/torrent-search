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
    expect(trackers).toContain('1337x');
    expect(trackers).toContain('RuTracker');
    expect(trackers).toContain('ThePirateBay');
  });

  test('should enable/disable trackers', () => {
    const initialTrackers = torrentSearch.getAvailableTrackers();
    expect(initialTrackers).toContain('1337x');
    
    torrentSearch.disableTracker('1337x');
    const afterDisable = torrentSearch.getAvailableTrackers();
    expect(afterDisable).not.toContain('1337x');
    
    torrentSearch.enableTracker('1337x');
    const afterEnable = torrentSearch.getAvailableTrackers();
    expect(afterEnable).toContain('1337x');
  });
});