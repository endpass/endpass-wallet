import { Wallet, Address } from '@/class';
import {
  ADD_ADDRESS,
  SET_ADDRESS,
  ADD_WALLET,
  SET_WALLET,
  SET_HD_KEY,
  SET_BALANCE,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
  SET_EMAIL,
} from './mutations-types';

const setAddress = (state, newAddress) => {
  let address = newAddress;

  if (!(address instanceof Address)) {
    address = new Address(address);
  }

  state.address = address;
};

const setWallet = (state, wallet) => {
  state.wallet = wallet;
};

const addWallet = (state, walletV3) => {
  const wallet = new Wallet(walletV3);
  const { address } = walletV3;
  state.wallets = {
    ...state.wallets,
    [address]: wallet,
  };
};

// Adds an empty wallet in order to view a public key
const addAddress = (state, address) => {
  state.wallets = {
    ...state.wallets,
    [address]: null,
  };
};

// Saves the encrypted HD wallet key in V3 keystore format
// Formerly addHdWallet
const setHdKey = (state, key) => {
  state.hdKey = key;
};

const setBalance = (state, balance) => {
  state.balance = balance;
};

const setSettings = (state, settings) => {
  state.settings = JSON.parse(JSON.stringify(settings));
};

const setOtpSettings = (state, otpSettings) => {
  state.otpSettings = otpSettings;
};

const setEmail = (state, email) => {
  state.email = email;
};

export default {
  [ADD_ADDRESS]: addAddress,
  [SET_ADDRESS]: setAddress,
  [ADD_WALLET]: addWallet,
  [SET_WALLET]: setWallet,
  [SET_HD_KEY]: setHdKey,
  [SET_BALANCE]: setBalance,
  [SET_SETTINGS]: setSettings,
  [SET_OTP_SETTINGS]: setOtpSettings,
  [SET_EMAIL]: setEmail,
};
