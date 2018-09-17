import { ethplorerTransactions, ethplorerHistory } from 'fixtures/transactions';

export default {
  getTransactions() {
    return jest.fn().mockResolvedValue(ethplorerTransactions);
  },

  getHistory() {
    return jest.fn().mockResolvedValue(ethplorerHistory);
  },

  // TODO: need more info
  getInfo() {
    return jest.fn().mockResolvedValue();
  },

  tokenIsNotSpam() {
    return jest.fn().mockResolvedValue(true);
  },
};
