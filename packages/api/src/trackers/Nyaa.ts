import { BaseTracker } from './BaseTracker';
import { TorrentResult, SearchOptions } from '../types';

export class Nyaa extends BaseTracker {
  constructor() {
    super({
      name: 'Nyaa',
      baseUrl: 'https://nyaa.si',
      searchPath: '/',
      enabled: true,
      rateLimit: 1500
    });
  }

  async search(query: string, options: SearchOptions): Promise<TorrentResult[]> {
    try {
      const searchUrl = this.config.searchPath;
      const params = {
        q: query,
        c: this.getCategoryFilter(options.category),
        s: 'seeders', // сортировка по сидам
        o: 'desc' // по убыванию
      };

      const html = await this.makeRequest(searchUrl, params);
      return this.parseSearchResults(html, query);
    } catch (error) {
      console.error('Nyaa search error:', error);
      return [];
    }
  }

  protected parseSearchResults(html: string, query: string): TorrentResult[] {
    const $ = this.parseHtml(html);
    const results: TorrentResult[] = [];

    // Отладочная информация
    console.log('Nyaa HTML length:', html.length);
    console.log('Nyaa Found .torrent-list tbody tr elements:', $('.torrent-list tbody tr').length);

    // Парсим результаты поиска
    $('.torrent-list tbody tr').each((index, element) => {
      const $row = $(element);
      
      // Ищем ссылку на торрент
      let titleElement = $row.find('td:nth-child(2) a').not('[href^="magnet:"]').first();
      if (titleElement.length === 0) {
        titleElement = $row.find('a[href*="/view/"]').first();
      }
      
      if (titleElement.length === 0) return;

      const title = this.extractText($, titleElement);
      if (!title || title.trim().length === 0) return;

      const torrentUrl = titleElement.attr('href')?.startsWith('http') 
        ? titleElement.attr('href')
        : this.config.baseUrl + titleElement.attr('href');

      // Извлекаем информацию о размере
      const sizeInfo = this.extractSize($, $row.find('td:nth-child(4)'));

      // Извлекаем информацию о сидах/личах
      const seeders = this.extractNumber($, $row.find('td:nth-child(6)'));
      const leechers = this.extractNumber($, $row.find('td:nth-child(7)'));

      // Извлекаем magnet ссылку
      const magnetElement = $row.find('a[href^="magnet:"]');
      const magnetUrl = magnetElement.attr('href');

      // Извлекаем дату
      const dateText = this.extractText($, $row.find('td:nth-child(5)'));
      const uploadDate = this.parseDate(dateText);

      const result: TorrentResult = {
        id: `nyaa_${index}`,
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

    console.log('Nyaa Total results parsed:', results.length);
    return results;
  }

  private getCategoryFilter(category?: string): string {
    const categoryMap: { [key: string]: string } = {
      'anime': '1_0', // Anime - Anime
      'cartoon': '1_2', // Anime - Non-English-translated
      'series': '2_0', // Audio - Lossless
      'movie': '3_0', // Literature - Books
      'all': ''
    };
    return categoryMap[category || 'all'] || '';
  }

  protected determineCategory(title: string): 'movie' | 'series' | 'cartoon' | 'other' {
    const lowerTitle = title.toLowerCase();
    
    // Nyaa в основном для аниме
    if (lowerTitle.includes('anime') || lowerTitle.includes('аниме') || 
        lowerTitle.includes('manga') || lowerTitle.includes('манга') ||
        lowerTitle.includes('ova') || lowerTitle.includes('special') ||
        lowerTitle.includes('episode') || lowerTitle.includes('серия')) {
      return 'cartoon'; // аниме как подкатегория мультфильмов
    }
    
    if (lowerTitle.includes('сезон') || lowerTitle.includes('season') || 
        /s\d+e\d+/i.test(title) || /s\d+\.e\d+/i.test(title)) {
      return 'series';
    }
    
    return 'other';
  }

  private extractResolution(title: string): string | undefined {
    const resolutionPatterns = [
      /(\d{3,4}x\d{3,4})/i,
      /(\d{3,4}p)/i,
      /(480p|720p|1080p|2160p|4K|8K)/i
    ];

    for (const pattern of resolutionPatterns) {
      const match = title.match(pattern);
      if (match) return match[1];
    }

    return undefined;
  }

  private parseDate(dateText: string): Date | undefined {
    if (!dateText) return undefined;
    
    // Парсим различные форматы дат Nyaa
    const datePatterns = [
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/ // DD.MM.YYYY
    ];

    for (const pattern of datePatterns) {
      const match = dateText.match(pattern);
      if (match) {
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }

    return undefined;
  }
}