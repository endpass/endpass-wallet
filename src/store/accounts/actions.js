import { mapKeys, isEmpty } from 'lodash';
import { userService, localSettingsService, hardwareService } from '@/services';
import web3 from '@/class/singleton/web3';
import Bip39 from 'bip39';
import HDKey from 'ethereumjs-wallet/hdkey';
import EthWallet from 'ethereumjs-wallet';
import { Wallet, NotificationError } from '@/class';
import keystore from '@/utils/keystore';
import { WALLET_TYPE } from '@/constants';
import {
  CHANGE_INIT_STATUS,
  SET_ADDRESS,
  ADD_WALLET,
  SET_HD_KEY,
  SET_BALANCE,
  SET_HARDWARE_XPUB,
} from './mutations-types';

const { toChecksumAddress, fromWei } = web3.utils;

const selectWallet = async ({ commit, dispatch, rootState }, address) => {
  commit(SET_ADDRESS, toChecksumAddress(address));

  localSettingsService.save(rootState.user.email, {
    activeAccount: address,
  });

  dispatch('updateBalance');
  dispatch('dapp/reset', null, { root: true });
  await dispatch('tokens/getCurrentAccountTokens', null, {
    root: true,
  });
  await dispatch('tokens/getCurrentAccountTokensData', null, {
    root: true,
  });
};

