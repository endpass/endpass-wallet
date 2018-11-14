import getters from '@/store/dapp/getters';
import { TransactionFactory } from '@/class';

describe('dapp getters', () => {
  const state = {
    messages: {
      1: { foo: 'bar', method: 'boop' },
      2: { bar: 'baz', method: 'beep' },
    },
    list: [1, 2],
  };

  describe('currentMessageId', () => {
    it('should returns first id from list', () => {
      expect(getters.currentMessageId(state)).toBe(1);
    });

    it('should returns null if list is empty', () => {
      expect(
        getters.currentMessageId({
          list: [],
        }),
      ).toBe(null);
    });
  });

  describe('currentMessage', () => {
    it('should return current message object', () => {
      expect(
        getters.currentMessage(state, {
          currentMessageId: 1,
        }),
      ).toEqual({
        foo: 'bar',
        method: 'boop',
      });
    });

    it('should return current null if list is empty', () => {
      expect(
        getters.currentMessage(
          {
            messages: {},
            list: [],
          },
          {
            currentMessageId: null,
          },
        ),
      ).toEqual(null);
    });

    it('should return transaction object if message method is eth_sendTransaction', () => {
      TransactionFactory.fromBlock = jest.fn(() => 'foo');

      const res = getters.currentMessage(
        {
          messages: {
            1: {
              method: 'eth_sendTransaction',
              params: ['foo', 'bar'],
            },
          },
          list: [1],
        },
        {
          currentMessageId: 1,
        },
      );

      expect(res).toEqual({
        method: 'eth_sendTransaction',
        params: ['foo', 'bar'],
        transaction: 'foo',
      });
      expect(TransactionFactory.fromBlock).toBeCalledWith('foo');
    });
  });
});
