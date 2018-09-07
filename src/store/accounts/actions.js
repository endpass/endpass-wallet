import { userService } from '@/services';
import web3 from '@/utils/web3';
import Bip39 from 'bip39';
import HDKey from 'ethereumjs-wallet/hdkey';
import { hdKeyMnemonic, kdfParams } from '@/config';
import EthWallet from 'ethereumjs-wallet';
import { Wallet } from '@/class';
import keystore from '@/utils/keystore';
import {
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
} from '@/store/tokens/mutations-types';
import {
  SET_ADDRESS,
  SET_WALLET,
  ADD_WALLET,
  SET_HD_KEY,
  SET_BALANCE,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
  SET_EMAIL,
  ADD_ADDRESS,
} from './mutations-types';

const { toChecksumAddress } = web3.utils;

const selectWallet = async ({ commit, state, dispatch }, address) => {
  commit(SET_WALLET, state.wallets[address]);
  commit(SET_ADDRESS, address);
  dispatch('updateBalance');

  return dispatch('tokens/subscribeOnTokensBalancesUpdates', null, {
    root: true,
  });
};

const addWallet = async ({ commit, dispatch }, json) => {
  try {
    const address = web3.utils.toChecksumAddress(json.address);
    const updatedJSON = { ...json, address };

    await userService.setAccount(address, updatedJSON);
    commit(ADD_WALLET, updatedJSON);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const addWalletAndSelect = async ({ dispatch }, json) => {
  try {
    await dispatch('addWallet', json);
    await dispatch('selectWallet', toChecksumAddress(json.address));
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

// Import wallet from json V3 keystore
const addWalletWithV3 = async ({ dispatch }, { json, password }) => {
  try {
    const wallet = new Wallet(json);
    const privateKey = await wallet.getPrivateKeyString(password);

    return dispatch('addWalletWithPrivateKey', { privateKey, password });
  } catch (e) {
    return dispatch('errors/emitError', e, { root: true });
  }
};

const addWalletWithPrivateKey = async (
  { dispatch },
  { privateKey, password },
) => {
  try {
    const wallet = EthWallet.fromPrivateKey(
      Buffer.from(privateKey.replace(/^0x/, ''), 'hex'),
    );
    const json = keystore.encryptWallet(password, wallet);

    return dispatch('addWalletAndSelect', json);
  } catch (e) {
    return dispatch('errors/emitError', e, { root: true });
  }
};

const addWalletWithPublicKey = async (
  { commit, dispatch },
  publicKeyOrAddress,
) => {
  // TODO convert public key to address, accept xPub key
  try {
    const address = web3.utils.toChecksumAddress(publicKeyOrAddress);
    await userService.setAccount(address, null);
    commit(ADD_ADDRESS, address);

    return dispatch('selectWallet', address);
  } catch (e) {
    return dispatch('errors/emitError', e, { root: true });
  }
};

const generateWallet = async ({ dispatch, state, getters }, password) => {
  if (!state.hdKey) {
    throw new Error('hdKey doesn`t exist');
  }

  const hdWallet = getters.hdWallet(password);
  const i = Object.keys(state.wallets).length;
  const wallet = hdWallet.deriveChild(i).getWallet();
  const json = keystore.encryptWallet(password, wallet);

  await dispatch('addWalletAndSelect', json);
};

// Saves HD wallet's extended keys on the server
const saveHdWallet = (ctx, json) => userService.setAccount(json.address, json);

const addHdWallet = async ({ commit, dispatch }, { key, password }) => {
  try {
    const seed = Bip39.mnemonicToSeed(key);
    const hdKey = HDKey.fromMasterSeed(seed);
    const hdWallet = hdKey.derivePath(hdKeyMnemonic.path);
    // Encrypt extended private key
    const json = keystore.encryptHDWallet(password, hdWallet);
    commit(SET_HD_KEY, json);

    // Save HD keys and generate the first child wallet
    await dispatch('saveHdWallet', json);
    await dispatch('generateWallet', password);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const addMultiHdWallet = async ({ dispatch }, { key, password }) => {
  const seed = Bip39.mnemonicToSeed(key);
  const hdKey = HDKey.fromMasterSeed(seed);
  const hdWallet = hdKey.derivePath(hdKeyMnemonic.path);

  /* eslint-disable no-await-in-loop */
  for (let index = 0; index < 5; index++) {
    const wallet = hdWallet.deriveChild(index).getWallet();
    const walletV3 = wallet.toV3(Buffer.from(password), kdfParams);
    const { address } = walletV3;

    if (index === 0) {
      dispatch('addWalletAndSelect', walletV3);
    } else {
      dispatch('addWallet', walletV3);
    }

    try {
      const balance = await web3.eth.getBalance(address);

      if (balance === '0') {
        break;
      }
    } catch (e) {
      break;
    }
  }
  /* eslint-enable no-await-in-loop */
};

const updateBalance = async ({ commit, dispatch, state }) => {
  if (!state.address) {
    return;
  }

  try {
    const address = state.address.getChecksumAddressString();
    const balance = await web3.eth.getBalance(address);
    commit(SET_BALANCE, balance);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const updateSettings = async ({ commit, dispatch }, settings) => {
  try {
    commit(SET_SETTINGS, settings);
    await userService.setSetting('settings', settings);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const validatePassword = ({ state }, password) =>
  state.wallet.validatePassword(password);

const login = (ctx, email) => userService.login(email);

const logout = async ({ commit, dispatch }) => {
  try {
    commit(SET_EMAIL, null);
    await userService.logout();
    window.location.reload();
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const loginViaOTP = (ctx, { code, email }) =>
  userService.loginViaOTP(code, email);

const getOtpSettings = async ({ commit, dispatch }) => {
  try {
    const otpSettings = await userService.getOtpSettings();
    commit(SET_OTP_SETTINGS, otpSettings);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const setOtpSettings = async ({ commit, dispatch }, { secret, code }) => {
  try {
    await userService.setOtpSettings(secret, code);
    commit(SET_OTP_SETTINGS, { status: 'enabled' });
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const deleteOtpSettings = async ({ commit, dispatch }, { code }) => {
  try {
    await userService.deleteOtpSettings(code);
    commit(SET_OTP_SETTINGS, {});
    await dispatch('getOtpSettings');
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const setUserSettings = async ({ commit, dispatch }) => {
  try {
    const { settings, email, tokens } = await userService.getSettings();

    if (email) {
      commit(SET_EMAIL, email);
    }

    if (settings) {
      commit(SET_SETTINGS, settings);
    }

    if (tokens) {
      commit(`tokens/${SAVE_TOKENS}`, tokens, {
        root: true,
      });
      // Saved token contract addresses on all networks
      const tokenAddrs = []
        .concat(...Object.values(tokens))
        .map(token => token.address);
      commit(`tokens/${SAVE_TRACKED_TOKENS}`, tokenAddrs, { root: true });
    }
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

const setUserHdKey = async ({ commit, dispatch }) => {
  try {
    // Fetch and save HD wallet
    const hdKey = await userService.getHDKey();

    if (hdKey) {
      commit(SET_HD_KEY, hdKey);
    }
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

const setUserWallets = async ({ commit, dispatch }) => {
  try {
    // Fetch and save regular accounts
    const accounts = await userService.getV3Accounts();

    if (accounts && accounts.length) {
      accounts.forEach(account => {
        if (keystore.isV3(account)) {
          // Encrypted private key
          commit(ADD_WALLET, account);
        } else {
          // Read-only public key
          commit(ADD_ADDRESS, account.address);
        }
      });
      await dispatch('selectWallet', accounts[0].address);
    }
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

const init = async ({ dispatch }) => {
  try {
    await Promise.all([
      dispatch('setUserSettings'),
      dispatch('setUserHdKey'),
      dispatch('setUserWallets'),
    ]);
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

export default {
  selectWallet,
  addWallet,
  addWalletAndSelect,
  addWalletWithV3,
  addWalletWithPrivateKey,
  addWalletWithPublicKey,
  generateWallet,
  setUserHdKey,
  setUserWallets,
  saveHdWallet,
  addHdWallet,
  addMultiHdWallet,
  updateBalance,
  validatePassword,

  updateSettings,
  login,
  logout,
  loginViaOTP,
  getOtpSettings,
  setOtpSettings,
  setUserSettings,
  deleteOtpSettings,

  init,
};