const addWallet = async ({ commit, dispatch }, json) => {
  try {
    const address = toChecksumAddress(json.address);
    const updatedJSON = { ...json, address };

    await userService.setAccount(address, updatedJSON);

    commit(ADD_WALLET, new Wallet(updatedJSON));
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const addPublicWallet = async (
  { dispatch },
  { address: rawAddress, info: extraInfo },
) => {
  try {
    const address = toChecksumAddress(rawAddress);
    const info = {
      type: 'PublicAccount',
      hidden: false,
      ...extraInfo,
      address,
    };

    await userService.setAccount(address, { info });
    await dispatch('addWallet', {
      ...info,
      address,
    });

    return dispatch('selectWallet', address);
  } catch (e) {
    return dispatch('errors/emitError', e, { root: true });
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
const addWalletWithV3 = async (
  { dispatch },
  { json, jsonPassword, walletPassword },
) => {
  try {
    const wallet = new Wallet(json);
    const privateKey = await wallet.getPrivateKeyString(jsonPassword);

    return dispatch('addWalletWithPrivateKey', {
      privateKey,
      password: walletPassword,
    });
  } catch (e) {
    if (!(e instanceof NotificationError)) {
      throw e;
    }

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

const addWalletWithPublicKey = async ({ dispatch }, publicKeyOrAddress) => {
  // TODO convert public key to address, accept xPub key
  try {
    const address = toChecksumAddress(publicKeyOrAddress);

    await dispatch('addPublicWallet', { address });

    return dispatch('selectWallet', address);
  } catch (e) {
    return dispatch('errors/emitError', e, { root: true });
  }
};

const generateWallet = async ({ dispatch, state }, password) => {
  if (!state.hdKey) {
    throw new Error('hdKey doesn`t exist');
  }

  const decryptedHdWallet = await dispatch('decryptAccountHdWallet', password);
  const i = Object.keys(state.wallets).length;
  const wallet = decryptedHdWallet.deriveChild(i).getWallet();
  const json = keystore.encryptWallet(password, wallet);

  await dispatch('addWalletAndSelect', json);
};

const commitWallet = async ({ commit }, { wallet }) => {
  if (keystore.isExtendedPublicKey(wallet.address)) {
    commit(SET_HD_KEY, wallet);
  } else {
    commit(ADD_WALLET, new Wallet(wallet));
  }
};

const saveWallet = async ({ dispatch }, { json, info = {} }) => {
  await userService.setAccount(json.address, { info, ...json });
  await dispatch('commitWallet', { wallet: json });
};

const addHdWallet = async ({ dispatch }, { key, password }) => {
  try {
    const seed = Bip39.mnemonicToSeed(key);
    const hdKey = HDKey.fromMasterSeed(seed);
    const hdWallet = hdKey.derivePath(ENV.hdKeyMnemonic.path);
    // Encrypt extended private key
    const json = keystore.encryptHDWallet(password, hdWallet);
    const info = {
      address: json.address,
      type: WALLET_TYPE.HD_MAIN,
      hidden: false,
    };

    // Save HD keys and generate the first child wallet
    await dispatch('saveWallet', { json, info });
    await dispatch('generateWallet', password);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const addMultiHdWallet = async ({ dispatch }, { key, password }) => {
  const seed = Bip39.mnemonicToSeed(key);
  const hdKey = HDKey.fromMasterSeed(seed);
  const hdWallet = hdKey.derivePath(ENV.hdKeyMnemonic.path);

  /* eslint-disable no-await-in-loop */
  /* eslint-disable-next-line */
  for (let index = 0; index < 5; index++) {
    const wallet = hdWallet.deriveChild(index).getWallet();
    const walletV3 = wallet.toV3(Buffer.from(password), ENV.kdfParams);
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

const updateWallets = async ({ dispatch }, { wallets }) => {
  try {
    const { success } = await userService.updateAccounts(wallets);
    const promises = Object.values(wallets).map(wallet =>
      dispatch('commitWallet', { wallet }),
    );

    await Promise.all(promises);

    return success;
  } catch (error) {
    await dispatch('errors/emitError', error, { root: true });
  }
};

const updateBalance = async ({ commit, dispatch, state }) => {
  if (!state.address) return;

  try {
    const balance = await web3.eth.getBalance(state.address);

    commit(SET_BALANCE, balance);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const getBalanceByAddress = async (ctx, { address }) => {
  const balanceWei = await web3.eth.getBalance(address);

  return fromWei(balanceWei);
};

const validatePassword = async ({ state, getters }, password) => {
  if (getters.isPublicAccount || getters.isHardwareAccount) {
    const wallet = new Wallet(state.hdKey);

    return wallet.validatePassword(password);
  }

  return getters.wallet.validatePassword(password);
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

const setUserWallets = async ({ commit, dispatch, rootState }) => {
  try {
    // Fetch and save regular accounts
    const accounts = await userService.getV3Accounts();

    if (isEmpty(accounts)) return;

    const localSettings = localSettingsService.load(rootState.user.email);
    const isAccountExist =
      localSettings &&
      localSettings.activeAccount &&
      accounts.find(({ address }) => address === localSettings.activeAccount);

    accounts.forEach(account => {
      commit(ADD_WALLET, new Wallet(account));
    });

    if (isAccountExist) {
      await dispatch('selectWallet', localSettings.activeAccount);
    } else {
      await dispatch('selectWallet', accounts[0].address);
    }
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

const getNextWalletsFromHd = async (
  { state, dispatch },
  { walletType, ...selectParams },
) => {
  const savedXpub = state.hardwareXpub[walletType];
  const { xpub, addresses } = await hardwareService.getNextWallets({
    walletType,
    ...selectParams,
    xpub: savedXpub,
  });

  if (savedXpub !== xpub) {
    await dispatch('saveHardwareXpub', { xpub, walletType });
  }

  return addresses;
};

const decryptAccountHdWallet = async ({ state }, password) => {
  if (!state.hdKey) {
    return null;
  }

  return keystore.decryptHDWallet(password, state.hdKey);
};

const decryptAccountWallets = async ({ state }, password) =>
  Object.values(state.wallets)
    .filter(item => !item.isPublic)
    .map(item => keystore.decryptWallet(password, item.v3));

const encryptHdWallet = async (ctx, { password, hdWallet }) =>
  hdWallet ? keystore.encryptHDWallet(password, hdWallet) : null;

const encryptWallets = async (ctx, { password, wallets = [] }) =>
  wallets.map(item => keystore.encryptWallet(password, item));

const reencryptAllAccountWallets = async (
  { dispatch },
  { password, newPassword },
) => {
  const [decryptedHdWallet, decryptedWallets] = await Promise.all([
    dispatch('decryptAccountHdWallet', password),
    dispatch('decryptAccountWallets', password),
  ]);
  const encryptedHdWallet = await dispatch('encryptHdWallet', {
    hdWallet: decryptedHdWallet,
    password: newPassword,
  });
  const encryptedWallets = await dispatch('encryptWallets', {
    wallets: decryptedWallets,
    password: newPassword,
  });

  return {
    hdWallet: encryptedHdWallet,
    wallets: encryptedWallets,
  };
};

const updateWalletsWithNewPassword = async (
  { dispatch },
  { password, newPassword },
) => {
  const { hdWallet, wallets } = await dispatch('reencryptAllAccountWallets', {
    password,
    newPassword,
  });
  const walletsToUpdate = mapKeys(wallets, 'address');

  if (hdWallet) {
    Object.assign(walletsToUpdate, {
      [hdWallet.address]: hdWallet,
    });
  }

  if (isEmpty(walletsToUpdate)) {
    return null;
  }

  const res = await dispatch('updateWallets', {
    wallets: walletsToUpdate,
  });

  return res;
};

const saveHardwareXpub = async ({ commit }, { xpub, walletType }) => {
  const info = { type: walletType };

  commit(SET_HARDWARE_XPUB, { xpub, walletType });

  await userService.setAccount(xpub, { info });
};

const init = async ({ commit, dispatch }) => {
  try {
    await Promise.all([dispatch('setUserHdKey'), dispatch('setUserWallets')]);
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }

  commit(CHANGE_INIT_STATUS, true);
};

export default {
  selectWallet,
  addWallet,
  addWalletAndSelect,
  addWalletWithV3,
  addWalletWithPrivateKey,
  addWalletWithPublicKey,
  addPublicWallet,
  commitWallet,
  saveWallet,
  generateWallet,
  setUserHdKey,
  setUserWallets,
  addHdWallet,
  addMultiHdWallet,
  updateWallets,
  updateBalance,
  getBalanceByAddress,
  validatePassword,
  getNextWalletsFromHd,
  saveHardwareXpub,
  decryptAccountHdWallet,
  decryptAccountWallets,
  encryptHdWallet,
  encryptWallets,
  reencryptAllAccountWallets,
  updateWalletsWithNewPassword,
  init,
};
