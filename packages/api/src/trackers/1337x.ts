import { BaseTracker } from './BaseTracker';
import { TorrentResult, SearchOptions } from '../types';

export class X1337x extends BaseTracker {
  constructor() {
    super({
      name: '1337x',
      baseUrl: 'https://1337x.to',
      searchPath: '/search',
      enabled: true,
      rateLimit: 1500
    });
  }

  async search(query: string, options: SearchOptions): Promise<TorrentResult[]> {
    try {
      const searchUrl = this.config.searchPath;
      const params = {
        search: query,
        category: this.getCategoryFilter(options.category),
        sort: 'time' // сортировка по времени
      };

      const html = await this.makeRequest(searchUrl, params);
      return this.parseSearchResults(html, query);
    } catch (error) {
      console.error('1337x search error:', error);
      return [];
    }
  }

  protected parseSearchResults(html: string, query: string): TorrentResult[] {
    const $ = this.parseHtml(html);
    const results: TorrentResult[] = [];

    // Отладочная информация
    console.log('HTML length:', html.length);
    console.log('Found .table-list tbody tr elements:', $('.table-list tbody tr').length);
    console.log('Found .table-list elements:', $('.table-list').length);

    $('.table-list tbody tr').each((index, element) => {
      const $row = $(element);
      console.log(`Processing row ${index}:`, $row.html());
      
      // Ищем ссылку на торрент (не magnet и не download)
      let titleElement = $row.find('a[href*="/torrent/"]').first();
      if (titleElement.length === 0) {
        titleElement = $row.find('td:nth-child(1) a').not('[href^="magnet:"]').not('[href*="download.php"]').first();
      }
      
      console.log('Title element found:', titleElement.length, titleElement.text());
      
      if (titleElement.length === 0) return;

      const title = this.extractText($, titleElement);
      const torrentUrl = this.config.baseUrl + titleElement.attr('href');
      
      // Извлекаем информацию о размере
      const sizeInfo = this.extractSize($, $row.find('td:nth-child(4)'));
      
      // Извлекаем информацию о сидах/личах
      const seeders = this.extractNumber($, $row.find('td:nth-child(2)'));
      const leechers = this.extractNumber($, $row.find('td:nth-child(3)'));

      // Извлекаем magnet ссылку
      const magnetElement = $row.find('td:nth-child(1) a[href^="magnet:"]');
      const magnetUrl = magnetElement.attr('href');

      // Извлекаем torrent ссылку
      const torrentLinkElement = $row.find('td:nth-child(1) a[href*="download.php"]');
      const torrentLink = torrentLinkElement.length > 0 
        ? this.config.baseUrl + torrentLinkElement.attr('href')
        : undefined;

      console.log('Parsed result:', { title, seeders, leechers, size: sizeInfo.size, magnetUrl, torrentLink });

      const result: TorrentResult = {
        id: `1337x_${index}`,
        title: title,
        year: this.extractYear(title),
        size: sizeInfo.size,
        sizeBytes: sizeInfo.sizeBytes,
        studio: this.extractStudio(title),
        audioTracks: this.extractAudioTracks(title),
        seeders: seeders,
        leechers: leechers,
        torrentUrl: torrentLink,
        magnetUrl: magnetUrl,
        tracker: this.config.name,
        category: this.determineCategory(title),
        quality: this.extractQuality(title),
        resolution: this.extractResolution(title)
      };

      results.push(result);
    });

    console.log('Total results parsed:', results.length);
    return results;
  }

  private getCategoryFilter(category?: string): string {
    const categoryMap: { [key: string]: string } = {
      'movie': 'Movies',
      'series': 'TV',
      'cartoon': 'Anime',
      'all': ''
    };
    return categoryMap[category || 'all'] || '';
  }

  private extractResolution(title: string): string | undefined {
    const resolutionPatterns = [
      /(\d{3,4}x\d{3,4})/i,
      /(\d{3,4}p)/i
    ];

    for (const pattern of resolutionPatterns) {
      const match = title.match(pattern);
      if (match) return match[1];
    }

    return undefined;
  }
}