import { BaseTracker } from './BaseTracker';
import { TorrentResult, SearchOptions } from '../types';

export class ThePirateBay extends BaseTracker {
  constructor() {
    super({
      name: 'ThePirateBay',
      baseUrl: 'https://apibay.org',
      searchPath: '/q.php',
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

      const response = await this.makeRequest(searchUrl, params);
      const results = this.parseApiResults(response, query);
      
      // Если результатов нет, попробуем предложить исправления
      if (results.length === 0 && query.length > 3) {
        const suggestions = this.suggestCorrections(query);
        if (suggestions.length > 0) {
          console.log(`💡 ThePirateBay: Возможные исправления для "${query}": ${suggestions.join(', ')}`);
        }
      }
      
      return results;
    } catch (error) {
      console.error('ThePirateBay search error:', error);
      return [];
    }
  }

  protected parseApiResults(jsonData: string | any, query: string): TorrentResult[] {
    try {
      let data;
      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData);
      } else {
        data = jsonData;
      }
      const results: TorrentResult[] = [];

      if (!Array.isArray(data)) {
        return results;
      }

      data.forEach((item: any, index: number) => {
        if (!item.name || item.name === 'No results returned' || item.id === '0') {
          return;
        }

        const title = item.name;
        const sizeBytes = parseInt(item.size) || 0;
        const sizeInfo = this.formatSize(sizeBytes);
        
        // Создаем magnet ссылку
        const magnetUrl = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(title)}`;
        
        // Создаем ссылку на страницу торрента
        const torrentUrl = `https://thepiratebay.org/description.php?id=${item.id}`;

        const result: TorrentResult = {
          id: `tpb_${item.id}`,
          title: title,
          year: this.extractYear(title),
          size: sizeInfo.size,
          sizeBytes: sizeBytes,
          studio: this.extractStudio(title),
          audioTracks: this.extractAudioTracks(title),
          seeders: parseInt(item.seeders) || 0,
          leechers: parseInt(item.leechers) || 0,
          torrentUrl: torrentUrl,
          magnetUrl: magnetUrl,
          tracker: this.config.name,
          category: this.determineCategory(title),
          quality: this.extractQuality(title),
          resolution: this.extractResolution(title)
        };

        results.push(result);
      });

      return results;
    } catch (error) {
      console.error('Error parsing ThePirateBay API response:', error);
      return [];
    }
  }

  protected parseSearchResults(html: string, query: string): TorrentResult[] {
    // Этот метод не используется для API, но нужен для совместимости
    return [];
  }

  private formatSize(bytes: number): { size: string; sizeBytes: number } {
    if (bytes === 0) return { size: '0 B', sizeBytes: 0 };
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return {
      size: parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i],
      sizeBytes: bytes
    };
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

  private suggestCorrections(query: string): string[] {
    const commonCorrections: { [key: string]: string[] } = {
      'ineption': ['inception'],
      'inceptoin': ['inception'],
      'incepton': ['inception'],
      'avengers': ['avengers', 'marvel'],
      'batman': ['batman', 'dark knight'],
      'superman': ['superman', 'man of steel'],
      'spiderman': ['spiderman', 'spider-man'],
      'starwars': ['star wars', 'starwars'],
      'lordofrings': ['lord of the rings', 'lotr'],
      'gameofthrones': ['game of thrones', 'got'],
      'breakingbad': ['breaking bad'],
      'thewalkingdead': ['the walking dead', 'twd']
    };

    const lowerQuery = query.toLowerCase();
    return commonCorrections[lowerQuery] || [];
  }
}