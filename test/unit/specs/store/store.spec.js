import { actions } from '@/store';

// Mock mutations
const mutations = {
  startPageLoading: jest.fn(),
  stopPageLoading: jest.fn(),
};

const dispatch = jest.fn();
const commit = (type, payload) => mutations[type](payload);

describe('Store', () => {
  it('initializes state and shows loading indicator', async () => {
    await actions.init({ dispatch, commit });
    expect(mutations.startPageLoading).toHaveBeenCalledTimes(1);
    expect(mutations.stopPageLoading).toHaveBeenCalledTimes(1);

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
