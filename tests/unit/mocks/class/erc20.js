const { tokens } = require('fixtures/tokens');

function mockERC20Token() {}

mockERC20Token.prototype.getToken = jest.fn().mockResolvedValue(tokens[0]);
mockERC20Token.prototype.getContract = jest.fn().mockReturnValue({
  methods: {
    transfer: () => ({
      encodeABI: () => {},
    }),
  },
});
mockERC20Token.getBalance = jest
  .fn()
  .mockResolvedValue(Math.random().toString());

export default mockERC20Token;
