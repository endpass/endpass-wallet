import { hasLoginGuard, privateWalletGuard } from '@/router/guards';
import { getInitializedValueFromStore } from '@/utils';
import store from '@/store';

jest.mock('@/utils', () => ({
  getInitializedValueFromStore: jest.fn(),
}));

jest.mock('@/store', () => ({
  state: {
    accounts: {
      wallet: null,
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

    getInitializedValueFromStore.mockResolvedValueOnce(true);

    await hasLoginGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should redirect to base url', async () => {
    expect.assertions(2);

    getInitializedValueFromStore.mockResolvedValueOnce(false);

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

    getInitializedValueFromStore.mockResolvedValueOnce();
  });

  it('should allow routing', async () => {
    expect.assertions(1);

    store.state.accounts.wallet = {};

    await privateWalletGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should redirect to new wallet page if wallet empty', async () => {
    expect.assertions(2);

    store.state.accounts.wallet = null;

    await privateWalletGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ name: 'NewWallet' });
  });

  it('should redirect to home page if account is public', async () => {
    expect.assertions(2);

    Object.assign(store.state.accounts, {
      wallet: {
        isPublic: true,
      },
    });
    to = {
      path: '/send',
    };

    await privateWalletGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ name: 'HomePage' });
  });
});
