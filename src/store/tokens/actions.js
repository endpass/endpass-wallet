import { get, omit, mapKeys } from 'lodash';
import {
  SET_LOADING,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_PRICES,
  SET_USER_TOKENS,
  SET_INTERVAL_ID,
} from './mutations-types';
import { NotificationError, Token } from '@/class';
import { tokenInfoService, cryptoDataService, userService } from '@/services';
import { mapArrayByProp } from '@endpass/utils/arrays';
import { Network } from '@endpass/class';

const init = async ({ dispatch }) => {
  await dispatch('getNetworkTokens');
};

const addUserToken = async (
  { commit, dispatch, getters, rootGetters },
  { token },
) => {
  try {
    const consistentToken = Token.getConsistent(token);

    if (getters.userTokenByAddress(consistentToken.address)) return;

    const net = rootGetters['web3/activeNetwork'];
    const updatedTokens = getters.userTokensWithToken({
      token: consistentToken,
      net,
    });

    await userService.addToken(net, consistentToken);

    commit(SET_USER_TOKENS, updatedTokens);
  } catch (err) {
    dispatch('errors/emitError', err, { root: true });
  }
};

const removeUserToken = async (
  { commit, getters, dispatch, rootGetters },
  { token },
) => {
  try {
    const consistentToken = Token.getConsistent(token);

    if (!getters.currentNetUserTokens[token.address]) return;

    const netId = rootGetters['web3/activeNetwork'];
    const updatedTokens = getters.userTokensWithoutToken({
      net: netId,
      token: consistentToken,
    });

    await userService.removeToken(netId, consistentToken.address);

    commit(SET_USER_TOKENS, updatedTokens);
  } catch (err) {
    dispatch('errors/emitError', err, { root: true });
  }
};

const getNetworkTokens = async ({ commit, dispatch, rootGetters }) => {
  const isMainNetwork =
    rootGetters['web3/activeNetwork'] === Network.NET_ID.MAIN;

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

const getTokensPrices = async ({ commit, getters }, { tokensSymbols }) => {
  if (tokensSymbols.length === 0) return;

  try {
    const prices = await cryptoDataService.getSymbolsPrices(
      tokensSymbols,
      getters.activeCurrencyName,
    );

    commit(SET_TOKENS_PRICES, prices);
  } catch (err) {
    commit(SET_TOKENS_PRICES, {});
  }
};

const setTokensInfoByAddress = async ({ commit }, { address, tokens }) => {
  const tokensBalances = tokens.reduce(
    (acc, token) =>
      Object.assign(acc, {
        [token.symbol]: token.balance || '0',
      }),
    {},
  );
  const tokensPrices = tokens.reduce(
    (acc, token) =>
      Object.assign(acc, {
        [token.symbol]: token.price || {},
      }),
    {},
  );
  const networkTokens = tokens.reduce(
    (acc, token) =>
      Object.assign(acc, {
        [token.address]: omit(token, ['price', 'balance']),
      }),
    {},
  );

  commit(SET_TOKENS_PRICES, tokensPrices);
  commit(SET_BALANCES_BY_ADDRESS, {
    balances: tokensBalances,
    address,
  });
  commit(SET_TOKENS_BY_ADDRESS, {
    tokens: tokens.map(token => token.address),
    address,
  });
  commit(ADD_NETWORK_TOKENS, networkTokens);
};

const setUserTokens = async ({ commit, rootGetters }, tokens) => {
  const currentNetwork = rootGetters['web3/activeNetwork'];

  if (get(tokens, currentNetwork)) {
    const fiatCurrency = rootGetters['price/fiatCurrency'];
    const tokensMappedByNetworksAndAddresses = Object.keys(tokens).reduce(
      (acc, key) =>
        Object.assign(acc, {
          [key]: mapKeys(tokens[key], 'address'),
        }),
      {},
    );
    const currentNetworkTokens = get(
      tokensMappedByNetworksAndAddresses,
      currentNetwork,
    );

    commit(SET_USER_TOKENS, tokensMappedByNetworksAndAddresses);

    const tokensPrices = await cryptoDataService.getSymbolsPrices(
      Object.keys(currentNetworkTokens).map(
        key => currentNetworkTokens[key].symbol,
      ),
      fiatCurrency,
    );

    commit(SET_TOKENS_PRICES, tokensPrices);
  }
};

export default {
  init,
  setUserTokens,
  addUserToken,
  removeUserToken,
  getNetworkTokens,
  getTokensPrices,
  setTokensInfoByAddress,
};
