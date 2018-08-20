import axios from 'axios';

export default {
  getTokensWithBalance(address) {
    return axios
      .get(`https://api.ethplorer.io/getAddressInfo/${address}`, {
        params: {
          limit: 50,
          apiKey: 'freekey',
        },
      })
      .then(resp => resp.data.tokens || [])
      .map(token => token.tokenInfo);
  },
  getHistory(address) {
    return axios.get(`https://api.ethplorer.io/getAddressHistory/${address}`, {
      params: {
        limit: 50,
        apiKey: 'freekey',
      },
    });
  },
  getInfo(address) {
    return axios.get(
      `https://api.ethplorer.io/getAddressTransactions/${address}`,
      {
        params: {
          limit: 50,
          apiKey: 'freekey',
        },
      },
    );
  },
};
