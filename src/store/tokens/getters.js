import { pick, pickBy } from '@/utils/objects';

const activeCurrencyName = (state, getters, rootState) =>
  rootState.web3.activeCurrency.name;

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

const fullTokens = (state, getters) => (address, tokens) => {
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

const balancesByAddress = state => address =>
  state.balancesByAddress[address] || {};

const currentNetUserTokens = (state, getters, rootState, rootGetters) =>
  state.userTokens[rootGetters['web3/activeNetwork']] || {};

const currentAccountTokens = (state, getters, rootState, rootGetters) =>
  getters.tokensByAddress(rootGetters['accounts/currentAddressString']);

const currentNetUserFullTokens = (state, getters, rootState, rootGetters) => {
  const tokens = getters.currentNetUserTokens;

  return getters.fullTokens(
    rootGetters['accounts/currentAddressString'],
    tokens,
  );
};

const currentAccountFullTokens = (state, getters, rootState, rootGetters) =>
  getters.fullTokensByAddress(rootGetters['accounts/currentAddressString']);

const allCurrentAccountTokens = (state, getters) => ({
  ...getters.currentAccountTokens,
  ...getters.currentNetUserTokens,
});

const fullTokensByAddress = (state, getters) => address => {
  const tokens = getters.tokensByAddress(address);

  return getters.fullTokens(address, tokens);
};

const allCurrentAccountFullTokens = (
  state,
  getters,
  rootState,
  rootGetters,
) => {
  const tokens = getters.allCurrentAccountTokens;

  return getters.fullTokens(
    rootGetters['accounts/currentAddressString'],
    tokens,
  );
};

const allCurrentAccountTokensWithNonZeroBalance = (state, getters) =>
  pickBy(getters.allCurrentAccountFullTokens, ({ balance }) =>
    Boolean(parseInt(balance, 10)),
  );

const userTokensWithToken = state => ({ net, token }) => {
  const { userTokens } = state;
  const targetNet = state.userTokens[net] || null;

  if (targetNet) {
    return {
      ...userTokens,
      [net]: {
        ...userTokens[net],
        [token.address]: token,
      },
    };
  }

  return {
    ...userTokens,
    [net]: {
      [token.address]: token,
    },
  };
};

const userTokensWithoutToken = state => ({ net, token }) => {
  const { userTokens } = state;
  const targetNet = userTokens[net];

  if (targetNet) {
    const { [token.address]: removedToken, ...updatedTokens } = targetNet;

    return {
      ...userTokens,
      [net]: updatedTokens,
    };
  }

  return userTokens;
};

export default {
  activeCurrencyName,
  currentNetUserTokens,
  currentAccountTokens,
  currentNetUserFullTokens,
  currentAccountFullTokens,
  fullTokens,
  tokensByAddress,
  balancesByAddress,
  userTokenByAddress,
  fullTokensByAddress,
  allCurrentAccountTokens,
  allCurrentAccountFullTokens,
  allCurrentAccountTokensWithNonZeroBalance,
  userTokensWithToken,
  userTokensWithoutToken,
};
