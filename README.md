# Torrent Search - Монорепо для поиска торрентов

Веб-приложение для поиска фильмов, сериалов и мультфильмов на различных торрент-трекерах.

## Структура проекта

Это монорепо, состоящее из двух основных пакетов:

- `packages/api` - API слой для поиска торрентов
- `packages/web` - Next.js веб-приложение

## Возможности

- 🔍 Поиск по названию фильмов, сериалов и мультфильмов
- 🎯 Поддержка множественных торрент-трекеров (RuTracker, ThePirateBay, 1337x)
- 📊 Детальная информация о раздачах (размер, сиды, личи, студия озвучки)
- 🧲 Поддержка magnet-ссылок и .torrent файлов
- ⚡ Автоматическая генерация .torrent файлов из magnet-ссылок
- 🎨 Современный и отзывчивый интерфейс
- 🔧 Фильтрация по категориям, году, качеству

## Установка и запуск

### Установка зависимостей

```bash
npm install
```

### Разработка

```bash
# Запуск в режиме разработки
npm run dev
```

### Сборка

```bash
# Сборка всех пакетов
npm run build
```

### Запуск продакшн версии

```bash
npm run start
```

## API

### Поиск торрентов

```typescript
POST /api/search
Content-Type: application/json

{
  "query": "название фильма",
  "category": "movie", // опционально: movie, series, cartoon, all
  "year": 2023, // опционально
  "quality": "1080p", // опционально
  "limit": 50 // опционально, по умолчанию 50
}
```

### Ответ

```typescript
{
  "results": [
    {
      "id": "unique_id",
      "title": "Название фильма",
      "year": 2023,
      "size": "2.5 GB",
      "sizeBytes": 2684354560,
      "studio": "LostFilm",
      "audioTracks": ["AC3", "русский"],
      "seeders": 150,
      "leechers": 25,
      "torrentUrl": "https://...",
      "magnetUrl": "magnet:?xt=urn:btih:...",
      "tracker": "RuTracker",
      "category": "movie",
      "quality": "1080p",
      "resolution": "1920x1080"
    }
  ],
  "total": 1,
  "query": "название фильма",
  "executionTime": 1250
}
```

## Поддерживаемые трекеры

- **RuTracker** - Российский торрент-трекер
- **ThePirateBay** - Международный торрент-трекер
- **1337x** - Популярный торрент-трекер

## Технологии

### API пакет
- TypeScript
- Axios для HTTP запросов
- Cheerio для парсинга HTML
- Bencode для работы с торрент файлами
- Magnet-URI для работы с magnet ссылками

### Web пакет
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React для иконок

## Лицензия

MIT License