import { Nyaa } from '../trackers/Nyaa';
import { YTS } from '../trackers/YTS';
import { RARBG } from '../trackers/RARBG';
import { LimeTorrents } from '../trackers/LimeTorrents';

describe('New Trackers', () => {
  describe('Nyaa Tracker', () => {
    let nyaa: Nyaa;

    beforeEach(() => {
      nyaa = new Nyaa();
    });

    test('should initialize with correct config', () => {
      expect(nyaa.config.name).toBe('Nyaa');
      expect(nyaa.config.baseUrl).toBe('https://nyaa.si');
      expect(nyaa.config.enabled).toBe(true);
    });

    test('should parse search results HTML', () => {
      const mockHtml = `
        <html>
          <body>
            <table class="torrent-list">
              <tbody>
                <tr>
                  <td>1</td>
                  <td><a href="/view/123456">Test Anime Episode 1</a></td>
                  <td>15.12.2023</td>
                  <td>1.2 GB</td>
                  <td>5</td>
                  <td>15</td>
                  <td>3</td>
                  <td><a href="magnet:?xt=urn:btih:test123">Magnet</a></td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const results = nyaa['parseSearchResults'](mockHtml, 'test');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Anime Episode 1');
      expect(results[0].size).toBe('1.2 GB');
      expect(results[0].seeders).toBe(15);
      expect(results[0].leechers).toBe(3);
      expect(results[0].tracker).toBe('Nyaa');
      expect(results[0].category).toBe('cartoon');
    });

    test('should determine anime category correctly', () => {
      const animeTitle = 'Test Anime Episode 1';
      const mangaTitle = 'Test Manga Chapter 1';
      const ovaTitle = 'Test OVA Special';

      expect(nyaa['determineCategory'](animeTitle)).toBe('cartoon');
      expect(nyaa['determineCategory'](mangaTitle)).toBe('cartoon');
      expect(nyaa['determineCategory'](ovaTitle)).toBe('cartoon');
    });
  });

  describe('YTS Tracker', () => {
    let yts: YTS;

    beforeEach(() => {
      yts = new YTS();
    });

    test('should initialize with correct config', () => {
      expect(yts.config.name).toBe('YTS');
      expect(yts.config.baseUrl).toBe('https://yts.mx');
      expect(yts.config.enabled).toBe(true);
    });

    test('should parse API results', () => {
      const mockApiResponse = {
        data: {
          movies: [
            {
              id: 123,
              title: 'Test Movie',
              year: 2023,
              slug: 'test-movie-2023',
              torrents: [
                {
                  hash: 'abc123',
                  quality: '1080p',
                  size: '1.5 GB',
                  seeds: 10,
                  peers: 15
                }
              ]
            }
          ]
        }
      };

      const results = yts['parseApiResults'](mockApiResponse, 'test');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Movie (2023) 1080p');
      expect(results[0].year).toBe(2023);
      expect(results[0].quality).toBe('1080p');
      expect(results[0].tracker).toBe('YTS');
      expect(results[0].category).toBe('movie');
    });
  });

  describe('RARBG Tracker', () => {
    let rarbg: RARBG;

    beforeEach(() => {
      rarbg = new RARBG();
    });

    test('should initialize with correct config', () => {
      expect(rarbg.config.name).toBe('RARBG');
      expect(rarbg.config.baseUrl).toBe('https://rarbg.to');
      expect(rarbg.config.enabled).toBe(true);
    });

    test('should determine category correctly', () => {
      const movieTitle = 'Test Movie 2023';
      const seriesTitle = 'Test Series S01E01';
      const animeTitle = 'Test Anime Episode 1';

      expect(rarbg['determineCategory'](movieTitle)).toBe('movie');
      expect(rarbg['determineCategory'](seriesTitle)).toBe('series');
      expect(rarbg['determineCategory'](animeTitle)).toBe('cartoon');
    });
  });

  describe('LimeTorrents Tracker', () => {
    let limeTorrents: LimeTorrents;

    beforeEach(() => {
      limeTorrents = new LimeTorrents();
    });

    test('should initialize with correct config', () => {
      expect(limeTorrents.config.name).toBe('LimeTorrents');
      expect(limeTorrents.config.baseUrl).toBe('https://www.limetorrents.lol');
      expect(limeTorrents.config.enabled).toBe(true);
    });

    test('should determine category correctly', () => {
      const movieTitle = 'Test Movie 2023';
      const seriesTitle = 'Test Series Season 1 Episode 1';
      const animeTitle = 'Test Anime Episode 1';

      expect(limeTorrents['determineCategory'](movieTitle)).toBe('movie');
      expect(limeTorrents['determineCategory'](seriesTitle)).toBe('series');
      expect(limeTorrents['determineCategory'](animeTitle)).toBe('cartoon');
    });
  });
});