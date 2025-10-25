// Jest setup file
import 'jest';

// Увеличиваем таймаут для всех тестов
jest.setTimeout(60000);

// Настройка для логирования в тестах
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Включаем подробное логирование для тестов
  console.log = (...args) => {
    if (process.env.NODE_ENV !== 'test' || process.env.VERBOSE === 'true') {
      originalConsoleLog(...args);
    }
  };
  
  console.error = (...args) => {
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Глобальные моки для axios
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    }))
  };
});