import gasPriceService from '@/services/gas-price';
import actions from '@/store/gas-price/actions';

import { gasPrice } from 'fixtures/gasPrice';

describe('gas-price actions', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('getGasPrice', () => {
    it('should resolve value from service', async () => {
      expect.assertions(1);

      const res = await actions.getGasPrice({ dispatch });

      expect(res).toBe(gasPrice);
    });

    it('should call errors store if failed to fetch data', async () => {
      expect.assertions(1);

      const err = new Error();

      gasPriceService.getGasPrice.mockRejectedValueOnce(err);

      await actions.getGasPrice({ dispatch });

      expect(dispatch).toHaveBeenCalledWith('errors/emitError', err, {
        root: true,
      });
    });
  });
});
