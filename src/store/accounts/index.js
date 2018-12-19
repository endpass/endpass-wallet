import actions from './actions';
import getters from './getters';
import mutations from './mutations';

/**
 * @namespace
 * @property {Boolean} isInited Status of initializing accounts module
 * @property {Object} hdKey The encrypted xprv key for the user's hd wallet as a V3 keystore object.
 *  All accounts are direct child accounts.
 * @property {Object} hadrwareXpub The user's hardware xpub, keyed by wallet type
 * @property {Object} wallets The user's wallets, mapped by address
 * @property {String} address Current wallet address
 * @property {String} balance Currect account balance
 */
const state = {
  isInited: false,
  hardwareXpub: {},
  wallets: {},
  hdKey: null,
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
