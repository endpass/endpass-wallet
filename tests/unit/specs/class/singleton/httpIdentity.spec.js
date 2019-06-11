import MockAdapter from 'axios-mock-adapter';
import { createAxiosInstance } from '@/class/singleton/httpIdentity';
import store from '@/store';

jest.mock('@/store', () => ({
  state: {
    user: {
      authorizationStatus: false,
    },
  },
  getters: {
    'user/isLoggedIn': true,
  },
  dispatch: jest.fn(),
}));

describe('httpIdentity', () => {
  const checkUrl = `${ENV.VUE_APP_IDENTITY_API_URL}/check`;
  const http = createAxiosInstance(store);
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(http);
    store.dispatch = jest.fn();
  });

  afterEach(() => {
    mock.reset();
  });

  it('should pass request and do auth', async () => {
    expect.assertions(1);

    mock.onGet(checkUrl).reply(200);
    await http.get(checkUrl);

    expect(store.dispatch).toBeCalledWith({
      type: 'user/setAuthorizationStatus',
      authorizationStatus: true,
    });
  });

  it('should not logout', async () => {
    expect.assertions(1);

    const notLogoutUrl = 'not/logout/url';

    mock.onGet(notLogoutUrl).reply(401);
    try {
      await http.get(notLogoutUrl);
      // eslint-disable-next-line no-empty
    } catch (e) {}

    expect(store.dispatch).not.toBeCalled();
  });

  describe('logout', () => {
    it('should logout', async () => {
      expect.assertions(2);

      store.getters['user/isLoggedIn'] = true;

      mock.onGet(checkUrl).reply(401);
      try {
        await http.get(checkUrl);
        // eslint-disable-next-line no-empty
      } catch (e) {}

      expect(store.dispatch).toBeCalledWith({
        type: 'user/setAuthorizationStatus',
        authorizationStatus: false,
      });

      expect(store.dispatch).toBeCalledWith({
        type: 'user/logout',
      });
    });

    it('should logout', async () => {
      expect.assertions(2);

      store.getters['user/isLoggedIn'] = false;

      mock.onGet(checkUrl).reply(401);
      try {
        await http.get(checkUrl);
        // eslint-disable-next-line no-empty
      } catch (e) {}

      expect(store.dispatch).toBeCalledTimes(1);

      expect(store.dispatch).toBeCalledWith({
        type: 'user/setAuthorizationStatus',
        authorizationStatus: false,
      });
    });
  });
});
