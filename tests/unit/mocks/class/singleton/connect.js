jest.mock('@/class/singleton/connect', () => ({
  auth: jest.fn(),
  generateWallet: jest.fn(),
  logout: jest.fn(),
}));
