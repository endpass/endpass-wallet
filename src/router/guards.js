import store from '../store';
import storage from '@/services/storage';

export function privateWalletGuard(to, from, next) {
  if (store.state.accounts.wallet) {
    next();
  } else {
    next(from.fullPath);
  }
}

export function hasLoginGuard(to, from, next) {
  const { user } = store.state;
  const redirectUri = {
    path: '/',
    query: {
      redirect_uri: to.fullPath,
    },
  };

  if (user.authorizationStatus === null) {
    storage
      .readAll()
      .then(() => next(user.authorizationStatus ? undefined : redirectUri));
  } else {
    next(user.authorizationStatus ? undefined : redirectUri);
  }
}
