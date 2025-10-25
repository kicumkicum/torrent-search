#!/usr/bin/env node

const axios = require('axios');

async function testTPB() {
  console.log('🔍 Тестирование ThePirateBay API...\n');
  
  try {
    const response = await axios.get('https://apibay.org/q.php', {
      params: {
        q: 'inception',
        cat: '',
        orderby: '7',
        page: 0
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log(`📥 Статус: ${response.status}`);
    console.log(`📥 Длина ответа: ${response.data.length}`);
    console.log(`📥 Тип ответа: ${typeof response.data}`);
    console.log(`📥 Первые 200 символов: ${JSON.stringify(response.data).substring(0, 200)}...`);
    
    if (Array.isArray(response.data)) {
      console.log(`✅ JSON уже распарсен, найдено ${response.data.length} результатов`);
      
      if (response.data.length > 0) {
        console.log(`📝 Первый результат: ${response.data[0].name}`);
        console.log(`📝 Сиды: ${response.data[0].seeders}, Личи: ${response.data[0].leechers}`);
      }
    } else if (typeof response.data === 'string' && response.data.startsWith('[')) {
      const data = JSON.parse(response.data);
      console.log(`✅ JSON парсится успешно, найдено ${data.length} результатов`);
      
      if (data.length > 0) {
        console.log(`📝 Первый результат: ${data[0].name}`);
        console.log(`📝 Сиды: ${data[0].seeders}, Личи: ${data[0].leechers}`);
      }
    } else {
      console.log('❌ Ответ не является JSON массивом');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error(`📥 Статус: ${error.response.status}`);
      console.error(`📥 Данные: ${error.response.data.substring(0, 200)}...`);
    }
  }
}

testTPB();