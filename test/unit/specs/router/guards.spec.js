import { hasLoginGuard } from '@/router/guards';
import store from '@/store';
import storage from '@/services/storage';

jest.mock('@/store', () => ({
  state: {
    user: {
      authorizationStatus: null,
    },
  },
}));

jest.mock('@/services/storage', () => ({
  readAll: jest.fn(),
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

  describe('the user already tried to log in', () => {
    it('should allow routing', () => {
      const next = jest.fn();

      store.state.user.authorizationStatus = true;

      hasLoginGuard(to, from, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(undefined);
    });

    it('should redirect to base url', () => {
      const next = jest.fn();

      store.state.user.authorizationStatus = false;

      hasLoginGuard(to, from, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(redirectUri);
    });
  });

  describe('the user has not yet tried to log in', () => {
    beforeEach(() => {
      store.state.user.authorizationStatus = null;
    });

    it('should allow routing', done => {
      const next = jest.fn();

      storage.readAll.mockImplementationOnce(() => {
        store.state.user.authorizationStatus = true;
        return Promise.resolve();
      });

      hasLoginGuard(to, from, next);

      setTimeout(() => {
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(undefined);
        done();
      });
    });

    it('should redirect to base url', done => {
      const next = jest.fn();

      storage.readAll.mockImplementationOnce(() => {
        store.state.user.authorizationStatus = false;
        return Promise.resolve();
      });

      hasLoginGuard(to, from, next);

      setTimeout(() => {
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(redirectUri);
        done();
      });
    });
  });
});
