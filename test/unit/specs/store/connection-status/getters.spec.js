import getters from '@/store/connection-status/getters';

describe('connection-status getters', () => {
  describe('appStatus', () => {
    it('should return ready if synched and connected to api and web3', () => {
      let state = {
        web3Connection: true,
        isSyncing: false,
        apiConnection: true,
      };
      expect(getters.appStatus(state)).toBe('ready');
    });

    it('should return syncing if syncing and connected to web3 and api', () => {
      let state = {
        web3Connection: true,
        isSyncing: true,
        apiConnection: true,
      };
      expect(getters.appStatus(state)).toBe('syncing');
    });

    it('should return syncing if synched and connected to web3 and cant connect to api', () => {
      let state = {
        web3Connection: true,
        isSyncing: false,
        apiConnection: false,
      };
      expect(getters.appStatus(state)).toBe('syncing');
    });

    it('should return failed failed to connect to web3', () => {
      let state = {
        web3Connection: false,
        isSyncing: false,
        apiConnection: false,
      };
      expect(getters.appStatus(state)).toBe('failed');
    });
  });
  describe('currentProvider', () => {
    it('should return currentProvider from web3', () => {
      const currentProvider = {};
      let rootState = {
        web3: {
          web3: {
            currentProvider,
          },
        },
      };
      expect(getters.currentProvider(0, 0, rootState)).toBe(currentProvider);
    });
  });
  describe('eth', () => {
    it('should return currentProvider from eth', () => {
      const eth = {};
      let rootState = {
        web3: {
          web3: {
            eth,
          },
        },
      };
      expect(getters.eth(0, 0, rootState)).toBe(eth);
    });
  });
});
