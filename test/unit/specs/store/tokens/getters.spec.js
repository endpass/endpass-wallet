import getters from '@/store/tokens/getters';

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
  describe('isTrackedTokensLoaded', () => {
    it("should return false if some of trackedTokens don't have balance", () => {
      let state = {
        trackedTokens: [
          {
            balance: 1,
          },
          {},
        ],
      };
      expect(getters.isTrackedTokensLoaded(state)).toBe(false);
    });
    it('should return true if all of trackedTokens have balance', () => {
      let state = {
        trackedTokens: [
          {
            balance: 1,
          },
          {
            balance: 0,
          },
        ],
      };
      expect(getters.isTrackedTokensLoaded(state)).toBe(true);
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
    it('should filter tokens withut balance', () => {
      const tokenWithBlance = {
        balance: 1,
      };
      const tokenWithoutBlance = {
        balance: 0,
      };
      let mockGetters = {
        trackedTokens: [tokenWithBlance, tokenWithoutBlance],
      };
      expect(getters.tokensWithBalance(1, mockGetters)).toMatchObject([
        tokenWithBlance,
      ]);
    });
  });
  describe('trackedTokens', () => {
    it('should return empty array if trackedTokens is null', () => {
      let state = {
        trackedTokens: null,
      };
      expect(getters.trackedTokens(state)).toMatchObject([]);
    });
    it('should return trackedTokens if it is an array', () => {
      let state = {
        trackedTokens: [{}, {}],
      };
      expect(getters.trackedTokens(state)).toMatchObject(state.trackedTokens);
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
