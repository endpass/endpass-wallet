jest.mock('@/schema', () => ({
  cryptoDataValidator: {
    validateToken: jest.fn(data => data),
    validateTokens: jest.fn(data => data),
    validateTransaction: jest.fn(data => data),
    validateTransactions: jest.fn(data => data),
    validateBalance: jest.fn(data => data),
    validateSymbolPrice: jest.fn(data => data),
    validateSymbolsPrices: jest.fn(data => data),
    validateGasPrice: jest.fn(data => data),
    validatePendingTransactions: jest.fn(data => data),
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
