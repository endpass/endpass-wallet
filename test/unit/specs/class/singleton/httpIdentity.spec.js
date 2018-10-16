import { httpIdentity } from '@/class/singleton';
import store from '@/store';
import { REQUEST_TIMEOUT_MSEC } from '@/constants';

jest.mock('@/store', () => ({
  dispatch: jest.fn(),
}));

describe('axios instance', () => {
  describe('defaults', () => {
    const { defaults } = httpIdentity;

    it('should have the correct withCredentials option', () => {
      expect(defaults.withCredentials).toBeTruthy();
    });

    it('should have the correct timeout option', () => {
      expect(defaults.timeout).toBe(30000);
    });

    it('should have the correct headers option', () => {
      expect(defaults.headers).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      );
    });
  });

  describe('interceptors', () => {
    const { interceptors } = httpIdentity;

    beforeEach(() => {
      store.dispatch.mockClear();
    });

    describe('response', () => {
      const { fulfilled, rejected } = interceptors.response.handlers[0];

      describe('fulfilled', () => {
        it('should dispatch action', () => {
          const config = { url: ENV.identityAPIUrl };
          const status = 200;

          fulfilled({ status, config });

          expect(store.dispatch).toHaveBeenCalledTimes(1);
          expect(store.dispatch).toHaveBeenCalledWith({
            type: 'user/setAuthorizationStatus',
            authorizationStatus: true,
          });
        });

        it('should not dispatch action', () => {
          const config = { url: ENV.identityAPIUrl };
          let status = 301;

          fulfilled({ status, config });
          expect(store.dispatch).toHaveBeenCalledTimes(0);

          status = 200;
          config.url = `${ENV.identityAPIUrl}/auth`;
          fulfilled({ status, config });

          expect(store.dispatch).toHaveBeenCalledTimes(0);

          config.url = `${ENV.identityAPIUrl}/token`;
          fulfilled({ status, config });

          expect(store.dispatch).toHaveBeenCalledTimes(0);

          config.url = 'url';
          fulfilled({ status, config });

          expect(store.dispatch).toHaveBeenCalledTimes(0);
        });
      });

      describe('rejected', () => {
        it('should dispatch action', async () => {
          const response = { status: 401 };
          const config = { url: ENV.identityAPIUrl };

          try {
            await rejected({ response, config });
          } catch (error) {
            expect(store.dispatch).toHaveBeenCalledTimes(1);
            expect(store.dispatch).toHaveBeenCalledWith({
              type: 'user/setAuthorizationStatus',
              authorizationStatus: false,
            });
          }
        });

        it('should not dispatch action', async () => {
          const response = { status: 400 };
          const config = { url: 'url' };

          try {
            await rejected({ response, config });
          } catch (error) {
            expect(store.dispatch).toHaveBeenCalledTimes(0);
          }
        });
      });
    });
  });
});
