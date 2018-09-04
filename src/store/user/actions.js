import { NotificationError, Synchronizer } from '@/class';
import { LocalStorage } from '@/class/storage';
import { SET_AUTHORIZATION_STATUS } from './mutations-types';

let sync = null;
let restoreHandler = null;
let backupHandler = null;

const triggerHandler = handler => async () => {
  try {
    await handler();
  } catch (err) {
    throw new NotificationError({
      title: 'Browser sync error',
      text: 'Something went wrong during last attempt to restore local data',
      type: 'is-warning',
    });
  }
};

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
      storage: LocalStorage,
      modules: ['transactions'],
      env: process.env.NODE_ENV,
      state: rootState,
    });
    restoreHandler = triggerHandler(sync.restore);
    backupHandler = triggerHandler(sync.backup);
  }

  if (authorizationStatus && !sync.listener) {
    sync.setListener(data => {
      dispatch('applyStateBackup', { data }, { root: true });
    });

    window.addEventListener('focus', restoreHandler);
    window.addEventListener('blur', backupHandler);
  } else if (!authorizationStatus && sync.listener) {
    sync.setListener(null);

    window.removeEventListener('focus', restoreHandler);
    window.removeEventListener('blur', backupHandler);
  }
};

export default {
  setAuthorizationStatus,
};
