import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { TorrentResult, SearchOptions, TrackerConfig } from '../types';

export abstract class BaseTracker {
  public config: TrackerConfig;
  protected httpClient: AxiosInstance;

  constructor(config: TrackerConfig) {
    this.config = config;
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
  }

  abstract search(query: string, options: SearchOptions): Promise<TorrentResult[]>;

  protected abstract parseSearchResults(html: string, query: string): TorrentResult[];

  protected async makeRequest(url: string, params?: any): Promise<string> {
    try {
      const response = await this.httpClient.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`Error making request to ${this.config.name}:`, error);
      throw error;
    }
  }

  protected parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  protected extractText($: cheerio.CheerioAPI, selector: string | cheerio.Cheerio<any>): string {
    if (typeof selector === 'string') {
      return $(selector).first().text().trim();
    } else {
      return selector.text().trim();
    }
  }

  protected extractNumber($: cheerio.CheerioAPI, selector: string | cheerio.Cheerio<any>): number {
    const text = this.extractText($, selector);
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  protected extractSize($: cheerio.CheerioAPI, selector: string | cheerio.Cheerio<any>): { size: string; sizeBytes: number } {
    const sizeText = this.extractText($, selector);
    const sizeBytes = this.parseSizeToBytes(sizeText);
    return { size: sizeText, sizeBytes };
  }

  protected parseSizeToBytes(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    const multipliers: { [key: string]: number } = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };

    return value * (multipliers[unit] || 1);
  }

  protected extractYear(title: string): number | undefined {
    const yearMatch = title.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1], 10) : undefined;
  }

  protected determineCategory(title: string): 'movie' | 'series' | 'cartoon' | 'other' {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('сезон') || lowerTitle.includes('season') || 
        lowerTitle.includes('серия') || lowerTitle.includes('episode')) {
      return 'series';
    }
    
    if (lowerTitle.includes('мульт') || lowerTitle.includes('анимация') || 
        lowerTitle.includes('cartoon') || lowerTitle.includes('animation')) {
      return 'cartoon';
    }
    
    return 'movie';
  }

  protected extractQuality(title: string): string | undefined {
    const qualityPatterns = [
      /(\d{3,4}p)/i,
      /(HD|FHD|UHD|4K|8K)/i,
      /(BluRay|BRRip|DVDRip|WEBRip|HDTV)/i
    ];

    for (const pattern of qualityPatterns) {
      const match = title.match(pattern);
      if (match) return match[1];
    }

    return undefined;
  }

  protected extractAudioTracks(title: string): string[] {
    const audioPatterns = [
      /(AC3|AAC|MP3|FLAC|DTS|DTS-HD|TrueHD)/gi,
      /(русский|английский|оригинал|дубляж|озвучка)/gi
    ];

    const tracks: string[] = [];
    for (const pattern of audioPatterns) {
      const matches = title.match(pattern);
      if (matches) {
        tracks.push(...matches);
      }
    }

    return [...new Set(tracks)];
  }

  protected extractStudio(title: string): string | undefined {
    const studioPatterns = [
      /(LostFilm|NewStudio|BaibaKo|ColdFilm|HDRezka|AniLibria)/gi,
      /(LostFilm|NewStudio|BaibaKo|ColdFilm|HDRezka|AniLibria)/gi
    ];

    for (const pattern of studioPatterns) {
      const match = title.match(pattern);
      if (match) return match[1];
    }

    return undefined;
  }
}