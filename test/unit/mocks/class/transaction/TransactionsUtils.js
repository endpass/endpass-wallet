jest.mock('@/class/transaction/TransactionsUtils', () => ({
  isTransactionToContract: jest.fn().mockResolvedValue(true),

  getValidTo: jest.fn(),

  getValidData: jest.fn(),

  getPriceWei: jest.fn(),

  getFullPrice: jest.fn(),
}));
