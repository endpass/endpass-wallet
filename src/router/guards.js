import { asyncCheckProperty } from '@endpass/utils';
import store from '../store';

// Has a wallet with a private key capable of sending funds
// Redirects to new wallet page if one does not exist
export async function privateWalletGuard(to, from, next) {
  await asyncCheckProperty(store, 'state.accounts.isInited');

  if (!store.getters['accounts/wallet']) {
    next({ name: 'NewWallet' });
  } else if (store.getters['accounts/isPublicAccount']) {
    next({ name: 'HomePage' });
  } else {
    next();
  }
}

// Is logged in on the identity server
export async function hasLoginGuard(to, from, next) {
  const redirectUri = {
    path: '/',
    query: {
      redirect_uri: to.fullPath,
    },
  };

  const res = await asyncCheckProperty(
    store,
    'state.user.authorizationStatus',
    v => typeof v === 'boolean',
  );

  next(!res ? redirectUri : undefined);
}
