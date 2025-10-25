import { BaseTracker } from './BaseTracker';
import { TorrentResult, SearchOptions } from '../types';

export class YTS extends BaseTracker {
  constructor() {
    super({
      name: 'YTS',
      baseUrl: 'https://yts.mx',
      searchPath: '/api/v2/list_movies.json',
      enabled: true,
      rateLimit: 2000
    });
  }

  async search(query: string, options: SearchOptions): Promise<TorrentResult[]> {
    try {
      const searchUrl = this.config.searchPath;
      const params = {
        query_term: query,
        sort_by: 'seeds', // сортировка по сидам
        order_by: 'desc', // по убыванию
        limit: 20,
        page: 1
      };

      const response = await this.makeRequest(searchUrl, params);
      return this.parseApiResults(response, query);
    } catch (error) {
      console.error('YTS search error:', error);
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

      if (!data || !data.data || !data.data.movies) {
        return results;
      }

      data.data.movies.forEach((movie: any, index: number) => {
        if (!movie.title || !movie.torrents) {
          return;
        }

        // Обрабатываем каждый торрент фильма
        movie.torrents.forEach((torrent: any) => {
          const title = `${movie.title} (${movie.year}) ${torrent.quality}`;
          const sizeBytes = this.parseSizeToBytes(torrent.size);
          const sizeInfo = this.formatSize(sizeBytes);
          
          // Создаем magnet ссылку
          const magnetUrl = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(title)}`;
          
          // Создаем ссылку на страницу фильма
          const torrentUrl = `https://yts.mx/movies/${movie.slug}`;

          const result: TorrentResult = {
            id: `yts_${movie.id}_${torrent.hash}`,
            title: title,
            year: movie.year,
            size: sizeInfo.size,
            sizeBytes: sizeBytes,
            studio: this.extractStudio(title),
            audioTracks: this.extractAudioTracks(title),
            seeders: torrent.seeds || 0,
            leechers: torrent.peers ? torrent.peers - torrent.seeds : 0,
            torrentUrl: torrentUrl,
            magnetUrl: magnetUrl,
            tracker: this.config.name,
            category: 'movie',
            quality: torrent.quality,
            resolution: this.extractResolution(torrent.quality)
          };

          results.push(result);
        });
      });

      return results;
    } catch (error) {
      console.error('Error parsing YTS API response:', error);
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

  private extractResolution(quality: string): string | undefined {
    const qualityMap: { [key: string]: string } = {
      '720p': '1280x720',
      '1080p': '1920x1080',
      '2160p': '3840x2160',
      '3D': '1920x1080'
    };
    
    return qualityMap[quality] || quality;
  }
}