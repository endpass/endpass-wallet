import {
  SAVE_TOKEN,
  DELETE_TOKEN,
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
  SAVE_TOKEN_PRICE,
  SAVE_TOKENS_PRICES,
  SAVE_TOKEN_INFO,
  SAVE_TOKENS_BALANCES,
  SET_LOADING,
} from './mutations-types';
import { Token } from '@/class';

const saveToken = ({ savedTokens }, { token, net }) => {
  savedTokens[net] = savedTokens[net] || [];
  savedTokens[net].push(new Token(token));
};

// Delete token from saved tokens and subscription
const deleteToken = ({ savedTokens, trackedTokens }, { token, net }) => {
  const tokenTrackedIdx = trackedTokens.indexOf(token.address);

  if (tokenTrackedIdx !== -1) {
    trackedTokens.splice(tokenTrackedIdx, 1);
  }

  const tokenSavedIdx = savedTokens[net].findIndex(
    tkn => tkn.address === token.address,
  );

  if (tokenSavedIdx !== -1) {
    savedTokens[net].splice(tokenSavedIdx, 1);
  }
};

const saveTokens = (state, tokens = {}) => {
  state.savedTokens = tokens;
};

//Save list of contract addresses to track
const saveTrackedTokens = (state, tokenAddrs = []) => {
  let trackedTokens = [...new Set([...state.trackedTokens, ...tokenAddrs])];
  state.trackedTokens = trackedTokens;
};

const saveTokenPrice = (state, { symbol, price }) => {
  state.prices = state.prices || {};
  state.prices = { ...state.prices, [symbol]: price };
};

const saveTokensPrices = (state, prices) => {
  state.prices = prices;
};

const saveTokensBalances = (state, balances) => {
  state.balances = balances;
};

// Save info like name and logo about all tokens
// TODO track tokens on each network
const saveTokenInfo = (state, tokenInfos = []) => {
  let allTokens = {};
  tokenInfos.forEach(tokenInfo => {
    if (!tokenInfo.address) {
      return;
    }
    let token = new Token(tokenInfo);
    Object.freeze(token);
    allTokens[token.address] = token;
  });
  Object.freeze(allTokens);
  state.allTokens = allTokens;
};

const setLoading = (state, isLoading) => {
  state.isLoading = isLoading;
};

export default {
  SAVE_TOKEN: saveToken,
  DELETE_TOKEN: deleteToken,
  SAVE_TOKENS: saveTokens,
  SAVE_TRACKED_TOKENS: saveTrackedTokens,
  SAVE_TOKEN_PRICE: saveTokenPrice,
  SAVE_TOKENS_PRICES: saveTokensPrices,
  SAVE_TOKEN_INFO: saveTokenInfo,
  SAVE_TOKENS_BALANCES: saveTokensBalances,
  SET_LOADING: setLoading,
};
