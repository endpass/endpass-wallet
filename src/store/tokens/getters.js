import { BigNumber } from 'bignumber.js';

const net = (state, getters, rootState) => {
  return rootState.web3.activeNet.id;
};
const savedCurrentNetworkTokens = (state, { net }) => {
  return state.savedTokens[net] || [];
};

const activeCurrencyName = (state, getters, { web3 }) => {
  return web3.activeCurrency.name;
};

const address = (state, getters, { accounts }) => {
  return accounts.address && accounts.address.getChecksumAddressString();
};

const isTrackedTokensLoaded = state => {
  return state.trackedTokens !== null;
};

// Tokens sorted by balance
const trackedTokens = state => {
  let tokens = (state.trackedTokens || []).map(token => {
    return {
      ...token,
      // FIXME: fetch balance from ERC20 instance for this token
      //balance: new BigNumber(token.balance || 0),
    };
  });
  return tokens;
};

const tokensWithBalance = (state, { trackedTokens }) => {
  return trackedTokens.filter(token => token.balance > 0);
};

export default {
  net,
  address,
  activeCurrencyName,
  savedCurrentNetworkTokens,
  isTrackedTokensLoaded,
  tokensWithBalance,
  trackedTokens,
};
