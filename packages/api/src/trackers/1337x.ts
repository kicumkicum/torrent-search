import { BaseTracker } from './BaseTracker';
import { TorrentResult, SearchOptions } from '../types';

export class X1337x extends BaseTracker {
  constructor() {
    super({
      name: '1337x',
      baseUrl: 'https://1337x.to',
      searchPath: '/search',
      enabled: false, // Временно отключен из-за Cloudflare защиты
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
    console.log('1337x HTML length:', html.length);
    console.log('1337x Found .table-list tbody tr elements:', $('.table-list tbody tr').length);
    console.log('1337x Found .table-list elements:', $('.table-list').length);
    console.log('1337x Found .table-list tbody elements:', $('.table-list tbody').length);
    console.log('1337x Found tr elements:', $('tr').length);
    console.log('1337x Found table elements:', $('table').length);

    // Попробуем разные селекторы
    const selectors = [
      '.table-list tbody tr',
      '.table-list tr',
      'table tbody tr',
      'table tr',
      '.search-result',
      '.result'
    ];

    let foundRows = 0;
    for (const selector of selectors) {
      const rows = $(selector);
      console.log(`1337x Selector "${selector}": ${rows.length} elements`);
      if (rows.length > 0) {
        foundRows = rows.length;
        break;
      }
    }

    if (foundRows === 0) {
      console.log('1337x No rows found with any selector');
      // Выведем часть HTML для анализа
      console.log('1337x HTML sample:', html.substring(0, 1000));
      return results;
    }

    $('.table-list tbody tr, .table-list tr, table tbody tr, table tr').each((index, element) => {
      const $row = $(element);
      
      // Ищем ссылку на торрент (не magnet и не download)
      let titleElement = $row.find('a[href*="/torrent/"]').first();
      if (titleElement.length === 0) {
        titleElement = $row.find('td:nth-child(1) a').not('[href^="magnet:"]').not('[href*="download.php"]').first();
      }
      if (titleElement.length === 0) {
        titleElement = $row.find('a').not('[href^="magnet:"]').not('[href*="download.php"]').first();
      }
      
      if (titleElement.length === 0) return;

      const title = this.extractText($, titleElement);
      if (!title || title.trim().length === 0) return;

      const torrentUrl = titleElement.attr('href')?.startsWith('http') 
        ? titleElement.attr('href')
        : this.config.baseUrl + titleElement.attr('href');
      
      // Извлекаем информацию о размере
      const sizeInfo = this.extractSize($, $row.find('td:nth-child(4), td:nth-child(3), td:last-child'));
      
      // Извлекаем информацию о сидах/личах
      const seeders = this.extractNumber($, $row.find('td:nth-child(2), td:nth-child(1)'));
      const leechers = this.extractNumber($, $row.find('td:nth-child(3), td:nth-child(2)'));

      // Извлекаем magnet ссылку
      const magnetElement = $row.find('a[href^="magnet:"]');
      const magnetUrl = magnetElement.attr('href');

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
        torrentUrl: torrentUrl,
        magnetUrl: magnetUrl,
        tracker: this.config.name,
        category: this.determineCategory(title),
        quality: this.extractQuality(title),
        resolution: this.extractResolution(title)
      };

      results.push(result);
    });

    console.log('1337x Total results parsed:', results.length);
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