import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  // TODO move to user store?
  email: null,
  // The encrypted xprv key for the user's hd wallet as a V3 keystore
  // object. All accounts are direct child accounts.
  hdKey: null,
  // The user's wallets, keyed by address
  wallets: {},
  // The currently selected wallet
  wallet: null,
  address: null,
  balance: null,
  // prettier-ignore
  availableCurrencies: ['USD', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR'],
  settings: {
    fiatCurrency: 'USD',
  },
  otpSettings: {
    secret: null,
    status: null,
  },
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
