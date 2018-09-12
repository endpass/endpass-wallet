import axios from 'axios';
import { Transaction } from '@/class';

export default {
  async getTokensWithBalance(address) {
    const { data } = await axios.get(
      `https://api.ethplorer.io/getAddressInfo/${address}`,
      {
        params: {
          limit: 50,
          apiKey: 'freekey',
        },
      },
    );

    return (data.tokens || [])
      .filter(this.tokenIsNotSpam)
      .map(token => token.tokenInfo);
  },
  async getHistory(address) {
    const { data } = await axios.get(
      `https://api.ethplorer.io/getAddressHistory/${address}`,
      {
        params: {
          limit: 50,
          apiKey: 'freekey',
        },
      },
    );

    return data.operations || [];
  },
  async getInfo(address) {
    const { data } = await axios.get(
      `https://api.ethplorer.io/getAddressTransactions/${address}`,
      {
        params: {
          limit: 50,
          apiKey: 'freekey',
        },
      },
    );

    return data || [];
  },

  // get tokens and ETH transactions
  async getTransactionHistory() {
    const [transactions, history] = await Promise.all([
      ethplorerService.getInfo(addressCheckSum),
      ethplorerService.getHistory(addressCheckSum),
    ]);
    return transactions.concat(history).map(trx => new Transaction(trx));
  },
  // Filter out spam balances of tokens
  tokenIsNotSpam(token) {
    return token && token.tokenInfo && token.tokenInfo.price;
  },
};
