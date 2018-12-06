jest.mock('@/schema', () => ({
  cryptoDataValidator: {
    validateGasPrice: jest.fn(data => data),
    validateSymbolPrice: jest.fn(data => data),
    validateSymbolsPrice: jest.fn(data => data),
  },
}));
