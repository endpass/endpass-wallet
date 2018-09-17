import userService from '@/services/user';

jest.mock('@/services/user', () => {
  /* eslint-disable-next-line */
  const { settings, addresses, v3, hdv3 } = require('fixtures/accounts');

  const getAccountByAddress = address => {
    if (/^(xpub)/.test(address)) {
      return hdv3;
    }

    return v3;
  };

  return {
    login: jest.fn().mockResolvedValue('email_auth'),

    logout: jest.fn().mockResolvedValue({
      success: true,
    }),

    getSettings: jest.fn().mockResolvedValue(settings),

    setSettings: jest.fn().mockResolvedValue({
      success: true,
    }),

    removeSettings: jest.fn().mockResolvedValue({
      success: true,
    }),

    setAccount: jest.fn().mockResolvedValue({
      success: true,
    }),

    getAccount(account) {
      return jest.fn().mockResolvedValue(getAccountByAddress(account));
    },

    getAccounts: jest.fn().mockResolvedValue(addresses),

    getV3Accounts: jest
      .fn()
      .mockResolvedValue(
        addresses.map(address => getAccountByAddress(address)),
      ),

    getFullUserInfo: jest
      .fn()
      .mockResolvedValue([
        ...addresses.map(address => getAccountByAddress(address)),
        ...settings,
      ]),

    getHDKey: jest.fn().mockResolvedValue(hdv3),

    setOtpSettings: jest.fn().mockResolvedValue({
      success: true,
    }),

    deleteOtpSettings: jest.fn().mockResolvedValue({
      success: true,
    }),
  };
});

export default userService;
