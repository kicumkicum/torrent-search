import { BaseTracker } from './BaseTracker';
import { TorrentResult, SearchOptions } from '../types';

export class RuTor extends BaseTracker {
  constructor() {
    super({
      name: 'RuTor',
      baseUrl: 'https://rutor.org',
      searchPath: '/search',
      enabled: true,
      rateLimit: 2000
    });
  }

  async search(query: string, options: SearchOptions): Promise<TorrentResult[]> {
    try {
      // rutor.org использует формат /search/1/0/000/0/query
      const category = this.getCategoryFilter(options.category);
      const searchUrl = `/search/1/0/000/${category}/${encodeURIComponent(query)}`;

      const html = await this.makeRequest(searchUrl);
      return this.parseSearchResults(html, query);
    } catch (error) {
      console.error('RuTor search error:', error);
      return [];
    }
  }

  protected parseSearchResults(html: string, query: string): TorrentResult[] {
    const $ = this.parseHtml(html);
    const results: TorrentResult[] = [];

    // Отладочная информация
    console.log('RuTor HTML length:', html.length);
    console.log('RuTor Found .gai elements:', $('.gai').length);
    console.log('RuTor Found .gai tbody tr elements:', $('.gai tbody tr').length);

    // Парсим результаты поиска
    $('.gai tbody tr').each((index, element) => {
      const $row = $(element);
      
      // Ищем ссылку на торрент
      let titleElement = $row.find('td:nth-child(2) a').first();
      if (titleElement.length === 0) {
        titleElement = $row.find('a[href*="/torrent/"]').first();
      }
      if (titleElement.length === 0) {
        titleElement = $row.find('a').not('[href^="magnet:"]').first();
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
      const seeders = this.extractNumber($, $row.find('td:nth-child(5)'));
      const leechers = this.extractNumber($, $row.find('td:nth-child(6)'));

      // Извлекаем magnet ссылку
      const magnetElement = $row.find('a[href^="magnet:"]');
      const magnetUrl = magnetElement.attr('href');

      // Извлекаем дату
      const dateText = this.extractText($, $row.find('td:nth-child(3)'));
      const uploadDate = this.parseDate(dateText);

      const result: TorrentResult = {
        id: `rutor_${index}`,
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

    console.log('RuTor Total results parsed:', results.length);
    return results;
  }

  private getCategoryFilter(category?: string): string {
    const categoryMap: { [key: string]: string } = {
      'movie': '1', // Фильмы
      'series': '2', // Сериалы
      'cartoon': '3', // Мультфильмы
      'anime': '4', // Аниме
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

  protected determineCategory(title: string): 'movie' | 'series' | 'cartoon' | 'other' {
    const lowerTitle = title.toLowerCase();
    
    // Проверяем на сериалы (включая S01E01, S1E1 и т.д.)
    if (lowerTitle.includes('сезон') || lowerTitle.includes('season') || 
        lowerTitle.includes('серия') || lowerTitle.includes('episode') ||
        /s\d+e\d+/i.test(title) || /s\d+\.e\d+/i.test(title)) {
      return 'series';
    }
    
    if (lowerTitle.includes('мульт') || lowerTitle.includes('анимация') || 
        lowerTitle.includes('cartoon') || lowerTitle.includes('animation')) {
      return 'cartoon';
    }
    
    return 'movie';
  }

  private parseDate(dateText: string): Date | undefined {
    if (!dateText) return undefined;
    
    // Парсим различные форматы дат rutor.org
    const datePatterns = [
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/   // YYYY-MM-DD
    ];

    for (const pattern of datePatterns) {
      const match = dateText.match(pattern);
      if (match) {
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }

    return undefined;
  }
}