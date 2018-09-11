import { settings, addresses, v3, hdv3 } from 'fixtures/accounts';

const getAccountByAddress = address => {
  if (/^(xpub)/.test(address)) {
    return hdv3;
  }

  return v3;
};

export default {
  login() {
    return Promise.resolve('email_link');
  },

  logout() {
    return Promise.resolve({
      success: true,
    });
  },

  getSettings() {
    return Promise.resolve(settings);
  },

  setSettings() {
    return Promise.resolve({
      success: true,
    });
  },

  removeSettings() {
    return Promise.resolve({
      success: true,
    });
  },

  setAccount() {
    return Promise.resolve({
      success: true,
    });
  },

  getAccount(account) {
    return Promise.resolve(getAccountByAddress(account));
  },

  getAccounts() {
    return Promise.resolve(addresses);
  },

  getV3Accounts() {
    return Promise.resolve(
      addresses.map(address => getAccountByAddress(address)),
    );
  },

  getFullUserInfo() {
    return Promise.resolve([
      ...addresses.map(address => getAccountByAddress(address)),
      ...settings,
    ]);
  },
};
