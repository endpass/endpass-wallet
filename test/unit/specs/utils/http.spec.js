import http from '@/utils/http';
import { identityAPIUrl } from '@/config';
import store from '@/store';

jest.mock('@/store', () => ({
  dispatch: jest.fn(),
}));

describe('axios instance', () => {
  describe('interceptors', () => {
    const interceptors = http.interceptors;

    beforeEach(() => {
      store.dispatch.mockClear();
    });

    describe('response', () => {
      const { fulfilled, rejected } = interceptors.response.handlers[0];

      describe('fulfilled', () => {
        it('should dispatch action', () => {
          const config = { url: identityAPIUrl };
          const status = 200;

          fulfilled({ status, config });

          expect(store.dispatch).toHaveBeenCalledTimes(1);
          expect(store.dispatch).toHaveBeenCalledWith({
            type: 'user/setAuthorizationStatus',
            authorizationStatus: true,
          });
        });

        it('should not dispatch action', () => {
          const config = { url: identityAPIUrl };
          let status = 301;

          fulfilled({ status, config });
          expect(store.dispatch).toHaveBeenCalledTimes(0);

          status = 200;
          config.url = `${identityAPIUrl}/auth`;
          fulfilled({ status, config });

          expect(store.dispatch).toHaveBeenCalledTimes(0);

          config.url = `${identityAPIUrl}/token`;
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
          const config = { url: identityAPIUrl };

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
