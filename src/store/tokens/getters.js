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

export default {
  net,
  address,
  activeCurrencyName,
  savedCurrentNetworkTokens,
};
