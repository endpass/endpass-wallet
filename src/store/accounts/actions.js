import { isEmpty } from 'lodash';
import { userService, localSettingsService, hardwareService } from '@/services';
import web3 from '@/utils/web3';
import Bip39 from 'bip39';
import HDKey from 'ethereumjs-wallet/hdkey';
import EthWallet from 'ethereumjs-wallet';
import { Wallet, NotificationError } from '@/class';
import keystore from '@/utils/keystore';
import {
  SET_ADDRESS,
  SET_WALLET,
  ADD_WALLET,
  SET_HD_KEY,
  SET_BALANCE,
  ADD_ADDRESS,
} from './mutations-types';

const { toChecksumAddress } = web3.utils;

const selectWallet = async (
  { commit, state, dispatch, rootState },
  address,
) => {
  commit(SET_WALLET, state.wallets[address]);
  commit(SET_ADDRESS, address);

  localSettingsService.save(rootState.user.email, {
    activeAccount: address,
  });
  dispatch('updateBalance');

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
    commit(ADD_WALLET, updatedJSON);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const addPublicWallet = async (
  { dispatch, commit },
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
    commit(ADD_ADDRESS, { address, info });

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

const commitWallet = async ({ state, commit }, { wallet }) => {
  if (keystore.isExtendedPublicKey(wallet.address)) {
    // HD wallet
    commit(SET_HD_KEY, wallet);
  } else if (keystore.isV3(wallet)) {
    // Encrypted private key
    commit(ADD_WALLET, wallet);
  } else {
    // Read-only public key
    commit(ADD_ADDRESS, wallet);
  }

  const currentWalletAddress =
    state.wallet && (await state.wallet.getAddressString());

  if (currentWalletAddress === wallet.address) {
    commit(SET_WALLET, state.wallets[wallet.address]);
  }
};

const saveWallet = async ({ dispatch }, { json }) => {
  await userService.setAccount(json.address, json);
  await dispatch('commitWallet', { wallet: json });
};

const addHdWallet = async ({ dispatch }, { key, password }) => {
  try {
    const seed = Bip39.mnemonicToSeed(key);
    const hdKey = HDKey.fromMasterSeed(seed);
    const hdWallet = hdKey.derivePath(ENV.hdKeyMnemonic.path);
    // Encrypt extended private key
    const json = keystore.encryptHDWallet(password, hdWallet);

    // Save HD keys and generate the first child wallet
    await dispatch('saveWallet', { json });
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
  if (!state.address) {
    return;
  }
  const address = state.address.getChecksumAddressString();

  try {
    const balance = await web3.eth.getBalance(address);
    commit(SET_BALANCE, balance);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const getBalanceByAddress = async (ctx, { address }) => {
  const balanceWei = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balanceWei);
};

const validatePassword = async ({ state, getters }, password) => {
  let { wallet } = state;

  if (getters.isPublicAccount || getters.isHardwareAccount) {
    wallet = new Wallet(state.hdKey);
  }

  return wallet.validatePassword(password);
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
      if (keystore.isV3(account)) {
        // Encrypted private key
        commit(ADD_WALLET, account);
      } else {
        // Read-only public key
        commit(ADD_ADDRESS, account);
      }
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

const getNextWalletsFromHd = async (ctx, payload) =>
  hardwareService.getNextWallets(payload);

const init = async ({ dispatch }) => {
  try {
    await Promise.all([dispatch('setUserHdKey'), dispatch('setUserWallets')]);
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
  init,
};
