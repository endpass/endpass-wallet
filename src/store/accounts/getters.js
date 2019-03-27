import get from 'lodash/get';
import { fromWei, hexToBytes } from 'web3-utils';
import { BigNumber } from 'bignumber.js';
import { keystore } from '@endpass/utils';
import Bip39 from 'bip39';
import HDKey from 'ethereumjs-wallet/hdkey';

const wallet = state => get(state.wallets, state.address);

const accountAddresses = state => Object.keys(state.wallets).map(item => item.toLowerCase());

const addressBuffer = state => state.address && hexToBytes(state.address.toLowerCase());

const isPublicAccount = (state, getters) => !!get(getters.wallet, 'isPublic');

const isHardwareAccount = (state, getters) => !!get(getters.wallet, 'isHardware');

const balance = (state, getters, rootState, rootGetters) => {
  if (!state.balance) return null;

  const pendingBalance = rootGetters['transactions/pendingBalance'];
  const balanceWei = BigNumber(state.balance || '0')
    .minus(pendingBalance)
    .toFixed();

  return fromWei(balanceWei);
};

const isHDv3WalletByType = state => (walletType) => {
  const cache = state.hdCacheByType[walletType];
  if (!cache) return false;
  const { xpub, v3KeyStore } = cache;
  const isPublic = keystore.isExtendedPublicKey(xpub);
  const isV3 = !!keystore.isV3(v3KeyStore);

  return isPublic && isV3;
};

const cachedXpubByType = state => (walletType) => {
  const cache = state.hdCacheByType[walletType];
  return get(cache, 'xpub');
};

const cachedHdV3KeyStoreByType = state => (walletType) => {
  const cache = state.hdCacheByType[walletType];
  return get(cache, 'v3KeyStore');
};

const getHdWalletBySeed = () => (seedPhrase) => {
  const seed = Bip39.mnemonicToSeed(seedPhrase);
  const hdKey = HDKey.fromMasterSeed(seed);

  return hdKey.derivePath(ENV.VUE_APP_HD_KEY_MNEMONIC_PATH);
};

export default {
  wallet,
  addressBuffer,
  isHDv3WalletByType,
  cachedXpubByType,
  cachedHdV3KeyStoreByType,
  accountAddresses,
  isPublicAccount,
  isHardwareAccount,
  balance,
  getHdWalletBySeed,
};
