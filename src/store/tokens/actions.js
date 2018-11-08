import { mapValues } from 'lodash';
import {
  SET_LOADING,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
  ADD_NETWORK_TOKENS,
  ADD_TOKENS_PRICES,
  SET_USER_TOKENS,
} from './mutations-types';
import { NotificationError, Token } from '@/class';
import ERC20Token from '@/class/erc20';
import {
  tokenInfoService,
  ethplorerService,
  priceService,
  userService,
} from '@/services';
import { merge } from '@/utils/objects';
import { mapArrayByProp } from '@/utils/arrays';
import { MAIN_NET_ID } from '@/constants';

const init = async ({ dispatch }) => {
  await dispatch('getNetworkTokens');

  dispatch('subscribeOnCurrentAccountTokensUpdates');
};

const subscribeOnCurrentAccountTokensUpdates = ({ dispatch }) => {
  dispatch('getCurrentAccountTokensData');

  setInterval(() => {
    dispatch('getCurrentAccountTokensData');
  }, ENV.priceUpdateInterval);
};

const addUserToken = async (
  { commit, dispatch, getters, rootGetters },
  { token },
) => {
  const consistentToken = Token.getConsistent(token);

  if (!getters.userTokenByAddress(consistentToken.address)) {
    try {
      const updatedTokens = getters.userTokensWithToken({
        net: rootGetters['web3/activeNetwork'],
        token: consistentToken,
      });

      await userService.setSetting(
        'tokens',
        mapValues(updatedTokens, Object.values),
      );

      commit(SET_USER_TOKENS, updatedTokens);
    } catch (err) {
      dispatch('errors/emitError', err, { root: true });
    }
  }
};

const removeUserToken = async (
  { commit, getters, dispatch, rootGetters },
  { token },
) => {
  const consistentToken = Token.getConsistent(token);

  if (getters.userTokenByAddress(consistentToken.address)) {
    try {
      const updatedTokens = getters.userTokensWithoutToken({
        net: rootGetters['web3/activeNetwork'],
        token: consistentToken,
      });

      await userService.setSetting(
        'tokens',
        mapValues(updatedTokens, Object.values),
      );

      commit(SET_USER_TOKENS, updatedTokens);
    } catch (err) {
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
  await dispatch('getTokensPrices', {
    tokensSymbols: Object.values(getters.allCurrentAccountTokens).map(
      ({ symbol }) => symbol,
    ),
  });
};

const getCurrentAccountTokensData = async ({ dispatch }) => {
  await dispatch('getCurrentAccountTokensPrices');
  await dispatch('getCurrentAccountTokensBalances');
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
  } catch (e) {
    // May be we must set empty array to user tokens
    e.apiError = {
      id: 'ethplorer',
      status: false,
    };
    dispatch('errors/emitError', e, { root: true });
  }
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
  const isMainNetwork = rootGetters['web3/activeNetwork'] === MAIN_NET_ID;

  if (!isMainNetwork) return;

  try {
    commit(SET_LOADING, true);

    const networkTokens = await tokenInfoService.getTokensList();

    commit(ADD_NETWORK_TOKENS, mapArrayByProp(networkTokens, 'address'));
  } catch (e) {
    const error = new NotificationError({
      title: 'Failed to get list of tokens',
      text:
        'An error occurred while retrieving the list of tokens. Please try again.',
      type: 'is-warning',
    });
    dispatch('errors/emitError', error, { root: true });
  } finally {
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

const getTokensPrices = async ({ commit, getters }, { tokensSymbols }) => {
  if (tokensSymbols.length === 0) return;

  try {
    const prices = await priceService.getPrices(
      tokensSymbols,
      getters.activeCurrencyName,
    );

    commit(ADD_TOKENS_PRICES, prices);
  } catch (err) {
    commit(ADD_TOKENS_PRICES, {});
  }
};

export default {
  init,
  subscribeOnCurrentAccountTokensUpdates,
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
  getCurrentAccountTokensData,
};
