jest.mock('@/class/wallet/proxy/HDProxy', () => ({
  getNextWallets: jest.fn(),
}));
