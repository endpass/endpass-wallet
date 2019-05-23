import actions from '@/store/tokens/actions';
import {
  SET_LOADING,
  SET_USER_TOKENS,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_PRICES,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
} from '@/store/tokens/mutations-types';
import { Network } from '@endpass/class';
import tokenInfoService from '@/services/tokeninfo';
import cryptoDataService from '@/services/cryptoData';
import userService from '@/services/user';
import { Token, NotificationError } from '@/class';
import { address } from 'fixtures/accounts';
import {
  tokens,
  token,
  tokensMappedByAddresses,
  networkTokensMappedByAddresses,
  tokensMappedByNetworks,
  expandedTokensMappedByNetworks,
  cuttedTokensMappedByNetworks,
  tokensPrices,
} from 'fixtures/tokens';

jest.useFakeTimers();

describe('tokens actions', () => {
  let state;
  let commit;
  let dispatch;
  let getters;
  let rootGetters;

  beforeEach(() => {
    jest.clearAllMocks();
    state = {
      userTokens: { ...tokensMappedByNetworks },
    };
    dispatch = jest.fn();
    commit = jest.fn();
    rootGetters = {
      'web3/activeNetwork': Network.NET_ID.MAIN,
    };
  });

  describe('init', () => {
    it('should request network tokens and subscrible on prices update', async () => {
      expect.assertions(1);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledWith('loadNetworkTokens');
    });
  });

  describe('addUserToken', () => {
    it('should add user token if it is not exist in state', async () => {
      expect.assertions(2);

      getters = {
        userTokenByAddress: () => false,
        userTokensWithToken: () => expandedTokensMappedByNetworks,
      };

      await actions.addUserToken(
        { state, commit, dispatch, getters, rootGetters },
        {
          token,
        },
      );

      expect(userService.addToken).toBeCalledWith(
        Network.NET_ID.MAIN,
        Token.getConsistent(token),
      );
      expect(commit).toHaveBeenCalledWith(
        SET_USER_TOKENS,
        expandedTokensMappedByNetworks,
      );
    });

    it('should not add user token if it is exist in state ', async () => {
      expect.assertions(2);

      getters = {
        userTokenByAddress: () => true,
        userTokensWithToken: () => expandedTokensMappedByNetworks,
      };

      await actions.addUserToken(
        { state, commit, dispatch, getters, rootGetters },
        {
          token,
        },
      );

      expect(userService.addToken).not.toBeCalled();
      expect(commit).not.toBeCalled();
    });

    it('should handle error ', async () => {
      expect.assertions(3);

      const error = new Error();

      getters = {
        userTokenByAddress: () => false,
        userTokensWithToken: () => expandedTokensMappedByNetworks,
      };
      userService.addToken.mockRejectedValueOnce(error);

      await actions.addUserToken(
        { state, commit, dispatch, getters, rootGetters },
        {
          token,
        },
      );

      expect(commit).not.toBeCalled();
      expect(userService.addToken).toBeCalled();
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
        userTokensWithoutToken: () => cuttedTokensMappedByNetworks,
        currentNetUserTokens: tokensMappedByAddresses,
      };

      await actions.removeUserToken(
        { state, commit, dispatch, getters, rootGetters },
        { token: tokens[0] },
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(userService.removeToken).toBeCalledWith(
        Network.NET_ID.MAIN,
        Token.getConsistent(tokens[0]).address,
      );
      expect(commit).toHaveBeenCalledWith(
        SET_USER_TOKENS,
        cuttedTokensMappedByNetworks,
      );
    });

    it('should not do anything if target token is not exist in state', async () => {
      expect.assertions(2);

      getters = {
        userTokenByAddress: () => false,
        userTokensWithoutToken: () => cuttedTokensMappedByNetworks,
        currentNetUserTokens: tokensMappedByAddresses,
      };

      await actions.removeUserToken(
        { state, commit, dispatch, getters, rootGetters },
        {
          token: {
            address: '0x0123',
          },
        },
      );

      expect(userService.removeToken).not.toBeCalled();
      expect(commit).not.toBeCalled();
    });

    it('should handle error', async () => {
      expect.assertions(2);

      const error = new Error();

      getters = {
        userTokenByAddress: () => true,
        userTokensWithoutToken: () => cuttedTokensMappedByNetworks,
        currentNetUserTokens: tokensMappedByAddresses,
      };
      userService.removeToken.mockRejectedValueOnce(error);

      await actions.removeUserToken(
        { state, commit, dispatch, getters, rootGetters },
        { token: tokens[0] },
      );

      expect(commit).not.toBeCalled();
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('loadNetworkTokens', () => {
    beforeEach(() => {
      state = {
        networkTokens: {},
      };
    });

    it('should request and set network tokens', async () => {
      expect.assertions(6);

      tokenInfoService.getTokensList.mockResolvedValueOnce(tokens);

      await actions.loadNetworkTokens({ state, commit, dispatch, rootGetters });

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

      await actions.loadNetworkTokens({ state, commit, dispatch, rootGetters });

      expect(commit).not.toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(tokenInfoService.getTokensList).not.toBeCalled();
    });

    it('should handle error and set empty object as network tokens', async () => {
      expect.assertions(4);

      tokenInfoService.getTokensList.mockRejectedValueOnce();

      await actions.loadNetworkTokens({ state, commit, dispatch, rootGetters });

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, SET_LOADING, true);
      expect(commit).toHaveBeenNthCalledWith(2, SET_LOADING, false);
      expect(dispatch).toHaveBeenCalledWith(
        'errors/emitError',
        expect.any(NotificationError),
        { root: true },
      );
    });
  });

  describe('loadTokenPrices', () => {
    it('should request and set tokens prices', async () => {
      expect.assertions(2);

      getters = {
        activeCurrencyName: 'ETH',
      };
      cryptoDataService.getSymbolsPrices.mockResolvedValueOnce(tokensPrices);

      await actions.loadTokenPrices(
        { commit, getters },
        { tokensSymbols: tokens },
      );
      await global.flushPromises();

      expect(cryptoDataService.getSymbolsPrices).toHaveBeenCalledWith(
        tokens,
        'ETH',
      );
      console.log('tokensPrices', tokensPrices);
      expect(commit).toHaveBeenCalledWith(SET_TOKENS_PRICES, tokensPrices);
    });

    it('should not do anything if given tokens symbols are empty', async () => {
      expect.assertions(2);

      await actions.loadTokenPrices({ commit, getters }, { tokensSymbols: [] });
      await global.flushPromises();

      expect(cryptoDataService.getSymbolsPrices).not.toBeCalled();
      expect(commit).not.toBeCalled();
    });
  });

  describe('setTokensInfoByAddress', () => {
    it('should set prices, balances of given tokens separatly, and add it to the state', async () => {
      await actions.setTokensInfoByAddress(
        { commit },
        {
          address,
          tokens,
        },
      );

      expect(commit).toBeCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(1, SET_TOKENS_PRICES, {
        FST: { USD: '1' },
        SCDT: { USD: '0.01' },
      });
      expect(commit).toHaveBeenNthCalledWith(2, SET_BALANCES_BY_ADDRESS, {
        address,
        balances: { FST: '0', SCDT: '0' },
      });
      expect(commit).toHaveBeenNthCalledWith(3, SET_TOKENS_BY_ADDRESS, {
        address,
        tokens: tokens.map(item => item.address),
      });
      expect(commit).toHaveBeenNthCalledWith(
        4,
        ADD_NETWORK_TOKENS,
        networkTokensMappedByAddresses,
      );
    });
  });
});
