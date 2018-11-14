import Vue from 'vue';

import 'jest-localstorage-mock';
import 'mocks/web3';

/**
 * Services mocks
 */
import 'mocks/services/user';
import 'mocks/services/ethplorer';
import 'mocks/services/gas-price';
import 'mocks/services/price';
import 'mocks/services/tokeninfo';
import 'mocks/services/localSettings';

/**
 * Classes mocks
 */
import 'mocks/class/erc20';
import 'mocks/class/ens';
import 'mocks/class/storage/LocalStorage';
import 'mocks/class/dappBridge';
import 'mocks/class/provider/InpageProvider';

Vue.config.productionTip = false;

// console.error and console.warn throws errors and fails tests
global.console.error = jest.fn(e => {
  throw new Error(e);
});

global.console.warn = jest.fn(e => {
  throw new Error(e);
});

// Function to immediately flush all pending promises
// Usage: await flushPromises()
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));
