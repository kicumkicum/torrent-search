import { X1337x } from '../trackers/1337x';
import { RuTracker } from '../trackers/RuTracker';
import { ThePirateBay } from '../trackers/ThePirateBay';

describe('HTML Parsing Tests', () => {
  describe('1337x HTML Parsing', () => {
    const tracker = new X1337x();

    test('should parse 1337x search results HTML', () => {
      // Упрощенный HTML для тестирования
      const mockHtml = `
        <div class="table-list">
          <tbody>
            <tr>
              <td>
                <a href="/torrent/123456/test-movie-2023/">Test Movie 2023</a>
                <a href="magnet:?xt=urn:btih:abc123">Magnet</a>
                <a href="/download.php?id=123456">Download</a>
              </td>
              <td>150</td>
              <td>25</td>
              <td>1.2 GB</td>
            </tr>
            <tr>
              <td>
                <a href="/torrent/789012/another-movie/">Another Movie</a>
                <a href="magnet:?xt=urn:btih:def456">Magnet</a>
              </td>
              <td>75</td>
              <td>10</td>
              <td>800 MB</td>
            </tr>
          </tbody>
        </div>
      `;

      const results = (tracker as any).parseSearchResults(mockHtml, 'test');
      
      // Отладочная информация
      console.log('Parsed results:', results);
      console.log('Results length:', results.length);
      
      expect(results).toHaveLength(2);
      
      // Проверяем первый результат
      expect(results[0].title).toBe('Test Movie 2023');
      expect(results[0].seeders).toBe(150);
      expect(results[0].leechers).toBe(25);
      expect(results[0].size).toBe('1.2 GB');
      expect(results[0].sizeBytes).toBeGreaterThan(0);
      expect(results[0].magnetUrl).toBe('magnet:?xt=urn:btih:abc123');
      expect(results[0].torrentUrl).toContain('download.php');
      expect(results[0].tracker).toBe('1337x');
      
      // Проверяем второй результат
      expect(results[1].title).toBe('Another Movie');
      expect(results[1].seeders).toBe(75);
      expect(results[1].leechers).toBe(10);
      expect(results[1].size).toBe('800 MB');
      expect(results[1].magnetUrl).toBe('magnet:?xt=urn:btih:def456');
      expect(results[1].torrentUrl).toBeUndefined();
    });

    test('should handle empty 1337x results', () => {
      const emptyHtml = `
        <html>
          <body>
            <div class="table-list">
              <tbody>
              </tbody>
            </div>
          </body>
        </html>
      `;

      const results = (tracker as any).parseSearchResults(emptyHtml, 'test');
      expect(results).toHaveLength(0);
    });
  });

  describe('RuTracker HTML Parsing', () => {
    const tracker = new RuTracker();

    test('should parse RuTracker search results HTML', () => {
      const mockHtml = `
        <table>
          <tr class="tCenter">
            <th>Title</th>
            <th>Size</th>
            <th>Seeders</th>
            <th>Leechers</th>
          </tr>
          <tr class="tCenter">
            <td class="t-title">
              <a href="/viewtopic.php?t=123456">Тестовый фильм 2023</a>
              <a href="magnet:?xt=urn:btih:abc123">Magnet</a>
              <a href="download.php?id=123456">Download</a>
            </td>
            <td class="t-size">1.5 GB</td>
            <td class="seedmed"><b>200</b></td>
            <td class="leechmed"><b>30</b></td>
          </tr>
          <tr class="tCenter">
            <td class="t-title">
              <a href="/viewtopic.php?t=789012">Другой фильм</a>
              <a href="magnet:?xt=urn:btih:def456">Magnet</a>
            </td>
            <td class="t-size">900 MB</td>
            <td class="seedmed"><b>100</b></td>
            <td class="leechmed"><b>15</b></td>
          </tr>
        </table>
      `;

      const results = (tracker as any).parseSearchResults(mockHtml, 'тест');
      
      console.log('RuTracker parsed results:', results);
      console.log('RuTracker results length:', results.length);
      
      expect(results).toHaveLength(2);
      
      // Проверяем первый результат
      expect(results[0].title).toBe('Тестовый фильм 2023');
      expect(results[0].seeders).toBe(200);
      expect(results[0].leechers).toBe(30);
      expect(results[0].size).toBe('1.5 GB');
      expect(results[0].sizeBytes).toBeGreaterThan(0);
      expect(results[0].magnetUrl).toBe('magnet:?xt=urn:btih:abc123');
      expect(results[0].torrentUrl).toContain('download.php');
      expect(results[0].tracker).toBe('RuTracker');
      
      // Проверяем второй результат
      expect(results[1].title).toBe('Другой фильм');
      expect(results[1].seeders).toBe(100);
      expect(results[1].leechers).toBe(15);
      expect(results[1].size).toBe('900 MB');
      expect(results[1].magnetUrl).toBe('magnet:?xt=urn:btih:def456');
      expect(results[1].torrentUrl).toBeUndefined();
    });
  });

  describe('ThePirateBay HTML Parsing', () => {
    const tracker = new ThePirateBay();

    test('should parse ThePirateBay search results HTML', () => {
      const mockHtml = `
        <html>
          <body>
            <table id="searchResult">
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Size</th>
                <th>SE</th>
                <th>LE</th>
              </tr>
              <tr>
                <td>Video</td>
                <td>
                  <a href="/description.php?id=123456">Test Movie 2023</a>
                  <a href="magnet:?xt=urn:btih:abc123">Magnet</a>
                  <a href="download.php?id=123456">Download</a>
                </td>
                <td>1.3 GB</td>
                <td>180</td>
                <td>20</td>
              </tr>
              <tr>
                <td>Video</td>
                <td>
                  <a href="/description.php?id=789012">Another Movie</a>
                  <a href="magnet:?xt=urn:btih:def456">Magnet</a>
                </td>
                <td>750 MB</td>
                <td>90</td>
                <td>12</td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const results = (tracker as any).parseSearchResults(mockHtml, 'test');
      
      expect(results).toHaveLength(2);
      
      // Проверяем первый результат
      expect(results[0].title).toContain('Test Movie 2023');
      expect(results[0].seeders).toBe(180);
      expect(results[0].leechers).toBe(20);
      expect(results[0].size).toBe('1.3 GB');
      expect(results[0].sizeBytes).toBeGreaterThan(0);
      expect(results[0].magnetUrl).toBe('magnet:?xt=urn:btih:abc123');
      expect(results[0].torrentUrl).toContain('download.php');
      expect(results[0].tracker).toBe('ThePirateBay');
      
      // Проверяем второй результат
      expect(results[1].title).toBe('Another Movie');
      expect(results[1].seeders).toBe(90);
      expect(results[1].leechers).toBe(12);
      expect(results[1].size).toBe('750 MB');
      expect(results[1].magnetUrl).toBe('magnet:?xt=urn:btih:def456');
      expect(results[1].torrentUrl).toBeUndefined();
    });
  });

  describe('Size Parsing', () => {
    const tracker = new X1337x();

    test('should parse different size formats', () => {
      const testCases = [
        { input: '1.5 GB', expected: 1.5 * 1024 * 1024 * 1024 },
        { input: '500 MB', expected: 500 * 1024 * 1024 },
        { input: '2.3 TB', expected: 2.3 * 1024 * 1024 * 1024 * 1024 },
        { input: '100 KB', expected: 100 * 1024 },
        { input: '50 B', expected: 50 },
        { input: 'invalid', expected: 0 }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (tracker as any).parseSizeToBytes(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Category Detection', () => {
    const tracker = new X1337x();

    test('should detect movie category', () => {
      const movieTitles = [
        'Inception 2010',
        'Avatar 2009',
        'The Dark Knight'
      ];

      movieTitles.forEach(title => {
        const category = (tracker as any).determineCategory(title);
        expect(category).toBe('movie');
      });
    });

    test('should detect series category', () => {
      const seriesTitles = [
        'Breaking Bad Season 1',
        'Game of Thrones Episode 1',
        'The Office Season 2 Episode 5'
      ];

      seriesTitles.forEach(title => {
        const category = (tracker as any).determineCategory(title);
        expect(category).toBe('series');
      });
    });

    test('should detect cartoon category', () => {
      const cartoonTitles = [
        'Toy Story мультфильм',
        'Frozen animation',
        'Shrek cartoon'
      ];

      cartoonTitles.forEach(title => {
        const category = (tracker as any).determineCategory(title);
        expect(category).toBe('cartoon');
      });
    });
  });

  describe('Quality Extraction', () => {
    const tracker = new X1337x();

    test('should extract quality from titles', () => {
      const testCases = [
        { title: 'Movie 2023 1080p', expected: '1080p' },
        { title: 'Film 4K UHD', expected: '4K' },
        { title: 'Show BluRay 720p', expected: '720p' },
        { title: 'Series WEBRip', expected: 'WEBRip' },
        { title: 'No quality info', expected: undefined }
      ];

      testCases.forEach(({ title, expected }) => {
        const quality = (tracker as any).extractQuality(title);
        expect(quality).toBe(expected);
      });
    });
  });

  describe('Year Extraction', () => {
    const tracker = new X1337x();

    test('should extract year from titles', () => {
      const testCases = [
        { title: 'Movie 2023', expected: 2023 },
        { title: 'Film (2020)', expected: 2020 },
        { title: 'Show 2019 1080p', expected: 2019 },
        { title: 'No year', expected: undefined }
      ];

      testCases.forEach(({ title, expected }) => {
        const year = (tracker as any).extractYear(title);
        expect(year).toBe(expected);
      });
    });
  });
});