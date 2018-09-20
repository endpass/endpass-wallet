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
import { address } from '../../../fixtures/accounts';
import { tokens } from 'fixtures/tokens';

jest.useFakeTimers();

describe('tokens actions', () => {
  let commit;
  let dispatch;
  let state;
  let getters;
  let rootState;
  const token = {
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
      // mock saving
      state.savedTokens = {
        [getters.net]: [token],
      };
      await actions.saveTokenAndSubscribe(
        { commit, state, getters, dispatch },
        { token },
      );
      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKEN, {
        net: getters.net,
        token,
      });
      expect(commit).toBeCalledWith(SAVE_TRACKED_TOKENS, [token.address]);
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
      expect.assertions(1);

      await actions.getAllTokens({ dispatch, getters, commit });

      expect(commit).toHaveBeenCalledWith(SAVE_TOKEN_INFO, tokens);
    });

    it('should emit error and return empty array if failed to fetch data', async () => {
      expect.assertions(2);

      const error = new Error();

      tokenInfoService.getTokensList.mockRejectedValueOnce(error);

      await actions.getAllTokens({ dispatch, getters, commit });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(
        'errors/emitError',
        expect.any(NotificationError),
        {
          root: true,
        },
      );
    });
  });
  describe('subscribeOnTokensBalancesUpdates', () => {
    beforeEach(() => {
      dispatch = jest.fn();
      commit = jest.fn();
      getters = {
        net: 1,
        address,
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
        address,
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
    it('gets tokens with balance for current address, and updates store', async () => {
      expect.assertions(3);
      dispatch.mockReturnValueOnce([token]);
      await actions.getTokensWithBalance({ state, dispatch, commit, getters });
      expect(dispatch).toBeCalledWith('getTokensWithBalanceByAddress', {
        address,
      });
      expect(commit).toBeCalledWith(SAVE_TOKEN_INFO, [token]);
      expect(commit).toBeCalledWith(SAVE_TRACKED_TOKENS, [token.address]);
    });
  });
  describe('getTokensWithBalanceByAddress', () => {
    beforeEach(() => {
      dispatch = jest.fn();
      ethplorerService.getTokensWithBalance = jest.fn();
    });
    it('should return empty array if failed', async () => {
      expect.assertions(1);
      ethplorerService.getTokensWithBalance.mockRejectedValue({});
      const result = await actions.getTokensWithBalanceByAddress(
        { state, dispatch, commit, getters },
        { address },
      );
      expect(result).toMatchObject([]);
    });

    it('should emit error if failed', async () => {
      expect.assertions(1);
      const err = {};
      ethplorerService.getTokensWithBalance.mockRejectedValue(err);
      const result = await actions.getTokensWithBalanceByAddress(
        { state, dispatch, commit, getters },
        { address },
      );
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', err, {
        root: true,
      });
    });

    it('gets tokens with balance for current address, and updates api status', async () => {
      expect.assertions(1);
      ethplorerService.getTokensWithBalance.mockReturnValueOnce([token]);
      await actions.getTokensWithBalanceByAddress(
        { state, dispatch, commit, getters },
        { address },
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
        trackedTokens: [token.address],
      };
      commit = jest.fn();
      getters = {
        activeCurrencyName: 'ETH',
        tokensWithBalance: [token],
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
      dispatch = jest.fn();
      commit = jest.fn();
      getters = {
        address: '0x999',
        trackedTokens: [
          {
            address: '0x123',
          },
          {
            address: '0x456',
          },
        ],
      };
    });
    it('gets tokens balances and saves them with mutation', async () => {
      expect.assertions(3);
      dispatch.mockResolvedValueOnce(getters.trackedTokens);
      await actions.updateTokensBalances({ dispatch, commit, getters });
      expect(dispatch).toHaveBeenCalledWith('getTokensBalancesByAddress', {
        tokens: getters.trackedTokens,
        address: getters.address,
      });
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        SAVE_TOKENS_BALANCES,
        getters.trackedTokens,
      );
    });
  });
  describe('getTokensBalancesByAddress', () => {
    beforeEach(() => {
      dispatch = jest.fn();
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

    it('should set balance to null on error', async () => {
      expect.assertions(1);
      (getters.trackedTokens[1] = {
        address: '0x456',
        getBalance: jest.fn(() => Promise.reject()),
      }),
        await expect(
          actions.getTokensBalancesByAddress(
            { dispatch, commit, getters },
            {
              tokens: getters.trackedTokens,
              address: getters.address,
            },
          ),
        ).resolves.toMatchObject({
          '0x123': '100',
          '0x456': null,
        });
    });

    it('should get tokens balances and map them', async () => {
      expect.assertions(3);
      const result = await expect(
        actions.getTokensBalancesByAddress(
          { dispatch, commit, getters },
          {
            tokens: getters.trackedTokens,
            address: getters.address,
          },
        ),
      ).resolves.toMatchObject({
        '0x123': '100',
        '0x456': '200',
      });
      expect(getters.trackedTokens[0].getBalance).toHaveBeenCalled();
      expect(getters.trackedTokens[1].getBalance).toHaveBeenCalled();
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
