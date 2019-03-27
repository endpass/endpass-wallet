import userService from '@/services/user';

jest.mock('@/services/user', () => {
  /* eslint-disable global-require */
  const {
    settings,
    addresses,
    v3,
    hdv3,
    otpSettings,
  } = require('fixtures/accounts');

  const getAccountByAddress = address => {
    if (/^(xpub)/.test(address)) {
      return hdv3;
    }

    return v3;
  };

  return {
    setSetting: jest.fn().mockResolvedValue({
      success: true,
    }),

    getSettings: jest.fn().mockResolvedValue(settings),

    setSettings: jest.fn().mockResolvedValue({
      success: true,
    }),

    removeSettings: jest.fn().mockResolvedValue({
      success: true,
    }),

    addToken: jest.fn().mockResolvedValue({
      success: true,
    }),

    removeToken: jest.fn().mockResolvedValue({
      success: true,
    }),

    addNetwork: jest.fn().mockResolvedValue({
      success: true,
    }),

    updateNetwork: jest.fn().mockResolvedValue({
      success: true,
    }),

    removeNetwork: jest.fn().mockResolvedValue({
      success: true,
    }),

    setAccount: jest.fn().mockResolvedValue({
      success: true,
    }),

    getAccount(account) {
      return jest.fn().mockResolvedValue(getAccountByAddress(account));
    },

    getAccounts: jest.fn().mockResolvedValue(addresses),

    getV3Accounts: jest.fn().mockResolvedValue([v3]),

    getHDKey: jest.fn().mockResolvedValue(hdv3),

    setOtpSettings: jest.fn().mockResolvedValue({
      success: true,
    }),

    getOtpSettings: jest.fn().mockResolvedValue(otpSettings),

    deleteOtpSettings: jest.fn().mockResolvedValue({
      success: true,
    }),
  };
});

export default userService;
