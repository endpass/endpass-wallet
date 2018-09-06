import { BigNumber } from 'bignumber.js';
import { Token, ERC20Token } from '@/class';

const net = (state, getters, rootState) => rootState.web3.activeNet.id;

const savedCurrentNetworkTokens = (state, { net }) =>
  state.savedTokens[net] || [];

// Like allTokens, but for user saved tokens
// Returns object keyed by address {address: Token}
const savedTokenInfos = (state, { savedCurrentNetworkTokens }) =>
  savedCurrentNetworkTokens.reduce((obj, item) => {
    obj[item.address] = item;
    return obj;
  }, {});

const activeCurrencyName = (state, getters, { web3 }) =>
  web3.activeCurrency.name;

const address = (state, getters, { accounts }) =>
  accounts.address && accounts.address.getChecksumAddressString();

// Returns []ERC20Token
const trackedTokens = state =>
  (state.trackedTokens || []).map(address => new ERC20Token(address));

// Merges token info with balance
// This is the only getter that includes symbol, name, etc and balance
const tokensWithBalance = (state, { savedTokenInfos }) =>
  state.trackedTokens
    .map(address => {
      const tokenInfo = state.allTokens[address] || savedTokenInfos[address];
      const balance = state.balances[address];

      try {
        return new Token({
          ...tokenInfo, // Info from token info API
          balance, // Balance updated as of last block
        });
      } catch (err) {
        return null;
      }
    })
    .filter(token => Boolean(token));

export default {
  net,
  address,
  activeCurrencyName,
  savedCurrentNetworkTokens,
  savedTokenInfos,
  trackedTokens,
  tokensWithBalance,
};
