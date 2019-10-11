import { gasPrice } from 'fixtures/gasPrice';
import cryptoDataService from '@/services/cryptoData';
import actions from '@/store/gas-price/actions';

describe('gas-price actions', () => {
  const rootGetters = {
    'web3/activeNetwork': 1,
  };
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('getGasPrice', () => {
    it('should correctly call cryptoDataService.getGasPrice', () => {
      actions.getGasPrice({ dispatch, rootGetters });

      expect(cryptoDataService.getGasPrice).toHaveBeenCalledTimes(1);
      expect(cryptoDataService.getGasPrice).toHaveBeenCalledWith(
        rootGetters['web3/activeNetwork'],
      );
    });

    it('should resolve value from service', async () => {
      expect.assertions(1);

      const res = await actions.getGasPrice({ dispatch, rootGetters });

      expect(res).toBe(gasPrice);
    });

    it('should call errors store if failed to fetch data', async () => {
      expect.assertions(1);

      const err = new Error();

      cryptoDataService.getGasPrice.mockRejectedValueOnce(err);

      await actions.getGasPrice({ dispatch, rootGetters });

      expect(dispatch).toHaveBeenCalledWith('errors/emitError', err, {
        root: true,
      });
    });
  });
});
