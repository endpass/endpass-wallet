import mutations from '@/store/price/mutations';
import {
  SET_PRICE,
  SET_UPDATE_TIME,
  START_LOADING,
  STOP_LOADING,
  SET_INTERVAL,
} from '@/store/price/mutations-types.js';

describe('price mutations', () => {
  const state = {};
  describe(SET_PRICE, () => {
    it('should set price', () => {
      const price = 0;
      mutations[SET_PRICE](state, price);
      expect(state.price).toBe(price);
    });
  });
  describe(SET_UPDATE_TIME, () => {
    it('should set update time', () => {
      const updateTime = 0;
      mutations[SET_UPDATE_TIME](state, updateTime);
      expect(state.updateTime).toBe(updateTime);
    });
  });

  describe(START_LOADING, () => {
    it('should set loading to true', () => {
      const updateTime = 0;
      mutations[START_LOADING](state);
      expect(state.isLoading).toBe(true);
    });
  });

  describe(STOP_LOADING, () => {
    it('should set loading to false', () => {
      const updateTime = 0;
      mutations[STOP_LOADING](state);
      expect(state.isLoading).toBe(false);
    });
  });

  describe(SET_INTERVAL, () => {
    it('should set interval', () => {
      const interval = 0;
      mutations[SET_INTERVAL](state, interval);
      expect(state.interval).toBe(interval);
    });
  });
});
