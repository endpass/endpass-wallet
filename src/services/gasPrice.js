import axios from 'axios';

export default {
  getGasPrice(address) {
    return axios
      .get(`https://cryptodata-dev.endpass.com/api/v1/gas/price`)
      .then(resp => resp.data);
  },
};
