import { http } from '@/class/singleton';
import { NotificationError } from '@/class';
import { validate, gasPrice } from '@/schema';

const gasPriceService = {
  async getGasPrice() {
    try {
      const { data } = await http.get(`${ENV.cryptoDataAPIUrl}/gas/price`);

      return validate(gasPrice.validateGasPrice, data);
    } catch (err) {
      throw new NotificationError({
        title: 'Failed to get suggested gas price',
        text:
          'An error occurred while retrieving suggested gas price. Please, set manually or, try again.',
        type: 'is-warning',
      });
    }
  },
};

export default gasPriceService;
