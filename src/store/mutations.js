import {
  START_PAGE_LOADING,
  STOP_PAGE_LOADING,
  APPLY_STATE_BACKUP,
} from './mutations-types';

const startPageLoading = state => {
  state.isPageLoading = true;
};

const stopPageLoading = state => {
  state.isPageLoading = false;
};

const applyStateBackup = (state, payload) => {
  Object.keys(payload).forEach(key => {
    if (state[key]) {
      Object.assign(state[key], payload[key]);
    }
  });
};

export default {
  [START_PAGE_LOADING]: startPageLoading,
  [STOP_PAGE_LOADING]: stopPageLoading,
  [APPLY_STATE_BACKUP]: applyStateBackup,
};
