#!/usr/bin/env node

/**
 * Простой скрипт для тестирования поиска торрентов
 * Запуск: node test-search.js
 */

const { TorrentSearch } = require('./dist/TorrentSearch');

async function testSearch() {
  console.log('🔍 Тестирование поиска торрентов...\n');
  
  const torrentSearch = new TorrentSearch();
  
  // Проверяем доступные трекеры
  console.log('📋 Доступные трекеры:', torrentSearch.getAvailableTrackers());
  
  // Тестируем пустой запрос
  console.log('\n🧪 Тест 1: Пустой запрос');
  const emptyResult = await torrentSearch.search({ query: '', limit: 10 });
  console.log('Результат:', emptyResult);
  
  // Тестируем реальный поиск
  console.log('\n🧪 Тест 2: Поиск "inception"');
  try {
    const startTime = Date.now();
    const result = await torrentSearch.search({ query: 'inception', limit: 5 });
    const executionTime = Date.now() - startTime;
    
    console.log(`⏱️  Время выполнения: ${executionTime}ms`);
    console.log(`📊 Найдено результатов: ${result.total}`);
    console.log(`🔍 Запрос: "${result.query}"`);
    
    if (result.results.length > 0) {
      console.log('\n📝 Первые результаты:');
      result.results.slice(0, 3).forEach((torrent, index) => {
        console.log(`  ${index + 1}. ${torrent.title}`);
        console.log(`     Трекер: ${torrent.tracker}`);
        console.log(`     Размер: ${torrent.size}`);
        console.log(`     Сиды: ${torrent.seeders}, Личи: ${torrent.leechers}`);
        console.log(`     Magnet: ${torrent.magnetUrl ? 'Да' : 'Нет'}`);
        console.log(`     Torrent: ${torrent.torrentUrl ? 'Да' : 'Нет'}`);
        console.log('');
      });
    } else {
      console.log('❌ Результаты не найдены');
    }
  } catch (error) {
    console.error('❌ Ошибка поиска:', error.message);
  }
  
  // Тестируем поиск с фильтрами
  console.log('\n🧪 Тест 3: Поиск "marvel" с фильтром "movie"');
  try {
    const result = await torrentSearch.search({ 
      query: 'marvel', 
      category: 'movie',
      limit: 3 
    });
    
    console.log(`📊 Найдено результатов: ${result.total}`);
    
    if (result.results.length > 0) {
      console.log('\n📝 Результаты с фильтром:');
      result.results.forEach((torrent, index) => {
        console.log(`  ${index + 1}. ${torrent.title} (${torrent.category})`);
      });
    }
  } catch (error) {
    console.error('❌ Ошибка поиска с фильтрами:', error.message);
  }
  
  console.log('\n✅ Тестирование завершено');
}

// Запускаем тест
testSearch().catch(console.error);