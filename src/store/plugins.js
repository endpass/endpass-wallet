import { Synchronizer } from '@/class';
import { localStore } from '@/services/storage';
import { APPLY_STATE_BACKUP } from './mutations-types';

/* eslint-disable import/prefer-default-export */
export const sync = store => {
  const synchronizer = new Synchronizer(localStore, store.state, [
    'transactions',
  ]);

  synchronizer.listen(data => {
    store.commit(APPLY_STATE_BACKUP, data);
  });

  store.subscribe(() => {
    const { user } = store.state;

    if (user.authorizationStatus && !user.prevAuthorizationStatus) {
      window.addEventListener('focus', synchronizer.restore);
      window.addEventListener('blur', synchronizer.backup);
    } else if (!user.authorizationStatus && user.prevAuthorizationStatus) {
      window.removeEventListener('focus', synchronizer.restore);
      window.removeEventListener('blur', synchronizer.backup);
    }
  });
};
