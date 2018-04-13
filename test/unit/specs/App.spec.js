import Vue from 'vue'
import ImportWallet from '../../../src/App.vue'

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

describe('App', () => {
  it('should get data from localStorage', () => {
    localStorage.setItem('net', 'Chpok');
    const defaultData = ImportWallet.data();
    expect(defaultData.selectedNet).toBe('Chpok')
  })
})
