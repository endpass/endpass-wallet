import { NotificationError, Synchronizer } from '@/class';
import { localStore } from '@/services/storage';
import { SET_AUTHORIZATION_STATUS } from './mutations-types';

let sync = null;

const setAuthorizationStatus = (
  { commit, dispatch, getters, rootState },
  { authorizationStatus },
) => {
  commit(SET_AUTHORIZATION_STATUS, authorizationStatus);

  if (getters.isLoggedOut) {
    const notificationError = new NotificationError({
      title: 'Auth error',
      text:
        'You are not an authorized user. In order to continue using the wallet, please log in.',
      type: 'is-danger',
    });

    // dispatch('errors/emitError', notificationError, { root: true });
  }

  if (!sync) {
    sync = new Synchronizer({
      storage: localStore,
      modules: ['transactions'],
      env: process.env.NODE_ENV,
      state: rootState,
    });
  }

  if (authorizationStatus && !sync.listener) {
    sync.setListener(data => {
      dispatch('applyStateBackup', { data }, { root: true });
    });

    window.addEventListener('focus', sync.restore);
    window.addEventListener('blur', sync.backup);
  } else if (!authorizationStatus && sync.listener) {
    sync.setListener(null);

    window.removeEventListener('focus', sync.restore);
    window.removeEventListener('blur', sync.backup);
  }
};

export default {
  setAuthorizationStatus,
};
