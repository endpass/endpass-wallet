import getters from '@/store/tokens/getters';

describe('user getters', () => {
  describe('net', () => {
    it('should return net from web3', () => {
      let rootState = {
        web3: {
          activeNet: {
            id: 1,
          },
        },
      };
      expect(getters.net(1, 1, rootState)).toBe(1);
    });
  });
  describe('address', () => {
    it('should return address from accounts', () => {
      let rootState = {
        accounts: {
          address: {
            getChecksumAddressString: () => 1,
          },
        },
      };
      expect(getters.address(1, 1, rootState)).toBe(1);
    });
  });
  describe('activeCurrencyName', () => {
    it('should return currency name from web3', () => {
      let rootState = {
        web3: {
          activeCurrency: {
            name: 'kek',
          },
        },
      };
      expect(getters.activeCurrencyName(1, 1, rootState)).toBe('kek');
    });
  });
  describe('savedCurrentNetworkTokens', () => {
    it('should return tokens from net', () => {
      const state = {
        savedTokens: {
          1: 'kek',
        },
      };
      const mockGetters = {
        net: 1,
      };
      expect(getters.savedCurrentNetworkTokens(state, mockGetters, 1)).toBe(
        'kek',
      );
    });
  });
});
