jest.mock('@/class/wallet/proxy/hardware/TrezorProxy', () => ({
  getNextWallets: jest.fn(),
}));
