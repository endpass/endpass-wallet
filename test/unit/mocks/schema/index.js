jest.mock('@/schema', () => ({
  cryptoDataValidator: {
    validateGasPrice: jest.fn(data => data),
    validateSymbolPrice: jest.fn(data => data),
    validateSymbolsPrice: jest.fn(data => data),
  },
  v3KeystoreValidator: {
    validateAddresses: jest.fn(data => data),
    validateAccount: jest.fn(data => data),
  },
  identityValidator: {
    validateUserToken: jest.fn(data => data),
    validateUserNetwork: jest.fn(data => data),
    validateUserSettings: jest.fn(data => data),
    validateUserOtpSetting: jest.fn(data => data),
  },
}));
