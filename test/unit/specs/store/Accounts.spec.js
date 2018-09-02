import store from '@/store/accounts/accounts';
import { Address, Wallet } from '@/class';
import localStorageMock from '../../localStorageMock.js';
import HDKey from 'ethereumjs-wallet/hdkey';
import { userService } from '@/services';
import {
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
} from '@/store/tokens/mutations-types';

import accountsFixture from 'fixtures/accounts';

jest.mock('@/services/user', () => require('../../__mocks__/services/user'));

global.localStorage = localStorageMock;

//Fake action from antoher storage
store.actions['tokens/subscribeOnTokensBalancesUpdates'] = jest.fn();
store.actions['errors/emitError'] = jest.fn();
store.actions['updateBalance'] = jest.fn();

const { state, actions } = store;

// Mock mutations
const mutations = {
  ...store.mutations,
};

const commit = store => (type, payload) => mutations[type](store, payload);
const dispatch = context => (type, payload) => {
  actions[type](context, payload);
};

const { v3, v3password } = accountsFixture;

const context = {
  commit: commit(state),
  dispatch: dispatch({ state, commit, dispatch }),
  state,
};

describe('accounts actions', () => {
  let commit;
  let dispatch;

  it('should fetch and save tokens on init', async () => {
    commit = jest.fn();
    dispatch = jest.fn();
    await actions.init({ commit, dispatch });
    expect(commit).toHaveBeenCalledWith(
      `tokens/${SAVE_TOKENS}`,
      expect.any(Object),
      { root: true },
    );
    expect(commit).toHaveBeenCalledWith(
      `tokens/${SAVE_TRACKED_TOKENS}`,
      expect.any(Array),
      { root: true },
    );
  });
});

