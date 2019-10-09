jest.mock('@/class/singleton/connect', () => ({
  auth: jest.fn(),
  createWallet: jest.fn(),
  logout: jest.fn(),
}));
