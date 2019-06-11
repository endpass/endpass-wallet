const objectUtils = require('@endpass/utils/objects');

module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue', 'ts', 'tsx', 'jsx', 'node'],
  moduleNameMapper: {
    '^fixtures/(.*)$': '<rootDir>/tests/unit/fixtures/$1',
    '^mocks/(.*)$': '<rootDir>/tests/unit/mocks/$1',
    '^@/testUtils$': '<rootDir>/tests/unit/testUtils.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    ENV: objectUtils.parseObjectProperties(process.env, 'VUE_APP'),
  },
  testMatch: ['<rootDir>/(tests/unit/**/*.spec.js|**/__tests__/*.js)'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpe?g|ttf|woff2?|svg)$':
      'jest-transform-stub',
  },
  // TODO: check usage (@endpass/class) after update to vue-cli3
  transformIgnorePatterns: [
    'node_modules/(?!(vue-timers|vuex-class-modules|@endpass/class))',
  ],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  setupFiles: ['<rootDir>/tests/unit/setup', 'jest-canvas-mock'],
  setupTestFrameworkScriptFile: '<rootDir>/tests/unit/setupTests',
};
