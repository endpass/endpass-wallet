import { hasLoginGuard, privateWalletGuard } from '@/router/guards';
import { asyncCheckProperty } from '@endpass/utils';
import store from '@/store';

jest.mock('@endpass/utils', () => ({
  asyncCheckProperty: jest.fn(),
}));

jest.mock('@/store', () => ({
  getters: {
    'accounts/wallet': null,
  },
  state: {
    user: {
      authorizationStatus: false,
    },
  },
}));

describe('hasLoginGuard', () => {
  let next;
  const to = { fullPath: 'fullPath' };
  const from = {};
  const redirectUri = {
    path: '/',
    query: {
      redirect_uri: to.fullPath,
    },
  };

  beforeEach(() => {
    next = jest.fn();
  });

  it('should allow routing', async () => {
    expect.assertions(1);

    asyncCheckProperty.mockResolvedValueOnce(true);

    await hasLoginGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should redirect to base url', async () => {
    expect.assertions(2);

    asyncCheckProperty.mockResolvedValueOnce(false);

    await hasLoginGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(redirectUri);
  });
});

describe('privateWalletGuard', () => {
  let to;
  let next;
  const from = { fullPath: 'fullPath' };

  beforeEach(() => {
    to = {};
    next = jest.fn();

    asyncCheckProperty.mockResolvedValueOnce();
  });

  it('should allow routing', async () => {
    expect.assertions(1);

    store.getters['accounts/wallet'] = {};

    await privateWalletGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should redirect to new wallet page if wallet empty', async () => {
    expect.assertions(2);

    store.getters['accounts/wallet'] = null;

    await privateWalletGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ name: 'NewWallet' });
  });

  it('should redirect to home page if account is public', async () => {
    expect.assertions(2);

    store.getters['accounts/wallet'] = {};
    store.getters['accounts/isPublicAccount'] = true;
    to = {
      path: '/send',
    };

    await privateWalletGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ name: 'HomePage' });
  });
});
