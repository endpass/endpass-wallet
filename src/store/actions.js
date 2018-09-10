import { START_PAGE_LOADING, STOP_PAGE_LOADING } from './mutations-types.js';

// Dispatch all Vuex init() actions
const init = async ({ dispatch, commit }) => {
  commit(START_PAGE_LOADING);

  // Wait init last or default identity mode
  await dispatch('user/initIdentityMode');
  // init web3 networks
  await dispatch('web3/init');
  // Wait for accounts to load
  await dispatch('accounts/init');

  commit(STOP_PAGE_LOADING);

  return Promise.all([
    dispatch('tokens/init'),
    dispatch('price/init'),
    dispatch('connectionStatus/init'),
  ]);
};

export default {
  init,
};
