import store from '../store';
import { getInitializedValueFromStore } from '@/utils';

export async function privateWalletGuard(to, from, next) {
  const { accounts } = store.state;

  await getInitializedValueFromStore(accounts, 'address');

  next(accounts.wallet ? undefined : from.fullPath);
}

export async function hasLoginGuard(to, from, next) {
  const redirectUri = {
    path: '/',
    query: {
      redirect_uri: to.fullPath,
    },
  };
  const authorizationStatus = await getInitializedValueFromStore(
    store.state.user,
    'authorizationStatus',
  );

  next(authorizationStatus ? undefined : redirectUri);
}
