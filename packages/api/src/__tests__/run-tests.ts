#!/usr/bin/env node

/**
 * Скрипт для запуска тестов торрент трекеров
 * 
 * Использование:
 * npm run test:real - запуск тестов с реальными запросами
 * npm run test:mock - запуск тестов с моками
 * npm run test:all - запуск всех тестов
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const testTypes = {
  'real': 'Real Network Requests Tests',
  'mock': 'HTML Parsing Tests, Network Requests Tests',
  'all': 'All tests'
};

function runTests(testType: keyof typeof testTypes) {
  console.log(`\n🧪 Running ${testTypes[testType]}...\n`);
  
  const testPattern = testType === 'real' 
    ? 'real-requests.test.ts'
    : testType === 'mock'
    ? 'html-parsing.test.ts|network-requests.test.ts'
    : '*.test.ts';
  
  const env = testType === 'real' 
    ? { ...process.env, RUN_REAL_TESTS: 'true' }
    : process.env;
  
  try {
    const command = `npx jest src/__tests__/${testPattern} --verbose --detectOpenHandles --forceExit`;
    
    console.log(`📝 Command: ${command}`);
    console.log(`🌍 Environment: ${JSON.stringify(env, null, 2)}\n`);
    
    execSync(command, {
      stdio: 'inherit',
      env,
      cwd: process.cwd()
    });
    
    console.log(`\n✅ ${testTypes[testType]} completed successfully!`);
  } catch (error) {
    console.error(`\n❌ ${testTypes[testType]} failed:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🔍 Torrent Tracker Test Runner

Usage:
  npm run test:real    - Run tests with real network requests
  npm run test:mock    - Run tests with mocked requests
  npm run test:all     - Run all tests
  npm run test:help    - Show this help

Test Types:
  real  - Tests that make actual HTTP requests to torrent trackers
  mock  - Tests that use mocked responses for fast execution
  all   - Runs both real and mock tests

Environment Variables:
  RUN_REAL_TESTS=true  - Enable real network request tests
  VERBOSE=true         - Enable verbose logging
  NODE_ENV=test        - Set test environment

Examples:
  RUN_REAL_TESTS=true npm test
  VERBOSE=true npm run test:mock
  `);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  if (command in testTypes) {
    runTests(command as keyof typeof testTypes);
  } else {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { runTests, showHelp };