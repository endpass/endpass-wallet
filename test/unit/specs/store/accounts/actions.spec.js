import web3 from '@/utils/web3';
import keyUtil from '@/utils/keystore';
import {
  v3,
  v3password,
  mnemonic,
  hdv3,
  privateKeyString,
  checksumAddress,
} from 'fixtures/accounts';
import { Wallet, Address } from '@/class';
import actions from '@/store/accounts/actions';
import {
  SET_ADDRESS,
  SET_WALLET,
  ADD_WALLET,
  SET_HD_KEY,
  SET_BALANCE,
  ADD_ADDRESS,
} from '@/store/accounts/mutations-types';
import keystore from '@/utils/keystore';
import userService from '@/services/user';

describe('Accounts actions', () => {
  let dispatch;
  let commit;

  beforeEach(() => {
    jest.clearAllMocks();

    commit = jest.fn();
    dispatch = jest.fn();
  });

  describe('selectWallet', () => {
    const wallet = new Wallet(v3);
    const state = {
      wallets: {
        [checksumAddress]: wallet,
      },
    };

    it('should set wallet', () => {
      actions.selectWallet({ commit, dispatch, state }, checksumAddress);

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, SET_WALLET, wallet);
    });

    it('should set address', () => {
      actions.selectWallet({ commit, dispatch, state }, checksumAddress);

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(2, SET_ADDRESS, checksumAddress);
    });

    it('should update balance', () => {
      actions.selectWallet({ commit, dispatch, state }, checksumAddress);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'updateBalance');
    });

    it('should subscribe on token balance', () => {
      actions.selectWallet({ commit, dispatch, state }, checksumAddress);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(
        'tokens/subscribeOnTokensBalancesUpdates',
        null,
        { root: true },
      );
    });
  });

  describe('addWallet', () => {
    it('should add wallet to the store', async () => {
      expect.assertions(2);

      const address = checksumAddress.toLowerCase();

      await actions.addWallet({ commit, dispatch }, { ...v3, address });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenNthCalledWith(1, ADD_WALLET, v3);
    });

    it('should save the wallet through the user service', async () => {
      expect.assertions(3);

      const { address } = v3;

      await actions.addWallet({ commit, dispatch }, v3);

      expect(userService.setAccount).toHaveBeenCalledTimes(1);
      expect(userService.setAccount).toBeCalledWith(address, v3);
      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should handle errors from user service', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.setAccount.mockRejectedValueOnce(error);

      await actions.addWallet({ commit, dispatch }, v3);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('addWalletAndSelect', () => {
    it('should add wallet', async () => {
      expect.assertions(2);

      const address = checksumAddress.toLowerCase();
      const wallet = { ...v3, address };

      await actions.addWalletAndSelect({ dispatch }, wallet);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'addWallet', wallet);
    });

    it('should select wallet', async () => {
      expect.assertions(2);

      const address = checksumAddress.toLowerCase();
      const wallet = { ...v3, address };

      await actions.addWalletAndSelect({ dispatch }, wallet);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(
        'selectWallet',
        checksumAddress,
      );
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      dispatch.mockRejectedValueOnce(error);

      await actions.addWalletAndSelect({ commit, dispatch }, v3);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(2, 'errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('addWalletWithV3', () => {
    const walletPassword = 'walletPassword';

    it('should add wallet from v3 key store', async () => {
      expect.assertions(2);

      await actions.addWalletWithV3(
        { dispatch },
        {
          json: v3,
          jsonPassword: v3password,
          walletPassword,
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('addWalletWithPrivateKey', {
        privateKey: privateKeyString,
        password: walletPassword,
      });
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      const spy = jest
        .spyOn(Wallet.prototype, 'getPrivateKeyString')
        .mockImplementation(() => {
          throw error;
        });

      await actions.addWalletWithV3({ commit, dispatch }, v3);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });

      spy.mockRestore();
    });
  });

  describe('addWalletWithPrivateKey', () => {
    it('should add wallet from private key', async () => {
      expect.assertions(2);

      await actions.addWalletWithPrivateKey(
        { dispatch },
        {
          privateKey: privateKeyString,
          password: v3password,
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'addWalletAndSelect',
        expect.objectContaining({
          address: checksumAddress,
        }),
      );
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      const spy = jest
        .spyOn(keyUtil, 'encryptWallet')
        .mockImplementation(() => {
          throw error;
        });

      await actions.addWalletWithPrivateKey(
        { commit, dispatch },
        {
          privateKey: privateKeyString,
          password: v3password,
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });

      spy.mockRestore();
    });
  });

  describe('addWalletWithPublicKey', () => {
    it('should add address from public key', async () => {
      expect.assertions(2);

      await actions.addWalletWithPublicKey(
        { commit, dispatch },
        checksumAddress,
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(ADD_ADDRESS, checksumAddress);
    });

    it('should select wallet', async () => {
      expect.assertions(2);

      await actions.addWalletWithPublicKey(
        { commit, dispatch },
        checksumAddress,
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('selectWallet', checksumAddress);
    });

    it('should save wallet  via user service', async () => {
      expect.assertions(2);

      await actions.addWalletWithPublicKey(
        { commit, dispatch },
        checksumAddress,
      );

      expect(userService.setAccount).toHaveBeenCalledTimes(1);
      expect(userService.setAccount).toBeCalledWith(checksumAddress, null);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');

      userService.setAccount = jest.fn().mockRejectedValueOnce(error);

      await actions.addWalletWithPublicKey(
        { commit, dispatch },
        checksumAddress,
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('generateWallet', () => {
    it('should generate wallet from hd key', async () => {
      expect.assertions(2);

      const hdWallet = keyUtil.decryptHDWallet(v3password, hdv3);
      const state = { hdKey: {}, wallets: {} };
      const getters = {
        hdWallet: () => hdWallet,
      };

      await actions.generateWallet({ state, dispatch, getters }, v3password);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'addWalletAndSelect',
        expect.objectContaining({
          address: expect.any(String),
        }),
      );
    });

    it('should throw error when hdKey doesn`t exist', async () => {
      expect.assertions(2);

      const state = { hdKey: null };
      const getters = {};

      try {
        await actions.generateWallet({ state, dispatch, getters });
      } catch (e) {
        expect(e).toBeTruthy();
      }

      expect(dispatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('commitWallet', () => {
    const { commitWallet } = actions;
    const commit = jest.fn();
    const walletAddress = 'address';
    const wallet = {
      address: walletAddress,
    };
    const state = {
      wallet: {
        getAddressString: jest.fn().mockResolvedValue(),
      },
      wallets: {
        [walletAddress]: null,
      },
    };

    beforeEach(() => {
      commit.mockClear();
    });

    it('should save HD wallet', async () => {
      keystore.isExtendedPublicKey = jest.fn().mockReturnValueOnce(true);

      await actions.saveHdWallet(null, v3);

      expect.assertions(2);

      await commitWallet({ state, commit }, { wallet });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SET_HD_KEY, wallet);
    });

    it('should save wallet', async () => {
      keystore.isExtendedPublicKey = jest.fn().mockReturnValueOnce(false);
      keystore.isV3 = jest.fn().mockReturnValueOnce(true);

      expect.assertions(2);

      await commitWallet({ state, commit }, { wallet });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(ADD_WALLET, wallet);
    });

    it('should save public key', async () => {
      keystore.isExtendedPublicKey = jest.fn().mockReturnValueOnce(false);
      keystore.isV3 = jest.fn().mockReturnValueOnce(false);

      expect.assertions(2);

      await commitWallet({ state, commit }, { wallet });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(ADD_ADDRESS, wallet.address);
    });

    it('should update active wallet', async () => {
      state.wallet.getAddressString.mockResolvedValueOnce(walletAddress);

      expect.assertions(2);

      await commitWallet({ state, commit }, { wallet });

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenLastCalledWith(
        SET_WALLET,
        state.wallets[wallet.address],
      );
    });
  });

  describe('saveWallet', () => {
    const { saveWallet } = actions;
    const json = {
      address: 'address',
    };
    const dispatch = jest.fn();

    beforeEach(() => {
      dispatch.mockClear();
    });

    it('should call userService.setAccount', () => {
      userService.setAccount = jest.fn();

      saveWallet({ dispatch }, { json });

      expect(userService.setAccount).toHaveBeenCalledTimes(1);
      expect(userService.setAccount).toHaveBeenCalledWith(json.address, json);
    });

    it('should call commitWallet action', async () => {
      expect.assertions(2);

      await saveWallet({ dispatch }, { json });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('commitWallet', { wallet: json });
    });
  });

  describe('addHdWallet', () => {
    it('should call saveWallet action', async () => {
      expect.assertions(2);

      const { address } = hdv3;

      await actions.addHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'saveWallet', {
        json: expect.objectContaining({
          address,
        }),
      });
    });

    it('should generate wallet', async () => {
      expect.assertions(2);

      await actions.addHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(2, 'generateWallet', v3password);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      dispatch.mockRejectedValueOnce(error);

      await actions.addHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('addMultiHdWallet', () => {
    beforeEach(() => {
      web3.eth.getBalance = jest.fn().mockResolvedValueOnce('5');
      web3.eth.getBalance.mockResolvedValueOnce('0');
    });

    it('should add wallets with balance and one more', async () => {
      expect.assertions(3);

      await actions.addMultiHdWallet(
        { dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'addWalletAndSelect',
        expect.any(Object),
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        'addWallet',
        expect.any(Object),
      );
    });

    it('should handle errors', async () => {
      expect.assertions(1);

      const error = new Error('error');
      web3.eth.getBalance = jest.fn().mockRejectedValueOnce(error);

      await actions.addMultiHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateWallets', () => {
    const { updateWallets } = actions;
    const walletAddress1 = 'wallet address 1';
    const walletAddress2 = 'wallet address 2';
    const wallet1 = { address: walletAddress1 };
    const wallet2 = { address: walletAddress2 };
    const wallets = {
      [walletAddress1]: wallet1,
      [walletAddress2]: wallet2,
    };

    it('should call userService.updateAccounts', () => {
      userService.updateAccounts = jest.fn();

      updateWallets({ dispatch }, { wallets });

      expect(userService.updateAccounts).toHaveBeenCalledTimes(1);
      expect(userService.updateAccounts).toHaveBeenCalledWith(wallets);
    });

    it('should call commitWallet actions', async () => {
      expect.assertions(1);

      userService.updateAccounts = jest
        .fn()
        .mockResolvedValue({ success: true });

      await updateWallets({ dispatch }, { wallets });

      expect(dispatch.mock.calls).toEqual([
        ['commitWallet', { wallet: wallet1 }],
        ['commitWallet', { wallet: wallet2 }],
      ]);
    });

    it('should handle errors', async () => {
      const error = new Error();

      expect.assertions(2);

      userService.updateAccounts = jest.fn().mockRejectedValue(error);

      await updateWallets({ dispatch }, { wallets });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });

    it('should return userService.updateAccounts response', async () => {
      let updateAccountsResponse = { success: true };
      let response;

      expect.assertions(2);

      userService.updateAccounts = jest
        .fn()
        .mockResolvedValue(updateAccountsResponse);
      response = await updateWallets({ dispatch }, { wallets });

      expect(response).toEqual(updateAccountsResponse.success);

      updateAccountsResponse = { success: false };
      userService.updateAccounts.mockResolvedValue(updateAccountsResponse);
      response = await updateWallets({ dispatch }, { wallets });

      expect(response).toEqual(updateAccountsResponse.success);
    });
  });

  describe('updateBalance', () => {
    let state;
    const balance = '5';

    beforeEach(() => {
      state = {
        address: new Address(checksumAddress),
      };
      web3.eth.getBalance = jest.fn().mockResolvedValue(balance);
    });

    it('should set a new balance', async () => {
      expect.assertions(2);

      await actions.updateBalance({ commit, dispatch, state });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_BALANCE, balance);
    });

    it('should not update the balance if the address does not exist', async () => {
      expect.assertions(2);

      state = { address: null };

      await actions.updateBalance({ commit, dispatch, state });

      expect(commit).toHaveBeenCalledTimes(0);
      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      web3.eth.getBalance.mockRejectedValueOnce(error);

      await actions.updateBalance({ dispatch, state });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('validatePassword', () => {
    let state;
    let getters;

    beforeEach(() => {
      state = {
        hdKey: hdv3,
        wallet: {
          validatePassword: jest.fn().mockResolvedValue(true),
        },
      };
      getters = { isPublicAccount: false };
    });

    it('should validate the password', async () => {
      expect.assertions(2);

      const { validatePassword } = state.wallet;
      const isValid = await actions.validatePassword(
        { state, getters },
        v3password,
      );

      expect(validatePassword).toHaveBeenCalledTimes(1);
      expect(isValid).toBeTruthy();
    });

    it('should validate the password through the hdKey when the public account', async () => {
      expect.assertions(1);

      keystore.decrypt = jest.fn().mockResolvedValue();

      const newState = { ...state, wallet: null };
      const newGetters = { isPublicAccount: true };

      const isValid = await actions.validatePassword(
        { state: newState, getters: newGetters },
        v3password,
      );

      expect(isValid).toBe(true);
    });

    it('should throw an error if the password is incorrect', async () => {
      expect.assertions(1);

      const { validatePassword } = state.wallet;
      const error = new Error('error');
      validatePassword.mockRejectedValueOnce(error);

      try {
        await actions.validatePassword({ state, getters }, v3password);
      } catch (e) {
        expect(e).toEqual(error);
      }
    });
  });

  describe('setUserHdKey', () => {
    it('should set the hd key to the store', async () => {
      expect.assertions(2);

      await actions.setUserHdKey({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_HD_KEY, hdv3);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.getHDKey.mockRejectedValueOnce(error);

      await actions.setUserHdKey({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('init', () => {
    it('should set the hd key to the store', async () => {
      expect.assertions(2);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'setUserHdKey');
    });

    it('should set the user accounts to the store', async () => {
      expect.assertions(2);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(2, 'setUserWallets');
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      dispatch.mockRejectedValueOnce(error);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });
});
