import {
  START_PAGE_LOADING,
  STOP_PAGE_LOADING,
} from '@/store/core/mutations-types';

// Dispatch all Vuex init() actions
const init = async ({ dispatch, commit, getters }, initModeParams) => {
  commit(START_PAGE_LOADING);

  // Wait init last or default identity mode
  await dispatch('user/initIdentityMode', initModeParams);
  // init web3 networks
  await dispatch('web3/init');
  // Wait for accounts and user settings to load
  await Promise.all([dispatch('accounts/init'), dispatch('user/init')]);

  commit(STOP_PAGE_LOADING);

  if (!getters['user/isLoggedIn']) {
    await dispatch('user/login');
  }
  return Promise.all([
    dispatch('tokens/init'),
    dispatch('price/init'),
    dispatch('connectionStatus/init'),
  ]);
};

export default {
  init,
};
