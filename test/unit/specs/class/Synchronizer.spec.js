import { Synchronizer } from '@/class';

describe('Synchronizer Class', () => {
  describe('storage key generation', () => {
    it('by default generates key for production', () => {
      const sync = new Synchronizer({
        state: {},
        storage: {},
      });

      expect(sync.storageKey).toEqual('production-endpass-local-sync');
    });

    it('generates key for given environment', () => {
      const sync = new Synchronizer({
        state: {},
        storage: {},
        env: 'development',
      });

      expect(sync.storageKey).toEqual('development-endpass-local-sync');
    });
  });

  describe('instance creation errors', () => {
    it('throws if storage is not passed to constructor', () => {
      expect(() => {
        /* eslint-disable-next-line */
        new Synchronizer({});
      }).toThrow();
    });

    it('throws if state is not passed to constructor', () => {
      expect(() => {
        /* eslint-disable-next-line */
        new Synchronizer({ storage: {} });
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
      expect.assertions(1);

      const sync = new Synchronizer({
        storage,
        state,
      });
      const listener = jest.fn();

      sync.setListener(listener);
      await sync.restore();

      expect(listener).toBeCalled();
    });

    it('save backup data of given modules to given storage by endpass-local-sync key', async () => {
      expect.assertions(2);

      const sync = new Synchronizer({
        storage,
        state,
        modules: ['test'],
      });
      const listener = jest.fn(data => data);

      Object.assign(state, {
        test: 'foo',
      });

      sync.setListener(listener);
      await sync.backup();
      await sync.restore();

      expect(listener).toBeCalled();
      expect(storage.state).toEqual({
        'production-endpass-local-sync': {
          test: 'foo',
        },
      });
    });

    it('listener returns new value of given storage by given modules', async () => {
      expect.assertions(1);

      const sync = new Synchronizer({
        storage,
        state,
        modules: ['test'],
      });
      const listener = jest.fn(data => {
        expect(data).toEqual({
          test: 'bar',
        });
      });

      Object.assign(state, {
        test: 'bar',
      });

      sync.setListener(listener);
      await sync.backup();
      await sync.restore();
    });

    it('stops listening if listener set to null', async () => {
      expect.assertions(1);

      const sync = new Synchronizer({
        storage,
        state,
      });
      const listener = jest.fn();

      sync.setListener(listener);
      sync.setListener(null);
      await sync.restore();

      expect(listener).not.toBeCalled();
    });
  });
});
