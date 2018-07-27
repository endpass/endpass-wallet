import store from '@/store/accounts/accounts';
import { Address, Wallet } from '@/class';
import localStorageMock from '../../localStorageMock.js';
import HDKey from 'ethereumjs-wallet/hdkey';

const v3json = {
  version: 3,
  id: '9322350b-903d-49ab-bfec-25cec7fe7334',
  address: '4ce2109f8db1190cd44bc6554e35642214fbe144',
  crypto: {
    ciphertext:
      '5655777529d7da80e96b3ccba57bac1a3c503aebb93e4a20671a1d7cf0b00a98',
    cipherparams: { iv: 'e96a3446554e4b40bbc4040641a1b12e' },
    cipher: 'aes-128-ctr',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      salt: '7e930fe09f597c46a450ed60a0183f5508137c9c4ef0e4f8743a11b55c634505',
      n: 262144,
      r: 8,
      p: 1,
    },
    mac: '64ba0f0cc1f3b5b3760dabc6d027bc3abbfcbd020f2144106a4434fed76e0b7e',
  },
};
const v3password = '123123123';
import { userService } from '@/services';

global.localStorage = localStorageMock;

//Fake action from antoher storage
store.actions['tokens/subscribeOnTokenUpdates'] = jest.fn();
store.actions['errors/emitError'] = jest.fn();

const { state, mutations, actions } = store;

const commit = store => (type, payload) => mutations[type](store, payload);

const dispatch = context => (type, payload) => {
  actions[type](context, payload);
};

const context = {
  commit: commit(state),
  dispatch: dispatch({ state, commit, dispatch }),
  state,
};

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

  it('should add a new account and set it active', () => {
    mutations.addWallet(state, {
      address: '0x3c75226555FC496168d48B88DF83B95F16771F37',
      wallet: 2,
    });
    actions.selectWallet(context, '0x3c75226555FC496168d48B88DF83B95F16771F37');
    expect(state.wallets['0x3c75226555FC496168d48B88DF83B95F16771F37']).toBe(2);
    expect(state.wallet).toBe(2);
  });

  it('should add address', () => {
    mutations.addAddress(state, '0x3c75226555FC496168d48B88DF83B95F16771F37');
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

  it('shoud create wallet instance', () => {
    actions.addWallet(context, v3json);
    expect(state.wallet instanceof Wallet).toBe(true);
    expect(state.wallet.getAddressString().toUpperCase()).toBe(
      v3json.address.toUpperCase(),
    );
  });

  it('shoud create wallet instance with privateKey ', () => {
    actions.addWalletWithPrivateKey(context, {
      privateKey:
        '4daf66f4ffed6d47e75d22e2c962d1f9a36550dc2cfda4bfb5da741bdc97d6ba',
      password: v3password,
    });
    expect(state.wallet instanceof Wallet).toBe(true);
    expect(state.wallet.getAddressString(v3password)).toBe(v3json.address);
  });

  it('shoud create wallet instance with v3Json ', () => {
    actions.addWalletWithV3(context, {
      json: v3json,
      password: v3password,
    });
    expect(state.wallet instanceof Wallet).toBe(true);
    expect(state.wallet.getAddressString(v3password)).toBe(v3json.address);
  });

  it('shoud create wallet instance with seed phrase ', () => {
    actions.addHdWallet(context, {
      key:
        'salt suit force stomach lounge endless soul junk join leg sort aware',
      password: v3password,
    });
    expect(state.hdWallet instanceof HDKey).toBe(true);
    expect(state.wallet instanceof Wallet).toBe(true);
  });

  it('shoud generate wallet', () => {
    actions.generateWallet(context, v3password);
    expect(state.wallet instanceof Wallet).toBe(true);
    expect(state.wallets[state.wallet.getAddressString(v3password)]).toBe(
      state.wallet,
    );
    expect(state.wallet.getAddressString(v3password).toUpperCase()).toBe(
      v3json.address.toUpperCase(),
    );
  });

  it('shoud validate password', () => {
    const promise = actions.validatePassword(context, v3password);
    expect(promise).resolves.toBe();
  });

  it('shoud reject wrong password', () => {
    const promise = actions.validatePassword(context, '');
    expect(promise).rejects.toMatch('error');
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

        userService.loginViaOTP = jest.fn();

        actions.loginViaOTP({}, { code });

        expect(userService.loginViaOTP).toHaveBeenCalledTimes(1);
        expect(userService.loginViaOTP).toHaveBeenCalledWith(code);
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
