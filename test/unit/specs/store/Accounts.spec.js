import store from '@/store/accounts/accounts';
import localStorageMock from '../../localStorageMock.js';
import { userService } from '@/services';

global.localStorage = localStorageMock;

const { state, mutations, actions } = store;

describe('accounts store', () => {
  it('should set wallet value', () => {
    state.wallets = {
      '0x3c75226555FC496168d48B88DF83B95F16771F37': 1
    }
    mutations.selectWallet(state, '0x3c75226555FC496168d48B88DF83B95F16771F37');
    expect(state.wallet).toBe(1);
  });

  it('should add a new account and set it active', () => {
    mutations.addWallet(state, {
      address: '0x3c75226555FC496168d48B88DF83B95F16771F37',
      wallet: 2
    });
    mutations.selectWallet(state, '0x3c75226555FC496168d48B88DF83B95F16771F37');
    expect(state.wallets['0x3c75226555FC496168d48B88DF83B95F16771F37']).toBe(2);
    expect(state.wallet).toBe(2);
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

  it('should call mutation from logout action', async () => {
    const commit = jest.fn();
    const state = {};

    await actions.logout({ commit, state });

    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit.mock.calls[0]).toEqual(['setEmail', null]);
  });

  it('should call user service in login action', async () => {
    const dispatch = jest.fn();
    const state = {};
    userService.login = jest.fn();

    await actions.login({ dispatch, state }, '123@123.com');

    expect(userService.login).toHaveBeenCalledTimes(1);
  });
});
