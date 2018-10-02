jest.mock('@/class/erc20', () => ({
  getBalance: jest.fn().mockResolvedValue(Math.random().toString()),
}));
