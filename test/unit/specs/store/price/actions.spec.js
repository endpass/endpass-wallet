import actions from '@/store/price/actions';
import priceService from '@/services/price';
import { priceUpdateInterval } from '@/config';
import {
  SET_PRICE,
  SET_UPDATE_TIME,
  START_LOADING,
  STOP_LOADING,
  SET_INTERVAL,
} from '@/store/price/mutations-types.js';

jest.useFakeTimers();

describe('price actions', () => {
  let commit, dispatch;

  const getters = {
    fiatCurrency: 'KEK',
    activeCurrencyName: 'CHPOK',
  };

  beforeEach(() => {
    commit = jest.fn();
    dispatch = jest.fn();
  });
  describe('updatePrice', () => {
    it('shoul perform price load with flad setting, set fetched data and update api error status to avalible', async () => {
      expect.assertions(5);
      const price = 1;
      priceService.getPrice = jest.fn();
      priceService.getPrice.mockResolvedValueOnce({
        [getters.fiatCurrency]: price,
      });
      await actions.updatePrice({ commit, dispatch, getters });
      expect(commit).toHaveBeenNthCalledWith(1, START_LOADING);
      expect(commit).toHaveBeenNthCalledWith(2, SET_PRICE, price);
      expect(commit.mock.calls[2][0]).toBe(SET_UPDATE_TIME);

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
    it('shoul perform price load with flad setting, set fetched data and update api error status to avalible', async () => {
      expect.assertions(3);
      const err = {};
      priceService.getPrice = jest.fn();
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
        priceUpdateInterval,
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
