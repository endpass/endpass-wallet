import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  prevAuthorizationStatus: null,
  authorizationStatus: null,
  email: null,
  settings: {
    fiatCurrency: 'USD',
  },
  otpSettings: {
    secret: null,
    status: null,
  },
  // prettier-ignore
  availableCurrencies: ['USD', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR']
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
