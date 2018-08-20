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
  const to = { fullPath: 'fullPath' };
  const from = {};
  const redirectUri = {
    path: '/',
    query: {
      redirect_uri: to.fullPath,
    },
  };

  it('should allow routing', async () => {
    const next = jest.fn();

    getInitializedValueFromStore.mockResolvedValueOnce(true);

    await hasLoginGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(undefined);
  });

  it('should redirect to base url', async () => {
    const next = jest.fn();

    getInitializedValueFromStore.mockResolvedValueOnce(false);

    await hasLoginGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(redirectUri);
  });
});

describe('privateWalletGuard', () => {
  const to = {};
  const from = { fullPath: 'fullPath' };

  beforeEach(() => {
    getInitializedValueFromStore.mockResolvedValueOnce();
  });

  it('should allow routing', async () => {
    const next = jest.fn();

    store.state.accounts.wallet = {};

    await privateWalletGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(undefined);
  });

  it('should redirect to new wallet page', async () => {
    const next = jest.fn();

    store.state.accounts.wallet = null;

    await privateWalletGuard(to, from, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ name: 'NewWallet' });
  });
});
