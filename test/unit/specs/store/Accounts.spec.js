import store from '@/store/accounts/accounts';
import localStorageMock from '../../localStorageMock.js';

global.localStorage = localStorageMock;

const { state, mutations, actions } = store;

describe('accounts store', () => {
  it('should set wallet value', () => {
    mutations.setActiveAccount(state, 1);
    expect(state.activeAccount).toBe(1);
  });

  it('should add a new account and set it active', () => {
    mutations.addAccount(state, 2);
    mutations.setActiveAccount(state, 2);
    expect(state.accounts.length).toBe(1);
    expect(state.accounts[0]).toBe(2);
    expect(state.activeAccount).toBe(2);
  });

  it('should set new settings', () => {
    expect(state.settings).not.toBe(2);
    mutations.setSettings(state, 2);
    expect(state.settings).toBe(2);
  });

  it('should call mutation from update settings action', async () => {
    const commit = jest.fn();
    const state = {};

    await actions.updateSettings({ commit, state }, '123');

    expect(commit.mock.calls[0]).toEqual(['setSettings', '123']);
  });

  it('should update storage from update settings action', async () => {
    const commit = jest.fn();
    const state = {};

    await actions.updateSettings({ commit, state }, '123');

    const { settings } = localStorageMock.store;

    expect(JSON.parse(settings)).toBe('123');
  });
});
