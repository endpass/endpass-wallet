import { get } from 'lodash';
import web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import keystore from '@/utils/keystore';
import { HARDWARE_WALLET_TYPE } from '@/constants';

const { fromWei } = web3.utils;

const accountAddresses = state =>
  Object.keys(state.wallets).map(wallet => wallet.toLowerCase());

const currentAddressString = state =>
  state.address && state.address.getChecksumAddressString();

const isPublicAccount = state => state.wallet && state.wallet.isPublic;

const isHardwareAccount = state => {
  const type = get(state.wallet, 'info.type');
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
    .filter(wallet => !wallet.isPublic && wallet.v3)
    .map(wallet => keystore.decryptWallet(password, wallet.v3));

const encryptedHdWallet = () => (password, decryptedHdWallet) =>
  decryptedHdWallet && keystore.encryptHDWallet(password, decryptedHdWallet);

const encryptedWallets = () => (password, decryptedWallets = []) =>
  decryptedWallets.map(decryptedWallet =>
    keystore.encryptWallet(password, decryptedWallet),
  );

export default {
  accountAddresses,
  currentAddressString,
  isPublicAccount,
  isHardwareAccount,
  balance,
  hdWallet,
  decryptedWallets,
  encryptedHdWallet,
  encryptedWallets,
};
