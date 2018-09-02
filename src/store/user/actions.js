import { NotificationError } from '@/class';
import { userService } from '@/services';
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

const initIdentityMode = async ({ commit, dispatch }) => {
  try {
    const { type, serverUrl } = userService.getIdentityMode();
    userService.setIdentityMode(type, serverUrl);

    if (type !== 'default') {
      commit(SET_AUTHORIZATION_STATUS, true);
    }
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

export default {
  setAuthorizationStatus,
  initIdentityMode,
};
