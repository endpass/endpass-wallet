import {
  SAVE_TOKEN,
  DELETE_TOKEN,
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
  SAVE_TOKEN_PRICE,
  SAVE_TOKENS_PRICES,
  SAVE_TOKEN_TRACKER_INSTANCE,
  SAVE_SERIALISATION_INTERVAL,
} from './mutations-types';
import { Token } from '@/class';

const saveToken = ({ savedTokens }, { token, net }) => {
  savedTokens[net] = savedTokens[net] || [];
  savedTokens[net].push(new Token(token));
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

//Save token tracker response with balances
const saveTrackedTokens = (state, tokens = []) => {
  state.trackedTokens = tokens.map(token => new Token(token));
};

const saveTokenPrice = (state, { symbol, price }) => {
  state.prices = state.prices || {};
  state.prices[symbol] = price;
};

const saveTokensPrices = (state, prices) => {
  state.prices = prices;
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
};
