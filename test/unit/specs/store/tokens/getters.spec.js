import getters from '@/store/tokens/getters';
import { Token, ERC20Token } from '@/class';

describe('tokens getters', () => {
  describe('net', () => {
    it('should return net from web3', () => {
      const rootState = {
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
      const rootState = {
        accounts: {
          address: {
            getChecksumAddressString: () => 1,
          },
        },
      };
      expect(getters.address(1, 1, rootState)).toBe(1);
    });
  });
  describe('tokensWithBalance', () => {
    let state;
    let tokens;
    let mockGetters;
    beforeEach(() => {
      state = {
        trackedTokens: ['0x123', '0x456'],
        allTokens: {
          '0x123': {
            symbol: 'ABC',
            address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
          },
          '0x456': {
            symbol: 'DEF',
            address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
          },
          '0x789': {
            symbol: 'XYZ',
          },
        },
        balances: {
          '0x123': '100',
          '0x456': undefined,
        },
      };
      mockGetters = {
        savedTokenInfos: {
          // User submitted token
          '0x999': {
            symbol: 'XYZ',
            address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
          },
        },
      };
    });
    it('should return all tracked tokens and default balances to 0', () => {
      tokens = getters.tokensWithBalance(state, mockGetters);
      expect(tokens).toHaveLength(2);
      expect(tokens[0].balance).toEqual('100');
      expect(tokens[1].balance).toEqual('0');
      expect(tokens[0]).toBeInstanceOf(Token);
    });
    it('should merge token info from state', () => {
      tokens = getters.tokensWithBalance(state, mockGetters);
      expect(tokens[0].symbol).toEqual('ABC');
      expect(tokens[1].symbol).toEqual('DEF');
      expect(tokens[0]).toBeInstanceOf(Token);
    });
    it('should merge saved tokens', () => {
      state.trackedTokens.push('0x999');
      tokens = getters.tokensWithBalance(state, mockGetters);
      expect(tokens).toHaveLength(3);
      expect(tokens[2].symbol).toEqual('XYZ');
      expect(tokens[0]).toBeInstanceOf(Token);
    });
  });
  describe('trackedTokens', () => {
    it('should return empty array if trackedTokens is null', () => {
      const state = {
        trackedTokens: null,
      };
      expect(getters.trackedTokens(state)).toMatchObject([]);
    });
    it('should return an array of ERC20 token objects', () => {
      const state = {
        trackedTokens: ['0x123', '0x456'],
      };
      const tokens = getters.trackedTokens(state);
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toBeInstanceOf(ERC20Token);
      expect(tokens[0].address).toEqual(state.trackedTokens[0]);
    });
  });

  describe('activeCurrencyName', () => {
    it('should return currency name from web3', () => {
      const rootState = {
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
      expect(getters.savedCurrentNetworkTokens(state, mockGetters)).toBe('kek');
    });
  });
  describe('savedTokenInfos', () => {
    it('should return tokens from net', () => {
      const state = {
        savedTokens: {
          1: [{ address: '0x123', symbol: 'ABC' }],
        },
      };
      const mockGetters = {
        net: 1,
        savedCurrentNetworkTokens: state.savedTokens[1],
      };
      expect(getters.savedTokenInfos(state, mockGetters)).toEqual({
        '0x123': { address: '0x123', symbol: 'ABC' },
      });
    });
  });
});
