import actions from '@/store/price/actions';
import priceService from '@/services/price';
import {
  SET_PRICE,
  SET_UPDATE_TIME,
  START_LOADING,
  STOP_LOADING,
  SET_INTERVAL,
} from '@/store/price/mutations-types';
import { price, fiatCurrency } from 'fixtures/price';

jest.useFakeTimers();

describe('price actions', () => {
  let commit;
  let dispatch;
  const getters = {
    activeCurrencyName: 'CHPOK',
    fiatCurrency,
  };

  beforeEach(() => {
    commit = jest.fn();
    dispatch = jest.fn();
  });
  describe('updatePrice', () => {
    it('should perform price load with flad setting', async () => {
      expect.assertions(5);

      await actions.updatePrice({ commit, dispatch, getters });

      expect(commit).toHaveBeenNthCalledWith(1, START_LOADING);
      expect(commit).toHaveBeenNthCalledWith(2, SET_PRICE, price[fiatCurrency]);
      expect(commit).toHaveBeenNthCalledWith(
        3,
        SET_UPDATE_TIME,
        expect.any(Number),
      );
      expect(commit).toHaveBeenNthCalledWith(4, STOP_LOADING);

      expect(dispatch).toHaveBeenCalledWith(
        'connectionStatus/updateApiErrorStatus',
        {
          id: 'price',
          status: true,
        },
        { root: true },
      );
    });
    it('should handle error during performing price load', async () => {
      expect.assertions(3);

      const err = new Error();

      priceService.getPrice.mockRejectedValueOnce(err);

      await actions.updatePrice({ commit, dispatch, getters });

      expect(commit).toHaveBeenNthCalledWith(1, START_LOADING);
      expect(commit).toHaveBeenNthCalledWith(2, STOP_LOADING);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', err, {
        root: true,
      });
    });
  });
  describe('subscribeOnPriceUpdates', () => {
    it('should create interval for price fetching and save it', () => {
      actions.subscribeOnPriceUpdates({ dispatch, commit });

      jest.runOnlyPendingTimers();

      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        env.priceUpdateInterval,
      );
      expect(dispatch).toHaveBeenCalledWith('updatePrice');
      expect(commit.mock.calls[0][0]).toBe(SET_INTERVAL);
    });
  });

  describe('init', () => {
    it('should update price and subscribe to updates', async () => {
      expect.assertions(2);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenNthCalledWith(1, 'updatePrice');
      expect(dispatch).toHaveBeenNthCalledWith(2, 'subscribeOnPriceUpdates');
    });
  });
});
