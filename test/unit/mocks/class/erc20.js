jest.mock('@/class/erc20', () => {
  const { tokens } = require('fixtures/tokens');

  function mockERC20Token() {}

  mockERC20Token.prototype.getToken = jest.fn().mockResolvedValue(tokens[0]);
  mockERC20Token.getBalance = jest
    .fn()
    .mockResolvedValue(Math.random().toString());

  return mockERC20Token;
});
