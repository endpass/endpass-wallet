class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
};


global.localStorage = new LocalStorageMock;

localStorage = new LocalStorageMock;

import Vue from 'vue'
// import router from '../../../src/router'
// import store from '../../../src/store'
// import validation from '../../../src/validation'
// import App from '../../../src/App'
import VueResource from 'vue-resource'
import VueFlashMessage from 'vue-flash-message'
import VueRoot from '../../../src/main'
import tokens from '../../../src/store/tokens/tokens'
import { FakeProvider } from 'web3-fake-provider'

// let storeInstance = tokens.store();

describe('tokens', () => {
  it('it should get tokens from localStorage', () => {
    localStorage.setItem('tokens', JSON.stringify([{
      address: '0x0'
    }]));
    console.log(localStorage);
    // expect(storeInstance.savedTokens.length).toBe(1);
  })
})
//
// describe('accounts store', () => {
//   it('should add a new account and set it active', () => {
//     state.mutations.addAccount(state.state,2);
//     expect(state.state.accounts.length).toBe(2);
//     expect(state.state.accounts[1]).toBe(2);
//     expect(state.state.activeAccount).toBe(2);
//   })
// })
