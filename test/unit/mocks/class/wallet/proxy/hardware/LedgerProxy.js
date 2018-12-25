jest.mock('@/class/wallet/proxy/hardware/LedgerProxy', () => ({
  getNextWallets: jest.fn(),
}));