describe('accounts store', () => {
  beforeEach(async () => {
    await actions.init(context);
  });

  it('should select wallet value', () => {
    state.wallets = {
      '0x3c75226555FC496168d48B88DF83B95F16771F37': 1,
    };
    actions.selectWallet(context, '0x3c75226555FC496168d48B88DF83B95F16771F37');
    expect(state.wallet).toBe(1);
  });

  it('should add a new account and set it active', async () => {
    mutations.addWallet(state, v3);
    await actions.selectWallet(context, v3.address);
    expect(state.wallets[v3.address] instanceof Wallet).toBe(true);
    expect(state.wallet instanceof Wallet).toBe(true);
    expect(store.actions['updateBalance']).toHaveBeenCalled();
  });

  it('should set address', () => {
    mutations.setAddress(state, '0x3c75226555FC496168d48B88DF83B95F16771F37');
    expect(state.address instanceof Address).toBe(true);
    expect(state.address.getAddressString().toUpperCase()).toEqual(
      '0x3c75226555FC496168d48B88DF83B95F16771F37'.toUpperCase(),
    );
  });

  it('should set balance', () => {
    mutations.setBalance(state, '20');
    expect(state.balance).toBe('20');
  });

  it('should set new settings', () => {
    expect(state.settings).not.toBe(2);
    mutations.setSettings(state, 2);
    expect(state.settings).toBe(2);
  });

  it('should create wallet instance', async () => {
    await actions.addWallet(context, v3);
    const wallet = state.wallets[v3.address];

    expect(wallet instanceof Wallet).toBe(true);
    let address = await wallet.getAddressString();
    expect(address.toUpperCase()).toBe(v3.address.toUpperCase());
  });

  it('should add wallet with private key', () => {
    const dispatch = jest.fn();

    actions.addWalletWithPrivateKey(
      { dispatch },
      {
        privateKey:
          '4daf66f4ffed6d47e75d22e2c962d1f9a36550dc2cfda4bfb5da741bdc97d6ba',
        password: v3password,
      },
    );

    expect(dispatch).toBeCalledWith('addWalletAndSelect', expect.any(Object));
  });

  it('should add wallet with v3 keystore', async () => {
    const dispatch = jest.fn();

    await actions.addWalletWithV3(
      { dispatch },
      {
        json: v3,
        password: v3password,
      },
    );

    expect(dispatch).toBeCalledWith(
      'addWalletWithPrivateKey',
      expect.any(Object),
    );
  });

  it('should add wallet with public key', async () => {
    const dispatch = jest.fn();
    const commit = jest.fn();
    let address = '0x3c75226555FC496168d48B88DF83B95F16771F37';
    userService.setAccount = jest.fn();
    await actions.addWalletWithPublicKey({ dispatch, commit }, address);

    expect(userService.setAccount).toHaveBeenCalledWith(address, null);
    expect(commit).toHaveBeenCalledWith('addAddress', address);
    expect(dispatch).toHaveBeenCalledWith('selectWallet', address);
  });

  it('should create wallet instance with seed phrase ', async () => {
    const dispatch = jest.fn(() => Promise.resolve({}));

    await actions.addHdWallet(
      { ...context, dispatch },
      {
        key:
          'salt suit force stomach lounge endless soul junk join leg sort aware',
        password: v3password,
      },
    );
    expect(state.hdKey.crypto).toBeTruthy();
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).nthCalledWith(
      1,
      'saveHdWallet',
      expect.objectContaining({ version: 3 }),
    );
    expect(dispatch).nthCalledWith(2, 'generateWallet', v3password);
    // expect(state.wallet instanceof Wallet).toBe(true);
  });

  it('should generate wallet', async () => {
    const dispatch = jest.fn(() => Promise.resolve({}));

    await actions.addHdWallet(
      { ...context, dispatch },
      {
        key:
          'salt suit force stomach lounge endless soul junk join leg sort aware',
        password: v3password,
      },
    );
    actions.generateWallet({ ...context, dispatch }, v3password);

    expect(dispatch).toHaveBeenCalledTimes(3);
  });

  it('should validate password', async () => {
    context.state.wallet = new Wallet(v3);
    const isValid = await actions.validatePassword(context, v3password);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password', async () => {
    context.state.wallet = new Wallet(v3);
    const promise = actions.validatePassword(context, '');
    await expect(promise).rejects.toThrow('Invalid password');
  });

  it('should call mutation from update settings action', async () => {
    const commit = jest.fn();
    const dispatch = jest.fn();
    const state = {};

    await actions.updateSettings({ commit, state, dispatch }, '123');

    expect(commit.mock.calls[0]).toEqual(['setSettings', '123']);
  });

  it('should update storage from update settings action', async () => {
    const commit = jest.fn();
    const dispatch = jest.fn();
    const state = {};

    await actions.updateSettings({ commit, state, dispatch }, '123');

    const { settings } = localStorageMock.store;

    expect(JSON.parse(settings)).toBe('123');
  });

  it('should call mutation from logout action', async () => {
    const commit = jest.fn();
    const dispatch = jest.fn();
    const state = {};
    userService.logout = jest.fn();

    await actions.logout({ commit, dispatch, state });

    expect(userService.logout).toHaveBeenCalledTimes(1);
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

  describe('mutations', () => {
    describe('setOtpSettings', () => {
      it('should set setOtpSettings', () => {
        const newOptSettings = {};

        mutations.setOtpSettings(state, newOptSettings);

        expect(state.otpSettings).toEqual(newOptSettings);
      });
    });
  });

  describe('actions', () => {
    describe('loginViaOTP', () => {
      it('should call userService.loginViaOTP', () => {
        const code = '123456';
        const email = 'email@email.com';

        userService.loginViaOTP = jest.fn();

        actions.loginViaOTP({}, { code, email });

        expect(userService.loginViaOTP).toHaveBeenCalledTimes(1);
        expect(userService.loginViaOTP).toHaveBeenCalledWith(code, email);
      });
    });

    describe('getOtpSettings', () => {
      it('should get OTP settings', async () => {
        const otpSettings = {};
        const commit = jest.fn();

        userService.getOtpSettings = jest.fn().mockResolvedValue(otpSettings);

        await actions.getOtpSettings({ commit });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith('setOtpSettings', otpSettings);
      });

      it('should not get OTP settings', async () => {
        const error = {};
        const dispatch = jest.fn();

        userService.getOtpSettings = jest.fn().mockRejectedValue(error);

        await actions.getOtpSettings({ dispatch });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
          root: true,
        });
      });
    });

    describe('setOtpSettings', () => {
      const savedOtpSettings = {
        secret: 'secret',
        code: 'code',
      };

      it('should set OTP settings', async () => {
        const newOtpSettings = {
          status: 'enabled',
        };
        const commit = jest.fn();

        userService.setOtpSettings = jest
          .fn()
          .mockResolvedValue(newOtpSettings);

        await actions.setOtpSettings({ commit }, savedOtpSettings);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith('setOtpSettings', newOtpSettings);
      });

      it('should not set OTP settings', async () => {
        const error = {};
        const dispatch = jest.fn();

        userService.setOtpSettings = jest.fn().mockRejectedValue(error);

        await actions.setOtpSettings({ dispatch }, savedOtpSettings);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
          root: true,
        });
      });
    });

    describe('deleteOtpSettings', () => {
      const code = '123456';

      it('should delete OTP settings', async () => {
        const newOtpSettings = {};
        const commit = jest.fn();
        const dispatch = jest.fn();

        userService.deleteOtpSettings = jest.fn().mockResolvedValue();

        await actions.deleteOtpSettings({ commit, dispatch }, { code });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith('setOtpSettings', newOtpSettings);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith('getOtpSettings');
      });

      it('should not delete OTP settings', async () => {
        const error = {};
        const dispatch = jest.fn();

        userService.deleteOtpSettings = jest.fn().mockRejectedValue(error);

        await actions.deleteOtpSettings({ dispatch }, { code });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
          root: true,
        });
      });
    });
  });
});
