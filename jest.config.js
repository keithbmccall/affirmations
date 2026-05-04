const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

/** @type {import('jest').Config} */
module.exports = {
  // Use jest-expo preset for React Native/Expo projects
  preset: 'jest-expo',

  // Root directories for tests
  roots: ['<rootDir>/lib'],

  // Test file patterns - using .spec. naming convention
  testMatch: ['**/?(*.)+(spec).{js,jsx,ts,tsx}'],

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
    '!**/*.spec.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/types/**',
    '!lib/**/types.ts',
    '!**/useColorScheme.web.ts',
    '!lib/features/lens/lens-palette/use-animated-color.ts',
  ],

  // Minimums aligned with current lib coverage (see `npm test -- --coverage`)
  coverageThreshold: {
    global: {
      statements: 99.27,
      branches: 94.68,
      functions: 99.57,
      lines: 99.75,
    },
  },

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
