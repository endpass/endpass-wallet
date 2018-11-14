import getters from '@/store/dapp/getters';
import { TransactionFactory } from '@/class';

describe('dapp getters', () => {
  const state = {
    requests: {
      1: { foo: 'bar', method: 'boop' },
      2: { bar: 'baz', method: 'beep' },
    },
    list: [1, 2],
  };

  describe('currentRequestId', () => {
    it('should returns first id from list', () => {
      expect(getters.currentRequestId(state)).toBe(1);
    });

    it('should returns null if list is empty', () => {
      expect(
        getters.currentRequestId({
          list: [],
        }),
      ).toBe(null);
    });
  });

  describe('currentRequest', () => {
    it('should return current Request object', () => {
      expect(
        getters.currentRequest(state, {
          currentRequestId: 1,
        }),
      ).toEqual({
        foo: 'bar',
        method: 'boop',
      });
    });

    it('should return current null if list is empty', () => {
      expect(
        getters.currentRequest(
          {
            requests: {},
            list: [],
          },
          {
            currentRequestId: null,
          },
        ),
      ).toEqual(null);
    });
  });
});
