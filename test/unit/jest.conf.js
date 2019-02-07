const path = require('path');
const ENV = require('../../config/env/test.env');

module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  moduleFileExtensions: ['js', 'json', 'vue', 'ts', 'tsx', 'jsx', 'node'],
  moduleNameMapper: {
    '^fixtures/(.*)$': '<rootDir>/test/unit/fixtures/$1',
    '^mocks/(.*)$': '<rootDir>/test/unit/mocks/$1',
    '^@/testUtils$': '<rootDir>/test/unit/testUtils.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/(test/unit/**/*.spec.js|**/__tests__/*.js)'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpe?g|ttf|woff2?|svg)$':
      'jest-transform-stub',
  },
  // globals as webpack DefinePlugin mocks
  globals: {
    ENV,
  },
  // TODO: check usage (@endpass/class) after update to vue-cli3
  transformIgnorePatterns: ['node_modules/(?!(vue-timers|@endpass/class))'],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  setupFiles: ['<rootDir>/test/unit/setup', 'jest-canvas-mock'],
  setupFilesAfterEnv: ['<rootDir>/test/unit/setupTests'],
};
