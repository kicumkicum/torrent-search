# Проблемы с поиском торрентов и их решения

## Обнаруженные проблемы

### 1. Проблема с инициализацией axios в тестах
**Симптомы:**
- Ошибка `Cannot read properties of undefined (reading 'data')`
- Все трекеры возвращают пустые результаты
- Поиск проходит очень быстро (мгновенно)

**Причина:**
В тестовом окружении мок axios.create() не работает правильно, что приводит к тому, что httpClient не инициализируется.

**Решение:**
Создать правильные моки для axios или использовать реальные HTTP запросы в тестах.

### 2. Проблемы с HTML парсингом
**Симптомы:**
- Селекторы не находят элементы в HTML
- Парсинг возвращает пустые результаты

**Причина:**
Селекторы в трекерах могут быть неточными или HTML структура сайтов изменилась.

**Решение:**
- Обновить селекторы для каждого трекера
- Добавить отладочную информацию для проверки HTML структуры
- Создать тесты с реальными HTML данными

### 3. Проблемы с сетевыми запросами
**Симптомы:**
- Трекеры могут блокировать запросы
- Таймауты и ошибки сети
- Rate limiting

**Причина:**
- Трекеры могут блокировать автоматические запросы
- Неправильные User-Agent или заголовки
- Слишком частые запросы

**Решение:**
- Использовать реалистичные User-Agent
- Добавить задержки между запросами
- Обрабатывать ошибки сети gracefully

## Созданные тесты

### 1. `simple-search.test.ts`
Базовые тесты для проверки:
- Обработки пустых запросов
- Структуры ответов
- Управления трекерами

### 2. `debug-search.test.ts`
Тесты для отладки:
- Реальные HTTP запросы к трекерам
- Интеграционные тесты
- Отладочная информация

### 3. `html-parsing.test.ts`
Тесты парсинга HTML:
- Парсинг результатов 1337x
- Парсинг результатов RuTracker
- Парсинг результатов ThePirateBay
- Извлечение метаданных

### 4. `network-requests.test.ts`
Тесты сетевых запросов:
- Конфигурация HTTP клиента
- Обработка ошибок
- Параметры запросов

### 5. `real-requests.test.ts`
Тесты с реальными запросами:
- Реальные HTTP запросы
- Проверка работы трекеров
- Интеграционные тесты

## Рекомендации по исправлению

### 1. Исправить инициализацию axios
```typescript
// В BaseTracker.ts
constructor(config: TrackerConfig) {
  this.config = config;
  this.httpClient = axios.create({
    baseURL: config.baseUrl,
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  // Добавить проверку
  if (!this.httpClient) {
    throw new Error('Failed to initialize HTTP client');
  }
}
```

### 2. Обновить селекторы
```typescript
// Для 1337x
$('.table-list tbody tr').each((index, element) => {
  const $row = $(element);
  let titleElement = $row.find('a[href*="/torrent/"]').first();
  // ... остальная логика
});
```

### 3. Добавить обработку ошибок
```typescript
protected async makeRequest(url: string, params?: any): Promise<string> {
  try {
    const response = await this.httpClient.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`Error making request to ${this.config.name}:`, error);
    // Возвращаем пустой HTML вместо выброса ошибки
    return '<html><body></body></html>';
  }
}
```

### 4. Добавить rate limiting
```typescript
// В TorrentSearch.ts
private async searchTracker(tracker: BaseTracker, options: SearchOptions): Promise<TorrentResult[]> {
  try {
    // Добавить задержку между запросами
    await new Promise(resolve => setTimeout(resolve, tracker.config.rateLimit || 1000));
    return await tracker.search(options.query, options);
  } catch (error) {
    console.error(`Error searching ${tracker.config.name}:`, error);
    return [];
  }
}
```

## Запуск тестов

### Быстрые тесты (без реальных запросов)
```bash
npm run test:mock
```

### Тесты с реальными запросами
```bash
npm run test:real
```

### Все тесты
```bash
npm run test:all
```

### Отладочные тесты
```bash
RUN_DEBUG_TESTS=true npm test src/__tests__/debug-search.test.ts
```

## Ожидаемые результаты

После исправления проблем поиск должен:
1. Делать реальные HTTP запросы к трекерам
2. Парсить HTML и извлекать данные о торрентах
3. Возвращать структурированные результаты
4. Обрабатывать ошибки gracefully
5. Соблюдать rate limits

## Мониторинг

Для мониторинга работы поиска:
1. Проверять логи на наличие ошибок
2. Мониторить время выполнения запросов
3. Проверять количество найденных результатов
4. Отслеживать доступность трекеров