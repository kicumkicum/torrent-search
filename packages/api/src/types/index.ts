export interface TorrentResult {
  id: string;
  title: string;
  year?: number;
  size: string;
  sizeBytes: number;
  studio?: string;
  audioTracks: string[];
  seeders: number;
  leechers: number;
  torrentUrl?: string;
  magnetUrl?: string;
  tracker: string;
  category: 'movie' | 'series' | 'cartoon' | 'other';
  quality?: string;
  resolution?: string;
  format?: string;
}

export interface SearchOptions {
  query: string;
  category?: 'movie' | 'series' | 'cartoon' | 'all';
  year?: number;
  quality?: string;
  limit?: number;
}

export interface TrackerConfig {
  name: string;
  baseUrl: string;
  searchPath: string;
  enabled: boolean;
  rateLimit?: number;
}

export interface SearchResponse {
  results: TorrentResult[];
  total: number;
  query: string;
  executionTime: number;
}