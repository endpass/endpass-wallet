import web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import keystore from '@/utils/keystore';
import { Wallet, Address } from '@/class';

const getAccountAddresses = state =>
  Object.keys(state.wallets).map(wallet => wallet.toLowerCase());

const isPublicAccount = state =>
  state.address instanceof Address && !(state.wallet instanceof Wallet);

// TODO move to user store?
const isLoggedIn = state => !!state.email;

const balance = (state, getters, rootState, rootGetters) => {
  if (state.balance === null) return null;

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

export default {
  getAccountAddresses,
  isPublicAccount,
  isLoggedIn,
  balance,
  hdWallet,
};
