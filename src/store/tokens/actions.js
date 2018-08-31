import {
  SAVE_TOKEN,
  SAVE_TOKENS,
  DELETE_TOKEN,
  SAVE_TOKENS_PRICES,
  SAVE_TOKEN_PRICE,
  SAVE_TRACKED_TOKENS,
  SAVE_TOKEN_INFO,
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
import web3 from '@/utils/web3';

const saveTokenAndSubscribe = async (
  { state, commit, getters, dispatch },
  { token },
) => {
  const { net } = getters;

  // Check if already subscribed to token
  const tokenExist =
    state.tokenTracker &&
    state.tokenTracker.tokens &&
    state.tokenTracker.tokens.includes(
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

const getAllTokens = async ({ commit, dispatch, getters }) => {
  if (getters.net !== 1) {
    return [];
  }
  let tokens = [];
  try {
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
    commit(SAVE_TOKEN_INFO, tokens);
  }
};

// TODO remove
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
    await dispatch('createTokenTracker', { tokensWithBalance });
    // TokenTracker update event doesent work
    const serialisationInterval = setInterval(() => {
      dispatch('updateTokensBalances');
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
  return dispatch('updateTokensBalances');
};

const getTokensWithBalance = async ({ state, getters, dispatch }) => {
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
  }
  // Get tokeninfo from addresses
  const allTokens = state.allTokens;
  const tokenAddrs = tokensWithBalance
    .map(tokenInfo => tokenInfo.address)
    .filter(addr => !!addr)
    .map(web3.utils.toChecksumAddress);
  return tokenAddrs
    .map(addr => {
      let token = state.allTokens[addr] || {};
      return { ...token };
    })
    .filter(token => !!token.address);
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

//TODO test
const updateTokensBalances = async ({ state, commit }) => {
  const balances = state.tokenTracker.serialize();
  // TODO check for errors here
  if (balances.length && typeof balances[0].symbol !== 'undefined') {
    commit(SAVE_TRACKED_TOKENS, balances);
  } else {
    commit(SAVE_TRACKED_TOKENS, []);
  }
};

//TODO remove
const createTokenTracker = async (
  { state, commit, getters },
  { tokensWithBalance },
) => {
  const { address } = getters;

  //Merge tokens list by address
  const tokensToTrack = tokensWithBalance
    .concat(
      getters.savedCurrentNetworkTokens.filter(
        savedToken =>
          !tokensWithBalance.find(
            tokenWithBalance => tokenWithBalance.address === savedToken.address,
          ),
      ),
    )
    .filter(token => !!token.address); //filter out empty address

  const tokenTracker = new TokenTracker({
    userAddress: address,
    provider: web3.currentProvider,
    pollingInterval: tokenUpdateInterval,
    tokens: tokensToTrack,
  });

  commit(SAVE_TOKEN_TRACKER_INSTANCE, tokenTracker);
};

const init = async ({ dispatch }) => {
  await dispatch('getAllTokens');
  return dispatch('subscribeOnTokensPricesUpdates');
};

export default {
  getAllTokens,
  saveTokenAndSubscribe,
  deleteTokenAndUnsubscribe,
  getTokensWithBalance,
  updateTokensPrices,
  updateTokensBalances,
  updateTokenPrice,
  subscribeOnTokensBalancesUpdates,
  subscribeOnTokensPricesUpdates,
  createTokenTracker,
  init,
};
