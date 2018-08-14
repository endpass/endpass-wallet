import Vue from 'vue';
import 'jest-localstorage-mock';

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
