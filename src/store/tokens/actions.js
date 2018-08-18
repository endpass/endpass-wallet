import {
  SAVE_TOKEN,
  SAVE_TOKENS,
  DELETE_TOKEN,
  SAVE_TOKENS_PRICES,
  SAVE_TOKEN_PRICE,
  SAVE_TRACKED_TOKENS,
  SAVE_SERIALISATION_INTERVAL,
  SAVE_TOKEN_TRACKER_INSTANCE,
} from './mutations-types';
import TokenTracker from 'eth-token-tracker';
import { Token, NotificationError } from '@/class';
import {
  tokenInfoService,
  ethplorerService,
  priceService,
  userService,
} from '@/services';
import { subscriptionsAPIInterval } from '@/config';

const saveTokenAndSubscribe = async ({ state, commit, getters }, token) => {
  const { net } = getters;

  // Check if already subscribed to token
  const tokenExist =
    state.tokenTracker &&
    state.tokenTracker.tokens &&
    state.tokenTracker.tokens.find(
      subscriptionToken => subscriptionToken.address === token.address,
    );
  if (!tokenExist) {
    try {
      commit(SAVE_TOKEN, {
        token,
        net: net,
      });

      await userService.setSetting('tokens', state.savedTokens);

      state.tokenTracker.add({ ...token });
    } catch (e) {
      commit(DELETE_TOKEN, { token, net });
      dispatch('errors/emitError', e, { root: true });
    }
  }
};

const deleteTokenAndUnsubscribe = async (
  { commit, getters, state, dispatch },
  token,
) => {
  const { net } = getters;

  try {
    commit(DELETE_TOKEN, { token, net });
    await userService.setSetting('tokens', state.savedTokens);
  } catch (e) {
    commit(SAVE_TOKEN, {
      token,
      net,
    });
    state.tokenTracker.add({ ...token });
    dispatch('errors/emitError', e, { root: true });
  }
};

const getAllTokens = async ({ dispatch, getters }) => {
  if (getters.net !== 1) {
    return [];
  }
  let tokens = [];
  try {
    tokens = await tokenInfoService.getTokensList();
    tokens = tokens.map(token => new Token(token));
  } catch (e) {
    const error = new NotificationError({
      title: 'Failed to get list of tokens',
      text:
        'An error occurred while retrieving the list of tokens. Please try again.',
      type: 'is-warning',
    });
    dispatch('errors/emitError', error, { root: true });
  } finally {
    return tokens;
  }
};
const subscribeOnTokensBalancesUpdates = async ({
  dispatch,
  state,
  rootState,
}) => {
  if (!rootState.accounts.address) {
    return;
  }
  // destroy old subscription and recreate new one (in case of address/provider change)
  if (state.tokensSerializeInterval) {
    clearInterval(state.tokensSerializeInterval);
    state.tokenTracker.stop();
  }
  try {
    const tokensWithBalance = await dispatch('getTokensWithBalance');
    dispatch('createTokenTracker', tokensWithBalance);
  } catch (e) {
    const error = new NotificationError({
      title: 'Failed token subscription',
      text: "Token information won't be updated. Please reload page.",
      type: 'is-warning',
    });
    dispatch('errors/emitError', error, { root: true });
  }
};

const getTokensWithBalance = async ({ rootState, dispatch }) => {
  if (!rootState.accounts.address) {
    return;
  }
  const address = rootState.accounts.address.getChecksumAddressString();
  let tokensWithBalance = [];
  try {
    tokensWithBalance = await ethplorerService.getTokensWithBalance(address);
    tokensWithBalance = tokensWithBalance.map(token => token.tokenInfo);
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
  } finally {
    return tokensWithBalance;
  }
};
const updateTokensPrices = async ({ state, commit, rootState }) => {
  if (state.trackedTokens.length === 0) return;
  const symbols = state.trackedTokens.map(token => token.symbol);

  const prices = await priceService.getPrices(
    symbols,
    rootState.web3.activeCurrency.name,
  );
  commit(SAVE_TOKENS_PRICES, prices);
  return prices;
};
const updateTokenPrice = async ({ commit, rootState }, symbol) => {
  const price = await priceService.getPrice(
    symbol,
    rootState.web3.activeCurrency.name,
  );
  commit(SAVE_TOKEN_PRICE, { symbol, price });
  return price;
};
const subscribeOnTokensPricesUpdates = ({ dispatch }, tokensToSubscribe) => {
  setInterval(() => {
    dispatch('updateTokensPrices');
  }, subscriptionsAPIInterval);
};

const createTokenTracker = (
  { state, commit, getters, rootState },
  tokensWithBalance,
) => {
  commit(SAVE_TRACKED_TOKENS, []);

  const address = rootState.accounts.address.getChecksumAddressString();

  //Merge tokens list by address
  const tokensToTrack = tokensWithBalance.concat(
    getters.savedCurrentNetworkTokens.filter(
      savedToken =>
        !tokensWithBalance.find(
          tokenWithBalance => tokenWithBalance.address === savedToken.address,
        ),
    ),
  );

  const tokenTracker = new TokenTracker({
    userAddress: address,
    provider: rootState.web3.web3.currentProvider,
    pollingInterval: subscriptionsAPIInterval,
    tokens: tokensToTrack,
  });

  const serialisationInterval = setInterval(() => {
    if (state.tokenTracker) {
      const balances = state.tokenTracker.serialize();
      // TODO check for errors here
      if (balances.length && typeof balances[0].symbol !== 'undefined')
        commit(SAVE_TRACKED_TOKENS, balances);
    }
  }, subscriptionsAPIInterval);
  commit(SAVE_SERIALISATION_INTERVAL, serialisationInterval);
  commit(SAVE_TOKEN_TRACKER_INSTANCE, tokenTracker);
};

const init = ({ commit, dispatch }) => {
  dispatch('subscribeOnTokensPricesUpdates');
  return userService
    .getSetting('tokens')
    .then(tokens => commit(SAVE_TOKENS, tokens || {}))
    .catch(e => dispatch('errors/emitError', e, { root: true }));
};

export default {
  getAllTokens,
  saveTokenAndSubscribe,
  deleteTokenAndUnsubscribe,
  getTokensWithBalance,
  updateTokensPrices,
  updateTokenPrice,
  subscribeOnTokensBalancesUpdates,
  subscribeOnTokensPricesUpdates,
  createTokenTracker,
  init,
};
