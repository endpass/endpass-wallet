import {
  SAVE_TOKEN,
  DELETE_TOKEN,
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
  SAVE_TOKEN_PRICE,
  SAVE_TOKENS_PRICES,
  SAVE_TOKEN_TRACKER_INSTANCE,
  SAVE_SERIALISATION_INTERVAL,
  SAVE_TOKEN_INFO,
} from './mutations-types';
import { Token } from '@/class';

const saveToken = ({ savedTokens, tokenTracker }, { token, net }) => {
  savedTokens[net] = savedTokens[net] || [];
  savedTokens[net].push(new Token(token));
  tokenTracker.add(token);
};

// Delete token from saved tokens and subscription
const deleteToken = (
  { tokenTracker, savedTokens, trackedTokens },
  { token, net },
) => {
  const tokenTrackedIdx = trackedTokens.findIndex(
    tkn => tkn.address === token.address,
  );

  if (tokenTrackedIdx !== -1) {
    trackedTokens.splice(tokenTrackedIdx, 1);
  }
  // Remove token from tokenTracker instanse (unsubscribe)
  const { tokens } = tokenTracker;
  const tokenIdx = tokens.findIndex(tkn => tkn.address === token.address);

  if (tokenIdx !== -1) {
    tokens.splice(tokenIdx, 1);
  }

  const tokenSavedIdx = savedTokens[net].findIndex(
    tkn => tkn.address === token.address,
  );

  if (tokenSavedIdx !== -1) {
    savedTokens[net].splice(tokenIdx, 1);
  }
};

const saveTokens = (state, tokens = {}) => {
  state.savedTokens = tokens;
};

//Save token tracker response with balances or nullify before update
const saveTrackedTokens = (state, tokens = []) => {
  if (tokens === null) {
    state.trackedTokens = null;
  } else {
    state.trackedTokens = tokens.map(token => new Token(token));
  }
};

const saveTokenPrice = (state, { symbol, price }) => {
  state.prices = state.prices || {};
  state.prices[symbol] = price;
};

const saveTokensPrices = (state, prices) => {
  state.prices = prices;
};

// Save info like name and logo about all tokens
const saveTokenInfo = (state, tokenInfos = []) => {
  let allTokens = {};
  tokenInfos.forEach(tokenInfo => {
    if (!tokenInfo.address) {
      return;
    }
    let token = new Token(tokenInfo);
    allTokens[token.address] = token;
  });
  state.allTokens = allTokens;
};

const saveTokenTrackerInstance = (state, tokenTracker) => {
  state.tokenTracker = tokenTracker;
};

const saveSerialisationInterval = (state, interval) => {
  state.tokensSerializeInterval = interval;
};

export default {
  SAVE_TOKEN: saveToken,
  DELETE_TOKEN: deleteToken,
  SAVE_TOKENS: saveTokens,
  SAVE_TRACKED_TOKENS: saveTrackedTokens,
  SAVE_TOKEN_PRICE: saveTokenPrice,
  SAVE_TOKENS_PRICES: saveTokensPrices,
  SAVE_TOKEN_TRACKER_INSTANCE: saveTokenTrackerInstance,
  SAVE_SERIALISATION_INTERVAL: saveSerialisationInterval,
  SAVE_TOKEN_INFO: saveTokenInfo,
};
