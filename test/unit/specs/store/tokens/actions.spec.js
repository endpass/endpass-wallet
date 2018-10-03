import actions from '@/store/tokens/actions';
import {
  SET_LOADING,
  ADD_USER_TOKEN,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_BY_ADDRESS,
  REMOVE_USER_TOKEN,
  SET_BALANCES_BY_ADDRESS,
  SET_TOKENS_PRICES,
} from '@/store/tokens/mutations-types';
import { NotificationError } from '@/class';
import {
  userService,
  tokenInfoService,
  ethplorerService,
  priceService,
} from '@/services';
import ERC20Token from '@/class/erc20';
import { address } from 'fixtures/accounts';
import {
  tokens,
  token,
  tokensMappedByAddresses,
  tokensPrices,
  balances,
} from 'fixtures/tokens';

jest.useFakeTimers();

describe('tokens actions', () => {
  let commit;
  let dispatch;
  let getters;
  let rootGetters;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    commit = jest.fn();
    rootGetters = {
      'web3/activeNetwork': 1,
    };
  });

  describe('init', () => {
    it('should request network tokens and subscrible on prices update', async () => {
      expect.assertions(3);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'getNetworkTokens');
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        'subscribeOnCurrentAccountTokensUpdates',
      );
    });
  });

  describe('subscribeOnCurrentAccountTokensUpdates', () => {
    it('should set prices and balances updates interval', async () => {
      expect.assertions(3);

      jest.useFakeTimers();

      await actions.subscribeOnCurrentAccountTokensUpdates({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('getCurrentAccountTokensData');
      expect(setInterval).toHaveBeenCalledTimes(1);
    });
  });

  describe('addUserToken', () => {
    it('should add user token if it is not exist in state', async () => {
      expect.assertions(2);

      getters = {
        userTokenByAddress: () => false,
        userTokensListedByNetworks: () => tokens,
      };

      await actions.addUserToken(
        { commit, dispatch, getters, rootGetters },
        { token },
      );

      expect(commit).toHaveBeenCalledWith(ADD_USER_TOKEN, {
        net: 1,
        token,
      });
      expect(userService.setSetting).toHaveBeenCalledWith(
        'tokens',
        getters.userTokensListedByNetworks,
      );
    });

    it('should not add user token if it is exist in state ', async () => {
      expect.assertions(1);

      getters = {
        userTokenByAddress: () => true,
        userTokensListedByNetworks: () => tokens,
      };

      await actions.addUserToken(
        { commit, dispatch, getters, rootGetters },
        { token },
      );

      expect(commit).not.toBeCalled();
    });

    it('should handle error ', async () => {
      expect.assertions(3);

      const error = new Error();

      getters = {
        userTokenByAddress: () => false,
        userTokensListedByNetworks: () => tokens,
      };
      userService.setSetting.mockRejectedValueOnce(error);

      await actions.addUserToken(
        { commit, dispatch, getters, rootGetters },
        { token },
      );

      expect(commit).toHaveBeenCalledWith(ADD_USER_TOKEN, {
        net: 1,
        token,
      });
      expect(userService.setSetting).toHaveBeenCalledWith(
        'tokens',
        getters.userTokensListedByNetworks,
      );
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('removeUserToken', () => {
    it('should remove user token if it is exist in state', async () => {
      expect.assertions(3);

      getters = {
        userTokenByAddress: () => true,
        userTokensListedByNetworks: () => tokens,
      };

      await actions.removeUserToken(
        { commit, dispatch, getters, rootGetters },
        { token },
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(REMOVE_USER_TOKEN, {
        net: 1,
        token,
      });
      expect(userService.setSetting).toHaveBeenCalledWith(
        'tokens',
        getters.userTokensListedByNetworks,
      );
    });

    it('should not do anything if target token is not exist in state', async () => {
      expect.assertions(1);

      getters = {
        userTokenByAddress: () => false,
        userTokensListedByNetworks: () => tokens,
      };

      await actions.removeUserToken(
        { commit, dispatch, getters, rootGetters },
        { token },
      );

      expect(commit).not.toBeCalled();
    });

    it('should handle error and restore removed token', async () => {
      expect.assertions(5);

      const error = new Error();

      getters = {
        userTokenByAddress: () => true,
        userTokensListedByNetworks: () => tokens,
      };
      userService.setSetting.mockRejectedValueOnce(error);

      await actions.removeUserToken(
        { commit, dispatch, getters, rootGetters },
        { token },
      );

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, REMOVE_USER_TOKEN, {
        net: 1,
        token,
      });
      expect(commit).toHaveBeenNthCalledWith(2, ADD_USER_TOKEN, {
        net: 1,
        token,
      });
      expect(userService.setSetting).toHaveBeenCalledWith(
        'tokens',
        getters.userTokensListedByNetworks,
      );
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('getTokensBalancesByAddress', () => {
    it('should set balances', async () => {
      expect.assertions(2);

      getters = {
        tokensByAddress: () => tokens,
      };
      dispatch.mockResolvedValueOnce(balances);

      await actions.getTokensBalancesByAddress(
        { commit, dispatch, getters },
        { address },
      );

      expect(dispatch).toHaveBeenCalledWith('getTokensBalances', {
        address,
        tokens,
      });
      expect(commit).toHaveBeenCalledWith(SET_BALANCES_BY_ADDRESS, {
        address,
        balances,
      });
    });
  });

  describe('getCurrentAccountTokens', () => {
    beforeEach(() => {
      rootGetters = {
        'accounts/currentAddressString': address,
      };
    });

    it('should request tokens for current address', async () => {
      expect.assertions(5);

      await actions.getCurrentAccountTokens({ commit, dispatch, rootGetters });

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, SET_LOADING, true);
      expect(commit).toHaveBeenNthCalledWith(2, SET_LOADING, false);
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('getTokensByAddress', {
        address,
      });
    });

    it('should not do anything if current address is not exist', async () => {
      rootGetters = {
        'accounts/currentAddressString': null,
      };

      await actions.getCurrentAccountTokens({ commit, dispatch, rootGetters });

      expect(commit).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should handle error', async () => {
      expect.assertions(6);

      dispatch.mockRejectedValueOnce();

      await actions.getCurrentAccountTokens({ commit, dispatch, rootGetters });

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, SET_LOADING, true);
      expect(commit).toHaveBeenNthCalledWith(2, SET_LOADING, false);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'getTokensByAddress', {
        address,
      });
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        'errors/emitError',
        expect.any(NotificationError),
        { root: true },
      );
    });
  });

  describe('getCurrentAccountTokensBalances', () => {
    it('should set resolved balances for current address', async () => {
      expect.assertions(2);

      getters = {
        allCurrentAccountTokens: tokens,
      };
      rootGetters = {
        'accounts/currentAddressString': address,
      };

      dispatch.mockResolvedValueOnce(balances);

      await actions.getCurrentAccountTokensBalances({
        dispatch,
        commit,
        getters,
        rootGetters,
      });

      expect(dispatch).toHaveBeenCalledWith('getTokensBalances', {
        address,
        tokens,
      });
      expect(commit).toHaveBeenCalledWith(SET_BALANCES_BY_ADDRESS, {
        address,
        balances,
      });
    });

    it('should not do anything if current address is not exist', async () => {
      expect.assertions(2);

      rootGetters = {
        'accounts/currentAddressString': null,
      };

      await actions.getCurrentAccountTokensBalances({
        dispatch,
        commit,
        getters,
        rootGetters,
      });

      expect(dispatch).not.toBeCalled();
      expect(commit).not.toBeCalled();
    });
  });

  describe('getCurrentAccountTokensData', () => {
    it('should request current user tokens balances and prices', async () => {
      await actions.getCurrentAccountTokensData({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'getCurrentAccountTokensPrices',
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        'getCurrentAccountTokensBalances',
      );
    });
  });

  describe('getNetworkTokens', () => {
    beforeEach(() => {
      rootGetters = {
        'web3/activeNetwork': 1,
      };
    });

    it('should request and set network tokens', async () => {
      expect.assertions(6);

      tokenInfoService.getTokensList.mockResolvedValueOnce(tokens);

      await actions.getNetworkTokens({ commit, dispatch, rootGetters });

      expect(commit).toHaveBeenCalledTimes(3);
      expect(commit).toHaveBeenNthCalledWith(1, SET_LOADING, true);
      expect(commit).toHaveBeenNthCalledWith(
        2,
        ADD_NETWORK_TOKENS,
        tokensMappedByAddresses,
      );
      expect(commit).toHaveBeenNthCalledWith(3, SET_LOADING, false);
      expect(tokenInfoService.getTokensList).toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should not do anything if active network is not main', async () => {
      rootGetters = {
        'web3/activeNetwork': 0,
      };

      await actions.getNetworkTokens({ commit, dispatch, rootGetters });

      expect(commit).not.toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(tokenInfoService.getTokensList).not.toBeCalled();
    });

    it('should handle error and set empty object as network tokens', async () => {
      expect.assertions(6);

      tokenInfoService.getTokensList.mockRejectedValueOnce();

      await actions.getNetworkTokens({ commit, dispatch, rootGetters });

      expect(commit).toHaveBeenCalledTimes(3);
      expect(commit).toHaveBeenNthCalledWith(1, SET_LOADING, true);
      expect(commit).toHaveBeenNthCalledWith(2, ADD_NETWORK_TOKENS, {});
      expect(commit).toHaveBeenNthCalledWith(3, SET_LOADING, false);
      expect(dispatch).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(
        'errors/emitError',
        expect.any(NotificationError),
        { root: true },
      );
    });
  });

  describe('getTokensByAddress', () => {
    it('should request tokens by address and set it', async () => {
      expect.assertions(5);

      ethplorerService.getTokensWithBalance.mockResolvedValueOnce(tokens);

      await actions.getTokensByAddress({ dispatch, commit }, { address });

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(
        1,
        ADD_NETWORK_TOKENS,
        tokensMappedByAddresses,
      );
      expect(commit).toHaveBeenNthCalledWith(2, SET_TOKENS_BY_ADDRESS, {
        address,
        tokens: Object.keys(tokensMappedByAddresses),
      });
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(
        'connectionStatus/updateApiErrorStatus',
        {
          id: 'ethplorer',
          status: true,
        },
        { root: true },
      );
    });

    it('should handle errors', async () => {
      expect.assertions(4);

      const error = new Error();

      ethplorerService.getTokensWithBalance.mockRejectedValueOnce(error);

      await actions.getTokensByAddress({ dispatch, commit }, { address });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SET_TOKENS_BY_ADDRESS, {
        address,
        tokens: [],
      });
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('getTokensBalances', () => {
    it('should request each given token balance and return object with balances ', async () => {
      expect.assertions(2);

      const res = await actions.getTokensBalances(null, {
        tokens: tokensMappedByAddresses,
        address,
      });

      expect(ERC20Token.getBalance).toHaveBeenCalledTimes(2);
      expect(res).toEqual(
        Object.keys(tokensMappedByAddresses).reduce(
          (acc, key) =>
            Object.assign(acc, {
              [key]: expect.any(String),
            }),
          {},
        ),
      );
    });

    it('should set null to token if erc service throw error during requesting balance', async () => {
      expect.assertions(2);

      ERC20Token.getBalance.mockRejectedValue();

      const res = await actions.getTokensBalances(null, {
        tokens: tokensMappedByAddresses,
        address,
      });

      expect(ERC20Token.getBalance).toHaveBeenCalledTimes(2);
      expect(res).toEqual(
        Object.keys(tokensMappedByAddresses).reduce(
          (acc, key) =>
            Object.assign(acc, {
              [key]: null,
            }),
          {},
        ),
      );
    });
  });

  describe('getTokensPrices', () => {
    it('should request and set tokens prices', async () => {
      expect.assertions(2);

      getters = {
        activeCurrencyName: 'ETH',
      };
      priceService.getPrices.mockResolvedValueOnce(tokensPrices);

      await actions.getTokensPrices({ commit, getters }, tokens);

      expect(priceService.getPrices).toHaveBeenCalledWith(tokens, 'ETH');
      expect(commit).toHaveBeenCalledWith(SET_TOKENS_PRICES, tokensPrices);
    });

    it('should not do anything if given tokens symbols are empty', async () => {
      expect.assertions(2);

      await actions.getTokensPrices({ commit, getters }, []);

      expect(priceService.getPrices).not.toBeCalled();
      expect(commit).not.toBeCalled();
    });
  });

  describe('getCurrentAccountTokensPrices', () => {
    it('should request current account token prices', async () => {
      expect.assertions(1);

      getters = {
        allCurrentAccountTokens: tokens,
      };

      await actions.getCurrentAccountTokensPrices({ dispatch, getters });

      expect(dispatch).toHaveBeenCalledWith(
        'getTokensPrices',
        tokens.map(({ symbol }) => symbol),
      );
    });
  });
});
