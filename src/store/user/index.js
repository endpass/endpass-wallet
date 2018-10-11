import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { AVAILABLE_FIAT_CURRENCIES, IDENTITY_MODE } from '@/constants';

const state = {
  prevAuthorizationStatus: null,
  authorizationStatus: null,
  identityType: IDENTITY_MODE.DEFAULT,
  email: null,
  settings: {
    fiatCurrency: 'USD',
  },
  otpSettings: {
    secret: null,
    status: null,
  },
  availableCurrencies: AVAILABLE_FIAT_CURRENCIES,
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
