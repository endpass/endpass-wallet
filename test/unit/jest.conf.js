const path = require('path');
const ENV = require('../../config/test.env');
module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  moduleFileExtensions: ['js', 'json', 'vue', 'ts', 'tsx', 'jsx', 'node'],
  moduleNameMapper: {
    '^fixtures/(.*)$': '<rootDir>/test/unit/fixtures/$1',
    '^mocks/(.*)$': '<rootDir>/test/unit/mocks/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/(test/unit/**/*.spec.js|**/__tests__/*.js)'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpe?g|ttf|woff2?|svg)$':
      'jest-transform-stub',
  },
  //globals as webpack DefinePlugin mocks
  globals: {
    NODE_ENV: 'testing',
    ENV,
    isProduction: false,
  },
  transformIgnorePatterns: ['node_modules/(?!vue-timers)'],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  setupFiles: ['<rootDir>/test/unit/setup', 'jest-canvas-mock'],
  setupTestFrameworkScriptFile: '<rootDir>/test/unit/setupTests',
};
