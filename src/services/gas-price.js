import { http, ajv } from '@/class/singleton';
import { NotificationError } from '@/class';
import gasPriceSchema from '@/schema/gasPrice';

const gasPriceService = {
  validateGasPrice(data) {
    return new Promise(
      (resolve, reject) =>
        gasPriceSchema.gasPrice(data)
          ? resolve(data)
          : reject(new Error(ajv.errorsText(gasPriceSchema.gasPrice))),
    );
  },

  getGasPrice() {
    return http
      .get(`${ENV.cryptoDataAPIUrl}/gas/price`)
      .then(res => gasPriceService.validateGasPrice(res.data))
      .then(res => res)
      .catch(() => {
        throw new NotificationError({
          title: 'Failed to get suggested gas price',
          text:
            'An error occurred while retrieving suggested gas price. Please, set manually or, try again.',
          type: 'is-warning',
        });
      });
  },
};

export default gasPriceService;
