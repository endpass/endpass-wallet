const activeCurrencyName = (state, getters, { web3 }) => {
  return web3.activeCurrency.name;
};
const fiatCurrency = (state, getters, { accounts }) => {
  return accounts.settings.fiatCurrency;
};

export default {
  activeCurrencyName,
  fiatCurrency,
};
