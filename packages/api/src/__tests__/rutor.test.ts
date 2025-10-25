import { RuTor } from '../trackers/RuTor';

describe('RuTor Tracker', () => {
  let rutor: RuTor;

  beforeEach(() => {
    rutor = new RuTor();
  });

  test('should initialize with correct config', () => {
    expect(rutor.config.name).toBe('RuTor');
    expect(rutor.config.baseUrl).toBe('https://rutor.org');
    expect(rutor.config.enabled).toBe(true);
  });

  test('should parse search results HTML', () => {
    const mockHtml = `
      <html>
        <body>
          <div class="gai">
            <table>
              <tbody>
                <tr>
                  <td>1</td>
                  <td><a href="/torrent/123456/test-movie-2023">Test Movie 2023</a></td>
                  <td>15.12.2023</td>
                  <td>1.5 GB</td>
                  <td>15</td>
                  <td>3</td>
                  <td><a href="magnet:?xt=urn:btih:test123">Magnet</a></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td><a href="/torrent/789012/test-series-s01e01">Test Series S01E01</a></td>
                  <td>14.12.2023</td>
                  <td>800 MB</td>
                  <td>8</td>
                  <td>1</td>
                  <td><a href="magnet:?xt=urn:btih:test456">Magnet</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const results = rutor['parseSearchResults'](mockHtml, 'test');
    
    expect(results).toHaveLength(2);
    
    // Проверяем первый результат
    expect(results[0].title).toBe('Test Movie 2023');
    expect(results[0].size).toBe('1.5 GB');
    expect(results[0].seeders).toBe(15);
    expect(results[0].leechers).toBe(3);
    expect(results[0].tracker).toBe('RuTor');
    expect(results[0].category).toBe('movie');
    expect(results[0].torrentUrl).toBe('https://rutor.org/torrent/123456/test-movie-2023');
    expect(results[0].magnetUrl).toBe('magnet:?xt=urn:btih:test123');

    // Проверяем второй результат
    expect(results[1].title).toBe('Test Series S01E01');
    expect(results[1].size).toBe('800 MB');
    expect(results[1].seeders).toBe(8);
    expect(results[1].leechers).toBe(1);
    expect(results[1].category).toBe('series');
  });

  test('should handle empty results', () => {
    const mockHtml = `
      <html>
        <body>
          <div class="gai">
            <table>
              <tbody>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const results = rutor['parseSearchResults'](mockHtml, 'test');
    expect(results).toHaveLength(0);
  });

  test('should extract category correctly', () => {
    const movieTitle = 'Test Movie 2023 HD';
    const seriesTitle = 'Test Series Season 1 Episode 1';
    const cartoonTitle = 'Test Cartoon Animation';

    expect(rutor['determineCategory'](movieTitle)).toBe('movie');
    expect(rutor['determineCategory'](seriesTitle)).toBe('series');
    expect(rutor['determineCategory'](cartoonTitle)).toBe('cartoon');
  });

  test('should extract quality correctly', () => {
    const title1 = 'Test Movie 1080p HD';
    const title2 = 'Test Movie 4K UHD';
    const title3 = 'Test Movie BluRay';

    expect(rutor['extractQuality'](title1)).toBe('1080p');
    expect(rutor['extractQuality'](title2)).toBe('4K');
    expect(rutor['extractQuality'](title3)).toBe('BluRay');
  });

  test('should extract year correctly', () => {
    const title1 = 'Test Movie 2023';
    const title2 = 'Test Movie (2022)';
    const title3 = 'Test Movie without year';

    expect(rutor['extractYear'](title1)).toBe(2023);
    expect(rutor['extractYear'](title2)).toBe(2022);
    expect(rutor['extractYear'](title3)).toBeUndefined();
  });

  test('should parse date correctly', () => {
    const date1 = '15.12.2023';
    const date2 = '1/1/2024';
    const date3 = '2024-01-01';

    const parsedDate1 = rutor['parseDate'](date1);
    const parsedDate2 = rutor['parseDate'](date2);
    const parsedDate3 = rutor['parseDate'](date3);

    expect(parsedDate1).toBeInstanceOf(Date);
    expect(parsedDate2).toBeInstanceOf(Date);
    expect(parsedDate3).toBeInstanceOf(Date);
  });
});