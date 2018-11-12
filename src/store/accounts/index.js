import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  // The encrypted xprv key for the user's hd wallet as a V3 keystore
  // object. All accounts are direct child accounts.
  hdKey: null,
  // The user's hardware xpub, keyed by wallet type
  hardwareXpub: {},
  // The user's wallets, keyed by address
  wallets: {},
  // The currently selected wallet
  wallet: null,
  address: null,
  balance: null,
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
