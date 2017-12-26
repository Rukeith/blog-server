module.exports = {
  bail: true, // Stop test when first test fail
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js}',
    '!<rootDir>/jest.config.js',
  ],
  coverageDirectory: '<rootDir>/public/coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/views/',
    '<rootDir>/config/',
    '<rootDir>/public/',
    '<rootDir>/jest.config.js/',
    '<rootDir>/node_modules/',
  ],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
  clearMocks: true,
  resetMocks: true,
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/index.js'],
  verbose: true,
  watchPathIgnorePatterns: [
    '<rootDir>/LICENSE',
    '<rootDir>/.eslintrc',
    '<rootDir>/.gitignore',
    '<rootDir>/.eslintignore',
    '<rootDir>/node_modules/',
  ],
};
