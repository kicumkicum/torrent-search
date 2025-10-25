import { RuTracker } from './trackers/RuTracker';
import { ThePirateBay } from './trackers/ThePirateBay';
import { X1337x } from './trackers/1337x';
import { BaseTracker } from './trackers/BaseTracker';
import { TorrentResult, SearchOptions, SearchResponse } from './types';
import { generateTorrentFromMagnet, extractInfoHash } from './utils/torrent';

export class TorrentSearch {
  private trackers: BaseTracker[];

  constructor() {
    this.trackers = [
      new RuTracker(),
      new ThePirateBay(),
      new X1337x()
    ];
  }

  async search(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    const { query, limit = 50 } = options;

    if (!query || query.trim().length === 0) {
      return {
        results: [],
        total: 0,
        query,
        executionTime: 0
      };
    }

    try {
      // Запускаем поиск по всем трекерам параллельно
      const searchPromises = this.trackers
        .filter(tracker => tracker.config.enabled)
        .map(tracker => this.searchTracker(tracker, options));

      const results = await Promise.allSettled(searchPromises);
      
      // Объединяем результаты от всех трекеров
      const allResults: TorrentResult[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        } else {
          console.error(`Tracker ${this.trackers[index].config.name} failed:`, result.reason);
        }
      });

      // Сортируем по количеству сидов (приоритет активным раздачам)
      allResults.sort((a, b) => b.seeders - a.seeders);

      // Ограничиваем количество результатов
      const limitedResults = allResults.slice(0, limit);

      // Генерируем torrent файлы для magnet ссылок без torrent файлов
      const processedResults = await this.processResults(limitedResults);

      const executionTime = Date.now() - startTime;

      return {
        results: processedResults,
        total: processedResults.length,
        query,
        executionTime
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        total: 0,
        query,
        executionTime: Date.now() - startTime
      };
    }
  }

  private async searchTracker(tracker: BaseTracker, options: SearchOptions): Promise<TorrentResult[]> {
    try {
      return await tracker.search(options.query, options);
    } catch (error) {
      console.error(`Error searching ${tracker.config.name}:`, error);
      return [];
    }
  }

  private async processResults(results: TorrentResult[]): Promise<TorrentResult[]> {
    const processedResults: TorrentResult[] = [];

    for (const result of results) {
      // Если есть magnet ссылка, но нет torrent файла, генерируем torrent
      if (result.magnetUrl && !result.torrentUrl) {
        try {
          const infoHash = extractInfoHash(result.magnetUrl);
          if (infoHash) {
            const torrentBuffer = generateTorrentFromMagnet(result.magnetUrl, infoHash);
            if (torrentBuffer) {
              // В реальном приложении здесь бы сохраняли файл и возвращали URL
              result.torrentUrl = `data:application/x-bittorrent;base64,${torrentBuffer.toString('base64')}`;
            }
          }
        } catch (error) {
          console.error('Error generating torrent from magnet:', error);
        }
      }

      processedResults.push(result);
    }

    return processedResults;
  }

  getAvailableTrackers(): string[] {
    return this.trackers
      .filter(tracker => tracker.config.enabled)
      .map(tracker => tracker.config.name);
  }

  enableTracker(trackerName: string): void {
    const tracker = this.trackers.find(t => t.config.name === trackerName);
    if (tracker) {
      tracker.config.enabled = true;
    }
  }

  disableTracker(trackerName: string): void {
    const tracker = this.trackers.find(t => t.config.name === trackerName);
    if (tracker) {
      tracker.config.enabled = false;
    }
  }
}