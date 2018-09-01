import getters from '@/store/tokens/getters';
import { ERC20Token } from '@/class';

describe('tokens getters', () => {
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
  describe('tokensWithBalance', () => {
    let tokens;
    beforeEach(() => {
      let state = {
        trackedTokens: ['0x123', '0x456'],
        allTokens: {
          '0x123': { symbol: 'ABC' },
          '0x456': { symbol: 'DEF' },
        },
        balances: {
          '0x123': '100',
          '0x456': undefined,
        },
      };
      tokens = getters.tokensWithBalance(state);
    });
    it('should return all tracked tokens and default balances to 0', () => {
      expect(tokens).toHaveLength(2);
      expect(tokens[0].balance).toEqual('100');
      expect(tokens[1].balance).toEqual('0');
    });
    it('should merge token info from state', () => {
      expect(tokens[0].symbol).toEqual('ABC');
      expect(tokens[1].symbol).toEqual('DEF');
    });
  });
  describe('trackedTokens', () => {
    it('should return empty array if trackedTokens is null', () => {
      let state = {
        trackedTokens: null,
      };
      expect(getters.trackedTokens(state)).toMatchObject([]);
    });
    it('should return an array of ERC20 token objects', () => {
      let state = {
        trackedTokens: ['0x123', '0x456'],
      };
      let tokens = getters.trackedTokens(state);
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toBeInstanceOf(ERC20Token);
      expect(tokens[0].address).toEqual(state.trackedTokens[0]);
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
