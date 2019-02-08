import { state as tokensState } from '@/store/tokens';
import mutations from '@/store/tokens/mutations';
import {
  SET_LOADING,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_PRICES,
  SET_USER_TOKENS,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
  SET_INTERVAL_ID,
} from '@/store/tokens/mutations-types';
import { token, tokens, tokensPrices, balances } from 'fixtures/tokens';

describe('tokens mutations', () => {
  let state;

  beforeEach(() => {
    state = { ...tokensState };
  });

  describe('SET_LOADING', () => {
    it('should change loading status', () => {
      const loadingStatuses = [true, false];

      loadingStatuses.forEach(status => {
        mutations[SET_LOADING](state, status);

        expect(state.isLoading).toBe(status);
      });
    });
  });

  describe(SET_INTERVAL_ID, () => {
    it('should set interval', () => {
      const interval = 0;
      mutations[SET_INTERVAL_ID](state, interval);
      expect(state.intervalId).toBe(interval);
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
