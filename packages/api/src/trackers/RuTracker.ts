import { BaseTracker } from './BaseTracker';
import { TorrentResult, SearchOptions } from '../types';

export class RuTracker extends BaseTracker {
  constructor() {
    super({
      name: 'RuTracker',
      baseUrl: 'https://rutracker.org',
      searchPath: '/forum/tracker.php',
      enabled: true,
      rateLimit: 1000
    });
  }

  async search(query: string, options: SearchOptions): Promise<TorrentResult[]> {
    try {
      const searchUrl = this.config.searchPath;
      const params = {
        nm: query,
        f: this.getCategoryFilter(options.category),
        o: 1, // сортировка по дате
        s: 1  // сортировка по убыванию
      };

      const html = await this.makeRequest(searchUrl, params);
      return this.parseSearchResults(html, query);
    } catch (error) {
      console.error('RuTracker search error:', error);
      return [];
    }
  }

  protected parseSearchResults(html: string, query: string): TorrentResult[] {
    const $ = this.parseHtml(html);
    const results: TorrentResult[] = [];

    $('.tCenter tr').each((index, element) => {
      if (index === 0) return; // пропускаем заголовок

      const $row = $(element);
      const titleElement = $row.find('td.t-title a');
      
      if (titleElement.length === 0) return;

      const title = this.extractText($, titleElement);
      const torrentUrl = this.config.baseUrl + titleElement.attr('href');
      
      // Извлекаем информацию о размере
      const sizeInfo = this.extractSize($, $row.find('td.t-size'));
      
      // Извлекаем информацию о сидах/личах
      const seeders = this.extractNumber($, $row.find('td.seedmed b'));
      const leechers = this.extractNumber($, $row.find('td.leechmed b'));

      // Извлекаем magnet ссылку
      const magnetElement = $row.find('td.t-title a[href^="magnet:"]');
      const magnetUrl = magnetElement.attr('href');

      // Извлекаем torrent ссылку
      const torrentLinkElement = $row.find('td.t-title a[href*="download.php"]');
      const torrentLink = torrentLinkElement.length > 0 
        ? this.config.baseUrl + torrentLinkElement.attr('href')
        : undefined;

      const result: TorrentResult = {
        id: `rutracker_${index}`,
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

    return results;
  }

  private getCategoryFilter(category?: string): string {
    const categoryMap: { [key: string]: string } = {
      'movie': '1', // Фильмы
      'series': '2', // Сериалы
      'cartoon': '3', // Мультфильмы
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