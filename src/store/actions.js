import {
  START_PAGE_LOADING,
  STOP_PAGE_LOADING,
  APPLY_STATE_BACKUP,
} from './mutations-types';

// Dispatch all Vuex init() actions
const init = async ({ dispatch, commit }) => {
  commit(START_PAGE_LOADING);

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

const applyStateBackup = ({ commit }, { data }) => {
  commit(APPLY_STATE_BACKUP, data);
};

export default {
  init,
  applyStateBackup,
};
