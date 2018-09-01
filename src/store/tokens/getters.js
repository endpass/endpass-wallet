import { BigNumber } from 'bignumber.js';
import { ERC20Token } from '@/class';

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

// Returns []ERC20Token
const trackedTokens = state => {
  return (state.trackedTokens || []).map(address => {
    return new ERC20Token(address);
  });
};

// Merges token info with balance
// This is the only getter that includes symbol, name, etc and balance
const tokensWithBalance = state => {
  return state.trackedTokens.map(address => {
    let tokenInfo = state.allTokens[address] || {};
    let balance = state.balances[address] || '0';
    // FIXME merge custom token info from user
    return {
      ...tokenInfo, // Info from token info API
      balance, // Balance updated as of last block
    };
  });
};

export default {
  net,
  address,
  activeCurrencyName,
  savedCurrentNetworkTokens,
  trackedTokens,
  tokensWithBalance,
};
