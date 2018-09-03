import actions from '@/store/actions';
import {
  START_PAGE_LOADING,
  STOP_PAGE_LOADING,
} from '@/store/mutations-types.js';

// Mock mutations
const mutations = {
  [START_PAGE_LOADING]: jest.fn(),
  [STOP_PAGE_LOADING]: jest.fn(),
};

const dispatch = jest.fn();
const commit = (type, payload) => mutations[type](payload);

describe('Root Store actions', () => {
  it('initializes state and shows loading indicator', async () => {
    await actions.init({ dispatch, commit });
    expect(mutations[START_PAGE_LOADING]).toHaveBeenCalledTimes(1);
    expect(mutations[STOP_PAGE_LOADING]).toHaveBeenCalledTimes(1);

    //Errors should be initialized first
    expect(dispatch).toHaveBeenNthCalledWith(1, 'web3/init');
    expect(dispatch).toHaveBeenNthCalledWith(2, 'accounts/init');

    // Initialize all other stores
    expect(dispatch).toHaveBeenCalledWith('accounts/init');
    expect(dispatch).toHaveBeenCalledWith('web3/init');
    expect(dispatch).toHaveBeenCalledWith('tokens/init');
    expect(dispatch).toHaveBeenCalledWith('price/init');
    expect(dispatch).toHaveBeenCalledWith('connectionStatus/init');
  });
});
