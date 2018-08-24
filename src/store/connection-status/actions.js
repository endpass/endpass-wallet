import {
  SET_WEB3_CONNECTION_STATUS,
  SET_API_CONNECTION_STATUS,
  SET_SYNC_STATUS,
  ADD_API_ERROR_ID,
  REMOVE_API_ERROR_ID,
} from './mutations-types.js';
import { blockUpdateInterval } from '@/config';

//status - Boolean; true - api is not responding
const updateApiErrorStatus = ({ commit, state }, { id, status }) => {
  if (status) {
    commit(ADD_API_ERROR_ID, id);
    commit(SET_API_CONNECTION_STATUS, status);
  } else {
    commit(REMOVE_API_ERROR_ID, id);
    if (state.apiErrorsArray.length === 0) {
      commit(SET_API_CONNECTION_STATUS, status);
    }
  }
};

const subscribeOnSyncStatus = async ({ state, getters, commit, dispatch }) => {
  const providerCache = getters.currentProvider;
  try {
    const status = await getters.eth.isSyncing();
    if (providerCache === currentProvider) {
      commit(SET_SYNC_STATUS, status);
      commit(SET_WEB3_CONNECTION_STATUS, true);
      setTimeout(() => {
        dispatch('subscribeOnSyncStatus');
      }, blockUpdateInterval);
    } else {
      dispatch('subscribeOnSyncStatus');
    }
  } catch (e) {
    commit(SET_WEB3_CONNECTION_STATUS, false);
    dispatch('errors/emitError', e, { root: true });
    setTimeout(() => {
      dispatch('subscribeOnSyncStatus');
    }, blockUpdateInterval);
  }
};

const init = ({ commit, dispatch, state }) => {
  return dispatch('subscribeOnSyncStatus');
};

export default {
  updateApiErrorStatus,
  subscribeOnSyncStatus,
  init,
};
