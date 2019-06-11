import actions from '@/store/core/actions';
import {
  START_PAGE_LOADING,
  STOP_PAGE_LOADING,
} from '@/store/core/mutations-types';

// Mock mutations
const mutations = {
  [START_PAGE_LOADING]: jest.fn(),
  [STOP_PAGE_LOADING]: jest.fn(),
};

const dispatch = jest.fn();
const commit = (type, payload) => mutations[type](payload);
const getters = {
  'user/isLoggedIn': false,
};

describe('Root Store actions', () => {
  beforeEach(() => {
    dispatch.mockClear();
  });
  it('initializes state and shows loading indicator', async () => {
    expect.assertions(12);

    await actions.init({ dispatch, commit, getters });

    expect(mutations[START_PAGE_LOADING]).toHaveBeenCalledTimes(1);
    expect(mutations[STOP_PAGE_LOADING]).toHaveBeenCalledTimes(1);

    // User identity mode should be initialized first
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      'user/initIdentityMode',
      undefined,
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, 'web3/init');
    expect(dispatch).toHaveBeenNthCalledWith(3, 'accounts/init');

    // Initialize all other stores
    expect(dispatch).toHaveBeenCalledWith('user/initIdentityMode', undefined);
    expect(dispatch).toHaveBeenCalledWith('accounts/init');
    expect(dispatch).toHaveBeenCalledWith('web3/init');
    expect(dispatch).toHaveBeenCalledWith('tokens/init');
    expect(dispatch).toHaveBeenCalledWith('price/init');
    expect(dispatch).toHaveBeenCalledWith('user/login');
    expect(dispatch).toHaveBeenCalledWith('connectionStatus/init');
  });

  it("shouldn't call user/login is user logged", async () => {
    getters['user/isLoggedIn'] = true;
    expect.assertions(1);
    await actions.init({ dispatch, commit, getters });
    expect(dispatch).not.toHaveBeenCalledWith('user/login');
  });

  it('initializes state and check mode pass', async () => {
    expect.assertions(1);

    const mode = {
      type: 'type',
      serverUrl: 'serverUrl',
    };

    await actions.init({ dispatch, commit, getters }, mode);

    // User identity mode should be initialized first
    expect(dispatch).toHaveBeenCalledWith('user/initIdentityMode', mode);
  });
});
