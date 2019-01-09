import { LocalStorage } from '@/class';
import { STORAGE_USER_META_KEY } from '@/class/constants';

const localSettings = require.requireActual('@/services/localSettings').default;

describe('localSettings', () => {
  const key = 'foo';
  const storageKey = `${key}:${STORAGE_USER_META_KEY}`;

  describe('save', () => {
    it('should call the same storage method on save', () => {
      const dataToSave = {
        activeAccount: 'bar',
      };

      localSettings.save(key, dataToSave);

      expect(LocalStorage.save).toHaveBeenCalledWith(storageKey, dataToSave);
    });

    it('should pick only allowed props from payload (activeAccount)', () => {
      localSettings.save(key, {
        foo: 'bar',
        activeAccount: 'baz',
      });

      expect(LocalStorage.save).toHaveBeenCalledWith(storageKey, {
        activeAccount: 'baz',
      });
    });
  });

  describe('load', () => {
    it('should call the same storage method on load', () => {
      localSettings.load(key);

      expect(LocalStorage.load).toHaveBeenCalledWith(storageKey);
    });
  });

  describe('clear', () => {
    it('should call remove storage method on clear', () => {
      localSettings.clear(key);

      expect(LocalStorage.remove).toHaveBeenCalledWith(storageKey);
    });
  });
});
