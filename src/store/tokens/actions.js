import {
  SET_LOADING,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
  SET_NETWORK_TOKENS,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_PRICES,
  ADD_USER_TOKEN,
  REMOVE_USER_TOKEN,
} from './mutations-types';
import { ERC20Token, NotificationError } from '@/class';
import {
  tokenInfoService,
  ethplorerService,
  priceService,
  userService,
} from '@/services';
import { merge } from '@/utils/objects';
import { mapArrayByProp } from '@/utils/arrays';
import { priceUpdateInterval } from '@/config';

const init = async ({ dispatch }) => {
  await dispatch('getNetworkTokens');

  dispatch('subscribeOnCurrentAccountTokensPricesUpdates');
};

const subscribeOnCurrentAccountTokensPricesUpdates = ({ dispatch }) => {
  dispatch('getCurrentAccountTokensPrices');

  setInterval(() => {
    dispatch('getCurrentAccountTokensPrices');
  }, priceUpdateInterval);
};

const addUserToken = async (
  { commit, dispatch, getters, rootGetters },
  { token },
) => {
  if (!getters.userTokenByAddress(token.address)) {
    try {
      commit(ADD_USER_TOKEN, {
        net: rootGetters['web3/activeNetwork'],
        token,
      });

      await userService.setSetting(
        'tokens',
        getters.userTokensListedByNetworks,
      );
    } catch (err) {
      dispatch('errors/emitError', err, { root: true });
    }
  }
};

const removeUserToken = async (
  { commit, getters, dispatch, rootGetters },
  { token },
) => {
  if (getters.userTokenByAddress(token.address)) {
    try {
      /**
       * TODO: может быть лучше сделать геттер, который будет возвращать токены без переданного значения
       * Сейчас в случае ошибки все будет прыгать и токен будет возвращаться на место.
       * Не круто
       */
      commit(REMOVE_USER_TOKEN, {
        net: rootGetters['web3/activeNetwork'],
        token,
      });
      await userService.setSetting(
        'tokens',
        getters.userTokensListedByNetworks,
      );
    } catch (err) {
      commit(ADD_USER_TOKEN, {
        net: rootGetters['web3/activeNetwork'],
        token,
      });
      dispatch('errors/emitError', err, { root: true });
    }
  }
};

const getCurrentAccountTokens = async ({ commit, dispatch, rootGetters }) => {
  const address = rootGetters['accounts/currentAddressString'];

  if (!address) return;

  try {
    commit(SET_LOADING, true);

    await dispatch('getTokensByAddress', {
      address,
    });
  } catch (err) {
    const error = new NotificationError({
      title: 'Failed token subscription',
      text: "Token information won't be updated. Please reload page.",
      type: 'is-warning',
    });
    dispatch('errors/emitError', error, { root: true });
  } finally {
    commit(SET_LOADING, false);
  }
};

const getCurrentAccountTokensBalances = async ({
  dispatch,
  commit,
  getters,
  rootGetters,
}) => {
  const address = rootGetters['accounts/currentAddressString'];

  if (!address) return;

  const tokens = getters.allCurrentAccountTokens;
  const tokensBalances = await dispatch('getTokensBalances', {
    address,
    tokens,
  });

  commit(SET_BALANCES_BY_ADDRESS, {
    balances: tokensBalances,
    address,
  });
};

const getCurrentAccountTokensPrices = async ({ dispatch, getters }) => {
  await dispatch(
    'getTokensPrices',
    Object.values(getters.allCurrentAccountTokens).map(({ symbol }) => symbol),
  );
};

const getTokensByAddress = async ({ dispatch, commit }, { address }) => {
  let resolvedTokens = [];

  try {
    resolvedTokens = await ethplorerService.getTokensWithBalance(address);

    dispatch(
      'connectionStatus/updateApiErrorStatus',
      {
        id: 'ethplorer',
        status: true,
      },
      { root: true },
    );
  } catch (e) {
    e.apiError = {
      id: 'ethplorer',
      status: false,
    };
    dispatch('errors/emitError', e, { root: true });
  }

  const mappedTokens = mapArrayByProp(resolvedTokens, 'address');

  commit(ADD_NETWORK_TOKENS, mappedTokens);
  commit(SET_TOKENS_BY_ADDRESS, {
    address,
    tokens: Object.keys(mappedTokens),
  });

  return mappedTokens;
};

const getTokensBalancesByAddress = async (
  { commit, dispatch, getters },
  { address },
) => {
  const tokens = getters.tokensByAddress(address);
  const tokensBalances = await dispatch('getTokensBalances', {
    address,
    tokens,
  });

  commit(SET_BALANCES_BY_ADDRESS, {
    address,
    balances: tokensBalances,
  });
};

const getNetworkTokens = async ({ commit, dispatch, rootGetters }) => {
  if (rootGetters['web3/activeNetwork'] !== 1) return;

  let tokens = [];

  try {
    commit(SET_LOADING, true);

    tokens = await tokenInfoService.getTokensList();
  } catch (e) {
    const error = new NotificationError({
      title: 'Failed to get list of tokens',
      text:
        'An error occurred while retrieving the list of tokens. Please try again.',
      type: 'is-warning',
    });
    dispatch('errors/emitError', error, { root: true });
  } finally {
    commit(SET_NETWORK_TOKENS, tokens);
    commit(SET_LOADING, false);
  }
};

const getTokensBalances = async (ctx, { address, tokens }) => {
  const erc20Tokens = Object.keys(tokens).map(key => new ERC20Token(key));
  const balances = await Promise.all(
    erc20Tokens.map(async erc20Token => {
      try {
        const balance = await erc20Token.getBalance(address);

        return {
          [erc20Token.address]: balance,
        };
      } catch (err) {
        return {
          [erc20Token.address]: null,
        };
      }
    }),
  );
  const tokensBalances = merge(...balances);

  return tokensBalances;
};

const getTokensPrices = async ({ commit, getters }, tokens) => {
  if (tokens.length === 0) return;

  const prices = await priceService.getPrices(
    tokens,
    getters.activeCurrencyName,
  );

  commit(SET_TOKENS_PRICES, prices);
};

export default {
  getTokensBalancesByAddress,
  subscribeOnCurrentAccountTokensPricesUpdates,
  init,

  getCurrentAccountTokens,
  getCurrentAccountTokensBalances,

  addUserToken,
  removeUserToken,
  getNetworkTokens,
  getTokensByAddress,
  getTokensBalances,
  getTokensPrices,
  getCurrentAccountTokensPrices,
};
