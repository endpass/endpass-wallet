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
import { tokenUpdateInterval } from '@/config';

const saveTokenAndSubscribe = async (
  { state, commit, getters, dispatch },
  { token },
) => {
  const { net } = getters;

  // Check if already subscribed to token
  const tokenExist =
    state.tokenTracker &&
    state.tokenTracker.serialize() &&
    state.tokenTracker
      .serialize()
      .includes(
        subscriptionToken => subscriptionToken.address === token.address,
      );
  if (!tokenExist) {
    try {
      const newTokensData = Object.assign({}, state.savedTokens);
      newTokensData[net] = newTokensData[net] || [];
      newTokensData[net].push(token);
      await userService.setSetting('tokens', newTokensData);
      commit(SAVE_TOKEN, {
        token,
        net: net,
      });
    } catch (e) {
      dispatch('errors/emitError', e, { root: true });
    }
  }
};

const deleteTokenAndUnsubscribe = async (
  { commit, getters, state, dispatch },
  { token },
) => {
  const { net } = getters;

  try {
    const newTokensData = Object.assign({}, state.savedTokens);
    const deletionTokenIndex = newTokensData[net].findIndex(
      savedToken => savedToken.address === token.address,
    );
    newTokensData[net] = newTokensData[net].slice(0);
    newTokensData[net].splice(deletionTokenIndex, 1);
    await userService.setSetting('tokens', newTokensData);
    commit(DELETE_TOKEN, { token, net });
  } catch (e) {
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
  commit,
  getters,
}) => {
  if (!getters.address) {
    return;
  }
  commit(SAVE_TRACKED_TOKENS, null);
  // destroy old subscription and recreate new one (in case of address/provider change)
  if (state.tokensSerializeInterval) {
    clearInterval(state.tokensSerializeInterval);
    state.tokenTracker.stop();
  }
  try {
    const tokensWithBalance = await dispatch('getTokensWithBalance');
    dispatch('createTokenTracker', { tokensWithBalance });
    // TokenTracker update event doesent work
    const serialisationInterval = setInterval(() => {
      const balances = state.tokenTracker.serialize();
      // TODO check for errors here
      if (balances.length && typeof balances[0].symbol !== 'undefined')
        commit(SAVE_TRACKED_TOKENS, balances);
    }, tokenUpdateInterval);
    commit(SAVE_SERIALISATION_INTERVAL, serialisationInterval);
  } catch (e) {
    const error = new NotificationError({
      title: 'Failed token subscription',
      text: "Token information won't be updated. Please reload page.",
      type: 'is-warning',
    });
    dispatch('errors/emitError', error, { root: true });
  }
};

const getTokensWithBalance = async ({ getters, dispatch }) => {
  const { address } = getters;
  if (!address) {
    return [];
  }
  let tokensWithBalance = [];
  try {
    tokensWithBalance = await ethplorerService.getTokensWithBalance(address);
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
const updateTokensPrices = async ({ state, commit, getters }) => {
  if (state.trackedTokens === null || state.trackedTokens.length === 0) return;
  const symbols = state.trackedTokens.map(token => token.symbol);

  const prices = await priceService.getPrices(
    symbols,
    getters.activeCurrencyName,
  );
  commit(SAVE_TOKENS_PRICES, prices);
};
const updateTokenPrice = async ({ commit, getters }, { symbol }) => {
  const price = await priceService.getPrice(symbol, getters.activeCurrencyName);
  commit(SAVE_TOKEN_PRICE, { symbol, price });
};
const subscribeOnTokensPricesUpdates = ({ dispatch }) => {
  setInterval(() => {
    dispatch('updateTokensPrices');
  }, tokenUpdateInterval);
};

const createTokenTracker = (
  { state, commit, getters, rootState },
  { tokensWithBalance },
) => {
  const { address } = getters;

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
    pollingInterval: tokenUpdateInterval,
    tokens: tokensToTrack,
  });

  commit(SAVE_TOKEN_TRACKER_INSTANCE, tokenTracker);
};

const init = async ({ dispatch }) => {
  dispatch('subscribeOnTokensPricesUpdates');
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
