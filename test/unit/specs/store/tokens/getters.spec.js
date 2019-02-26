/* eslint-disable import/no-named-default */
import tokensGetters from '@/store/tokens/getters';
import { NET_ID } from '@/constants';
import { address } from 'fixtures/accounts';
import {
  token,
  tokens,
  tokensBalances,
  tokensPricesBySymbols,
  tokensMappedByNetworks,
  tokensMappedByAddresses,
  tokensWithBalancesMappedByAddresses,
  fullTokensMappedByAddresses,
  expandedTokensMappedByNetworks,
  cuttedTokensMappedByNetworks,
} from 'fixtures/tokens';

const networkTokens = {
  '0x1': 'foo',
  '0x2': 'bar',
};
const userTokensByNetwork = {
  1: {
    '0x1': 'foo',
    '0x2': 'bar',
  },
  2: {
    '0x3': 'baz',
  },
};
const balancesByAddress = {
  '0x0': {
    '0x1': '1',
    '0x2': '2',
  },
};

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
        networkTokens,
        tokensByAddress: {
          '0x0': ['0x1', '0x2'],
        },
      };
      expect(tokensGetters.tokensByAddress(state)('0x0')).toEqual(
        networkTokens,
      );
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
        balancesByAddress,
      };

      expect(tokensGetters.balancesByAddress(state)('0x0')).toEqual(
        balancesByAddress['0x0'],
      );
    });

    it('should return empty object if address balances not exist in store', () => {
      const state = {
        balancesByAddress: {},
      };

      expect(tokensGetters.balancesByAddress(state)('0x0')).toMatchObject({});
    });
  });

  describe('userTokenByAddress', () => {
    it('should return token by given address from current net', () => {
      const state = {
        userTokens: {
          1: userTokensByNetwork[1],
        },
      };
      const rootGetters = {
        'web3/activeNetwork': 1,
      };

      expect(
        tokensGetters.userTokenByAddress(state, null, null, rootGetters)('0x1'),
      ).toBe(userTokensByNetwork[1]['0x1']);
    });
  });

  describe('currentNetUserTokens', () => {
    it('should return all user tokens from current net', () => {
      const state = {
        userTokens: userTokensByNetwork,
      };
      const rootGetters = {
        'web3/activeNetwork': 1,
      };

      expect(
        tokensGetters.currentNetUserTokens(state, null, null, rootGetters),
      ).toEqual(userTokensByNetwork[1]);
    });
  });

  describe('currentAccountTokens', () => {
    it('should returns current account tokens by tokensByAddress getter', () => {
      const getters = {
        tokensByAddress: jest.fn(() => tokensMappedByAddresses),
      };
      const rootGetters = {
        'accounts/currentAddressString': address,
      };
      const rootState = {
        accounts: {
          address,
        },
      };

      expect(
        tokensGetters.currentAccountTokens(
          null,
          getters,
          rootState,
          rootGetters,
        ),
      ).toEqual(tokensMappedByAddresses);
      expect(getters.tokensByAddress).toBeCalledTimes(1);
      expect(getters.tokensByAddress).toBeCalledWith(address);
    });
  });

  describe('currentNetUserFullTokens', () => {
    it('should returns current account tokens by fullTokensByAddress', () => {
      const getters = {
        currentNetUserTokens: tokensMappedByAddresses,
        fullTokens: jest.fn(() => tokensMappedByAddresses),
      };
      const rootGetters = {
        'accounts/currentAddressString': address,
      };
      const rootState = {
        accounts: {
          address,
        },
      };

      expect(
        tokensGetters.currentNetUserFullTokens(
          null,
          getters,
          rootState,
          rootGetters,
        ),
      ).toEqual(tokensMappedByAddresses);
      expect(getters.fullTokens).toBeCalledTimes(1);
      expect(getters.fullTokens).toBeCalledWith(
        address,
        tokensMappedByAddresses,
      );
    });
  });

  describe('currentAccountFullTokens', () => {
    it('should return current account tokens with all info received by fullTokensByAddress', () => {
      const getters = {
        fullTokensByAddress: jest.fn(() => tokensMappedByAddresses),
      };
      const rootGetters = {
        'accounts/currentAddressString': address,
      };
      const rootState = {
        accounts: {
          address,
        },
      };

      expect(
        tokensGetters.currentAccountFullTokens(
          null,
          getters,
          rootState,
          rootGetters,
        ),
      ).toEqual(tokensMappedByAddresses);
      expect(getters.fullTokensByAddress).toBeCalledTimes(1);
      expect(getters.fullTokensByAddress).toBeCalledWith(address);
    });
  });

  describe('fullTokens', () => {
    it('should returns given tokens with prices and balances', () => {
      const state = {
        prices: tokensPricesBySymbols,
      };
      const getters = {
        balancesByAddress: jest.fn(() => tokensBalances),
      };

      expect(
        tokensGetters.fullTokens(state, getters)(
          address,
          tokensMappedByAddresses,
        ),
      ).toEqual(tokensWithBalancesMappedByAddresses);
      expect(getters.balancesByAddress).toBeCalledTimes(1);
      expect(getters.balancesByAddress).toBeCalledWith(address);
    });
  });

  describe('fullTokensByAddress', () => {
    it('should return tokens by address with fullTokens getter', () => {
      const getters = {
        tokensByAddress: jest.fn(() => tokensMappedByAddresses),
        fullTokens: jest.fn(() => fullTokensMappedByAddresses),
      };

      expect(tokensGetters.fullTokensByAddress(null, getters)(address)).toEqual(
        fullTokensMappedByAddresses,
      );
      expect(getters.tokensByAddress).toBeCalledTimes(1);
      expect(getters.tokensByAddress).toBeCalledWith(address);
      expect(getters.fullTokens).toBeCalledTimes(1);
      expect(getters.fullTokens).toBeCalledWith(
        address,
        tokensMappedByAddresses,
      );
    });
  });

  describe('allCurrentAccountTokens', () => {
    it('should return all account tokens with user tokens', () => {
      const getters = {
        currentAccountTokens: {
          '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144':
            tokensMappedByAddresses[
              '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144'
            ],
        },
        currentNetUserTokens: {
          '0xE41d2489571d322189246DaFA5ebDe1F4699F498':
            tokensMappedByAddresses[
              '0xE41d2489571d322189246DaFA5ebDe1F4699F498'
            ],
        },
      };

      expect(tokensGetters.allCurrentAccountTokens(null, getters)).toEqual(
        tokensMappedByAddresses,
      );
    });
  });

  describe('allCurrentAccountFullTokens', () => {
    it('should return all account tokens with balances and prices ', () => {
      const getters = {
        allCurrentAccountTokens: tokensMappedByAddresses,
        fullTokens: jest.fn(() => fullTokensMappedByAddresses),
      };
      const rootGetters = {
        'accounts/currentAddressString': address,
      };
      const rootState = {
        accounts: {
          address,
        },
      };

      expect(
        tokensGetters.allCurrentAccountFullTokens(
          null,
          getters,
          rootState,
          rootGetters,
        ),
      ).toEqual(fullTokensMappedByAddresses);
      expect(getters.fullTokens).toBeCalledTimes(1);
      expect(getters.fullTokens).toBeCalledWith(
        address,
        tokensMappedByAddresses,
      );
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

  describe('userTokensWithToken', () => {
    it('should returns user tokens with given token for given net', () => {
      const state = {
        userTokens: tokensMappedByNetworks,
      };

      expect(
        tokensGetters.userTokensWithToken(state)({
          net: NET_ID.MAIN,
          token,
        }),
      ).toEqual(expandedTokensMappedByNetworks);
    });
  });

  describe('userTokensWithoutToken', () => {
    it('should returns user tokens without given token for given net', () => {
      const state = {
        userTokens: tokensMappedByNetworks,
      };

      expect(
        tokensGetters.userTokensWithoutToken(state)({
          net: NET_ID.MAIN,
          token: tokens[0],
        }),
      ).toEqual(cuttedTokensMappedByNetworks);
    });
  });
});
