import axios from 'axios';
import { X1337x } from '../trackers/1337x';
import { RuTracker } from '../trackers/RuTracker';
import { ThePirateBay } from '../trackers/ThePirateBay';

// Мокаем axios для тестирования сетевых запросов
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Network Requests Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1337x Network Requests', () => {
    const tracker = new X1337x();

    test('should make correct request to 1337x', async () => {
      const mockResponse = {
        data: `
          <html>
            <body>
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
            </body>
          </html>
        `
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const results = await tracker.search('test movie', { query: 'test movie', limit: 10 });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Movie');
      expect(results[0].tracker).toBe('1337x');
    });

    test('should handle 1337x request errors', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Network error'))
      } as any);

      const results = await tracker.search('test', { query: 'test', limit: 10 });

      expect(results).toEqual([]);
    });

    test('should use correct search parameters for 1337x', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: '<html><body></body></html>' });
      mockedAxios.create.mockReturnValue({ get: mockGet } as any);

      await tracker.search('inception', { 
        query: 'inception', 
        category: 'movie',
        limit: 20 
      });

      expect(mockGet).toHaveBeenCalledWith('/search', {
        search: 'inception',
        category: 'Movies',
        sort: 'time'
      });
    });
  });

  describe('RuTracker Network Requests', () => {
    const tracker = new RuTracker();

    test('should make correct request to RuTracker', async () => {
      const mockResponse = {
        data: `
          <html>
            <body>
              <table>
                <tr class="tCenter">
                  <td class="t-title">
                    <a href="/viewtopic.php?t=123456">Тестовый фильм</a>
                    <a href="magnet:?xt=urn:btih:abc123">Magnet</a>
                  </td>
                  <td class="t-size">1.5 GB</td>
                  <td class="seedmed"><b>150</b></td>
                  <td class="leechmed"><b>25</b></td>
                </tr>
              </table>
            </body>
          </html>
        `
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const results = await tracker.search('тест', { query: 'тест', limit: 10 });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Тестовый фильм');
      expect(results[0].tracker).toBe('RuTracker');
    });

    test('should use correct search parameters for RuTracker', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: '<html><body></body></html>' });
      mockedAxios.create.mockReturnValue({ get: mockGet } as any);

      await tracker.search('breaking bad', { 
        query: 'breaking bad', 
        category: 'series',
        limit: 15 
      });

      expect(mockGet).toHaveBeenCalledWith('/forum/tracker.php', {
        nm: 'breaking bad',
        f: '2',
        o: 1,
        s: 1
      });
    });
  });

  describe('ThePirateBay Network Requests', () => {
    const tracker = new ThePirateBay();

    test('should make correct request to ThePirateBay', async () => {
      const mockResponse = {
        data: `
          <html>
            <body>
              <table id="searchResult">
                <tr>
                  <td>Video</td>
                  <td>
                    <a href="/description.php?id=123456">Test Movie</a>
                    <a href="magnet:?xt=urn:btih:abc123">Magnet</a>
                  </td>
                  <td>1.3 GB</td>
                  <td>180</td>
                  <td>20</td>
                </tr>
              </table>
            </body>
          </html>
        `
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const results = await tracker.search('test', { query: 'test', limit: 10 });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Movie');
      expect(results[0].tracker).toBe('ThePirateBay');
    });

    test('should use correct search parameters for ThePirateBay', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: '<html><body></body></html>' });
      mockedAxios.create.mockReturnValue({ get: mockGet } as any);

      await tracker.search('avatar', { 
        query: 'avatar', 
        category: 'movie',
        limit: 25 
      });

      expect(mockGet).toHaveBeenCalledWith('/s.php', {
        q: 'avatar',
        cat: '201',
        orderby: '7',
        page: 0
      });
    });
  });

  describe('HTTP Client Configuration', () => {
    test('should configure axios with correct settings', () => {
      const tracker = new X1337x();
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://1337x.to',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
    });

    test('should handle different response status codes', async () => {
      const tracker = new X1337x();

      // Тест 404 ошибки
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          response: { status: 404, statusText: 'Not Found' }
        })
      } as any);

      const results404 = await tracker.search('test', { query: 'test', limit: 10 });
      expect(results404).toEqual([]);

      // Тест 500 ошибки
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          response: { status: 500, statusText: 'Internal Server Error' }
        })
      } as any);

      const results500 = await tracker.search('test', { query: 'test', limit: 10 });
      expect(results500).toEqual([]);

      // Тест таймаута
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          code: 'ECONNABORTED',
          message: 'timeout of 10000ms exceeded'
        })
      } as any);

      const resultsTimeout = await tracker.search('test', { query: 'test', limit: 10 });
      expect(resultsTimeout).toEqual([]);
    });

    test('should handle network connectivity issues', async () => {
      const tracker = new X1337x();

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          code: 'ENOTFOUND',
          message: 'getaddrinfo ENOTFOUND 1337x.to'
        })
      } as any);

      const results = await tracker.search('test', { query: 'test', limit: 10 });
      expect(results).toEqual([]);
    });
  });

  describe('Rate Limiting', () => {
    test('should respect rate limits between requests', async () => {
      const tracker = new X1337x();
      const mockGet = jest.fn().mockResolvedValue({ 
        data: '<html><body><div class="table-list"><tbody></tbody></div></body></html>' 
      });
      mockedAxios.create.mockReturnValue({ get: mockGet } as any);

      // Делаем несколько запросов подряд
      await tracker.search('test1', { query: 'test1', limit: 10 });
      await tracker.search('test2', { query: 'test2', limit: 10 });
      await tracker.search('test3', { query: 'test3', limit: 10 });

      expect(mockGet).toHaveBeenCalledTimes(3);
    });
  });

  describe('User Agent and Headers', () => {
    test('should use realistic user agent', () => {
      const tracker = new X1337x();
      
      const createCall = mockedAxios.create.mock.calls[0]?.[0];
      expect(createCall).toBeDefined();
      expect(createCall?.headers).toBeDefined();
      expect((createCall?.headers as any)?.['User-Agent']).toContain('Mozilla');
      expect((createCall?.headers as any)?.['User-Agent']).toContain('Chrome');
    });

    test('should set appropriate timeout', () => {
      const tracker = new X1337x();
      
      const createCall = mockedAxios.create.mock.calls[0]?.[0];
      expect(createCall).toBeDefined();
      expect(createCall?.timeout).toBe(10000);
    });
  });
});