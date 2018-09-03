import { Synchronizer } from '@/class';

describe('Synchronizer Class', () => {
  describe('instance creation errors', () => {
    it('throws if storage is not passed to constructor', () => {
      expect(() => {
        /* eslint-disable-next-line */
        new Synchronizer();
      }).toThrow();
    });

    it('throws if state is not passed to constructor', () => {
      expect(() => {
        /* eslint-disable-next-line */
        new Synchronizer({});
      }).toThrow();
    });
  });

  describe('sync state with given storage', () => {
    const storage = {
      state: {},

      write(key, data) {
        Object.assign(this.state, {
          [key]: data,
        });
      },

      read(key) {
        return this.state[key] || null;
      },
    };
    const state = {};

    it('calls listen handler when restore method was called', async () => {
      const sync = new Synchronizer(storage, state);
      const listener = jest.fn();

      sync.listen(listener);
      await sync.restore();

      expect(listener).toBeCalled();
    });

    it('save backup data of given modules to given storage by endpass-local-sync key', async () => {
      const sync = new Synchronizer(storage, state, ['test']);
      const listener = jest.fn(data => data);

      Object.assign(state, {
        test: 'foo',
      });

      sync.listen(listener);
      await sync.backup();
      await sync.restore();

      expect(listener).toBeCalled();
      expect(storage.state).toEqual({
        'endpass-local-sync': {
          test: 'foo',
        },
      });
    });

    it('listener returns new value of given storage by given modules', async () => {
      const sync = new Synchronizer(storage, state, ['test']);
      const listener = jest.fn(data => {
        expect(data).toEqual({
          test: 'bar',
        });
      });

      Object.assign(state, {
        test: 'bar',
      });

      sync.listen(listener);
      await sync.backup();
      await sync.restore();
    });
  });
});
