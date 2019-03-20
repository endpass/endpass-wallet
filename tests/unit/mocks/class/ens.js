const { address } = require('fixtures/accounts');

export default {
  getAddress: jest.fn().mockResolvedValue(address),
};
