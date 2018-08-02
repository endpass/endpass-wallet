import axios from 'axios';
import { NotificationError } from '@/class';

export default {
  getGasPrice(address) {
    return axios
      .get(`https://cryptodata-dev.endpass.com/api/v1/gas/price`)
      .then(resp => resp.data)
      .catch(e => {
        throw new NotificationError({
          title: 'Failed to get suggested gas price',
          text:
            'An error occurred while retrieving suggested gas price.Please, set mannualy or, try again.',
          type: 'is-warning',
        });
      });
  },
};
