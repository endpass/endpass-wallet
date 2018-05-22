import Vue from 'vue'
import 'jest-localstorage-mock';

Vue.config.productionTip = false

// console.error throws errors and fails tests
global.console.error = jest.fn(e => {
    throw new Error(e);
});
