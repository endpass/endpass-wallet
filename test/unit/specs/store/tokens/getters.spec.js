/* eslint-disable import/no-named-default */
import { default as tokensGetters } from '@/store/tokens/getters';

describe('tokens getters', () => {
  describe('activeCurrencyName', () => {
    it('should return active currency name', () => {
      const rootState = {
        web3: {
          activeCurrency: {
            name: 'ETH',
          },
        },
      };
      expect(tokensGetters.activeCurrencyName(null, null, rootState)).toBe(
        'ETH',
      );
    });
  });

  describe('tokensByAddress', () => {
    it('should return tokens by given address', () => {
      const state = {
        networkTokens: {
          '0x1': 'foo',
          '0x2': 'bar',
        },
        tokensByAddress: {
          '0x0': ['0x1', '0x2'],
        },
      };
      expect(tokensGetters.tokensByAddress(state)('0x0')).toEqual({
        '0x1': 'foo',
        '0x2': 'bar',
      });
    });

    it('should return empty object if address tokens not exist in store', () => {
      const state = {
        tokensByAddress: {},
      };

      expect(tokensGetters.tokensByAddress(state)('0x0')).toMatchObject({});
    });
  });

  describe('balancesByAddress', () => {
    it('should return balances by given address', () => {
      const state = {
        balancesByAddress: {
          '0x0': {
            '0x1': '1',
            '0x2': '2',
          },
        },
      };

      expect(tokensGetters.balancesByAddress(state)('0x0')).toEqual({
        '0x1': '1',
        '0x2': '2',
      });
    });

    it('should return empty object if address balances not exist in store', () => {
      const state = {
        balancesByAddress: {},
      };

      expect(tokensGetters.balancesByAddress(state)('0x0')).toMatchObject({});
    });
  });

  describe('userTokensListedByNetworks', () => {
    it('should returns arrays of user tokens mapped by network', () => {
      const state = {
        userTokens: {
          1: {
            '0x1': '1',
            '0x2': '2',
          },
          2: {
            '0x3': '3',
          },
        },
      };

      expect(tokensGetters.userTokensListedByNetworks(state)).toEqual({
        1: ['1', '2'],
        2: ['3'],
      });
    });
  });

  describe('userTokenByAddress', () => {
    it('should return token by given address from current net', () => {
      const state = {
        userTokens: {
          1: {
            '0x1': '1',
            '0x2': '2',
          },
        },
      };
      const rootGetters = {
        'web3/activeNetwork': 1,
      };

      expect(
        tokensGetters.userTokenByAddress(state, null, null, rootGetters)('0x1'),
      ).toBe('1');
    });
  });

  describe('currentNetUserTokens', () => {
    it('should return all user tokens from current net', () => {
      const state = {
        userTokens: {
          1: {
            '0x1': '1',
            '0x2': '2',
          },
        },
      };
      const rootGetters = {
        'web3/activeNetwork': 1,
      };

      expect(
        tokensGetters.currentNetUserTokens(state, null, null, rootGetters),
      ).toEqual({
        '0x1': '1',
        '0x2': '2',
      });
    });
  });

  describe('fullTokensByAddress', () => {
    it('should return tokens by address with prices and balances', () => {
      const state = {
        prices: {
          FOO: '2',
        },
        tokensByAddress: {
          '0x0': ['0x1', '0x2'],
        },
      };
      const getters = {
        balancesByAddress: () => ({
          '0x1': '1',
        }),
        tokensByAddress: () => ({
          '0x1': {
            address: '0x1',
            symbol: 'FOO',
          },
          '0x2': {
            address: '0x2',
            symbol: 'BAR',
          },
        }),
      };

      expect(tokensGetters.fullTokensByAddress(state, getters)('0x0')).toEqual({
        '0x1': {
          address: '0x1',
          price: '2',
          balance: '1',
          symbol: 'FOO',
        },
        '0x2': {
          address: '0x2',
          price: '0',
          balance: '0',
          symbol: 'BAR',
        },
      });
    });
  });

  describe('allCurrentAccountTokens', () => {
    it('should return all account tokens with user tokens', () => {
      const getters = {
        tokensByAddress: () => ({
          '0x0': 'foo',
        }),
        currentNetUserTokens: {
          '0x1': 'bar',
        },
      };
      const rootGetters = {
        'accounts/currentAddressString': '0x0',
      };

      expect(
        tokensGetters.allCurrentAccountTokens(null, getters, null, rootGetters),
      ).toEqual({
        '0x0': 'foo',
        '0x1': 'bar',
      });
    });
  });

  describe('allCurrentAccountFullTokens', () => {
    it('should return all account tokens with balances and prices ', () => {
      const state = {
        prices: {
          FOO: '2',
        },
      };
      const getters = {
        allCurrentAccountTokens: {
          '0x1': {
            address: '0x1',
            symbol: 'FOO',
          },
          '0x2': {
            address: '0x2',
            symbol: 'BAR',
          },
        },
        balancesByAddress: () => ({
          '0x1': '1',
        }),
      };
      const rootGetters = {
        'accounts/currentAddressString': '0x1',
      };

      expect(
        tokensGetters.allCurrentAccountFullTokens(
          state,
          getters,
          null,
          rootGetters,
        ),
      ).toEqual({
        '0x1': {
          address: '0x1',
          price: '2',
          balance: '1',
          symbol: 'FOO',
        },
        '0x2': {
          address: '0x2',
          price: '0',
          balance: '0',
          symbol: 'BAR',
        },
      });
    });
  });

  describe('allCurrentAccountTokensWithNonZeroBalance', () => {
    it('should return all account tokens with non zero balances', () => {
      const getters = {
        allCurrentAccountFullTokens: {
          '0x1': {
            address: '0x1',
            price: '2',
            balance: '1',
            symbol: 'FOO',
          },
          '0x2': {
            address: '0x2',
            price: '0',
            balance: '0',
            symbol: 'BAR',
          },
        },
      };

      expect(
        tokensGetters.allCurrentAccountTokensWithNonZeroBalance(null, getters),
      ).toEqual({
        '0x1': {
          address: '0x1',
          price: '2',
          balance: '1',
          symbol: 'FOO',
        },
      });
    });
  });
});
