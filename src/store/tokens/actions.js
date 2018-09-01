import {
  SAVE_TOKEN,
  SAVE_TOKENS,
  DELETE_TOKEN,
  SAVE_TOKENS_PRICES,
  SAVE_TOKENS_BALANCES,
  SAVE_TOKEN_PRICE,
  SAVE_TRACKED_TOKENS,
  SAVE_TOKEN_INFO,
  SET_LOADING,
} from './mutations-types';
import { Token, NotificationError } from '@/class';
import {
  tokenInfoService,
  ethplorerService,
  priceService,
  userService,
} from '@/services';
import web3 from '@/utils/web3';
import { priceUpdateInterval } from '@/config';

const saveTokenAndSubscribe = async (
  { state, commit, getters, dispatch },
  { token },
) => {
  const { net } = getters;

  // Check if already subscribed to token
  const tokenExist = state.trackedTokens.indexOf(token.address) !== -1;
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

// Get public info like name and logo about all standard ERC20 tokens
const getAllTokens = async ({ commit, dispatch, getters }) => {
  if (getters.net !== 1) {
    return [];
  }
  commit(SET_LOADING, true);
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
    commit(SET_LOADING, false);
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
  try {
    // Save tokens with balance
    await dispatch('getTokensWithBalance');
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

// Fetch non zero token balances of the given address
const getTokensWithBalance = async ({ state, getters, dispatch, commit }) => {
  commit(SET_LOADING, true);
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
  commit(SET_LOADING, false);
  const tokenAddrs = tokensWithBalance
    .map(tokenInfo => tokenInfo.address)
    .filter(addr => !!addr)
    .map(web3.utils.toChecksumAddress);

  // Add unique addresses to tracked tokens list
  commit(SAVE_TRACKED_TOKENS, tokenAddrs);
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
  }, priceUpdateInterval);
};

//TODO test and rename to SAVE_BALANCES
const updateTokensBalances = async ({ commit, getters }) => {
  const balances = {};
  const erc20s = getters.trackedTokens;
  erc20s.forEach(erc20 => {
    try {
      balances[erc20.address] = erc20.getBalance(getters.address);
    } catch (e) {
      // null balance means error
      balances[erc20.address] = null;
    }
  });
  commit(SAVE_TOKENS_BALANCES, balances);
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
  init,
};
