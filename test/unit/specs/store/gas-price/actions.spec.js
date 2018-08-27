import gasPrice from '@/services/gas-price';
import actions from '@/store/gas-price/actions';

describe('gas-price actions', () => {
  describe('getGasPrice', () => {
    it('should resolve value from service', async () => {
      expect.assertions(1);
      gasPrice.getGasPrice = jest.fn();
      const price = 0;
      gasPrice.getGasPrice.mockResolvedValueOnce(price);
      const priceResoved = await actions.getGasPrice({});
      expect(priceResoved).toBe(price);
    });
    it('should call errors store if failed to fetch data', async () => {
      expect.assertions(1);
      const dispatch = jest.fn();
      gasPrice.getGasPrice = jest.fn();
      const err = {};
      gasPrice.getGasPrice.mockRejectedValueOnce(err);
      const priceResoved = await actions.getGasPrice({ dispatch });
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', err, {
        root: true,
      });
    });
  });
});
