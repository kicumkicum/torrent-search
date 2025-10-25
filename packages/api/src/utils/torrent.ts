import * as magnet from 'magnet-uri';
import * as bencode from 'bencode';
import { createHash } from 'crypto';

export interface TorrentInfo {
  infoHash: string;
  name: string;
  length: number;
  files?: Array<{
    path: string[];
    length: number;
  }>;
  pieceLength: number;
  pieces: string;
}

export function parseMagnet(magnetUrl: string): magnet.Instance | null {
  try {
    return magnet.decode(magnetUrl);
  } catch (error) {
    console.error('Error parsing magnet URL:', error);
    return null;
  }
}

export function generateTorrentFromMagnet(magnetUrl: string, infoHash: string): Buffer | null {
  try {
    const magnetData = parseMagnet(magnetUrl);
    if (!magnetData) return null;

    // Создаем базовую структуру торрента
    const torrent: any = {
      info: {
        'name.utf-8': magnetData.dn || 'Unknown',
        'name': magnetData.dn || 'Unknown',
        'piece length': 262144, // 256KB по умолчанию
        pieces: Buffer.alloc(20), // Заглушка для pieces
        length: 0,
        'private': 1
      },
      'announce': magnetData.tr ? [magnetData.tr].flat() : [],
      'created by': 'Torrent Search API',
      'creation date': Math.floor(Date.now() / 1000),
      'encoding': 'UTF-8'
    };

    // Добавляем announce-list если есть трекеры
    if (magnetData.tr && Array.isArray(magnetData.tr)) {
      torrent['announce-list'] = [magnetData.tr];
    }

    // Добавляем info_hash в announce URLs
    if (magnetData.tr) {
      const announceUrls = Array.isArray(magnetData.tr) ? magnetData.tr : [magnetData.tr];
      torrent.announce = announceUrls.map((url: string) => {
        const urlObj = new URL(url);
        urlObj.searchParams.set('info_hash', infoHash);
        return urlObj.toString();
      });
    }

    return bencode.encode(torrent);
  } catch (error) {
    console.error('Error generating torrent from magnet:', error);
    return null;
  }
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function parseFileSize(sizeStr: string): number {
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

export function extractInfoHash(magnetUrl: string): string | null {
  const magnetData = parseMagnet(magnetUrl);
  return magnetData?.xt?.[0]?.split(':')[2] || null;
}