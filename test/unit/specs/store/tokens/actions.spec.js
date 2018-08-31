import actions from '@/store/tokens/actions';
import {
  SAVE_TOKEN,
  SAVE_TOKENS,
  DELETE_TOKEN,
  SAVE_TOKENS_PRICES,
  SAVE_TOKEN_PRICE,
  SAVE_TOKEN_TRACKER_INSTANCE,
  SAVE_TOKEN_INFO,
} from '@/store/tokens/mutations-types';
import { NotificationError } from '@/class';
import { tokenUpdateInterval } from '@/config';
import TokenTracker from 'eth-token-tracker';
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
        tokenTracker: {
          serialize: () => [],
          add: jest.fn(),
        },
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
      expect(userService.setSetting).toHaveBeenCalledWith(
        'tokens',
        state.savedTokens,
      );
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
      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, SAVE_TOKEN, {
        net: getters.net,
        token,
      });
      expect(commit).toHaveBeenNthCalledWith(2, DELETE_TOKEN, {
        net: getters.net,
        token,
      });
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
        tokenTracker: {
          serialize: () => [],
          add: jest.fn(),
        },
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
      expect(userService.setSetting).toHaveBeenCalledWith(
        'tokens',
        state.savedTokens,
      );
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
      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, DELETE_TOKEN, {
        net: getters.net,
        token,
      });
      expect(commit).toHaveBeenNthCalledWith(2, SAVE_TOKEN, {
        net: getters.net,
        token,
      });
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
        tokenTracker: {
          stop: jest.fn(),
        },
      };
    });
    it('should get tokens with balance and create tracker with them', async () => {
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
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(2, 'createTokenTracker', {
        tokensWithBalance,
      });
    });
    it('should reset interval', async () => {
      state.tokensSerializeInterval = setInterval(() => {});
      await actions.subscribeOnTokensBalancesUpdates({
        dispatch,
        getters,
        state,
        commit,
      });
      expect(clearInterval).toHaveBeenCalledTimes(1);
      expect(clearInterval).toHaveBeenCalledWith(state.tokensSerializeInterval);
      expect(state.tokenTracker.stop).toHaveBeenCalledTimes(1);
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
      };
      dispatch = jest.fn();
      ethplorerService.getTokensWithBalance = jest.fn();
    });
    it('gets tokens with balance for current address, and updates api status', async () => {
      ethplorerService.getTokensWithBalance.mockReturnValueOnce([token]);
      await actions.getTokensWithBalance({ state, dispatch, getters });
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
  describe('createTokenTracker', () => {
    const currentProvider = new Web3.providers.HttpProvider();
    beforeEach(() => {
      commit = jest.fn();
      dispatch = jest.fn();
      getters = {
        net: 1,
        address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
        savedCurrentNetworkTokens: [token],
      };
      rootState = {
        web3: {
          web3: {
            currentProvider,
          },
        },
      };
    });
    it('should creates right token tracker', () => {
      const tokenTrackerMock = new TokenTracker({
        userAddress: getters.address,
        provider: currentProvider,
        pollingInterval: tokenUpdateInterval,
        tokens: [token],
      });
      actions.createTokenTracker(
        { commit, dispatch, getters, rootState },
        { tokensWithBalance: [token] },
      );
      expect(commit.mock.calls[0][0]).toBe(SAVE_TOKEN_TRACKER_INSTANCE);
      expect(commit.mock.calls[0][1].userAddress).toBe(getters.address);
      expect(commit.mock.calls[0][1].tokens).toMatchObject([token]);
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
