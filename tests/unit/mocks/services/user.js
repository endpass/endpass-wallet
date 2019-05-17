import userService from '@/services/user';

jest.mock('@/services/user', () => {
  /* eslint-disable global-require */
  const {
    settings,
    addresses,
    v3,
    hdv3,
    otpSettings,
    encryptedMessage,
  } = require('fixtures/accounts');
  const {
    getPasswordRecoveryIdentifierResponse,
    successResponse,
  } = require('fixtures/identity');

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

    getPasswortRecoveryIdentifier: jest
      .fn()
      .mockResolvedValue(getPasswordRecoveryIdentifierResponse.message),

    recoverWalletsPassword: jest.fn().mockResolvedValue(successResponse),

    backupSeed: jest.fn().mockResolvedValue({}),

    recoverSeed: jest.fn().mockResolvedValue({
      seed: encryptedMessage,
    }),
  };
});

export default userService;
