import mutations from '@/store/tokens/mutations';
import {
  SET_LOADING,
  SET_NETWORK_TOKENS,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_PRICES,
  SET_USER_TOKENS,
  ADD_USER_TOKEN,
  REMOVE_USER_TOKEN,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
} from '@/store/tokens/mutations-types';
import { token, tokens, tokensPrices, balances } from 'fixtures/tokens';

describe('tokens mutations', () => {
  let state;

  beforeEach(() => {
    state = {
      networkTokens: {},
      userTokens: {},
      prices: {},
      tokensByAddress: {},
      balancesByAddress: {},
      isLoading: false,
    };
  });

  describe('SET_LOADING', () => {
    it('should change loading status', () => {
      const loadingStuses = [true, false];

      loadingStuses.forEach(status => {
        mutations[SET_LOADING](state, status);

        expect(state.isLoading).toBe(status);
      });
    });
  });

  describe('SET_NETWORK_TOKENS', () => {
    it('should set network tokens mapped by addresses', () => {
      mutations[SET_NETWORK_TOKENS](state, tokens);

      expect(state.networkTokens).toEqual({
        [tokens[0].address]: tokens[0],
        [tokens[1].address]: tokens[1],
      });
    });
  });

  describe('ADD_NETWORK_TOKENS', () => {
    it('should merge existing network tokens with given', () => {
      const networkTokens = {
        [tokens[0].address]: tokens[0],
        [tokens[1].address]: tokens[1],
      };
      state.networkTokens = networkTokens;

      mutations[ADD_NETWORK_TOKENS](state, {
        [token.address]: token,
      });

      expect(state.networkTokens).toEqual({
        ...networkTokens,
        [token.address]: token,
      });
    });
  });

  describe('SET_TOKENS_PRICES', () => {
    it('should set token prices', () => {
      mutations[SET_TOKENS_PRICES](state, tokensPrices);

      expect(state.prices).toEqual(tokensPrices);
    });

    it('should merge token prices with given', () => {
      state.prices = tokensPrices;

      mutations[SET_TOKENS_PRICES](state, {
        '0x0': '0',
      });

      expect(state.prices).toEqual({
        ...tokensPrices,
        '0x0': '0',
      });
    });
  });

  describe('SET_USER_TOKENS', () => {
    it('should set user tokens', () => {
      mutations[SET_USER_TOKENS](state, tokens);

      expect(state.userTokens).toEqual(tokens);
    });
  });

  describe('ADD_USER_TOKEN', () => {
    const userTokens = {
      1: {
        '0x0': 'foo',
      },
    };
    const newToken = {
      address: '0x1',
    };

    beforeEach(() => {
      state.userTokens = userTokens;
    });

    it('should add user token to existing network', () => {
      mutations[ADD_USER_TOKEN](state, {
        net: 1,
        token: newToken,
      });

      expect(state.userTokens).toEqual({
        1: {
          ...userTokens[1],
          [newToken.address]: newToken,
        },
      });
    });

    it('should add user token and to new network if it is not exist', () => {
      mutations[ADD_USER_TOKEN](state, {
        net: 2,
        token: newToken,
      });

      expect(state.userTokens).toEqual({
        ...userTokens,
        2: {
          [newToken.address]: newToken,
        },
      });
    });
  });

  describe('REMOVE_USER_TOKEN', () => {
    it('should remove user token from given net', () => {
      const userTokens = {
        1: {
          '0x0': 'foo',
        },
      };
      state.userTokens = userTokens;

      mutations[REMOVE_USER_TOKEN](state, {
        net: 1,
        token: {
          address: '0x0',
        },
      });

      expect(state.userTokens).toMatchObject({
        1: {},
      });
    });
  });

  describe('SET_TOKENS_BY_ADDRESS', () => {
    it('should set object by given address', () => {
      mutations[SET_TOKENS_BY_ADDRESS](state, {
        address: '0x0',
        tokens,
      });

      expect(state.tokensByAddress).toEqual({
        '0x0': tokens,
      });
    });
  });

  describe('SET_BALANCES_BY_ADDRESS', () => {
    it('should set balances by given address', () => {
      mutations[SET_BALANCES_BY_ADDRESS](state, {
        address: '0x0',
        balances,
      });

      expect(state.balancesByAddress).toEqual({
        '0x0': balances,
      });
    });
  });
});
