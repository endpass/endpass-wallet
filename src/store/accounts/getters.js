import { get } from 'lodash';
import web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import keystore from '@/utils/keystore';
import { HARDWARE_WALLET_TYPE } from '@/constants';

const { fromWei, hexToBytes } = web3.utils;

const wallet = state => get(state.wallets, state.address);

const accountAddresses = state =>
  Object.keys(state.wallets).map(item => item.toLowerCase());

const addressBuffer = state =>
  state.address && hexToBytes(state.address.toLowerCase());

const isPublicAccount = (state, getters) =>
  Boolean(get(getters.wallet, 'isPublic'));

const isHardwareAccount = (state, getters) => {
  const type = get(getters.wallet, 'info.type');

  return Object.values(HARDWARE_WALLET_TYPE).includes(type);
};

const balance = (state, getters, rootState, rootGetters) => {
  if (!state.balance) return null;

  const pendingBalance = rootGetters['transactions/pendingBalance'];
  const balanceWei = BigNumber(state.balance || '0')
    .minus(pendingBalance)
    .toFixed();

  return fromWei(balanceWei);
};

// Returns a decrypted HD Wallet
const hdWallet = state => password => {
  if (!state.hdKey) {
    return null;
  }

  return keystore.decryptHDWallet(password, state.hdKey);
};

const decryptedWallets = state => password =>
  Object.values(state.wallets)
    .filter(item => !item.isPublic && item.v3)
    .map(item => keystore.decryptWallet(password, item.v3));

const encryptedHdWallet = () => (password, decryptedHdWallet) =>
  decryptedHdWallet && keystore.encryptHDWallet(password, decryptedHdWallet);

const encryptedWallets = () => (password, wallets = []) =>
  wallets.map(decryptedWallet =>
    keystore.encryptWallet(password, decryptedWallet),
  );

export default {
  wallet,
  addressBuffer,
  accountAddresses,
  isPublicAccount,
  isHardwareAccount,
  balance,
  hdWallet,
  decryptedWallets,
  encryptedHdWallet,
  encryptedWallets,
};
