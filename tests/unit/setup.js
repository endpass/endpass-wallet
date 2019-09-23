import Vue from 'vue';

import 'jest-localstorage-mock';
import 'mocks/web3';

/**
 * Services mocks
 */
import 'mocks/services/user';
import 'mocks/services/identityMode';
import 'mocks/services/ethplorer';
import 'mocks/services/cryptoData';
import 'mocks/services/tokeninfo';
import 'mocks/services/localSettings';

/**
 * Classes mocks
 */
import 'mocks/class';

/**
 * Schemas mocks
 */
import 'mocks/schema';

/**
 * Validators mocks
 */
import 'mocks/validation';

import 'mocks/ethereumjs-wallet/hdkey';

/**
 * locales mocks
 */
import 'mocks/locale/i18n';

import 'mocks/locale/i18nSetup';

Vue.config.productionTip = false;

// console.error and console.warn throws errors and fails tests
global.console.error = jest.fn(e => {
  throw new Error(e);
});

global.console.warn = jest.fn(e => {
  throw new Error(e);
});

// Function to immediately flush all pending promises
// Usage: await global.flushPromises()
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));
