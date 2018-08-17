import mutationsTypes from './mutations-types';

const saveTokenAndSubscribe = (
  { state, commit, dispatch, rootState },
  token,
) => {
  // Check if already subscribed to token
  const tokenExist = state.tokenTracker.tokens.find(
    subscriptionToken => subscriptionToken.address === token.address,
  );

  if (!tokenExist) {
    commit(mutationsTypes.SAVE_TOKEN, {
      token,
      net: rootState.web3.activeNet.id,
    });

    //TODO refactor to new service & async/await call mutation in callback
    storage
      .write('tokens', state.savedTokens)
      .catch(e => dispatch('errors/emitError', e, { root: true }));

    state.tokenTracker.add({ ...token });
  }
};

const deleteTokenAndUnsubscribe = (
  { commit, getters, state, dispatch },
  token,
) => {
  const { net } = getters;

  commit(mutationsTypes.DELETE_TOKEN, { token, net });

  //TODO refactor to new service & async/await call mutation in callback
  return storage
    .write('tokens', state.savedTokens)
    .catch(e => dispatch('errors/emitError', e, { root: true }));
};

const getAllTokens = async ({ dispatch, getters }) => {
  if (getters.net !== 1) {
    return [];
  }
  let tokens = [];
  try {
    tokens = await tokenInfoService
      .getTokensList()
      .map(token => new Token(token));
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
const subscribeOnTokenUpdates = async ({ dispatch, state, rootState }) => {
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
    await dispatch('subscribeOnTokensBalancesUpdates', tokensWithBalance);
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
    tokensWithBalance = await ethplorerService
      .getTransactions(address)
      .data.tokens.map(token => token.tokeninfo);
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
  commit(mutationsTypes.SAVE_TOKENS_PRICES, prices);
  return prices;
};
const updateTokenPrice = async ({ commit }, symbol) => {
  const price = await priceService.getPrice(
    symbol,
    rootState.web3.activeCurrency.name,
  );
  commit(mutationsTypes.SAVE_TOKEN_PRICE, symbol, price);
  return price;
};
const subscribeOnTokensPricesUpdates = ({ dispatch }, tokensToSubscribe) => {
  setInterval(() => {
    dispatch('updateTokensPrices');
  }, subscriptionsAPIInterval);
};

const subscribeOnTokensBalancesUpdates = (
  { state, commit, getters, rootState },
  tokensWithBalance,
) => {
  commit(mutationsTypes.SAVE_TRACKED_TOKENS, []);

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
        commit(mutationsTypes.SAVE_TRACKED_TOKENS, balances);
    }
  }, subscriptionsAPIInterval);
  commit(mutationsTypes.SAVE_SERIALISATION_INTERVAL, serialisationInterval);
  commit(mutationsTypes.SAVE_TOKEN_TRACKER_INSTANCE, tokenTracker);
};

const init = ({ commit, dispatch }) => {
  dispatch('subscribeOnTokensPricesUpdates');
  return storage
    .read('tokens')
    .then(tokens => commit(mutationsTypes.SAVE_TOKENS, tokens || {}))
    .catch(e => dispatch('errors/emitError', e, { root: true }));
};

export default {
  saveTokenAndSubscribe,
  deleteTokenAndUnsubscribe,
  getTokensWithBalance,
  updateTokensPrices,
  updateTokenPrice,
  subscribeOnTokensPricesUpdates,
  subscribeOnTokensBalancesUpdates,
  init,
};
