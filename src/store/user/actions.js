import { NotificationError } from '@/class';
import { SET_AUTHORIZATION_STATUS } from './mutations-types';

const setAuthorizationStatus = (
  { commit, dispatch, getters },
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

    //dispatch('errors/emitError', notificationError, { root: true });
  }
};

export default {
  setAuthorizationStatus,
};
