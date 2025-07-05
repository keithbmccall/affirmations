const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

/** @type {import('jest').Config} */
module.exports = {
  // Use jest-expo preset for React Native/Expo projects
  preset: 'jest-expo',

  // Root directories for tests
  roots: ['<rootDir>/lib'],

  // Test file patterns - using .spec. naming convention
  testMatch: ['**/__tests__/**/*.spec.{js,jsx,ts,tsx}', '**/?(*.)+(spec).{js,jsx,ts,tsx}'],

  // Setup files that run before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapping automatically generated from tsconfig.json paths
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),

  // Coverage configuration
  collectCoverage: false,
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/index.{ts,tsx}',
    '!**/__tests__/**',
    '!**/*.spec.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/types/**',
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Watch plugins for interactive mode
  watchPlugins: ['jest-watch-typeahead/testname'],
};
