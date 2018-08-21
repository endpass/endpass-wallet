import DebounceProvider from '@/class/provider/DebounceProvider';
import debounce from 'lodash.debounce';

jest.mock('lodash.debounce', () => jest.fn(fn => fn));

describe('DebounceProvider Class', () => {
  let provider;

  beforeEach(() => {
    provider = new DebounceProvider();
    provider.parent = { send: jest.fn() };
  });

  describe('instance methods', () => {
    describe('updateCacheAndSend', () => {
      const firstArg = { id: 1, first: 'first', second: 'second' };
      const args = [firstArg, 'second arg'];
      const hashKey = '-235924100';
      const parentMethod = 'send';

      it('should create a cache when doesn`t exist', () => {
        provider.updateCacheAndSend(args, parentMethod);
        const expectedCache = {
          [hashKey]: {
            buffer: expect.any(Array),
            date: expect.any(Date),
            func: expect.any(Function),
          },
        };

        expect(provider.cache).toMatchObject(expectedCache);
      });

      it('should update the cache when exist', () => {
        provider.cache = {
          [hashKey]: {
            buffer: [
              [
                {
                  first: 'first',
                  id: 1,
                  second: 'second',
                },
                'second arg',
              ],
            ],
            date: new Date('2018-08-18T18:32:50.034Z'),
            func: jest.fn(),
          },
        };

        const mockDate = new Date('2018-08-19T18:32:50.034Z');
        global.Date = jest.fn(() => mockDate);

        provider.updateCacheAndSend(args, parentMethod);

        expect(provider.cache[hashKey].date).toBe(mockDate);
        expect(provider.cache[hashKey].buffer).toHaveLength(2);
      });

      it('should not call callback when the cache doesn`t exist', () => {
        provider.parent.send.mockImplementation((_, callback) =>
          callback(null, { result: 1 }),
        );

        jest.useFakeTimers();

        debounce.mockImplementation(fn => (...allArgs) =>
          setTimeout(() => fn(...allArgs), 100),
        );

        const callback = jest.fn();

        provider.updateCacheAndSend([firstArg, callback], parentMethod);
        provider.cache = {};

        jest.runAllTimers();

        expect(callback).toHaveBeenCalledTimes(0);
      });
    });
  });
});
