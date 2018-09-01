import actions from '@/store/tokens/actions';
import {
  SAVE_TOKEN,
  SAVE_TOKENS,
  DELETE_TOKEN,
  SAVE_TOKENS_PRICES,
  SAVE_TOKENS_BALANCES,
  SAVE_TOKEN_PRICE,
  SAVE_TOKEN_INFO,
  SAVE_TRACKED_TOKENS,
} from '@/store/tokens/mutations-types';
import { NotificationError } from '@/class';
import Web3 from 'web3';
import {
  userService,
  tokenInfoService,
  ethplorerService,
  priceService,
} from '@/services';

jest.useFakeTimers();

describe('tokens actions', () => {
  let commit, dispatch, token, state, getters, rootState;
  token = {
    address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
    symbol: 'KEK-TOKEN',
  };
  describe('saveTokenAndSubscribe', () => {
    beforeEach(() => {
      userService.setSetting = jest.fn();
      commit = jest.fn();
      dispatch = jest.fn();
      getters = {
        net: 1,
      };
      state = {
        savedTokens: {},
        trackedTokens: [],
      };
    });
    it('should try to save token with service and SAVE_TOKEN ', async () => {
      await actions.saveTokenAndSubscribe(
        { commit, state, getters, dispatch },
        { token },
      );
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKEN, {
        net: getters.net,
        token,
      });
      expect(userService.setSetting).toHaveBeenCalledTimes(1);
      expect(userService.setSetting).toHaveBeenCalledWith('tokens', {
        [getters.net]: [token],
      });
    });

    it('should emit error and dont change state if failed to fetch data', async () => {
      const error = new NotificationError({
        message: 'kek',
        title: 'kek',
      });
      userService.setSetting.mockRejectedValue(error);
      await actions.saveTokenAndSubscribe(
        { commit, state, getters, dispatch },
        { token },
      );
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });
  describe('deleteTokenAndUnsubscribe', () => {
    beforeEach(() => {
      userService.setSetting = jest.fn();
      commit = jest.fn();
      dispatch = jest.fn();
      getters = {
        net: 1,
      };
      state = {
        savedTokens: {
          1: [token],
        },
        trackedTokens: [],
      };
    });
    it('should try to delete token with service and DELETE_TOKEN ', async () => {
      await actions.deleteTokenAndUnsubscribe(
        { commit, state, getters },
        { token },
      );
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(DELETE_TOKEN, {
        net: getters.net,
        token,
      });
      expect(userService.setSetting).toHaveBeenCalledTimes(1);
      expect(userService.setSetting).toHaveBeenCalledWith('tokens', {
        1: [],
      });
    });
    it('should emit error and dont change state if failed to fetch data', async () => {
      const error = new NotificationError({
        message: 'kek',
        title: 'kek',
      });
      userService.setSetting.mockRejectedValue(error);
      await actions.deleteTokenAndUnsubscribe(
        { commit, state, getters, dispatch },
        { token },
      );
      expect(commit).toHaveBeenCalledTimes(0);
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('getAllTokens', () => {
    beforeEach(() => {
      userService.setSetting = jest.fn();
      dispatch = jest.fn();
      commit = jest.fn();
      getters = {
        net: 1,
      };
    });
    it('should resolve array of Tokens from service', async () => {
      tokenInfoService.getTokensList = jest.fn();
      tokenInfoService.getTokensList.mockReturnValueOnce([token]);
      await actions.getAllTokens({ dispatch, getters, commit });
      expect(commit).toHaveBeenCalledWith(SAVE_TOKEN_INFO, [token]);
    });

    it('should emit error and return empty array if failed to fetch data', async () => {
      tokenInfoService.getTokensList = jest.fn();
      tokenInfoService.getTokensList.mockRejectedValueOnce();
      await actions.getAllTokens({ dispatch, getters, commit });
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
  describe('subscribeOnTokensBalancesUpdates', () => {
    beforeEach(() => {
      dispatch = jest.fn();
      commit = jest.fn();
      getters = {
        net: 1,
        address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
      };
      state = {
        trackedTokens: [],
      };
    });
    it('should get tokens with balance', async () => {
      expect.assertions(2);
      const tokensWithBalance = [
        {
          token,
        },
      ];
      dispatch.mockReturnValueOnce(tokensWithBalance);
      await actions.subscribeOnTokensBalancesUpdates({
        dispatch,
        getters,
        state,
        commit,
      });
      expect(dispatch).toHaveBeenNthCalledWith(1, 'getTokensWithBalance');
      expect(dispatch).toHaveBeenNthCalledWith(2, 'updateTokensBalances');
    });
  });
  describe('getTokensWithBalance', () => {
    beforeEach(() => {
      getters = {
        address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
      };
      state = {
        allTokens: {
          [token.address]: token,
        },
        trackedTokens: [],
      };
      dispatch = jest.fn();
      ethplorerService.getTokensWithBalance = jest.fn();
    });
    it('gets tokens with balance for current address, and updates api status', async () => {
      ethplorerService.getTokensWithBalance.mockReturnValueOnce([token]);
      await actions.getTokensWithBalance({ state, dispatch, commit, getters });
      expect(ethplorerService.getTokensWithBalance).toBeCalledWith(
        getters.address,
      );
      expect(dispatch).toBeCalledWith(
        'connectionStatus/updateApiErrorStatus',
        {
          id: 'ethplorer',
          status: true,
        },
        { root: true },
      );
      expect(commit).toBeCalledWith(SAVE_TRACKED_TOKENS, [token.address]);
    });
  });
  describe('updateTokensPrices', () => {
    beforeEach(() => {
      state = {
        trackedTokens: [token],
      };
      commit = jest.fn();
      getters = {
        activeCurrencyName: 'ETH',
      };
      priceService.getPrices = jest.fn();
    });
    it('gets tokens prices and saves them with mutation', async () => {
      const pricesMock = {};
      priceService.getPrices.mockReturnValueOnce(pricesMock);
      await actions.updateTokensPrices({ commit, state, getters });
      expect(priceService.getPrices).toHaveBeenCalledTimes(1);
      expect(priceService.getPrices).toHaveBeenCalledWith(
        [token.symbol],
        getters.activeCurrencyName,
      );
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKENS_PRICES, pricesMock);
    });
  });
  describe('updateTokensBalances', () => {
    beforeEach(() => {
      commit = jest.fn();
      getters = {
        address: '0x999',
        trackedTokens: [
          {
            address: '0x123',
            getBalance: jest.fn(() => Promise.resolve('100')),
          },
          {
            address: '0x456',
            getBalance: jest.fn(() => Promise.resolve('200')),
          },
        ],
      };
    });
    it('gets tokens balances and saves them with mutation', async () => {
      await actions.updateTokensBalances({ commit, getters });
      expect(getters.trackedTokens[0].getBalance).toHaveBeenCalledWith(
        getters.address,
      );
      expect(getters.trackedTokens[1].getBalance).toHaveBeenCalledWith(
        getters.address,
      );
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKENS_BALANCES, {
        '0x123': '100',
        '0x456': '200',
      });
    });
    it('sets balance to null on error', async () => {
      (getters.trackedTokens[1] = {
        address: '0x456',
        getBalance: jest.fn(() => Promise.reject()),
      }),
        await actions.updateTokensBalances({ commit, getters });
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKENS_BALANCES, {
        '0x123': '100',
        '0x456': null,
      });
    });
  });
  describe('updateTokenPrice', () => {
    beforeEach(() => {
      commit = jest.fn();
      getters = {
        activeCurrencyName: 'ETH',
      };
      priceService.getPrice = jest.fn();
    });
    it('gets tokens prices and saves them with mutation', async () => {
      const price = {};
      priceService.getPrice.mockReturnValueOnce(price);
      await actions.updateTokenPrice(
        { commit, getters },
        { symbol: token.symbol },
      );
      expect(priceService.getPrice).toHaveBeenCalledTimes(1);
      expect(priceService.getPrice).toHaveBeenCalledWith(
        token.symbol,
        getters.activeCurrencyName,
      );
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKEN_PRICE, {
        symbol: token.symbol,
        price,
      });
    });
  });
  describe('init', () => {
    beforeEach(() => {
      dispatch = jest.fn();
    });
    it('gets all tokens on init', async () => {
      await actions.init({ dispatch });
      expect(dispatch).toHaveBeenCalledWith('getAllTokens');
      expect(dispatch).toHaveBeenCalledWith('subscribeOnTokensPricesUpdates');
    });
  });
});
