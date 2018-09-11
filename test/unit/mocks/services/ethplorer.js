import { ethplorerTransactions, ethplorerHistory } from 'fixtures/transactions';

export default {
  getTransactions() {
    return Promise.resolve(ethplorerTransactions);
  },

  getHistory() {
    return Promise.resolve(ethplorerHistory);
  },

  getInfo() {
    return Promise.resolve();
  },

  tokenIsNotSpam() {
    return Promise.resolve();
  },
};
