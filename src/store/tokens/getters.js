import { BigNumber } from 'bignumber.js';
import { Token, ERC20Token } from '@/class';

const net = (state, getters, rootState) => {
  return rootState.web3.activeNet.id;
};

const savedCurrentNetworkTokens = (state, { net }) => {
  return state.savedTokens[net] || [];
};

// Like allTokens, but for user saved tokens
// Returns object keyed by address {address: Token}
const savedTokenInfos = (state, { savedCurrentNetworkTokens }) => {
  return savedCurrentNetworkTokens.reduce((obj, item) => {
    obj[item.address] = item;
    return obj;
  }, {});
};

const activeCurrencyName = (state, getters, { web3 }) => {
  return web3.activeCurrency.name;
};

const address = (state, getters, { accounts }) => {
  return accounts.address && accounts.address.getChecksumAddressString();
};

// Returns []ERC20Token
const trackedTokens = state => {
  return (state.trackedTokens || []).map(address => {
    return new ERC20Token(address);
  });
};

// Merges token info with balance
// This is the only getter that includes symbol, name, etc and balance
const tokensWithBalance = (state, { savedTokenInfos }) => {
  return state.trackedTokens.map(address => {
    let tokenInfo = state.allTokens[address] || savedTokenInfos[address];
    let balance = state.balances[address];
    return new Token({
      ...tokenInfo, // Info from token info API
      balance, // Balance updated as of last block
    });
  });
};

export default {
  net,
  address,
  activeCurrencyName,
  savedCurrentNetworkTokens,
  savedTokenInfos,
  trackedTokens,
  tokensWithBalance,
};
