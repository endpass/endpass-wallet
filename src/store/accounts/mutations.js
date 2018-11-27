import {
  CHANGE_INIT_STATUS,
  SET_ADDRESS,
  ADD_WALLET,
  SET_HD_KEY,
  SET_BALANCE,
  SET_HARDWARE_XPUB,
} from './mutations-types';

const changeInitStatus = (state, status) => {
  state.isInited = status;
};

const setAddress = (state, address) => {
  state.address = address;
};

const addWallet = (state, wallet) => {
  Object.assign(state.wallets, {
    [wallet.address]: wallet,
  });
};

// Saves the encrypted HD wallet key in V3 keystore format
// Formerly addHdWallet
const setHdKey = (state, key) => {
  state.hdKey = key;
};

const setBalance = (state, balance) => {
  state.balance = balance;
};

const setHardwareXpub = (state, { xpub, walletType }) => {
  Object.assign(state.hardwareXpub, { [walletType]: xpub });
};

export default {
  [CHANGE_INIT_STATUS]: changeInitStatus,
  [SET_ADDRESS]: setAddress,
  [ADD_WALLET]: addWallet,
  [SET_HD_KEY]: setHdKey,
  [SET_BALANCE]: setBalance,
  [SET_HARDWARE_XPUB]: setHardwareXpub,
};
