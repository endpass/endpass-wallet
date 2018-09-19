import web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import keystore from '@/utils/keystore';
import { Wallet, Address } from '@/class';

const getAccountAddresses = state =>
  Object.keys(state.wallets).map(wallet => wallet.toLowerCase());

const isPublicAccount = state =>
  state.address instanceof Address && !(state.wallet instanceof Wallet);

const balance = (state, getters, rootState, rootGetters) => {
  if (!state.balance) return null;

  const pendingBalance = rootGetters['transactions/pendingBalance'];
  const balanceWei = BigNumber(state.balance || '0')
    .minus(pendingBalance)
    .toFixed();

  return web3.utils.fromWei(balanceWei);
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
    .filter(wallet => wallet)
    .map(wallet => keystore.decryptWallet(password, wallet.v3));

const encryptedHdWallet = () => (password, decryptedHdWallet) =>
  decryptedHdWallet && keystore.encryptHDWallet(password, decryptedHdWallet);

const encryptedWallets = () => (password, decryptedWallets = []) =>
  decryptedWallets.map(decryptedWallet =>
    keystore.encryptWallet(password, decryptedWallet),
  );

export default {
  getAccountAddresses,
  isPublicAccount,
  balance,
  hdWallet,
  decryptedWallets,
  encryptedHdWallet,
  encryptedWallets,
};
