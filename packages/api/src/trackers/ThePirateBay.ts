import { BaseTracker } from './BaseTracker';
import { TorrentResult, SearchOptions } from '../types';

export class ThePirateBay extends BaseTracker {
  constructor() {
    super({
      name: 'ThePirateBay',
      baseUrl: 'https://thepiratebay.org',
      searchPath: '/s.php',
      enabled: true,
      rateLimit: 2000
    });
  }

  async search(query: string, options: SearchOptions): Promise<TorrentResult[]> {
    try {
      const searchUrl = this.config.searchPath;
      const params = {
        q: query,
        cat: this.getCategoryFilter(options.category),
        orderby: '7', // сортировка по дате
        page: 0
      };

      const html = await this.makeRequest(searchUrl, params);
      return this.parseSearchResults(html, query);
    } catch (error) {
      console.error('ThePirateBay search error:', error);
      return [];
    }
  }

  protected parseSearchResults(html: string, query: string): TorrentResult[] {
    const $ = this.parseHtml(html);
    const results: TorrentResult[] = [];

    $('#searchResult tr').each((index, element) => {
      if (index === 0) return; // пропускаем заголовок

      const $row = $(element);
      const titleElement = $row.find('td:nth-child(2) a');
      
      if (titleElement.length === 0) return;

      const title = this.extractText($, titleElement);
      const torrentUrl = this.config.baseUrl + titleElement.attr('href');
      
      // Извлекаем информацию о размере
      const sizeInfo = this.extractSize($, $row.find('td:nth-child(3)'));
      
      // Извлекаем информацию о сидах/личах
      const seeders = this.extractNumber($, $row.find('td:nth-child(4)'));
      const leechers = this.extractNumber($, $row.find('td:nth-child(5)'));

      // Извлекаем magnet ссылку
      const magnetElement = $row.find('td:nth-child(2) a[href^="magnet:"]');
      const magnetUrl = magnetElement.attr('href');

      // Извлекаем torrent ссылку
      const torrentLinkElement = $row.find('td:nth-child(2) a[href*="download.php"]');
      const torrentLink = torrentLinkElement.length > 0 
        ? this.config.baseUrl + torrentLinkElement.attr('href')
        : undefined;

      const result: TorrentResult = {
        id: `tpb_${index}`,
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
      'movie': '201', // Видео > Фильмы
      'series': '205', // Видео > ТВ-шоу
      'cartoon': '203', // Видео > Мультфильмы
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