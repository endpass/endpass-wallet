import { pick, pickBy } from '@/utils/objects';

const activeCurrencyName = (state, getters, rootState) =>
  rootState.web3.activeCurrency.name;

const userTokensListedByNetworks = state =>
  Object.keys(state.userTokens).reduce(
    (acc, key) =>
      Object.assign(acc, {
        [key]: Object.values(state.userTokens[key]),
      }),
    {},
  );

const userTokenByAddress = (
  state,
  getters,
  rootState,
  rootGetters,
) => tokenAddress => {
  const targetNetTokens = state.userTokens[rootGetters['web3/activeNetwork']];

  if (!targetNetTokens) {
    return null;
  }

  return targetNetTokens[tokenAddress] || null;
};

const tokensByAddress = state => address => {
  const tokensList = state.tokensByAddress[address];

  if (!tokensList) {
    return {};
  }

  return pick(state.networkTokens, tokensList);
};

const balancesByAddress = state => address =>
  state.balancesByAddress[address] || {};

const currentNetUserTokens = (state, getters, rootState, rootGetters) =>
  state.userTokens[rootGetters['web3/activeNetwork']] || {};

const allCurrentAccountTokens = (state, getters, rootState, rootGetters) => ({
  ...getters.tokensByAddress(rootGetters['accounts/currentAddressString']),
  ...getters.currentNetUserTokens,
});

const fullTokensByAddress = (state, getters) => address => {
  const tokens = getters.tokensByAddress(address);
  const balances = getters.balancesByAddress(address);

  return Object.keys(tokens).reduce((acc, key) => {
    const token = tokens[key];

    return Object.assign(acc, {
      [key]: {
        ...token,
        balance: balances[key] || '0',
        price: state.prices[token.symbol] || '0',
      },
    });
  }, {});
};

const allCurrentAccountFullTokens = (
  state,
  getters,
  rootState,
  rootGetters,
) => {
  const tokens = getters.allCurrentAccountTokens;
  const balances = getters.balancesByAddress(
    rootGetters['accounts/currentAddressString'],
  );

  return Object.keys(tokens).reduce((acc, key) => {
    const token = tokens[key];

    return Object.assign(acc, {
      [key]: {
        ...token,
        balance: balances[key] || '0',
        price: state.prices[token.symbol] || '0',
      },
    });
  }, {});
};

const allCurrentAccountTokensWithNonZeroBalance = (state, getters) =>
  pickBy(getters.allCurrentAccountFullTokens, ({ balance }) =>
    Boolean(parseInt(balance, 10)),
  );

export default {
  activeCurrencyName,
  tokensByAddress,
  balancesByAddress,
  userTokensListedByNetworks,
  userTokenByAddress,
  currentNetUserTokens,
  fullTokensByAddress,
  allCurrentAccountTokens,
  allCurrentAccountFullTokens,
  allCurrentAccountTokensWithNonZeroBalance,
};
