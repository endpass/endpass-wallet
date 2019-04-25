const activeCurrencyName = (state, getters, { web3 }) =>
  web3.activeCurrency.name;
const fiatCurrency = (state, getters, { user }) => user.settings.fiatCurrency;

export default {
  activeCurrencyName,
  fiatCurrency,
};
