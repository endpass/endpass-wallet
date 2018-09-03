import axios from 'axios';

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

  // Filter out spam balances of tokens
  tokenIsNotSpam(token) {
    return token && token.tokenInfo && token.tokenInfo.price;
  },
};
