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
import { NotificationError } from '@/class';
import ERC20Token from '@/class/erc20';
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
  try {
    const resolvedTokens = await ethplorerService.getTokensWithBalance(address);

    dispatch(
      'connectionStatus/updateApiErrorStatus',
      {
        id: 'ethplorer',
        status: true,
      },
      { root: true },
    );

    const mappedTokens = mapArrayByProp(resolvedTokens, 'address');

    commit(ADD_NETWORK_TOKENS, mappedTokens);
    commit(SET_TOKENS_BY_ADDRESS, {
      address,
      tokens: Object.keys(mappedTokens),
    });

    return mappedTokens;
  } catch (e) {
    e.apiError = {
      id: 'ethplorer',
      status: false,
    };
    dispatch('errors/emitError', e, { root: true });

    commit(SET_TOKENS_BY_ADDRESS, {
      address,
      tokens: [],
    });
  }

  return {};
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

  const tokens = [];

  try {
    commit(SET_LOADING, true);

    const networkTokens = await tokenInfoService.getTokensList();

    tokens.push(...networkTokens);
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
  const balances = await Promise.all(
    Object.keys(tokens).map(async tokenAddress => {
      try {
        const balance = await ERC20Token.getBalance(address, tokenAddress);

        return {
          [tokenAddress]: balance,
        };
      } catch (err) {
        return {
          [tokenAddress]: null,
        };
      }
    }),
  );
  const tokensBalances = merge(...balances);

  return tokensBalances;
};

const getTokensPrices = async ({ commit, getters }, tokensSymbols) => {
  if (tokensSymbols.length === 0) return;

  const prices = await priceService.getPrices(
    tokensSymbols,
    getters.activeCurrencyName,
  );

  commit(SET_TOKENS_PRICES, prices);
};

export default {
  init,
  subscribeOnCurrentAccountTokensPricesUpdates,
  addUserToken,
  removeUserToken,
  getTokensBalancesByAddress,
  getCurrentAccountTokens,
  getCurrentAccountTokensBalances,
  getNetworkTokens,
  getTokensByAddress,
  getTokensBalances,
  getTokensPrices,
  getCurrentAccountTokensPrices,
};
