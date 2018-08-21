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

const trackedTokens = state => {
  return state.trackedTokens || [];
};

export default {
  net,
  address,
  activeCurrencyName,
  savedCurrentNetworkTokens,
  isTrackedTokensLoaded,
  trackedTokens,
};
