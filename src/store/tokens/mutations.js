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

// Save custom user tokens
const saveToken = (state, { token, net }) => {
  const tokens = state.savedTokens[net] || [];
  tokens.push(new Token(token));
  state.savedTokens = { ...state.savedTokens, [net]: tokens };
};

// Delete token from saved tokens and subscription
const deleteToken = ({ savedTokens, trackedTokens }, { token, net }) => {
  const tokenTrackedIdx = trackedTokens.indexOf(token.address);

  if (tokenTrackedIdx !== -1) {
    trackedTokens.splice(tokenTrackedIdx, 1);
  }

  const savedTokensNet = savedTokens[net] || [];
  const tokenSavedIdx = savedTokensNet.findIndex(
    tkn => tkn.address === token.address,
  );

  if (tokenSavedIdx !== -1) {
    savedTokens[net].splice(tokenSavedIdx, 1);
  }
};

/*
 * Tokens grouped by net id
 * tokens = {
 *   1: [Token, Token],
 *   3: [Token],
 * }
*/
const saveTokens = (state, tokens = {}) => {
  // Sanity check to filter out tokens with no address
  let savedTokens = Object.keys(tokens).reduce((allTokens, net) => {
    allTokens[net] = tokens[net]
      .filter(token => !!token.address)
      .map(token => new Token(token));
    return allTokens;
  }, {});
  state.savedTokens = savedTokens;
};

//Save list of contract addresses to track
const saveTrackedTokens = (state, tokenAddrs = []) => {
  // Remove duplicate addresses
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
// Can be called multiple times to insert info about new tokens
// TODO track tokens on each network
const saveTokenInfo = (state, tokenInfos = []) => {
  let allTokens = { ...state.allTokens };
  tokenInfos.forEach(tokenInfo => {
    if (!tokenInfo.address) {
      return;
    }
    let token = new Token(tokenInfo);
    delete token.balance;
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
